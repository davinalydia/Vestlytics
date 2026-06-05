from fastapi import FastAPI
from pydantic import BaseModel

from VESTYLITICS.training.inference_and_insight_backup2 import (
    VestlyticsEngine
)

# =====================================================
# INIT APP
# =====================================================

app = FastAPI(
    title="Vestlytics API",
    description="AI-based Investment Portfolio Analyzer",
    version="1.0.0"
)

# =====================================================
# LOAD ENGINE
# =====================================================

engine = VestlyticsEngine()

# =====================================================
# REQUEST BODY
# =====================================================

class FinancialProfile(BaseModel):

    ticker: str

    monthly_income: float

    monthly_expense_total: float

    emergency_fund: float

    debt_to_income_ratio: float


# =====================================================
# ROOT ENDPOINT
# =====================================================

@app.get("/")
def home():

    return {
        "message":
        "Vestlytics API is running"
    }


# =====================================================
# PREDICT ENDPOINT
# =====================================================

@app.post("/predict")
def predict(data: FinancialProfile):

    # Financial profile
    financial_profile = {

        "monthly_income":
        data.monthly_income,

        "monthly_expense_total":
        data.monthly_expense_total,

        "emergency_fund":
        data.emergency_fund,

        "debt_to_income_ratio":
        data.debt_to_income_ratio
    }

    # Run AI inference
    result = engine.generate_complete_insight(
        ticker=data.ticker,
        financial_profile=financial_profile
    )

    return result