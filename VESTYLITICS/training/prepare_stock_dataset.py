"""
STEP 1 — prepare_stock_dataset.py
--------------------------------------------------
Siapkan dataset untuk 2 model LSTM:
  - Short-Medium Term : prediksi 30 hari ke depan  (window 30 hari)
  - Long Term         : prediksi 90 hari ke depan  (window 60 hari)

Jalankan PERTAMA sebelum training:
    cd training
    python prepare_stock_dataset.py

Output:
    data/processed/short_term_sequences.npz
    data/processed/long_term_sequences.npz
    data/processed/scaler_short.pkl
    data/processed/scaler_long.pkl
"""

from pathlib import Path
import numpy as np
import pandas as pd
import joblib
from sklearn.preprocessing import MinMaxScaler


# =========================================================
# CONFIG
# =========================================================

# Kolom yang ADA di lq45_feature_engineering.csv (sudah dicek)
FEATURE_COLS = [
    "Close", "Open", "High", "Low", "Volume",
    "Return", "Volatility", "Volatility_30",
    "MA7", "MA20", "MA30", "MA5",
    "Price_Range", "Price_Change",
    "Close_Lag_1", "Momentum_7", "Relative_Volume"
]

SHORT_WINDOW  = 30    # lookback 30 hari
LONG_WINDOW   = 60    # lookback 60 hari
SHORT_HORIZON = 30    # prediksi 30 hari ke depan (short-medium)
LONG_HORIZON  = 90    # prediksi 90 hari ke depan (long)
TEST_RATIO    = 0.2


# =========================================================
# 1. LOAD
# =========================================================

def load_dataset(data_path: str) -> pd.DataFrame:
    df = pd.read_csv(data_path, parse_dates=["Date"])
    print(f"✓ Dataset dimuat: {df.shape[0]:,} rows | {df['Ticker'].nunique()} tickers")
    print(f"  Periode: {df['Date'].min().date()} → {df['Date'].max().date()}")
    return df


def select_features(df: pd.DataFrame) -> list:
    available = [c for c in FEATURE_COLS if c in df.columns]
    missing   = [c for c in FEATURE_COLS if c not in df.columns]
    if missing:
        print(f"  [INFO] Kolom tidak ada (dilewati): {missing}")
    print(f"  ✓ Features dipakai ({len(available)}): {available}")
    return available


# =========================================================
# 2. SCALER
# =========================================================

def fit_scaler(df: pd.DataFrame, feature_cols: list, scaler_path: str):
    """
    Fit scaler di seluruh data.
    Scaler WAJIB disimpan — dipakai lagi saat inference (predict data baru).
    """
    scaler = MinMaxScaler()
    scaler.fit(df[feature_cols].dropna())
    joblib.dump(scaler, scaler_path)
    print(f"  ✓ Scaler disimpan: {scaler_path}")
    return scaler


# =========================================================
# 3. BUAT SEQUENCES (WINDOWING)
# =========================================================

def create_sequences(df_ticker, feature_cols, window_size, horizon):
    """
    Sliding window untuk satu ticker.
    X : (samples, window_size, n_features)
    y : harga Close 'horizon' hari ke depan (sudah normalized)
    """
    df_ticker = df_ticker.dropna(subset=feature_cols).reset_index(drop=True)
    values    = df_ticker[feature_cols].values
    close_idx = feature_cols.index("Close")

    X_list, y_list = [], []
    for i in range(window_size, len(df_ticker) - horizon):
        X_list.append(values[i - window_size : i])
        y_list.append(values[i + horizon - 1][close_idx])

    if not X_list:
        return None, None
    return np.array(X_list, dtype=np.float32), np.array(y_list, dtype=np.float32)


def build_all_sequences(df, feature_cols, scaler, window_size, horizon, label):
    """Proses semua ticker lalu gabungkan — jangan mix antar ticker sebelum windowing."""
    all_X, all_y = [], []
    print(f"\n  Membuat sequences [{label}] window={window_size}, horizon={horizon} hari...")

    for ticker in df["Ticker"].unique():
        df_t = df[df["Ticker"] == ticker].sort_values("Date").reset_index(drop=True)
        # Scale per ticker menggunakan scaler yang sudah di-fit
        df_t[feature_cols] = scaler.transform(df_t[feature_cols])
        X, y = create_sequences(df_t, feature_cols, window_size, horizon)
        if X is not None:
            all_X.append(X)
            all_y.append(y)

    X_all = np.concatenate(all_X)
    y_all = np.concatenate(all_y)
    print(f"  ✓ Total: X={X_all.shape}, y={y_all.shape}")
    return X_all, y_all


# =========================================================
# 4. SPLIT & SIMPAN
# =========================================================

def temporal_split(X, y):
    split = int(len(X) * (1 - TEST_RATIO))
    return X[:split], X[split:], y[:split], y[split:]


def save_sequences(X_train, X_test, y_train, y_test, path):
    np.savez(path, X_train=X_train, X_test=X_test,
             y_train=y_train, y_test=y_test)
    print(f"  ✓ Disimpan: {path}")


# =========================================================
# MAIN
# =========================================================

def main():
    data_path  = Path("../data/stock_data/lq45_feature_engineering.csv")
    output_dir = Path("../data/processed")
    output_dir.mkdir(parents=True, exist_ok=True)

    df           = load_dataset(str(data_path))
    feature_cols = select_features(df)

    # Fit scaler terpisah untuk short dan long
    print("\nFitting scalers...")
    scaler_short = fit_scaler(df, feature_cols, str(output_dir / "scaler_short.pkl"))
    scaler_long  = fit_scaler(df, feature_cols, str(output_dir / "scaler_long.pkl"))

    # Short-Medium Term
    print("\n── SHORT-MEDIUM TERM ──")
    X_s, y_s = build_all_sequences(df, feature_cols, scaler_short,
                                    SHORT_WINDOW, SHORT_HORIZON, "short")
    Xs_tr, Xs_te, ys_tr, ys_te = temporal_split(X_s, y_s)
    save_sequences(Xs_tr, Xs_te, ys_tr, ys_te, str(output_dir / "short_term_sequences.npz"))

    # Long Term
    print("\n── LONG TERM ──")
    X_l, y_l = build_all_sequences(df, feature_cols, scaler_long,
                                    LONG_WINDOW, LONG_HORIZON, "long")
    Xl_tr, Xl_te, yl_tr, yl_te = temporal_split(X_l, y_l)
    save_sequences(Xl_tr, Xl_te, yl_tr, yl_te, str(output_dir / "long_term_sequences.npz"))

    print("\n" + "="*50)
    print("✓ PREPARE SELESAI — lanjut ke STEP 2:")
    print("  python train_stock_forecasting_model.py")
    print("="*50)
    print(f"\n  Catat ini untuk training:")
    print(f"  n_features  = {len(feature_cols)}")
    print(f"  SHORT window= {SHORT_WINDOW}, horizon= {SHORT_HORIZON} hari")
    print(f"  LONG  window= {LONG_WINDOW},  horizon= {LONG_HORIZON} hari")


if __name__ == "__main__":
    main()
