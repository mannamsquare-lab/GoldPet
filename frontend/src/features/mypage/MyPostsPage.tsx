import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { communityService } from '../../services/communityService';
import { SubPageLayout } from '../../components/layout/SubPageLayout';
import '../community/CommunityPage.css';
import './MyPostsPage.css';

type Tab = 'posts' | 'comments';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return '방금 전';
  if (hours < 24) return `${hours}시간 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

export default function MyPostsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['community', 'myPosts'],
    queryFn: () => communityService.getMyPosts(),
    enabled: activeTab === 'posts',
  });

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['community', 'myComments'],
    queryFn: () => communityService.getMyComments(),
    enabled: activeTab === 'comments',
  });

  return (
    <SubPageLayout title="내가 쓴 글" onBack={() => navigate('/mypage')}>
      <div id="myPostsContainer">
        {/* Tab menu - same as #friendFind .group_tab */}
        <div className="group_tab">
          <button
            type="button"
            className={activeTab === 'posts' ? 'active' : ''}
            onClick={() => setActiveTab('posts')}
          >
            작성한 글
          </button>
          <button
            type="button"
            className={activeTab === 'comments' ? 'active' : ''}
            onClick={() => setActiveTab('comments')}
          >
            작성한 댓글
          </button>
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="my-posts-content">
            <div className="post_list">
              {postsLoading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
              ) : postsData?.posts.length === 0 ? (
                <div className="my-posts-empty">
                  <img src="/assets/images/common/comment_icon03.svg" alt="" />
                  작성한 글이 없습니다
                </div>
              ) : (
                <ul className="community_list">
                  {postsData?.posts.map((post) => (
                    <li key={post.id} onClick={() => navigate(`/community/${post.id}`)}>
                      <div className="list_profile">
                        <div className="profile_img">
                          <img src={post.authorProfileUrl || '/assets/images/common/profile_none_img.svg'} alt="" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/common/profile_none_img.svg'; }} />
                        </div>
                        <div className="txt_wrap">
                          <strong>{post.authorNickname}</strong>
                          <p>{formatDate(post.createdAt)}</p>
                        </div>
                      </div>

                      <strong className="list_tit">{post.title}</strong>
                      <p className="list_txt">{post.content}</p>

                      {post.imageUrls && post.imageUrls.length > 0 && (
                        <div className="list_img">
                          <img src={post.imageUrls[0].startsWith('http') ? post.imageUrls[0] : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}${post.imageUrls[0]}`} alt="" />
                        </div>
                      )}

                      <div className="like_comment_count">
                        <div className="count_wrap">
                          <div className={`icon_img like_icon ${post.isLiked ? 'active' : ''}`}></div>
                          {post.likeCount}
                        </div>
                        <div className="count_wrap">
                          <div className="icon_img comment_icon"></div>
                          {post.commentCount}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="my-posts-content">
            {commentsLoading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
            ) : commentsData?.comments.length === 0 ? (
              <div className="my-posts-empty">
                <img src="/assets/images/common/comment_icon03.svg" alt="" />
                작성한 댓글이 없습니다
              </div>
            ) : (
              <ul className="my-comment-list">
                {commentsData?.comments.map((comment) => (
                  <li
                    key={comment.id}
                    className="my-comment-item"
                    onClick={() => navigate(`/community/${comment.postId}`)}
                  >
                    <div className="my-comment-content">{comment.content}</div>
                    <div className="my-comment-meta">
                      <span className="my-comment-post-title">원글: {comment.postTitle}</span>
                      <span className="my-comment-date">{formatDate(comment.createdAt)}</span>
                      {comment.likeCount > 0 && (
                        <span className="my-comment-likes">♥ {comment.likeCount}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </SubPageLayout>
  );
}
