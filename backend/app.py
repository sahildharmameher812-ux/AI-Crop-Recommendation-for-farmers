import io
import json
import os
from typing import List, Optional, Union
import uuid

import numpy as np
import pandas as pd
import requests
from fastapi import Body, FastAPI, File, HTTPException, UploadFile, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from sklearn.ensemble import RandomForestClassifier, VotingClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import classification_report, accuracy_score
import geopy.distance
from geopy.geocoders import Nominatim
import random
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import enhanced chatbot service
from chatbot_service import get_chatbot_service

APP_NAME = "AI-Based Crop Recommendation"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CSV_PATH = os.path.join(DATA_DIR, "Crop_recommendation.csv")

# Optional OpenAI integration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
USE_OPENAI = os.getenv("USE_OPENAI", "0") == "1"

app = FastAPI(title=APP_NAME, version="1.0.0")

# CORS (allow dev origins and all for simplicity)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictPayload(BaseModel):
    N: float = Field(..., description="Nitrogen content in soil")
    P: float = Field(..., description="Phosphorus content in soil")
    K: float = Field(..., description="Potassium content in soil")
    ph: float = Field(..., ge=0, le=14, description="pH value of the soil")
    temperature: float = Field(..., description="Temperature in °C")
    humidity: float = Field(..., ge=0, le=100, description="Humidity in %")
    rainfall: float = Field(..., ge=0, description="Rainfall in mm")

    @field_validator("temperature")
    @classmethod
    def temp_reasonable(cls, v):
        if v < -20 or v > 60:
            raise ValueError("Unreasonable temperature value")
        return v


class CropRecommendation(BaseModel):
    crop: str
    probability: float
    yield_kg_per_hectare: float
    expected_profit_local: float
    sustainability_score: int


class PredictResponse(BaseModel):
    recommendations: List[CropRecommendation]
    meta: dict


# Globals for model
_model: Optional[VotingClassifier] = None
_scaler: Optional[StandardScaler] = None
_label_encoder: Optional[LabelEncoder] = None
_feature_columns = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
_label_column = "label"
_crops: List[str] = []
_model_accuracy: float = 0.0

# Baseline yields (kg/ha) and price per kg (local currency). Approximate sample values.
_BASELINE = {
    "rice": (4000, 20),
    "maize": (3500, 18),
    "chickpea": (1200, 60),
    "kidneybeans": (1500, 80),
    "pigeonpeas": (1000, 70),
    "mothbeans": (800, 55),
    "mungbean": (900, 65),
    "blackgram": (900, 62),
    "lentil": (1100, 58),
    "pomegranate": (15000, 10),
    "banana": (25000, 8),
    "mango": (12000, 12),
    "grapes": (18000, 15),
    "watermelon": (20000, 7),
    "muskmelon": (16000, 9),
    "apple": (10000, 20),
    "orange": (14000, 12),
    "papaya": (30000, 6),
    "coconut": (12000, 5),
    "cotton": (2200, 45),
    "jute": (2400, 25),
    "coffee": (1800, 200),
}

# Regional soil data database (simplified version)
# In a real application, this would be a proper database with extensive soil survey data
_REGIONAL_SOIL_DATA = {
    # Indian regions with typical soil characteristics
    "punjab": {"N": 85, "P": 45, "K": 50, "ph": 7.2, "temp_range": (15, 35)},
    "haryana": {"N": 80, "P": 42, "K": 48, "ph": 7.5, "temp_range": (12, 38)},
    "uttar pradesh": {"N": 75, "P": 38, "K": 45, "ph": 7.0, "temp_range": (18, 42)},
    "maharashtra": {"N": 65, "P": 35, "K": 40, "ph": 6.8, "temp_range": (20, 38)},
    "karnataka": {"N": 60, "P": 40, "K": 45, "ph": 6.5, "temp_range": (22, 35)},
    "tamil nadu": {"N": 70, "P": 50, "K": 55, "ph": 6.2, "temp_range": (25, 40)},
    "kerala": {"N": 55, "P": 45, "K": 50, "ph": 5.8, "temp_range": (23, 35)},
    "west bengal": {"N": 85, "P": 40, "K": 42, "ph": 6.8, "temp_range": (20, 38)},
    "bihar": {"N": 75, "P": 35, "K": 40, "ph": 7.2, "temp_range": (18, 40)},
    "rajasthan": {"N": 45, "P": 25, "K": 35, "ph": 7.8, "temp_range": (10, 45)},
    "gujarat": {"N": 70, "P": 35, "K": 42, "ph": 7.5, "temp_range": (15, 42)},
    "madhya pradesh": {"N": 65, "P": 38, "K": 45, "ph": 7.0, "temp_range": (15, 40)},
    "andhra pradesh": {"N": 68, "P": 48, "K": 52, "ph": 6.5, "temp_range": (22, 40)},
    "telangana": {"N": 65, "P": 45, "K": 50, "ph": 6.8, "temp_range": (20, 40)},
    # More Indian regions
    "odisha": {"N": 72, "P": 42, "K": 48, "ph": 6.6, "temp_range": (22, 38)},
    "jharkhand": {"N": 68, "P": 40, "K": 45, "ph": 6.4, "temp_range": (20, 40)},
    "assam": {"N": 78, "P": 48, "K": 52, "ph": 5.9, "temp_range": (22, 34)},
    "himachal pradesh": {"N": 62, "P": 38, "K": 42, "ph": 6.8, "temp_range": (8, 30)},
    "uttarakhand": {"N": 65, "P": 40, "K": 44, "ph": 6.9, "temp_range": (10, 32)},
    "chhattisgarh": {"N": 70, "P": 45, "K": 48, "ph": 6.5, "temp_range": (20, 42)},
    "goa": {"N": 58, "P": 44, "K": 50, "ph": 5.7, "temp_range": (24, 35)},
    # Major cities
    "mumbai": {"N": 65, "P": 35, "K": 40, "ph": 6.8, "temp_range": (20, 38)},
    "delhi": {"N": 75, "P": 38, "K": 45, "ph": 7.0, "temp_range": (18, 42)},
    "bangalore": {"N": 60, "P": 40, "K": 45, "ph": 6.5, "temp_range": (22, 35)},
    "chennai": {"N": 70, "P": 50, "K": 55, "ph": 6.2, "temp_range": (25, 40)},
    "hyderabad": {"N": 65, "P": 45, "K": 50, "ph": 6.8, "temp_range": (20, 40)},
    "kolkata": {"N": 85, "P": 40, "K": 42, "ph": 6.8, "temp_range": (20, 38)},
    "pune": {"N": 65, "P": 35, "K": 40, "ph": 6.8, "temp_range": (18, 36)},
    "ahmedabad": {"N": 70, "P": 35, "K": 42, "ph": 7.5, "temp_range": (15, 42)},
    "jaipur": {"N": 45, "P": 25, "K": 35, "ph": 7.8, "temp_range": (10, 45)},
    "lucknow": {"N": 75, "P": 38, "K": 45, "ph": 7.0, "temp_range": (18, 42)},
    "bhopal": {"N": 65, "P": 38, "K": 45, "ph": 7.0, "temp_range": (15, 40)},
    "chandigarh": {"N": 80, "P": 42, "K": 48, "ph": 7.3, "temp_range": (12, 38)},
    # International locations
    "california": {"N": 70, "P": 40, "K": 45, "ph": 6.5, "temp_range": (10, 35)},
    "texas": {"N": 75, "P": 35, "K": 40, "ph": 7.2, "temp_range": (15, 40)},
    "iowa": {"N": 90, "P": 50, "K": 60, "ph": 6.8, "temp_range": (5, 35)},
    "nebraska": {"N": 85, "P": 45, "K": 55, "ph": 7.0, "temp_range": (0, 38)},
    "ukraine": {"N": 95, "P": 55, "K": 65, "ph": 6.5, "temp_range": (-5, 35)},
    "argentina": {"N": 80, "P": 48, "K": 50, "ph": 6.2, "temp_range": (10, 35)},
    "brazil": {"N": 65, "P": 35, "K": 40, "ph": 5.8, "temp_range": (18, 40)},
    "australia": {"N": 72, "P": 42, "K": 48, "ph": 6.4, "temp_range": (12, 40)},
    "canada": {"N": 85, "P": 50, "K": 58, "ph": 6.8, "temp_range": (-10, 30)},
    "united kingdom": {"N": 78, "P": 48, "K": 52, "ph": 6.6, "temp_range": (2, 25)},
}

