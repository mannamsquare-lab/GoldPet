import { useState, useEffect } from 'react';

interface CodeItem {
  id: number;
  code: string;
  name: string;
  category: string;
  isActive: boolean;
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  postCount: number;
  isActive: boolean;
}

export default function DataPage() {
  const [activeTab, setActiveTab] = useState<'species' | 'breeds' | 'categories'>('species');
  const [species, setSpecies] = useState<CodeItem[]>([]);
  const [breeds, setBreeds] = useState<CodeItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data
      setSpecies([
        { id: 1, code: 'DOG', name: '강아지', category: 'PET_SPECIES', isActive: true },
        { id: 2, code: 'CAT', name: '고양이', category: 'PET_SPECIES', isActive: true },
        { id: 3, code: 'BIRD', name: '조류', category: 'PET_SPECIES', isActive: true },
        { id: 4, code: 'RABBIT', name: '토끼', category: 'PET_SPECIES', isActive: true },
      ]);
      setBreeds([
        { id: 1, code: 'DOG_GOLDEN', name: '골든리트리버', category: 'DOG', isActive: true },
        { id: 2, code: 'DOG_POODLE', name: '푸들', category: 'DOG', isActive: true },
        { id: 3, code: 'DOG_SHIBA', name: '시바견', category: 'DOG', isActive: true },
        { id: 4, code: 'CAT_PERSIAN', name: '페르시안', category: 'CAT', isActive: true },
        { id: 5, code: 'CAT_RUSSIAN', name: '러시안블루', category: 'CAT', isActive: true },
      ]);
      setCategories([
        { id: 1, name: '자유게시판', slug: 'free', postCount: 156, isActive: true },
        { id: 2, name: '질문/답변', slug: 'qna', postCount: 89, isActive: true },
        { id: 3, name: '정보공유', slug: 'info', postCount: 67, isActive: true },
        { id: 4, name: '자랑하기', slug: 'show', postCount: 234, isActive: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (activeTab === 'species' || activeTab === 'breeds') {
      const data = activeTab === 'species' ? species : breeds;
      return (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">코드</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">분류</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{item.code}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.isActive ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">수정</button>
                  <button className="text-red-600 hover:text-red-900">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">게시글</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap font-medium">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">{item.slug}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{item.postCount}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {item.isActive ? '활성' : '비활성'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-indigo-600 hover:text-indigo-900 mr-3">수정</button>
                <button className="text-red-600 hover:text-red-900">삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">코드/데이터 관리</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('species')}
          className={`px-4 py-2 font-medium ${activeTab === 'species' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          반려동물 종류
        </button>
        <button
          onClick={() => setActiveTab('breeds')}
          className={`px-4 py-2 font-medium ${activeTab === 'breeds' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          품종
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium ${activeTab === 'categories' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          게시판 카테고리
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold">
            {activeTab === 'species' ? '반려동물 종류' : activeTab === 'breeds' ? '품종 목록' : '게시판 카테고리'}
          </h2>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            + 추가
          </button>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-500">로딩 중...</div>
        ) : (
          renderTable()
        )}
      </div>
    </div>
  );
}
