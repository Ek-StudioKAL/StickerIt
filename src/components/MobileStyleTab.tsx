import { StyleCard } from './StyleCard';
import type { AppState } from '../hooks/useAppState';

export function MobileStyleTab({
  state,
  setState,
  onMagicIdeas,
}: {
  state: Pick<
    AppState,
    | 'caption'
    | 'showCaption'
    | 'tone'
    | 'customTone'
    | 'textStyle'
    | 'stickerStyle'
    | 'magicIdeas'
    | 'isProcessing'
    | 'characterBase64'
    | 'originalImage'
  >;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onMagicIdeas: () => void;
}) {
  return (
    <StyleCard state={state} setState={setState} onMagicIdeas={onMagicIdeas} />
  );
}
