"""
Customer Churn Prediction Script
================================
This script loads customer data, preprocesses it, trains multiple ML models,
evaluates their performance, and saves the best model along with a scaler.
"""

import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# =============================================================================
# CONFIGURATION
# =============================================================================

DATA_PATH = "WA_Fn-UseC_-Telco-Customer-Churn.csv"
RANDOM_STATE = 42
TEST_SIZE = 0.2


# =============================================================================
# DATA LOADING
# =============================================================================

def load_data(filepath):
    """Load the dataset from a CSV file."""
    print(f"Loading data from {filepath}...")
    df = pd.read_csv(filepath)
    print(f"Loaded {len(df)} rows and {len(df.columns)} columns")
    return df


# =============================================================================
# DATA PREPROCESSING
# =============================================================================

def preprocess_data(df):
    """Clean and preprocess the data for model training."""
    print("\nPreprocessing data...")
    
    # Create a copy to avoid modifying original data
    df = df.copy()
    
    # Drop customerID column - it's an identifier, not a feature
    if 'customerID' in df.columns:
        df = df.drop(columns=['customerID'])
        print("Dropped 'customerID' column")
    
    # Convert TotalCharges to numeric (contains blank spaces)
    if 'TotalCharges' in df.columns:
        df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
        print("Converted 'TotalCharges' to numeric")
    
    # Display initial info
    print(f"Initial shape: {df.shape}")
    print(f"Missing values per column:\n{df.isnull().sum()[df.isnull().sum() > 0]}")
    
    # Handle missing values - fill numeric with median, categorical with mode
    for col in df.columns:
        if df[col].dtype in ['int64', 'float64']:
            df[col] = df[col].fillna(df[col].median())
        else:
            df[col] = df[col].fillna(df[col].mode()[0])
    
    # Identify categorical and numeric columns
    categorical_cols = df.select_dtypes(include=['object', 'string']).columns.tolist()
    numeric_cols = df.select_dtypes(include=['int64', 'float64', 'int32', 'float32']).columns.tolist()
    
    # Remove target column from features if it's categorical
    target_col = None
    if 'Churn' in df.columns:
        target_col = 'Churn'
    elif 'churn' in df.columns:
        target_col = 'churn'
    
    if target_col and target_col in categorical_cols:
        categorical_cols.remove(target_col)
    
    print(f"Categorical columns: {categorical_cols}")
    print(f"Numeric columns: {numeric_cols}")
    
    # Encode categorical variables using Label Encoding
    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le
        print(f"Encoded '{col}': {len(le.classes_)} unique values")
    
    return df, label_encoders


def prepare_features_target(df):
    """Separate features (X) and target (y)."""
    # Try common target column names
    target_col = None
    for col in ['Churn', 'churn', 'Target', 'target', 'Exited']:
        if col in df.columns:
            target_col = col
            break
    
    if target_col is None:
        raise ValueError("Could not find target column. Please ensure your dataset has a 'Churn' column.")
    
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    print(f"\nFeatures shape: {X.shape}")
    print(f"Target distribution:\n{y.value_counts()}")
    
    return X, y, target_col


def scale_features(X_train, X_test):
    """Scale numeric features using StandardScaler."""
    print("\nScaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    print(f"Scaled {X_train.shape[1]} features")
    return X_train_scaled, X_test_scaled, scaler


# =============================================================================
# MODEL TRAINING
# =============================================================================

def train_logistic_regression(X_train, y_train):
    """Train a Logistic Regression model."""
    print("\nTraining Logistic Regression...")
    model = LogisticRegression(
        random_state=RANDOM_STATE,
        max_iter=1000,
        solver='lbfgs'
    )
    model.fit(X_train, y_train)
    print("Logistic Regression trained successfully")
    return model


def train_random_forest(X_train, y_train):
    """Train a Random Forest model."""
    print("\nTraining Random Forest...")
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    print("Random Forest trained successfully")
    return model


# =============================================================================
# MODEL EVALUATION
# =============================================================================

def evaluate_model(model, X_test, y_test, model_name):
    """Evaluate a model and print results."""
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n{'='*50}")
    print(f"Model: {model_name}")
    print(f"{'='*50}")
    print(f"Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    return accuracy


def compare_models(results):
    """Compare all model results and return the best one."""
    print(f"\n{'='*50}")
    print("MODEL COMPARISON SUMMARY")
    print(f"{'='*50}")
    
    for model_name, accuracy in results.items():
        print(f"{model_name}: {accuracy*100:.2f}%")
    
    best_model_name = max(results, key=results.get)
    best_accuracy = results[best_model_name]
    
    print(f"\nBest Model: {best_model_name} with {best_accuracy*100:.2f}% accuracy")
    
    return best_model_name


# =============================================================================
# MODEL SAVING
# =============================================================================

def save_model(model, filename):
    """Save a model to a pickle file."""
    with open(filename, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model saved to {filename}")


def save_scaler(scaler, filename):
    """Save the scaler to a pickle file."""
    with open(filename, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"Scaler saved to {filename}")


# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main():
    """Main function to run the entire pipeline."""
    print("="*60)
    print("CUSTOMER CHURN PREDICTION PIPELINE")
    print("="*60)
    
    # Step 1: Load data
    df = load_data(DATA_PATH)
    
    # Step 2: Preprocess data
    df_processed, label_encoders = preprocess_data(df)
    
    # Step 3: Prepare features and target
    X, y, target_col = prepare_features_target(df_processed)
    
    # Step 4: Split data into train and test sets
    print("\nSplitting data into train/test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, 
        test_size=TEST_SIZE, 
        random_state=RANDOM_STATE,
        stratify=y
    )
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    
    # Step 5: Scale features
    X_train_scaled, X_test_scaled, scaler = scale_features(X_train, X_test)
    
    # Step 6: Train models
    models = {
        'Logistic Regression': train_logistic_regression(X_train_scaled, y_train),
        'Random Forest': train_random_forest(X_train_scaled, y_train)
    }
    
    # Step 7: Evaluate models
    results = {}
    for model_name, model in models.items():
        accuracy = evaluate_model(model, X_test_scaled, y_test, model_name)
        results[model_name] = accuracy
    
    # Step 8: Find best model
    best_model_name = compare_models(results)
    best_model = models[best_model_name]
    
    # Step 9: Save best model and scaler
    save_model(best_model, 'model.pkl')
    save_scaler(scaler, 'scaler.pkl')
    
    print("\n" + "="*60)
    print("PIPELINE COMPLETED SUCCESSFULLY!")
    print("="*60)


if __name__ == "__main__":
    main()