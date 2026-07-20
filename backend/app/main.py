from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models
from app.instruments import load_instruments, get_instrument_key, search_symbols

load_instruments()

Base.metadata.create_all(bind=engine)

app = FastAPI (title= "paper trading API")

app.add_middleware(
    CORSMiddleware, 
    allow_origins = ["http://localhost:3000"],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
def health_check():
    return{"status": "ok"}


from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.auth import hash_password, verify_password, create_access_token
from app.models import User

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    new_user = User(
        username=user.username,
        hashed_password=hash_password(user.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=Token)
def login (user: UserLogin, db: Session = Depends(get_db)):
    db_user=db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    access_token = create_access_token(data= {"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

from app.auth import get_current_user
from app.schemas import TradeRequest
from app.models import Portfolio, Transaction

@app.post("/buy")
def buy_stock(
    trade: TradeRequest,
    current_user: User= Depends(get_current_user),
    db:Session=Depends(get_db),
):
    if trade.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantitity must be greated than zero")

    price = fetch_live_price(trade.stock_symbol)
    total_cost = trade.quantity*price


    if current_user.balance < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    current_user.balance -= total_cost


    existing_holding = (
        db.query(Portfolio)
        .filter(Portfolio.user_id==current_user.id, Portfolio.stock_symbol== trade.stock_symbol).first()
    )

    if existing_holding:
        total_quantity=existing_holding.quantity+trade.quantity
        total_value = (existing_holding.avg_buy_price * existing_holding.quantity) + total_cost
        existing_holding.avg_buy_price = total_value/total_quantity
        existing_holding.quantity=total_quantity
    else:
        new_holding = Portfolio(
            user_id=current_user.id,
            stock_symbol=trade.stock_symbol,
            quantity=trade.quantity,
            avg_buy_price=price,
        )
        db.add(new_holding)

    new_transaction = Transaction(
        user_id=current_user.id,
        stock_symbol=trade.stock_symbol,
        quantity=trade.quantity,
        price=price,
        transaction_type="BUY",
    )
    db.add(new_transaction)

    db.commit()
    return{
        "message": "Stock is purchased successfully",
        "remaining_balance": current_user.balance,
    }
        

@app.post("/sell")
def sell_stock(
    trade: TradeRequest,
    current_user: User=Depends(get_current_user),
    db:Session=Depends(get_db),
):
    if trade.quantity<=0:
        raise HTTPException(status_code=400, detail="Quantity must be greated than zero")
    
    price = fetch_live_price(trade.stock_symbol)

    holding = (
        db.query(Portfolio)
        .filter(Portfolio.user_id==current_user.id, Portfolio.stock_symbol==trade.stock_symbol)
        .first()
    )

    if not holding or holding.quantity<trade.quantity:
        raise HTTPException(
            status_code=400,
            detail="Invalid transaction. you dont own enough shares.",
        )
    
    proceeds=trade.quantity*price
    current_user.balance+=proceeds

    holding.quantity-=trade.quantity
    if holding.quantity==0:
        db.delete(holding)

    new_transaction = Transaction(
        user_id=current_user.id,
        stock_symbol=trade.stock_symbol,
        quantity=trade.quantity,
        price=price,
        transaction_type="SELL",
    )

    db.add(new_transaction)

    db.commit()

    return{
        "message":"stock sold successfully",
        "remaining_balance": current_user.balance,
    }


from app.schemas import PortfolioResponse

@app.get("/portfolio", response_model=PortfolioResponse)
def get_portfolio(
    current_user: User=Depends(get_current_user),
    db:Session=Depends(get_db),
):
    holdings = db.query(Portfolio).filter(Portfolio.user_id==current_user.id).all()

    return{
        "balance": current_user.balance,
        "holdings": holdings,
    }

from app.schemas import TransactionResponse

@app.get("/transactions", response_model=list[TransactionResponse])
def get_transactions(
    current_user: User=Depends(get_current_user),
    db:Session=Depends(get_db),
):
    transactions=(
        db.query(Transaction)
        .filter(Transaction.user_id==current_user.id)
        .order_by(Transaction.timestamp.desc())
        .all()
    )
    return transactions


@app.get("/stocks/search")
def search_stocks(query: str):
    results= search_symbols(query)
    return{"results": results}

import requests

UPSTOX_LIVE_ACCESS_TOKEN = "eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiI2MkNEMzciLCJqdGkiOiI2YTVlNjMwZTVjMjYxZDM4NzJkMmQ1YTMiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaXNQbHVzUGxhbiI6dHJ1ZSwiaWF0IjoxNzg0NTcwNjM4LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3ODQ1ODQ4MDB9.5zorobhSNnkQ7bfC2AUxy-t9NiKdaBHsoMx9_v6CtJA"  # your token

def fetch_live_price(symbol: str) -> float:
    instrument_key = get_instrument_key(symbol)
    if not instrument_key:
        raise HTTPException(status_code=404, detail="Stock symbol not found")

    url = "https://api.upstox.com/v2/market-quote/ltp"
    params = {"instrument_key": instrument_key}
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {UPSTOX_LIVE_ACCESS_TOKEN}"
    }

    response = requests.get(url, params=params, headers=headers)
    data = response.json()

    if data.get("status") != "success":
        raise HTTPException(status_code=502, detail="Failed to fetch price from Upstox")

    quote_data = list(data["data"].values())[0]
    return quote_data["last_price"]

@app.get("/stocks/price/{symbol}")
def get_stock_price(symbol: str):
    price = fetch_live_price(symbol)
    return {"symbol": symbol.upper(), "price": price}