# Comprehensive crop dataset for ML training
_COMPREHENSIVE_DATASET = """N,P,K,temperature,humidity,ph,rainfall,label
90,42,43,20.879744,82.002744,6.502985,202.935536,rice
85,58,41,21.770462,80.319644,7.038096,226.655537,rice
88,45,40,22.5,80.0,6.8,210.0,rice
92,40,45,19.8,85.0,6.3,195.0,rice
87,48,42,21.2,78.5,6.6,220.0,rice
89,43,44,20.5,81.0,6.7,205.0,rice
86,46,41,22.0,79.0,6.5,215.0,rice
91,42,43,21.8,83.0,6.4,200.0,rice
19,20,25,26.115274,52.044676,6.362609,127.924236,maize
22,18,28,25.5,55.0,6.5,120.0,maize
20,22,26,27.0,50.0,6.8,135.0,maize
18,19,29,26.8,53.0,6.6,125.0,maize
21,21,27,25.8,54.5,6.4,130.0,maize
23,17,30,27.2,51.0,6.9,140.0,maize
17,20,25,26.5,52.5,6.3,128.0,maize
24,16,31,27.5,49.0,7.0,145.0,maize
13,14,15,22.123,65.0,6.9,80.0,blackgram
12,15,16,23.0,63.0,7.1,85.0,blackgram
14,13,17,21.8,67.0,6.8,75.0,blackgram
15,12,14,22.5,64.0,7.0,82.0,blackgram
11,16,18,23.2,62.0,7.2,88.0,blackgram
16,11,13,21.5,68.0,6.7,78.0,blackgram
10,17,19,23.5,61.0,7.3,90.0,blackgram
11,13,12,23.15,70.5,6.7,90.0,mungbean
12,14,13,22.8,72.0,6.8,95.0,mungbean
10,15,11,23.5,69.0,6.6,88.0,mungbean
13,12,14,22.5,71.5,6.9,92.0,mungbean
9,16,10,24.0,68.0,6.5,85.0,mungbean
14,11,15,22.0,73.0,7.0,98.0,mungbean
8,17,9,24.2,67.0,6.4,82.0,mungbean
12,13,12,23.8,70.0,6.7,94.0,mungbean
60,35,40,24.0,60.0,6.5,110.0,chickpea
58,37,42,23.5,62.0,6.8,115.0,chickpea
62,33,38,24.5,58.0,6.3,105.0,chickpea
59,36,41,24.2,61.0,6.6,112.0,chickpea
61,34,39,23.8,59.5,6.4,108.0,chickpea
57,38,43,25.0,63.0,6.9,118.0,chickpea
63,32,37,23.2,57.0,6.2,102.0,chickpea
40,67,18,30.7,51.34,7.0,25.6,kidneybeans
42,65,20,31.0,52.0,7.2,28.0,kidneybeans
38,69,16,30.5,50.5,6.8,23.0,kidneybeans
41,66,19,31.2,51.8,7.1,26.5,kidneybeans
39,68,17,30.8,50.2,6.9,24.5,kidneybeans
43,64,21,31.5,52.5,7.3,29.0,kidneybeans
37,70,15,30.2,49.8,6.7,22.0,kidneybeans
55,44,38,18.873,64.77,6.68,149.75,pigeonpeas
53,46,40,19.2,63.5,6.9,145.0,pigeonpeas
57,42,36,18.5,65.8,6.5,155.0,pigeonpeas
54,45,39,19.0,64.2,6.7,148.0,pigeonpeas
56,43,37,18.8,66.0,6.6,152.0,pigeonpeas
52,47,41,19.5,62.8,7.0,142.0,pigeonpeas
58,41,35,18.2,67.0,6.4,158.0,pigeonpeas
23,48,18,27.29,50.16,6.96,89.92,mothbeans
22,49,19,27.5,49.8,7.1,92.0,mothbeans
24,47,17,27.0,50.5,6.8,87.0,mothbeans
21,50,20,28.0,49.2,7.2,95.0,mothbeans
25,46,16,26.8,51.0,6.7,85.0,mothbeans
20,51,21,28.2,48.8,7.3,97.0,mothbeans
26,45,15,26.5,51.5,6.6,83.0,mothbeans
11,47,50,25.2,89.0,5.8,268.0,lentil
10,48,51,25.5,88.5,6.0,272.0,lentil
12,46,49,24.8,89.5,5.6,265.0,lentil
9,49,52,26.0,87.8,6.1,275.0,lentil
13,45,48,24.5,90.0,5.5,260.0,lentil
8,50,53,26.2,87.5,6.2,278.0,lentil
14,44,47,24.2,90.5,5.4,258.0,lentil
7,40,40,20.13,82.0,7.2,251.0,banana
8,42,38,20.5,81.5,7.0,248.0,banana
6,38,42,19.8,82.5,7.4,254.0,banana
9,44,36,21.0,80.8,6.8,245.0,banana
5,36,44,19.5,83.0,7.6,258.0,banana
10,46,34,21.2,80.5,6.6,242.0,banana
4,34,46,19.2,83.5,7.8,262.0,banana
20,14,37,29.3,48.0,5.5,50.7,pomegranate
22,12,35,29.8,47.2,5.8,48.0,pomegranate
18,16,39,28.8,48.8,5.2,53.0,pomegranate
21,13,36,30.0,46.5,5.6,49.5,pomegranate
19,15,38,29.5,47.8,5.4,51.2,pomegranate
23,11,34,30.2,46.0,5.9,47.5,pomegranate
17,17,40,28.5,49.0,5.1,55.0,pomegranate
104,18,30,23.6,60.3,6.7,34.4,mango
102,20,32,24.0,59.8,6.9,36.0,mango
106,16,28,23.2,60.8,6.5,32.5,mango
103,19,31,23.8,60.0,6.8,35.2,mango
105,17,29,23.4,61.0,6.6,33.8,mango
101,21,33,24.2,59.5,7.0,37.0,mango
107,15,27,22.8,61.5,6.4,31.0,mango
40,50,40,27.0,75.0,6.0,120.0,grapes
42,48,38,27.5,74.2,6.2,118.0,grapes
38,52,42,26.5,75.8,5.8,122.0,grapes
41,49,39,27.2,74.8,6.1,119.5,grapes
39,51,41,26.8,76.0,5.9,123.5,grapes
43,47,37,27.8,73.5,6.3,116.5,grapes
37,53,43,26.2,76.5,5.7,125.0,grapes
18,28,40,35.6,51.7,6.7,108.1,watermelon
20,26,38,36.0,51.0,6.9,105.0,watermelon
16,30,42,35.2,52.5,6.5,111.0,watermelon
19,27,39,35.8,51.2,6.8,107.5,watermelon
17,29,41,35.4,52.0,6.6,109.5,watermelon
21,25,37,36.2,50.8,7.0,103.5,watermelon
15,31,43,34.8,53.0,6.4,113.0,watermelon
28,26,32,31.5,46.0,6.2,55.5,muskmelon
30,24,30,32.0,45.2,6.4,53.0,muskmelon
26,28,34,31.0,46.8,6.0,58.0,muskmelon
29,25,31,31.8,45.5,6.3,54.5,muskmelon
27,27,33,31.2,46.5,6.1,56.8,muskmelon
31,23,29,32.2,44.8,6.5,51.2,muskmelon
25,29,35,30.8,47.0,5.9,59.5,muskmelon
21,80,18,20.9,92.0,6.5,202.0,apple
23,78,16,21.2,91.5,6.7,198.0,apple
19,82,20,20.5,92.5,6.3,206.0,apple
22,79,17,21.0,92.2,6.6,200.5,apple
20,81,19,20.8,91.8,6.4,204.2,apple
24,77,15,21.5,91.0,6.8,195.5,apple
18,83,21,20.2,93.0,6.2,208.0,apple
17,52,26,22.2,92.0,5.7,201.9,orange
19,50,24,22.8,91.2,5.9,198.0,orange
15,54,28,21.8,92.8,5.5,205.5,orange
18,51,25,22.5,91.8,5.8,200.2,orange
16,53,27,22.0,92.5,5.6,203.8,orange
20,49,23,23.0,91.0,6.0,195.8,orange
14,55,29,21.5,93.2,5.4,207.2,orange
60,19,31,33.0,50.0,5.7,55.9,papaya
62,17,29,33.5,49.2,5.9,53.0,papaya
58,21,33,32.5,50.8,5.5,58.5,papaya
61,18,30,33.2,49.8,5.8,55.2,papaya
59,20,32,32.8,50.2,5.6,57.0,papaya
63,16,28,33.8,48.8,6.0,51.5,papaya
57,22,34,32.2,51.0,5.4,60.0,papaya
18,14,50,27.0,80.0,7.2,150.9,coconut
20,12,48,27.5,79.2,7.4,148.0,coconut
16,16,52,26.5,80.8,7.0,153.5,coconut
19,13,49,27.2,79.8,7.3,149.8,coconut
17,15,51,26.8,80.2,7.1,152.2,coconut
21,11,47,27.8,78.8,7.5,146.5,coconut
15,17,53,26.2,81.0,6.9,155.0,coconut
50,20,30,26.0,60.0,6.5,50.0,cotton
52,18,28,26.5,59.2,6.7,48.0,cotton
48,22,32,25.5,60.8,6.3,52.0,cotton
51,19,29,26.2,59.8,6.6,49.5,cotton
49,21,31,25.8,60.2,6.4,51.2,cotton
53,17,27,26.8,58.8,6.8,46.8,cotton
47,23,33,25.2,61.0,6.2,53.5,cotton
78,42,18,23.0,85.0,7.8,118.0,jute
76,44,20,23.5,84.2,8.0,115.0,jute
80,40,16,22.5,85.8,7.6,121.0,jute
77,43,19,23.2,84.8,7.9,117.5,jute
79,41,17,22.8,85.2,7.7,119.2,jute
75,45,21,23.8,83.8,8.1,113.5,jute
81,39,15,22.2,86.0,7.5,123.0,jute
25,29,32,23.7,58.0,6.8,180.8,coffee
27,27,30,24.2,57.2,7.0,178.0,coffee
23,31,34,23.2,58.8,6.6,183.5,coffee
26,28,31,23.8,57.8,6.9,180.2,coffee
24,30,33,23.5,58.2,6.7,182.0,coffee
28,26,29,24.5,56.8,7.1,176.5,coffee
22,32,35,22.8,59.0,6.5,185.2,coffee
"""


