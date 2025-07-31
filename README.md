# fk videoask - Asynchronous Video Interview Platform

A modern, production-ready asynchronous video interview platform built with React, TypeScript, and Supabase. Create video interview questions, share unique links with candidates, and collect video responses seamlessly.

## 🌟 Features

### For Recruiters
- **Secure Authentication**: Email/password authentication with rate limiting
- **Video Question Creation**: Record or upload video questions (max 2 minutes)
- **Multi-Question Interviews**: Create comprehensive interview flows
- **Unique Shareable Links**: Generate secure URLs for candidates
- **Response Management**: View and organize candidate responses
- **Real-time Dashboard**: Track interview performance and metrics

### For Candidates
- **Simple Access**: No account required, just use the shared link
- **Video Responses**: Record answers directly in the browser (max 1 minute)
- **Progress Tracking**: Clear indication of interview progress
- **Mobile Friendly**: Works on desktop, tablet, and mobile devices

### Technical Features
- **Enterprise Security**: XSS protection, input validation, rate limiting
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Performance Optimized**: Lazy loading, memoization, efficient rendering
- **Error Resilience**: Comprehensive error handling and recovery
- **Type Safe**: Full TypeScript implementation with strict mode

## Features

- **Recruiter Dashboard**: Secure authentication and question management
- **Video Recording**: Browser-based video recording with MediaRecorder API
- **File Upload**: Support for video file uploads (MP4, max 100MB)
- **Unique Links**: Generate shareable links for candidates
- **Response Collection**: Candidates record responses without authentication
- **Modern UI**: Clean, responsive design with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Full type safety and developer experience
- **Tailwind CSS** - Utility-first styling with custom design system
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing

### Backend & Services
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - User authentication and authorization
- **Supabase Storage** - Secure video file storage
- **Row Level Security** - Database-level security policies

### Development & Quality
- **Vitest** - Fast unit and integration testing
- **React Testing Library** - Component testing utilities
- **ESLint** - Code linting with accessibility rules
- **Prettier** - Code formatting
- **Husky** - Git hooks for code quality

### Browser APIs
- **MediaRecorder API** - Native video recording
- **getUserMedia** - Camera and microphone access
- **Web Storage** - Local data persistence

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Supabase account** (free tier available)
- **Modern browser** with camera/microphone support

### 1. Clone and Install
```bash
git clone <repository-url>
cd fk-videoask
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run the SQL migrations in your Supabase SQL editor:
```sql
-- Run files in supabase/migrations/ in order
-- Or use the Supabase CLI (if available)
```

### 4. Start Development
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application!

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd openvideo-ask
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a new Supabase project
   - Copy `.env.example` to `.env` and fill in your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run database migrations**
   - In your Supabase SQL editor, run the migration file: `supabase/migrations/create_video_interview_schema.sql`

5. **Start development server**
   ```bash
   npm run dev
   ```

## Usage

### For Recruiters

1. **Sign Up/Login**: Create an account or sign in
2. **Create Questions**: Record or upload video questions (max 2 minutes)
3. **Share Links**: Copy the generated unique URL to share with candidates
4. **Review Responses**: View candidate responses in your dashboard

### For Candidates

1. **Access Question**: Open the unique URL shared by the recruiter
2. **Watch Question**: View the recruiter's video question
3. **Record Response**: Record your video response (max 1 minute)
4. **Submit**: Provide your email and submit the response

## Architecture

### Database Schema

- **questions**: Stores video questions with metadata
- **responses**: Stores candidate responses linked to questions
- **storage**: Supabase storage bucket for video files

### Security

- Row Level Security (RLS) enabled on all tables
- Recruiters can only access their own questions and responses
- Public access for candidates to view questions and submit responses
- Secure video file storage with appropriate access policies

### File Organization

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries (Supabase client)
├── pages/              # Page components
└── types/              # TypeScript type definitions
```

## 📖 Documentation

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── __tests__/      # Component tests
│   ├── AuthForm.tsx    # Authentication form
│   ├── Dashboard.tsx   # Recruiter dashboard
│   ├── VideoRecorder.tsx # Video recording component
│   └── ...
├── hooks/              # Custom React hooks
│   ├── __tests__/      # Hook tests
│   ├── useAuth.ts      # Authentication hook
│   ├── useToast.ts     # Toast notifications
│   └── useVideoRecorder.ts # Video recording logic
├── lib/                # External service clients
│   └── supabase.ts     # Supabase client configuration
├── pages/              # Page-level components
│   ├── AuthPage.tsx    # Login/signup page
│   └── ...
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types
├── utils/              # Utility functions
│   ├── __tests__/      # Utility tests
│   ├── constants.ts    # App constants
│   ├── errorHandler.ts # Error handling utilities
│   ├── security.ts     # Security utilities
│   └── validation.ts   # Input validation
└── test/               # Test utilities and setup
    ├── setup.ts        # Test environment setup
    └── utils/          # Test helper functions
```

### Key Components

#### VideoRecorder
Records video using the MediaRecorder API with comprehensive error handling.
```tsx
<VideoRecorder
  maxDuration={120}
  onVideoReady={(blob) => handleVideo(blob)}
  onRecordingStateChange={(recording) => setRecording(recording)}
