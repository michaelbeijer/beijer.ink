interface ResizeDividerProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ResizeDivider({ onMouseDown }: ResizeDividerProps) {
  return (
    <div
      className="group relative w-0 shrink-0 cursor-col-resize z-10"
      onMouseDown={onMouseDown}
    >
      {/* Hover target — wider than visible line for easier grabbing */}
      <div className="absolute inset-y-0 -left-1.5 w-3 flex items-stretch justify-center">
        <div className="w-px bg-edge group-hover:bg-accent transition-colors" />
      </div>
    </div>
  );
}
