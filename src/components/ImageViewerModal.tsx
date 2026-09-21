import React, { useEffect } from 'react';
import { X, ZoomIn, Download } from 'lucide-react';

interface ImageViewerModalProps {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  title = "도면 및 이미지 확대보기",
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-black/40 text-white border-b border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2">
          <ZoomIn className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-200">{title}</span>
        </div>
        <div className="flex items-center space-x-2">
          <a
            href={imageUrl}
            download
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            title="이미지 저장"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/80 text-white transition"
            title="닫기 (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Display Area */}
      <div 
        className="flex-1 overflow-auto p-4 flex items-center justify-center cursor-zoom-out"
        onClick={onClose}
      >
        <div 
          className="max-w-full max-h-full transition-transform duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-white p-1"
          />
          <div className="text-center mt-2">
            <span className="text-[11px] text-white/60 bg-black/60 px-3 py-1 rounded-full">
              모바일에서는 두 손가락으로 확대/축소할 수 있습니다.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
