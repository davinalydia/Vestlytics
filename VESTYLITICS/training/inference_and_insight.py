"""
inference_and_insight.py  (FINAL VERSION)
--------------------------------------------------
Load model .keras yang sudah ditraining dan jalankan
prediksi real untuk ticker + profil keuangan user.

Dipakai oleh Backend (FastAPI) sebagai core logic.

Cara pakai:
    cd training
    python inference_and_insight.py

Atau di-import dari Backend:
    from inference_and_insight import VestlyticsEngine
    engine = VestlyticsEngine()
    result = engine.run(ticker="BBCA.JK", financial_profile={...})
"""

from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import tensorflow as tf


# =========================================================
# PATH CONFIG
# =========================================================

BASE_DIR          = Path(__file__).parent.parent
MODEL_SHORT_PATH  = BASE_DIR / "models" / "model_short_term.keras"
MODEL_LONG_PATH   = BASE_DIR / "models" / "model_long_term.keras"
SCALER_SHORT_PATH = BASE_DIR / "data" / "processed" / "scaler_short.pkl"
SCALER_LONG_PATH  = BASE_DIR / "data" / "processed" / "scaler_long.pkl"
STOCK_DATA_PATH   = BASE_DIR / "data" / "stock_data" / "lq45_feature_engineering.csv"

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
# MAIN ENGINE
# =========================================================

class VestlyticsEngine:
    """
    Core engine — load model sekali, prediksi berkali-kali.

    Contoh:
        engine = VestlyticsEngine()
        result = engine.run(
            ticker            = "BBCA.JK",
            financial_profile = {
                "monthly_income"        : 8_000_000,
                "monthly_expense_total" : 4_500_000,
                "emergency_fund"        : 30_000_000,
                "debt_to_income_ratio"  : 0.20,
            },
            user_risk_pref = "Medium"
        )
    """

    def __init__(self):
        self._check_files()
        print("Memuat model Vestlytics...")
        self.model_short  = tf.keras.models.load_model(str(MODEL_SHORT_PATH))
        self.model_long   = tf.keras.models.load_model(str(MODEL_LONG_PATH))
        self.scaler_short = joblib.load(str(SCALER_SHORT_PATH))
        self.scaler_long  = joblib.load(str(SCALER_LONG_PATH))
        print("✓ Model berhasil dimuat.\n")

        print("Memuat data saham LQ45...")
        self.df_stock = pd.read_csv(str(STOCK_DATA_PATH), parse_dates=["Date"])
        self.available_tickers = sorted(self.df_stock["Ticker"].unique().tolist())
        print(f"✓ {len(self.df_stock):,} rows | {len(self.available_tickers)} tickers\n")

    def _check_files(self):
        required = {
            "Model short-term" : MODEL_SHORT_PATH,
            "Model long-term"  : MODEL_LONG_PATH,
            "Scaler short"     : SCALER_SHORT_PATH,
            "Scaler long"      : SCALER_LONG_PATH,
            "Data saham"       : STOCK_DATA_PATH,
        }
        missing = [n for n, p in required.items() if not p.exists()]
        if missing:
            raise FileNotFoundError(
                "File berikut tidak ditemukan:\n"
                + "\n".join(f"  - {m}" for m in missing)
                + "\n\nPastikan sudah menjalankan:\n"
                + "  1. python prepare_stock_dataset.py\n"
                + "  2. python train_stock_forecasting_model.py"
            )

    def _get_ticker_df(self, ticker: str) -> pd.DataFrame:
        ticker = ticker.upper()
        if not ticker.endswith(".JK"):
            ticker += ".JK"
        if ticker not in self.available_tickers:
            raise ValueError(
                f"Ticker '{ticker}' tidak tersedia.\n"
                f"Contoh yang ada: {self.available_tickers[:5]}"
            )
        return self.df_stock[self.df_stock["Ticker"] == ticker].sort_values("Date").reset_index(drop=True)

    def _make_window(self, df, scaler, window_size):
        feat = [c for c in FEATURE_COLS if c in df.columns]
        df_c = df.dropna(subset=feat)
        if len(df_c) < window_size:
            raise ValueError(f"Data tidak cukup: butuh {window_size}, ada {len(df_c)}")
        w = scaler.transform(df_c[feat].values[-window_size:])
        return w.reshape(1, window_size, len(feat)), len(feat)

    def _inv_close(self, val, scaler, n_feat):
        dummy = np.zeros((1, n_feat))
        dummy[0, 0] = val
        return float(scaler.inverse_transform(dummy)[0, 0])

    def predict_stock(self, ticker: str) -> dict:
        df = self._get_ticker_df(ticker)

        X_s, n = self._make_window(df, self.scaler_short, SHORT_WINDOW)
        s_price = self._inv_close(float(self.model_short.predict(X_s, verbose=0)[0][0]), self.scaler_short, n)

        X_l, n = self._make_window(df, self.scaler_long, LONG_WINDOW)
        l_price = self._inv_close(float(self.model_long.predict(X_l, verbose=0)[0][0]), self.scaler_long, n)

        curr      = float(df["Close"].iloc[-1])
        last_date = str(df["Date"].iloc[-1].date())
        vol       = float(df["Volatility"].iloc[-1]) if "Volatility" in df.columns else 0.02
        s_ret     = (s_price - curr) / curr * 100
        l_ret     = (l_price - curr) / curr * 100

        return {
            "ticker"           : ticker,
            "last_date"        : last_date,
            "current_price"    : round(curr, 2),
            "short_term_price" : round(s_price, 2),
            "long_term_price"  : round(l_price, 2),
            "short_return_pct" : round(s_ret, 2),
            "long_return_pct"  : round(l_ret, 2),
            "short_horizon"    : SHORT_HORIZON,
            "long_horizon"     : LONG_HORIZON,
            "volatility_pct"   : round(vol * 100, 2),
            "risk_level"       : _classify_risk(vol),
            "short_direction"  : _direction(s_ret),
            "long_direction"   : _direction(l_ret),
        }

    def run(self, ticker: str, financial_profile: dict, user_risk_pref: str = "Medium") -> dict:
        prediction = self.predict_stock(ticker)
        financial  = analyze_financial_profile(financial_profile)
        insight    = generate_insight(prediction, financial, ticker, user_risk_pref)
        return {"prediction": prediction, "financial": financial, "insight": insight}


