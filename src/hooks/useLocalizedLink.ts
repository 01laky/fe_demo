import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { useFaceConfig } from '../contexts/FaceConfigContext';
import { getTranslatedRoute } from '../utils/routeTranslations';

/**
 * Hook that returns a function to create localized links with translated paths.
 * When not authenticated and a public face is selected, paths are prefixed with the face
 * so the URL always reflects the current face (e.g. /en/public/login).
 */
export function useLocalizedLink() {
  const { lang } = useParams<{ lang: string }>();
  const { currentLanguage } = useApp();
  const { t: i18nT } = useTranslation('common');
  const { isAuthenticated } = useAuth();
  const { selectedFace } = useFaceConfig();

  const getLocalizedPath = (path: string): string => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Get current language from URL or context
    const targetLang = (lang as typeof currentLanguage) || currentLanguage;

    // Translate the path based on target language
    const translatedPath = getTranslatedRoute(cleanPath, targetLang, (key: string) => {
      return i18nT(key, { lng: targetLang });
    });

    const pathSegment = translatedPath || cleanPath;
    // When guest and we have a selected (public) face, include face prefix so URL matches UI
    if (!isAuthenticated && selectedFace && pathSegment) {
      return `/${targetLang}/${selectedFace.index}/${pathSegment}`;
    }
    return `/${targetLang}${pathSegment ? `/${pathSegment}` : ''}`;
  };

  return getLocalizedPath;
}
