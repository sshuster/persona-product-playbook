
import asyncio
import json
import random
from typing import List, Dict, Any
from models import Persona, Company, Message

class OllamaService:
    def __init__(self, model_name: str = "qwen2.5:0.5b"):
        self.model_name = model_name
        self.base_url = "http://localhost:11434"
        
        # Question templates for different stages
        self.question_templates = [
            "I'm new to {product} and I'm not sure where to start. What are the basic features I should know about?",
            "How do I set up my account for {product}? Are there any important settings I should configure first?",
            "What are the most common tasks people use {product} for in my role as a {role}?",
            "I'm having trouble understanding how to navigate the {product} interface. Can you guide me through it?",
            "What are some best practices for using {product} effectively in my daily work?",
            "How do I integrate {product} with other tools I'm already using?",
            "Are there any common mistakes I should avoid when starting with {product}?",
            "What training resources or documentation would you recommend for {product}?",
            "How do I measure success or track my progress with {product}?",
            "What are the key differences between {product} and similar tools I might have used before?"
        ]
        
        # Response templates for different statuses
        self.response_templates = {
            'satisfied': [
                "That's exactly what I needed to know! Thank you for the clear explanation. I feel much more confident about using {product} now.",
                "Perfect! That answered my question completely. I think I have everything I need to get started with {product}.",
                "Great advice! That makes total sense and I can see how it applies to my work as a {role}. I'm ready to try it out.",
                "Excellent suggestion! I hadn't thought about it that way. This will definitely help me use {product} more effectively.",
                "Thank you! That's a comprehensive answer that covers all my concerns about {product}. I'm excited to implement this."
            ],
            'needs_more': [
                "That's helpful, but I'm still a bit confused about the specific steps. Could you walk me through it in more detail?",
                "I understand the concept, but I'm not sure how to apply it to my specific situation as a {role}. Can you give me a more concrete example?",
                "Thanks for the explanation! I have a follow-up question though - what if I encounter specific issues while using {product}?",
                "That makes sense, but I'm wondering about the technical requirements. What do I need to have in place before I can use {product} this way?",
                "Good point! But how does this feature in {product} compare to what I'm currently doing? Will I need to change my entire workflow?"
            ],
            'unclear': [
                "I'm not sure I follow. Could you explain that in simpler terms? I'm fairly new to this type of technology.",
                "That's interesting, but I don't think that addresses my specific question about {product}. Could you clarify?",
                "I'm a bit lost. Can we step back and focus on the basics of {product} first?",
                "I think there might be some confusion. Let me rephrase my question about {product}...",
                "That sounds complex. Is there a simpler way to approach this with {product}?"
            ]
        }

    async def call_ollama(self, prompt: str, system_prompt: str = "") -> str:
        """Call Ollama API with the given prompt"""
        try:
            import aiohttp
            
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "system": system_prompt,
                "stream": False
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.base_url}/api/generate", json=payload) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get("response", "")
                    else:
                        raise Exception(f"Ollama API error: {response.status}")
                        
        except Exception as e:
            print(f"Error calling Ollama: {e}")
            # Fallback to template-based responses for demo purposes
            return self._fallback_response(prompt)

    def _fallback_response(self, prompt: str) -> str:
        """Fallback response when Ollama is not available"""
        if "question" in prompt.lower():
            return random.choice(self.question_templates)
        else:
            return "I understand your suggestion. Let me think about how to apply this to my situation."

    async def generate_persona_question(self, persona: Persona, company: Company, message_history: List[Message]) -> str:
        """Generate a question from the AI persona about the product"""
        
        # Count previous questions to determine complexity
        question_count = len([m for m in message_history if m.type == 'persona_question'])
        
        # Create context for the AI
        persona_context = f"""
You are {persona.name}, a {persona.role}. 
Background: {persona.background}
Expertise: {', '.join(persona.expertise) if persona.expertise else 'General knowledge'}

You are learning about {company.product} from {company.name}.
Product description: {company.description}

Generate a realistic question about {company.product} that someone in your role would ask.
"""
        
        if question_count == 0:
            prompt = f"As {persona.name}, ask an introductory question about getting started with {company.product}. Keep it conversational and specific to your role as a {persona.role}."
        elif question_count < 3:
            prompt = f"As {persona.name}, ask a follow-up question about using {company.product} in your daily work. Be specific about practical usage."
        else:
            prompt = f"As {persona.name}, ask an advanced question about optimizing or integrating {company.product} with other tools."
        
        try:
            response = await self.call_ollama(prompt, persona_context)
            # If Ollama response is too short or generic, use template
            if len(response.strip()) < 20:
                return self._get_template_question(persona, company, question_count)
            return response.strip()
        except:
            return self._get_template_question(persona, company, question_count)

    def _get_template_question(self, persona: Persona, company: Company, question_count: int) -> str:
        """Get a template-based question as fallback"""
        if question_count == 0:
            template = self.question_templates[0]
        elif question_count < 3:
            template = random.choice(self.question_templates[1:6])
        else:
            template = random.choice(self.question_templates[6:])
        
        question = template.format(product=company.product, role=persona.role, company=company.name)
        
        if persona.expertise:
            question += f" Given my background in {', '.join(persona.expertise)}, are there any specific features I should focus on?"
        
        return question

    async def generate_persona_response(self, persona: Persona, company: Company, message_history: List[Message]) -> Dict[str, Any]:
        """Generate a response from the AI persona to a user suggestion"""
        
        # Get the last user suggestion
        last_suggestion = None
        for message in reversed(message_history):
            if message.type == 'user_suggestion':
                last_suggestion = message
                break
        
        if not last_suggestion:
            return {
                "content": "I didn't receive any suggestion. Could you please provide some guidance?",
                "status": "unclear"
            }
        
        # Analyze suggestion quality
        suggestion_length = len(last_suggestion.content)
        has_specific_terms = any(term in last_suggestion.content.lower() for term in 
                                ['step', 'how', 'guide', 'tutorial', 'example', 'feature', 'setting', 'configure'])
        mentions_product = company.product.lower() in last_suggestion.content.lower()
        
        # Determine response status
        if suggestion_length > 100 and has_specific_terms and mentions_product:
            status = 'satisfied' if random.random() > 0.3 else 'needs_more'
        elif suggestion_length > 50 and (has_specific_terms or mentions_product):
            status = 'needs_more' if random.random() > 0.5 else 'satisfied'
        else:
            status = 'unclear' if random.random() > 0.7 else 'needs_more'
        
        # Create context for AI response
        persona_context = f"""
You are {persona.name}, a {persona.role}.
Background: {persona.background}
You asked a question about {company.product} and received this suggestion: "{last_suggestion.content}"

Respond as {persona.name} would, evaluating if the suggestion helps answer your question.
Your response should indicate if you're satisfied, need more help, or found the suggestion unclear.
"""
        
        prompt = f"Respond to this suggestion about {company.product}: '{last_suggestion.content}'. Be conversational and authentic."
        
        try:
            ai_response = await self.call_ollama(prompt, persona_context)
            if len(ai_response.strip()) < 20:
                content = self._get_template_response(persona, company, status)
            else:
                content = ai_response.strip()
        except:
            content = self._get_template_response(persona, company, status)
        
        # Add follow-up context for 'needs_more' responses
        if status == 'needs_more':
            follow_ups = [
                " Specifically, I'd like to know more about the implementation process.",
                " Also, what are the potential challenges I might face?",
                " Could you provide a step-by-step breakdown?",
                " What would be the timeline for getting this set up?",
                " Are there any prerequisites I should be aware of?"
            ]
            content += random.choice(follow_ups)
        
        return {
            "content": content,
            "status": status
        }

    def _get_template_response(self, persona: Persona, company: Company, status: str) -> str:
        """Get a template-based response as fallback"""
        templates = self.response_templates[status]
        response = random.choice(templates)
        return response.format(product=company.product, role=persona.role, company=company.name)
