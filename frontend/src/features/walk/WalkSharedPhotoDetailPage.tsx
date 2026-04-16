import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { BottomNav } from '../../components/common/BottomNav';
import { walkService } from '../../services/walkService';
import type { WalkPhotoItem } from '../../services/walkService';
import { resolvePhotoUrl, getCachedPhotoUrl } from './utils/photoUrlCache';
import './WalkPhotoDetail.css';

export default function WalkSharedPhotoDetailPage() {
  const navigate = useNavigate();
  const { walkId, spotId } = useParams<{ walkId: string; spotId: string }>();
  const location = useLocation();

  const photoFromState = location.state as WalkPhotoItem | null;
  const [photo, setPhoto] = useState<WalkPhotoItem | null>(photoFromState);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(
    photoFromState?.imageUrl ? getCachedPhotoUrl(photoFromState.imageUrl) ?? null : null
  );

  function formatDate(isoStr: string): string {
    const d = new Date(isoStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }

  // Load photo if not in state
  useEffect(() => {
    if (photo || !walkId) return;
    walkService.getWalkDetail(Number(walkId)).then(walk => {
      const target = walk.spots?.find(s => s.id === Number(spotId))
                  ?? walk.spots?.find(s => s.type === 'PHOTO');
      if (target && target.imageUrl && target.id != null) {
        setPhoto({
          id: target.id,
          imageUrl: target.imageUrl,
          note: target.note ?? null,
          walkDate: walk.startTime,
          walkId: Number(walkId),
          petName: walk.petNames?.[0] ?? null,
          petImageUrl: walk.petProfileImageUrls?.[0] ?? null,
        });
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
        </div>

        {/* Photo */}
        <div className="wpd_photo_wrap">
          {resolvedUrl ? (
            <img src={resolvedUrl} alt="" className="wpd_photo_img" />
          ) : (
            <div className="wpd_photo_placeholder" />
          )}
        </div>

        {/* Caption (read-only) */}
        {photo?.note && (
          <div className="wpd_caption_box">
            <textarea
              className="wpd_caption_input readonly"
              value={photo.note}
              readOnly
              rows={3}
            />
            <span className="wpd_caption_counter">{photo.note.length}/100자</span>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
