# Contributing to fk videoask

Thank you for your interest in contributing to fk videoask! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please read and follow our Code of Conduct.

### Our Standards

- **Be respectful** and inclusive in all interactions
- **Be constructive** when giving feedback
- **Focus on the issue**, not the person
- **Help others learn** and grow
- **Respect different viewpoints** and experiences

## 🚀 Getting Started

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/fk-videoask.git
   cd fk-videoask
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Run tests** to ensure everything works:
   ```bash
   npm run test
   ```

## 📋 How to Contribute

### Reporting Bugs

Before creating a bug report, please:
- **Search existing issues** to avoid duplicates
- **Use the latest version** to ensure the bug still exists
- **Provide detailed information** about the issue

When creating a bug report, include:
- **Clear title** and description
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots or videos** if applicable
- **Environment details** (browser, OS, etc.)
- **Console errors** if any

### Suggesting Features

We welcome feature suggestions! Please:
- **Search existing issues** for similar requests
- **Explain the use case** and why it's valuable
- **Provide detailed specifications** if possible
- **Consider implementation complexity**

### Code Contributions

#### Before You Start
- **Check existing issues** for planned work
- **Create an issue** to discuss major changes
- **Ask questions** if anything is unclear

#### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards
3. **Write or update tests** for your changes
4. **Run the test suite**:
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

5. **Commit your changes** with a clear message:
   ```bash
   git commit -m "feat: add video compression feature"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** with a clear description

## 📝 Coding Standards

### TypeScript Guidelines

- **Use strict TypeScript** - no `any` types unless absolutely necessary
- **Define interfaces** for all data structures
- **Use proper typing** for function parameters and return values
- **Document complex types** with JSDoc comments

```typescript
/**
 * Represents a video interview question
 */
interface InterviewQuestion {
  id: string
  interview_id: string
  question_text: string
  video_url: string
  order_index: number
  created_at: string
}
```

### React Guidelines

- **Use functional components** with hooks
- **Implement proper error boundaries**
- **Use React.memo** for performance optimization when needed
- **Follow hooks rules** (no conditional hooks)
- **Use proper prop types** and default values

```tsx
interface VideoRecorderProps {
  maxDuration?: number
  onVideoReady?: (blob: Blob) => void
  className?: string
}

export const VideoRecorder: React.FC<VideoRecorderProps> = React.memo(({
  maxDuration = 120,
  onVideoReady,
  className = ""
}) => {
  // Component implementation
})
```

### Accessibility Guidelines

- **Use semantic HTML** elements
- **Implement ARIA labels** and roles
- **Ensure keyboard navigation** works
- **Test with screen readers**
- **Maintain color contrast** ratios

```tsx
<button
  onClick={handleSubmit}
  disabled={loading}
  aria-label="Submit interview response"
  className="btn-primary"
>
  {loading ? 'Submitting...' : 'Submit'}
</button>
```

### CSS/Styling Guidelines

- **Use Tailwind CSS** utility classes
- **Follow mobile-first** responsive design
- **Implement dark mode** considerations
- **Use consistent spacing** (8px grid system)
- **Optimize for performance** (avoid large CSS files)

### Testing Guidelines

- **Write tests for new features**
- **Test user interactions**, not implementation details
- **Use semantic queries** (getByRole, getByLabelText)
- **Mock external dependencies**
- **Test accessibility** features

```tsx
describe('VideoRecorder', () => {
  it('should start recording when start button is clicked', async () => {
    const user = userEvent.setup()
    const onVideoReady = vi.fn()
    
    render(<VideoRecorder onVideoReady={onVideoReady} />)
    
    const startButton = screen.getByRole('button', { name: /start recording/i })
    await user.click(startButton)
    
    expect(screen.getByText(/recording/i)).toBeInTheDocument()
  })
})
```

## 🏗️ Project Structure

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── __tests__/      # Component tests
│   └── ComponentName.tsx
├── hooks/              # Custom React hooks
│   ├── __tests__/      # Hook tests
│   └── useHookName.ts
├── pages/              # Page-level components
├── utils/              # Utility functions
│   ├── __tests__/      # Utility tests
│   └── utilityName.ts
├── types/              # TypeScript definitions
└── test/               # Test utilities
```

### Naming Conventions

- **Components**: PascalCase (`VideoRecorder.tsx`)
- **Hooks**: camelCase with `use` prefix (`useVideoRecorder.ts`)
- **Utilities**: camelCase (`errorHandler.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase (`InterviewQuestion`)

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test VideoRecorder.test.tsx
```

### Test Categories

1. **Unit Tests**: Individual functions and hooks
2. **Component Tests**: React component behavior
3. **Integration Tests**: Component interactions
4. **Accessibility Tests**: A11y compliance

### Writing Good Tests

- **Test behavior**, not implementation
- **Use descriptive test names**
- **Follow AAA pattern** (Arrange, Act, Assert)
- **Mock external dependencies**
- **Test edge cases** and error conditions

## 📦 Pull Request Process

### Before Submitting

- [ ] **Tests pass** locally
- [ ] **Linting passes** without errors
- [ ] **Type checking** passes
- [ ] **Documentation** is updated if needed
- [ ] **Accessibility** is maintained
- [ ] **Performance** impact is considered

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Accessibility tested

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] Documentation updated
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** in staging environment
4. **Approval** from at least one maintainer
5. **Merge** to main branch

## 🐛 Debugging

### Common Issues

#### Video Recording Not Working
- Check browser permissions
- Verify HTTPS in production
- Test MediaRecorder API support

#### Supabase Connection Issues
- Verify environment variables
- Check network connectivity
- Validate API keys

#### Build Failures
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify environment setup

### Debug Tools

- **React DevTools** for component debugging
- **Browser DevTools** for network and console
- **Supabase Dashboard** for database queries
- **Vitest UI** for test debugging

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Accessibility Testing Tools](https://www.accessibility-developer-guide.com/tools/)

## 🎯 Areas for Contribution

### High Priority
- **Bug fixes** and stability improvements
- **Accessibility** enhancements
- **Performance** optimizations
- **Test coverage** improvements

### Medium Priority
- **New features** from the roadmap
- **Documentation** improvements
- **Developer experience** enhancements
- **Internationalization** support

### Low Priority
- **Code refactoring** for maintainability
- **Design system** improvements
- **Advanced features** and integrations

## 🏆 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page
- **Community highlights** (if applicable)

## 📞 Getting Help

### Communication Channels
- **GitHub Issues** for bugs and features
- **GitHub Discussions** for questions
- **Email** [dev@yourcompany.com] for urgent issues

### Response Times
- **Bug reports**: 1-2 business days
- **Feature requests**: 3-5 business days
- **Pull requests**: 2-3 business days
- **Questions**: 1-2 business days

## 📄 License

By contributing to fk videoask, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to fk videoask! Your efforts help make video interviews more accessible and efficient for everyone. 🚀