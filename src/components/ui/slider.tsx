import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

function Slider({
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
}: SliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);
  const current = value[0] ?? min;
  const pct = ((current - min) / (max - min)) * 100;

  const calcValue = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return current;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + ratio * (max - min);
    const stepped = Math.round(raw / step) * step;
    return Math.max(min, Math.min(max, parseFloat(stepped.toFixed(10))));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    onValueChange?.([calcValue(e.clientX)]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || disabled) return;
    onValueChange?.([calcValue(e.clientX)]);
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative flex w-full touch-none select-none items-center cursor-pointer py-3",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Track background */}
      <div className="relative h-1.5 w-full rounded-full bg-white/10">
        {/* Filled portion */}
        <div
          className="absolute h-full rounded-full bg-neon-purple shadow-[0_0_8px_rgba(168,85,247,0.8)] transition-none"
          style={{ width: `${pct}%` }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-white border-2 border-neon-purple shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-shadow hover:shadow-[0_0_14px_rgba(168,85,247,1)] active:scale-110"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export { Slider };
