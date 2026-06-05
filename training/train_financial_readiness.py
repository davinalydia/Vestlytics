"""
train_financial_readiness.py
------------------------------------------------------
Training Financial Readiness Model (KMeans)

Output:
    models/financial_readiness_kmeans.pkl
    models/financial_readiness_scaler.pkl

Run:
    python training/train_financial_readiness.py
"""

from pathlib import Path
import joblib
import pandas as pd

from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import silhouette_score

# =====================================================
# CONFIG
# =====================================================

N_CLUSTERS = 3

CLUSTER_MAPPING = {
    0: "Siap Investasi (Agresif)",
    1: "Belum Siap Investasi",
    2: "Siap Investasi (Konservatif)"
}

FEATURES = [
    "investment_amount",
    "debt_to_income_ratio",
    "score_emergency"
]


# =====================================================
# LOAD DATA
# =====================================================

def load_dataset(path: Path):
    if not path.exists():
        raise FileNotFoundError(f"File dataset tidak ditemukan di: {path}")

    df = pd.read_csv(path)

    print(f"\nDataset Loaded : {path}")
    print(f"Rows           : {len(df):,}")
    print(f"Columns        : {len(df.columns)}")

    return df


# =====================================================
# FEATURE ENGINEERING
# =====================================================

def prepare_features(df):
    # Rasio Dana Darurat
    df["Rasio Dana Darurat"] = (
        df["emergency_fund"] / df["monthly_expense_total"]
    ).fillna(0)

    # Emergency Score
    df["score_emergency"] = (
        (df["Rasio Dana Darurat"] / 6) * 40
    ).clip(upper=40)

    # Outlier Handling
    for col in FEATURES:
        upper_limit = df[col].quantile(0.95)
        df[col] = df[col].clip(upper=upper_limit)

    return df


# =====================================================
# TRAIN
# =====================================================

def train_model(df):
    X = df[FEATURES].copy()

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    model = KMeans(
        n_clusters=N_CLUSTERS,
        random_state=42,
        n_init=10
    )

    clusters = model.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, clusters)

    print(f"\nSilhouette Score : {score:.4f}")

    df["cluster"] = clusters

    print("\nCluster Distribution:")
    print(
        df["cluster"]
        .value_counts()
        .sort_index()
    )

    return model, scaler


# =====================================================
# SAVE
# =====================================================

def save_artifacts(model, scaler, model_path, scaler_path):
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)

    print(f"\nModel Saved  : {model_path}")
    print(f"Scaler Saved : {scaler_path}")


# =====================================================
# MAIN
# =====================================================

def main():
    # Menentukan BASE_DIR secara otomatis berdasarkan letak file script ini
    BASE_DIR = Path(__file__).resolve().parent.parent

    # Path dataset disesuaikan agar rapi
    dataset_path = BASE_DIR / "data" / "financial_data" / "dataset_keuangan.csv"
    models_dir = BASE_DIR / "models"

    # Membuat folder models jika belum ada
    models_dir.mkdir(parents=True, exist_ok=True)

    model_path = models_dir / "financial_readiness_kmeans.pkl"
    scaler_path = models_dir / "financial_readiness_scaler.pkl"

    # Jalankan Pipeline Training
    df = load_dataset(dataset_path)
    df = prepare_features(df)
    model, scaler = train_model(df)
    
    save_artifacts(model, scaler, model_path, scaler_path)

    print("\n===================================")
    print("TRAINING FINANCIAL READINESS DONE")
    print("===================================")


if __name__ == "__main__":
    main()