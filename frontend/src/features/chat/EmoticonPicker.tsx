import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { emoticonService } from '../../services/emoticonService';

interface EmoticonPickerProps {
  onSelect: (emoticonId: number) => void;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 12;

const EmoticonPicker = ({ onSelect, onClose: _onClose }: EmoticonPickerProps) => {
  const [page, setPage] = useState(0);

  const { data: emoticons = [] } = useQuery({
    queryKey: ['emoticons'],
    queryFn: emoticonService.getEmoticons,
    staleTime: Infinity,
  });

  const totalPages = Math.max(1, Math.ceil(emoticons.length / ITEMS_PER_PAGE));
  const pageItems = emoticons.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="chat_detail_emoticon_picker" onClick={(e) => e.stopPropagation()}>
      {emoticons.length === 0 ? (
        <div className="chat_detail_emoticon_empty">사용 가능한 이모티콘이 없습니다</div>
      ) : (
        <>
          <div className="chat_detail_emoticon_grid">
            {pageItems.map((emoticon) => (
              <button
                key={emoticon.id}
                type="button"
                className="chat_detail_emoticon_item"
                onClick={() => onSelect(emoticon.id)}
                title={emoticon.name || undefined}
              >
                <img src={emoticon.imageUrl} alt={emoticon.name || '이모티콘'} />
              </button>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="chat_detail_emoticon_dots">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`chat_detail_emoticon_dot${i === page ? ' active' : ''}`}
                  onClick={() => setPage(i)}
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
