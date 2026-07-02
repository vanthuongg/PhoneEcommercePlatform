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
                        containerStyle={{
                          top: 85,
                          right: 20,
                          zIndex: 99999999,
                        }}
                        toastOptions={{
                          duration: 3500,
                          style: {
                            background: '#1e293b',
                            color: '#f8fafc',
                            borderRadius: '16px',
                            padding: '14px 18px',
                            fontSize: '14px',
                            fontWeight: '600',
                            boxShadow: '0 20px 45px -8px rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
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
