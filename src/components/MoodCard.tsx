import { Smile } from 'lucide-react';
import { Card, MOODS } from './shared';
import type { AppState } from '../hooks/useAppState';

export function MoodCard({
  state,
  setState,
  onApplyMood,
}: {
  state: Pick<AppState, 'selectedMood' | 'customMood' | 'isProcessing' | 'characterBase64'>;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onApplyMood: (mood: string) => void;
}) {
  const moodChipClass = (mood: string) =>
    `px-3 py-2.5 border-2 rounded-lg text-xs font-bold transition-all min-h-[40px] ${
      state.selectedMood === mood
        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-white'
    } disabled:opacity-50`;

  const disabled = state.isProcessing || !state.characterBase64;

  return (
    <Card title="Adjust Mood" icon={Smile}>
      <div className="flex flex-wrap gap-2 mb-4">
        {MOODS.map((mood) => (
          <button
            key={mood}
            onClick={() => setState((s: any) => ({ ...s, selectedMood: mood }))}
            disabled={disabled}
            className={moodChipClass(mood)}
          >
            {mood}
          </button>
        ))}
        <button
          onClick={() => setState((s: any) => ({ ...s, selectedMood: 'Custom' }))}
          disabled={disabled}
          className={moodChipClass('Custom')}
        >
          Custom...
        </button>
      </div>

      {state.selectedMood === 'Custom' && (
        <input
          type="text"
          value={state.customMood}
          onChange={(e) => setState((s: any) => ({ ...s, customMood: e.target.value }))}
          placeholder="Enter custom mood..."
          className="w-full p-3 mb-4 text-sm bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium transition-colors"
        />
      )}

      <button
        onClick={() => onApplyMood(state.selectedMood === 'Custom' ? state.customMood : state.selectedMood)}
        disabled={
          disabled ||
          !state.selectedMood ||
          (state.selectedMood === 'Custom' && !state.customMood)
        }
        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:active:scale-100"
      >
        Apply Mood
      </button>
    </Card>
  );
}
