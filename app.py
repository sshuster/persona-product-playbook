
import streamlit as st
import json
from datetime import datetime
from models import Persona, Company, Message
from ollama_service import OllamaService

# Initialize Ollama service
ollama_service = OllamaService()

# Sample companies data
SAMPLE_COMPANIES = [
    Company(
        id="1",
        name="TechFlow",
        product="Project Management Software",
        description="Advanced project management tool with AI-powered insights and team collaboration features.",
        category="Software"
    ),
    Company(
        id="2",
        name="CloudSync",
        product="Cloud Storage Platform",
        description="Secure cloud storage with real-time synchronization and advanced sharing capabilities.",
        category="Cloud"
    ),
    Company(
        id="3",
        name="MobileFirst",
        product="Mobile App Development Platform",
        description="No-code platform for creating professional mobile applications with drag-and-drop interface.",
        category="Mobile"
    ),
    Company(
        id="4",
        name="EcommPlus",
        product="E-commerce Analytics Dashboard",
        description="Comprehensive analytics platform for online stores with sales tracking and customer insights.",
        category="E-commerce"
    ),
    Company(
        id="5",
        name="GameStudio",
        product="Game Development Engine",
        description="Cross-platform game development engine with visual scripting and asset management.",
        category="Gaming"
    )
]

def initialize_session_state():
    """Initialize session state variables"""
    if 'current_step' not in st.session_state:
        st.session_state.current_step = 'persona'
    if 'persona' not in st.session_state:
        st.session_state.persona = None
    if 'company' not in st.session_state:
        st.session_state.company = None
    if 'messages' not in st.session_state:
        st.session_state.messages = []
    if 'session_active' not in st.session_state:
        st.session_state.session_active = True
    if 'waiting_for_ai' not in st.session_state:
        st.session_state.waiting_for_ai = False

def reset_session():
    """Reset the entire session"""
    st.session_state.current_step = 'persona'
    st.session_state.persona = None
    st.session_state.company = None
    st.session_state.messages = []
    st.session_state.session_active = True
    st.session_state.waiting_for_ai = False

def create_persona_form():
    """Create the persona creation form"""
    st.header("🧠 Create AI Persona")
    st.write("Define the characteristics and expertise of your AI persona")
    
    with st.form("persona_form"):
        name = st.text_input("Persona Name", placeholder="e.g., Alex the Tech Enthusiast")
        role = st.text_input("Role/Position", placeholder="e.g., Software Developer, Marketing Manager, Student")
        background = st.text_area(
            "Background & Context", 
            placeholder="Describe the persona's background, experience level, and current situation...",
            height=100
        )
        expertise_input = st.text_input(
            "Areas of Expertise (comma-separated, optional)", 
            placeholder="e.g., Python, Web Development, Data Analysis"
        )
        
        submitted = st.form_submit_button("Create Persona")
        
        if submitted:
            if name and role and background:
                expertise = [item.strip() for item in expertise_input.split(',') if item.strip()] if expertise_input else []
                
                persona = Persona(
                    id=str(datetime.now().timestamp()),
                    name=name,
                    role=role,
                    background=background,
                    expertise=expertise
                )
                
                st.session_state.persona = persona
                st.session_state.current_step = 'company'
                st.rerun()
            else:
                st.error("Please fill in all required fields (Name, Role, Background)")

def company_selector():
    """Display company selection interface"""
    st.header("🏢 Select Company & Product")
    st.write(f"Choose a company and product for **{st.session_state.persona.name}** to learn about")
    
    # Search functionality
    search_term = st.text_input("🔍 Search companies or products...")
    
    # Category filter
    categories = list(set(company.category for company in SAMPLE_COMPANIES))
    selected_category = st.selectbox("Filter by category", ["All Categories"] + categories)
    
    # Filter companies
    filtered_companies = SAMPLE_COMPANIES
    if search_term:
        filtered_companies = [
            company for company in filtered_companies
            if search_term.lower() in company.name.lower() or 
               search_term.lower() in company.product.lower() or
               search_term.lower() in company.description.lower()
        ]
    
    if selected_category != "All Categories":
        filtered_companies = [company for company in filtered_companies if company.category == selected_category]
    
    # Display companies
    if filtered_companies:
        for company in filtered_companies:
            with st.container():
                col1, col2 = st.columns([3, 1])
                
                with col1:
                    st.subheader(f"{company.name} - {company.product}")
                    st.write(f"**Category:** {company.category}")
                    st.write(company.description)
                
                with col2:
                    if st.button(f"Select", key=f"select_{company.id}"):
                        st.session_state.company = company
                        st.session_state.current_step = 'chat'
                        st.rerun()
                
                st.divider()
    else:
        st.info("No companies found matching your criteria.")

def display_message(message: Message):
    """Display a single message in the chat"""
    if message.type == 'system':
        st.info(f"ℹ️ {message.content}")
    elif message.type == 'persona_question':
        with st.chat_message("assistant", avatar="🤖"):
            st.write(f"**{st.session_state.persona.name}:** {message.content}")
    elif message.type == 'user_suggestion':
        with st.chat_message("user", avatar="👤"):
            st.write(f"**Your Suggestion:** {message.content}")
    elif message.type == 'persona_response':
        with st.chat_message("assistant", avatar="🤖"):
            st.write(f"**{st.session_state.persona.name}:** {message.content}")
            if message.status:
                if message.status == 'satisfied':
                    st.success("✅ Satisfied - Question answered!")
                elif message.status == 'needs_more':
                    st.warning("❓ Needs more help")
                elif message.status == 'unclear':
                    st.error("❌ Unclear response")

