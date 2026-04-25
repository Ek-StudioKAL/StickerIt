import { useRef, useState } from 'react';
import { Upload, RefreshCw } from 'lucide-react';

interface CanvasPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  originalImage: string | null;
  isProcessing: boolean;
  processingType: string | null;
  onUploadClick: () => void;
  /** Called with the dropped File */
  onDrop?: (file: File) => void;
  /** Extra class applied to the outer wrapper */
  className?: string;
}

export function CanvasPanel({
  canvasRef,
  originalImage,
  isProcessing,
  processingType,
  onUploadClick,
  onDrop,
  className = '',
}: CanvasPanelProps) {
  const [isDragging, setIsDragging] = useState(false);

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
    const file = e.dataTransfer.files?.[0];
    if (file && onDrop) onDrop(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`aspect-square rounded-2xl shadow-xl border-8 overflow-hidden relative bg-slate-100 transition-colors duration-200 ${
        isDragging ? 'border-indigo-500' : 'border-white'
      } ${className}`}
    >
      {/* Checkered background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      />

      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        className={`w-full h-full object-contain relative z-10 transition-opacity duration-200 ${
          isDragging ? 'opacity-50' : 'drop-shadow-2xl'
        }`}
      />

      {(isDragging || !originalImage) && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-md transition-all duration-200 ${
            isDragging ? 'bg-indigo-50/90' : 'bg-white/60'
          }`}
        >
          <div
            className={`rounded-full flex items-center justify-center shadow-xl mb-4 transition-all ${
              isDragging ? 'bg-indigo-100 scale-110 w-24 h-24' : 'bg-white w-20 h-20'
            }`}
          >
            <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-700' : 'text-indigo-600'}`} />
          </div>
          <h3 className="text-2xl font-black mb-2 text-slate-800 tracking-tight">
            {isDragging ? 'Drop Image Here' : 'Upload a Photo'}
          </h3>
          <p className="text-slate-600 mb-6 max-w-xs text-base font-medium">
            {isDragging
              ? 'Release to replace current image'
              : "Faces, pets, or objects work best! We'll turn it into a premium sticker."}
          </p>
          {!isDragging && !originalImage && (
            <button
              onClick={onUploadClick}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 transition-all"
            >
              Choose Image
            </button>
          )}
        </div>
      )}

      {isProcessing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-30">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-30 animate-pulse rounded-full" />
            <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
          </div>
          <p className="mt-4 font-bold text-lg text-slate-800 tracking-tight">
            {processingType === 'characterizing' && 'Crafting your character...'}
            {processingType === 'stickerizing' && 'Adjusting the mood...'}
            {processingType === 'analyzing' && 'Brainstorming magic ideas...'}
            {processingType === 'processing_image' && 'Cutting out sticker...'}
          </p>
        </div>
      )}
    </div>
  );
}
