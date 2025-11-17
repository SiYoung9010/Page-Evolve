import React, { useState, useCallback, ChangeEvent } from 'react';
import { editImage, detectObjects, DetectedObject, generateImageFromPrompt, detectText, generateProductStaging } from '../services/imageEditorService';
import { fileToBase64, parseDataUrl } from '../utils/fileUtils';
import { EDIT_PRESETS, PresetKey } from '../constants/editPresets';
import { UploadedImage } from '../types';

interface Props {
  images: UploadedImage[];
  onImageAdd: (image: UploadedImage) => void;
  onImageUpdate: (id: string, updates: Partial<UploadedImage>) => void;
  onImageRemove: (id: string) => void;
  onInsertImage: (image: UploadedImage) => void;
}

const ImageEditorPanel: React.FC<Props> = ({
  images,
  onImageAdd,
  onImageUpdate,
  onImageRemove,
  onInsertImage,
}) => {
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');

  // Product Staging states
  const [moodReferenceType, setMoodReferenceType] = useState<'text' | 'image'>('text');
  const [moodText, setMoodText] = useState('');
  const [moodImage, setMoodImage] = useState<{ dataUrl: string; base64: string; mimeType: string } | null>(null);
  const [selectedProductImage, setSelectedProductImage] = useState<UploadedImage | null>(null);
  const [isGeneratingStaging, setIsGeneratingStaging] = useState(false);

  const handleFileUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToBase64(file);

      // Get image dimensions
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const newImage: UploadedImage = {
        id: crypto.randomUUID(),
        file,
        dataUrl,
        fileName: file.name,
        mimeType: file.type,
        width: img.width,
        height: img.height,
        sizeInBytes: file.size,
        uploadedAt: new Date(),
      };
      onImageAdd(newImage);
      setSelectedImage(newImage);
    } catch (error) {
      console.error('Failed to upload image:', error);
      setEditError('이미지 업로드 실패');
    }
  }, [onImageAdd]);

  const handleEditImage = useCallback(async (prompt: string) => {
    if (!selectedImage) return;

    setIsEditing(true);
    setEditError(null);

    try {
      const { base64, mimeType } = parseDataUrl(selectedImage.dataUrl);
      const editedBase64 = await editImage(base64, mimeType, prompt);
      const editedDataUrl = `data:${mimeType};base64,${editedBase64}`;

      // Get edited image dimensions
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = editedDataUrl;
      });

      // Create new image with edited version
      const editedImage: UploadedImage = {
        id: crypto.randomUUID(),
        file: selectedImage.file,
        dataUrl: editedDataUrl,
        fileName: `edited_${selectedImage.fileName}`,
        mimeType: selectedImage.mimeType,
        width: img.width,
        height: img.height,
        sizeInBytes: selectedImage.sizeInBytes,
        uploadedAt: new Date(),
      };

      onImageAdd(editedImage);
      setSelectedImage(editedImage);
      setEditPrompt('');
    } catch (error) {
      console.error('Failed to edit image:', error);
      setEditError(error instanceof Error ? error.message : '이미지 편집 실패');
    } finally {
      setIsEditing(false);
    }
  }, [selectedImage, onImageAdd]);

  const handlePresetEdit = useCallback((presetKey: PresetKey) => {
    const preset = EDIT_PRESETS[presetKey];
    handleEditImage(preset.prompt);
  }, [handleEditImage]);

  const handleDetectObjects = useCallback(async () => {
    if (!selectedImage) return;

    setIsDetecting(true);
    setEditError(null);

    try {
      const { base64, mimeType } = parseDataUrl(selectedImage.dataUrl);
      const objects = await detectObjects(base64, mimeType);
      setDetectedObjects(objects);
    } catch (error) {
      console.error('Failed to detect objects:', error);
      setEditError(error instanceof Error ? error.message : '객체 감지 실패');
    } finally {
      setIsDetecting(false);
    }
  }, [selectedImage]);

  const handleGenerateImage = useCallback(async () => {
    if (!generatePrompt.trim()) return;

    setIsGenerating(true);
    setEditError(null);

    try {
      const generatedBase64 = await generateImageFromPrompt(generatePrompt);
      const dataUrl = `data:image/png;base64,${generatedBase64}`;

      // Get generated image dimensions
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      // Create a dummy File object for generated images
      const blob = await fetch(dataUrl).then(r => r.blob());
      const file = new File([blob], `generated_${Date.now()}.png`, { type: 'image/png' });

      const newImage: UploadedImage = {
        id: crypto.randomUUID(),
        file,
        dataUrl,
        fileName: `generated_${Date.now()}.png`,
        mimeType: 'image/png',
        width: img.width,
        height: img.height,
        sizeInBytes: blob.size,
        uploadedAt: new Date(),
      };

      onImageAdd(newImage);
      setSelectedImage(newImage);
      setGeneratePrompt('');
    } catch (error) {
      console.error('Failed to generate image:', error);
      setEditError(error instanceof Error ? error.message : '이미지 생성 실패');
    } finally {
      setIsGenerating(false);
    }
  }, [generatePrompt, onImageAdd]);

  const handleMoodImageUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToBase64(file);
      const { base64, mimeType } = parseDataUrl(dataUrl);
      setMoodImage({ dataUrl, base64, mimeType });
    } catch (error) {
      console.error('Failed to upload mood image:', error);
      setEditError('분위기 이미지 업로드 실패');
    }
  }, []);

  const handleGenerateProductStaging = useCallback(async () => {
    if (!selectedProductImage) {
      setEditError('제품 이미지를 선택해주세요');
      return;
    }

    if (moodReferenceType === 'text' && !moodText.trim()) {
      setEditError('분위기 설명을 입력해주세요');
      return;
    }

    if (moodReferenceType === 'image' && !moodImage) {
      setEditError('분위기 참조 이미지를 업로드해주세요');
      return;
    }

    setIsGeneratingStaging(true);
    setEditError(null);

    try {
      const { base64: productBase64, mimeType: productMimeType } = parseDataUrl(selectedProductImage.dataUrl);

      const moodReference = moodReferenceType === 'text'
        ? moodText
        : { base64: moodImage!.base64, mimeType: moodImage!.mimeType };

      const stagedBase64 = await generateProductStaging(productBase64, productMimeType, moodReference);
      const dataUrl = `data:image/png;base64,${stagedBase64}`;

      // Get staged image dimensions
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      // Create File object
      const blob = await fetch(dataUrl).then(r => r.blob());
      const file = new File([blob], `staged_${Date.now()}.png`, { type: 'image/png' });

      const newImage: UploadedImage = {
        id: crypto.randomUUID(),
        file,
        dataUrl,
        fileName: `staged_${Date.now()}.png`,
        mimeType: 'image/png',
        width: img.width,
        height: img.height,
        sizeInBytes: blob.size,
        uploadedAt: new Date(),
      };

      onImageAdd(newImage);
      setSelectedImage(newImage);

      // Clear form
      setMoodText('');
      setMoodImage(null);
      setSelectedProductImage(null);
    } catch (error) {
      console.error('Failed to generate product staging:', error);
      setEditError(error instanceof Error ? error.message : '제품 연출샷 생성 실패');
    } finally {
      setIsGeneratingStaging(false);
    }
  }, [selectedProductImage, moodReferenceType, moodText, moodImage, onImageAdd]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <h3 className="text-lg font-bold text-white mb-3">🎨 Image Studio</h3>

        {/* Upload Button */}
        <label className="block w-full cursor-pointer">
          <div className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md text-center transition-colors">
            📤 이미지 업로드
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Image Generation */}
        <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <h4 className="text-sm font-bold text-purple-400 mb-2">✨ AI 이미지 생성</h4>
          <input
            type="text"
            value={generatePrompt}
            onChange={(e) => setGeneratePrompt(e.target.value)}
            placeholder="예: 흰색 배경에 빨간 사과"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white text-sm mb-2"
          />
          <button
            onClick={handleGenerateImage}
            disabled={isGenerating || !generatePrompt.trim()}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '생성 중...' : '🎨 이미지 생성'}
          </button>
        </div>

        {/* Product Staging */}
        <div className="mb-6 p-4 bg-gradient-to-br from-orange-900/30 to-pink-900/30 border-2 border-orange-500/50 rounded-lg">
          <h4 className="text-sm font-bold text-orange-300 mb-3">🎬 제품 연출샷 생성</h4>

          {/* Mood Reference Type Selection */}
          <div className="mb-3">
            <label className="text-xs text-gray-300 mb-1 block">분위기 참조 방법</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMoodReferenceType('text')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  moodReferenceType === 'text'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                📝 텍스트 설명
              </button>
              <button
                onClick={() => setMoodReferenceType('image')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  moodReferenceType === 'image'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                🖼️ 참조 이미지
              </button>
            </div>
          </div>

          {/* Mood Reference Input */}
          {moodReferenceType === 'text' ? (
            <div className="mb-3">
              <label className="text-xs text-gray-300 mb-1 block">원하는 분위기 설명</label>
              <textarea
                value={moodText}
                onChange={(e) => setMoodText(e.target.value)}
                placeholder="예: 따뜻한 햇살이 비추는 밝은 주방, 나무 테이블 위에 제품 배치"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white text-sm min-h-20"
              />
            </div>
          ) : (
            <div className="mb-3">
              <label className="text-xs text-gray-300 mb-1 block">분위기 참조 이미지</label>
              {moodImage ? (
                <div className="relative">
                  <img src={moodImage.dataUrl} alt="Mood reference" className="w-full h-32 object-cover rounded-md" />
                  <button
                    onClick={() => setMoodImage(null)}
                    className="absolute top-2 right-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md"
                  >
                    삭제
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="px-4 py-3 bg-gray-800 border-2 border-dashed border-gray-600 hover:border-orange-500 rounded-md text-center text-sm text-gray-400 transition-colors">
                    📤 참조 이미지 업로드
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMoodImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* Product Image Selection */}
          <div className="mb-3">
            <label className="text-xs text-gray-300 mb-1 block">제품 이미지 (누끼샷 권장)</label>
            {selectedProductImage ? (
              <div className="relative">
                <img src={selectedProductImage.dataUrl} alt={selectedProductImage.fileName} className="w-full h-32 object-contain bg-black/20 rounded-md" />
                <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded-md">
                  ✓ {selectedProductImage.fileName}
                </div>
                <button
                  onClick={() => setSelectedProductImage(null)}
                  className="absolute top-2 right-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md"
                >
                  변경
                </button>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-600 rounded-md p-3">
                <p className="text-xs text-gray-400 mb-2">라이브러리에서 제품 이미지를 선택하세요</p>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => setSelectedProductImage(image)}
                      className="relative aspect-square bg-black/20 rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-orange-500 transition-colors"
                    >
                      <img src={image.dataUrl} alt={image.fileName} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {images.length === 0 && (
                    <div className="col-span-3 text-xs text-gray-500 text-center py-4">
                      이미지를 먼저 업로드해주세요
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateProductStaging}
            disabled={isGeneratingStaging}
            className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 text-white font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGeneratingStaging ? '🎬 연출샷 생성 중...' : '🎬 제품 연출샷 생성하기'}
          </button>
        </div>

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-300 mb-2">선택된 이미지</h4>
            <div className="relative aspect-square bg-black/20 rounded-lg overflow-hidden">
              <img src={selectedImage.dataUrl} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {selectedImage.width} x {selectedImage.height} px ({(selectedImage.sizeInBytes / 1024).toFixed(1)} KB)
            </div>
          </div>
        )}

        {/* Quick Edit Presets */}
        {selectedImage && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-blue-400 mb-2">⚡ 빠른 편집</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(EDIT_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetEdit(key as PresetKey)}
                  disabled={isEditing}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md transition-colors disabled:opacity-50"
                >
                  {preset.icon} {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Edit */}
        {selectedImage && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-green-400 mb-2">✏️ 커스텀 편집</h4>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="예: 배경을 파란색으로 바꿔줘"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white text-sm mb-2 min-h-20"
            />
            <button
              onClick={() => handleEditImage(editPrompt)}
              disabled={isEditing || !editPrompt.trim()}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md disabled:opacity-50"
            >
              {isEditing ? '편집 중...' : '🎨 편집 적용'}
            </button>
          </div>
        )}

        {/* Object Detection */}
        {selectedImage && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-yellow-400 mb-2">🎯 객체 감지</h4>
            <button
              onClick={handleDetectObjects}
              disabled={isDetecting}
              className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-md disabled:opacity-50 mb-2"
            >
              {isDetecting ? '감지 중...' : '🔍 객체 감지 시작'}
            </button>
            {detectedObjects.length > 0 && (
              <div className="bg-gray-900 rounded-md p-3 space-y-1">
                {detectedObjects.map((obj, idx) => (
                  <div key={idx} className="text-xs text-gray-300">
                    • {obj.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {editError && (
          <div className="mb-6 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
            {editError}
          </div>
        )}

        {/* Image Library */}
        <div>
          <h4 className="text-sm font-bold text-gray-300 mb-2">📚 이미지 라이브러리 ({images.length})</h4>
          <div className="grid grid-cols-2 gap-2">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative aspect-square bg-black/20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedImage?.id === image.id ? 'border-purple-500' : 'border-transparent hover:border-gray-500'
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <img src={image.dataUrl} alt={image.fileName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInsertImage(image);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md"
                  >
                    삽입
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageRemove(image.id);
                      if (selectedImage?.id === image.id) {
                        setSelectedImage(null);
                      }
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorPanel;
