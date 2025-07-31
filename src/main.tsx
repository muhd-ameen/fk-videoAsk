import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { validateEnvironment } from './utils/validation';

// Validate environment variables on startup
try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
  document.body.innerHTML = `
    <div style="
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #fee2e2 0%, #ffffff 50%, #fef3c7 100%);
      padding: 1rem;
    ">
      <div style="
        background: white; 
        padding: 2rem; 
        border-radius: 1rem; 
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        text-align: center;
      ">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">Configuration Error</h1>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">${error instanceof Error ? error.message : 'Environment configuration is invalid'}</p>
        <p style="color: #9ca3af; font-size: 0.875rem;">Please check your .env file and restart the application.</p>
      </div>
    </div>
  `;
  throw error;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
