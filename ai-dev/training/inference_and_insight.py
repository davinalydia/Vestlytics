"""
inference_and_insight.py
--------------------------------------------------------
Vestlytics Portfolio Analysis Engine (Dynamic Input Version)

Versi Produksi Berbasis Model Nyata:
1. Financial Readiness (Prediksi K-Means Real-time dari Data Input)
2. Portfolio Ownership & Validation Edge Case
3. Real LSTM Forecasting Engine (Menggunakan Opsi A: CSV Ter-engineered)
4. Portfolio Decision Engine (Buy / Hold / Sell / Switch / No Portfolio)
5. JSON-ready API Response
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model

# =========================================================
# PATH CONFIGURATION
# =========================================================
# =========================================================
# PATH CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_LONG_PATH = (
    BASE_DIR / "models" / "model_long_term.keras"
)

SCALER_LONG_PATH = (
    BASE_DIR / "data" / "processed" / "scaler_long.pkl"
)

STOCK_DATA_PATH = (
    BASE_DIR / "data" / "stock_data" / "lq45_clean_dataset.csv"
)

FINANCIAL_KMEANS_PATH = (
    BASE_DIR / "models" / "financial_readiness_kmeans.pkl"
)

FINANCIAL_SCALER_PATH = (
    BASE_DIR / "models" / "financial_readiness_scaler.pkl"
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

FEATURE_COLS = [
    "Close",
    "Open",
    "High",
    "Low",
    "Volume",
    "Return",
    "Volatility",
    "Volatility_30",
    "MA7",
    "MA20",
    "MA30",
    "MA5",
    "Price_Range",
    "Price_Change",
    "Close_Lag_1",
    "Momentum_7",
    "Relative_Volume",
]
# =========================================================
# REAL LSTM FORECAST ENGINE
# =========================================================

class RealLSTMForecastEngine:
    """
    Engine Forecasting Nyata menggunakan Opsi A.
    Me-load model .keras, scaler .pkl, dan membaca lq45_feature_engineering.csv.
    """

    WINDOW_SIZE = 60

    def __init__(self) -> None:
        if not MODEL_LONG_PATH.exists():
            raise FileNotFoundError(f"Model LSTM tidak ditemukan di: {MODEL_LONG_PATH}")
        if not SCALER_LONG_PATH.exists():
            raise FileNotFoundError(f"Scaler tidak ditemukan di: {SCALER_LONG_PATH}")
        if not STOCK_DATA_PATH.exists():
            raise FileNotFoundError(f"Dataset stock tidak ditemukan di: {STOCK_DATA_PATH}")

        # Load artifacts tanpa meng-compile ulang model agar mempercepat inference
        self.model = load_model(MODEL_LONG_PATH, compile=False)
        self.scaler = joblib.load(SCALER_LONG_PATH)
        self.df = pd.read_csv(STOCK_DATA_PATH)

    def get_ticker_data(self, ticker: str) -> pd.DataFrame:
        """Mengambil dan mengurutkan data historis berdasarkan ticker."""
        stock = self.df[self.df["Ticker"] == ticker].copy()

        if stock.empty:
            raise ValueError(
                f"Ticker {ticker} tidak ditemukan di dalam lq45_feature_engineering.csv. "
                f"Harap pastikan kode emiten sesuai."
            )

        stock = stock.sort_values("Date")
        return stock

    def prepare_input(self, ticker: str) -> tuple[np.ndarray, pd.DataFrame]:
        """Memotong data sebanyak 60 hari terakhir dan melakukan normalisasi dengan auto-feature engineering."""
        stock = self.get_ticker_data(ticker)
        
        # =========================================================
        # AUTO-FEATURE ENGINEERING FALLBACK (BIAR GAK ERROR NOT IN INDEX)
        # =========================================================
        if "Return" not in stock.columns:
            stock["Return"] = stock["Close"].pct_change().fillna(0)
        if "Volatility" not in stock.columns:
            stock["Volatility"] = stock["Return"].rolling(window=7).std().fillna(0)
        if "Volatility_30" not in stock.columns:
            stock["Volatility_30"] = stock["Return"].rolling(window=30).std().fillna(0)
        if "MA7" not in stock.columns:
            stock["MA7"] = stock["Close"].rolling(window=7).mean().fillna(stock["Close"])
        if "MA20" not in stock.columns:
            stock["MA20"] = stock["Close"].rolling(window=20).mean().fillna(stock["Close"])
        if "MA30" not in stock.columns:
            stock["MA30"] = stock["Close"].rolling(window=30).mean().fillna(stock["Close"])
        if "MA5" not in stock.columns:
            stock["MA5"] = stock["Close"].rolling(window=5).mean().fillna(stock["Close"])
        if "Price_Range" not in stock.columns:
            stock["Price_Range"] = stock["High"] - stock["Low"]
        if "Price_Change" not in stock.columns:
            stock["Price_Change"] = stock["Close"] - stock["Open"]
        if "Close_Lag_1" not in stock.columns:
            stock["Close_Lag_1"] = stock["Close"].shift(1).fillna(stock["Close"])
        if "Momentum_7" not in stock.columns:
            stock["Momentum_7"] = stock["Close"] - stock["Close"].shift(7).fillna(0)
        if "Relative_Volume" not in stock.columns:
            ma_vol = stock["Volume"].rolling(window=20).mean().fillna(1)
            stock["Relative_Volume"] = stock["Volume"] / np.where(ma_vol == 0, 1, ma_vol)

        features = stock[FEATURE_COLS].copy()
        scaled = self.scaler.transform(features)

        if len(scaled) < self.WINDOW_SIZE:
            raise ValueError(
                f"Data untuk ticker {ticker} hanya memiliki {len(scaled)} baris. "
                f"Dibutuhkan minimal {self.WINDOW_SIZE} baris untuk input LSTM."
            )

        X = scaled[-self.WINDOW_SIZE:]
        return X.reshape(1, self.WINDOW_SIZE, len(FEATURE_COLS)), stock

    def predict_stock(self, ticker: str) -> Dict[str, Any]:
        """Melakukan inferensi model dan mengembalikan prediksi arah serta risiko."""
        X, stock = self.prepare_input(ticker)

        pred = self.model.predict(X, verbose=0)
        pred_scaled = float(pred[0][0])

        dummy = np.zeros((1, len(FEATURE_COLS)))
        dummy[0, 0] = pred_scaled

        pred_close = self.scaler.inverse_transform(dummy)[0][0]
        last_close = float(stock["Close"].iloc[-1])

        return_pct = ((pred_close - last_close) / last_close) * 100

        if return_pct > 2:
            trend = "Naik"
        elif return_pct < -2:
            trend = "Turun"
        else:
            trend = "Sideways"

        current_vol = float(stock["Volatility_30"].iloc[-1])
        risk = "Tinggi" if current_vol > 0.03 else "Rendah"

        return {
            "long_direction": trend,
            "risk_level": risk,
            "long_return_pct": round(return_pct, 2),
            "predicted_close": round(pred_close, 2),
        }
# =========================================================
# DYNAMIC KMEANS PREDICTOR FUNCTION (PREDICT REAL-TIME)
# =========================================================

def predict_investor_status(
    investment_amount: float,
    debt_to_income_ratio: float,
    emergency_fund: float,
    monthly_expense_total: float,
) -> str:
    """Prediksi kesiapan finansial secara real-time via model K-Means .pkl"""
    if not FINANCIAL_KMEANS_PATH.exists() or not FINANCIAL_SCALER_PATH.exists():
        raise FileNotFoundError("Model KMeans atau Scaler Financial tidak ditemukan di folder models/.")

    kmeans = joblib.load(FINANCIAL_KMEANS_PATH)
    scaler = joblib.load(FINANCIAL_SCALER_PATH)

    # Feature engineering mandiri sesuai rumusan training
    rasio_darurat = (emergency_fund / monthly_expense_total) if monthly_expense_total > 0 else 0
    score_emergency = min((rasio_darurat / 6) * 40, 40)

    X = np.array([[investment_amount, debt_to_income_ratio, score_emergency]])
    X_scaled = scaler.transform(X)

    cluster = int(kmeans.predict(X_scaled)[0])

    cluster_mapping = {
        0: "Siap Investasi (Agresif)",
        1: "Belum Siap Investasi",
        2: "Siap Investasi (Konservatif)"
    }

    return cluster_mapping.get(cluster, "Belum Siap Investasi")

# =========================================================
# FORECAST WRAPPER
# =========================================================

def get_stock_forecast(
    engine: RealLSTMForecastEngine,
    ticker: str,
) -> Dict[str, Any]:
    """Standardisasi output dari real forecast engine agar API-friendly."""
    prediction = engine.predict_stock(ticker)

    return {
        "ticker": ticker,
        "trend": prediction["long_direction"],
        "volatility": prediction["risk_level"],
        "predicted_return": prediction["long_return_pct"],
        "predicted_close": prediction["predicted_close"],
    }

# =========================================================
# PORTFOLIO DECISION ENGINE
# =========================================================

def analyze_portfolio(
    investor_status: str,
    forecast: Dict[str, Any],
    jumlah_lot: int,
) -> Dict[str, Any]:
    """Menggabungkan status klaster user dan prediksi pasar menjadi sinyal aksi bisnis."""
    ticker = forecast["ticker"]
    
    if ticker == "Belum Ada Portfolio" or jumlah_lot == 0:
        return {
            "ticker": ticker,
            "jumlah_lot": jumlah_lot,
            "current_action": "NO PORTFOLIO",
            "insight_reason": "User saat ini belum memiliki portofolio saham terdaftar.",
        }

    trend = forecast["trend"]
    volatility = forecast["volatility"]
    is_bluechip = ticker in BLUECHIP_STOCKS

    action = "HOLD"
    reason = ""

    if (
        investor_status == "Siap Investasi (Konservatif)"
        and is_bluechip
        and trend in ["Naik", "Sideways"]
    ):
        action = "HOLD"
        reason = "Kepemilikan saham bluechip sudah sangat sesuai dengan profil manajemen risiko konservatif Anda."

    elif (
        investor_status == "Siap Investasi (Konservatif)"
        and volatility == "Tinggi"
    ):
        action = "SWITCH"
        reason = (
            "Tingkat volatilitas instrumen ini terlalu tinggi bagi profil investor konservatif. "
            "Disarankan untuk melakukan diversifikasi atau mengalihkan modal ke saham kelompok Bluechip."
        )

    elif investor_status == "Belum Siap Investasi":
        action = "HOLD"
        reason = (
            "Fokus utama sistem saat ini merekomendasikan pengetatan pengeluaran dan optimalisasi Alokasi Dana Darurat. "
            "Tahan aktivitas trading agresif."
        )

    elif investor_status == "Siap Investasi (Agresif)":
        if trend == "Naik":
            action = "BUY"
            reason = "Profil investasi agresif Anda sangat cocok memanfaatkan momentum tren kenaikan harga untuk memaksimalisasi profit."
        elif trend == "Turun":
            action = "SELL"
            reason = "Model mendeteksi sinyal tren penurunan harga yang kuat. Evaluasi untuk melakukan pembatasan kerugian (Cut Loss)."
        else:
            action = "HOLD"
            reason = "Kondisi pergerakan pasar saham sideways. Disarankan menahan aset sembari menunggu konfirmasi breakout arah harga baru."

    else:
        action = "HOLD"
        reason = "Aktivitas pasar normal. Tidak terdeteksi adanya penyimpangan profil atau pola anomali harga saham."

    return {
        "ticker": ticker,
        "jumlah_lot": jumlah_lot,
        "current_action": action,
        "insight_reason": reason,
    }

# =========================================================
# FINANCIAL ADVICE GENERATOR
# =========================================================

def generate_financial_advice(status: str) -> str:
    """Rekomendasi narasi global mengenai penataan kesehatan finansial makro user."""
    if status == "Belum Siap Investasi":
        return (
            "Prioritaskan pengalokasian dana ke dalam Rekening Dana Darurat (Emergency Fund) "
            "dan tekan rasio hutang (Debt-to-Income Ratio) sebelum menambah eksposur modal ke pasar saham."
        )
    
    if status == "Siap Investasi (Konservatif)":
        return (
            "Kondisi finansial aman untuk berinvestasi. Fokus utamanya adalah menjaga kestabilan aset "
            "melalui instrumen berpendapatan tetap atau saham berkapitalisasi besar (Bluechip)."
        )
    
    if status == "Siap Investasi (Agresif)":
        return (
            "Struktur fundamental keuangan Anda sangat sehat dan kokoh. Anda memiliki ruang likuiditas yang longgar "
            "untuk membidik instrumen berisiko tinggi demi mengoptimalkan capital gain jangka panjang."
        )
    
    return "Lakukan tinjauan kesehatan cashflow personal secara berkala untuk menjaga stabilitas alokasi finansial."

# =========================================================
# MAIN ANALYSIS PIPELINE (DYNAMIC VERSION)
# =========================================================

def run_user_analysis(
    investment_amount: float,
    debt_to_income_ratio: float,
    emergency_fund: float,
    monthly_expense_total: float,
    ticker: str,
    jumlah_lot: int,
    engine: Any,
) -> Dict[str, Any]:
    """Fungsi pusat penyambung pipeline data dari hulu ke hilir berbasis input dinamis."""
    
    # 1. Hitung status kesiapan investasi secara dinamis lewat KMeans (.pkl)
    user_status = predict_investor_status(
        investment_amount=investment_amount,
        debt_to_income_ratio=debt_to_income_ratio,
        emergency_fund=emergency_fund,
        monthly_expense_total=monthly_expense_total,
    )

    # 2. Logika Pemisahan Edge Case
    if ticker == "Belum Ada Portfolio" or jumlah_lot == 0:
        forecast = {
            "ticker": ticker,
            "trend": "None",
            "volatility": "None",
            "predicted_return": 0.0,
            "predicted_close": 0.0
        }
    else:
        # Panggil Real LSTM Model Inference
        forecast = get_stock_forecast(engine=engine, ticker=ticker)

    # 3. Proses hasil analisa portofolio
    portfolio_result = analyze_portfolio(
        investor_status=user_status,
        forecast=forecast,
        jumlah_lot=jumlah_lot,
    )

    # 4. Return format JSON asli tim Vestlytics
    return {
        "user_status": user_status,
        "stock_forecast": forecast,
        "portfolio_analysis": [portfolio_result],
        "financial_advice_text": generate_financial_advice(user_status),
    }

# =========================================================
# MAIN TEST LOCAL RUNTIME
# =========================================================

if __name__ == "__main__":
    print("Testing Pipeline with Dynamic Local Input...")
    try:
        real_engine = RealLSTMForecastEngine()
        
        # Test Object pengganti Data Dummy Lama
        test_response = run_user_analysis(
            investment_amount=5000000,
            debt_to_income_ratio=0.2,
            emergency_fund=12000000,
            monthly_expense_total=3000000,
            ticker="BBCA.JK",
            jumlah_lot=10,
            engine=real_engine
        )
        print("\n================== LOCAL TEST SUCCESS ==================")
        print(json.dumps(test_response, indent=2, ensure_ascii=False))
        print("=========================================================")
    except Exception as e:
        print(f"Error test runtime: {str(e)}")