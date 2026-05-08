"""
STEP 2 — train_stock_forecasting_model.py
--------------------------------------------------
Train 2 model LSTM menggunakan TensorFlow Functional API:
  - Model Short-Medium Term (prediksi 30 hari)
  - Model Long Term         (prediksi 90 hari)

Jalankan SETELAH prepare_stock_dataset.py:
    cd training
    python train_stock_forecasting_model.py

Output:
    models/model_short_term.keras
    models/model_long_term.keras

Monitor training:
    tensorboard --logdir ../logs
"""

from pathlib import Path
import numpy as np
import tensorflow as tf
from tensorflow import keras


# =========================================================
# CONFIG HYPERPARAMETER
# =========================================================

SHORT_CONFIG = {
    "window_size"   : 30,
    "lstm_units"    : [128, 64],
    "dropout"       : 0.2,
    "learning_rate" : 0.001,
    "epochs"        : 50,
    "batch_size"    : 64,
    "patience"      : 10,
    "model_name"    : "model_short_term",
}

LONG_CONFIG = {
    "window_size"   : 60,
    "lstm_units"    : [256, 128, 64],   # lebih dalam untuk pola jangka panjang
    "dropout"       : 0.3,
    "learning_rate" : 0.0005,
    "epochs"        : 80,
    "batch_size"    : 32,
    "patience"      : 15,
    "model_name"    : "model_long_term",
}


# =========================================================
# 1. LOAD SEQUENCES
# =========================================================

def load_sequences(npz_path: str):
    data = np.load(npz_path)
    X_train = data["X_train"]
    X_test  = data["X_test"]
    y_train = data["y_train"]
    y_test  = data["y_test"]
    print(f"  ✓ Loaded: {npz_path}")
    print(f"    X_train={X_train.shape}, X_test={X_test.shape}")
    return X_train, X_test, y_train, y_test


# =========================================================
# 2. BUILD MODEL — TensorFlow Functional API
# =========================================================

def build_model(window_size: int, n_features: int, config: dict) -> keras.Model:
    """
    Arsitektur LSTM-GRU Hybrid dengan TensorFlow Functional API.

    Struktur:
      Input → LSTM(128, return_seq=True) → Dropout
            → LSTM(64)                   → Dropout
            → Dense(32, relu)
            → BatchNorm
            → Dense(1)  [output: harga Close normalized]
    """
    inputs = keras.Input(shape=(window_size, n_features), name="input")
    x = inputs

    units = config["lstm_units"]

    # LSTM layers
    for i, u in enumerate(units[:-1]):
        x = keras.layers.LSTM(
            u,
            return_sequences=True,
            kernel_regularizer=keras.regularizers.l2(1e-4),
            name=f"lstm_{i+1}"
        )(x)
        x = keras.layers.Dropout(config["dropout"], name=f"drop_{i+1}")(x)

    # Layer LSTM terakhir (return_sequences=False)
    x = keras.layers.LSTM(
        units[-1],
        return_sequences=False,
        name=f"lstm_{len(units)}"
    )(x)
    x = keras.layers.Dropout(config["dropout"], name=f"drop_{len(units)}")(x)

    # Dense head
    x = keras.layers.Dense(32, activation="relu", name="dense_1")(x)
    x = keras.layers.BatchNormalization(name="batch_norm")(x)
    output = keras.layers.Dense(1, name="output")(x)

    model = keras.Model(inputs=inputs, outputs=output, name=config["model_name"])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=config["learning_rate"]),
        loss="mae",
        metrics=["mae", "mse"]
    )

    return model


# =========================================================
# 3. CALLBACKS
# =========================================================

def get_callbacks(model_path: str, log_dir: str, patience: int) -> list:
    return [
        keras.callbacks.EarlyStopping(
            monitor="val_mae",
            patience=patience,
            restore_best_weights=True,
            verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_mae",
            factor=0.5,
            patience=patience // 2,
            min_lr=1e-6,
            verbose=1
        ),
        keras.callbacks.ModelCheckpoint(
            filepath=model_path,
            monitor="val_mae",
            save_best_only=True,
            verbose=1
        ),
        keras.callbacks.TensorBoard(
            log_dir=log_dir,
            histogram_freq=1
        )
    ]


# =========================================================
# 4. TRAIN SATU MODEL
# =========================================================

def train_one_model(
    label: str,
    npz_path: str,
    config: dict,
    output_dir: Path,
    log_base: Path
):
    print(f"\n{'='*55}")
    print(f"  TRAINING: {label.upper()}")
    print(f"{'='*55}")

    # Load data
    X_train, X_test, y_train, y_test = load_sequences(npz_path)

    n_features  = X_train.shape[2]
    window_size = X_train.shape[1]

    # Build
    model = build_model(window_size, n_features, config)
    model.summary()

    # Paths
    model_path = str(output_dir / f"{config['model_name']}.keras")
    log_dir    = str(log_base / config["model_name"])

    # Train
    print(f"\n  Mulai training... (target MAE < 0.02)\n")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=config["epochs"],
        batch_size=config["batch_size"],
        callbacks=get_callbacks(model_path, log_dir, config["patience"]),
        verbose=1
    )

    # Evaluate
    results  = model.evaluate(X_test, y_test, verbose=0)
    test_mae = results[1]
    test_mse = results[2]

    print(f"\n  ── Hasil Evaluasi [{label}] ──")
    print(f"  Test MAE : {test_mae:.4f} {'✓ TARGET TERCAPAI' if test_mae < 0.02 else '→ Coba tuning hyperparameter'}")
    print(f"  Test MSE : {test_mse:.4f}")
    print(f"  Model    : {model_path}")

    return model, history


# =========================================================
# MAIN
# =========================================================

def main():
    processed_dir = Path("../data/processed")
    output_dir    = Path("../models")
    log_dir       = Path("../logs")

    output_dir.mkdir(parents=True, exist_ok=True)
    log_dir.mkdir(parents=True, exist_ok=True)

    short_npz = processed_dir / "short_term_sequences.npz"
    long_npz  = processed_dir / "long_term_sequences.npz"

    # Cek file ada
    for f in [short_npz, long_npz]:
        if not f.exists():
            raise FileNotFoundError(
                f"File tidak ditemukan: {f}\n"
                "Jalankan dulu: python prepare_stock_dataset.py"
            )

    # Train Short-Medium Term
    train_one_model(
        label      = "Short-Medium Term (30 hari)",
        npz_path   = str(short_npz),
        config     = SHORT_CONFIG,
        output_dir = output_dir,
        log_base   = log_dir
    )

    # Train Long Term
    train_one_model(
        label      = "Long Term (90 hari)",
        npz_path   = str(long_npz),
        config     = LONG_CONFIG,
        output_dir = output_dir,
        log_base   = log_dir
    )

    print(f"\n{'='*55}")
    print("✓ TRAINING SELESAI — lanjut ke STEP 3:")
    print("  python inference_and_insight.py")
    print(f"{'='*55}")
    print(f"\nUntuk monitor training:")
    print(f"  tensorboard --logdir ../logs")


if __name__ == "__main__":
    print("\nVestlytics — Training Stock Forecasting Models\n")
    main()
