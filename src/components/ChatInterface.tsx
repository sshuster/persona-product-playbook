
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import { Company, Persona } from '@/pages/Index';
import { aiService } from '@/services/aiService';

interface Message {
  id: string;
  type: 'persona_question' | 'user_suggestion' | 'persona_response' | 'system';
  content: string;
  timestamp: Date;
  status?: 'satisfied' | 'needs_more' | 'unclear';
}

interface ChatInterfaceProps {
  persona: Persona;
  company: Company;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ persona, company }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize session with AI persona's first question
    initializeSession();
  }, []);

  const initializeSession = async () => {
    setIsLoading(true);
    
    // System message
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: `Session started: ${persona.name} (${persona.role}) will ask questions about ${company.product} from ${company.name}. Provide helpful suggestions to assist them.`,
      timestamp: new Date()
    };
    
    setMessages([systemMessage]);

    // Generate initial question from AI persona
    try {
      const initialQuestion = await aiService.generatePersonaQuestion(persona, company, []);
      const questionMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'persona_question',
        content: initialQuestion,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, questionMessage]);
    } catch (error) {
      console.error('Error generating initial question:', error);
    }
    
    setIsLoading(false);
  };

  const handleSendSuggestion = async () => {
    if (!suggestion.trim() || !sessionActive) return;

    setIsLoading(true);
    
    // Add user suggestion message
    const suggestionMessage: Message = {
      id: Date.now().toString(),
      type: 'user_suggestion',
      content: suggestion,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, suggestionMessage];
    setMessages(updatedMessages);
    setSuggestion('');

    try {
      // Get AI persona's response to the suggestion
      const response = await aiService.generatePersonaResponse(
        persona,
        company,
        updatedMessages.filter(m => m.type !== 'system')
      );
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'persona_response',
        content: response.content,
        timestamp: new Date(),
        status: response.status
      };
      
      setMessages(prev => [...prev, responseMessage]);

      // If persona needs more help, generate follow-up question
      if (response.status === 'needs_more') {
        setTimeout(async () => {
          try {
            const followUpQuestion = await aiService.generatePersonaQuestion(
              persona,
              company,
              [...updatedMessages, responseMessage]
            );
            
            const questionMessage: Message = {
              id: (Date.now() + 2).toString(),
              type: 'persona_question',
              content: followUpQuestion,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, questionMessage]);
          } catch (error) {
            console.error('Error generating follow-up question:', error);
          }
        }, 1500);
      } else if (response.status === 'satisfied') {
        // Session complete
        setTimeout(() => {
          setSessionActive(false);
          const completionMessage: Message = {
            id: (Date.now() + 3).toString(),
            type: 'system',
            content: `Session completed! ${persona.name} feels confident about using ${company.product}. Great job providing helpful suggestions!`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, completionMessage]);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error generating persona response:', error);
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendSuggestion();
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'persona_question':
      case 'persona_response':
        return <Bot className="w-5 h-5 text-blue-600" />;
      case 'user_suggestion':
        return <User className="w-5 h-5 text-green-600" />;
      case 'system':
        return <Lightbulb className="w-5 h-5 text-amber-600" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'satisfied':
        return <Badge variant="default" className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Satisfied</Badge>;
      case 'needs_more':
        return <Badge variant="default" className="bg-amber-100 text-amber-700"><AlertCircle className="w-3 h-3 mr-1" />Needs More Help</Badge>;
      case 'unclear':
        return <Badge variant="default" className="bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 mr-1" />Unclear</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Info */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Interactive Learning Session</CardTitle>
              <p className="text-gray-600 mt-1">
                <span className="font-medium text-blue-600">{persona.name}</span> is learning about{' '}
                <span className="font-medium text-green-600">{company.product}</span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {sessionActive ? (
                <Badge variant="default" className="bg-green-100 text-green-700">Active</Badge>
              ) : (
                <Badge variant="default" className="bg-gray-100 text-gray-700">Completed</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user_suggestion' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {getMessageIcon(message.type)}
                </div>
                <div className={`flex-1 ${message.type === 'user_suggestion' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block max-w-3xl p-4 rounded-lg ${
                      message.type === 'user_suggestion'
                        ? 'bg-green-100 text-green-900'
                        : message.type === 'system'
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-blue-50 text-blue-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.status && (
                      <div className="mt-2">
                        {getStatusBadge(message.status)}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse">Thinking...</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      {sessionActive && (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Lightbulb className="w-4 h-4" />
                <span>Provide helpful suggestions to assist {persona.name} with their questions</span>
              </div>
              <div className="flex space-x-4">
                <Textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your suggestion or helpful advice..."
                  className="flex-1 min-h-[80px]"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendSuggestion}
                  disabled={!suggestion.trim() || isLoading}
                  size="lg"
                  className="px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
