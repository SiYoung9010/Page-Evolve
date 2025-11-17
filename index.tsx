
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageEvolveProvider } from './contexts/PageEvolveContext';
import { FeedbackProvider } from './contexts/FeedbackContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <PageEvolveProvider>
        <FeedbackProvider>
          <App />
        </FeedbackProvider>
      </PageEvolveProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
