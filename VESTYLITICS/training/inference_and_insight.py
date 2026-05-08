"""
STEP 3 — inference_and_insight.py
--------------------------------------------------
Jalankan SETELAH training selesai:
    cd training
    python inference_and_insight.py

Modul ini:
1. Load model short-term & long-term yang sudah ditraining
2. Prediksi harga saham untuk 30 hari (short) dan 90 hari (long)
3. Analisis profil keuangan user
4. Generate narasi penjelasan otomatis (Bahasa Indonesia)

Dipakai oleh Backend (FastAPI) sebagai endpoint utama.
"""

from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import tensorflow as tf


# =========================================================
# CONFIG
# =========================================================

SHORT_WINDOW  = 30
LONG_WINDOW   = 60
SHORT_HORIZON = 30
LONG_HORIZON  = 90

FEATURE_COLS = [
    "Close", "Open", "High", "Low", "Volume",
    "Return", "Volatility", "Volatility_30",
    "MA7", "MA20", "MA30", "MA5",
    "Price_Range", "Price_Change",
    "Close_Lag_1", "Momentum_7", "Relative_Volume"
]


# =========================================================
# 1. PREDICTOR CLASS
# =========================================================

class VestlyticsPredictor:
    """
    Load model + scaler, lalu prediksi harga saham.

    Contoh pakai:
        predictor = VestlyticsPredictor()
        result = predictor.predict(df_ticker)
    """

    def __init__(
        self,
        short_model_path : str = "../models/model_short_term.keras",
        long_model_path  : str = "../models/model_long_term.keras",
        short_scaler_path: str = "../data/processed/scaler_short.pkl",
        long_scaler_path : str = "../data/processed/scaler_long.pkl",
    ):
        print("Memuat model...")
        self.model_short  = tf.keras.models.load_model(short_model_path)
        self.model_long   = tf.keras.models.load_model(long_model_path)
        self.scaler_short = joblib.load(short_scaler_path)
        self.scaler_long  = joblib.load(long_scaler_path)
        print("✓ Model dan scaler berhasil dimuat.")

    def _prepare_window(self, df: pd.DataFrame, scaler, window_size: int) -> np.ndarray:
        """
        Ambil window terakhir dari data ticker, scale, reshape untuk LSTM.
        """
        available_cols = [c for c in FEATURE_COLS if c in df.columns]
        df_sorted = df.sort_values("Date").dropna(subset=available_cols)

        if len(df_sorted) < window_size:
            raise ValueError(
                f"Data tidak cukup. Butuh minimal {window_size} baris, "
                f"tersedia {len(df_sorted)}."
            )

        window = df_sorted[available_cols].values[-window_size:]
        window_scaled = scaler.transform(window)
        return window_scaled.reshape(1, window_size, len(available_cols))

    def _inverse_close(self, pred_normalized: float, scaler, n_features: int) -> float:
        """Kembalikan nilai Close dari normalized ke harga asli (IDR)."""
        dummy = np.zeros((1, n_features))
        dummy[0, 0] = pred_normalized   # Close adalah index 0
        return float(scaler.inverse_transform(dummy)[0, 0])

    def predict(self, df_ticker: pd.DataFrame) -> dict:
        """
        Prediksi harga Close untuk short-term dan long-term.

        Parameters
        ----------
        df_ticker : DataFrame satu ticker dari lq45_feature_engineering.csv

        Returns
        -------
        dict:
            short_term_price  : float  — prediksi harga 30 hari lagi
            long_term_price   : float  — prediksi harga 90 hari lagi
            current_price     : float  — harga Close terkini
            short_return_pct  : float  — expected return short (%)
            long_return_pct   : float  — expected return long (%)
            volatility        : float  — volatilitas terkini
            risk_level        : str    — "Rendah" | "Sedang" | "Tinggi"
            short_direction   : str    — "Naik" | "Turun" | "Sideways"
            long_direction    : str    — "Naik" | "Turun" | "Sideways"
        """
        n_feat_short = len([c for c in FEATURE_COLS if c in df_ticker.columns])
        n_feat_long  = n_feat_short

        # Short-term prediction
        X_short = self._prepare_window(df_ticker, self.scaler_short, SHORT_WINDOW)
        pred_short_norm  = float(self.model_short.predict(X_short, verbose=0)[0][0])
        short_price      = self._inverse_close(pred_short_norm, self.scaler_short, n_feat_short)

        # Long-term prediction
        X_long = self._prepare_window(df_ticker, self.scaler_long, LONG_WINDOW)
        pred_long_norm   = float(self.model_long.predict(X_long, verbose=0)[0][0])
        long_price       = self._inverse_close(pred_long_norm, self.scaler_long, n_feat_long)

        # Info terkini
        current_price    = float(df_ticker.sort_values("Date")["Close"].iloc[-1])
        volatility       = float(df_ticker["Volatility"].iloc[-1]) if "Volatility" in df_ticker.columns else 0.02

        short_ret = (short_price - current_price) / current_price * 100
        long_ret  = (long_price  - current_price) / current_price * 100

        return {
            "current_price"    : round(current_price, 2),
            "short_term_price" : round(short_price, 2),
            "long_term_price"  : round(long_price, 2),
            "short_return_pct" : round(short_ret, 2),
            "long_return_pct"  : round(long_ret, 2),
            "volatility"       : round(volatility * 100, 2),
            "risk_level"       : _classify_risk(volatility),
            "short_direction"  : _direction(short_ret),
            "long_direction"   : _direction(long_ret),
        }


