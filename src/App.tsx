import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageRouter } from './components/LanguageRouter';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { HomePage } from './pages/HomePage';
import { HomePageProtected } from './pages/HomePageProtected';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { logger } from './utils/logger';
import { supportedLanguages } from './i18n/config';
import { getAllRouteTranslations } from './utils/routeTranslations';
import i18n from './i18n/config';
import './styles/toast.scss';

// Get all route translations for routing
const getRoutePaths = (englishRoute: string): string[] => {
  return getAllRouteTranslations(englishRoute, (key: string, options?: { lng?: string }) => {
    return i18n.t(key, { lng: options?.lng || 'en' });
  });
};

function App() {
  logger.info('App component mounted');

  // Get all possible translations for each route
  const loginPaths = getRoutePaths('login');
  const registerPaths = getRoutePaths('register');
  const homepagePaths = getRoutePaths('homepage');

  return (
    <AppProvider>
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            {/* Redirect root to default language */}
            <Route path="/" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />

            {/* Language-based routes */}
            <Route path="/:lang" element={<LanguageRouter />}>
              {/* Guest-only routes - redirect to homepage if authenticated */}
              <Route
                index
                element={
                  <GuestRoute>
                    <HomePage />
                  </GuestRoute>
                }
              />

              {/* Login route with all translations - guest only */}
              {loginPaths.map((path) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
              ))}

              {/* Register route with all translations - guest only */}
              {registerPaths.map((path) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  }
                />
              ))}

              {/* Protected homepage route with all translations */}
              {homepagePaths.map((path) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <ProtectedRoute>
                      <HomePageProtected />
                    </ProtectedRoute>
                  }
                />
              ))}

              {/* Redirect invalid routes to home */}
              <Route path="*" element={<Navigate to=".." replace />} />
            </Route>

            {/* Catch all - redirect to default language */}
            <Route path="*" element={<Navigate to={`/${supportedLanguages[0]}`} replace />} />
          </Routes>
        </BrowserRouter>
        {/* Toast notifications container */}
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
