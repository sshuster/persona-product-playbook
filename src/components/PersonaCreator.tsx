
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, User } from 'lucide-react';
import { Persona } from '@/pages/Index';

interface PersonaCreatorProps {
  onPersonaCreated: (persona: Persona) => void;
}

export const PersonaCreator: React.FC<PersonaCreatorProps> = ({ onPersonaCreated }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [background, setBackground] = useState('');
  const [expertiseInput, setExpertiseInput] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);

  const addExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim())) {
      setExpertise([...expertise, expertiseInput.trim()]);
      setExpertiseInput('');
    }
  };

  const removeExpertise = (item: string) => {
    setExpertise(expertise.filter(e => e !== item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && role && background) {
      const persona: Persona = {
        id: Date.now().toString(),
        name,
        role,
        background,
        expertise
      };
      onPersonaCreated(persona);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExpertise();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl text-gray-800">Create AI Persona</CardTitle>
        <p className="text-gray-600">Define the characteristics and expertise of your AI persona</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Persona Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Alex the Tech Enthusiast"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role/Position</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Software Developer, Marketing Manager, Student"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background & Context</Label>
            <Textarea
              id="background"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Describe the persona's background, experience level, and current situation..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise">Areas of Expertise (Optional)</Label>
            <div className="flex space-x-2">
              <Input
                id="expertise"
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add expertise areas..."
              />
              <Button type="button" onClick={addExpertise} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {expertise.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeExpertise(item)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg">
            Create Persona
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
