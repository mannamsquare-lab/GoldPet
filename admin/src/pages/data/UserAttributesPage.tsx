import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService, type DataItem } from '../../services/dataService';

const UserAttributesPage: React.FC = () => {
    const queryClient = useQueryClient();

    // Fetch Lists
    const { data: interests, isLoading: isInterestsLoading } = useQuery({ queryKey: ['data', 'interests'], queryFn: dataService.getInterests });
    const { data: hobbies, isLoading: isHobbiesLoading } = useQuery({ queryKey: ['data', 'hobbies'], queryFn: dataService.getHobbies });

    // Mutations
    const createInterestMutation = useMutation({
        mutationFn: (name: string) => dataService.createInterest(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['data', 'interests'] });
            setNewInterestName('');
        }
    });

    const deleteInterestMutation = useMutation({
        mutationFn: dataService.deleteInterest,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data', 'interests'] })
    });

    const createHobbyMutation = useMutation({
        mutationFn: (name: string) => dataService.createHobby(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['data', 'hobbies'] });
            setNewHobbyName('');
        }
    });

    const deleteHobbyMutation = useMutation({
        mutationFn: dataService.deleteHobby,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data', 'hobbies'] })
    });

    // Local State
    const [newInterestName, setNewInterestName] = useState('');
    const [newHobbyName, setNewHobbyName] = useState('');

    const renderList = (
        title: string, 
        items: DataItem[] | undefined, 
        isLoading: boolean,
        newValue: string,
        setNewValue: (val: string) => void,
        createAction: () => void,
        deleteAction: (id: number) => void
    ) => (
        <div className="w-1/2 pr-4 pl-4 first:pl-0 last:pr-0">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            
            <div className="flex mb-4">
                <input 
                    type="text" 
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder={`New ${title}`}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                    onKeyDown={(e) => { if(e.key === 'Enter') createAction(); }}
                />
                <button 
                    onClick={createAction}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded whitespace-nowrap"
                >
                    Add
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-4">Loading...</div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {items?.map(item => (
                            <li key={item.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                                <span className="text-gray-900">{item.name}</span>
                                <button 
                                    onClick={() => { if(confirm('Delete?')) deleteAction(item.id) }}
                                    className="text-red-600 hover:text-red-900 text-sm"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                        {items?.length === 0 && <li className="px-6 py-4 text-gray-500">No items found.</li>}
                    </ul>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">User Attributes Management</h1>
            <div className="flex -mx-4">
                {renderList(
                    'Interests (관심사)', 
                    interests, 
                    isInterestsLoading, 
                    newInterestName, 
                    setNewInterestName, 
                    () => { if(newInterestName.trim()) createInterestMutation.mutate(newInterestName); },
                    deleteInterestMutation.mutate
                )}
                {renderList(
                    'Hobbies (취미)', 
                    hobbies, 
                    isHobbiesLoading, 
                    newHobbyName, 
                    setNewHobbyName, 
                    () => { if(newHobbyName.trim()) createHobbyMutation.mutate(newHobbyName); },
                    deleteHobbyMutation.mutate
                )}
            </div>
        </div>
    );
};

export default UserAttributesPage;
