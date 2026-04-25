import { Upload, Camera } from 'lucide-react';
import { CanvasPanel } from './CanvasPanel';
import { HistoryStrip } from './HistoryStrip';
import type { AppState, HistoryItem } from '../hooks/useAppState';

export function MobilePreviewTab({
  state,
  canvasRef,
  onUploadClick,
  onDrop,
  onLoadHistory,
}: {
  state: Pick<AppState, 'originalImage' | 'characterBase64' | 'isProcessing' | 'processingType' | 'history'>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onUploadClick: () => void;
  onDrop: (file: File) => void;
  onLoadHistory: (item: HistoryItem) => void;
}) {
  return (
    <div className="space-y-4">
      <CanvasPanel
        canvasRef={canvasRef}
        originalImage={state.originalImage}
        isProcessing={state.isProcessing}
        processingType={state.processingType}
        onUploadClick={onUploadClick}
        onDrop={onDrop}
      />

      {state.originalImage && (
        <button
          onClick={onUploadClick}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border-2 border-dashed border-slate-200 hover:border-indigo-300"
        >
          <Camera className="w-4 h-4" />
          Change Image
        </button>
      )}

      <HistoryStrip
        history={state.history}
        currentImage={state.originalImage}
        currentCharacter={state.characterBase64}
        onLoad={onLoadHistory}
      />
    </div>
  );
}
