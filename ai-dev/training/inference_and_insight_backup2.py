"""
inference_and_insight.py
--------------------------------------------------------
Vestlytics Portfolio Analysis Engine

Versi baru yang mengintegrasikan:
1. Financial Readiness (hasil K-Means dari Data Science)
2. Portfolio Ownership
3. LSTM Forecasting (Mock Engine untuk testing)
4. Portfolio Decision Engine
5. JSON-ready API Response

Author: Vestlytics AI Team
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

import pandas as pd


# =========================================================
# PATH CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_SHORT_PATH = (
    BASE_DIR / "models" / "model_short_term.keras"
)

MODEL_LONG_PATH = (
    BASE_DIR / "models" / "model_long_term.keras"
)

DATASET_KEUANGAN_PATH = (
    BASE_DIR / "data" / "financial_data" / "dataset_keuangan.csv"
)


# =========================================================
# CONSTANTS
# =========================================================

BLUECHIP_STOCKS = {
    "BBCA.JK",
    "BBRI.JK",
    "BMRI.JK",
    "TLKM.JK",
    "ASII.JK",
    "ICBP.JK",
}


# =========================================================
# MOCK LSTM FORECAST ENGINE
# =========================================================

class LSTMForecastEngine:
    """
    Mock LSTM Engine untuk testing.

    Nanti class ini bisa diganti dengan
    engine forecasting asli yang load model .keras.
    """

    def predict_stock(self, ticker: str) -> Dict[str, Any]:
        """
        Simulasi hasil prediksi saham.

        Parameters
        ----------
        ticker : str

        Returns
        -------
        dict
        """

        ticker = ticker.upper()

        mock_predictions = {
            "BBCA.JK": {
                "long_direction": "Naik",
                "risk_level": "Rendah",
                "long_return_pct": 8.5,
            },
            "BBRI.JK": {
                "long_direction": "Sideways",
                "risk_level": "Rendah",
                "long_return_pct": 1.2,
            },
            "ADRO.JK": {
                "long_direction": "Naik",
                "risk_level": "Tinggi",
                "long_return_pct": 15.8,
            },
            "TINS.JK": {
                "long_direction": "Turun",
                "risk_level": "Tinggi",
                "long_return_pct": -12.4,
            },
        }

        return mock_predictions.get(
            ticker,
            {
                "long_direction": "Sideways",
                "risk_level": "Rendah",
                "long_return_pct": 0.0,
            },
        )


# =========================================================
# USER PROFILE LOADER
# =========================================================

def load_user_profile(
    user_id: int,
    dataset_path: str | Path,
) -> Dict[str, Any]:
    """
    Load profil user dari dataset keuangan.

    Parameters
    ----------
    user_id : int
        User yang dicari.

    dataset_path : str | Path
        Lokasi dataset.

    Returns
    -------
    dict
        Profil user.
    """

    dataset_path = Path(dataset_path)

    if not dataset_path.exists():
        raise FileNotFoundError(
            f"Dataset tidak ditemukan: {dataset_path}"
        )

    df = pd.read_csv(dataset_path)

    if df.empty:
        raise ValueError(
            "Dataset keuangan kosong."
        )

    user_rows = df[df["user_id"] == user_id]

    if user_rows.empty:
        raise ValueError(
            f"User ID {user_id} tidak ditemukan."
        )

    row = user_rows.iloc[-1]

    return {
        "user_id": int(row["user_id"]),
        "status_kesiapan_invest":
            str(row["status_kesiapan_invest"]),
        "ticker_saham":
            str(row["ticker_saham"]),
        "jumlah_lot":
            int(row["jumlah_lot"]),
        "average_price":
            float(row["average_price"]),
    }


# =========================================================
# FORECAST WRAPPER
# =========================================================

def get_stock_forecast(
    engine: LSTMForecastEngine,
    ticker: str,
) -> Dict[str, Any]:
    """
    Standardisasi output forecast.

    Parameters
    ----------
    engine : LSTMForecastEngine

    ticker : str

    Returns
    -------
    dict
    """

    prediction = engine.predict_stock(ticker)

    return {
        "ticker": ticker,
        "trend":
            prediction["long_direction"],
        "volatility":
            prediction["risk_level"],
        "predicted_return":
            prediction["long_return_pct"],
    }


# =========================================================
# PORTFOLIO DECISION ENGINE
# =========================================================

def analyze_portfolio(
    investor_status: str,
    forecast: Dict[str, Any],
    jumlah_lot: int,
) -> Dict[str, Any]:
    """
    Analisis portfolio user.

    Parameters
    ----------
    investor_status : str

    forecast : dict

    jumlah_lot : int

    Returns
    -------
    dict
    """

    ticker = forecast["ticker"]
    trend = forecast["trend"]
    volatility = forecast["volatility"]

    is_bluechip = ticker in BLUECHIP_STOCKS

    action = "HOLD"
    reason = ""

    # =====================================================
    # CASE A
    # Konservatif + Bluechip + Trend Positif
    # =====================================================

    if (
        investor_status ==
        "Siap Investasi (Konservatif)"
        and is_bluechip
        and trend in ["Naik", "Sideways"]
    ):

        if jumlah_lot == 0:
            action = "BUY"
            reason = (
                "Saham bluechip dengan "
                "risiko relatif rendah "
                "sesuai untuk investor "
                "konservatif."
            )

        else:
            action = "HOLD"
            reason = (
                "Portofolio sudah sesuai "
                "dengan profil konservatif."
            )

    # =====================================================
    # CASE B
    # Konservatif + Volatilitas Tinggi
    # =====================================================

    elif (
        investor_status ==
        "Siap Investasi (Konservatif)"
        and volatility == "Tinggi"
    ):

        action = "SWITCH"

        reason = (
            "Risiko saham terlalu tinggi "
            "untuk profil konservatif. "
            "Pertimbangkan pindah ke "
            "saham bluechip yang lebih stabil."
        )

    # =====================================================
    # CASE C
    # Belum Siap Investasi
    # =====================================================

    elif (
        investor_status ==
        "Belum Siap Investasi"
    ):

        action = "HOLD"

        reason = (
            "Prioritaskan peningkatan "
            "dana darurat dan kesehatan "
            "finansial sebelum menambah "
            "alokasi investasi."
        )

    # =====================================================
    # CASE D
    # Agresif
    # =====================================================

    elif (
        investor_status ==
        "Siap Investasi (Agresif)"
    ):

        if trend == "Naik":

            action = "BUY"

            reason = (
                "Profil agresif sesuai "
                "untuk memanfaatkan "
                "peluang pertumbuhan."
            )

        elif trend == "Turun":

            action = "SELL"

            reason = (
                "Prediksi tren menurun. "
                "Pertimbangkan realokasi."
            )

        else:

            action = "HOLD"

            reason = (
                "Belum ada sinyal kuat "
                "untuk aksi tambahan."
            )

    # =====================================================
    # FALLBACK
    # =====================================================

    else:

        action = "HOLD"

        reason = (
            "Tidak ada kondisi khusus "
            "yang terdeteksi."
        )

    return {
        "ticker": ticker,
        "jumlah_lot": jumlah_lot,
        "current_action": action,
        "insight_reason": reason,
    }


# =========================================================
# FINANCIAL ADVICE
# =========================================================

def generate_financial_advice(
    status: str,
) -> str:
    """
    Generate financial advice.

    Parameters
    ----------
    status : str

    Returns
    -------
    str
    """

    if status == "Belum Siap Investasi":

        return (
            "Fokus membangun dana darurat, "
            "mengurangi utang, dan menjaga "
            "cash flow positif sebelum "
            "menambah investasi."
        )

    if status == "Siap Investasi (Konservatif)":

        return (
            "Pertahankan diversifikasi "
            "dan prioritaskan instrumen "
            "berisiko rendah hingga sedang."
        )

    if status == "Siap Investasi (Agresif)":

        return (
            "Kondisi finansial cukup baik. "
            "Tetap disiplin dalam manajemen "
            "risiko dan diversifikasi."
        )

    return (
        "Lakukan evaluasi finansial secara "
        "berkala untuk menjaga kesehatan "
        "portofolio investasi."
    )


# =========================================================
# MAIN ANALYSIS PIPELINE
# =========================================================

def run_user_analysis(
    user_id: int,
    engine: LSTMForecastEngine,
    dataset_path: str | Path,
) -> Dict[str, Any]:
    """
    Entry point utama untuk backend/API.

    Parameters
    ----------
    user_id : int

    engine : LSTMForecastEngine

    dataset_path : str | Path

    Returns
    -------
    dict
    """

    profile = load_user_profile(
        user_id=user_id,
        dataset_path=dataset_path,
    )

    forecast = get_stock_forecast(
        engine=engine,
        ticker=profile["ticker_saham"],
    )

    portfolio_result = analyze_portfolio(
        investor_status=
            profile["status_kesiapan_invest"],
        forecast=forecast,
        jumlah_lot=
            profile["jumlah_lot"],
    )

    return {
        "user_status":
            profile["status_kesiapan_invest"],

        "portfolio_analysis": [
            portfolio_result
        ],

        "financial_advice_text":
            generate_financial_advice(
                profile[
                    "status_kesiapan_invest"
                ]
            ),
    }


# =========================================================
# MAIN BLOCK (SIMULATION)
# =========================================================

if __name__ == "__main__":

    temp_csv = Path("dummy_dataset_keuangan.csv")

    dummy_df = pd.DataFrame(
        [
            {
                "user_id": 1,
                "status_kesiapan_invest":
                    "Siap Investasi (Konservatif)",
                "ticker_saham": "BBCA.JK",
                "jumlah_lot": 20,
                "average_price": 9500,
            },
            {
                "user_id": 2,
                "status_kesiapan_invest":
                    "Siap Investasi (Agresif)",
                "ticker_saham": "ADRO.JK",
                "jumlah_lot": 15,
                "average_price": 2200,
            },
            {
                "user_id": 3,
                "status_kesiapan_invest":
                    "Belum Siap Investasi",
                "ticker_saham": "TINS.JK",
                "jumlah_lot": 10,
                "average_price": 1700,
            },
        ]
    )

    dummy_df.to_csv(
        temp_csv,
        index=False,
    )

    engine = LSTMForecastEngine()

    result = run_user_analysis(
        user_id=1,
        engine=engine,
        dataset_path=temp_csv,
    )

    print(
        json.dumps(
            result,
            indent=2,
            ensure_ascii=False,
        )
    )