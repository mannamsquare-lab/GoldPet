import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { breedService } from '../../services/breedService';
import { dataService } from '../../services/dataService';
import BreedsPage from './BreedsPage';
import { Button } from '../../components/common/Button';
import { DataTable } from '../../components/common/DataTable';
import { Tabs } from '../../components/common/Tabs';
import type { ColumnDef } from '../../components/common/DataTable';

const DATA_TABS = [
  { key: 'species', label: '반려동물 종' },
  { key: 'breeds', label: '품종' },
  { key: 'categories', label: '커뮤니티 카테고리' },
];

interface SpeciesItem {
  id: number;
  code: string;
  name: string;
}

interface CategoryItem {
  id: number;
  name: string;
  code: string;
}

const speciesColumns: ColumnDef<SpeciesItem>[] = [
  { key: 'code', header: '코드', className: 'font-mono' },
  { key: 'name', header: '이름', className: 'font-medium' },
  {
    key: 'id',
    header: '관리',
    align: 'right',
    render: () => (
      <Button variant="link" size="sm" className="text-red-600 hover:text-red-900">삭제</Button>
    ),
  },
];

const categoryColumns: ColumnDef<CategoryItem>[] = [
  { key: 'name', header: '이름', className: 'font-medium' },
  { key: 'code', header: '코드', className: 'font-mono text-gray-500' },
  {
    key: 'id',
    header: '관리',
    align: 'right',
    render: () => (
      <Button variant="link" size="sm" className="text-red-600 hover:text-red-900">삭제</Button>
    ),
  },
];

export default function DataPage() {
  const [activeTab, setActiveTab] = useState('species');

  const { data: species = [], isLoading: isSpeciesLoading } = useQuery({
    queryKey: ['species'],
    queryFn: breedService.getSpecies,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: dataService.getCategories,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">코드/데이터 관리</h1>

      <Tabs tabs={DATA_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {activeTab !== 'breeds' && (
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">
              {activeTab === 'species' ? '반려동물 종' : '커뮤니티 카테고리'}
            </h2>
            <Button variant="primary">추가</Button>
          </div>
        )}
        {activeTab === 'species' && (
          <DataTable<SpeciesItem>
            columns={speciesColumns}
            data={species as SpeciesItem[]}
            loading={isSpeciesLoading}
            emptyMessage="등록된 종이 없습니다."
          />
        )}
        {activeTab === 'breeds' && (
          <BreedsPage embedded={true} />
        )}
        {activeTab === 'categories' && (
          <DataTable<CategoryItem>
            columns={categoryColumns}
            data={categories as CategoryItem[]}
            loading={isCategoriesLoading}
            emptyMessage="등록된 카테고리가 없습니다."
          />
        )}
      </div>
    </div>
  );
}
