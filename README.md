# PromptBase - AI Prompt Sharing Platform

A modern, professional web application for discovering, sharing, and exploring AI prompts. Built with Next.js, TypeScript, Tailwind CSS, and designed with a Gumroad/Notion-inspired aesthetic.

## 🚀 Features

- **Modern UI/UX**: Clean, professional design with smooth animations and transitions
- **Responsive Design**: Fully responsive across all devices
- **Prompt Discovery**: Browse and search through thousands of AI prompts
- **User Authentication**: Google SSO integration via Supabase Auth
- **Prompt Sharing**: Easy-to-use interface for submitting new prompts
- **Categorization**: Organized by tags and categories
- **Ad Integration**: Google Ads support for monetization
- **Real-time Updates**: Dynamic content loading with infinite scroll

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- Google OAuth credentials
- (Optional) Google Ads account for monetization

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd C:\Users\kahra\OneDrive\Desktop\Projects\promptbase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install required packages**
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   ```

4. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local`:
   ```bash
   copy .env.local.example .env.local
   ```

   Then fill in your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## 🗄️ Database Setup

### Supabase Configuration

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the following SQL in your Supabase SQL Editor**:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompts table
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view prompts" ON prompts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create prompts" ON prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts" ON prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts" ON prompts
  FOR DELETE USING (auth.uid() = user_id);
```

## 🔐 Google OAuth Setup

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**

2. **Create a new project or select existing one**

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (for development)
     - `https://your-domain.com/auth/callback` (for production)

5. **Configure in Supabase**
   - Go to your Supabase project
   - Navigate to "Authentication" > "Providers"
   - Enable "Google"
   - Add your Google Client ID and Client Secret

## 📱 Google Ads Setup (Optional)

1. **Create a Google AdSense account**

2. **Get your Ad Client ID and Slot IDs**

3. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID=ca-pub-xxxxxxxxxx
   NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID=xxxxxxxxxx
   ```

4. **Update AdSpace component** in `components/ui/AdSpace.tsx` with your ad code

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

## 📁 Project Structure

```
promptbase/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home page
│   ├── prompts/             # All prompts page
│   ├── prompt/[id]/         # Prompt detail page
│   ├── add-prompt/          # Add new prompt page
│   ├── auth/                # Authentication page
│   ├── profile/             # User profile page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── layout/              # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ui/                  # UI components
│       ├── Hero.tsx
│       ├── PromptCard.tsx
│       ├── Subscribe.tsx
│       └── AdSpace.tsx
├── lib/                     # Utility functions
│   └── supabase.ts          # Supabase client
├── types/                   # TypeScript types
│   └── index.ts
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind configuration
└── next.config.ts           # Next.js configuration
```

## 🎨 Design System

The application uses a modern, light, and dynamic color palette:

- **Primary**: Indigo (#6366f1)
- **Secondary**: Pink (#ec4899)
- **Accent**: Teal (#14b8a6)
- **Background**: White (#ffffff)
- **Text**: Dark Gray (#1a1a1a)

## 🌐 Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import project in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add environment variables**
   - Add all variables from `.env.local`

4. **Deploy**
   - Vercel will automatically build and deploy

## 📝 Usage Guide

### For Users

1. **Browse Prompts**: Visit the home page or "All Prompts" to explore
2. **Search**: Use the search bar to find specific prompts
3. **Filter**: Filter by categories and tags
4. **Sign In**: Click "Sign In" and use Google OAuth
5. **Save Favorites**: Like prompts to save them (requires sign in)
6. **Share Prompts**: Click "Add Prompt" to contribute

### For Developers

1. **Adding New Features**: Follow the existing component structure
2. **Database Changes**: Update Supabase schema and types
3. **Styling**: Use Tailwind utility classes
4. **State Management**: Use React hooks (useState, useEffect)

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive data
- Google OAuth for secure authentication
- Input validation on all forms

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the documentation
- Review existing issues on GitHub
- Create a new issue with detailed information

## 🙏 Acknowledgments

- Design inspired by Gumroad and Notion
- Icons from Heroicons
- Images from Unsplash

---

Built with ❤️ for the AI community
