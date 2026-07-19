from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    balance = Column(Float, default=100000.0)

    portfolio = relationship("Portfolio", back_populates="owner")
    transactions = relationship("Transaction", back_populates="owner")

class Portfolio(Base):
    __tablename__ = "portfolio"

    id=Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stock_symbol = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    avg_buy_price = Column(Float, nullable = False)

    owner = relationship ("User", back_populates="portfolio")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index= True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stock_symbol = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    transaction_type = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    owner = relationship ("User", back_populates= "transactions")