/>
```

#### Dashboard
Main recruiter interface for managing interviews and viewing responses.

#### CandidateView
Public interface for candidates to view questions and record responses.

### Custom Hooks

#### useAuth
Manages authentication state and operations.
```tsx
const { user, loading, signIn, signUp, signOut } = useAuth()
```

#### useVideoRecorder
Handles video recording logic with error handling.
```tsx
const {
  isRecording,
  videoBlob,
  startRecording,
  stopRecording,
  resetRecording
} = useVideoRecorder(maxDuration)
```

## 🧪 Testing

### Running Tests
```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

### Test Structure
- **Unit Tests**: Individual functions and hooks
- **Component Tests**: React component behavior
- **Integration Tests**: Component interactions
- **Accessibility Tests**: A11y compliance

### Writing Tests
```tsx
import { render, screen } from '../test/utils/testUtils'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

## 🔧 Development

### Code Quality
```bash
# Lint and fix code
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

### Pre-commit Hooks
Automatically runs on every commit:
- ESLint with auto-fix
- Prettier formatting
- TypeScript type checking

### Environment Variables
```bash
# Required
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
VITE_APP_NAME=fk videoask
VITE_MAX_VIDEO_SIZE_MB=100
VITE_MAX_QUESTION_DURATION=120
VITE_MAX_RESPONSE_DURATION=60
```

## Deployment

### Netlify

1. **Build the project**: `npm run build`
2. **Deploy to Netlify**: Use Netlify's drag-and-drop or connect your Git repository
3. **Environment Variables**: Add your Supabase credentials in Netlify's environment settings

### Environment Variables

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Deployment

### Netlify (Recommended)
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Connect your Git repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

3. **Configure redirects**:
   The `public/_redirects` file handles client-side routing.

### Other Platforms
- **Vercel**: Works out of the box with Git integration
- **AWS S3 + CloudFront**: Static hosting with CDN
- **Docker**: Use the provided Dockerfile for containerization

### Environment Setup
Ensure these environment variables are set in your deployment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🔒 Security

### Security Features
- **Input Sanitization**: XSS prevention on all user inputs
- **Rate Limiting**: Prevents brute force attacks
- **File Validation**: Secure video upload validation
- **CSRF Protection**: Built-in with Supabase
- **SQL Injection Prevention**: Parameterized queries
- **Content Security Policy**: Configurable CSP headers

### Security Best Practices
- Use HTTPS in production
- Regularly update dependencies
- Monitor for security vulnerabilities
- Implement proper backup strategies
- Use environment variables for secrets

### Reporting Security Issues
Please report security vulnerabilities to: [security@yourcompany.com]

See `public/security.txt` for detailed security policy.

## ♿ Accessibility

### Compliance
- **WCAG 2.1 AA** compliant
- **Screen reader** compatible
- **Keyboard navigation** support
- **High contrast** mode support
- **Reduced motion** support

### Features
- Semantic HTML structure
- ARIA labels and roles
- Focus management
- Color contrast compliance
- Alternative text for media

## 🌍 Browser Support

### Supported Browsers
- **Chrome 88+** (recommended)
- **Firefox 85+**
- **Safari 14+**
- **Edge 88+**

### Required Features
- MediaRecorder API
- getUserMedia API
- ES2020 support
- WebRTC support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

### Development Setup
1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/amazing-feature`
5. Make your changes
6. Run tests: `npm run test`
7. Commit changes: `git commit -m 'Add amazing feature'`
8. Push to branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Write tests for new features
- Maintain accessibility standards
- Follow the existing code style
- Add JSDoc comments for public APIs

### Pull Request Process
1. Ensure all tests pass
2. Update documentation if needed
3. Add changeset entry if applicable
4. Request review from maintainers

## 📊 Performance

### Optimization Features
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo for expensive components
- **Bundle Analysis**: Webpack bundle analyzer
- **Image Optimization**: Responsive images and lazy loading
- **Caching**: Service worker ready

### Performance Monitoring
- Core Web Vitals tracking ready
- Error boundary implementation
- Performance API integration points
- Memory leak prevention

## 🔄 API Reference

### Supabase Schema

#### Tables
- **interviews**: Interview metadata
- **interview_questions**: Questions within interviews
- **interview_responses**: Candidate responses
- **users**: Recruiter accounts (managed by Supabase Auth)

#### Storage
- **videos**: Secure video file storage with RLS

#### Security
- Row Level Security (RLS) enabled on all tables
- Policies for recruiter data isolation
- Public read access for interview questions

## 📈 Roadmap

### Planned Features
- [ ] **Interview Templates**: Reusable question sets
- [ ] **Advanced Analytics**: Response metrics and insights
- [ ] **Team Collaboration**: Multi-recruiter support
- [ ] **Integration APIs**: Connect with ATS systems
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **AI Features**: Automated response analysis

### Technical Improvements
- [ ] **Offline Support**: PWA with offline capabilities
- [ ] **Real-time Updates**: Live interview status
- [ ] **Advanced Search**: Full-text search capabilities
- [ ] **Export Features**: PDF reports and data export
- [ ] **Internationalization**: Multi-language support

## License

MIT License - see LICENSE file for details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **React Team** - Frontend framework
- **Tailwind CSS** - Styling system
- **Lucide** - Icon library
- **Vite** - Build tooling
- **Testing Library** - Testing utilities

## Support

For issues and questions, please create an issue in the repository.

## 📞 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact [ameens.in19@gmail.com] for urgent issues

### Community
- **GitHub**: [Repository Link]
- **Discord**: [Community Server] (if applicable)
- **Twitter**: [@yourhandle] (if applicable)

---

**Made with ❤️ *

*Building the future of asynchronous video interviews, one conversation at a time.*