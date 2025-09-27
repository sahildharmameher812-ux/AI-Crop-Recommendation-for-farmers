#!/usr/bin/env python3
"""
Test script to verify OpenAI API key is working
"""
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_openai_api():
    try:
        # Get API key
        api_key = os.getenv("OPENAI_API_KEY")
        print(f"API Key loaded: {api_key[:20] + '...' if api_key else 'None'}")
        
        if not api_key:
            print("❌ No API key found in environment variables")
            return False
            
        # Initialize client
        client = OpenAI(api_key=api_key)
        
        # Make a simple test request
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful agricultural assistant."},
                {"role": "user", "content": "Hello, can you help me with farming?"}
            ],
            max_tokens=100,
            temperature=0.3
        )
        
        print("✅ OpenAI API is working!")
        print(f"Response: {response.choices[0].message.content}")
        return True
        
    except Exception as e:
        print(f"❌ OpenAI API Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_openai_api()