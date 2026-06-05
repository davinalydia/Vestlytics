from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from training.inference_and_insight import (
    RealLSTMForecastEngine,
    run_user_analysis,
    DATASET_KEUANGAN_PATH,
)

# =========================================================
# GLOBAL ENGINE
# =========================================================

engine = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load model sekali saat startup.
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
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# REQUEST MODEL
# =========================================================

class AnalyzeRequest(BaseModel):
    user_id: int


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
# ANALYZE PORTFOLIO
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

        result = run_user_analysis(
            user_id=request.user_id,
            engine=engine,
            dataset_path=DATASET_KEUANGAN_PATH,
        )

        return result

    except ValueError as e:

        raise HTTPException(
            status_code=404,
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