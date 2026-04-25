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
  const disabled = state.isProcessing || !state.characterBase64;
  const activeMood = state.selectedMood;

  return (
    <Card title="Adjust Mood" icon={Smile}>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[...MOODS, 'Custom'].map((mood) => (
          <button
            key={mood}
            onClick={() => setState((s: any) => ({ ...s, selectedMood: mood }))}
            disabled={disabled}
            className={`
              px-3 py-2 rounded-lg text-xs font-semibold border transition-all
              min-h-[36px] disabled:opacity-40 disabled:pointer-events-none
              ${activeMood === mood
                ? 'bg-accent-subtle border-accent text-accent'
                : 'bg-surface-2 border-border text-ink-2 hover:border-accent hover:text-accent hover:bg-accent-subtle'
              }
            `}
          >
            {mood}
          </button>
        ))}
      </div>

      {activeMood === 'Custom' && (
        <input
          type="text"
          value={state.customMood}
          onChange={(e) => setState((s: any) => ({ ...s, customMood: e.target.value }))}
          placeholder="Describe a mood…"
          className="
            w-full p-3 mb-4 text-sm bg-surface-2 border border-border rounded-xl
            outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
            text-ink placeholder:text-ink-3 transition-colors
          "
        />
      )}

      <button
        onClick={() => onApplyMood(activeMood === 'Custom' ? state.customMood : activeMood)}
        disabled={disabled || !activeMood || (activeMood === 'Custom' && !state.customMood)}
        className="
          w-full py-3 bg-accent hover:bg-accent-h text-white rounded-xl
          font-semibold text-sm transition-all active:scale-95
          disabled:opacity-40 disabled:pointer-events-none
        "
      >
        Apply Mood
      </button>
    </Card>
  );
}
