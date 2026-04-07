/**
 * ChatRoomGrid - Paginated grid of chat room cards (API-backed)
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import { useLocalizedLink } from '../../hooks/useLocalizedLink';
import { COMPONENT_TYPE_ID } from '../../constants/componentTypeIds';
import { listChatRooms, type FaceChatRoomDto } from '../../api/services/ChatRoomsService';
import { ChatRoomCard } from './ChatRoomCard';
import './ChatRoomGrid.scss';

const CARD_MIN_W = 180;
const CARD_MIN_H = 100;

export interface ChatRoomGridProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function ChatRoomGrid({ page: controlledPage, onPageChange }: ChatRoomGridProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const getLocalizedPath = useLocalizedLink();
  const { token } = useAuth();
  const { selectedFace } = useFaceConfig();
  const [rooms, setRooms] = useState<FaceChatRoomDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [internalPage, setInternalPage] = useState(0);
  const isControlled = onPageChange != null;
  const page = isControlled && controlledPage !== undefined ? controlledPage : internalPage;

  useEffect(() => {
    if (!selectedFace || !token) {
      setRooms([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await listChatRooms(selectedFace.id, token);
        if (!cancelled) setRooms(list);
      } catch {
        if (!cancelled) setRooms([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedFace, token]);

  const calcItems = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const paginationHeight = 32;
    const availH = clientHeight - paginationHeight;
    const cols = Math.max(1, Math.floor(clientWidth / CARD_MIN_W));
    const rows = Math.max(1, Math.floor(availH / CARD_MIN_H));
    setItemsPerPage(cols * rows);
  }, []);

  useEffect(() => {
    calcItems();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => calcItems());
    ro.observe(el);
    return () => ro.disconnect();
  }, [calcItems]);

  const totalPages = Math.max(1, Math.ceil(rooms.length / itemsPerPage));
  const clampedPage = Math.min(page, Math.max(0, totalPages - 1));
  const visibleRooms = useMemo(
    () => rooms.slice(clampedPage * itemsPerPage, (clampedPage + 1) * itemsPerPage),
    [clampedPage, itemsPerPage, rooms]
  );

  useEffect(() => {
    onPageChange?.(clampedPage, totalPages);
  }, [clampedPage, totalPages, onPageChange]);

  const setPage = useCallback(
    (value: number | ((prev: number) => number)) => {
      const next =
        typeof value === 'function'
          ? value(isControlled ? (controlledPage ?? 0) : internalPage)
          : value;
      if (isControlled) onPageChange?.(Math.max(0, Math.min(next, totalPages - 1)), totalPages);
      else setInternalPage(next);
    },
    [isControlled, controlledPage, internalPage, totalPages, onPageChange]
  );

  const showInternalPagination = !isControlled;

  const goDetail = (id: number) => {
    navigate(getLocalizedPath(`/detail/${COMPONENT_TYPE_ID.chatRoomGrid}/${id}`));
  };

  if (!selectedFace || !token) {
    return (
      <div className="chatroom-grid-component" ref={containerRef}>
        <p className="chatroom-grid-hint">Sign in to see chat rooms.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="chatroom-grid-component chatroom-grid-component--center" ref={containerRef}>
        <Loader2 className="chatroom-grid-spinner" size={28} />
      </div>
    );
  }

  return (
    <div className="chatroom-grid-component" ref={containerRef}>
      <div className="chatroom-grid-items">
        {visibleRooms.map((room) => (
          <ChatRoomCard key={room.id} room={room} onOpen={() => goDetail(room.id)} />
        ))}
      </div>
      {showInternalPagination && totalPages > 1 && (
        <div className="chatroom-grid-pagination">
          <button disabled={clampedPage === 0} onClick={() => setPage((p) => p - 1)}>
            ‹
          </button>
          <span>
            {clampedPage + 1} / {totalPages}
          </span>
          <button disabled={clampedPage >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            ›
          </button>
        </div>
      )}
    </div>
  );
}
