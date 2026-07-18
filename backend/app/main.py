from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models

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
        raise HTTPException(status_code=400, details="Username already taken")
    
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
    total_cost = trade.quantity*trade.price

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
            avg_buy_price=trade.price,
        )
        db.add(new_holding)

    new_transaction = Transaction(
        user_id=current_user.id,
        stock_symbol=trade.stock_symbol,
        quantity=trade.quantity,
        price=trade.price,
        Transaction_type="BUY",
    )
    db.add(new_transaction)

    db.commit()
    return{
        "messade": "Stock is purchased successfully",
        "remaining_balance": current_user.balance,
    }
        