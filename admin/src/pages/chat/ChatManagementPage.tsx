import { useState, useEffect } from 'react';
import { chatManagementService } from '../../services/chatManagementService';
import type { ChatRoomItem, ChatMessageItem } from '../../services/chatManagementService';

export default function ChatManagementPage() {
  const [rooms, setRooms] = useState<ChatRoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const response = await chatManagementService.getChatRooms({ page: 0, size: 50 });
      setRooms(response.content);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (room: ChatRoomItem) => {
    setSelectedRoom(room);
    try {
      const response = await chatManagementService.getRoomMessages(room.id);
      setMessages(response.content);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm('이 채팅방을 삭제하시겠습니까?')) return;
    try {
      await chatManagementService.deleteRoom(roomId);
      loadRooms();
      if (selectedRoom?.id === roomId) setSelectedRoom(null);
    } catch (error) {
      alert('채팅방 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">채팅 관리</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b">
            <h2 className="font-semibold">채팅방 목록</h2>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">로딩 중...</div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center text-gray-500">채팅방이 없습니다.</div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedRoom?.id === room.id ? 'bg-indigo-50' : ''}`}
                  onClick={() => loadMessages(room)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{room.name}</span>
                        <span className={`px-2 py-0.5 text-xs rounded ${room.type === 'GROUP' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>
                          {room.type === 'GROUP' ? '그룹' : '1:1'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{room.lastMessage || '메시지 없음'}</p>
                      <p className="text-xs text-gray-400 mt-1">참여자 {room.participantCount}명</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b">
            <h2 className="font-semibold">{selectedRoom ? selectedRoom.name : '채팅방을 선택하세요'}</h2>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto space-y-3">
            {!selectedRoom ? (
              <div className="text-center text-gray-500 py-8">채팅방을 선택하면 메시지가 표시됩니다.</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">메시지가 없습니다.</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{msg.senderNickname}</span>
                    <span className="text-xs text-gray-400">{msg.createdAt}</span>
                  </div>
                  <p className="text-sm mt-1">{msg.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
