/**
 * Reel - Shows the first reel for the current face with link to detail.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFaceConfig } from '../../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../../hooks/useLocalizedLink';
import { getReels, type ReelItem } from '../../../api/services/ReelsService';
import './Reel.scss';

export function Reel() {
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const getLocalizedPath = useLocalizedLink();
  const faceId = selectedFace?.id;

  const [item, setItem] = useState<ReelItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (!token || faceId == null) {
        if (!cancelled) {
          setLoading(false);
          setItem(null);
        }
        return;
      }
      if (!cancelled) setLoading(true);
      try {
        const list = await getReels(token, faceId);
        if (!cancelled) setItem(list[0] ?? null);
      } catch {
        if (!cancelled) setItem(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, faceId]);

  if (!token || faceId == null) {
    return (
      <div className="reel-component reel-component--message">
        <p>Sign in to see reels.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="reel-component reel-component--message">
        <Loader2 size={28} className="reel-component-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="reel-component reel-component--message">
        <p>No reels yet. Use + to add one.</p>
      </div>
    );
  }

  return (
    <div className="reel-component">
      <Link className="reel-component-link" to={getLocalizedPath(`/reel/${item.id}`)}>
        <video className="reel-video" muted playsInline preload="metadata" src={item.videoUrl} />
        <div className="reel-play-overlay">▶</div>
        <div className="reel-overlay">
          <div className="reel-engagement">
            <span className="reel-stat">♥ {item.likesCount}</span>
            <span className="reel-stat">💬 {item.commentsCount}</span>
          </div>
          <div className="reel-author">
            <span className="reel-author-name">{item.title}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
