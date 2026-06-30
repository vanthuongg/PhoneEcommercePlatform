import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CompareProvider } from './contexts/CompareContext';
import App from './App';
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'}>
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <WishlistProvider>
                <CartProvider>
                  <CompareProvider>
                    <ThemeProvider>
                      <App />
                      <Toaster
                        position="top-right"
                        toastOptions={{
                          duration: 3000,
                          style: {
                            background: '#1f2937',
                            color: '#f9fafb',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            fontSize: '14px',
                            fontWeight: '500',
                          },
                          success: {
                            iconTheme: { primary: '#10b981', secondary: '#f9fafb' },
                          },
                          error: {
                            iconTheme: { primary: '#ef4444', secondary: '#f9fafb' },
                          },
                        }}
                      />
                    </ThemeProvider>
                  </CompareProvider>
                </CartProvider>
              </WishlistProvider>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
