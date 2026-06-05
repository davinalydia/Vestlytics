"""
inference_and_insight.py
--------------------------------------------------------
Vestlytics Portfolio Analysis Engine

Versi Produksi Berbasis Model Nyata:
1. Financial Readiness (Hasil K-Means dari Data Science)
2. Portfolio Ownership & Validation Edge Case
3. Real LSTM Forecasting Engine (Menggunakan Opsi A: CSV Ter-engineered)
4. Portfolio Decision Engine (Buy / Hold / Sell / Switch / No Portfolio)
5. JSON-ready API Response

Author: Vestlytics AI Team
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

import joblib
from matplotlib import ticker
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model

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
    BASE_DIR / "data" / "stock_data" / "lq45_feature_engineering.csv"
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
        """Memotong data sebanyak 60 hari terakhir dan melakukan normalisasi."""
        stock = self.get_ticker_data(ticker)
        features = stock[FEATURE_COLS].copy()

        # Transform data menggunakan scaler pelatihan (17 kolom)
        scaled = self.scaler.transform(features)

        if len(scaled) < self.WINDOW_SIZE:
            raise ValueError(
                f"Data untuk ticker {ticker} hanya memiliki {len(scaled)} baris. "
                f"Dibutuhkan minimal {self.WINDOW_SIZE} baris untuk input LSTM."
            )

        # Ambil jendela data terakhir
        X = scaled[-self.WINDOW_SIZE:]

        # Reshape menjadi format 3D tensor LSTM: (samples=1, timesteps=60, features=17)
        return X.reshape(1, self.WINDOW_SIZE, len(FEATURE_COLS)), stock

    def predict_stock(self, ticker: str) -> Dict[str, Any]:
    
        """Melakukan inferensi model dan mengembalikan prediksi arah serta risiko."""
        X, stock = self.prepare_input(ticker)

        # Prediksi nilai close masa depan ter-scale
        pred = self.model.predict(X, verbose=0)
        pred_scaled = float(pred[0][0])

        # Mengakali dimensi inverse_transform dengan membuat dummy array 17 kolom
        dummy = np.zeros((1, len(FEATURE_COLS)))
        dummy[0, 0] = pred_scaled  # Kolom indeks 0 dipetakan sebagai 'Close'

        pred_close = self.scaler.inverse_transform(dummy)[0][0]
        last_close = float(stock["Close"].iloc[-1])

        # Menghitung persentase return proyeksi masa depan
        return_pct = ((pred_close - last_close) / last_close) * 100

        # Penentuan arah pergerakan tren berdasarkan threshold return 2%
        if return_pct > 2:
            trend = "Naik"
        elif return_pct < -2:
            trend = "Turun"
        else:
            trend = "Sideways"

        # Penentuan tingkat volatilitas/risiko berdasarkan data volatilitas terbaru
        current_vol = float(stock["Volatility_30"].iloc[-1])
        risk = "Tinggi" if current_vol > 0.03 else "Rendah"

        print("\n=== STOCK FORECAST ===")

        print(f"Ticker           : {ticker}")
        print(f"Predicted Close  : {pred_close}")
        print(f"Expected Return  : {return_pct:.2f}%")
        print(f"Trend            : {trend}")
        print("======================\n")

        return {
            "long_direction": trend,
            "risk_level": risk,
            "long_return_pct": round(return_pct, 2),
            "predicted_close": round(pred_close, 2),
        }

# =========================================================
# USER PROFILE LOADER
# =========================================================

def load_user_profile(
    user_id: int,
    dataset_path: str | Path,
) -> Dict[str, Any]:
    """Load profil keuangan dan status investor hasil clustering K-Means."""
    dataset_path = Path(dataset_path)

    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset keuangan tidak ditemukan: {dataset_path}")

    df = pd.read_csv(dataset_path)

    if df.empty:
        raise ValueError("Dataset keuangan kosong.")

    user_rows = df[df["user_id"] == user_id]

    if user_rows.empty:
        raise ValueError(f"User ID {user_id} tidak ditemukan di database keuangan.")

    row = user_rows.iloc[-1]

    return {
        "user_id": int(row["user_id"]),
        "status_kesiapan_invest": str(row["status_kesiapan_invest"]),
        "ticker_saham": str(row["ticker_saham"]),
        "jumlah_lot": int(row["jumlah_lot"]),
        "average_price": float(row["average_price"]),
    }

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
    
    # -----------------------------------------------------
    # EDGE CASE HANDLING: User Belum Memiliki Portofolio
    # -----------------------------------------------------
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

    # =====================================================
    # CASE A: Konservatif + Bluechip + Trend Positif/Stabil
    # =====================================================
    if (
        investor_status == "Siap Investasi (Konservatif)"
        and is_bluechip
        and trend in ["Naik", "Sideways"]
    ):
        action = "HOLD"
        reason = "Kepemilikan saham bluechip sudah sangat sesuai dengan profil manajemen risiko konservatif Anda."

    # =====================================================
    # CASE B: Konservatif + Saham Volatilitas Tinggi
    # =====================================================
    elif (
        investor_status == "Siap Investasi (Konservatif)"
        and volatility == "Tinggi"
    ):
        action = "SWITCH"
        reason = (
            "Tingkat volatilitas instrumen ini terlalu tinggi bagi profil investor konservatif. "
            "Disarankan untuk melakukan diversifikasi atau mengalihkan modal ke saham kelompok Bluechip."
        )

    # =====================================================
    # CASE C: Belum Siap Investasi (Kondisi Keuangan Buruk)
    # =====================================================
    elif investor_status == "Belum Siap Investasi":
        action = "HOLD"
        reason = (
            "Fokus utama sistem saat ini merekomendasikan pengetatan pengeluaran dan optimalisasi Alokasi Dana Darurat. "
            "Tahan aktivitas trading agresif."
        )

    # =====================================================
    # CASE D: Agresif (Pengejar Pertumbuhan/Growth-Oriented)
    # =====================================================
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

    # =====================================================
    # FALLBACK
    # =====================================================
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
# MAIN ANALYSIS PIPELINE (ORCHESTRATOR)
# =========================================================

def run_user_analysis(
    user_id: int,
    engine: Any,
    dataset_path: str | Path,
) -> Dict[str, Any]:
    """Fungsi pusat penyambung pipeline data dari hulu ke hilir untuk konsumsi API/Frontend."""
    # 1. Ambil data profil keuangan & instrumen kepemilikan user
    profile = load_user_profile(user_id=user_id, dataset_path=dataset_path)
    ticker = profile["ticker_saham"]
    jumlah_lot = profile["jumlah_lot"]

    # 2. Logika Pemisahan: Jika user tidak punya portofolio, hindari pemanggilan mesin LSTM
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

    # 3. Proses hasil analisis portofolio komprehensif
    portfolio_result = analyze_portfolio(
        investor_status=profile["status_kesiapan_invest"],
        forecast=forecast,
        jumlah_lot=jumlah_lot,
    )

    # 4. Bungkus dalam struktur data JSON-friendly
    return {
    "user_status": profile["status_kesiapan_invest"],
    "stock_forecast": forecast,
    "portfolio_analysis": [portfolio_result],
    "financial_advice_text": generate_financial_advice(
        profile["status_kesiapan_invest"]
    ),
}

# =========================================================
# PRODUCTION PIPELINE RUNTIME LOG (MAIN EXECUTION)
# =========================================================

if __name__ == "__main__":
    print("Initializing Real LSTM Forecast Engine & Loading Artifacts...")
    
    try:
        # Inisialisasi model deep learning asli dan loader dataset
        real_engine = RealLSTMForecastEngine()
        
        # User ID target uji coba integrasi dari dataset asli Data Science
        TARGET_USER_ID = 1584
        
        print(f"Executing End-to-End Analysis Pipeline for User ID: {TARGET_USER_ID}...")
        
        # Eksekusi fungsi orkestrasi utama
        final_json_response = run_user_analysis(
            user_id=TARGET_USER_ID,
            engine=real_engine,
            dataset_path=DATASET_KEUANGAN_PATH
        )
        
        print("\n================== PIPELINE OUTPUT SUCCESS ==================")
        print(json.dumps(final_json_response, indent=2, ensure_ascii=False))
        print("=============================================================")
        
    except FileNotFoundError as fnf_err:
        print(f"\n[Path Error]: {fnf_err}")
        print("Solusi: Cek kembali penempatan file .keras, .pkl, atau data .csv di laptop Anda.")
        
    except ValueError as val_err:
        print(f"\n[Data/Inference Error]: {val_err}")
        print("Solusi: Pastikan ticker saham user terdaftar di dalam lq45_feature_engineering.csv.")
        
    except Exception as general_err:
        print(f"\n[Runtime Crash]: {general_err}")