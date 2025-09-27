#!/usr/bin/env python3
"""
Test async OpenAI client
"""
import os
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_async_openai_api():
    try:
        # Get API key
        api_key = os.getenv("OPENAI_API_KEY")
        print(f"API Key loaded: {api_key[:20] + '...' if api_key else 'None'}")
        
        if not api_key:
            print("❌ No API key found in environment variables")
            return False
            
        # Initialize async client
        client = AsyncOpenAI(api_key=api_key)
        
        # Make a simple test request
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful agricultural assistant."},
                {"role": "user", "content": "Hello, can you help me with farming?"}
            ],
            max_tokens=100,
            temperature=0.3
        )
        
        print("✅ Async OpenAI API is working!")
        print(f"Response: {response.choices[0].message.content}")
        return True
        
    except Exception as e:
        print(f"❌ Async OpenAI API Error: {str(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(test_async_openai_api())