import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getFacesConfig } from '../api/config/getFacesConfig';
import { markFaceVisited } from '../api/services/faceProfilesApi';
import type { FaceConfig, FacesConfigResponse } from '../api/types/facesConfig';
import { logger } from '../utils/logger';
import { buildFaceHomePath, resolvePostAuthHomePath } from '../utils/faceHomePath';
import { supportedLanguages } from '../i18n/constants';

const STORAGE_KEY = 'selected_face_id';

interface FaceConfigContextType {
  /** All faces from backend */
  allFaces: FacesConfigResponse;
  /** Public faces (visible without auth) */
  publicFaces: FaceConfig[];
  /** Private faces (visible only when authenticated) */
  privateFaces: FaceConfig[];
  /** Faces available to current user based on auth state */
  availableFaces: FaceConfig[];
  /** Currently selected face (null if none) */
  selectedFace: FaceConfig | null;
  /** Select a face by id */
  selectFace: (faceId: number) => void;
  /** Whether config is loading */
  isLoading: boolean;
  /** Config load error */
  error: Error | null;
  /** Reload config from backend (optional token when auth state has not flushed yet). */
  reload: (authToken?: string | null) => Promise<FacesConfigResponse>;
  /** Get the home page path for the selected face (e.g., "/basic/home") */
  getFaceHomePath: () => string;
  /** Home path after sign-in — prefers a private face when the user has one. */
  getPostAuthHomePath: () => string;
}

const FaceConfigContext = createContext<FaceConfigContextType | undefined>(undefined);

export function FaceConfigProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAuthenticated, token } = useAuth();
  const [allFaces, setAllFaces] = useState<FacesConfigResponse>([]);
  const [selectedFaceId, setSelectedFaceId] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loadGenerationRef = useRef(0);

  const loadConfig = useCallback(
    async (authToken?: string | null): Promise<FacesConfigResponse> => {
      const generation = ++loadGenerationRef.current;
      await Promise.resolve();
      const effectiveToken =
        authToken !== undefined && authToken !== null
          ? authToken
          : isAuthenticated
            ? (token ?? undefined)
            : undefined;
      try {
        setIsLoading(true);
        setError(null);
        const config = await getFacesConfig(effectiveToken);
        if (generation !== loadGenerationRef.current) return config;
        setAllFaces(config);
        logger.info('Faces config loaded', {
          faceCount: config.length,
          isAuthenticated: Boolean(effectiveToken),
        });
        return config;
      } catch (err) {
        if (generation !== loadGenerationRef.current) return [];
        logger.error('Failed to load faces config', { error: err });
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return [];
      } finally {
        if (generation === loadGenerationRef.current) {
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated, token]
  );

  // Load config on mount
  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      await loadConfig();
    })();
  }, [loadConfig]);

  const publicFaces = useMemo(() => allFaces.filter((f) => f.isPublic), [allFaces]);

  const privateFaces = useMemo(() => allFaces.filter((f) => !f.isPublic), [allFaces]);

  /** Logged-in users see private tenants plus public faces (CMS pages, demos) without logging out. */
  const availableFaces = useMemo(() => {
    if (!isAuthenticated) return publicFaces;
    const seen = new Set<number>();
    const out: FaceConfig[] = [];
    for (const f of [...privateFaces, ...publicFaces]) {
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      out.push(f);
    }
    return out;
  }, [isAuthenticated, publicFaces, privateFaces]);

  // Auto-select first available face when available faces change or stored id is invalid
  const selectedFace = useMemo(() => {
    if (availableFaces.length === 0) return null;
    const found = availableFaces.find((f) => f.id === selectedFaceId);
    if (found) return found;
    // Fallback to first available
    return availableFaces[0];
  }, [availableFaces, selectedFaceId]);

  const selectFace = useCallback(
    (faceId: number) => {
      setSelectedFaceId(faceId);
      localStorage.setItem(STORAGE_KEY, String(faceId));
      if (!token) return;
      void (async () => {
        try {
          await markFaceVisited(faceId, token);
          const config = await getFacesConfig(token);
          setAllFaces(config);
        } catch {
          // Face switch still applies locally; visit sync is best-effort
        }
      })();
    },
    [token]
  );

  // Keep context in sync when the user lands on `/:lang/:faceIndex/...` (bookmark or deep link).
  useEffect(() => {
    if (isLoading || availableFaces.length === 0) return;
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return;
    const faceSegment = parts[1];
    if (supportedLanguages.includes(faceSegment as (typeof supportedLanguages)[number])) return;
    const match = availableFaces.find((f) => f.index.toLowerCase() === faceSegment.toLowerCase());
    if (match && match.id !== selectedFaceId) {
      queueMicrotask(() => selectFace(match.id));
    }
  }, [location.pathname, isLoading, availableFaces, selectedFaceId, selectFace]);

  // Sync selected face id to storage when auto-corrected
  useEffect(() => {
    if (selectedFace && selectedFace.id !== selectedFaceId) {
      const id = selectedFace.id;
      queueMicrotask(() => {
        setSelectedFaceId(id);
        localStorage.setItem(STORAGE_KEY, String(id));
      });
    }
  }, [selectedFace, selectedFaceId]);

  const getFaceHomePath = useCallback((): string => {
    if (!selectedFace) return '/homepage';
    return buildFaceHomePath(selectedFace);
  }, [selectedFace]);

  const getPostAuthHomePath = useCallback((): string => {
    return resolvePostAuthHomePath(availableFaces);
  }, [availableFaces]);

  return (
    <FaceConfigContext.Provider
      value={{
        allFaces,
        publicFaces,
        privateFaces,
        availableFaces,
        selectedFace,
        selectFace,
        isLoading,
        error,
        reload: loadConfig,
        getFaceHomePath,
        getPostAuthHomePath,
      }}
    >
      {children}
    </FaceConfigContext.Provider>
  );
}

export function useFaceConfig() {
  const context = useContext(FaceConfigContext);
  if (context === undefined) {
    throw new Error('useFaceConfig must be used within a FaceConfigProvider');
  }
  return context;
}
