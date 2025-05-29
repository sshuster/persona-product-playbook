
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PersonaCreator } from '@/components/PersonaCreator';
import { CompanySelector } from '@/components/CompanySelector';
import { ChatInterface } from '@/components/ChatInterface';
import { Brain, Building2, MessageCircle } from 'lucide-react';

export interface Persona {
  id: string;
  name: string;
  role: string;
  background: string;
  expertise: string[];
}

export interface Company {
  id: string;
  name: string;
  product: string;
  description: string;
  category: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'persona' | 'company' | 'chat'>('persona');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handlePersonaCreated = (persona: Persona) => {
    setSelectedPersona(persona);
    setCurrentStep('company');
  };

  const handleCompanySelected = (company: Company) => {
    setSelectedCompany(company);
    setCurrentStep('chat');
  };

  const resetFlow = () => {
    setCurrentStep('persona');
    setSelectedPersona(null);
    setSelectedCompany(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Persona Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create AI personas, select products, and facilitate interactive learning sessions
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              currentStep === 'persona' ? 'bg-blue-100 text-blue-700' : 
              selectedPersona ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <Brain className="w-5 h-5" />
              <span className="font-medium">Create Persona</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              currentStep === 'company' ? 'bg-blue-100 text-blue-700' : 
              selectedCompany ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <Building2 className="w-5 h-5" />
              <span className="font-medium">Select Product</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              currentStep === 'chat' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}>
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Interactive Session</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'persona' && (
            <PersonaCreator onPersonaCreated={handlePersonaCreated} />
          )}

          {currentStep === 'company' && selectedPersona && (
            <CompanySelector 
              onCompanySelected={handleCompanySelected}
              persona={selectedPersona}
            />
          )}

          {currentStep === 'chat' && selectedPersona && selectedCompany && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Interactive Session</h2>
                  <p className="text-gray-600">
                    {selectedPersona.name} learning about {selectedCompany.product}
                  </p>
                </div>
                <Button variant="outline" onClick={resetFlow}>
                  Start New Session
                </Button>
              </div>
              <ChatInterface 
                persona={selectedPersona} 
                company={selectedCompany} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
