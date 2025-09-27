@echo off
echo Installing Crop Recommendation System...
echo.

echo Step 1: Setting up Python backend...
cd backend
echo Installing Python dependencies...
pip install --upgrade pip
pip install fastapi uvicorn requests geopy python-multipart
pip install pandas numpy scikit-learn --only-binary=all
echo Backend setup complete!
cd ..

echo.
echo Step 2: Setting up Node.js frontend...
cd frontend
echo Installing Node.js dependencies...
npm install
echo Frontend setup complete!
cd ..

echo.
echo Setup complete! 
echo.
echo To start the application:
echo 1. Backend: cd backend && python app.py
echo 2. Frontend: cd frontend && npm run dev
echo.
echo Your crop recommendation system is ready!
pause

@echo off
echo 🌱 Setting up AI-Based Crop Recommendation for Farmers...
echo.

echo 📦 Installing backend dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Backend installation failed
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed successfully!
echo.

echo 📦 Installing frontend dependencies...
cd ..\frontend
npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend installation failed
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully!
echo.

echo 🎉 Setup complete! 
echo.
echo To start the application:
echo 1. Backend: cd backend && python app.py
echo 2. Frontend: cd frontend && npm run dev
echo.
echo Then visit http://localhost:3000
echo.
pause