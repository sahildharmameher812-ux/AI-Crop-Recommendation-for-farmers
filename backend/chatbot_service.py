"""
Enhanced Chatbot Service with OpenAI Integration
Provides ChatGPT-like conversational AI for agricultural assistance
"""

import os
import json
import time
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict
import asyncio
from concurrent.futures import ThreadPoolExecutor

import openai
from openai import AsyncOpenAI
from pydantic import BaseModel
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ConversationMessage:
    """Represents a single message in a conversation"""
    id: str
    role: str  # 'user' or 'assistant' or 'system'
    content: str
    timestamp: datetime
    language: str = "en"
    metadata: Dict[str, Any] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'role': self.role,
            'content': self.content,
            'timestamp': self.timestamp.isoformat(),
            'language': self.language,
            'metadata': self.metadata or {}
        }

@dataclass
class ConversationSession:
    """Represents a conversation session with history"""
    session_id: str
    messages: List[ConversationMessage]
    created_at: datetime
    last_activity: datetime
    user_context: Dict[str, Any]
    language: str = "en"
    
    def add_message(self, message: ConversationMessage):
        self.messages.append(message)
        self.last_activity = datetime.now()
        
    def get_recent_messages(self, limit: int = 10) -> List[ConversationMessage]:
        return self.messages[-limit:] if len(self.messages) > limit else self.messages
        
    def to_dict(self) -> Dict[str, Any]:
        return {
            'session_id': self.session_id,
            'messages': [msg.to_dict() for msg in self.messages],
            'created_at': self.created_at.isoformat(),
            'last_activity': self.last_activity.isoformat(),
            'user_context': self.user_context,
            'language': self.language
        }

class RateLimiter:
    """Simple rate limiter for API requests"""
    def __init__(self, max_requests: int = 30, time_window: int = 60):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = defaultdict(list)
    
    def is_allowed(self, identifier: str) -> bool:
        now = time.time()
        # Clean old requests
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if now - req_time < self.time_window
        ]
        
        if len(self.requests[identifier]) >= self.max_requests:
            return False
            
        self.requests[identifier].append(now)
        return True