def _load_dataset() -> pd.DataFrame:
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(CSV_PATH):
        df = pd.read_csv(CSV_PATH)
    else:
        # Use comprehensive dataset for training
        df = pd.read_csv(io.StringIO(_COMPREHENSIVE_DATASET))
    
    # Check if we have the exact columns we need
    expected_cols = _feature_columns + [_label_column]
    if all(col in df.columns for col in expected_cols):
        return df
    
    # If not, try case-insensitive mapping
    cols_lower = {c.lower(): c for c in df.columns}
    expected_lower = [c.lower() for c in expected_cols]
    missing = [c for c in expected_lower if c not in cols_lower]
    if missing:
        raise RuntimeError(f"Dataset missing columns: {missing}")
    
    # Create mapping from lowercase expected to actual case
    rename_map = {cols_lower[c.lower()]: c for c in expected_cols if c.lower() in cols_lower}
    df = df.rename(columns=rename_map)
    return df


def _train_model():
    global _model, _crops, _scaler, _label_encoder, _model_accuracy
    
    print("Training enhanced ML model...")
    df = _load_dataset()
    print(f"Dataset loaded: {len(df)} samples, {len(df.columns)} features")
    
    X = df[_feature_columns]
    y = df[_label_column]
    
    # Feature scaling
    _scaler = StandardScaler()
    X_scaled = _scaler.fit_transform(X)
    
    # Label encoding
    _label_encoder = LabelEncoder()
    y_encoded = _label_encoder.fit_transform(y)
    _crops = list(_label_encoder.classes_)
    
    print(f"Crops in dataset: {len(_crops)} types - {_crops[:5]}{'...' if len(_crops) > 5 else ''}")
    
    # Train-test split with stratification
    min_samples = pd.Series(y_encoded).value_counts().min()
    
    if min_samples >= 2 and len(df) > 20:
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
    else:
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_encoded, test_size=0.2, random_state=42
        )
    
    # Create ensemble of different algorithms
    print("Building ensemble model...")
    
    # Random Forest - Good for feature importance and handles non-linearity
    rf_model = RandomForestClassifier(
        n_estimators=150, 
        max_depth=12,
        min_samples_split=5,
        random_state=42, 
        class_weight='balanced'
    )
    
    # Gradient Boosting - Good for sequential learning
    gb_model = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=8,
        random_state=42
    )
    
    # Support Vector Machine - Good for complex boundaries
    svm_model = SVC(
        kernel='rbf',
        probability=True,
        random_state=42,
        class_weight='balanced'
    )
    
    # Naive Bayes - Good baseline classifier
    nb_model = GaussianNB()
    
    # Create ensemble voting classifier
    _model = VotingClassifier(
        estimators=[
            ('rf', rf_model),
            ('gb', gb_model),
            ('svm', svm_model),
            ('nb', nb_model)
        ],
        voting='soft'  # Use probability voting
    )
    
    # Train the ensemble model
    print("Training ensemble...")
    _model.fit(X_train, y_train)
    
    # Evaluate model performance
    y_pred = _model.predict(X_test)
    _model_accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Model trained successfully!")
    print(f"Test Accuracy: {_model_accuracy:.4f} ({_model_accuracy*100:.2f}%)")
    print(f"Model supports {len(_crops)} crop types")
    
    # Cross-validation score for robustness
    try:
        cv_scores = cross_val_score(_model, X_scaled, y_encoded, cv=3, scoring='accuracy')
        print(f"Cross-validation accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    except Exception as e:
        print(f"Cross-validation failed: {str(e)}")


def _get_location_from_coordinates(lat: float, lon: float) -> str:
    """Get location name from coordinates using reverse geocoding."""
    try:
        geolocator = Nominatim(user_agent="crop_recommendation_app")
        location = geolocator.reverse(f"{lat}, {lon}", exactly_one=True, timeout=10)
        if location:
            # Extract meaningful location info
            address = location.raw.get('address', {})
            if 'state' in address:
                return address['state'].lower()
            elif 'country' in address:
                return address['country'].lower()
            else:
                return location.address.split(',')[-1].strip().lower()
        return "unknown"
    except Exception:
        return "unknown"


def _get_coordinates_from_place(place_name: str) -> tuple[float, float]:
    """Get coordinates from place name using geocoding."""
    try:
        geolocator = Nominatim(user_agent="crop_recommendation_app")
        location = geolocator.geocode(place_name, timeout=10)
        if location:
            return location.latitude, location.longitude
        raise ValueError(f"Location '{place_name}' not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Geocoding failed: {str(e)}")


def _find_closest_soil_data(location_key: str, lat: float = None, lon: float = None):
    """Find the closest soil data match for a given location."""
    # First try exact match (case insensitive)
    location_lower = location_key.lower()
    
    # Check for direct matches in our database
    for region_key, soil_data in _REGIONAL_SOIL_DATA.items():
        if region_key in location_lower or location_lower in region_key:
            return soil_data, region_key, 0.9  # High confidence for direct match
    
    # If no direct match, try partial matches
    best_match = None
    best_score = 0
    
    for region_key, soil_data in _REGIONAL_SOIL_DATA.items():
        # Check for partial matches in words
        location_words = set(location_lower.split())
        region_words = set(region_key.split())
        
        common_words = location_words.intersection(region_words)
        if common_words:
            score = len(common_words) / max(len(location_words), len(region_words))
            if score > best_score:
                best_score = score
                best_match = (soil_data, region_key, score * 0.7)  # Reduced confidence for partial match
    
    if best_match:
        return best_match
    
    # Fallback: use a default moderate soil profile
    default_soil = {"N": 65, "P": 40, "K": 45, "ph": 6.8, "temp_range": (20, 35)}
    return default_soil, "global_average", 0.3  # Low confidence for fallback


def _generate_environmental_data(location_name: str, lat: float = None, lon: float = None):
    """Generate realistic environmental data based on location and season."""
    # Get soil data
    soil_data, matched_region, confidence = _find_closest_soil_data(location_name, lat, lon)
    
    # Generate temperature (with some randomness)
    temp_min, temp_max = soil_data.get("temp_range", (20, 35))
    temperature = random.uniform(temp_min + 2, temp_max - 2)
    
    # Generate humidity (varies by region)
    if "rajasthan" in matched_region or "desert" in location_name.lower():
        humidity = random.uniform(30, 60)  # Arid regions
    elif "kerala" in matched_region or "coastal" in location_name.lower():
        humidity = random.uniform(70, 90)  # Coastal regions
    else:
        humidity = random.uniform(50, 80)  # General regions
    
    # Generate rainfall (seasonal and regional variation)
    if "rajasthan" in matched_region or "desert" in location_name.lower():
        rainfall = random.uniform(20, 80)  # Low rainfall
    elif "kerala" in matched_region or "west bengal" in matched_region:
        rainfall = random.uniform(150, 300)  # High rainfall
    else:
        rainfall = random.uniform(80, 200)  # Moderate rainfall
    
    return {
        "N": soil_data["N"] + random.uniform(-5, 5),  # Add some variation
        "P": soil_data["P"] + random.uniform(-3, 3),
        "K": soil_data["K"] + random.uniform(-3, 3),
        "ph": soil_data["ph"] + random.uniform(-0.3, 0.3),
        "temperature": round(temperature, 2),
        "humidity": round(humidity, 2),
        "rainfall": round(rainfall, 2),
        "location_name": matched_region.title(),
        "confidence_score": confidence,
        "source": "regional_database"
    }


def _estimate_yield_profit_sustainability(crop: str, features: dict, prob: float):
    # Use baseline, modulated by how close soil properties are to median values for that crop if available
    baseline_yield, price = _BASELINE.get(crop, (2000, 20))

    # Heuristics: better NPK balance and moderate pH/temperature/humidity improve yield
    N, P, K = features["N"], features["P"], features["K"]
    ph, temp, hum, rain = features["ph"], features["temperature"], features["humidity"], features["rainfall"]

    # Balance score for NPK (ideal around N:P:K ~ 1:1:1)
    mean_npk = (N + P + K) / 3.0 + 1e-9
    balance = 1.0 - (abs(N - mean_npk) + abs(P - mean_npk) + abs(K - mean_npk)) / (3.0 * (mean_npk + 10))
    balance = max(0.5, min(1.1, balance))

    # Environmental factors (idealized ranges)
    ph_score = 1.0 - abs(ph - 6.5) / 6.5
    ph_score = max(0.6, min(1.1, ph_score))
    temp_score = 1.0 - abs(temp - 25) / 25
    temp_score = max(0.6, min(1.1, temp_score))
    hum_score = 1.0 - abs(hum - 70) / 70
    hum_score = max(0.6, min(1.1, hum_score))
    rain_score = 1.0 - abs(rain - 120) / 200
    rain_score = max(0.6, min(1.1, rain_score))

    # Combine; boost by model probability (0.8..1.2 range)
    prob_boost = 0.8 + 0.4 * prob
    yield_est = baseline_yield * balance * ph_score * temp_score * hum_score * rain_score * prob_boost
    yield_est = float(max(0.0, yield_est))

    # Profit estimate
    profit = yield_est * price

    # Sustainability: higher with balanced NPK, moderate rainfall, and humidity
    sustainability = int(
        max(0, min(100, 60 * balance + 10 * (1.1 - abs(rain - 120) / 200) + 10 * (1.1 - abs(hum - 70) / 70) + 20 * (1.1 - abs(ph - 6.5) / 6.5)))
    )
    return yield_est, profit, sustainability


@app.on_event("startup")
def on_startup():
    _train_model()


@app.get("/health")
async def health():
    return {"status": "ok", "model_ready": _model is not None, "crops": _crops}


@app.post("/predict", response_model=PredictResponse)
async def predict(
    request: Request,
    file: Optional[UploadFile] = File(default=None),
):
    """
    Unified endpoint that accepts either:
    - multipart/form-data with 'file' (CSV)
    - application/json with soil payload

    Note: Having a File parameter makes FastAPI expect multipart/form-data by default,
    so we explicitly read JSON from the Request when Content-Type is application/json.
    """
    if _model is None:
        raise HTTPException(status_code=500, detail="Model not initialized")

    rows = []
    meta: dict = {}

    content_type = request.headers.get("content-type", "").lower()

    if file is not None:
        # Parse CSV upload
        content = await file.read()
        try:
            df = pd.read_csv(io.BytesIO(content))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid CSV: {e}")
        lower_cols = {c.lower(): c for c in df.columns}
        required = [c.lower() for c in _feature_columns]
        missing = [c for c in required if c not in lower_cols]
        if missing:
            raise HTTPException(status_code=400, detail=f"CSV missing columns: {missing}")
        # Normalize columns
        df = df.rename(columns={lower_cols[c]: c for c in required})
        rows = df[_feature_columns].to_dict(orient="records")
        meta["uploaded_rows"] = len(rows)
    elif "application/json" in content_type:
        try:
            body = await request.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON: {e}")
        try:
            payload = PredictPayload(**body)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Invalid fields: {e}")
        rows = [payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()]
    else:
        raise HTTPException(status_code=400, detail="Provide JSON body or CSV file")

    X = pd.DataFrame(rows)[_feature_columns]
    
    # Apply same preprocessing as training
    if _scaler is None:
        raise HTTPException(status_code=500, detail="Model scaler not initialized")
    
    X_scaled = _scaler.transform(X)
    proba = _model.predict_proba(X_scaled)
    
    # Get class labels from label encoder
    if _label_encoder is None:
        raise HTTPException(status_code=500, detail="Label encoder not initialized")
    
    classes: List[str] = list(_label_encoder.classes_)

    # For single row response, return top 3 with estimates; for multi, aggregate by top
    recommendations: List[CropRecommendation] = []

    if len(rows) == 1:
        probs = proba[0]
        top_idx = np.argsort(probs)[::-1][:3]
        for idx in top_idx:
            crop = classes[idx]
            p = float(probs[idx])
            y, prof, sus = _estimate_yield_profit_sustainability(crop, rows[0], p)
            recommendations.append(
                CropRecommendation(
                    crop=crop,
                    probability=round(p, 4),
                    yield_kg_per_hectare=round(y, 2),
                    expected_profit_local=round(prof, 2),
                    sustainability_score=int(sus),
                )
            )
        meta.update({"mode": "single", "model_accuracy": _model_accuracy, "total_crops": len(_crops)})
    else:
        # Aggregate: Most frequently top-1 crop with average stats
        top1_indices = proba.argmax(axis=1)
        top1_crops = [classes[i] for i in top1_indices]
        crop_counts: dict = {}
        crop_stats: dict = {}
        for i, crop in enumerate(top1_crops):
            crop_counts[crop] = crop_counts.get(crop, 0) + 1
            p = float(proba[i, top1_indices[i]])
            y, prof, sus = _estimate_yield_profit_sustainability(crop, rows[i], p)
            if crop not in crop_stats:
                crop_stats[crop] = {"p": [], "y": [], "prof": [], "sus": []}
            crop_stats[crop]["p"].append(p)
            crop_stats[crop]["y"].append(y)
            crop_stats[crop]["prof"].append(prof)
            crop_stats[crop]["sus"].append(sus)
        # Sort by count desc
        sorted_crops = sorted(crop_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        for crop, cnt in sorted_crops:
            stats = crop_stats[crop]
            recommendations.append(
                CropRecommendation(
                    crop=crop,
                    probability=round(float(np.mean(stats["p"])), 4),
                    yield_kg_per_hectare=round(float(np.mean(stats["y"])), 2),
                    expected_profit_local=round(float(np.mean(stats["prof"])), 2),
                    sustainability_score=int(float(np.mean(stats["sus"]))),
                )
            )
        meta.update({"mode": "batch", "rows": len(rows), "model_accuracy": _model_accuracy, "total_crops": len(_crops)})

    return PredictResponse(recommendations=recommendations, meta=meta)


# Comprehensive crop market database with real-world pricing
_COMPREHENSIVE_CROP_DATABASE = {
    # Cereals & Grains
    "rice": {"category": "cereals", "base_price": 22, "unit": "kg", "image": "🌾", "description": "Staple grain crop, main food source for billions", "season": "Kharif", "harvest_time": "Nov-Dec"},
    "wheat": {"category": "cereals", "base_price": 25, "unit": "kg", "image": "🌾", "description": "Major cereal grain used for bread and pasta", "season": "Rabi", "harvest_time": "Mar-Apr"},
    "maize": {"category": "cereals", "base_price": 18, "unit": "kg", "image": "🌽", "description": "Versatile grain used for food, feed, and industry", "season": "Kharif", "harvest_time": "Sep-Oct"},
    "barley": {"category": "cereals", "base_price": 20, "unit": "kg", "image": "🌾", "description": "Cereal grain used for food, beer, and animal feed", "season": "Rabi", "harvest_time": "Mar-Apr"},
    "oats": {"category": "cereals", "base_price": 35, "unit": "kg", "image": "🌾", "description": "Nutritious cereal grain, popular breakfast food", "season": "Rabi", "harvest_time": "Mar-Apr"},
    "millets": {"category": "cereals", "base_price": 40, "unit": "kg", "image": "🌾", "description": "Drought-resistant ancient grains, highly nutritious", "season": "Kharif", "harvest_time": "Sep-Oct"},
    "sorghum": {"category": "cereals", "base_price": 15, "unit": "kg", "image": "🌾", "description": "Drought-tolerant cereal, used for food and fodder", "season": "Kharif", "harvest_time": "Oct-Nov"},
    
    # Pulses & Legumes
    "chickpea": {"category": "pulses", "base_price": 60, "unit": "kg", "image": "🫘", "description": "High-protein legume, major pulse crop", "season": "Rabi", "harvest_time": "Mar-Apr"},
    "black_gram": {"category": "pulses", "base_price": 65, "unit": "kg", "image": "🫘", "description": "Black lentil, used for dal and traditional dishes", "season": "Kharif", "harvest_time": "Sep-Oct"},
    "green_gram": {"category": "pulses", "base_price": 70, "unit": "kg", "image": "🫘", "description": "Mung bean, high protein content", "season": "Kharif", "harvest_time": "Sep-Oct"},
    "pigeon_pea": {"category": "pulses", "base_price": 75, "unit": "kg", "image": "🫘", "description": "Tur dal, important pulse crop", "season": "Kharif", "harvest_time": "Nov-Dec"},
    "lentil": {"category": "pulses", "base_price": 80, "unit": "kg", "image": "🫘", "description": "Masoor dal, rich in protein and fiber", "season": "Rabi", "harvest_time": "Mar-Apr"},
    "kidney_beans": {"category": "pulses", "base_price": 90, "unit": "kg", "image": "🫘", "description": "Rajma, popular in North Indian cuisine", "season": "Kharif", "harvest_time": "Sep-Oct"},
    "field_pea": {"category": "pulses", "base_price": 55, "unit": "kg", "image": "🫛", "description": "Dried pea, used for dal preparation", "season": "Rabi", "harvest_time": "Mar-Apr"},
    
    # Vegetables
    "potato": {"category": "vegetables", "base_price": 12, "unit": "kg", "image": "🥔", "description": "Most consumed vegetable worldwide", "season": "Rabi", "harvest_time": "Feb-Mar"},
    "onion": {"category": "vegetables", "base_price": 15, "unit": "kg", "image": "🧅", "description": "Essential cooking ingredient, high export value", "season": "Rabi", "harvest_time": "Mar-May"},
    "tomato": {"category": "vegetables", "base_price": 25, "unit": "kg", "image": "🍅", "description": "Versatile vegetable, rich in vitamins", "season": "Year-round", "harvest_time": "Year-round"},
    "carrot": {"category": "vegetables", "base_price": 20, "unit": "kg", "image": "🥕", "description": "Root vegetable, rich in beta-carotene", "season": "Rabi", "harvest_time": "Jan-Mar"},
    "cabbage": {"category": "vegetables", "base_price": 18, "unit": "kg", "image": "🥬", "description": "Leafy vegetable, used in various cuisines", "season": "Rabi", "harvest_time": "Dec-Feb"},
    "cauliflower": {"category": "vegetables", "base_price": 22, "unit": "kg", "image": "🥦", "description": "Popular winter vegetable", "season": "Rabi", "harvest_time": "Dec-Feb"},
    "brinjal": {"category": "vegetables", "base_price": 28, "unit": "kg", "image": "🍆", "description": "Eggplant, popular in Indian cuisine", "season": "Year-round", "harvest_time": "Year-round"},
    "okra": {"category": "vegetables", "base_price": 35, "unit": "kg", "image": "🫴", "description": "Lady finger, high in vitamins", "season": "Kharif", "harvest_time": "Jun-Oct"},
    "chili": {"category": "vegetables", "base_price": 45, "unit": "kg", "image": "🌶️", "description": "Spice crop, high commercial value", "season": "Kharif", "harvest_time": "Sep-Nov"},
    "ginger": {"category": "vegetables", "base_price": 80, "unit": "kg", "image": "🫚", "description": "Spice and medicinal crop", "season": "Kharif", "harvest_time": "Dec-Jan"},
    "turmeric": {"category": "vegetables", "base_price": 120, "unit": "kg", "image": "🟡", "description": "Golden spice with medicinal properties", "season": "Kharif", "harvest_time": "Jan-Mar"},
    
    # Fruits
    "mango": {"category": "fruits", "base_price": 60, "unit": "kg", "image": "🥭", "description": "King of fruits, major export crop", "season": "Summer", "harvest_time": "Apr-Jun"},
    "banana": {"category": "fruits", "base_price": 30, "unit": "dozen", "image": "🍌", "description": "Year-round fruit, high nutritional value", "season": "Year-round", "harvest_time": "Year-round"},
    "apple": {"category": "fruits", "base_price": 120, "unit": "kg", "image": "🍎", "description": "Temperate fruit, premium market crop", "season": "Winter", "harvest_time": "Sep-Nov"},
    "orange": {"category": "fruits", "base_price": 40, "unit": "kg", "image": "🍊", "description": "Citrus fruit, rich in Vitamin C", "season": "Winter", "harvest_time": "Nov-Feb"},
    "grapes": {"category": "fruits", "base_price": 80, "unit": "kg", "image": "🍇", "description": "Table grapes and wine production", "season": "Winter", "harvest_time": "Jan-Mar"},
    "pomegranate": {"category": "fruits", "base_price": 100, "unit": "kg", "image": "🍎", "description": "Superfruit with high antioxidants", "season": "Winter", "harvest_time": "Oct-Feb"},
    "papaya": {"category": "fruits", "base_price": 25, "unit": "kg", "image": "🫐", "description": "Tropical fruit, enzyme-rich", "season": "Year-round", "harvest_time": "Year-round"},
    "watermelon": {"category": "fruits", "base_price": 12, "unit": "kg", "image": "🍉", "description": "Summer fruit, high water content", "season": "Summer", "harvest_time": "Apr-Jun"},
    "pineapple": {"category": "fruits", "base_price": 35, "unit": "piece", "image": "🍍", "description": "Tropical fruit, commercial processing", "season": "Year-round", "harvest_time": "Year-round"},
    "coconut": {"category": "fruits", "base_price": 15, "unit": "piece", "image": "🥥", "description": "Multipurpose palm fruit", "season": "Year-round", "harvest_time": "Year-round"},
    
    # Cash Crops
    "cotton": {"category": "cash_crops", "base_price": 55, "unit": "kg", "image": "☁️", "description": "White gold, major textile fiber", "season": "Kharif", "harvest_time": "Oct-Dec"},
    "sugarcane": {"category": "cash_crops", "base_price": 3, "unit": "kg", "image": "🎋", "description": "Sugar production, biofuel source", "season": "Year-round", "harvest_time": "Nov-Apr"},
    "jute": {"category": "cash_crops", "base_price": 4, "unit": "kg", "image": "🪢", "description": "Golden fiber, eco-friendly material", "season": "Kharif", "harvest_time": "Jul-Oct"},
    "tobacco": {"category": "cash_crops", "base_price": 150, "unit": "kg", "image": "🍃", "description": "Commercial crop, export oriented", "season": "Rabi", "harvest_time": "Mar-May"},
    
    # Oilseeds
    "mustard": {"category": "oilseeds", "base_price": 45, "unit": "kg", "image": "🌻", "description": "Oilseed crop, edible oil production", "season": "Rabi", "harvest_time": "Mar-Apr"},
    "sunflower": {"category": "oilseeds", "base_price": 50, "unit": "kg", "image": "🌻", "description": "Major oilseed, high oil content", "season": "Kharif", "harvest_time": "Nov-Dec"},
    "groundnut": {"category": "oilseeds", "base_price": 55, "unit": "kg", "image": "🥜", "description": "Peanut, oil and protein source", "season": "Kharif", "harvest_time": "Oct-Nov"},
    "soybean": {"category": "oilseeds", "base_price": 40, "unit": "kg", "image": "🫘", "description": "Protein-rich oilseed crop", "season": "Kharif", "harvest_time": "Sep-Oct"},
    "sesame": {"category": "oilseeds", "base_price": 120, "unit": "kg", "image": "🌰", "description": "Till, high-value oilseed", "season": "Kharif", "harvest_time": "Sep-Oct"},
    "safflower": {"category": "oilseeds", "base_price": 60, "unit": "kg", "image": "🌼", "description": "Drought-resistant oilseed", "season": "Rabi", "harvest_time": "Mar-Apr"},
    
    # Spices & Condiments
    "coriander": {"category": "spices", "base_price": 100, "unit": "kg", "image": "🌿", "description": "Aromatic spice, export quality", "season": "Rabi", "harvest_time": "Mar-Apr"},
    "cumin": {"category": "spices", "base_price": 400, "unit": "kg", "image": "🌿", "description": "High-value spice crop", "season": "Rabi", "harvest_time": "Mar-Apr"},
    "fenugreek": {"category": "spices", "base_price": 80, "unit": "kg", "image": "🌿", "description": "Methi, spice and vegetable use", "season": "Rabi", "harvest_time": "Mar-Apr"},
    "black_pepper": {"category": "spices", "base_price": 500, "unit": "kg", "image": "⚫", "description": "King of spices, high export value", "season": "Perennial", "harvest_time": "Nov-Feb"},
    "cardamom": {"category": "spices", "base_price": 1200, "unit": "kg", "image": "🌿", "description": "Queen of spices, premium market", "season": "Perennial", "harvest_time": "Oct-Dec"},
    
    # Plantation Crops
    "coffee": {"category": "plantation", "base_price": 250, "unit": "kg", "image": "☕", "description": "Arabica and Robusta varieties", "season": "Perennial", "harvest_time": "Nov-Feb"},
    "tea": {"category": "plantation", "base_price": 200, "unit": "kg", "image": "🍃", "description": "Major beverage crop, export oriented", "season": "Perennial", "harvest_time": "Year-round"},
    "rubber": {"category": "plantation", "base_price": 150, "unit": "kg", "image": "🌳", "description": "Industrial raw material", "season": "Perennial", "harvest_time": "Year-round"},
    
    # Medicinal & Aromatic Plants
    "aloe_vera": {"category": "medicinal", "base_price": 15, "unit": "kg", "image": "🪴", "description": "Medicinal plant, cosmetic use", "season": "Year-round", "harvest_time": "Year-round"},
    "mint": {"category": "medicinal", "base_price": 40, "unit": "kg", "image": "🌿", "description": "Aromatic herb, essential oil", "season": "Year-round", "harvest_time": "Year-round"},
    "basil": {"category": "medicinal", "base_price": 35, "unit": "kg", "image": "🌿", "description": "Holy basil, medicinal properties", "season": "Kharif", "harvest_time": "Sep-Oct"},
}

@app.get("/market")
async def market():
    """Enhanced market API with comprehensive crop data and realistic pricing"""
    dates = pd.date_range(end=pd.Timestamp.today().normalize(), periods=12, freq="W").strftime("%Y-%m-%d").tolist()
    
    # Use a more sophisticated random generator for consistent but realistic data
    rng = np.random.default_rng(42)
    data = {}
    
    for crop_name, crop_info in _COMPREHENSIVE_CROP_DATABASE.items():
        base_price = crop_info["base_price"]
        
        # Create more realistic price variations based on seasonality and market trends
        seasonal_factor = rng.uniform(0.8, 1.2)  # 20% seasonal variation
        market_trend = rng.uniform(-0.1, 0.15)   # Market trend factor
        
        # Generate price series with realistic volatility
        price_volatility = base_price * 0.05  # 5% base volatility
        price_changes = rng.normal(market_trend, price_volatility, len(dates))
        prices = [base_price * seasonal_factor]
        
        for change in price_changes[1:]:
            new_price = prices[-1] * (1 + change)
            # Ensure prices don't go too extreme
            new_price = max(base_price * 0.5, min(base_price * 2, new_price))
            prices.append(round(new_price, 2))
        
        # Generate demand based on price (inverse relationship) and seasonality
        base_demand = rng.uniform(60, 95)
        demand_values = []
        for price in prices:
            # Inverse price-demand relationship
            price_effect = (base_price / price) * 20  # Price elasticity effect
            seasonal_demand = rng.uniform(-10, 10)    # Seasonal demand variation
            demand = base_demand + price_effect + seasonal_demand
            demand = max(30, min(100, int(demand)))   # Keep demand between 30-100%
            demand_values.append(demand)
        
        data[crop_name] = {
            "prices": prices,
            "demand": demand_values,
            "category": crop_info["category"],
            "unit": crop_info["unit"],
            "image": crop_info["image"],
            "description": crop_info["description"],
            "season": crop_info["season"],
            "harvest_time": crop_info["harvest_time"]
        }
    
    return {"dates": dates, "series": data, "total_crops": len(data)}


@app.get("/weather")
async def weather(lat: float, lon: float, days: int = Query(default=12, ge=1, le=14)):
    # Use Open-Meteo API (no key required) for multi-day forecast
    try:
        # Limit days to maximum supported by API (14 days for free tier)
        forecast_days = min(days, 14)
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code"
            f"&timezone=auto&forecast_days={forecast_days}"
        )
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        j = r.json()
        daily = j.get("daily", {})
        return {
            "dates": daily.get("time", []),
            "temp_max": daily.get("temperature_2m_max", []),
            "temp_min": daily.get("temperature_2m_min", []),
            "precip": daily.get("precipitation_sum", []),
            "weather_code": daily.get("weather_code", []),
            "forecast_days": forecast_days,
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather fetch failed: {e}")


class LocationRequest(BaseModel):
    place_name: Optional[str] = Field(default=None, description="Place name for geocoding")
    latitude: Optional[float] = Field(default=None, description="Latitude coordinate")
    longitude: Optional[float] = Field(default=None, description="Longitude coordinate")

class SoilDataResponse(BaseModel):
    N: float
    P: float
    K: float
    ph: float
    temperature: float
    humidity: float
    rainfall: float
    location_name: str
    confidence_score: float
    source: str

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = Field(default=None, description="Session ID for conversation continuity")
    language: Optional[str] = Field(default="en", description="Language code: en, hi, mr")
    
class ChatResponse(BaseModel):
    reply: str
    session_id: str
    metadata: dict = {}


@app.post("/soil-data", response_model=SoilDataResponse)
async def get_soil_data(location: LocationRequest):
    """Get soil and environmental data based on location (place name or coordinates)."""
    try:
        lat, lon, location_name = None, None, "unknown"
        
        if location.place_name:
            # Get coordinates from place name
            lat, lon = _get_coordinates_from_place(location.place_name)
            location_name = location.place_name.lower()
        elif location.latitude is not None and location.longitude is not None:
            # Use provided coordinates
            lat, lon = location.latitude, location.longitude
            location_name = _get_location_from_coordinates(lat, lon)
        else:
            raise HTTPException(status_code=400, detail="Provide either place_name or coordinates")
        
        # Generate soil and environmental data
        soil_data = _generate_environmental_data(location_name, lat, lon)
        
        return SoilDataResponse(**soil_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch soil data: {str(e)}")


# Agricultural knowledge base
_CROP_KNOWLEDGE = {
    "rice": {
        "seasons": "Kharif (monsoon) - June to November",
        "soil_ph": "6.0-7.5",
        "water_need": "High (1200-2500mm)",
        "temperature": "20-35°C",
        "fertilizer": "High Nitrogen, moderate Phosphorus",
        "tips": "Needs flooded fields, transplant seedlings after 20-25 days"
    },
    "maize": {
        "seasons": "Kharif & Rabi - March-July, October-February", 
        "soil_ph": "6.0-7.5",
        "water_need": "Medium (500-800mm)",
        "temperature": "21-30°C",
        "fertilizer": "Balanced NPK with extra Nitrogen",
        "tips": "Plant in rows, good drainage essential"
    },
    "wheat": {
        "seasons": "Rabi - October to April",
        "soil_ph": "6.0-7.5", 
        "water_need": "Medium (450-650mm)",
        "temperature": "15-25°C",
        "fertilizer": "High Nitrogen at tillering stage",
        "tips": "Cool growing season, warm harvest time"
    },
    "cotton": {
        "seasons": "Kharif - April to October",
        "soil_ph": "5.8-8.0",
        "water_need": "Medium (700-1300mm)", 
        "temperature": "21-35°C",
        "fertilizer": "High Potassium, moderate Nitrogen",
        "tips": "Long growing season, requires pest management"
    },
    "sugarcane": {
        "seasons": "Tropical/Subtropical year-round depending on region",
        "soil_ph": "6.0-8.0",
        "water_need": "Very High (1500-2500mm)",
        "temperature": "20-35°C",
        "fertilizer": "High Nitrogen and Potassium, split doses",
        "tips": "Requires abundant water and sun; manage ratoon crops"
    },
    "tomato": {
        "seasons": "All seasons with frost-free climate",
        "soil_ph": "6.0-7.0",
        "water_need": "Medium",
        "temperature": "20-30°C",
        "fertilizer": "Balanced NPK with added Calcium",
        "tips": "Stake plants, manage blossom end rot with Ca and consistent watering"
    },
    "potato": {
        "seasons": "Cool season",
        "soil_ph": "5.5-6.5",
        "water_need": "Medium",
        "temperature": "15-25°C",
        "fertilizer": "High Potassium and Phosphorus",
        "tips": "Loose, well-drained soil; hill up soil around stems"
    },
    "onion": {
        "seasons": "Cool to mild season",
        "soil_ph": "6.0-7.0",
        "water_need": "Medium",
        "temperature": "12-25°C",
        "fertilizer": "Balanced NPK, Sulfur beneficial",
        "tips": "Requires day-length specific varieties"
    },
    "groundnut": {
        "seasons": "Kharif & Rabi",
        "soil_ph": "6.0-7.5",
        "water_need": "Medium",
        "temperature": "20-30°C",
        "fertilizer": "Calcium and Gypsum at pegging stage",
        "tips": "Light sandy soils preferred; avoid waterlogging"
    }
}

_FARMING_TIPS = {
    "organic": "Use compost, crop rotation, natural pest control, avoid chemical fertilizers",
    "irrigation": "Drip irrigation saves 40-60% water, check soil moisture before watering", 
    "pest_control": "Use integrated pest management, companion planting, beneficial insects",
    "soil_health": "Test soil every 2-3 years, add organic matter, maintain proper pH",
    "crop_rotation": "Rotate legumes with cereals, avoid same crop family consecutively"
}

@app.post("/chatbot", response_model=ChatResponse)
async def enhanced_chatbot(req: ChatRequest, request: Request):
    """Enhanced chatbot endpoint with OpenAI integration and conversation memory"""
    try:
        # Get client IP for rate limiting
        client_ip = request.client.host if request.client else "unknown"
        
        # Generate session ID if not provided
        session_id = req.session_id or str(uuid.uuid4())
        
        # Get the enhanced chatbot service
        chatbot_service = get_chatbot_service()
        
        # Process the message
        ai_response, metadata = await chatbot_service.process_message(
            session_id=session_id,
            user_message=req.message,
            language=req.language,
            user_ip=client_ip
        )
        
        return ChatResponse(
            reply=ai_response,
            session_id=session_id,
            metadata=metadata
        )
        
    except Exception as e:
        # Fallback error response
        error_messages = {
            "en": "I'm experiencing some technical difficulties. Please try again in a moment.",
            "hi": "मुझे कुछ तकनीकी कठिनाइयों का सामना करना पड़ रहा है। कृपया एक क्षण में पुनः प्रयास करें।",
            "mr": "मला काही तांत्रिक अडचणी येत आहेत. कृपया एका क्षणात पुन्हा प्रयत्न करा."
        }
        
        language = req.language or "en"
        session_id = req.session_id or str(uuid.uuid4())
        
        return ChatResponse(
            reply=error_messages.get(language, error_messages["en"]),
            session_id=session_id,
            metadata={"error": str(e), "source": "error_fallback"}
        )


@app.get("/chatbot/history/{session_id}")
async def get_conversation_history(session_id: str):
    """Get conversation history for a session"""
    try:
        chatbot_service = get_chatbot_service()
        history = chatbot_service.get_conversation_history(session_id)
        if history:
            return {"success": True, "history": history}
        else:
            return {"success": False, "message": "No conversation found for this session"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversation history: {str(e)}")


@app.delete("/chatbot/history/{session_id}")
async def clear_conversation_history(session_id: str):
    """Clear conversation history for a session"""
    try:
        chatbot_service = get_chatbot_service()
        success = chatbot_service.clear_conversation(session_id)
        if success:
            return {"success": True, "message": "Conversation history cleared"}
        else:
            return {"success": False, "message": "No conversation found for this session"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear conversation history: {str(e)}")


@app.get("/chatbot/stats")
async def get_chatbot_stats():
    """Get chatbot statistics and status"""
    try:
        chatbot_service = get_chatbot_service()
        stats = chatbot_service.get_conversation_stats()
        return {"success": True, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chatbot stats: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
