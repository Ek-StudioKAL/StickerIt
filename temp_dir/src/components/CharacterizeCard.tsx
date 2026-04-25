import { Upload, Palette } from 'lucide-react';
import { Card } from './shared';

export function CharacterizeCard({
  isProcessing,
  hasImage,
  onCharacterize,
  onUploadClick,
  className = '',
}: {
  isProcessing: boolean;
  hasImage: boolean;
  onCharacterize: () => void;
  onUploadClick: () => void;
  className?: string;
}) {
  return (
    <Card title="Characterize" icon={Palette} className={className}>
      <p className="text-slate-500 mb-3 text-sm font-medium">
        Turn your photo into a clean, vibrant vector sticker.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCharacterize}
          disabled={isProcessing || !hasImage}
          className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 disabled:hover:bg-slate-900 disabled:active:scale-100"
        >
          Generate Character
        </button>
        <button
          onClick={onUploadClick}
          aria-label="Upload image"
          className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>
    </Card>
  );
}
