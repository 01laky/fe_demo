import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { AdGrid } from '../components/grid/AdGrid';
import { AlbumGrid } from '../components/grid/AlbumGrid';
import { BlogGrid } from '../components/grid/BlogGrid';
import { ChatRoomGrid } from '../components/grid/ChatRoomGrid';
import { UserProfileGrid } from '../components/grid/UserProfileGrid';
import { StoryGrid } from '../components/grid/StoryGrid';
import { ReelGrid } from '../components/grid/ReelGrid';
import './ComponentListPage.scss';

/** ComponentTypeId enum matching BE ComponentTypeId. */
const COMPONENT_CONFIG: Record<number, { title: string; grid: () => React.ReactNode }> = {
  1: { title: 'Ads', grid: () => <AdGrid /> },
  2: { title: 'Albums', grid: () => <AlbumGrid /> },
  3: { title: 'Blog', grid: () => <BlogGrid /> },
  4: { title: 'Chat Rooms', grid: () => <ChatRoomGrid /> },
  5: { title: 'User Profiles', grid: () => <UserProfileGrid /> },
  6: { title: 'Stories', grid: () => <StoryGrid /> },
  7: { title: 'Reels', grid: () => <ReelGrid /> },
};

export function ComponentListPage() {
  const { componentTypeId } = useParams<{ componentTypeId: string }>();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const id = Number(componentTypeId);
  const config = COMPONENT_CONFIG[id];

  const handleBack = () => navigate(-1);

  if (!config) {
    return (
      <div className="component-list-page component-list-page--error">
        <h2>{t('componentList.notFound', 'Component not found')}</h2>
        <button type="button" className="component-list-back-btn" onClick={handleBack}>
          <ArrowLeft size={18} />
          {t('common.back', 'Back')}
        </button>
      </div>
    );
  }

  return (
    <div className="component-list-page">
      <div className="component-list-header">
        <button type="button" className="component-list-back-btn" onClick={handleBack}>
          <ArrowLeft size={18} />
          {t('common.back', 'Back')}
        </button>
        <h1 className="component-list-title">{config.title}</h1>
      </div>
      <div className="component-list-grid">{config.grid()}</div>
    </div>
  );
}
