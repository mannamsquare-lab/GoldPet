import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './assets/css/common.css';
import './styles/styleguide.css';
import './styles/page-layout.css';
import { installGlobalErrorReporter } from './lib/clientErrorReporter';

installGlobalErrorReporter();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
