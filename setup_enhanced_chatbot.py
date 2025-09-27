#!/usr/bin/env python3
"""
Enhanced Chatbot Setup Script
Installs dependencies and configures the environment for the upgraded crop recommendation chatbot
"""

import os
import sys
import subprocess
import shutil
import json
from pathlib import Path

def run_command(command, check=True):
    """Run a command and return the result"""
    print(f"Running: {command}")
    try:
        result = subprocess.run(command, shell=True, check=check, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return result
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        return e

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor} detected")
    return True

def check_node_version():
    """Check if Node.js is available"""
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js {result.stdout.strip()} detected")
            return True
        else:
            print("❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False

def setup_backend():
    """Setup backend dependencies"""
    print("\n🔧 Setting up backend...")
    
    backend_dir = Path(__file__).parent / "backend"
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    os.chdir(backend_dir)
    
    # Check if virtual environment exists
    venv_dir = backend_dir / "venv"
    if not venv_dir.exists():
        print("Creating virtual environment...")
        run_command(f"{sys.executable} -m venv venv")
    
    # Determine activation script
    if os.name == 'nt':  # Windows
        activate_script = venv_dir / "Scripts" / "activate.bat"
        python_exec = venv_dir / "Scripts" / "python.exe"
        pip_exec = venv_dir / "Scripts" / "pip.exe"
    else:  # Unix/Linux/macOS
        activate_script = venv_dir / "bin" / "activate"
        python_exec = venv_dir / "bin" / "python"
        pip_exec = venv_dir / "bin" / "pip"
    
    # Install dependencies
    print("Installing Python dependencies...")
    run_command(f'"{pip_exec}" install --upgrade pip')
    run_command(f'"{pip_exec}" install -r requirements.txt')
    
    print("✅ Backend setup complete")
    return True

def setup_frontend():
    """Setup frontend dependencies"""
    print("\n🔧 Setting up frontend...")
    
    frontend_dir = Path(__file__).parent / "frontend"
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    os.chdir(frontend_dir)
    
    # Install npm dependencies
    print("Installing Node.js dependencies...")
    run_command("npm install")
    
    print("✅ Frontend setup complete")
    return True

def create_env_file():
    """Create .env file with default configuration"""
    print("\n📝 Creating environment configuration...")
    
    backend_dir = Path(__file__).parent / "backend"
    env_file = backend_dir / ".env"
    
    if env_file.exists():
        print("⚠️ .env file already exists, backing up as .env.backup")
        shutil.copy(env_file, backend_dir / ".env.backup")
    
    env_content = """# AI Configuration - REPLACE WITH YOUR ACTUAL API KEY
OPENAI_API_KEY=your_openai_api_key_here
USE_OPENAI=1

# Application Settings
DEBUG=1
MAX_CONVERSATION_HISTORY=20
AI_MODEL=gpt-4o-mini
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=800

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=30
ENABLE_RATE_LIMITING=1

# Features
ENABLE_CONVERSATION_MEMORY=1
ENABLE_CONTEXT_INJECTION=1
ENABLE_FALLBACK_RESPONSES=1
"""
    
    with open(env_file, 'w') as f:
        f.write(env_content)
    
    print("✅ Environment file created at backend/.env")
    print("⚠️  IMPORTANT: Replace 'your_openai_api_key_here' with your actual OpenAI API key")
    return True

def run_tests():
    """Run basic tests to verify setup"""
    print("\n🧪 Running basic tests...")
    
    backend_dir = Path(__file__).parent / "backend"
    
    # Test Python imports
    print("Testing Python dependencies...")
    test_imports = [
        "import fastapi",
        "import openai", 
        "import pandas",
        "import numpy",
        "import sklearn",
        "import geopy",
        "from dotenv import load_dotenv"
    ]
    
    venv_python = None
    if os.name == 'nt':
        venv_python = backend_dir / "venv" / "Scripts" / "python.exe"
    else:
        venv_python = backend_dir / "venv" / "bin" / "python"
    
    for import_test in test_imports:
        result = run_command(f'"{venv_python}" -c "{import_test}"', check=False)
        if result.returncode == 0:
            print(f"✅ {import_test.split()[-1]} imported successfully")
        else:
            print(f"❌ Failed to import {import_test.split()[-1]}")
    
    print("✅ Basic tests complete")

def display_usage_instructions():
    """Display usage instructions"""
    print("\n" + "="*60)
    print("🎉 ENHANCED CHATBOT SETUP COMPLETE!")
    print("="*60)
    
    print("\n📋 NEXT STEPS:")
    print("1. Edit backend/.env and add your OpenAI API key")
    print("2. Start the backend server:")
    if os.name == 'nt':
        print("   cd backend")
        print("   venv\\Scripts\\activate")
        print("   python app.py")
    else:
        print("   cd backend")
        print("   source venv/bin/activate")
        print("   python app.py")
    
    print("\n3. In another terminal, start the frontend:")
    print("   cd frontend")
    print("   npm run dev")
    
    print("\n🚀 ENHANCED FEATURES:")
    print("✨ OpenAI GPT-4 integration for intelligent responses")
    print("💾 Conversation persistence across sessions")
    print("🎯 Smart context injection with crop knowledge")
    print("⚡ Rate limiting and error handling")
    print("📊 Session management and conversation history")
    print("💬 Multi-language support (EN/HI/MR)")
    print("📈 Export conversation functionality")
    print("🔄 Automatic conversation memory")
    
    print("\n⚠️  IMPORTANT NOTES:")
    print("• You MUST add a valid OpenAI API key to use AI features")
    print("• Without OpenAI key, the chatbot will use fallback responses")
    print("• Conversation history is stored in browser localStorage")
    print("• Rate limiting is enabled by default (30 requests/minute)")
    
    print("\n🔗 API ENDPOINTS:")
    print("• POST /chatbot - Enhanced chat with session management")
    print("• GET /chatbot/history/{session_id} - Get conversation history")
    print("• DELETE /chatbot/history/{session_id} - Clear conversation")
    print("• GET /chatbot/stats - Get chatbot statistics")

def main():
    """Main setup function"""
    print("🤖 Enhanced Crop AI Chatbot Setup")
    print("=" * 40)
    
    # Check prerequisites
    if not check_python_version():
        sys.exit(1)
    
    if not check_node_version():
        print("⚠️  Node.js not found. Frontend setup will be skipped.")
        print("Please install Node.js from https://nodejs.org/")
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        sys.exit(1)
    
    # Setup frontend (if Node.js available)
    if check_node_version():
        if not setup_frontend():
            print("❌ Frontend setup failed")
            sys.exit(1)
    
    # Create environment configuration
    create_env_file()
    
    # Run tests
    run_tests()
    
    # Display usage instructions
    display_usage_instructions()
    
    print("\n✅ Setup completed successfully!")

if __name__ == "__main__":
    main()