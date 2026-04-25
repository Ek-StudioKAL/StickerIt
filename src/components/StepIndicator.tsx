import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Upload',   key: 'upload'   },
  { label: 'Generate', key: 'generate' },
  { label: 'Mood',     key: 'mood'     },
  { label: 'Style',    key: 'style'    },
  { label: 'Export',   key: 'export'   },
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
    upload:   hasImage,
    generate: hasCharacter,
    mood:     hasCharacter,
    style:    hasCaption,
    export:   false,
  };

  const activeIndex = STEPS.findIndex((s) => !completedSteps[s.key as keyof typeof completedSteps]);
  const activeKey = activeIndex === -1 ? 'export' : STEPS[activeIndex].key;

  return (
    <div className="hidden lg:flex items-center gap-1">
      {STEPS.map((step, i) => {
        const isDone = completedSteps[step.key as keyof typeof completedSteps];
        const isActive = step.key === activeKey;

        return (
          <div key={step.key} className="flex items-center gap-1">
            <div
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all
                ${isDone
                  ? 'bg-accent-subtle text-accent border border-accent/20'
                  : isActive
                  ? 'bg-accent text-white'
                  : 'bg-surface-2 text-ink-3 border border-border'
                }
              `}
            >
              {isDone ? (
                <Check className="w-3 h-3" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border-[1.5px] border-current flex items-center justify-center text-[9px] leading-none font-bold">
                  {i + 1}
                </span>
              )}
              {step.label}
            </div>
            {i < STEPS.length - 1 && (
              <span className={`text-[10px] font-bold ${isDone ? 'text-accent/40' : 'text-border-2'}`}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