# =========================================================
# FINANCIAL ANALYZER
# =========================================================

def analyze_financial_profile(profile: dict) -> dict:
    income  = max(profile.get("monthly_income", 1), 1)
    expense = max(profile.get("monthly_expense_total", 1), 1)
    ef      = profile.get("emergency_fund", 0)
    dti     = profile.get("debt_to_income_ratio", 0)

    reasons = []
    score   = 0.0

    # Dana darurat (40 poin)
    rasio_ef = ef / expense
    if rasio_ef >= 6:
        score += 40
        reasons.append(f"✓ Dana darurat sangat sehat ({rasio_ef:.1f}x pengeluaran). Fondasi investasi yang kuat.")
    elif rasio_ef >= 3:
        score += 25
        reasons.append(f"⚠ Dana darurat cukup ({rasio_ef:.1f}x), idealnya 6x pengeluaran bulanan.")
    else:
        score += max(rasio_ef / 3 * 10, 0)
        reasons.append(f"✗ Dana darurat belum aman ({rasio_ef:.1f}x dari target 3–6x). Prioritaskan ini dulu.")

    # Rasio utang (30 poin)
    if dti <= 0.30:
        score += 30
        reasons.append(f"✓ Rasio utang sehat ({dti*100:.0f}% pendapatan). Kewajiban cicilan tidak membebani.")
    elif dti <= 0.50:
        score += 15
        reasons.append(f"⚠ Rasio utang perlu diperhatikan ({dti*100:.0f}%). Cicil secara konsisten.")
    else:
        score += 0
        reasons.append(f"✗ Rasio utang terlalu tinggi ({dti*100:.0f}%). Fokus lunasi utang dulu.")

    # Cash flow (30 poin)
    cash_flow = income - expense
    cf_ratio  = cash_flow / income
    if cf_ratio >= 0.20:
        score += 30
        reasons.append(f"✓ Cash flow positif (surplus Rp {cash_flow:,.0f}/bulan). Ada ruang investasi rutin.")
    elif cf_ratio > 0:
        score += 15
        reasons.append(f"⚠ Surplus tipis (Rp {cash_flow:,.0f}/bulan). Mulai investasi dengan jumlah kecil.")
    else:
        score += 0
        reasons.append(f"✗ Cash flow negatif (defisit Rp {abs(cash_flow):,.0f}/bulan). Perbaiki pengeluaran dulu.")

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
# INSIGHT GENERATOR
# =========================================================

