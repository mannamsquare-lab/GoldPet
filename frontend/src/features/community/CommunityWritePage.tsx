import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { communityService } from '../../services/communityService';
import type { CreatePostRequest } from '../../services/communityService';
import { nativeBridge } from '../../bridge/nativeBridge';
import { useAlert } from '../../contexts/AlertContext';

// Helper to convert base64 to File
const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export default function CommunityWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();
  const editMode = location.state?.mode === 'EDIT';
  const initialPost = location.state?.post;

  const [formData, setFormData] = useState<CreatePostRequest>({
    categoryId: initialPost?.categoryId || 1,
    title: initialPost?.title || '',
    content: initialPost?.content || '',
    postType: initialPost?.postType || 'GENERAL',
  });

  /* Image State */
  type MediaItem = { file?: File; url?: string; previewUrl: string };
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const { data: categories } = useQuery({
    queryKey: ['community', 'categories'],
    queryFn: communityService.getCategories,
  });

  // Initialize Edit Mode
  useEffect(() => {
      if (editMode && initialPost?.imageUrls) {
          const items = initialPost.imageUrls.map((url: string) => ({
              url: url,
              previewUrl: url
          }));
          setMediaItems(items);
      }
  }, [editMode, initialPost]);

  // Set default category when loaded
  useEffect(() => {
    if (categories && categories.length > 0 && formData.categoryId === 1 && !editMode) {
       const exists = categories.find(c => c.id === formData.categoryId);
       if (!exists) {
           setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
       }
    }
  }, [categories, editMode]);

  const createMutation = useMutation({
    mutationFn: communityService.createPost,
    onSuccess: (data) => {
      showAlert('게시글이 등록되었습니다.', () => {
          if (data.postId) {
              navigate(`/community/${data.postId}`, { replace: true });
          } else {
              navigate('/community', { replace: true });
          }
      });
    },
    onError: () => {
       showAlert('게시글 등록에 실패했습니다.'); 
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
        // Upload new files
        const uploadPromises = mediaItems.map(async (item) => {
            if (item.file) {
                return await communityService.uploadFile(item.file);
            }
            return item.url!; // Existing URL
        });
        
        const finalUrls = await Promise.all(uploadPromises);
        
        return communityService.updatePost(initialPost.id, { 
            title: data.title, 
            content: data.content,
            imageUrls: finalUrls 
        });
    },
    onSuccess: () => {
        showAlert('게시글이 수정되었습니다.', () => {
             navigate(`/community/${initialPost.id}`, { replace: true });
        });
    },
     onError: () => showAlert('수정에 실패했습니다.')
  });

  /* Image Handling */
  const handleImageAction = async () => {
      if (nativeBridge.isAvailable()) {
          try {
              // Call Native File/Image Picker
              const result = await nativeBridge.callMethod('pickImage');
              if (result && result.base64) {
                  const file = base64ToFile(`data:${result.mimeType || 'image/jpeg'};base64,${result.base64}`, result.name || 'uploaded_image.jpg');
                  
                  if (mediaItems.length < 10) {
                      const newItem = { file, previewUrl: URL.createObjectURL(file) };
                      setMediaItems(prev => [...prev, newItem]);
                  }
              }
          } catch (e) {
              console.error("Native bridge error:", e);
              document.getElementById('image_input')?.click();
          }
      } else {
          // Web Fallback
          document.getElementById('image_input')?.click();
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const filesArray = Array.from(e.target.files);
          const newItems = filesArray.map(file => ({
              file,
              previewUrl: URL.createObjectURL(file)
          }));
          
          setMediaItems(prev => [...prev, ...newItems].slice(0, 10));
      }
  };

  const handleRemoveImage = (index: number) => {
      setMediaItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showAlert('제목과 내용을 입력해주세요.');
      return;
    }
    
    if (editMode) {
        updateMutation.mutate(formData);
    } else {
        // Prepare files for create
        const filesToUpload = mediaItems.map(item => item.file).filter((f): f is File => !!f);
        createMutation.mutate({ ...formData, images: filesToUpload });
    }
  };

  return (
    <>
    <div id="writeModal" style={{ display: 'block' }}>
      <div className="modal_wrap">
        {/* Title */}
        <div className="input_wrap">
            <label htmlFor="write_title">제목</label>
            <input 
              type="text" 
              id="write_title" 
              placeholder="제목을 입력해주세요." 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
        </div>
        
        {/* Content */}
        <div className="input_wrap">
            <label htmlFor="write_txt">내용</label>
            <textarea 
              id="write_txt" 
              placeholder="게시글 내용을 입력해주세요." 
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            ></textarea>
        </div>

        {/* Category Selection */}
         <div className="input_wrap">
             <label>카테고리</label>
             <select
                 style={{ width: '100%', height: '48px', padding: '0 12px', border: '0', borderRadius: '16px', fontSize: '16px', fontWeight: 500, backgroundColor: 'white' }}
                 value={formData.categoryId}
                 disabled={editMode} // Category change not supported on backend
                 onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
             >
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
         </div>

        <div className="img_upload_wrap">
            <p>이미지 <span>({mediaItems.length}/10)</span></p>
            <input 
                type="file" 
                id="image_input" 
                multiple 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
            />
            <ul>
                {/* Upload Button (Camera Icon) */}

                
                {/* Preview List */}
                {mediaItems.map((item, index) => (
                    <li key={index}>
                        <div className="img_upload_btn" style={{ backgroundImage: `url(${item.previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            <button 
                                type="button" 
                                className="delete_btn" 
                                onClick={() => handleRemoveImage(index)}
                                style={{ display: 'block' }} 
                            ></button>
                        </div>
                    </li>
                ))}

                {/* More Button (+ Icon) - Only show if less than 10 images */}
                {mediaItems.length < 10 && (
                     <li>
                        <button type="button" className="more_btn" onClick={handleImageAction}></button>
                    </li>
                )}
            </ul>
        </div>
        
        {/* ... Submit Button & Close ... */}
        {/* Submit Button */}
        <button 
          type="button" 
          className={`submit_btn ${!formData.title || !formData.content ? 'disabled' : ''}`}
          onClick={(e) => handleSubmit(e as any)}
          disabled={!formData.title || !formData.content || createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending ? '처리 중...' : (editMode ? '수정하기' : '등록하기')}
        </button>

        <button type="button" className="modal_close_btn" onClick={() => navigate(-1)}>
            <img src="/assets/images/common/close_icon.svg" alt="" />
        </button>
      </div>
    </div>
    </>
  );
}
