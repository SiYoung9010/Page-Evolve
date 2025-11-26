import React, { useState, useRef } from 'react';

interface Props {
    onAnalyze: (text: string, images: File[]) => Promise<void>;
    isAnalyzing: boolean;
}

const SmartPasteInput: React.FC<Props> = ({ onAnalyze, isAnalyzing }) => {
    const [text, setText] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newImages = Array.from(e.dataTransfer.files).filter((file: File) =>
                file.type.startsWith('image/')
            );
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImages = Array.from(e.target.files).filter((file: File) =>
                file.type.startsWith('image/')
            );
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };
    const handleSubmit = () => {
        if (!text.trim() && images.length === 0) return;
        onAnalyze(text, images);
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                    ✨ Smart Paste (Magic Import)
                </h3>
                <span className="text-xs text-gray-500">텍스트나 이미지를 붙여넣으세요</span>
            </div>

            <div
                className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${isDragging ? 'border-purple-500 bg-purple-900/20' : 'border-gray-600 hover:border-gray-500'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="제품 설명, 스펙, 또는 HTML 코드를 여기에 붙여넣으세요..."
                    className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-500 focus:outline-none resize-none min-h-[80px]"
                />

                {images.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {images.map((file, index) => (
                            <div key={index} className="relative flex-shrink-0 group">
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="preview"
                                    className="h-16 w-16 object-cover rounded-md border border-gray-600"
                                />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700/50">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                    >
                        📷 이미지 추가
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        multiple
                        accept="image/*"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={isAnalyzing || (!text.trim() && images.length === 0)}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                분석 중...
                            </>
                        ) : (
                            '자동 입력하기'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmartPasteInput;
