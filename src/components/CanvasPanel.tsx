import { useState } from 'react';
import { Upload, RefreshCw, Camera } from 'lucide-react';

interface CanvasPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  originalImage: string | null;
  isProcessing: boolean;
  processingType: string | null;
  onUploadClick: () => void;
  onDrop?: (file: File) => void;
  className?: string;
}

const processingLabel: Record<string, string> = {
  characterizing:  'Crafting your character…',
  stickerizing:    'Applying the mood…',
  analyzing:       'Generating ideas…',
  processing_image:'Cutting out sticker…',
};

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

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
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
      className={`
        aspect-square rounded-2xl overflow-hidden relative bg-surface-2
        border-2 transition-all duration-200
        ${isDragging ? 'border-accent scale-[1.01]' : 'border-border'}
        ${className}
      `}
      style={{ boxShadow: 'var(--c-shadow-md)' }}
    >
      {/* Checkered transparency background */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-10"
        style={{
          backgroundImage: 'linear-gradient(45deg, #94a3b8 25%, transparent 25%), linear-gradient(-45deg, #94a3b8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #94a3b8 75%), linear-gradient(-45deg, transparent 75%, #94a3b8 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
        }}
      />

      <canvas
        ref={canvasRef}
        width={1024}
        height={1024}
        className={`w-full h-full object-contain relative z-10 transition-opacity duration-200 ${
          isDragging ? 'opacity-40' : ''
        }`}
      />

      {/* Empty state / drag overlay */}
      {(isDragging || !originalImage) && (
        <div
          className={`
            absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20
            backdrop-blur-md transition-all duration-200
            ${isDragging ? 'bg-accent-subtle/80' : 'bg-surface/70'}
          `}
        >
          <div
            className={`
              rounded-2xl flex items-center justify-center shadow-lg mb-4 transition-all
              ${isDragging ? 'bg-accent w-20 h-20 scale-110' : 'bg-surface w-18 h-18'}
            `}
          >
            <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-accent'}`} />
          </div>
          <p className="text-base font-bold text-ink mb-1">
            {isDragging ? 'Drop to upload' : 'Upload a photo'}
          </p>
          <p className="text-sm text-ink-2 mb-5 max-w-[220px]">
            {isDragging
              ? 'Release to use this image'
              : 'Faces, pets, or objects — we\'ll turn it into a sticker'}
          </p>
          {!isDragging && (
            <button
              onClick={onUploadClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-h text-white rounded-xl font-semibold text-sm transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              Choose Photo
            </button>
          )}
        </div>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-surface/85 backdrop-blur-md flex flex-col items-center justify-center z-30">
          <div className="relative mb-4">
            <div className="absolute inset-0 blur-2xl opacity-40 animate-pulse rounded-full bg-accent" />
            <RefreshCw className="w-10 h-10 text-accent animate-spin relative z-10" />
          </div>
          <p className="text-sm font-semibold text-ink">
            {processingLabel[processingType ?? ''] ?? 'Processing…'}
          </p>
        </div>
      )}
    </div>
  );
}
