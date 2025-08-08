# ForgeAI Inspector - Advanced Document Verification System

A cutting-edge AI-powered document verification system built with React, TypeScript, and advanced OCR technology.

## 🚀 Features

- **Advanced OCR Processing**: Powered by Tesseract.js with custom optimization
- **AI Document Analysis**: Intelligent field extraction and validation
- **Real-time Verification**: Instant document processing with live feedback
- **Multi-format Support**: PDF, JPG, PNG document processing
- **Fuzzy Matching**: Smart name matching with confidence scoring
- **Modern UI**: Futuristic design with smooth animations
- **Secure Authentication**: Clerk-based user management
- **Performance Optimized**: Built with Vite for lightning-fast development

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **OCR Engine**: Tesseract.js
- **PDF Processing**: PDF.js
- **Authentication**: Clerk
- **Animations**: Framer Motion
- **State Management**: React Query

## 🏃 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SHlok06majmundar/forge-ai-inspector.git
cd forge-ai-inspector
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your Clerk keys in `.env.local`:
```bash
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard-specific components
│   └── ui/             # Shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
└── services/           # Business logic and API calls
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```bash
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Vite Configuration

The project is configured to run on port 5173 by default. You can modify this in `vite.config.ts`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using React, TypeScript, and AI technology.
