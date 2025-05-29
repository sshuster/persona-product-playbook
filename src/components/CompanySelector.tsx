
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, Smartphone, Cloud, ShoppingCart, Gamepad2 } from 'lucide-react';
import { Company, Persona } from '@/pages/Index';

interface CompanySelectorProps {
  onCompanySelected: (company: Company) => void;
  persona: Persona;
}

const sampleCompanies: Company[] = [
  {
    id: '1',
    name: 'TechFlow',
    product: 'Project Management Software',
    description: 'Advanced project management tool with AI-powered insights and team collaboration features.',
    category: 'Software'
  },
  {
    id: '2',
    name: 'CloudSync',
    product: 'Cloud Storage Platform',
    description: 'Secure cloud storage with real-time synchronization and advanced sharing capabilities.',
    category: 'Cloud'
  },
  {
    id: '3',
    name: 'MobileFirst',
    product: 'Mobile App Development Platform',
    description: 'No-code platform for creating professional mobile applications with drag-and-drop interface.',
    category: 'Mobile'
  },
  {
    id: '4',
    name: 'EcommPlus',
    product: 'E-commerce Analytics Dashboard',
    description: 'Comprehensive analytics platform for online stores with sales tracking and customer insights.',
    category: 'E-commerce'
  },
  {
    id: '5',
    name: 'GameStudio',
    product: 'Game Development Engine',
    description: 'Cross-platform game development engine with visual scripting and asset management.',
    category: 'Gaming'
  }
];

const categoryIcons = {
  Software: Building2,
  Cloud: Cloud,
  Mobile: Smartphone,
  'E-commerce': ShoppingCart,
  Gaming: Gamepad2
};

export const CompanySelector: React.FC<CompanySelectorProps> = ({ onCompanySelected, persona }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCompanies = sampleCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || company.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(sampleCompanies.map(c => c.category)));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-gray-800">Select Company & Product</CardTitle>
          <p className="text-gray-600">
            Choose a company and product for <span className="font-semibold text-blue-600">{persona.name}</span> to learn about
          </p>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search companies or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Company Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCompanies.map(company => {
              const IconComponent = categoryIcons[company.category as keyof typeof categoryIcons] || Building2;
              return (
                <Card 
                  key={company.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                  onClick={() => onCompanySelected(company)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 truncate">{company.name}</h3>
                          <Badge variant="secondary" className="ml-2 flex-shrink-0">
                            {company.category}
                          </Badge>
                        </div>
                        <p className="font-medium text-blue-600 mb-2">{company.product}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{company.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No companies found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
