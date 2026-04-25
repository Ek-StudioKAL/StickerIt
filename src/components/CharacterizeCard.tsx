import { Upload, Wand2 } from 'lucide-react';
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
    <Card title="Characterize" icon={Wand2} className={className}>
      <p className="text-sm text-ink-2 mb-4 leading-relaxed">
        Transform your photo into a clean cartoon sticker character.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCharacterize}
          disabled={isProcessing || !hasImage}
          className="
            flex-1 py-3 bg-accent hover:bg-accent-h text-white
            rounded-xl font-semibold text-sm transition-all
            active:scale-95 disabled:opacity-40 disabled:pointer-events-none
            flex items-center justify-center gap-2
          "
        >
          <Wand2 className="w-4 h-4" />
          Generate Character
        </button>
        <button
          onClick={onUploadClick}
          aria-label="Upload image"
          className="
            px-4 py-3 bg-surface-2 hover:bg-surface-3 text-ink-2
            rounded-xl font-semibold transition-all border border-border
          "
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
