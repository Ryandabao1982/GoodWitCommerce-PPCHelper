# Amazon PPC Keyword Genius

**Version 1.3.0** | AI-Powered Keyword Research & Campaign Planning for Amazon Sellers

---

## 🚀 Overview

**Amazon PPC Keyword Genius** is a specialized, AI-powered web application designed to revolutionize keyword research and campaign planning for Amazon sellers and PPC managers. Leveraging the Google Gemini API, this tool transforms simple seed keywords into comprehensive, actionable keyword strategies with detailed analytics and campaign structures.

### Key Features

- 🔍 **Advanced Keyword Research** - AI-powered keyword generation with simple and advanced search modes
- 🎯 **Brand Management** - Organize research by brand with isolated workspaces
- 📊 **Data-Rich Analytics** - Comprehensive metrics including volume, competition, and relevance scores
- 🤖 **AI Strategic Insights** - Keyword clustering, deep-dive analysis, and related ideas
- 📋 **Campaign Planning** - Expert-level campaign templates based on Amazon PPC taxonomy
- 💾 **Persistent Storage** - All data saved locally via browser localStorage
- 📤 **Export Capabilities** - CSV exports for keywords and campaign structures

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Features in Detail](#features-in-detail)
- [Technical Architecture](#technical-architecture)
- [Development](#development)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Google Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ryandabao1982/Amazon-PPC-Keyword-Research-and-Analysis-.git
   cd Amazon-PPC-Keyword-Research-and-Analysis-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```
   - (Optional) Configure Supabase for cloud storage:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```
   - See [Database Setup Guide](supabase/README.md) for detailed instructions

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

### Quick Start Guide

**For First-Time Users:**

The application includes an interactive Quick Start Guide that appears automatically on first use. Follow these steps:

1. **Set Up API Key** - Configure your Google Gemini API key (required for AI features)
   - Click "Configure Now" in the Quick Start Guide
   - Follow the instructions to get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Paste the key and save (stored locally in your browser)

2. **Create a Brand** - Set up your first brand workspace
   - Click "Create Brand" in the Quick Start Guide or header
   - Enter a descriptive brand name
   - Each brand maintains isolated keyword banks, campaigns, and search history

3. **Start Researching** - Enter seed keywords to generate suggestions
   - Type a product keyword (e.g., "wireless headphones")
   - Click Search or press Enter
   - AI generates comprehensive keyword variations with metrics

4. **Organize & Plan** - Build your keyword bank and campaign structures
   - Review keywords in the Keyword Bank view
   - Use clustering to group by theme
   - Navigate to Campaign Planner to structure your PPC campaigns

5. **Export Data** - Download CSV files for use in Amazon Advertising Console
   - Export complete keyword bank with all metrics
   - Export campaign structures ready for Amazon bulk upload

**Returning Users:**

- Select your brand from the header dropdown
- Start searching immediately - your previous work is automatically saved
- Access all features through the view switcher: Dashboard, Keyword Bank, Campaign Planner, Settings

---

## ✨ Features in Detail

### 🎯 Smart Onboarding

**Quick Start Guide** - Interactive 3-step guide for first-time users
- Visual progress tracking showing completion status
- Contextual action buttons for each step
- Automatically dismisses after first successful search
- Can be revisited anytime from Settings

**API Key Prompt** - Just-in-time setup assistant
- Appears when you try to search without an API key
- Step-by-step instructions with direct link to get a free key
- Clear explanation of why it's needed
- Privacy-focused: keys stored locally only
- "Skip for Now" option to explore without searching

### 🏢 Brand Management

Organize your keyword research by creating separate brand workspaces. Each brand maintains its own:
- Keyword bank
- Search history
- Campaign structures
- Analytics data

**User Stories:**
- *As a PPC manager, I want to create separate brands for each client to keep work isolated*
- *As a seller, I want to switch between brands to manage different product lines*

### 🔎 Keyword Research Engine

#### Simple Search
Enter a single seed keyword to generate a comprehensive list of related keywords with detailed metrics.

#### Advanced Search
- **Multi-keyword input** - Research multiple seeds simultaneously
- **Volume filters** - Focus on high-volume opportunities
- **Brand context** - Generate branded keyword variations
- **Web analysis** - Ground results in real-time Google Search data

#### Manual Keyword Entry (NEW!)
- **Add your own keywords** - Manually enter up to 50 keywords at once
- **AI Analysis** - Each keyword is automatically analyzed by AI for metrics
- **Batch Processing** - Keywords are processed with rate limiting for API safety
- **Smart Validation** - Input validation ensures quality (max 200 chars per keyword)
- **Seamless Integration** - Manual keywords are added to your keyword bank with full AI analysis

**Data Points for Each Keyword:**
- **Keyword** - The keyword phrase
- **Source** - AI or Web-derived
- **Type** - Broad, Phrase, Exact, or Long-tail
- **Category** - Core, Opportunity, Branded, Low-hanging Fruit, Complementary
- **Est. Search Volume** - Monthly search estimates (e.g., "10k-20k")
- **Competition** - Low, Medium, or High
- **Relevance** - 1-10 score relative to seed keyword

### 🤖 AI-Powered Insights

#### Related Ideas
Discover alternative search angles and expand your keyword universe with AI-suggested research directions.

#### Keyword Clustering
Automatically group keywords by theme and user intent for strategic organization.

#### Keyword Deep Dive
Get in-depth analysis for individual keywords including:
- Suggested ad copy angles
- Recommended bid strategies
- Potential negative keywords

### 📊 Campaign Planning & Management

#### Expert Campaign Templates
Choose from 15+ pre-configured campaign structures based on Amazon PPC taxonomy:
- **Sponsored Products** - Auto, Manual Broad, Exact Match, Branded Defense
- **Sponsored Brands** - Video Awareness, Headline Search
- **Sponsored Display** - Remarketing, Audience Targeting

#### Unified Workspace
Two-column layout combining:
- **Campaign Manager** (left) - Build and organize campaign hierarchy
- **Keyword Bank** (right) - View and assign keywords to ad groups

#### Bulk Operations
- Assign keywords to campaigns/ad groups in bulk
- Delete multiple keywords simultaneously
- Manage ad group structures efficiently

### 💾 Data Management & Export

#### Export Keyword Bank
Download your complete keyword library with all metrics and campaign assignments.

#### Export Campaign Plan
Generate Amazon-compatible CSV files for bulk upload:
- Campaign Name
- Ad Group Name
- Keyword Text
- Match Type
- Status (enabled by default)
- Bid (empty for user input)

---

## 🏗️ Technical Architecture

### Technology Stack

- **Frontend Framework**: React 19.2.0
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **AI Service**: Google Gemini API (@google/genai 1.25.0)
- **Styling**: Tailwind CSS 4.1.14
- **Database**: Supabase (PostgreSQL) - Optional
- **Authentication**: Supabase Auth - Optional
- **State Management**: React Hooks + localStorage/Supabase

### Project Structure

```
├── App.tsx                     # Main application component
├── BrandCreationModal.tsx      # Brand creation UI
├── index.tsx                   # Application entry point
├── types.ts                    # TypeScript type definitions
├── index.css                   # Global styles
├── components/                 # React components
│   ├── Dashboard.tsx
│   ├── ViewSwitcher.tsx
│   └── LoadingSpinner.tsx
├── services/                   # Backend services
│   ├── geminiService.ts        # AI service integration
│   ├── supabaseClient.ts       # Database client
│   ├── databaseService.ts      # Database API
│   ├── database.types.ts       # Database types
│   └── testConnection.ts       # Connection test utility
├── utils/                      # Utility functions
│   ├── storage.ts              # localStorage utilities
│   └── sorting.ts              # Sorting utilities
├── supabase/                   # Database infrastructure
│   ├── migrations/             # SQL migration files
│   └── README.md               # Database setup guide
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── PRO.md                      # Product Requirements Document
├── PLAN.md                     # Development Roadmap
├── PROTOCOL.md                 # Development Protocol
├── BUILD_LOG.md                # Technical Log
├── CHANGELOG.md                # Version History
├── METRICS.md                  # Project Metrics
├── BACKEND_PLAN.md             # Backend Architecture
└── README.md                   # This file
```

### Key Components

- **App.tsx** - Main container, routing, and state management
- **BrandCreationModal.tsx** - Brand workspace creation interface
- **Types.ts** - TypeScript interfaces for Brand, Keyword, Campaign structures

### Data Persistence

The application supports two storage modes:

**1. Local Storage (Default)**
- Data stored in browser `localStorage`
- No authentication required
- Data isolated to single browser

**2. Cloud Database (Optional - Supabase)**
- Persistent cloud storage with PostgreSQL
- Multi-device synchronization
- User authentication and authorization
- Data backup and recovery
- Secure with row-level security
- See [Database Setup Guide](supabase/README.md) for configuration

Both modes store:
- Brand configurations
- Keyword banks
- Campaign structures
- Search history
- Keyword banks
- Campaign structures
- Search history

---

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test                  # Run tests in watch mode
npm run test:run          # Run tests once (CI/CD)
npm run test:ui           # Open interactive test UI
npm run test:coverage     # Generate coverage report
```

### Development Workflow

Following the **AI Vibe Coder Protocol v3.0**, this project maintains:
- Atomic, versioned changes
- Comprehensive documentation
- Quality gates and metrics tracking
- Structured task management via PLAN.md

### Code Quality Standards

- **Type Safety**: Strict TypeScript mode enabled
- **Component Structure**: Functional components with hooks
- **State Management**: Centralized in App.tsx, passed via props
- **Error Handling**: Graceful degradation with user feedback
- **API Integration**: Abstracted service layer for Gemini API

### Testing

The application includes a comprehensive test suite with 111 tests covering utilities, services, and components. See [TEST_README.md](./TEST_README.md) for detailed test documentation.

**Test Coverage:**
- Utilities: 93.54% (storage, sorting)
- Services: 91.54% (geminiService)
- Components: 100% (LoadingSpinner, ErrorMessage, WelcomeMessage, QuickStartGuide, ApiKeyPrompt)

**Quick Start:**
```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Generate coverage report
```

### User Flow Documentation

See [USER_FLOW.md](./USER_FLOW.md) for comprehensive documentation of:
- First-time user experience and onboarding
- Returning user workflows
- UX principles and design decisions
- Accessibility features
- Future enhancement roadmap

### UI/UX Analysis & Implementation

See [USER_PATH_SIMULATION.md](./USER_PATH_SIMULATION.md) for detailed user journey analysis:
- Complete user path simulations from root
- Identified UX friction points
- Prioritized improvement recommendations
- Visual mockups and examples

See [UI_UX_IMPLEMENTATION.md](./UI_UX_IMPLEMENTATION.md) for technical implementation guide:
- EmptyState component documentation
- SearchFeedback component usage
- Integration guidelines and examples
- Testing and accessibility considerations

---

## 📚 Documentation

### Essential Documents (Root Directory)

- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and user-facing changes
- **[GEMINI.md](./GEMINI.md)** - Gemini AI integration configuration

### Technical Documentation ([/docs](./docs))

Comprehensive technical documentation has been organized in the `/docs` directory:

**Product & Planning:**
- [PRO.md](./docs/PRO.md) - Product Requirements Document
- [PLAN.md](./docs/PLAN.md) - Development Roadmap
- [PROTOCOL.md](./docs/PROTOCOL.md) - Development Framework

**Implementation Guides:**
- [DATABASE_IMPLEMENTATION.md](./docs/DATABASE_IMPLEMENTATION.md) - Database setup and configuration
- [IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md) - Feature implementation summary
- [UI_UX_IMPLEMENTATION.md](./docs/UI_UX_IMPLEMENTATION.md) - UI/UX implementation guide

**User Experience:**
- [USER_FLOW.md](./docs/USER_FLOW.md) - User journey documentation
- [USER_PATH_SIMULATION.md](./docs/USER_PATH_SIMULATION.md) - User path analysis

**Testing & Quality:**
- [TEST_README.md](./docs/TEST_README.md) - Testing documentation
- [TEST_COVERAGE_SUMMARY.md](./docs/TEST_COVERAGE_SUMMARY.md) - Test coverage report

**Project Management:**
- [BUILD_LOG.md](./docs/BUILD_LOG.md) - Technical build log
- [METRICS.md](./docs/METRICS.md) - Project health metrics

📖 **For complete documentation index, see [docs/README.md](./docs/README.md)**

---

## 🗺️ Roadmap

### ✅ Completed (v1.0 - v1.3)

- ✅ Sprint 1: Core Functionality (Brand Management, Search, Results)
- ✅ Sprint 2: AI-Powered Insights (Related Ideas, Clustering, Deep Dive)
- ✅ Sprint 3: Campaign & Workflow Tools (Templates, Bulk Actions, Unified Planner)

### 🔄 In Progress (v1.4)

**Sprint 4: Visualization & Usability**
- ✅ Export Campaign Plan
- ⏳ Data Visualization for Keyword Clusters
- ⏳ User Onboarding & Guided Tour
- ⏳ Drag-and-Drop Keyword Assignment

### 📋 Planned (v2.0+)

**Sprint 5: Advanced Features & Integrations**
- ⏳ Negative Keyword Management
- ⏳ Performance Metrics Integration (Amazon Advertising API)
- ⏳ AI-Powered Bid Suggestions

**Sprint 7: Backend Infrastructure & Database** (Planning Phase)
- ✅ Backend Architecture Planning & Documentation
- ⏳ Backend MVP Implementation (Supabase + PostgreSQL)
- ⏳ Core API Development (RESTful endpoints)
- ⏳ Frontend Integration with Backend
- ⏳ Data Migration & Production Launch

See [docs/PLAN.md](./docs/PLAN.md) for detailed task breakdown and [docs/BACKEND_PLAN.md](./docs/BACKEND_PLAN.md) for complete backend architecture.

---

## 🤝 Contributing

This project follows the **AI Vibe Coder Protocol v3.0**. All contributions should:

1. Reference relevant sections in [docs/PRO.md](./docs/PRO.md) or [docs/PLAN.md](./docs/PLAN.md)
2. Include appropriate documentation updates
3. Follow TypeScript best practices
4. Update CHANGELOG.md for user-facing changes
5. Log technical decisions in [docs/BUILD_LOG.md](./docs/BUILD_LOG.md)

### Development Process

1. Review [docs/PROTOCOL.md](./docs/PROTOCOL.md)
2. Check [docs/PLAN.md](./docs/PLAN.md) for available tasks
3. Create a feature branch
4. Implement changes following the protocol
5. Update documentation
6. Submit pull request with detailed description

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Follows the **AI Vibe Coder Protocol v3.0**

---

## 📞 Support

For issues, questions, or feature requests:
- Review existing documentation in [docs/PRO.md](./docs/PRO.md) and [docs/PLAN.md](./docs/PLAN.md)
- Check [docs/BUILD_LOG.md](./docs/BUILD_LOG.md) for known issues and solutions
- Open an issue on GitHub with detailed context

---

**Made with ❤️ for Amazon sellers and PPC professionals**