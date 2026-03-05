import { cn } from "@/lib/utils";

interface LabelStartPickerProps {
  startRow: number;
  startCol: number;
  onSelect: (row: number, col: number) => void;
}

const ROWS = 4;
const COLS = 3;

export function LabelStartPicker({ startRow, startCol, onSelect }: LabelStartPickerProps) {
  const startIndex = startRow * COLS + startCol;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Click where printing should start on the first sheet. Greyed-out cells will be skipped.
      </p>
      <div className="inline-grid grid-cols-3 gap-1.5 p-4 border rounded-lg bg-muted/30">
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const row = Math.floor(i / COLS);
          const col = i % COLS;
          const isSelected = row === startRow && col === startCol;
          const isSkipped = i < startIndex;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(row, col)}
              className={cn(
                "w-16 h-16 rounded border-2 text-xs font-medium transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : isSkipped
                  ? "bg-muted text-muted-foreground/50 border-muted-foreground/20"
                  : "bg-background text-foreground border-border hover:border-primary/50"
              )}
            >
              {isSelected ? "START" : isSkipped ? "—" : `${row + 1},${col + 1}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
