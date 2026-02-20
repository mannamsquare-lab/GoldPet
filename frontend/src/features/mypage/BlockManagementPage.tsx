import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blockService } from '../../services/blockService';
import type { BlockedUser } from '../../services/blockService';
import { useAlert } from '../../contexts/AlertContext';
import { CACHE_TIME } from '../../config/queryConfig';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import './BlockManagementPage.css';

const BlockManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showConfirm } = useAlert();

  const { data: blockedUsers = [], isLoading } = useQuery({
    queryKey: ['blocks'],
    queryFn: blockService.getBlockList,
    ...CACHE_TIME.DYNAMIC,
  });

  const unblockMutation = useMutation({
    mutationFn: (blockedUserId: number) => blockService.unblockUser(blockedUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
    },
  });

  const handleUnblock = (user: BlockedUser) => {
    showConfirm(
      `${user.blockedNickname || '사용자'}님의 차단을 해제하시겠어요?`,
      () => {
        unblockMutation.mutate(user.blockedUserId);
      }
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 10);
  };

  return (
    <SubPageLayout title="차단 관리">
      <div className="block-management">
        {isLoading ? (
          <div className="block-empty">
            <span className="block-empty-text">로딩 중...</span>
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="block-empty">
            <svg className="block-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M4.93 4.93l14.14 14.14" />
            </svg>
            <span className="block-empty-text">차단한 사용자가 없어요</span>
          </div>
        ) : (
          <div className="block-list">
            {blockedUsers.map((user) => (
              <div key={user.blockId} className="block-item">
                <img
                  className="block-item-photo"
                  src={user.blockedProfileImageUrl || '/assets/images/common/profile_none_img.svg'}
                  alt={user.blockedNickname || '사용자'}
                />
                <div className="block-item-info">
                  <div className="block-item-nickname">{user.blockedNickname || '사용자'}</div>
                  <div className="block-item-detail">
                    {user.blockedPetName && <span>{user.blockedPetName}</span>}
                    {user.blockedPetName && user.blockedAt && <span> · </span>}
                    {user.blockedAt && <span>{formatDate(user.blockedAt)}</span>}
                  </div>
                </div>
                <button
                  className="block-item-unblock"
                  onClick={() => handleUnblock(user)}
                  disabled={unblockMutation.isPending}
                >
                  해제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SubPageLayout>
  );
};

export default BlockManagementPage;
