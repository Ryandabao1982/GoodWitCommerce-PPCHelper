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

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

### Quick Start Guide

1. **Create a Brand** - Click the "+" button to create your first brand workspace
2. **Enter a Seed Keyword** - Use the search interface to input a product or keyword
3. **Review Results** - Analyze the generated keywords with AI-powered insights
4. **Build Campaigns** - Navigate to Campaign Planner to structure your PPC campaigns
5. **Export Data** - Download CSV files for use in Amazon Advertising Console

---

## ✨ Features in Detail

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
- **Styling**: CSS (index.css)
- **State Management**: React Hooks + localStorage

### Project Structure

```
├── App.tsx                  # Main application component
├── BrandCreationModal.tsx   # Brand creation UI
├── index.tsx               # Application entry point
├── types.ts                # TypeScript type definitions
├── index.css               # Global styles
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
├── PRO.md                  # Product Requirements Document
├── PLAN.md                 # Development Roadmap
├── PROTOCOL.md             # Development Protocol
├── BUILD_LOG.md            # Technical Log
├── CHANGELOG.md            # Version History
├── METRICS.md              # Project Metrics
└── README.md               # This file
```

### Key Components

- **App.tsx** - Main container, routing, and state management
- **BrandCreationModal.tsx** - Brand workspace creation interface
- **Types.ts** - TypeScript interfaces for Brand, Keyword, Campaign structures

### Data Persistence

All application data is persisted in browser `localStorage`:
- Brand configurations
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

---

## 📚 Documentation

### Core Documents

- **[PRO.md](./PRO.md)** - Product Requirements Document
  - Feature specifications
  - User stories
  - Non-functional requirements

- **[PLAN.md](./PLAN.md)** - Development Roadmap
  - Sprint planning
  - Task tracking
  - Implementation status

- **[PROTOCOL.md](./PROTOCOL.md)** - AI Vibe Coder Protocol v3.0
  - Development framework
  - Quality standards
  - Collaboration guidelines

- **[BUILD_LOG.md](./BUILD_LOG.md)** - Technical Log
  - Development history
  - Bug fixes and resolutions
  - Technical decisions

- **[CHANGELOG.md](./CHANGELOG.md)** - User-Facing Changes
  - Version history
  - Feature additions
  - Breaking changes

- **[METRICS.md](./METRICS.md)** - Project Health Dashboard
  - Development velocity
  - Code quality metrics
  - Technical debt tracking

- **[BACKEND_PLAN.md](./BACKEND_PLAN.md)** - Backend Implementation Plan
  - Database schema design
  - API endpoints specification
  - Technology stack recommendations
  - Migration strategy
  - Security and deployment architecture

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

See [PLAN.md](./PLAN.md) for detailed task breakdown and [BACKEND_PLAN.md](./BACKEND_PLAN.md) for complete backend architecture.

---

## 🤝 Contributing

This project follows the **AI Vibe Coder Protocol v3.0**. All contributions should:

1. Reference relevant sections in PRO.md or PLAN.md
2. Include appropriate documentation updates
3. Follow TypeScript best practices
4. Update CHANGELOG.md for user-facing changes
5. Log technical decisions in BUILD_LOG.md

### Development Process

1. Review [PROTOCOL.md](./PROTOCOL.md)
2. Check [PLAN.md](./PLAN.md) for available tasks
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
- Review existing documentation in PRO.md and PLAN.md
- Check BUILD_LOG.md for known issues and solutions
- Open an issue on GitHub with detailed context

---

**Made with ❤️ for Amazon sellers and PPC professionals**