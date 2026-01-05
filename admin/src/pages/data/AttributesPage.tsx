import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PetAttribute, CreateAttributeRequest } from '../../services/attributeService';
import { getAttributes, createAttribute, updateAttribute, deleteAttribute } from '../../services/attributeService';

const AttributesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { data: attributes, isLoading } = useQuery({ queryKey: ['attributes'], queryFn: getAttributes });
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<PetAttribute | null>(null);

    // Form State
    const [category, setCategory] = useState<'TRAIT' | 'INTEREST' | 'ALLERGY'>('TRAIT');
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [inputType, setInputType] = useState<'SELECT' | 'RADIO' | 'TEXT'>('SELECT');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [optionsJson, setOptionsJson] = useState('[]');

    const openModal = (attribute: PetAttribute | null) => {
        if (attribute) {
            setEditingAttribute(attribute);
            setCategory(attribute.category);
            setCode(attribute.code);
            setName(attribute.name);
            setInputType(attribute.inputType);
            setDisplayOrder(attribute.displayOrder);
            setOptionsJson(JSON.stringify(attribute.options, null, 2));
        } else {
            setEditingAttribute(null);
            setCategory('TRAIT');
            setCode('');
            setName('');
            setInputType('SELECT');
            setDisplayOrder(0);
            setOptionsJson('[]');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const createMutation = useMutation({
        mutationFn: createAttribute,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attributes'] });
            closeModal();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: number, req: any }) => updateAttribute(data.id, data.req),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attributes'] });
            closeModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAttribute,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attributes'] });
        }
    });

    const handleSubmit = () => {
        try {
            const options = JSON.parse(optionsJson);
            const req: CreateAttributeRequest = {
                category,
                code,
                name,
                inputType,
                displayOrder,
                options
            };
            if (editingAttribute) {
                updateMutation.mutate({ id: editingAttribute.id, req });
            } else {
                createMutation.mutate(req);
            }
        } catch (e) {
            alert("Invalid JSON options");
        }
    };

    const renderCategorySection = (cat: 'TRAIT' | 'INTEREST' | 'ALLERGY', title: string) => (
        <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {attributes?.filter((a: PetAttribute) => a.category === cat).map((attr: PetAttribute) => (
                            <tr key={attr.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{attr.displayOrder}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{attr.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{attr.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{attr.inputType}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button onClick={() => openModal(attr)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(attr.id) }} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Pet Attributes Management</h1>
                <button 
                    onClick={() => openModal(null)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    Add Attribute
                </button>
            </div>

            {renderCategorySection('TRAIT', 'Traits (성향)')}
            {renderCategorySection('INTEREST', 'Interests (관심사)')}
            {renderCategorySection('ALLERGY', 'Allergies (알러지)')}

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">{editingAttribute ? 'Edit Attribute' : 'Add Attribute'}</h2>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                            <select 
                                value={category} 
                                onChange={e => setCategory(e.target.value as any)}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="TRAIT">TRAIT</option>
                                <option value="INTEREST">INTEREST</option>
                                <option value="ALLERGY">ALLERGY</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Code (Unique)</label>
                            <input 
                                type="text" 
                                value={code} 
                                onChange={e => setCode(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={e => setName(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Input Type</label>
                            <select 
                                value={inputType} 
                                onChange={e => setInputType(e.target.value as any)}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="SELECT">SELECT</option>
                                <option value="RADIO">RADIO</option>
                                <option value="TEXT">TEXT</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Display Order</label>
                            <input 
                                type="number" 
                                value={displayOrder} 
                                onChange={e => setDisplayOrder(parseInt(e.target.value))}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Options (JSON)</label>
                            <textarea 
                                value={optionsJson} 
                                onChange={e => setOptionsJson(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32 font-mono"
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1">Example: [{`{"label":"High", "value":"High"}`}]</p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button onClick={closeModal} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">Cancel</button>
                            <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttributesPage;
