import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { communityManagementService } from '../../services/communityManagementService';
import type { PostListItem } from '../../services/communityManagementService';
import { Button } from '../../components/common/Button';
import { DataTable } from '../../components/common/DataTable';
import type { ColumnDef } from '../../components/common/DataTable';
import { Pagination } from '../../components/common/Pagination';
import { SearchFilters } from '../../components/common/SearchFilters';
import { usePagedQuery } from '../../hooks/usePagedQuery';
import { useListParams } from '../../hooks/useListParams';

export default function CommunityPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { page, size, search, filters, setPage, setSize, setSearch, setFilter } = useListParams({ defaultSize: 20 });

  const { data, isLoading } = usePagedQuery<PostListItem>({
    queryKey: 'community',
    fetchFn: (params) => communityManagementService.getPosts({
      page: params.page,
      size: params.size,
      search: params.search || undefined,
      categoryId: params.categoryId ? Number(params.categoryId) : undefined,
    }),
    page,
    size,
    filters: { search, ...filters },
  });

  const hideMutation = useMutation({
    mutationFn: (postId: number) => communityManagementService.hidePost(postId, '관리자에 의해 숨김'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community'] }),
    onError: () => alert('게시글 숨김에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: number) => communityManagementService.deletePost(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community'] }),
    onError: () => alert('게시글 삭제에 실패했습니다.'),
  });

  const handleHide = (postId: number) => {
    if (!confirm('이 게시글을 숨기시겠습니까?')) return;
    hideMutation.mutate(postId);
  };

  const handleDelete = (postId: number) => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.')) return;
    deleteMutation.mutate(postId);
  };

  const columns: ColumnDef<PostListItem>[] = [
    {
      key: 'title',
      header: '제목',
      render: (_val, row) => (
        <div>
          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{row.title}</div>
          <div className="text-sm text-gray-500 max-w-xs truncate">{row.content}</div>
        </div>
      ),
    },
    {
      key: 'categoryName',
      header: '카테고리',
      render: (val) => (
        <span className="px-2 py-1 text-xs bg-gray-100 rounded">{val}</span>
      ),
    },
    { key: 'authorNickname', header: '작성자' },
    { key: 'viewCount', header: '조회', align: 'center' },
    { key: 'likeCount', header: '좋아요', align: 'center' },
    { key: 'commentCount', header: '댓글', align: 'center' },
    {
      key: 'isHidden',
      header: '상태',
      render: (val) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          val ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {val ? '숨김' : '공개'}
        </span>
      ),
    },
    {
      key: 'id',
      header: '액션',
      align: 'right',
      render: (_val, row) => (
        <div className="flex justify-end gap-2">
          <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/community/${row.id}`); }}>
            상세
          </Button>
          {!row.isHidden && (
            <Button variant="link" size="sm" className="text-orange-600 hover:text-orange-900"
              onClick={(e) => { e.stopPropagation(); handleHide(row.id); }}>
              숨김
            </Button>
          )}
          <Button variant="link" size="sm" className="text-red-600 hover:text-red-900"
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
            삭제
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">커뮤니티 관리</h1>
      </div>

      <SearchFilters
        fields={[
          { type: 'text', key: 'search', placeholder: '제목으로 검색...' },
          {
            type: 'button-group',
            key: 'hidden',
            options: [
              { value: 'false', label: '공개' },
              { value: 'true', label: '숨김' },
            ],
          },
        ]}
        values={{ search, ...filters }}
        onChange={(key, value) => {
          if (key === 'search') setSearch(value);
          else setFilter(key, value || null);
        }}
      />

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <DataTable<PostListItem>
          columns={columns}
          data={data?.content ?? []}
          loading={isLoading}
          emptyMessage="게시글이 없습니다."
          onRowClick={(row) => navigate(`/community/${row.id}`)}
          rowClassName={(row) => row.isHidden ? 'bg-gray-100 opacity-60' : ''}
        />
      </div>

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements ?? 0}
        size={size}
        onPageChange={setPage}
        onSizeChange={setSize}
      />
    </div>
  );
}
