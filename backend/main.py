"""
FastAPI Backend for Customer Churn Prediction
==============================================
Production-ready API for predicting customer churn.
"""

import pickle
from pathlib import Path
from typing import Any, Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# =============================================================================
# CONFIGURATION
# =============================================================================

MODEL_PATH = Path(__file__).parent / "model.pkl"
SCALER_PATH = Path(__file__).parent / "scaler.pkl"

# =============================================================================
# LOAD MODEL AND SCALER
# =============================================================================

def load_model_and_scaler():
    """Load the trained model and scaler from pickle files."""
    try:
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        with open(SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)
        return model, scaler
    except FileNotFoundError as e:
        raise RuntimeError(f"Model or scaler file not found: {e}")
    except Exception as e:
        raise RuntimeError(f"Error loading model/scaler: {e}")


model, scaler = load_model_and_scaler()

# =============================================================================
# FASTAPI APP
# =============================================================================

app = FastAPI(
    title="Churn Prediction API",
    description="API for predicting customer churn using trained ML model",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# REQUEST/RESPONSE MODELS
# =============================================================================

class ChurnPredictionRequest(BaseModel):
    """Request model for churn prediction."""
    gender: str = Field(..., description="Customer gender (Male/Female)")
    SeniorCitizen: int = Field(..., description="Whether customer is senior (0/1)")
    Partner: str = Field(..., description="Whether customer has partner (Yes/No)")
    Dependents: str = Field(..., description="Whether customer has dependents (Yes/No)")
    tenure: int = Field(..., description="Number of months customer has stayed")
    PhoneService: str = Field(..., description="Whether customer has phone service (Yes/No)")
    MultipleLines: str = Field(..., description="Whether customer has multiple lines")
    InternetService: str = Field(..., description="Internet service type (DSL/Fiber optic/No)")
    OnlineSecurity: str = Field(..., description="Online security service")
    OnlineBackup: str = Field(..., description="Online backup service")
    DeviceProtection: str = Field(..., description="Device protection service")
    TechSupport: str = Field(..., description="Tech support service")
    StreamingTV: str = Field(..., description="Streaming TV service")
    StreamingMovies: str = Field(..., description="Streaming movies service")
    Contract: str = Field(..., description="Contract type (Month-to-month/One year/Two year)")
    PaperlessBilling: str = Field(..., description="Paperless billing (Yes/No)")
    PaymentMethod: str = Field(..., description="Payment method")
    MonthlyCharges: float = Field(..., description="Monthly charges")
    TotalCharges: float = Field(..., description="Total charges")


class ChurnPredictionResponse(BaseModel):
    """Response model for churn prediction."""
    prediction: int = Field(..., description="Predicted churn (0: No, 1: Yes)")
    probability: float = Field(..., description="Probability of churn")
    churn_label: str = Field(..., description="Human-readable churn label")


# =============================================================================
# FEATURE PREPROCESSING
# =============================================================================

def preprocess_input(data: dict) -> np.ndarray:
    """Preprocess input data using the scaler."""
    try:
        # Feature order must match training order
        feature_order = [
            "gender", "SeniorCitizen", "Partner", "Dependents", "tenure",
            "PhoneService", "MultipleLines", "InternetService", "OnlineSecurity",
            "OnlineBackup", "DeviceProtection", "TechSupport", "StreamingTV",
            "StreamingMovies", "Contract", "PaperlessBilling", "PaymentMethod",
            "MonthlyCharges", "TotalCharges"
        ]
        
        # Map categorical values to encoded values (matching training encoding)
        categorical_mappings = {
            "gender": {"Female": 0, "Male": 1},
            "Partner": {"No": 0, "Yes": 1},
            "Dependents": {"No": 0, "Yes": 1},
            "PhoneService": {"No": 0, "Yes": 1},
            "MultipleLines": {"No": 0, "No phone service": 1, "Yes": 2},
            "InternetService": {"DSL": 0, "Fiber optic": 1, "No": 2},
            "OnlineSecurity": {"No": 0, "No internet service": 1, "Yes": 2},
            "OnlineBackup": {"No": 0, "No internet service": 1, "Yes": 2},
            "DeviceProtection": {"No": 0, "No internet service": 1, "Yes": 2},
            "TechSupport": {"No": 0, "No internet service": 1, "Yes": 2},
            "StreamingTV": {"No": 0, "No internet service": 1, "Yes": 2},
            "StreamingMovies": {"No": 0, "No internet service": 1, "Yes": 2},
            "Contract": {"Month-to-month": 0, "One year": 1, "Two year": 2},
            "PaperlessBilling": {"No": 0, "Yes": 1},
            "PaymentMethod": {"Bank transfer (automatic)": 0, "Credit card (automatic)": 1, "Electronic check": 2, "Mailed check": 3},
        }
        
        features = []
        for col in feature_order:
            value = data.get(col)
            if col in categorical_mappings:
                # Handle categorical value - ensure it's a string
                str_value = str(value) if value is not None else ""
                mapped = categorical_mappings[col].get(str_value, 0)
                features.append(float(mapped))
            else:
                # Handle numeric value
                try:
                    features.append(float(value))
                except (ValueError, TypeError):
                    features.append(float(0))
        
        features = np.array(features, dtype=np.float64).reshape(1, -1)
        features_scaled = scaler.transform(features)
        return features_scaled
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error preprocessing input: {str(e)}")


# =============================================================================
# ENDPOINTS
# =============================================================================

@app.get("/")
def root():
    """Root endpoint for health check."""
    return {"status": "ok", "message": "Churn Prediction API is running"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    }


@app.post("/predict", response_model=ChurnPredictionResponse)
def predict_churn(request: ChurnPredictionRequest):
    """Predict customer churn based on input features."""
    try:
        # Convert request to dict
        data = request.model_dump()
        
        # Preprocess input
        features = preprocess_input(data)
        
        # Make prediction
        prediction = model.predict(features)[0]
        
        # Handle both string and numeric predictions
        if isinstance(prediction, str):
            prediction = 1 if prediction.lower() == "yes" else 0
        
        prediction = int(prediction)
        
        probabilities = model.predict_proba(features)[0]
        
        # Get probability of positive class (churn = 1)
        churn_probability = float(probabilities[1])
        
        # Determine label
        churn_label = "Yes" if prediction == 1 else "No"
        
        return ChurnPredictionResponse(
            prediction=prediction,
            probability=round(churn_probability, 4),
            churn_label=churn_label
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


# =============================================================================
# RUN SERVER
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)