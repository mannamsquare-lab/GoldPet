import { useState, useEffect } from 'react';
import { userManagementService } from '../../services/userManagementService';
import type { UserListItem } from '../../services/userManagementService';

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userManagementService.getUsers({
        page,
        size: 20,
        search: search || undefined,
      });
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load users:', error);
      // Mock data for development
      setUsers([
        { id: 1, email: 'user1@example.com', nickname: '멍멍이맘', profileImageUrl: null, status: 'ACTIVE', petCount: 2, walkCount: 45, postCount: 12, createdAt: '2025-12-01 10:00', lastLoginAt: '2025-12-21 14:00' },
        { id: 2, email: 'user2@example.com', nickname: '고양이집사', profileImageUrl: null, status: 'ACTIVE', petCount: 1, walkCount: 23, postCount: 5, createdAt: '2025-12-05 15:30', lastLoginAt: '2025-12-20 09:00' },
        { id: 3, email: 'user3@example.com', nickname: '산책러버', profileImageUrl: null, status: 'INACTIVE', petCount: 3, walkCount: 120, postCount: 30, createdAt: '2025-11-15 08:00', lastLoginAt: '2025-12-10 18:00' },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      await userManagementService.updateUserStatus(userId, newStatus);
      loadUsers();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('정말 이 회원을 삭제하시겠습니까?')) return;
    
    try {
      await userManagementService.deleteUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('회원 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="닉네임으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">회원</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">펫</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">산책</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">게시글</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">로딩 중...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">회원이 없습니다.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.profileImageUrl ? (
                          <img className="h-10 w-10 rounded-full" src={user.profileImageUrl} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">{user.nickname.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.nickname}</div>
                        <div className="text-sm text-gray-500">{user.email || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'ACTIVE' ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.petCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.walkCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.postCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.createdAt || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      상세
                    </button>
                    {user.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleStatusChange(user.id, 'INACTIVE')}
                        className="text-orange-600 hover:text-orange-900 mr-3"
                      >
                        정지
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        활성화
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-4 py-2">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">회원 상세</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3">
              <p><strong>닉네임:</strong> {selectedUser.nickname}</p>
              <p><strong>이메일:</strong> {selectedUser.email || '-'}</p>
              <p><strong>상태:</strong> {selectedUser.status}</p>
              <p><strong>반려동물:</strong> {selectedUser.petCount}마리</p>
              <p><strong>산책:</strong> {selectedUser.walkCount}회</p>
              <p><strong>게시글:</strong> {selectedUser.postCount}개</p>
              <p><strong>가입일:</strong> {selectedUser.createdAt}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
