import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userManagementService } from '../../services/userManagementService';
import type { UserDetail } from '../../services/userManagementService';
import { DetailPageLayout } from '../../components/common/DetailPageLayout';
import { Button } from '../../components/common/Button';
import { toast } from 'sonner'
import { useConfirm } from '@/hooks/useConfirm'

type UserDetailWithLock = UserDetail & { profileLockedAt?: string | null };

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { confirm: confirmDialog, ConfirmDialog } = useConfirm()

  const { data: user, isLoading, isError } = useQuery<UserDetailWithLock>({
    queryKey: ['users', 'detail', userId],
    queryFn: () => userManagementService.getUserDetail(Number(userId)) as Promise<UserDetailWithLock>,
    enabled: !!userId,
  });

  const handleStatusChange = async () => {
    if (!user) return;
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await userManagementService.updateUserStatus(user.id, newStatus);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!(await confirmDialog({ description: '정말 이 회원을 삭제하시겠습니까?', variant: 'destructive' }))) return;
    try {
      await userManagementService.deleteUser(user.id);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('회원 삭제에 실패했습니다.');
    }
  };

  const handleUnlockProfile = async () => {
    if (!user) return;
    if (!(await confirmDialog({ description: '프로필 잠금을 해제하시겠습니까?', variant: 'destructive' }))) return;
    try {
      await userManagementService.unlockUserProfile(user.id);
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', userId] });
      toast.success('프로필 잠금이 해제되었습니다.');
    } catch (error) {
      console.error('Failed to unlock profile:', error);
      toast.error('프로필 잠금 해제에 실패했습니다.');
    }
  };

  const actions = user ? (
    <>
      {user.profileLockedAt != null && (
        <Button variant="warning" onClick={handleUnlockProfile}>
          프로필 잠금 해제
        </Button>
      )}
      {user.status === 'ACTIVE' ? (
        <Button variant="warning" onClick={handleStatusChange}>
          정지
        </Button>
      ) : (
        <Button variant="success" onClick={handleStatusChange}>
          활성화
        </Button>
      )}
      <Button variant="danger" onClick={handleDelete}>
        삭제
      </Button>
    </>
  ) : undefined;

  if (isLoading) {
    return (
      <DetailPageLayout title="회원 상세" backPath="/users">
        <div className="py-12 text-center text-gray-500">로딩 중...</div>
      </DetailPageLayout>
    );
  }

  if (isError || !user) {
    return (
      <DetailPageLayout title="회원 상세" backPath="/users">
        <div className="py-12 text-center text-gray-500">회원 정보를 불러올 수 없습니다.</div>
      </DetailPageLayout>
    );
  }

  return (
    <DetailPageLayout title="회원 상세" backPath="/users" actions={actions}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">프로필 정보</h2>
            <div className="flex items-center gap-4 mb-6">
              {user.profileImageUrl ? (
                <img className="h-16 w-16 rounded-full object-cover" src={user.profileImageUrl} alt="" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xl">{user.nickname.charAt(0)}</span>
                </div>
              )}
              <div>
                <div className="text-xl font-bold text-gray-900">{user.nickname}</div>
                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  user.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                  user.status === 'DORMANT' ? 'bg-yellow-100 text-yellow-800' :
                  user.status === 'WITHDRAWN' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.status === 'ACTIVE' ? '활성' :
                   user.status === 'SUSPENDED' ? '정지' :
                   user.status === 'DORMANT' ? '휴면' :
                   user.status === 'WITHDRAWN' ? '탈퇴' :
                   user.status}
                </span>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">이메일</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">로그인 제공자</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.oauthProvider || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">골드 잔액</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.goldBalance.toLocaleString()} G</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">가입일</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.createdAt || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">마지막 로그인</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.lastLoginAt || '-'}</dd>
              </div>
              {user.intro && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">소개</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.intro}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Pets */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">반려동물 ({user.pets.length}마리)</h2>
            {user.pets.length === 0 ? (
              <p className="text-sm text-gray-500">등록된 반려동물이 없습니다.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {user.pets.map((pet) => (
                  <li key={pet.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{pet.name}</span>
                      <span className="ml-2 text-sm text-gray-500">{pet.species}</span>
                      {pet.breed && <span className="ml-1 text-sm text-gray-400">/ {pet.breed}</span>}
                    </div>
                    <span className="text-xs text-gray-400">ID: {pet.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">활동 통계</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">총 산책 횟수</dt>
                <dd className="text-sm font-medium text-gray-900">{user.stats.totalWalks.toLocaleString()}회</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">총 산책 거리</dt>
                <dd className="text-sm font-medium text-gray-900">{user.stats.totalDistance.toLocaleString()}m</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">게시글 수</dt>
                <dd className="text-sm font-medium text-gray-900">{user.stats.totalPosts.toLocaleString()}개</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">댓글 수</dt>
                <dd className="text-sm font-medium text-gray-900">{user.stats.totalComments.toLocaleString()}개</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">획득 뱃지</dt>
                <dd className="text-sm font-medium text-gray-900">{user.stats.badgeCount.toLocaleString()}개</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    {ConfirmDialog}
    </DetailPageLayout>
  );
}
