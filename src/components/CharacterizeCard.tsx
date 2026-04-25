import { Upload, Wand2 } from 'lucide-react';
import { Card } from './shared';

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

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
    <Card title="Generate Character" icon={Wand2} className={className}>
      <p className="text-sm text-ink-2 mb-4 leading-relaxed">
        Transform your photo into a clean cartoon sticker character using AI.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCharacterize}
          disabled={isProcessing || !hasImage}
          aria-label={isProcessing ? 'Generating character…' : 'Generate character from photo'}
          className="
            flex-1 py-3 bg-accent hover:bg-accent-h text-white
            rounded-xl font-semibold text-sm transition-all
            active:scale-95 disabled:opacity-50 disabled:pointer-events-none
            flex items-center justify-center gap-2
          "
        >
          {isProcessing ? <Spinner /> : <Wand2 className="w-4 h-4" />}
          {isProcessing ? 'Generating…' : 'Generate Character'}
        </button>
        <button
          onClick={onUploadClick}
          aria-label="Upload a new image"
          title="Upload image"
          className="
            px-4 py-3 bg-surface-2 hover:bg-surface-3 text-ink-2 hover:text-ink
            rounded-xl transition-all border border-border min-w-[44px]
          "
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
