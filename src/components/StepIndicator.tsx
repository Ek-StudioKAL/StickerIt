import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Upload', key: 'upload' },
  { label: 'Generate', key: 'generate' },
  { label: 'Mood', key: 'mood' },
  { label: 'Style', key: 'style' },
  { label: 'Export', key: 'export' },
];

export function StepIndicator({
  hasImage,
  hasCharacter,
  hasCaption,
}: {
  hasImage: boolean;
  hasCharacter: boolean;
  hasCaption: boolean;
}) {
  const completedSteps = {
    upload: hasImage,
    generate: hasCharacter,
    mood: hasCharacter,
    style: hasCaption,
    export: false,
  };

  const activeIndex = STEPS.findIndex((s) => !completedSteps[s.key as keyof typeof completedSteps]);
  const activeKey = activeIndex === -1 ? 'export' : STEPS[activeIndex].key;

  return (
    <div className="hidden lg:flex items-center gap-1 mb-2">
      {STEPS.map((step, i) => {
        const isDone = completedSteps[step.key as keyof typeof completedSteps];
        const isActive = step.key === activeKey;

        return (
          <div key={step.key} className="flex items-center gap-1">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isDone
                  ? 'bg-indigo-100 text-indigo-700'
                  : isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {isDone ? (
                <Check className="w-3 h-3" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center text-[9px] leading-none font-black">
                  {i + 1}
                </span>
              )}
              {step.label}
            </div>
            {i < STEPS.length - 1 && <span className="text-slate-200 text-xs font-bold">→</span>}
          </div>
        );
      })}
    </div>
  );
}