async def initialize_chat_session():
    """Initialize the chat session with AI persona's first question"""
    if not st.session_state.messages:
        # Add system message
        system_msg = Message(
            id=str(datetime.now().timestamp()),
            type='system',
            content=f"Session started: {st.session_state.persona.name} ({st.session_state.persona.role}) will ask questions about {st.session_state.company.product} from {st.session_state.company.name}. Provide helpful suggestions to assist them.",
            timestamp=datetime.now()
        )
        st.session_state.messages.append(system_msg)
        
        # Generate initial question
        try:
            initial_question = await ollama_service.generate_persona_question(
                st.session_state.persona, 
                st.session_state.company, 
                []
            )
            
            question_msg = Message(
                id=str(datetime.now().timestamp() + 1),
                type='persona_question',
                content=initial_question,
                timestamp=datetime.now()
            )
            st.session_state.messages.append(question_msg)
            
        except Exception as e:
            st.error(f"Error generating initial question: {str(e)}")

def chat_interface():
    """Display the chat interface"""
    st.header("💬 Interactive Learning Session")
    
    col1, col2 = st.columns([3, 1])
    with col1:
        st.write(f"**{st.session_state.persona.name}** is learning about **{st.session_state.company.product}**")
    with col2:
        if st.button("🔄 Start New Session"):
            reset_session()
            st.rerun()
    
    # Session status
    if st.session_state.session_active:
        st.success("🟢 Session Active")
    else:
        st.info("✅ Session Completed")
    
    # Initialize chat if empty
    if not st.session_state.messages:
        with st.spinner("Initializing AI persona..."):
            import asyncio
            asyncio.run(initialize_chat_session())
            st.rerun()
    
    # Display messages
    for message in st.session_state.messages:
        display_message(message)
    
    # Input area
    if st.session_state.session_active and not st.session_state.waiting_for_ai:
        with st.form("suggestion_form", clear_on_submit=True):
            suggestion = st.text_area(
                "💡 Provide helpful suggestions to assist with the question:",
                placeholder="Type your suggestion or helpful advice...",
                height=100
            )
            
            submitted = st.form_submit_button("Send Suggestion")
            
            if submitted and suggestion.strip():
                # Add user suggestion
                suggestion_msg = Message(
                    id=str(datetime.now().timestamp()),
                    type='user_suggestion',
                    content=suggestion,
                    timestamp=datetime.now()
                )
                st.session_state.messages.append(suggestion_msg)
                st.session_state.waiting_for_ai = True
                
                # Process AI response
                with st.spinner("AI is thinking..."):
                    try:
                        import asyncio
                        response = asyncio.run(ollama_service.generate_persona_response(
                            st.session_state.persona,
                            st.session_state.company,
                            st.session_state.messages
                        ))
                        
                        response_msg = Message(
                            id=str(datetime.now().timestamp() + 1),
                            type='persona_response',
                            content=response['content'],
                            timestamp=datetime.now(),
                            status=response['status']
                        )
                        st.session_state.messages.append(response_msg)
                        
                        # Handle follow-up based on status
                        if response['status'] == 'needs_more':
                            # Generate follow-up question
                            follow_up = asyncio.run(ollama_service.generate_persona_question(
                                st.session_state.persona,
                                st.session_state.company,
                                st.session_state.messages
                            ))
                            
                            follow_up_msg = Message(
                                id=str(datetime.now().timestamp() + 2),
                                type='persona_question',
                                content=follow_up,
                                timestamp=datetime.now()
                            )
                            st.session_state.messages.append(follow_up_msg)
                            
                        elif response['status'] == 'satisfied':
                            # End session
                            st.session_state.session_active = False
                            completion_msg = Message(
                                id=str(datetime.now().timestamp() + 3),
                                type='system',
                                content=f"Session completed! {st.session_state.persona.name} feels confident about using {st.session_state.company.product}. Great job providing helpful suggestions!",
                                timestamp=datetime.now()
                            )
                            st.session_state.messages.append(completion_msg)
                        
                        st.session_state.waiting_for_ai = False
                        
                    except Exception as e:
                        st.error(f"Error generating AI response: {str(e)}")
                        st.session_state.waiting_for_ai = False
                
                st.rerun()
    
    elif st.session_state.waiting_for_ai:
        st.info("⏳ Waiting for AI response...")

def main():
    """Main application function"""
    st.set_page_config(
        page_title="AI Persona Assistant",
        page_icon="🤖",
        layout="wide"
    )
    
    st.title("🤖 AI Persona Assistant")
    st.write("Create AI personas, select products, and facilitate interactive learning sessions")
    
    initialize_session_state()
    
    # Progress indicator
    steps = ['🧠 Create Persona', '🏢 Select Product', '💬 Interactive Session']
    current_step_idx = ['persona', 'company', 'chat'].index(st.session_state.current_step)
    
    progress_cols = st.columns(3)
    for i, (col, step) in enumerate(zip(progress_cols, steps)):
        with col:
            if i < current_step_idx:
                st.success(f"✅ {step}")
            elif i == current_step_idx:
                st.info(f"🔄 {step}")
            else:
                st.write(f"⏳ {step}")
    
    st.divider()
    
    # Display appropriate interface based on current step
    if st.session_state.current_step == 'persona':
        create_persona_form()
    elif st.session_state.current_step == 'company':
        company_selector()
    elif st.session_state.current_step == 'chat':
        chat_interface()

if __name__ == "__main__":
    main()
