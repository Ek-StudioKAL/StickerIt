import { Sticker, Move, RotateCw } from 'lucide-react';
import { Card, Slider } from './shared';
import { DEFAULT_STICKER_STYLE, type AppState } from '../hooks/useAppState';

export function StickerTransformCard({
  stickerStyle,
  setState,
}: {
  stickerStyle: AppState['stickerStyle'];
  setState: React.Dispatch<React.SetStateAction<any>>;
}) {
  const set = (patch: Partial<AppState['stickerStyle']>) =>
    setState((s: any) => ({ ...s, stickerStyle: { ...s.stickerStyle, ...patch } }));

  return (
    <Card title="Sticker Transform" icon={Sticker}>
      <div className="grid grid-cols-2 gap-3">
        <Slider
          label="Scale"
          value={stickerStyle.scale}
          min={0.1} max={3} step={0.05}
          displayValue={`${stickerStyle.scale.toFixed(2)}×`}
          onChange={(v) => set({ scale: v })}
          onReset={() => set({ scale: DEFAULT_STICKER_STYLE.scale })}
        />
        <Slider
          label="Rotation"
          value={stickerStyle.rotation}
          min={-180} max={180}
          displayValue={`${stickerStyle.rotation}°`}
          onChange={(v) => set({ rotation: v })}
          onReset={() => set({ rotation: DEFAULT_STICKER_STYLE.rotation })}
          icon={<RotateCw className="w-3 h-3" />}
        />
        <Slider
          label="X Offset"
          value={stickerStyle.offsetX}
          min={-500} max={500}
          displayValue={`${stickerStyle.offsetX}px`}
          onChange={(v) => set({ offsetX: v })}
          onReset={() => set({ offsetX: DEFAULT_STICKER_STYLE.offsetX })}
          icon={<Move className="w-3 h-3" />}
        />
        <Slider
          label="Y Offset"
          value={stickerStyle.offsetY}
          min={-500} max={500}
          displayValue={`${stickerStyle.offsetY}px`}
          onChange={(v) => set({ offsetY: v })}
          onReset={() => set({ offsetY: DEFAULT_STICKER_STYLE.offsetY })}
          icon={<Move className="w-3 h-3" />}
        />
      </div>
    </Card>
  );
}
