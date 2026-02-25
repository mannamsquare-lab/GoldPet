import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityManagementService } from '../../services/communityManagementService';
import { DetailPageLayout } from '../../components/common/DetailPageLayout';
import { Button } from '../../components/common/Button';

export default function CommunityDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ['community', 'detail', postId],
    queryFn: () => communityManagementService.getPostDetail(Number(postId)),
    enabled: !!postId,
  });

  const hideMutation = useMutation({
    mutationFn: () => communityManagementService.hidePost(Number(postId), '관리자에 의해 숨김'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
    onError: () => alert('게시글 숨김에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => communityManagementService.deletePost(Number(postId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
    onError: () => alert('게시글 삭제에 실패했습니다.'),
  });

  const unhideMutation = useMutation({
    mutationFn: () => communityManagementService.unhidePost(Number(postId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
    onError: () => alert('게시글 숨김 해제에 실패했습니다.'),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => communityManagementService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'detail', postId] });
    },
    onError: () => alert('댓글 삭제에 실패했습니다.'),
  });

  const handleHide = () => {
    if (!confirm('이 게시글을 숨기시겠습니까?')) return;
    hideMutation.mutate();
  };

  const handleUnhide = () => {
    if (!confirm('이 게시글의 숨김을 해제하시겠습니까?')) return;
    unhideMutation.mutate();
  };

  const handleDelete = () => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.')) return;
    deleteMutation.mutate();
  };

  const handleDeleteComment = (commentId: number) => {
    if (!confirm('이 댓글을 삭제하시겠습니까?')) return;
    deleteCommentMutation.mutate(commentId);
  };

  if (isLoading) {
    return (
      <DetailPageLayout title="게시글 상세" backPath="/community">
        <div className="py-12 text-center text-gray-500">로딩 중...</div>
      </DetailPageLayout>
    );
  }

  if (!post) {
    return (
      <DetailPageLayout title="게시글 상세" backPath="/community">
        <div className="py-12 text-center text-gray-500">게시글을 찾을 수 없습니다.</div>
      </DetailPageLayout>
    );
  }

  return (
    <DetailPageLayout
      title="게시글 상세"
      backPath="/community"
      actions={
        <>
          {!post.isHidden ? (
            <Button
              variant="warning"
              onClick={handleHide}
              loading={hideMutation.isPending}
            >
              숨김 처리
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleUnhide}
              loading={unhideMutation.isPending}
            >
              숨김 해제
            </Button>
          )}
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleteMutation.isPending}
          >
            삭제
          </Button>
        </>
      }
    >
      {/* Post Info */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{post.categoryName}</span>
          <span>·</span>
          <span>{post.authorNickname}</span>
          <span>·</span>
          <span>{post.createdAt ?? '-'}</span>
          {post.updatedAt && post.updatedAt !== post.createdAt && (
            <>
              <span>·</span>
              <span className="text-xs text-gray-400">수정됨: {post.updatedAt}</span>
            </>
          )}
          {post.isHidden && (
            <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
              숨김
            </span>
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>

        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>

        {/* Images */}
        {post.imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2">
            {post.imageUrls.map((url, idx) => (
              <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt={`첨부 이미지 ${idx + 1}`}
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex gap-6 text-sm text-gray-500 border-t pt-4">
          <span>조회 <strong className="text-gray-900">{post.viewCount}</strong></span>
          <span>좋아요 <strong className="text-gray-900">{post.likeCount}</strong></span>
          <span>댓글 <strong className="text-gray-900">{post.commentCount}</strong></span>
          <span className="ml-auto text-xs text-gray-400">작성자 ID: {post.authorId}</span>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          댓글 <span className="text-gray-500 font-normal text-base">({post.comments.length})</span>
        </h3>

        {post.comments.length === 0 ? (
          <p className="text-sm text-gray-500">댓글이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg flex justify-between items-start gap-4 ${
                  comment.isHidden ? 'bg-red-50 border border-red-100' : 'bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{comment.authorNickname}</span>
                    {comment.isHidden && (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">숨김</span>
                    )}
                    <span className="text-xs text-gray-400">{comment.createdAt ?? '-'}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  loading={deleteCommentMutation.isPending}
                >
                  삭제
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DetailPageLayout>
  );
}
