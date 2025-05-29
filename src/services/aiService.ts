
import { Persona, Company } from '@/pages/Index';

interface Message {
  id: string;
  type: 'persona_question' | 'user_suggestion' | 'persona_response' | 'system';
  content: string;
  timestamp: Date;
  status?: 'satisfied' | 'needs_more' | 'unclear';
}

interface PersonaResponse {
  content: string;
  status: 'satisfied' | 'needs_more' | 'unclear';
}

// Mock AI service that simulates Ollama/Qwen2.5:0.5b responses
class AIService {
  private questionTemplates = [
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
  ];

  private responseTemplates = {
    satisfied: [
      "That's exactly what I needed to know! Thank you for the clear explanation. I feel much more confident about using {product} now.",
      "Perfect! That answered my question completely. I think I have everything I need to get started with {product}.",
      "Great advice! That makes total sense and I can see how it applies to my work as a {role}. I'm ready to try it out.",
      "Excellent suggestion! I hadn't thought about it that way. This will definitely help me use {product} more effectively.",
      "Thank you! That's a comprehensive answer that covers all my concerns about {product}. I'm excited to implement this."
    ],
    needs_more: [
      "That's helpful, but I'm still a bit confused about the specific steps. Could you walk me through it in more detail?",
      "I understand the concept, but I'm not sure how to apply it to my specific situation as a {role}. Can you give me a more concrete example?",
      "Thanks for the explanation! I have a follow-up question though - what if I encounter [specific scenario] while using {product}?",
      "That makes sense, but I'm wondering about the technical requirements. What do I need to have in place before I can use {product} this way?",
      "Good point! But how does this feature in {product} compare to what I'm currently doing? Will I need to change my entire workflow?"
    ],
    unclear: [
      "I'm not sure I follow. Could you explain that in simpler terms? I'm fairly new to this type of technology.",
      "That's interesting, but I don't think that addresses my specific question about {product}. Could you clarify?",
      "I'm a bit lost. Can we step back and focus on the basics of {product} first?",
      "I think there might be some confusion. Let me rephrase my question about {product}...",
      "That sounds complex. Is there a simpler way to approach this with {product}?"
    ]
  };

  async generatePersonaQuestion(persona: Persona, company: Company, messageHistory: Message[]): Promise<string> {
    // Simulate API delay
    await this.delay(1000 + Math.random() * 2000);

    // Determine question complexity based on conversation length
    const questionCount = messageHistory.filter(m => m.type === 'persona_question').length;
    let template: string;

    if (questionCount === 0) {
      // First question - basic introduction
      template = this.questionTemplates[0];
    } else if (questionCount < 3) {
      // Early questions - fundamental usage
      template = this.questionTemplates[Math.floor(Math.random() * 5) + 1];
    } else {
      // Advanced questions - integration and optimization
      template = this.questionTemplates[Math.floor(Math.random() * 5) + 5];
    }

    // Replace placeholders
    let question = template
      .replace(/{product}/g, company.product)
      .replace(/{role}/g, persona.role)
      .replace(/{company}/g, company.name);

    // Add persona-specific context
    if (persona.expertise.length > 0) {
      question += ` Given my background in ${persona.expertise.join(', ')}, are there any specific features I should focus on?`;
    }

    return question;
  }

  async generatePersonaResponse(persona: Persona, company: Company, messageHistory: Message[]): Promise<PersonaResponse> {
    // Simulate API delay
    await this.delay(1500 + Math.random() * 2000);

    const lastSuggestion = messageHistory.filter(m => m.type === 'user_suggestion').pop();
    if (!lastSuggestion) {
      return {
        content: "I didn't receive any suggestion. Could you please provide some guidance?",
        status: 'unclear'
      };
    }

    // Analyze suggestion quality (simplified logic)
    const suggestionLength = lastSuggestion.content.length;
    const hasSpecificTerms = /step|how|guide|tutorial|example|feature|setting|configure/i.test(lastSuggestion.content);
    const mentionsProduct = lastSuggestion.content.toLowerCase().includes(company.product.toLowerCase());

    let status: 'satisfied' | 'needs_more' | 'unclear';
    let responseCategory: keyof typeof this.responseTemplates;

    // Determine response type based on suggestion analysis
    if (suggestionLength > 100 && hasSpecificTerms && mentionsProduct) {
      status = Math.random() > 0.3 ? 'satisfied' : 'needs_more';
    } else if (suggestionLength > 50 && (hasSpecificTerms || mentionsProduct)) {
      status = Math.random() > 0.5 ? 'needs_more' : 'satisfied';
    } else {
      status = Math.random() > 0.7 ? 'unclear' : 'needs_more';
    }

    responseCategory = status;
    const templates = this.responseTemplates[responseCategory];
    let response = templates[Math.floor(Math.random() * templates.length)];

    // Replace placeholders
    response = response
      .replace(/{product}/g, company.product)
      .replace(/{role}/g, persona.role)
      .replace(/{company}/g, company.name);

    // Add follow-up context for 'needs_more' responses
    if (status === 'needs_more') {
      const followUps = [
        ` Specifically, I'd like to know more about the implementation process.`,
        ` Also, what are the potential challenges I might face?`,
        ` Could you provide a step-by-step breakdown?`,
        ` What would be the timeline for getting this set up?`,
        ` Are there any prerequisites I should be aware of?`
      ];
      response += followUps[Math.floor(Math.random() * followUps.length)];
    }

    return { content: response, status };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const aiService = new AIService();
