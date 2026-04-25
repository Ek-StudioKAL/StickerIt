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
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200/60 flex gap-2 overflow-x-auto items-center">
      <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-slate-100 rounded-full ml-1">
        <History className="w-4 h-4 text-slate-500" aria-hidden="true" />
      </div>
      {history.map((item) => {
        const isActive = currentCharacter === item.image || currentImage === item.image;
        return (
          <button
            key={item.id}
            onClick={() => onLoad(item)}
            aria-label={`Restore ${item.label}`}
            className={`relative shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
              isActive
                ? 'border-indigo-500 shadow-md scale-105'
                : 'border-transparent opacity-70 hover:opacity-100 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold py-0.5 text-center">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