# =========================================================
# 2. FINANCIAL AWARENESS ANALYZER
#    Berdasarkan kolom aktual dari data_keuangan_clean.csv:
#    monthly_income, monthly_expense_total, emergency_fund,
#    debt_to_income_ratio, cash_flow, financial_health_score
# =========================================================

def analyze_financial_profile(profile: dict) -> dict:
    """
    Analisis profil keuangan user dan hasilkan score + status.

    Parameters
    ----------
    profile : dict dengan key:
        monthly_income        : float (Rp)
        monthly_expense_total : float (Rp)
        emergency_fund        : float (Rp)
        debt_to_income_ratio  : float (0–1)
        investment_amount     : float (Rp) — opsional

    Returns
    -------
    dict:
        financial_health_score : float 0–100
        status_kesiapan        : str
        cash_flow              : float
        rasio_dana_darurat     : float
        reasons                : list[str]
    """
    income   = profile.get("monthly_income", 1)
    expense  = profile.get("monthly_expense_total", 0)
    ef       = profile.get("emergency_fund", 0)
    dti      = profile.get("debt_to_income_ratio", 0)

    reasons = []
    score   = 0.0

    # ── Dana Darurat (maks 40 poin) ──
    rasio_ef = ef / expense if expense > 0 else 0
    if rasio_ef >= 6:
        score += 40
        reasons.append(f"✓ Dana darurat sangat sehat ({rasio_ef:.1f}x pengeluaran bulanan, target ≥ 6x).")
    elif rasio_ef >= 3:
        score += 25
        reasons.append(f"⚠ Dana darurat cukup ({rasio_ef:.1f}x), tapi belum optimal. Idealnya ≥ 6x pengeluaran.")
    else:
        score += 0
        reasons.append(f"✗ Dana darurat belum aman ({rasio_ef:.1f}x). Prioritaskan kumpulkan minimal 3x pengeluaran dulu.")

    # ── Utang/DTI (maks 30 poin) ──
    if dti <= 0.30:
        score += 30
        reasons.append(f"✓ Rasio utang sehat ({dti*100:.0f}% dari pendapatan, batas aman ≤ 30%).")
    elif dti <= 0.50:
        score += 15
        reasons.append(f"⚠ Rasio utang perlu diperhatikan ({dti*100:.0f}%). Cicil utang sebelum investasi agresif.")
    else:
        score += 0
        reasons.append(f"✗ Rasio utang tinggi ({dti*100:.0f}%). Fokus lunasi utang terlebih dahulu.")

    # ── Cash Flow (maks 30 poin) ──
    cash_flow = income - expense
    cf_ratio  = cash_flow / income if income > 0 else 0
    if cf_ratio >= 0.2:
        score += 30
        reasons.append(f"✓ Cash flow positif (surplus Rp {cash_flow:,.0f}/bulan). Ada ruang untuk investasi rutin.")
    elif cf_ratio > 0:
        score += 15
        reasons.append(f"⚠ Cash flow positif tapi tipis (surplus Rp {cash_flow:,.0f}/bulan). Investasi dengan jumlah kecil dulu.")
    else:
        score += 0
        reasons.append(f"✗ Cash flow negatif (defisit Rp {abs(cash_flow):,.0f}/bulan). Perbaiki pengeluaran sebelum investasi.")

    # Status
    if score >= 80:
        status = "Siap Investasi"
    elif score >= 50:
        status = "Perbaiki Dana Darurat dan pelunasan Utang"
    else:
        status = "WARING!!! : Fokus Lunasi Utang & Nabung"

    return {
        "financial_health_score" : round(score, 2),
        "status_kesiapan"        : status,
        "cash_flow"              : round(cash_flow, 2),
        "rasio_dana_darurat"     : round(rasio_ef, 2),
        "reasons"                : reasons,
    }


