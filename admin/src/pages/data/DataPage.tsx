import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { breedService } from '../../services/breedService';
import { dataService } from '../../services/dataService';
import BreedsPage from './BreedsPage';

export default function DataPage() {
  const [activeTab, setActiveTab] = useState<'species' | 'breeds' | 'categories'>('species');

  const { data: species, isLoading: isSpeciesLoading } = useQuery({
    queryKey: ['species'],
    queryFn: breedService.getSpecies
  });

  // Breeds data fetching is now handled by BreedsPage component

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: dataService.getCategories
    });

  const isLoading = isSpeciesLoading || isCategoriesLoading;

  const renderTable = () => {
    if (activeTab === 'species') {
        return (
            <table className="min-w-full divide-y divide-gray-200">
                {/* ... existing species table code ... */}
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {species?.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{item.code}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    } 
    
    if (activeTab === 'breeds') {
        return <BreedsPage embedded={true} />;
    }

    // Categories
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
            {/* <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Posts</th> Post count not in simple DataItem */}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {categories?.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap font-medium">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">{item.code}</td>
              {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{0}</td> */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Code/Data Management</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('species')}
          className={`px-4 py-2 font-medium ${activeTab === 'species' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          Pet Species
        </button>
        <button
          onClick={() => setActiveTab('breeds')}
          className={`px-4 py-2 font-medium ${activeTab === 'breeds' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          Breeds
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium ${activeTab === 'categories' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          Community Categories
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {activeTab !== 'breeds' && (
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">
              {activeTab === 'species' ? 'Pet Species' : 'Community Categories'}
            </h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              + Add
            </button>
          </div>
        )}
        {isLoading && activeTab !== 'breeds' ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : (
          renderTable()
        )}
      </div>
    </div>
  );
}
