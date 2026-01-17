import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './radix/Button';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import './Header.scss';

export function Header() {
  const { t } = useTranslation('common');
  const getLocalizedPath = useLocalizedLink();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Wait a bit for toast to show, then navigate
      setTimeout(() => {
        navigate(getLocalizedPath('/login'), { replace: true });
      }, 100);
    } catch {
      // Even if logout fails, navigate to login
      setTimeout(() => {
        navigate(getLocalizedPath('/login'), { replace: true });
      }, 100);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <Link to={getLocalizedPath('')} className="header-logo">
            Be Demo
          </Link>
        </div>

        <nav className="header-nav">
          {!isAuthenticated ? (
            <>
              <Link to={getLocalizedPath('/login')} className="header-link">
                {t('pages.login.title')}
              </Link>
              <Link to={getLocalizedPath('/register')} className="header-link">
                {t('pages.register.title')}
              </Link>
            </>
          ) : (
            <Link to={getLocalizedPath('/homepage')} className="header-link">
              {t('pages.homepage.title')}
            </Link>
          )}
        </nav>

        <div className="header-right">
          <LanguageSwitcher />
          {isAuthenticated && user && (
            <div className="header-user">
              <span className="header-user-email">{user.email}</span>
              <Button variant="outline" onClick={handleLogout} className="header-logout">
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
