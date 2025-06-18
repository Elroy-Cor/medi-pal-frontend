# MediPal - AI Healthcare Companion

## 🏥 Project Overview

MediPal is a cutting-edge AI-powered healthcare companion designed to revolutionize the Emergency Room experience for both patients and medical staff. This prototype demonstrates how artificial intelligence can provide personalized support, streamline workflows, and enhance communication throughout the entire ER journey.

### 🎯 Core Mission
- **For Patients**: Provide an intelligent, empathetic companion that guides patients through their ER visit, answers questions about insurance, medical history, and treatment plans
- **For Nurses**: Deliver an intelligent dashboard that assists with patient triage, assessment, and decision-making to improve care efficiency

---

## 🏗️ Technical Architecture

### **Frontend Stack**
- **Framework**: Next.js 15 (React 18+ with App Router)
- **Language**: TypeScript (strict type checking)
- **Styling**: Tailwind CSS + Custom Components
- **UI Components**: Radix UI + shadcn/ui component system
- **State Management**: Jotai (atomic state management)
- **Icons**: Lucide React
- **3D Graphics**: Three.js + React Three Fiber + React Three Drei

### **AI & Real-time Communication**
- **Conversational AI**: SambaNova Cloud API 
- **Real-time Voice**: OpenAI Realtime API 
- **WebRTC**: Peer-to-peer audio streaming with OpenAI
- **Audio Processing**: Web Audio API (gain control, stream processing)
- **Function Calling**: RAG integration for insurance, medical history, and reports

### **3D Avatar System**
- **Rendering**: Three.js WebGL renderer
- **Model Format**: GLTF/GLB with morph targets
- **Lip Sync**: Real-time phoneme-to-viseme mapping
- **Animation**: Bone-based skeletal animation with blend shapes
- **Lighting**: Multi-directional lighting setup for professional appearance

### **Data Flow Architecture**
```
User Voice Input → WebRTC → OpenAI Realtime API → Function Calls → Backend APIs
                ↓
3D Avatar ← Audio Response ← AI Processing ← RAG Data Retrieval
```

---

## 🎭 Demo Application Pages & Features

### 🏠 **Landing Page** (`/`)
**Purpose**: Main navigation hub for role selection

**Features**:
- Problem Statement
- Research and Findings
- Role-based navigation (Patient vs Nurse)
- Professional healthcare branding

---

### 👤 **Patient Interface** (`/patient`)

#### **Main Chat Page**
**Purpose**: Primary AI companion interface for patient interaction

**🔧 Technical Features**:
- **Dual Communication Modes**:
  - Text-based chat with streaming responses
  - Real-time voice conversation with OpenAI Realtime API
- **Advanced Audio Management**:
  - WebRTC peer connection with OpenA
- **3D Avatar Integration**:
  - Photo-realistic 3D doctor avatar
  - Real-time lip synchronization with AI speech
  - Facial expressions and gesture animations
  - Professional lighting and rendering

**🤖 AI Capabilities**:
- **Function Calling System**:
  - `ai_insurance_rag`: Insurance coverage, claims, policies, benefits
  - `medical_history_rag`: Past diagnoses, treatments, medications, allergies
  - `medical_report_rag`: Test results, imaging reports, lab results
- **Contextual Understanding**: Maintains conversation context across interactions
- **Multi-modal Responses**: Text and voice with synchronized avatar

**💬 Chat Features**:
- Message history with timestamps
- Voice/Text mode indicators
- Typing indicators and loading states
- Real-time partial transcription display
- Connection status monitoring
- Message type differentiation (user/AI/system)

#### **ER Session Management**
**Purpose**: Simulates and tracks patient journey through ER visit

**🏥 ER Journey Tracking**:
- **QR Code Simulation**: Hospital check-in process

**📊 Real-time Updates**:
- Live session status with visual indicators
- Progress tracking with completion percentages
- Location-based information (current area/room)
- Estimated timeline and wait duration
- Session ID tracking for hospital integration

#### **Medical History Management**
**Purpose**: Comprehensive personal health record interface with AI-powered insights

**🏥 Health Record Features**:
- **Medical Timeline**: Chronological view of health events, procedures, and treatments
- **Medication Tracking**: Current prescriptions, dosages, and interaction warnings
- **Allergy Management**: Detailed allergy profiles with severity indicators
- **Condition Monitoring**: Chronic disease tracking with trend analysis
- **Vaccination Records**: Immunization history with due date reminders

**🤖 AI-Powered Analysis**:
- **Health Pattern Recognition**: AI identifies trends and potential concerns
- **Risk Assessment**: Predictive modeling for health complications
- **Treatment Correlation**: Analysis of treatment effectiveness over time
- **Symptom Tracking**: Pattern matching with historical health data
- **Care Gap Identification**: Missing preventive care recommendations

**📊 Interactive Visualizations**:
- **Health Metrics Dashboard**: Visual representation of vital signs trends
- **Treatment Timeline**: Interactive calendar view of medical events
- **Medication Schedule**: Visual pill reminder system
- **Progress Tracking**: Recovery and treatment outcome measurements
- **Health Score**: Overall wellness indicator with improvement suggestions

**🔍 Smart Search & Queries**:
- Natural language queries: "What medications was I on in 2023?"
- Intelligent filtering by condition, provider, or date range
- Cross-referencing symptoms with past diagnoses
- Treatment outcome comparisons across different time periods

#### **Insurance & Benefits Navigator**
**Purpose**: Intelligent insurance guidance and claims management system

