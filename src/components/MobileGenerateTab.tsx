import { CharacterizeCard } from './CharacterizeCard';
import { MoodCard } from './MoodCard';
import type { AppState } from '../hooks/useAppState';

export function MobileGenerateTab({
  state,
  setState,
  onCharacterize,
  onUploadClick,
  onApplyMood,
}: {
  state: Pick<AppState, 'selectedMood' | 'customMood' | 'isProcessing' | 'characterBase64' | 'originalImage'>;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onCharacterize: () => void;
  onUploadClick: () => void;
  onApplyMood: (mood: string) => void;
}) {
  return (
    <div className="space-y-4">
      <CharacterizeCard
        isProcessing={state.isProcessing}
        hasImage={!!state.originalImage}
        onCharacterize={onCharacterize}
        onUploadClick={onUploadClick}
      />
      <MoodCard
        state={state}
        setState={setState}
        onApplyMood={onApplyMood}
      />
    </div>
  );
}