def generate_insight(prediction, financial, ticker, user_risk_pref="Medium") -> dict:
    curr    = prediction["current_price"]
    s_price = prediction["short_term_price"]
    l_price = prediction["long_term_price"]
    s_ret   = prediction["short_return_pct"]
    l_ret   = prediction["long_return_pct"]
    s_dir   = prediction["short_direction"]
    l_dir   = prediction["long_direction"]
    vol     = prediction["volatility_pct"]
    risk    = prediction["risk_level"]
    s_days  = prediction["short_horizon"]
    l_days  = prediction["long_horizon"]
    last_dt = prediction["last_date"]

    fa_score = financial["financial_health_score"]
    fa_stat  = financial["status_kesiapan"]
    reasons  = financial["reasons"]
    cf       = financial["cash_flow"]

    risk_map      = {"Rendah": 0, "Sedang": 1, "Tinggi": 2}
    user_risk_map = {"Low": 0, "Medium": 1, "High": 2}
    risk_aligned  = user_risk_map.get(user_risk_pref, 1) >= risk_map.get(risk, 1)
    ready         = fa_stat == "Siap Investasi"

    # Short-term story
    arah_s = "naik" if s_dir == "Naik" else "turun" if s_dir == "Turun" else "bergerak sideways"
    short_term_story = (
        f"Berdasarkan analisis model AI dari data historis {ticker} hingga {last_dt}, "
        f"harga diprediksi akan {arah_s} dalam {s_days} hari ke depan. "
        f"Dari Rp {curr:,.2f} → Rp {s_price:,.2f} ({s_ret:+.2f}%). "
    )
    if s_dir == "Naik":
        short_term_story += "Momentum positif terdeteksi dari pola 30 hari terakhir."
    elif s_dir == "Turun":
        short_term_story += "Ada tekanan jual jangka pendek — pertimbangkan tunggu konfirmasi tren dulu."
    else:
        short_term_story += "Pasar dalam fase konsolidasi, belum ada sinyal arah yang kuat."

    # Long-term story
    arah_l = "menguat" if l_dir == "Naik" else "melemah" if l_dir == "Turun" else "bergerak terbatas"
    long_term_story = (
        f"Jangka panjang ({l_days} hari): {ticker} diproyeksikan {arah_l} "
        f"ke Rp {l_price:,.2f} ({l_ret:+.2f}%). "
    )
    if l_dir == s_dir == "Naik":
        long_term_story += "Tren naik konsisten di kedua horizon — sinyal momentum yang kuat."
    elif l_dir == s_dir == "Turun":
        long_term_story += "Tekanan turun konsisten di kedua horizon — sentimen negatif cukup kuat."
    elif l_dir != s_dir:
        long_term_story += (
            f"Arah berbeda antara jangka pendek ({s_dir}) dan panjang ({l_dir}) — "
            f"{'koreksi pendek bisa jadi peluang beli.' if l_dir == 'Naik' else 'kenaikan pendek mungkin tidak berlanjut, hati-hati.'}"
        )
    long_term_story += (
        f" Volatilitas: {vol:.2f}% (risiko {risk.lower()}) — "
        f"{'fluktuasi besar, perlu pantau aktif.' if risk == 'Tinggi' else 'wajar untuk investor moderat.' if risk == 'Sedang' else 'relatif stabil.'}"
    )

    # Financial story
    financial_story = (
        f"Skor kesehatan finansial: {fa_score:.0f}/100 — '{fa_stat}'.\n"
        + "\n".join(f"  {r}" for r in reasons)
    )
    if cf > 0:
        financial_story += f"\n  → Potensi investasi aman: ~Rp {cf*0.3:,.0f}/bulan (30% surplus)."

    # Final advice
    if not ready:
        final_advice = (
            f"Prediksi {ticker} menunjukkan tren {l_dir.lower()}, namun kondisi keuangan "
            f"belum optimal. Prioritaskan: {reasons[-1].split('.')[0].replace('✗ ','').replace('⚠ ','')}."
        )
    elif not risk_aligned:
        final_advice = (
            f"Keuangan siap ({fa_score:.0f}/100), tapi risiko {ticker} ({risk.lower()}) "
            f"lebih tinggi dari preferensimu ({user_risk_pref}). "
            f"Cari saham volatilitas lebih rendah, atau mulai dengan alokasi kecil."
        )
    elif l_dir == "Naik":
        final_advice = (
            f"Keuangan solid ({fa_score:.0f}/100) + tren positif {ticker}. "
            f"Gunakan hanya uang dingin, maksimal 10–20% portofolio per saham, "
            f"dan pantau pasar secara berkala."
        )
    else:
        final_advice = (
            f"Keuangan siap ({fa_score:.0f}/100), namun tren {ticker} menunjukkan "
            f"tekanan {l_dir.lower()} jangka panjang. "
            f"Pertimbangkan tunggu konfirmasi atau diversifikasi ke instrumen lain."
        )

    summary = (
        f"[{ticker}] {s_days}hr: {s_ret:+.2f}% ({s_dir}) | "
        f"{l_days}hr: {l_ret:+.2f}% ({l_dir}) | "
        f"Risiko: {risk} | Finansial: {fa_score:.0f}/100 — {fa_stat}"
    )

    return {
        "summary"          : summary,
        "short_term_story" : short_term_story,
        "long_term_story"  : long_term_story,
        "financial_story"  : financial_story,
        "final_advice"     : final_advice,
        "ready_to_invest"  : ready and risk_aligned,
        "risk_aligned"     : risk_aligned,
    }


