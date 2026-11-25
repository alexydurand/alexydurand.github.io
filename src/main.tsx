import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { prefersReducedMotion } from './lib/motion';

// Content is visible by default; entrance animations only hide it when motion is allowed.
if (!prefersReducedMotion()) document.documentElement.classList.add('will-reveal');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