# =========================================================
# 3. INSIGHT GENERATOR — Narasi otomatis
# =========================================================

def generate_full_insight(
    prediction     : dict,
    financial      : dict,
    ticker         : str,
    user_risk_pref : str = "Medium"  # "Low" | "Medium" | "High"
) -> dict:
    """
    Gabungkan prediksi saham + profil keuangan → narasi lengkap.

    Returns
    -------
    dict:
        summary          : str — ringkasan 1 paragraf
        short_term_story : str — cerita prediksi jangka pendek
        long_term_story  : str — cerita prediksi jangka panjang
        financial_story  : str — status keuangan user
        final_advice     : str — rekomendasi akhir
        ready_to_invest  : bool
    """

    # ── Narasi Saham Short-Term ──
    short_dir   = prediction["short_direction"]
    short_ret   = prediction["short_return_pct"]
    short_price = prediction["short_term_price"]
    curr_price  = prediction["current_price"]

    short_story = (
        f"Berdasarkan analisis data historis {ticker} menggunakan model AI jangka pendek, "
        f"harga saham diprediksi akan {'naik' if short_dir == 'Naik' else 'turun' if short_dir == 'Turun' else 'bergerak sideways'} "
        f"dalam 30 hari ke depan. "
        f"Dari harga saat ini Rp {curr_price:,.2f}, model memperkirakan harga mencapai "
        f"Rp {short_price:,.2f} ({short_ret:+.2f}%). "
    )

    # Tambahkan konteks volatilitas
    vol   = prediction["volatility"]
    risk  = prediction["risk_level"]
    short_story += (
        f"Volatilitas saham ini tergolong {risk.lower()} ({vol:.2f}%), "
        f"{'yang berarti fluktuasi harian cukup besar dan memerlukan pemantauan aktif.' if risk == 'Tinggi' else 'cocok untuk profil investor yang moderat.' if risk == 'Sedang' else 'menjadikannya relatif stabil untuk investasi.'}"
    )

    # ── Narasi Saham Long-Term ──
    long_dir    = prediction["long_direction"]
    long_ret    = prediction["long_return_pct"]
    long_price  = prediction["long_term_price"]

    long_story = (
        f"Untuk jangka panjang (90 hari ke depan), model memproyeksikan harga {ticker} "
        f"akan {'menguat' if long_dir == 'Naik' else 'melemah' if long_dir == 'Turun' else 'bergerak terbatas'} "
        f"ke kisaran Rp {long_price:,.2f} ({long_ret:+.2f}%). "
    )

    if long_dir == "Naik" and short_dir == "Naik":
        long_story += "Konsistensi tren naik di kedua horizon menunjukkan momentum positif yang lebih meyakinkan."
    elif long_dir != short_dir:
        long_story += (
            f"Perbedaan arah antara prediksi jangka pendek ({short_dir.lower()}) "
            f"dan jangka panjang ({long_dir.lower()}) mengindikasikan potensi pembalikan tren — "
            f"perlu dicermati lebih lanjut."
        )
    else:
        long_story += "Tren konsisten dalam kedua periode menandakan tekanan yang cukup kuat ke arah tersebut."

    # ── Narasi Keuangan ──
    fa_score  = financial["financial_health_score"]
    fa_status = financial["status_kesiapan"]
    reasons   = financial["reasons"]

    financial_story = (
        f"Dari sisi keuangan, skor kesehatan finansialmu adalah {fa_score:.0f}/100 "
        f"dengan status: '{fa_status}'. "
        f"Rinciannya: {' '.join(reasons)}"
    )

    # ── Kesesuaian Risiko ──
    risk_map = {"Low": 0, "Medium": 1, "High": 2}
    stock_risk_num = risk_map.get(risk, 1)
    user_risk_num  = risk_map.get(user_risk_pref, 1)
    risk_aligned   = user_risk_num >= stock_risk_num

    # ── Rekomendasi Akhir ──
    ready = fa_status == "Siap Investasi"

    if not ready:
        final_advice = (
            f"Meskipun prediksi saham {ticker} menunjukkan tren {long_dir.lower()}, "
            f"kondisi keuanganmu saat ini belum optimal untuk berinvestasi. "
            f"Prioritaskan: {reasons[-1].replace('✗ ', '').replace('⚠ ', '')}"
        )
    elif not risk_aligned:
        final_advice = (
            f"Kondisi keuanganmu sudah siap, namun saham {ticker} memiliki risiko {risk.lower()} "
            f"yang lebih tinggi dari preferensimu ({user_risk_pref}). "
            f"Pertimbangkan saham dengan volatilitas lebih rendah, atau mulai dengan alokasi kecil."
        )
    elif long_dir == "Naik":
        final_advice = (
            f"Keuanganmu solid dan model mendeteksi tren positif untuk {ticker}. "
            f"Pastikan tidak mengalokasikan lebih dari 10–20% portofolio ke satu saham, "
            f"dan tetap pantau kondisi pasar secara berkala."
        )
    else:
        final_advice = (
            f"Keuanganmu siap, namun prediksi menunjukkan tekanan {long_dir.lower()} untuk {ticker}. "
            f"Pertimbangkan untuk menunggu konfirmasi tren atau diversifikasi ke instrumen lain."
        )

    # ── Summary ──
    summary = (
        f"Prediksi AI untuk {ticker}: jangka pendek {short_ret:+.2f}% (30 hari), "
        f"jangka panjang {long_ret:+.2f}% (90 hari). "
        f"Kesehatan finansialmu {fa_score:.0f}/100 — {fa_status}."
    )

    return {
        "summary"          : summary,
        "short_term_story" : short_story,
        "long_term_story"  : long_story,
        "financial_story"  : financial_story,
        "final_advice"     : final_advice,
        "ready_to_invest"  : ready and risk_aligned,
        "risk_aligned"     : risk_aligned,
    }


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def _classify_risk(volatility: float) -> str:
    if volatility < 0.015:
        return "Rendah"
    elif volatility < 0.025:
        return "Sedang"
    else:
        return "Tinggi"


