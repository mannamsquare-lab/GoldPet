import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { BottomNav } from '../../components/common/BottomNav';
import { walkService } from '../../services/walkService';
import type { WalkPhotoItem } from '../../services/walkService';
import { resolvePhotoUrl, getCachedPhotoUrl } from './utils/photoUrlCache';
import { useAlert } from '../../contexts/AlertContext';
import './WalkPhotoDetail.css';

export default function WalkPhotoDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  const { walkId, spotId } = useParams<{ walkId: string; spotId: string }>();
  const location = useLocation();

  const photoFromState = location.state as WalkPhotoItem | null;

  const [photo, setPhoto] = useState<WalkPhotoItem | null>(photoFromState);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(
    photoFromState?.imageUrl ? getCachedPhotoUrl(photoFromState.imageUrl) ?? null : null
  );
  const [caption, setCaption] = useState(photoFromState?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [hiddenFromPublic, setHiddenFromPublic] = useState(photoFromState?.hiddenFromPublic ?? false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  // Format date from ISO string
  function formatDate(isoStr: string): string {
    const d = new Date(isoStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }

  // Load photo data if not passed via state
  useEffect(() => {
    if (photo || !walkId) return;
    walkService.getWalkDetail(Number(walkId)).then(walk => {
      const spot = walk.spots?.find(s => s.id === Number(spotId)) ?? walk.spots?.find(s => s.type === 'PHOTO');
      if (spot && spot.imageUrl) {
        const item: WalkPhotoItem = {
          id: Number(spotId),
          imageUrl: spot.imageUrl,
          note: spot.note ?? null,
          walkDate: walk.startTime,
          walkId: Number(walkId),
          petName: walk.petNames?.[0] ?? null,
          petImageUrl: walk.petProfileImageUrls?.[0] ?? null,
          hiddenFromPublic: spot.hiddenFromPublic ?? false,
        };
        setPhoto(item);
        setCaption(spot.note ?? '');
        setHiddenFromPublic(spot.hiddenFromPublic ?? false);
      }
    }).catch(() => {});
  }, [walkId, spotId, photo]);

  useEffect(() => {
    if (!photo?.imageUrl) return;
    const cached = getCachedPhotoUrl(photo.imageUrl);
    if (cached) {
      setResolvedUrl(cached);
      return;
    }
    resolvePhotoUrl(photo.imageUrl)
      .then(setResolvedUrl)
      .catch(() => setResolvedUrl(null));
  }, [photo]);

  const handleSave = async () => {
    if (!walkId || !spotId) return;
    setSaving(true);
    try {
      await walkService.updateSpotNote(Number(walkId), Number(spotId), caption || null);
    } finally {
      setSaving(false);
    }
  };

  const applyVisibility = async (next: boolean) => {
    if (!walkId || !spotId) return;
    setTogglingVisibility(true);
    try {
      await walkService.updateSpotVisibility(Number(walkId), Number(spotId), next);
      setHiddenFromPublic(next);
      queryClient.invalidateQueries({ queryKey: ['walk', 'public', 'photos'] });
      queryClient.invalidateQueries({ queryKey: ['walk', 'my', 'photos'] });
      queryClient.invalidateQueries({ queryKey: ['walk', 'public', 'photos', 'collection'] });
    } catch {
      showAlert('처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setTogglingVisibility(false);
    }
  };

  const handleToggleVisibility = () => {
    if (!walkId || !spotId || togglingVisibility) return;
    const next = !hiddenFromPublic;
    const confirmMsg = next
      ? '이 사진을 공개 갤러리에서 숨길까요?\n다른 사용자에게 더 이상 노출되지 않습니다.'
      : '이 사진을 다시 공개할까요?';
    showConfirm(
      confirmMsg,
      () => { void applyVisibility(next); },
      undefined,
      { confirmText: '확인', cancelText: '취소' }
    );
  };

  return (
    <div className="wpd_page">
      {/* Header */}
      <div className="wpd_header">
        <button type="button" className="wpd_back_btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 6L9 12L15 18" stroke="#614108" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="wpd_content">
        {/* Date row */}
        <div className="wpd_date_row">
          <span className="wpd_date">{photo ? formatDate(photo.walkDate) : ''}</span>
          <button type="button" className="wpd_share_btn" onClick={handleSave} disabled={saving}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="#8A497D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Photo */}
        <div className="wpd_photo_wrap">
          {resolvedUrl ? (
            <img src={resolvedUrl} alt="" className="wpd_photo_img" />
          ) : (
            <div className="wpd_photo_placeholder" />
          )}
        </div>

        {/* Caption */}
        <div className="wpd_caption_box">
          <textarea
            className="wpd_caption_input"
            value={caption}
            onChange={e => setCaption(e.target.value.slice(0, 100))}
            placeholder="산책 사진에 한마디를 남겨보세요"
            rows={3}
            onBlur={handleSave}
          />
          <span className="wpd_caption_counter">{caption.length}/100자</span>
        </div>

        {/* Visibility toggle */}
        <button
          type="button"
          className="wpd_visibility_btn"
          onClick={handleToggleVisibility}
          disabled={togglingVisibility}
        >
          {hiddenFromPublic ? '공개 갤러리에 다시 공개' : '공개 갤러리에서 숨기기'}
        </button>
        {hiddenFromPublic && (
          <p className="wpd_visibility_hint">이 사진은 공개 갤러리와 다른 사용자에게 노출되지 않습니다.</p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
