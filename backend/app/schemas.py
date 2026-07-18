from pydantic import BaseModel

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
    