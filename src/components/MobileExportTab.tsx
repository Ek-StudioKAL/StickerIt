import { ExportCard } from './ExportCard';
import type { AppState } from '../hooks/useAppState';

export function MobileExportTab({
  state,
  setState,
  onExport,
}: {
  state: Pick<AppState, 'addOutline' | 'extraOutlineWhiteSize' | 'extraOutlineBlackSize'>;
  setState: React.Dispatch<React.SetStateAction<any>>;
  onExport: (size: number, suffix: string) => void;
}) {
  return (
    <ExportCard state={state} setState={setState} onExport={onExport} />
  );
}