def _direction(return_pct: float) -> str:
    if return_pct > 1.0:
        return "Naik"
    elif return_pct < -1.0:
        return "Turun"
    else:
        return "Sideways"


# =========================================================
# DEMO / TEST — jalankan langsung untuk cek
# =========================================================

if __name__ == "__main__":
    print("="*55)
    print("DEMO: Insight Generator (tanpa model, pakai mock data)")
    print("="*55)

    # Mock prediction result (setelah training selesai, ini dari predictor)
    mock_prediction = {
        "current_price"    : 9250.0,
        "short_term_price" : 9580.0,
        "long_term_price"  : 10200.0,
        "short_return_pct" : 3.57,
        "long_return_pct"  : 10.27,
        "volatility"       : 1.85,
        "risk_level"       : "Sedang",
        "short_direction"  : "Naik",
        "long_direction"   : "Naik",
    }

    # Mock profil keuangan user
    mock_profile = {
        "monthly_income"        : 8_000_000,
        "monthly_expense_total" : 4_500_000,
        "emergency_fund"        : 30_000_000,
        "debt_to_income_ratio"  : 0.20,
    }

    # Analisis keuangan
    financial = analyze_financial_profile(mock_profile)
    print(f"\nFinancial Health Score : {financial['financial_health_score']}/100")
    print(f"Status                 : {financial['status_kesiapan']}")

    # Generate insight
    insight = generate_full_insight(
        prediction     = mock_prediction,
        financial      = financial,
        ticker         = "BBCA.JK",
        user_risk_pref = "Medium"
    )

    print(f"\n── SUMMARY ──")
    print(insight["summary"])
    print(f"\n── SHORT-TERM ──")
    print(insight["short_term_story"])
    print(f"\n── LONG-TERM ──")
    print(insight["long_term_story"])
    print(f"\n── KEUANGAN ──")
    print(insight["financial_story"])
    print(f"\n── REKOMENDASI AKHIR ──")
    print(insight["final_advice"])
    print(f"\nSiap Investasi: {insight['ready_to_invest']}")
