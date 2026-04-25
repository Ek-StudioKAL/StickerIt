/** Floating thumbnail shown on mobile non-Preview tabs to indicate current canvas state */
export function MiniPreview({
  canvasRef,
  onClick,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Switch to preview"
      title="Tap to see preview"
      className="lg:hidden fixed top-16 right-3 z-40 w-14 h-14 rounded-xl overflow-hidden shadow-xl border-2 border-white bg-slate-100 hover:scale-105 active:scale-95 transition-transform"
    >
      {canvasRef.current ? (
        <canvas
          ref={(el) => {
            if (!el || !canvasRef.current) return;
            const ctx = el.getContext('2d');
            if (!ctx) return;
            el.width = 56;
            el.height = 56;
            ctx.drawImage(canvasRef.current, 0, 0, 56, 56);
          }}
          width={56}
          height={56}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-400">
          Preview
        </div>
      )}
    </button>
  );
}