class EnhancedChatbotService:
    """Enhanced chatbot service with OpenAI integration and conversation memory"""
    
    def __init__(self):
        # Load configuration
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.use_openai = os.getenv("USE_OPENAI", "0") == "1"
        self.model = os.getenv("AI_MODEL", "gpt-4o-mini")
        self.temperature = float(os.getenv("AI_TEMPERATURE", "0.3"))
        self.max_tokens = int(os.getenv("AI_MAX_TOKENS", "800"))
        self.max_history = int(os.getenv("MAX_CONVERSATION_HISTORY", "20"))
        
        # Rate limiting
        self.enable_rate_limiting = os.getenv("ENABLE_RATE_LIMITING", "1") == "1"
        self.max_requests_per_minute = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "30"))
        self.rate_limiter = RateLimiter(self.max_requests_per_minute, 60)
        
        # Features
        self.enable_memory = os.getenv("ENABLE_CONVERSATION_MEMORY", "1") == "1"
        self.enable_context_injection = os.getenv("ENABLE_CONTEXT_INJECTION", "1") == "1"
        self.enable_fallback = os.getenv("ENABLE_FALLBACK_RESPONSES", "1") == "1"
        
        # Initialize OpenAI client
        if self.use_openai and self.openai_api_key:
            self.openai_client = AsyncOpenAI(api_key=self.openai_api_key)
        else:
            self.openai_client = None
            logger.warning("OpenAI not configured - using fallback responses only")
        
        # In-memory conversation storage (in production, use Redis/Database)
        self.conversations: Dict[str, ConversationSession] = {}
        
        # Thread pool for async operations
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Agricultural knowledge base
        self.crop_knowledge = self._load_crop_knowledge()
        self.farming_tips = self._load_farming_tips()
        
        # System prompts for different languages
        self.system_prompts = self._load_system_prompts()
        
    def _load_crop_knowledge(self) -> Dict[str, Any]:
        """Load comprehensive crop knowledge base"""
        return {
            "rice": {
                "seasons": "Kharif (monsoon) - June to November",
                "soil_ph": "6.0-7.5",
                "water_need": "High (1200-2500mm)",
                "temperature": "20-35°C",
                "fertilizer": "High Nitrogen, moderate Phosphorus",
                "tips": "Needs flooded fields, transplant seedlings after 20-25 days",
                "diseases": ["blast", "bacterial blight", "sheath blight"],
                "pests": ["brown planthopper", "stem borer", "gall midge"]
            },
            "maize": {
                "seasons": "Kharif & Rabi - March-July, October-February", 
                "soil_ph": "6.0-7.5",
                "water_need": "Medium (500-800mm)",
                "temperature": "21-30°C",
                "fertilizer": "Balanced NPK with extra Nitrogen",
                "tips": "Plant in rows, good drainage essential",
                "diseases": ["downy mildew", "rust", "ear rot"],
                "pests": ["fall armyworm", "corn borer", "cutworm"]
            },
            "wheat": {
                "seasons": "Rabi - October to April",
                "soil_ph": "6.0-7.5", 
                "water_need": "Medium (450-650mm)",
                "temperature": "15-25°C",
                "fertilizer": "High Nitrogen at tillering stage",
                "tips": "Cool growing season, warm harvest time",
                "diseases": ["rust", "smut", "powdery mildew"],
                "pests": ["aphids", "termites", "army worm"]
            }
            # Add more crops as needed
        }
    
    def _load_farming_tips(self) -> Dict[str, str]:
        """Load farming tips and best practices"""
        return {
            "organic_farming": "Use compost, crop rotation, natural pest control, avoid chemical fertilizers",
            "water_management": "Drip irrigation saves 40-60% water, check soil moisture before watering", 
            "pest_control": "Use integrated pest management, companion planting, beneficial insects",
            "soil_health": "Test soil every 2-3 years, add organic matter, maintain proper pH",
            "crop_rotation": "Rotate legumes with cereals, avoid same crop family consecutively",
            "sustainable_practices": "Minimize chemical inputs, preserve beneficial insects, maintain biodiversity"
        }
    
    def _load_system_prompts(self) -> Dict[str, str]:
        """Load system prompts for different languages"""
        return {
            "en": """You are CropGPT, an advanced AI agricultural assistant with deep expertise in farming, crop management, and sustainable agriculture. You provide intelligent, context-aware advice to farmers and agricultural professionals worldwide.

CORE CAPABILITIES:
- Crop recommendation and selection based on soil, climate, and market conditions
- Soil analysis and NPK management guidance
- Weather-based farming decisions and seasonal planning  
- Pest and disease identification and management
- Market analysis and profitability optimization
- Sustainable and organic farming practices
- Equipment and technology recommendations
- Government schemes and agricultural policies

CONVERSATION STYLE:
- Be conversational, friendly, and encouraging
- Use practical, actionable advice
- Include specific examples and step-by-step guidance
- Ask clarifying questions when needed
- Reference local conditions and practices when possible
- Use metric units (°C, mm, kg/ha, hectares)
- Include relevant emojis to make responses engaging

IMPORTANT GUIDELINES:
- Always prioritize farmer safety and sustainable practices
- Acknowledge regional variations and local expertise
- Suggest consulting local agricultural experts for specific problems
- If unsure about something, say so rather than guessing
- Encourage integrated approaches combining traditional and modern methods
- Consider economic viability in all recommendations

You have access to real-time crop data, weather information, market prices, and regional soil databases. Always provide evidence-based recommendations while being practical and cost-effective.""",

            "hi": """आप CropGPT हैं, एक उन्नत AI कृषि सहायक जो खेती, फसल प्रबंधन, और टिकाऊ कृषि में गहरी विशेषज्ञता रखते हैं। आप दुनिया भर के किसानों और कृषि पेशेवरों को बुद्धिमान, संदर्भ-जागरूक सलाह प्रदान करते हैं।

मुख्य क्षमताएं:
- मिट्टी, जलवायु और बाजार स्थितियों के आधार पर फसल सिफारिश
- मिट्टी विश्लेषण और NPK प्रबंधन मार्गदर्शन
- मौसम-आधारित कृषि निर्णय और मौसमी योजना
- कीट और रोग पहचान और प्रबंधन
- बाजार विश्लेषण और लाभप्रदता अनुकूलन
- टिकाऊ और जैविक कृषि प्रथाएं

बातचीत की शैली:
- बातचीत करने वाले, मैत्रीपूर्ण और उत्साहजनक बनें
- व्यावहारिक, कार्ययोग्य सलाह का उपयोग करें
- स्पष्ट उदाहरण और चरणबद्ध मार्गदर्शन शामिल करें""",

            "mr": """तुम्ही CropGPT आहात, एक प्रगत AI शेती सहाय्यक जो शेती, पिक व्यवस्थापन आणि टिकाऊ शेतीमध्ये सखोल तज्ञता धरावा आहे।

मुख्य क्षमता:
- माती, हवामान आणि बाजार परिस्थितीच्या आधारावर पिक शिफारस
- माती विश्लेषण आणि NPK व्यवस्थापन मार्गदर्शन
- हवामान-आधारित शेती निर्णय आणि हंगामी नियोजन
- किटक आणि रोग ओळख आणि व्यवस्थापन

संभाषण शैली:
- संभाषणात्मक, मैत्रीपूर्ण आणि उत्साहवर्धक व्हा
- व्यावहारिक, कृती-योग्य सल्ला वापरा
- विशिष्ट उदाहरणे आणि टप्प्याटप्प्याने मार्गदर्शन समाविष्ट करा"""
        }
    
    def get_or_create_session(self, session_id: str, language: str = "en") -> ConversationSession:
        """Get existing conversation session or create new one"""
        if session_id not in self.conversations:
            now = datetime.now()
            session = ConversationSession(
                session_id=session_id,
                messages=[],
                created_at=now,
                last_activity=now,
                user_context={},
                language=language
            )
            self.conversations[session_id] = session
        return self.conversations[session_id]
    
    def _build_context_messages(self, session: ConversationSession, user_message: str) -> List[Dict[str, str]]:
        """Build context messages for OpenAI API including system prompt and conversation history"""
        messages = []
        
        # Add system prompt
        system_prompt = self.system_prompts.get(session.language, self.system_prompts["en"])
        messages.append({"role": "system", "content": system_prompt})
        
        # Add knowledge context if enabled
        if self.enable_context_injection:
            context_info = self._extract_context_info(user_message, session)
            if context_info:
                messages.append({"role": "system", "content": f"Additional Context: {context_info}"})
        
        # Add conversation history
        if self.enable_memory:
            recent_messages = session.get_recent_messages(self.max_history - 2)  # Reserve space for system messages
            for msg in recent_messages:
                if msg.role in ["user", "assistant"]:
                    messages.append({
                        "role": msg.role,
                        "content": msg.content
                    })
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        return messages
    
    def _extract_context_info(self, user_message: str, session: ConversationSession) -> str:
        """Extract and inject relevant context information"""
        context_parts = []
        
        # Check for crop mentions and add relevant knowledge
        user_message_lower = user_message.lower()
        for crop, info in self.crop_knowledge.items():
            if crop in user_message_lower:
                context_parts.append(f"{crop.title()}: {info}")
                break
        
        # Add farming tips if relevant keywords are found
        tip_keywords = ["organic", "pest", "soil", "water", "irrigation", "rotation"]
        for keyword in tip_keywords:
            if keyword in user_message_lower:
                for tip_key, tip_value in self.farming_tips.items():
                    if keyword in tip_key:
                        context_parts.append(f"{tip_key.replace('_', ' ').title()}: {tip_value}")
        
        # Add user context from previous conversations
        if session.user_context:
            context_parts.append(f"User Context: {json.dumps(session.user_context)}")
        
        return " | ".join(context_parts[:3])  # Limit context to avoid token overflow
    
    async def _call_openai_api(self, messages: List[Dict[str, str]]) -> str:
        """Make API call to OpenAI with retry logic"""
        max_retries = 3
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                response = await self.openai_client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                    top_p=0.9,
                    frequency_penalty=0.1,
                    presence_penalty=0.1
                )
                
                return response.choices[0].message.content.strip()
                
            except openai.RateLimitError:
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))
                    continue
                raise Exception("Rate limit exceeded. Please try again later.")
                
            except openai.APIError as e:
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (2 ** attempt))
                    continue
                raise Exception(f"OpenAI API error: {str(e)}")
                
            except Exception as e:
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay)
                    continue
                raise Exception(f"Unexpected error: {str(e)}")
    
    def _get_fallback_response(self, user_message: str, language: str = "en") -> str:
        """Generate fallback response when OpenAI is unavailable"""
        user_message_lower = user_message.lower()
        
        # Language-specific responses
        responses = {
            "en": {
                "greetings": ["hello", "hi", "hey", "good morning", "good evening"],
                "greeting_response": "🌱 Hello! I'm your AI farming assistant. How can I help you with your agricultural needs today?",
                "crop_questions": ["crop", "plant", "grow", "recommend"],
                "crop_response": "🌾 For crop recommendations, I'd need to know your location, soil type, and current season. Could you provide more details?",
                "soil_questions": ["soil", "npk", "ph", "fertilizer"],
                "soil_response": "🧪 Soil health is crucial for good crops! Generally, maintain pH 6.0-7.5, ensure balanced NPK, and add organic matter regularly.",
                "default": "🤖 I'm here to help with farming questions! Ask me about crops, soil, weather, or farming techniques."
            },
            "hi": {
                "greetings": ["नमस्ते", "हैलो", "नमस्कार"],
                "greeting_response": "🌱 नमस्ते! मैं आपका AI कृषि सहायक हूँ। आज मैं आपकी कृषि संबंधी किस आवश्यकता में मदद कर सकता हूँ?",
                "crop_questions": ["फसल", "बोना", "उगाना", "सिफारिश"],
                "crop_response": "🌾 फसल सिफारिश के लिए, मुझे आपका स्थान, मिट्टी का प्रकार और वर्तमान मौसम जानना होगा।",
                "default": "🤖 मैं कृषि प्रश्नों में मदद के लिए यहाँ हूँ! मुझसे फसलों, मिट्टी, मौसम या कृषि तकनीकों के बारे में पूछें।"
            }
        }
        
        lang_responses = responses.get(language, responses["en"])
        
        # Check for greeting
        if any(greeting in user_message_lower for greeting in lang_responses.get("greetings", [])):
            return lang_responses["greeting_response"]
        
        # Check for crop questions
        if any(word in user_message_lower for word in lang_responses.get("crop_questions", [])):
            return lang_responses["crop_response"]
        
        # Check for soil questions
        if any(word in user_message_lower for word in lang_responses.get("soil_questions", [])):
            return lang_responses.get("soil_response", lang_responses["default"])
        
        return lang_responses["default"]
    
    async def process_message(
        self, 
        session_id: str, 
        user_message: str, 
        language: str = "en",
        user_ip: str = "unknown"
    ) -> Tuple[str, Dict[str, Any]]:
        """Process user message and return AI response with metadata"""
        
        # Rate limiting check
        if self.enable_rate_limiting and not self.rate_limiter.is_allowed(user_ip):
            error_msg = {
                "en": "Too many requests. Please wait a moment before sending another message.",
                "hi": "बहुत सारे अनुरोध। कृपया दूसरा संदेश भेजने से पहले थोड़ा इंतज़ार करें।",
                "mr": "खूप विनंत्या. कृपया दुसरा संदेश पाठवण्यापूर्वी थोडा वाट पहा."
            }
            return error_msg.get(language, error_msg["en"]), {"error": "rate_limit_exceeded"}
        
        # Get or create conversation session
        session = self.get_or_create_session(session_id, language)
        
        # Add user message to session
        user_msg = ConversationMessage(
            id=f"user_{int(time.time() * 1000)}",
            role="user",
            content=user_message,
            timestamp=datetime.now(),
            language=language
        )
        session.add_message(user_msg)
        
        # Generate response
        try:
            if self.use_openai and self.openai_client:
                # Build context messages
                context_messages = self._build_context_messages(session, user_message)
                
                # Call OpenAI API
                ai_response = await self._call_openai_api(context_messages)
                response_source = "openai"
            else:
                # Use fallback response
                ai_response = self._get_fallback_response(user_message, language)
                response_source = "fallback"
        
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            if self.enable_fallback:
                ai_response = self._get_fallback_response(user_message, language)
                response_source = "fallback_error"
            else:
                error_messages = {
                    "en": "I'm having trouble processing your request. Please try again later.",
                    "hi": "मुझे आपका अनुरोध संसाधित करने में परेशानी हो रही है। कृपया बाद में पुनः प्रयास करें।",
                    "mr": "मला तुमची विनंती प्रक्रिया करण्यात अडचण येत आहे. कृपया नंतर पुन्हा प्रयत्न करा."
                }
                return error_messages.get(language, error_messages["en"]), {"error": str(e)}
        
        # Add AI response to session
        ai_msg = ConversationMessage(
            id=f"assistant_{int(time.time() * 1000)}",
            role="assistant",
            content=ai_response,
            timestamp=datetime.now(),
            language=language,
            metadata={"source": response_source}
        )
        session.add_message(ai_msg)
        
        # Update user context (extract useful information for future conversations)
        self._update_user_context(session, user_message, ai_response)
        
        # Prepare metadata
        metadata = {
            "session_id": session_id,
            "message_count": len(session.messages),
            "source": response_source,
            "language": language,
            "timestamp": datetime.now().isoformat(),
            "has_context": self.enable_context_injection,
            "has_memory": self.enable_memory
        }
        
        return ai_response, metadata
    
    def _update_user_context(self, session: ConversationSession, user_message: str, ai_response: str):
        """Update user context based on conversation"""
        user_message_lower = user_message.lower()
        
        # Extract location mentions
        location_keywords = ["farm", "field", "location", "area", "region", "state", "country"]
        if any(keyword in user_message_lower for keyword in location_keywords):
            # Simple extraction - in production, use NLP
            words = user_message.split()
            for i, word in enumerate(words):
                if word.lower() in location_keywords and i + 1 < len(words):
                    session.user_context["location"] = words[i + 1]
                    break
        
        # Extract crop interests
        mentioned_crops = []
        for crop in self.crop_knowledge.keys():
            if crop in user_message_lower:
                mentioned_crops.append(crop)
        if mentioned_crops:
            session.user_context["interested_crops"] = list(set(
                session.user_context.get("interested_crops", []) + mentioned_crops
            ))
        
        # Extract farming type preferences
        farming_types = ["organic", "conventional", "sustainable", "hydroponic"]
        for farming_type in farming_types:
            if farming_type in user_message_lower:
                session.user_context["farming_preference"] = farming_type
                break
    
    def get_conversation_history(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get conversation history for a session"""
        session = self.conversations.get(session_id)
        return session.to_dict() if session else None
    
    def clear_conversation(self, session_id: str) -> bool:
        """Clear conversation history for a session"""
        if session_id in self.conversations:
            del self.conversations[session_id]
            return True
        return False
    
    def get_conversation_stats(self) -> Dict[str, Any]:
        """Get statistics about active conversations"""
        now = datetime.now()
        active_sessions = 0
        total_messages = 0
        
        for session in self.conversations.values():
            if now - session.last_activity < timedelta(hours=24):
                active_sessions += 1
            total_messages += len(session.messages)
        
        return {
            "total_sessions": len(self.conversations),
            "active_sessions_24h": active_sessions,
            "total_messages": total_messages,
            "openai_enabled": self.use_openai,
            "features": {
                "memory": self.enable_memory,
                "context_injection": self.enable_context_injection,
                "rate_limiting": self.enable_rate_limiting,
                "fallback": self.enable_fallback
            }
        }

# Global instance
chatbot_service = None

def get_chatbot_service() -> EnhancedChatbotService:
    """Get the global chatbot service instance"""
    global chatbot_service
    if chatbot_service is None:
        chatbot_service = EnhancedChatbotService()
    return chatbot_service