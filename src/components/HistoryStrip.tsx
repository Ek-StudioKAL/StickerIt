import { History } from 'lucide-react';
import type { HistoryItem } from '../hooks/useAppState';

export function HistoryStrip({
  history,
  currentImage,
  currentCharacter,
  onLoad,
}: {
  history: HistoryItem[];
  currentImage: string | null;
  currentCharacter: string | null;
  onLoad: (item: HistoryItem) => void;
}) {
  if (history.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto py-1 items-center">
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-surface-2 rounded-full border border-border">
        <History className="w-3.5 h-3.5 text-ink-3" aria-hidden="true" />
      </div>
      {history.map((item) => {
        const isActive = currentCharacter === item.image || currentImage === item.image;
        return (
          <button
            key={item.id}
            onClick={() => onLoad(item)}
            aria-label={`Restore ${item.label}`}
            className={`
              relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all
              ${isActive
                ? 'border-accent shadow-md scale-105'
                : 'border-transparent opacity-60 hover:opacity-100 hover:border-border-2'
              }
            `}
          >
            <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold py-0.5 text-center truncate px-1">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
