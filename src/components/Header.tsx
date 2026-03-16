import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useFaceConfig } from '../contexts/FaceConfigContext';
import { useAnimatedGradientStyle } from '../hooks/useAnimatedGradient';
import { MainLogo } from './MainLogo';
import { useLocalizedLink } from '../hooks/useLocalizedLink';
import {
  Home,
  LogIn,
  LogOut,
  UserPlus,
  Info,
  Settings,
  UserCircle,
  Globe,
  Menu,
} from 'lucide-react';
import { getPageIcon } from '../utils/pageIcons';
import './Header.scss';

interface HeaderProps {
  onSettingsToggle?: () => void;
  onMenuToggle?: () => void;
}

export function Header({ onSettingsToggle, onMenuToggle }: HeaderProps) {
  const { t } = useTranslation('common');
  const getLocalizedPath = useLocalizedLink();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { selectedFace, getFaceHomePath } = useFaceConfig();
  const gradientVars = useAnimatedGradientStyle(selectedFace?.gradientSettings);

  /** Check if a link path is currently active */
  const isActive = (linkPath: string) => {
    const resolved = getLocalizedPath(linkPath);
    return location.pathname === resolved || location.pathname.startsWith(resolved + '/');
  };

  return (
    <header className="app-header" style={gradientVars}>
      <div className="header-border-top" />

      <div className="header-main">
        {/* Logo + brand */}
        <Link to={getLocalizedPath('')} className="header-brand">
          <MainLogo />
          <div className="header-brand-text">
            <span className="header-brand-title">The Many Faces</span>
            <span className="header-brand-subtitle">Demo</span>
          </div>
        </Link>

        {/* Mobile burger */}
        <button className="header-burger" type="button" title="Menu" onClick={onMenuToggle}>
          <Menu size={22} />
        </button>

        {/* Navigation icons */}
        <nav className="header-nav">
          {!isAuthenticated ? (
            <>
              <Link
                to={getLocalizedPath('/login')}
                className={`header-icon-link ${isActive('/login') ? 'header-icon-link--active' : ''}`}
                title={t('pages.login.title')}
              >
                <LogIn size={22} />
              </Link>
              <Link
                to={getLocalizedPath('/register')}
                className={`header-icon-link ${isActive('/register') ? 'header-icon-link--active' : ''}`}
                title={t('pages.register.title')}
              >
                <UserPlus size={22} />
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                className="header-icon-link header-icon-btn-link"
                title={t('pages.logout.title')}
                onClick={() => logout()}
              >
                <LogOut size={22} />
              </button>
              <Link
                to={getLocalizedPath(getFaceHomePath())}
                className={`header-icon-link ${isActive(getFaceHomePath()) ? 'header-icon-link--active' : ''}`}
                title={t('pages.homepage.title')}
              >
                <Home size={22} />
              </Link>

              {/* Dynamic face page icons (skip home — already shown above) */}
              {selectedFace?.pages
                .filter((p) => p.pageType?.index !== 'home')
                .map((page) => {
                  const pagePath = page.path.startsWith('/') ? page.path.slice(1) : page.path;
                  const linkPath = `/${selectedFace.index}/${pagePath}`;
                  const Icon = getPageIcon(page.name, page.path, page.pageType?.index);
                  return (
                    <Link
                      key={page.id}
                      to={getLocalizedPath(linkPath)}
                      className={`header-icon-link ${isActive(linkPath) ? 'header-icon-link--active' : ''}`}
                      title={page.name}
                    >
                      <Icon size={22} />
                    </Link>
                  );
                })}
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="header-right">
          {/* Utility icons */}
          <div className="header-utils">
            <button className="header-icon-btn" title="Info" type="button">
              <Info size={16} />
            </button>
            <button
              className="header-icon-btn"
              title="Settings"
              type="button"
              onClick={onSettingsToggle}
            >
              <Settings size={16} />
            </button>
          </div>

          {/* User name + avatar - click goes to profile */}
          {isAuthenticated && user ? (
            <Link
              to={getLocalizedPath(`/profile`)}
              className={`header-user-btn header-user-link ${isActive('/profile') ? 'header-user-link--active' : ''}`}
              title={t('pages.profile.title')}
            >
              <span className="header-user-role">{user.email?.split('@')[0] ?? 'User'}</span>
              <UserCircle size={36} strokeWidth={1.5} />
            </Link>
          ) : (
            <div className="header-avatar-placeholder">
              <Globe size={22} />
            </div>
          )}
        </div>
      </div>

      <div className="header-border-bottom" />
    </header>
  );
}
