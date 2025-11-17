import React, { useState, useCallback, ChangeEvent } from 'react';
import { editImage, detectObjects, DetectedObject, generateImageFromPrompt, detectText } from '../services/imageEditorService';
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
