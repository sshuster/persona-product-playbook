
# AI Persona Assistant - Streamlit Application

A Python/Streamlit application that allows users to create AI personas, select company products, and facilitate interactive learning sessions using Ollama (qwen2.5:0.5b).

## Features

- **Persona Creation**: Define AI personas with roles, backgrounds, and expertise areas
- **Company Selection**: Choose from various companies and their products
- **Interactive Chat**: AI persona asks questions about products and responds to suggestions
- **Learning Assessment**: AI evaluates if suggestions are satisfactory or if more help is needed

## Requirements

- Python 3.8+
- Ollama installed and running locally
- qwen2.5:0.5b model downloaded in Ollama

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install and start Ollama:
```bash
# Install Ollama (visit https://ollama.ai for instructions)
# Pull the required model
ollama pull qwen2.5:0.5b
```

3. Run the Streamlit application:
```bash
streamlit run app.py
```

## Usage

1. **Create Persona**: Define your AI persona's characteristics
2. **Select Product**: Choose a company and product for the persona to learn about
3. **Interactive Session**: The AI persona will ask questions about the product
4. **Provide Suggestions**: Give helpful advice and guidance
5. **AI Response**: The persona evaluates your suggestions and responds accordingly

## Architecture

- `app.py`: Main Streamlit application with UI components
- `models.py`: Data models for Persona, Company, and Message
- `ollama_service.py`: Service layer for Ollama API integration
- `requirements.txt`: Python dependencies

The application uses Ollama's qwen2.5:0.5b model for generating realistic persona questions and responses, with fallback templates when the AI service is unavailable.