**💳 Coverage Analysis**:
- **Policy Overview**: Real-time benefit summaries and coverage limits
- **Deductible Tracking**: Current year spending against deductibles
- **Network Provider Search**: In-network specialist and facility finder
- **Pre-authorization Guidance**: Required approvals for procedures and treatments
- **Formulary Checker**: Covered medications and cost comparisons

**🤖 AI Insurance Assistant**:
- **Claims Prediction**: Estimated out-of-pocket costs for procedures
- **Appeal Assistance**: AI-generated appeal letters for denied claims
- **Benefit Optimization**: Recommendations for maximizing coverage
- **Cost Comparison**: Alternative treatment options with cost analysis
- **Preventive Care Reminders**: Coverage for annual screenings and checkups

**📋 Claims Management**:
- **Claim Status Tracking**: Real-time updates on submitted claims
- **EOB (Explanation of Benefits) Analysis**: AI breakdown of complex insurance documents
- **Dispute Resolution**: Automated claim error detection and correction
- **Payment Planning**: Flexible payment option recommendations
- **Tax Documentation**: HSA/FSA eligible expense tracking

**🔍 Interactive Tools**:
- **Coverage Calculator**: What-if scenarios for different treatment options
- **Provider Comparison**: Quality ratings, costs, and network status
- **Prescription Savings**: Generic alternatives and discount programs
- **Emergency Coverage**: Travel insurance and out-of-network emergency guidance

#### **Family & Friends Support Network**
**Purpose**: Connected care ecosystem for family coordination and emergency contacts

**👨‍👩‍👧‍👦 Family Health Hub**:
- **Shared Health Records**: Authorized family member access to medical information
- **Care Coordination**: Synchronized appointment scheduling across family members
- **Medication Management**: Family-wide prescription tracking and reminders
- **Emergency Protocols**: Automated family notification systems
- **Health Milestone Tracking**: Preventive care schedules for all family members

**🚨 Emergency Network**:
- **Real-time Notifications**: Instant alerts to designated contacts during ER visits
- **Location Sharing**: Safe arrival notifications and hospital location updates  
- **Medical Proxy System**: Emergency decision-making authorization
- **Critical Information Access**: Immediate access to allergies, medications, and conditions
- **Communication Hub**: Group messaging for care updates and coordination

**🤖 AI Family Assistant**:
- **Health Risk Correlation**: Family genetic pattern analysis
- **Preventive Care Coordination**: Synchronized screening schedules
- **Caregiver Support**: Resources and guidance for family caregivers
- **Health Education**: Personalized family health education materials
- **Wellness Challenges**: Family-based health and fitness goals

**📱 Social Features**:
- **Care Circle Management**: Designated support person roles and permissions
- **Health Journey Sharing**: Optional progress sharing with trusted contacts
- **Appointment Accompaniment**: Scheduling family member support for visits
- **Recovery Support**: Post-treatment care coordination and check-ins
- **Community Resources**: Local support groups and family-oriented health programs

**🔐 Privacy & Security**:
- **Granular Permissions**: Fine-tuned control over what information is shared
- **Temporary Access**: Time-limited emergency access for non-family caregivers
- **Audit Trails**: Complete logging of who accessed what information when
- **Secure Messaging**: HIPAA-compliant communication between family members
- **Minor Protection**: Special privacy safeguards for pediatric patients

---

### 👩‍⚕️ **Nurse Dashboard** (`/nurse`)

#### **Intelligent Triage System**
**Purpose**: AI-assisted patient assessment and priority assignment

**🔍 Assessment Features**:
- **Smart Form System**: Dynamic questionnaire that adapts based on responses
- **Vital Signs Integration**: Real-time monitoring data input
- **Symptom Analysis**: AI-powered pattern recognition for symptoms
- **Priority Scoring**: Automated triage level assignment (1-5 scale)
- **Risk Assessment**: Early warning system for critical conditions

**🎙️ Voice Simulation**:
- **Interactive Training**: Simulated patient scenarios for triage practice
- **Voice-guided Assessment**: Hands-free operation during patient care
- **Audio Feedback**: Real-time guidance and suggestions
- **Documentation Assistance**: Voice-to-text for quick note taking

**📋 Clinical Decision Support**:
- **Protocol Recommendations**: Evidence-based care pathways
- **Drug Interaction Checking**: Real-time medication safety alerts
- **Guideline Integration**: Latest medical protocols and best practices
- **Resource Allocation**: Optimal bed/room assignment suggestions

**📊 Dashboard Analytics**:
- **Patient Queue Visualization**: Real-time ER capacity and flow
- **Performance Metrics**: Triage accuracy and time-to-assessment
- **Resource Utilization**: Staff allocation and equipment availability
- **Trend Analysis**: Pattern recognition for better forecasting

## ☁️ AWS Infrastructure

The AWS infrastructure files for this project can be found at: [AWS Infrastructure Files](https://github.com/rurumeister/medi-pal-frontend/tree/main/aws_lambda_functions)

---

## 🎯 Future Enhancements

- **Multi-language Support**: I18n integration for diverse patient populations
- **Wearable Integration**: Real-time vital signs from IoT devices
- **Advanced Analytics**: Machine learning for predictive healthcare insights
- **EHR Integration**: Seamless connection with existing hospital systems
- **Mobile Application**: React Native companion app for on-the-go access

---


*This demo represents a proof-of-concept showcasing the potential of AI in healthcare. The implementation demonstrates advanced web technologies, real-time communication, and intelligent user interfaces working together to create a comprehensive healthcare companion system.*
