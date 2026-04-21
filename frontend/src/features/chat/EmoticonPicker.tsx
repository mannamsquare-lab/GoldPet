import { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { emoticonService } from '../../services/emoticonService';
import { GpImage } from '../../components/common/GpImage';

interface EmoticonPickerProps {
  onSelect: (emoticon: { id: number; imageUrl: string }) => void;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 12;

const EmoticonPicker = ({ onSelect }: EmoticonPickerProps) => {
  const [page, setPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: emoticons = [] } = useQuery({
    queryKey: ['emoticons'],
    queryFn: emoticonService.getEmoticons,
    staleTime: Infinity,
  });

  const totalPages = Math.max(1, Math.ceil(emoticons.length / ITEMS_PER_PAGE));

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const newPage = Math.round(el.scrollLeft / el.clientWidth);
    setPage(Math.min(newPage, totalPages - 1));
  }, [totalPages]);

  const scrollToPage = (p: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: p * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="chat_detail_emoticon_picker" onClick={(e) => e.stopPropagation()}>
      {emoticons.length === 0 ? (
        <div className="chat_detail_emoticon_empty">사용 가능한 이모티콘이 없습니다</div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="chat_detail_emoticon_scroll"
            onScroll={handleScroll}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => {
              const pageItems = emoticons.slice(
                pageIndex * ITEMS_PER_PAGE,
                (pageIndex + 1) * ITEMS_PER_PAGE
              );
              return (
                <div key={pageIndex} className="chat_detail_emoticon_page">
                  <div className="chat_detail_emoticon_grid">
                    {pageItems.map((emoticon) => (
                      <button
                        key={emoticon.id}
                        type="button"
                        className="chat_detail_emoticon_item"
                        onClick={() => onSelect({ id: emoticon.id, imageUrl: emoticon.imageUrl })}
                        title={emoticon.name || undefined}
                      >
                        <GpImage
                          src={emoticon.imageUrl}
                          thumbnailSrc={emoticon.imageUrlThumbnail}
                          viewerSrc={emoticon.imageUrlViewer}
                          variant="thumbnail"
                          alt={emoticon.name || '이모티콘'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="chat_detail_emoticon_dots">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`chat_detail_emoticon_dot${i === page ? ' active' : ''}`}
                  onClick={() => scrollToPage(i)}
                  aria-label={`페이지 ${i + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmoticonPicker;
