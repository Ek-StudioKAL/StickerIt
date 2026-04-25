import { Download } from 'lucide-react';
import { Card, Slider } from './shared';
import type { AppState } from '../hooks/useAppState';

export function ExportCard({
  state,
  setState,
  onExport,
  className = '',
}: {
  state: Pick<AppState, 'addOutline' | 'extraOutlineWhiteSize' | 'extraOutlineBlackSize'>;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onExport: (size: number, suffix: string) => void;
  className?: string;
}) {
  return (
    <Card title="Export" icon={Download} className={className}>
      <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.addOutline}
            onChange={(e) => setState((s: any) => ({ ...s, addOutline: e.target.checked }))}
            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
          />
          <span className="text-sm font-bold text-slate-700">Add Extra Cutout Outline</span>
        </label>
        {state.addOutline && (
          <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Slider
              label="White Outline Size"
              value={state.extraOutlineWhiteSize}
              min={0}
              max={30}
              displayValue={`${state.extraOutlineWhiteSize}px`}
              onChange={(v) => setState((s: any) => ({ ...s, extraOutlineWhiteSize: v }))}
              onReset={() => setState((s: any) => ({ ...s, extraOutlineWhiteSize: 8 }))}
            />
            <Slider
              label="Black Outline Size"
              value={state.extraOutlineBlackSize}
              min={0}
              max={20}
              displayValue={`${state.extraOutlineBlackSize}px`}
              onChange={(v) => setState((s: any) => ({ ...s, extraOutlineBlackSize: v }))}
              onReset={() => setState((s: any) => ({ ...s, extraOutlineBlackSize: 4 }))}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onExport(1024, 'highres')}
          className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 flex flex-col items-center gap-1 transition-all group active:scale-95"
        >
          <span className="font-black text-slate-800 group-hover:text-indigo-600 text-base">High-Res</span>
          <span className="text-xs font-bold text-slate-400">1024px</span>
        </button>
        <button
          onClick={() => onExport(512, 'sticker')}
          className="p-4 bg-indigo-600 border-2 border-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex flex-col items-center gap-1 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <span className="font-black text-base">Sticker</span>
          <span className="text-xs font-bold opacity-80">512px</span>
        </button>
        <button
          onClick={() => onExport(100, 'emoji')}
          className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 flex flex-col items-center gap-1 transition-all group active:scale-95"
        >
          <span className="font-black text-slate-800 group-hover:text-indigo-600 text-base">Emoji</span>
          <span className="text-xs font-bold text-slate-400">100px</span>
        </button>
      </div>
    </Card>
  );
}
