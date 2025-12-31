import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { communityService } from '../../services/communityService';
import './CommunityPage.css';

export default function CommunityListPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  const { data: categories } = useQuery({
    queryKey: ['community', 'categories'],
    queryFn: communityService.getCategories,
  });

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['community', 'posts', selectedCategory],
    queryFn: () => communityService.getPosts(selectedCategory),
  });

  const { data: totalCountData } = useQuery({
    queryKey: ['community', 'totalCount'],
    queryFn: () => communityService.getPosts(undefined, 0, 1),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  /* Mutation for Like in List */
  const queryClient = useQueryClient();
  const likeMutation = useMutation({
    mutationFn: (postId: number) => communityService.toggleLike(postId),
    onSuccess: () => {
      // Invalidate posts list query to refresh like status/count
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
  });

  const handleLike = (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    likeMutation.mutate(postId);
  };

  return (
    <div id="communityContainer">
      {/* Tabs */}
      <div className="community_tab">
        <ul>
          <li>
            <button 
              type="button" 
              className={selectedCategory === undefined ? 'active' : ''}
              onClick={() => setSelectedCategory(undefined)}
            >
              전체 <span>{totalCountData?.totalCount || 0}</span>
            </button>
          </li>
          {categories?.map((cat) => (
            <li key={cat.id}>
              <button 
                type="button"
                className={selectedCategory === cat.id ? 'active' : ''}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name} <span>{cat.postCount || 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Post List */}
      <ul className="community_list">
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
        ) : (
          postsData?.posts.map((post) => (
            <li key={post.id} onClick={() => navigate(`/community/${post.id}`)}>
              <div className="list_profile">
                <div className="profile_img">
                    <img src={post.authorProfileUrl || '/assets/images/common/profile_none_img.svg'} alt="" />
                </div>
                <div className="txt_wrap">
                    <strong>{post.authorNickname}</strong>
                    <p>{formatDate(post.createdAt)}</p>
                </div>
              </div>
              
              <strong className="list_tit">{post.title}</strong>
              <p className="list_txt">
                  {post.content}
              </p>
              
              {post.thumbnailUrl && (
                  <div className="list_img">
                      <img src={post.thumbnailUrl.startsWith('http') ? post.thumbnailUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${post.thumbnailUrl}`} alt="" />
                  </div>
              )}

              {/* Like & Comment Counts */}
              <div className="like_comment_count">
                  <div className="count_wrap">
                      <div 
                        className={`icon_img like_icon ${post.isLiked ? 'active' : ''}`}
                        onClick={(e) => handleLike(e, post.id)}
                      ></div> 
                      {post.likeCount}
                  </div>
                  <div className="count_wrap">
                      <div 
                        className={`icon_img comment_icon ${post.isCommentedByMe ? 'active' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                      ></div> 
                      {post.commentCount}
                  </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Write Button */}
      <button type="button" id="writeBtn" onClick={() => navigate('/community/write')}>글쓰기</button>
    </div>
  );
}
