import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFaceConfig } from '../../contexts/FaceConfigContext';
import {
  createReel,
  updateReel,
  type ReelItem,
  type CreateReelDto,
} from '../../api/services/ReelsService';
import './AlbumForm.scss';

interface ReelFormProps {
  editReel?: ReelItem | null;
  onSaved?: (reel: ReelItem) => void;
  onCancel?: () => void;
}

export function ReelForm({ editReel, onSaved, onCancel }: ReelFormProps) {
  const { token } = useAuth();
  const { allFaces } = useFaceConfig();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedFaceIds, setSelectedFaceIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!editReel;

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      if (editReel) {
        setTitle(editReel.title);
        setDescription(editReel.description ?? '');
        setVideoUrl(editReel.videoUrl);
        setSelectedFaceIds(editReel.faces.map((f) => f.faceId));
      } else {
        setTitle('');
        setDescription('');
        setVideoUrl('');
        setSelectedFaceIds([]);
      }
    })();
  }, [editReel]);

  const toggleFace = (faceId: number) => {
    setSelectedFaceIds((prev) =>
      prev.includes(faceId) ? prev.filter((id) => id !== faceId) : [...prev, faceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !title.trim() || !videoUrl.trim()) return;

    setSaving(true);
    setError('');

    try {
      const dto: CreateReelDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        videoUrl: videoUrl.trim(),
        faceIds: selectedFaceIds,
      };

      let result: ReelItem;
      if (isEdit) {
        result = await updateReel(editReel!.id, dto, token);
      } else {
        result = await createReel(dto, token);
      }
      onSaved?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save reel');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="album-form" onSubmit={handleSubmit}>
      <h3 className="album-form-heading">{isEdit ? 'Edit Reel' : 'Create Reel'}</h3>

      {error && <div className="album-form-error">{error}</div>}

      <label className="album-form-label">
        Title
        <input
          type="text"
          className="album-form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Reel title"
          maxLength={200}
          required
        />
      </label>

      <label className="album-form-label">
        Description
        <textarea
          className="album-form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          maxLength={2000}
          rows={3}
        />
      </label>

      <label className="album-form-label">
        Video URL
        <input
          type="url"
          className="album-form-input"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://…"
          maxLength={1000}
          required
        />
      </label>

      <fieldset className="album-form-fieldset">
        <legend>Faces (optional)</legend>
        <p className="album-form-reel-faces-hint">
          Leave none selected to show this reel on every face. Select specific faces to limit
          visibility.
        </p>
        <div className="album-form-faces">
          {allFaces.map((face) => (
            <label key={face.id} className="album-form-face-option">
              <input
                type="checkbox"
                checked={selectedFaceIds.includes(face.id)}
                onChange={() => toggleFace(face.id)}
              />
              <span>{face.title}</span>
            </label>
          ))}
          {allFaces.length === 0 && <span className="album-form-no-faces">No faces available</span>}
        </div>
      </fieldset>

      <div className="album-form-actions">
        {onCancel && (
          <button
            type="button"
            className="album-form-btn album-form-btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="album-form-btn album-form-btn--save"
          disabled={saving || !title.trim() || !videoUrl.trim()}
        >
          {saving ? <Loader2 size={16} className="album-form-spinner" /> : <Save size={16} />}
          <span>{isEdit ? 'Update' : 'Create'}</span>
        </button>
      </div>
    </form>
  );
}
