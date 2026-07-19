from pydantic import BaseModel
from datetime import datetime
class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username:str
    password:str

class UserResponse(BaseModel):
    id:int
    username:str
    balance: float

    class Config:
        from_attributes=True

class Token(BaseModel):
    access_token:str
    token_type: str

class TradeRequest(BaseModel):
    stock_symbol: str
    quantity:int
    price: float

class HoldingResponse(BaseModel):
    stock_symbol: str
    quantity:int
    avg_buy_price:float

    class Config:
        from_attributes=True
    
class PortfolioResponse(BaseModel):
    balance: float
    holdings: list[HoldingResponse]

class TransactionResponse(BaseModel):
    stock_symbol:str
    quantity: int
    price: float
    transaction_type: str
    timestamp: datetime

    class Config:
        from_attributes=True