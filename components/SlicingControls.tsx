// components/SlicingControls.tsx
import React from 'react';

interface Props {
    sliceCount: number;
    onExport: () => void;
    onCancel: () => void;
    isExporting: boolean;
}

const SlicingControls: React.FC<Props> = ({ sliceCount, onExport, onCancel, isExporting }) => {
    return (
        <div className="absolute top-[85px] left-1/2 -translate-x-1/2 z-30 bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg shadow-lg p-3 flex items-center gap-4 animate-fade-in-up">
            <p className="text-sm font-semibold text-yellow-300">
                Slicing Mode: <span className="text-white">Click in the preview to add a slice line. ({sliceCount} slices)</span>
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={onExport}
                    disabled={isExporting}
                    className="px-4 py-1.5 text-sm font-bold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {isExporting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Exporting...
                        </>
                    ) : `Export ${sliceCount} Slices`}
                </button>
                <button
                    onClick={onCancel}
                    className="px-3 py-1.5 text-sm font-semibold bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default SlicingControls;