# =========================================================
# HELPER
# =========================================================

def _classify_risk(vol):
    if vol < 0.015:   return "Rendah"
    elif vol < 0.025: return "Sedang"
    else:             return "Tinggi"

def _direction(ret):
    if ret > 1.0:    return "Naik"
    elif ret < -1.0: return "Turun"
    else:            return "Sideways"


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":
    print("=" * 55)
    print("Vestlytics — Inference dengan Model Asli")
    print("=" * 55)

    engine = VestlyticsEngine()

    # Profil keuangan contoh
    financial_profile = {
        "monthly_income"        : 8_000_000,
        "monthly_expense_total" : 4_500_000,
        "emergency_fund"        : 30_000_000,
        "debt_to_income_ratio"  : 0.20,
    }

    # ── Test satu ticker utama ──
    ticker = "BBCA.JK"
    print(f"\nMemprediksi: {ticker}\n")

    result = engine.run(ticker, financial_profile, user_risk_pref="Medium")

    pred = result["prediction"]
    ins  = result["insight"]

    print("=" * 55)
    print("PREDIKSI HARGA")
    print("=" * 55)
    print(f"  Harga terkini  : Rp {pred['current_price']:>12,.2f}  ({pred['last_date']})")
    print(f"  Prediksi 30hr  : Rp {pred['short_term_price']:>12,.2f}  ({pred['short_return_pct']:+.2f}%) → {pred['short_direction']}")
    print(f"  Prediksi 90hr  : Rp {pred['long_term_price']:>12,.2f}  ({pred['long_return_pct']:+.2f}%) → {pred['long_direction']}")
    print(f"  Volatilitas    : {pred['volatility_pct']:.2f}% ({pred['risk_level']})")

    print("\n" + "=" * 55)
    print("INSIGHT")
    print("=" * 55)
    print(f"\n[SUMMARY]\n{ins['summary']}")
    print(f"\n[SHORT-TERM]\n{ins['short_term_story']}")
    print(f"\n[LONG-TERM]\n{ins['long_term_story']}")
    print(f"\n[KEUANGAN]\n{ins['financial_story']}")
    print(f"\n[REKOMENDASI]\n{ins['final_advice']}")
    print(f"\n  Siap Investasi : {ins['ready_to_invest']}")

    # ── Quick check beberapa ticker ──
    print("\n" + "=" * 55)
    print("QUICK CHECK — Beberapa Ticker")
    print("=" * 55)
    for t in ["BBRI.JK", "TLKM.JK", "BMRI.JK", "ASII.JK"]:
        try:
            r = engine.run(t, financial_profile)
            p = r["prediction"]
            print(f"  {t:12} | Rp {p['current_price']:>9,.0f} | "
                  f"30d: {p['short_return_pct']:>+6.2f}% {p['short_direction']:8} | "
                  f"90d: {p['long_return_pct']:>+6.2f}% {p['long_direction']}")
        except Exception as e:
            print(f"  {t}: Error — {e}")
