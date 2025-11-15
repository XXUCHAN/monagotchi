import type { ToasterProps } from 'react-hot-toast';

/**
 * Global Toaster Configuration
 * Glassmorphism-styled toast notifications
 */
export const toasterConfig: ToasterProps['toastOptions'] = {
  duration: 4000,
  style: {
    background: 'rgba(31, 41, 55, 0.95)',
    color: '#fff',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fff',
    },
  },
  loading: {
    iconTheme: {
      primary: '#fb5a49',
      secondary: '#fff',
    },
  },
};

