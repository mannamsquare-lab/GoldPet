import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../../services/communityService';
import './CommunityPage.css';
import { useAlert } from '../../contexts/AlertContext';

export default function CommunityDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  const [commentInput, setCommentInput] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);

  /* Action Sheet State */
  const [actionSheetTarget, setActionSheetTarget] = useState<{ type: 'POST' | 'COMMENT', id: number } | null>(null);

  /* Editing State */
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentInput, setEditCommentInput] = useState('');

  const handleOptionClick = (type: 'POST' | 'COMMENT', id: number) => {
    setActionSheetTarget({ type, id });
  };

  const handleEdit = () => {
    if (!actionSheetTarget) return;

    if (actionSheetTarget.type === 'POST') {
        navigate('/community/write', { state: { mode: 'EDIT', post: post } });
        setActionSheetTarget(null);
    } else {
        // Comment Edit
        const content = post?.comments?.find(c => c.id === actionSheetTarget.id)?.content;
        if (content) {
            setEditingCommentId(actionSheetTarget.id);
            setEditCommentInput(content);
        }
        setActionSheetTarget(null);
    }
  };

  const updateCommentMutation = useMutation({
      mutationFn: (variables: { id: number, content: string }) => communityService.updateComment(variables.id, variables.content),
      onSuccess: () => {
          setEditingCommentId(null);
          queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
      },
      onError: () => showAlert('댓글 수정에 실패했습니다.')
  });

  const handleUpdateComment = () => {
      if (editingCommentId && editCommentInput.trim()) {
          updateCommentMutation.mutate({ id: editingCommentId, content: editCommentInput });
      }
  };



  /* Ref for Main Comment Input */
  const mainInputRef = useRef<HTMLTextAreaElement>(null);

  /* Reset main input height when cleared */
  useEffect(() => {
      if (commentInput === '' && mainInputRef.current) {
          mainInputRef.current.style.height = '40px';
      }
  }, [commentInput]);

  const { data: post, isLoading } = useQuery({
    queryKey: ['community', 'post', postId],
    queryFn: () => communityService.getPostDetail(Number(postId)),
    enabled: !!postId,
  });

  const likeMutation = useMutation({
    mutationFn: () => communityService.toggleLike(Number(postId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
    },
  });

  const commentLikeMutation = useMutation({
    mutationFn: (commentId: number) => communityService.toggleCommentLike(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (variables: { content: string, parentId?: number }) => 
      communityService.createComment(Number(postId), variables.content, variables.parentId),
    onSuccess: () => {
      setCommentInput('');
      setReplyTargetId(null);
      queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: number) => communityService.deletePost(id),
    onSuccess: () => {
      showAlert('게시글이 삭제되었습니다.', () => {
          navigate('/community', { replace: true });
      });
    },
    onError: () => showAlert('게시글 삭제에 실패했습니다.')
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: number) => communityService.deleteComment(id),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
    },
    onError: () => showAlert('댓글 삭제에 실패했습니다.')
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitComment = () => {
    if (commentInput.trim()) {
      commentMutation.mutate({ content: commentInput });
    }
  };

  const handleSubmitReply = (parentId: number, content: string) => {
    if (content.trim()) {
      commentMutation.mutate({ content, parentId });
    }
  };

  const handleDelete = () => {
      if (!actionSheetTarget) return;

      if (actionSheetTarget.type === 'POST') {
          showConfirm('정말 삭제하시겠습니까?', () => {
              deletePostMutation.mutate(actionSheetTarget.id);
              setActionSheetTarget(null);
          });
      } else {
          showConfirm('댓글을 삭제하시겠습니까?', () => {
              deleteCommentMutation.mutate(actionSheetTarget.id);
              setActionSheetTarget(null);
          });
      }
  }

  if (isLoading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!post) {
    return <div className="error">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div id="communityContainer">
      {/* Top Header */}
      <div className="history_util">
        <button type="button" className="back_btn" onClick={() => navigate(-1)}>
          <img src="/assets/images/common/more_btn.svg" alt="Back" />
        </button>
        <button 
            type="button" 
            className="option_btn" 
            onClick={() => post.isMine ? handleOptionClick('POST', post.id) : showAlert('신고 기능 준비 중')}
        >
          <img src="/assets/images/common/option_icon.svg" alt="Option" />
        </button>
      </div>

      <div className="detail_wrap">
        <div className="view_contents">
          {/* Profile */}
          <div className="detail_profile">
            <div className="profile_img">
              <img src={post.authorProfileUrl || '/assets/images/common/profile_none_img.svg'} alt="" />
            </div>
            <div className="txt_wrap">
              <strong>{post.authorNickname}</strong>
              <p>{formatDate(post.createdAt)}</p>
            </div>
          </div>

          {/* Text Content */}
          <div className="detail_txt">
            <strong>{post.title}</strong>
            <p style={{ whiteSpace: 'pre-line' }}>{post.content}</p>
          </div>

          {/* Images */}
          {/* Images */}
          <div className="img_wrap">
             {post.imageUrls && post.imageUrls.length > 0 ? (
                 post.imageUrls.map((url, index) => {
                     const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}${url}`;
                     return <img key={index} src={fullUrl} alt={`Post image ${index + 1}`} style={{ marginBottom: '16px' }} />;
                 })
             ) : post.thumbnailUrl ? (
                 <img src={post.thumbnailUrl.startsWith('http') ? post.thumbnailUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}${post.thumbnailUrl}`} alt="Thumbnail" />
             ) : null}
          </div>

          {/* Like/Comment Counts */}
          <div className="like_comment_count">
            <div className="count_wrap">
              <div 
                className={`icon_img like_icon ${post.isLiked ? 'active' : ''}`}
                onClick={() => likeMutation.mutate()}
                style={{ cursor: 'pointer' }}
              ></div> 
              {post.likeCount}
            </div>
            <div className="count_wrap">
              <div className={`icon_img comment_icon ${post.isCommentedByMe ? 'active' : ''}`}></div> 
              {post.commentCount}
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="comment_wrap">
          <strong className="comment_count">댓글 {post.comments?.length || 0}</strong>

          {(!post.comments || post.comments.length === 0) && (
             <div className="comment_none">
                <img src="/assets/images/common/comment_icon03.svg" alt="" />
                등록된 댓글이 없어요ㅠ
            </div>
          )}

          <ul className="comment_list">
            {post.comments?.map((comment) => (
              <li 
                key={comment.id} 
                className={`comment_item depth_${comment.depth}`}
                style={{ paddingLeft: comment.depth > 1 ? `${(comment.depth - 1) * 40}px` : '0' }}
              >
                 <div className="detail_profile">
                    <div className="profile_img">
                      <img src={comment.authorProfileUrl || '/assets/images/common/profile_none_img.svg'} alt="" />
                    </div>
                </div>
                <div className="comment_info">
                  <div className="profile_txt">
                      <strong>{comment.authorNickname}</strong>
                      <p>{formatDate(comment.createdAt)}</p>
                  </div>
                  
                  {editingCommentId === comment.id ? (
                      <div className="comment_edit_wrap" style={{ marginTop: '8px' }}>
                          <textarea 
                             autoFocus
                             value={editCommentInput}
                             onChange={(e) => setEditCommentInput(e.target.value)}
                             style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', resize: 'none', minHeight: '60px', fontFamily: 'inherit' }}
                          />
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={() => setEditingCommentId(null)} style={{ padding: '6px 12px', borderRadius: '14px', border: '1px solid #ddd', background: '#fff', fontSize: '13px' }}>취소</button>
                              <button onClick={handleUpdateComment} style={{ padding: '6px 12px', borderRadius: '14px', border: 'none', background: '#614108', color: '#fff', fontSize: '13px' }}>저장</button>
                          </div>
                      </div>
                  ) : (
                      <p className="comment_txt">{comment.content}</p>
                  )}
                  
                  <div className="like_comment_count">
                      <div className="count_wrap">
                        <div 
                          className={`icon_img like_icon ${comment.isLikedByMe ? 'active' : ''}`}
                          onClick={() => commentLikeMutation.mutate(comment.id)}
                          style={{ cursor: 'pointer' }}
                        ></div> 
                        {comment.likeCount}
                      </div>
                      <div className="count_wrap">
                        <div className={`icon_img comment_icon ${comment.isRepliedByMe ? 'active' : ''}`}></div> 
                        {comment.replyCount > 0 && comment.replyCount}
                      </div>
                      {/* Allow reply only if depth < 3 */}
                      {comment.depth < 3 && (
                        <button type="button" onClick={() => setReplyTargetId(replyTargetId === comment.id ? null : comment.id)}>
                            답글 쓰기
                        </button>
                      )}
                  </div>
                  
                  {/* Reply Input */}
                  {replyTargetId === comment.id && (
                    <div className="comment_submit" style={{ marginTop: '10px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                      <textarea 
                        autoFocus
                        placeholder="답글을 남겨보세요" 
                        rows={1}
                        style={{ 
                            flex: 1,
                            resize: 'none', 
                            minHeight: '40px', 
                            maxHeight: '120px',
                            padding: '10px 16px', 
                            borderRadius: '20px', 
                            border: '1px solid #e0e0e0',
                            fontFamily: 'inherit',
                            fontSize: '14px',
                            lineHeight: '1.4',
                            overflow: 'hidden'
                        }}
                        onChange={(e) => {
                            e.target.style.height = '40px';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                      />
                      <button type="button" onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLTextAreaElement;
                        handleSubmitReply(comment.id, input.value);
                      }} style={{ height: '40px', padding: '0 16px', marginBottom: '1px', flexShrink: 0 }}>전송</button>
                    </div>
                  )}

                </div>

                {/* Comment Option Button */}
                {comment.isMine && (
                    <button 
                        type="button" 
                        className="comment_util_btn"
                        onClick={() => handleOptionClick('COMMENT', comment.id)}
                    >
                        <img src="/assets/images/common/option_icon02.svg" alt="Options" />
                    </button>
                )}




              </li>
            ))}
          </ul>

          {/* Main Comment Input */}
          <div className="comment_submit" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <textarea 
              ref={mainInputRef}
              placeholder="댓글을 남겨보세요" 
              value={commentInput}
              rows={1}
              onFocus={() => setReplyTargetId(null)}
              style={{ 
                  flex: 1,
                  resize: 'none', 
                  minHeight: '40px', 
                  maxHeight: '120px',
                  padding: '10px 16px', 
                  borderRadius: '20px', 
                  border: '1px solid #e0e0e0',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  overflow: 'hidden'
              }}
              onChange={(e) => {
                setCommentInput(e.target.value);
                e.target.style.height = '40px';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
            />
            <button type="button" onClick={handleSubmitComment} style={{ height: '40px', padding: '0 16px', marginBottom: '1px', flexShrink: 0 }}>전송</button>
          </div>
        </div>
      </div>
      {/* Action Sheet Modal */}
      {actionSheetTarget && (
          <div className="comment_edit_modal" style={{ display: 'block' }}>
              <div className="modal_wrap">
                  <div className="action_list">
                      <button type="button" onClick={handleEdit}>수정</button>
                      <button type="button" onClick={handleDelete}>삭제</button>
                  </div>
                  <button type="button" className="close_btn" onClick={() => setActionSheetTarget(null)}>닫기</button>
              </div>
          </div>
      )}
    </div>
  );
}
