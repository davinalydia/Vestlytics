from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from training.inference_and_insight import (
    RealLSTMForecastEngine,
    run_user_analysis,
)

# =========================================================
# GLOBAL ENGINE
# =========================================================

engine = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load model sekali saat startup server.
    """
    global engine

    print("Loading RealLSTMForecastEngine...")
    engine = RealLSTMForecastEngine()
    print("Engine loaded successfully.")

    yield
    print("FastAPI shutdown.")


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Vestlytics API",
    version="1.0.0",
    lifespan=lifespan,
)

# =========================================================
# CORS MIDDLEWARE
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# DYNAMIC REQUEST MODEL (HAPUS USER_ID)
# =========================================================

class AnalyzeRequest(BaseModel):
    investment_amount: float
    debt_to_income_ratio: float
    emergency_fund: float
    monthly_expense_total: float
    ticker: str
    jumlah_lot: int


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Vestlytics API Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "engine_loaded": engine is not None,
    }


# =========================================================
# ANALYZE PORTFOLIO ENDPOINT
# =========================================================

@app.post("/api/analyze-portfolio")
def analyze_portfolio_api(
    request: AnalyzeRequest,
) -> Dict[str, Any]:

    global engine

    if engine is None:
        raise HTTPException(
            status_code=500,
            detail="AI Engine belum siap."
        )

    try:
        # Eksekusi pipeline dynamic menggunakan input langsung dari request body
        result = run_user_analysis(
            investment_amount=request.investment_amount,
            debt_to_income_ratio=request.debt_to_income_ratio,
            emergency_fund=request.emergency_fund,
            monthly_expense_total=request.monthly_expense_total,
            ticker=request.ticker,
            jumlah_lot=request.jumlah_lot,
            engine=engine,
        )

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except FileNotFoundError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected Error: {str(e)}"
        )