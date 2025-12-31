import { useState, useEffect } from 'react';
import { communityManagementService } from '../../services/communityManagementService';
import type { PostListItem, PostDetail } from '../../services/communityManagementService';

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [page, search]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await communityManagementService.getPosts({
        page,
        size: 20,
        search: search || undefined,
      });
      setPosts(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load posts:', error);
      // Mock data
      setPosts([
        { id: 1, title: '강아지 산책 코스 추천해주세요', content: '서울 강남 근처 좋은 산책 코스 있을까요?', categoryName: '질문', authorNickname: '멍멍이맘', authorId: 1, viewCount: 150, likeCount: 12, commentCount: 8, isHidden: false, createdAt: '2025-12-21 10:30' },
        { id: 2, title: '우리집 고양이 자랑합니다', content: '너무 귀여운 우리 치즈...', categoryName: '자유', authorNickname: '고양이집사', authorId: 2, viewCount: 89, likeCount: 25, commentCount: 15, isHidden: false, createdAt: '2025-12-20 18:00' },
        { id: 3, title: '신고된 게시글', content: '부적절한 내용...', categoryName: '자유', authorNickname: 'baduser', authorId: 3, viewCount: 23, likeCount: 0, commentCount: 2, isHidden: true, createdAt: '2025-12-19 12:00' },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadPostDetail = async (postId: number) => {
    setDetailLoading(true);
    try {
      const detail = await communityManagementService.getPostDetail(postId);
      setSelectedPost(detail);
    } catch (error) {
      console.error('Failed to load post detail:', error);
      // Mock detail
      const mockPost = posts.find(p => p.id === postId);
      if (mockPost) {
        setSelectedPost({
          ...mockPost,
          categoryId: 1,
          authorProfileImage: null,
          imageUrls: [],
          updatedAt: mockPost.createdAt,
          comments: [
            { id: 1, content: '좋은 글이네요!', authorId: 2, authorNickname: '산책러버', isHidden: false, createdAt: '2025-12-21 11:00' },
          ],
        });
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const handleHidePost = async (postId: number) => {
    if (!confirm('이 게시글을 숨기시겠습니까?')) return;
    try {
      await communityManagementService.hidePost(postId, '관리자에 의해 숨김');
      loadPosts();
    } catch (error) {
      console.error('Failed to hide post:', error);
      alert('게시글 숨김에 실패했습니다.');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.')) return;
    try {
      await communityManagementService.deletePost(postId);
      loadPosts();
      setSelectedPost(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('이 댓글을 삭제하시겠습니까?')) return;
    try {
      await communityManagementService.deleteComment(commentId);
      if (selectedPost) {
        loadPostDetail(selectedPost.id);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">커뮤니티 관리</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="제목으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">조회</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">좋아요</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">댓글</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">로딩 중...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">게시글이 없습니다.</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className={`hover:bg-gray-50 ${post.isHidden ? 'bg-gray-100' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{post.title}</div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">{post.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-gray-100 rounded">{post.categoryName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.authorNickname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.viewCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.likeCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.commentCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.isHidden ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {post.isHidden ? '숨김' : '공개'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => loadPostDetail(post.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      상세
                    </button>
                    {!post.isHidden && (
                      <button
                        onClick={() => handleHidePost(post.id)}
                        className="text-orange-600 hover:text-orange-900 mr-3"
                      >
                        숨김
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePost(post.id)}
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

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">게시글 상세</h2>
              <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            {detailLoading ? (
              <div className="py-12 text-center">로딩 중...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">{selectedPost.categoryName} · {selectedPost.authorNickname} · {selectedPost.createdAt}</p>
                  <h3 className="text-lg font-semibold mt-1">{selectedPost.title}</h3>
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
                <div className="flex gap-4 text-sm text-gray-500 border-t pt-4">
                  <span>조회 {selectedPost.viewCount}</span>
                  <span>좋아요 {selectedPost.likeCount}</span>
                  <span>댓글 {selectedPost.commentCount}</span>
                </div>

                {/* Comments */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">댓글 ({selectedPost.comments.length})</h4>
                  <div className="space-y-3">
                    {selectedPost.comments.map((comment) => (
                      <div key={comment.id} className={`p-3 rounded-lg ${comment.isHidden ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">{comment.authorNickname}</p>
                            <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                            <p className="text-xs text-gray-400 mt-1">{comment.createdAt}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                    {selectedPost.comments.length === 0 && (
                      <p className="text-gray-500 text-sm">댓글이 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => handleDeletePost(selectedPost.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                게시글 삭제
              </button>
              <button
                onClick={() => setSelectedPost(null)}
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
