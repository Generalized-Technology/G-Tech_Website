import React, { useRef, useState, useEffect, useCallback } from "react";
import { 
  Pencil, 
  Eraser, 
  Square, 
  Circle, 
  Trash2, 
  Download, 
  Settings2,
  ArrowLeft,
  Undo2,
  Redo2,
  Triangle,
  ArrowUpRight,
  Minus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tool = "brush" | "eraser" | "rect" | "circle" | "arrow" | "triangle" | "line";

const MAX_HISTORY = 50;

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#a855f7");
  const [brushSize, setBrushSize] = useState(5);
  const [activeTool, setActiveTool] = useState<Tool>("brush");
  const startPos = useRef({ x: 0, y: 0 });
  const canvasSnapshot = useRef<ImageData | null>(null);

  // History for undo/redo
  const history = useRef<ImageData[]>([]);
  const historyIndex = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [boardColor, setBoardColor] = useState("#0a0a0a");

  const boardColors = [
    { name: "Dark", value: "#0a0a0a" },
    { name: "Greenboard", value: "#143d28" },
    { name: "Slate", value: "#1e293b" },
    { name: "White", value: "#ffffff" },
  ];

  const syncHistoryState = useCallback(() => {
    setCanUndo(historyIndex.current > 0);
    setCanRedo(historyIndex.current < history.current.length - 1);
  }, []);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Discard any redo states beyond current index
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(snapshot);
    if (history.current.length > MAX_HISTORY) {
      history.current.shift();
    }
    historyIndex.current = history.current.length - 1;
    syncHistoryState();
  }, [syncHistoryState]);

  const undo = useCallback(() => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || historyIndex.current <= 0) return;
    historyIndex.current -= 1;
    ctx.putImageData(history.current[historyIndex.current], 0, 0);
    syncHistoryState();
  }, [syncHistoryState]);

  const redo = useCallback(() => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || historyIndex.current >= history.current.length - 1) return;
    historyIndex.current += 1;
    ctx.putImageData(history.current[historyIndex.current], 0, 0);
    syncHistoryState();
  }, [syncHistoryState]);

  // Keyboard shortcut: Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") { e.preventDefault(); undo(); }
      if (e.ctrlKey && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [undo, redo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const context = canvas.getContext("2d");
      let tempImage: ImageData | null = null;
      if (context && canvas.width > 0 && canvas.height > 0) {
        tempImage = context.getImageData(0, 0, canvas.width, canvas.height);
      }

      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      if (context) {
        context.lineCap = "round";
        context.lineJoin = "round";
        contextRef.current = context;
        if (tempImage) {
          context.putImageData(tempImage, 0, 0);
        } else {
          // First load: push empty state to history
          const initial = context.getImageData(0, 0, canvas.width, canvas.height);
          history.current = [initial];
          historyIndex.current = 0;
          syncHistoryState();
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [syncHistoryState]);

  // Update context style when tool/color/size changes
  useEffect(() => {
    const ctx = contextRef.current;
    if (!ctx) return;
    ctx.strokeStyle = activeTool === "eraser" ? boardColor : color;
    ctx.lineWidth = activeTool === "eraser" ? brushSize * 4 : brushSize;
    ctx.globalCompositeOperation = activeTool === "eraser" ? "destination-out" : "source-over";
  }, [color, brushSize, activeTool, boardColor]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLen = Math.max(15, brushSize * 3);
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const drawTriangle = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    const cx = (x1 + x2) / 2;
    ctx.beginPath();
    ctx.moveTo(cx, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x1, y2);
    ctx.closePath();
    ctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const pos = getPos(e, canvas);
    startPos.current = pos;
    canvasSnapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (activeTool === "brush" || activeTool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    const pos = getPos(e, canvas);
    const { x: sx, y: sy } = startPos.current;

    if (activeTool === "brush" || activeTool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      // Restore snapshot for live preview
      if (canvasSnapshot.current) {
        ctx.putImageData(canvasSnapshot.current, 0, 0);
      }
      ctx.beginPath();
      if (activeTool === "rect") {
        ctx.rect(sx, sy, pos.x - sx, pos.y - sy);
        ctx.stroke();
      } else if (activeTool === "circle") {
        const radius = Math.sqrt(Math.pow(pos.x - sx, 2) + Math.pow(pos.y - sy, 2));
        ctx.arc(sx, sy, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (activeTool === "arrow") {
        drawArrow(ctx, sx, sy, pos.x, pos.y);
      } else if (activeTool === "triangle") {
        drawTriangle(ctx, sx, sy, pos.x, pos.y);
      } else if (activeTool === "line") {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    contextRef.current?.closePath();
    setIsDrawing(false);
    saveToHistory();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height;
    const tempCtx = temp.getContext("2d");
    if (!tempCtx) return;

    tempCtx.fillStyle = boardColor;
    tempCtx.fillRect(0, 0, temp.width, temp.height);
    tempCtx.drawImage(canvas, 0, 0);

    const link = document.createElement("a");
    link.download = "gtech-whiteboard.png";
    link.href = temp.toDataURL();
    link.click();
  };

  const tools: { id: Tool; icon: any; label: string }[] = [
    { id: "brush", icon: Pencil, label: "Brush" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "rect", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "triangle", icon: Triangle, label: "Triangle" },
    { id: "arrow", icon: ArrowUpRight, label: "Arrow" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#0a0a0a] text-white relative">
      {/* Header */}
      <header className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md z-20 shrink-0 gap-4">
        {/* Left: Back to Tools */}
        <Link to="/tools" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group shrink-0">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-wider hidden sm:block">Back to Tools</span>
        </Link>

        {/* Center: Board Color + Undo/Redo */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1.5 rounded-xl">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Board Color */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <span className="text-xs uppercase tracking-widest text-white/40 font-bold hidden sm:block">Board:</span>
            <div className="flex gap-2">
              {boardColors.map((bc) => (
                <button
                  key={bc.value}
                  onClick={() => setBoardColor(bc.value)}
                  title={bc.name}
                  className={cn(
                    "w-5 h-5 rounded-full border transition-all hover:scale-110",
                    boardColor === bc.value ? "border-neon-purple scale-110 ring-2 ring-neon-purple/30" : "border-white/20"
                  )}
                  style={{ backgroundColor: bc.value }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Export & Clear */}
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={clearCanvas} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 px-3 text-xs">
            <Trash2 className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:block">Clear</span>
          </Button>
          <Button onClick={downloadImage} className="btn-primary h-9 px-4 text-xs">
            <Download className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:block">Export</span>
          </Button>
        </div>
      </header>

      {/* Canvas Workspace */}
      <div
        className="grow w-full relative cursor-crosshair overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: boardColor }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0"
        />

        {/* Floating bottom toolbar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-2 z-30 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          {/* Drawing Tools */}
          {tools.map((tool, i) => (
            <React.Fragment key={tool.id}>
              {(i === tools.length - 1) && (
                <div className="h-8 w-px bg-white/10 mx-1" />
              )}
              <ToolButton
                active={activeTool === tool.id}
                onClick={() => setActiveTool(tool.id)}
                icon={tool.icon}
                label={tool.label}
              />
            </React.Fragment>
          ))}

          {/* Color + Size */}
          {activeTool !== "eraser" && (
            <>
              <div className="h-8 w-px bg-white/10 mx-1" />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                title="Stroke color"
                className="w-7 h-7 rounded-lg bg-transparent border border-white/20 cursor-pointer hover:scale-105 transition-transform"
              />
            </>
          )}

          <div className="h-8 w-px bg-white/10 mx-1" />
          <div className="flex items-center gap-2 px-1">
            <Settings2 className="w-4 h-4 text-white/40" />
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-20 accent-neon-purple cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "p-2.5 rounded-xl transition-all duration-200 group",
        active
          ? "bg-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"
          : "text-white/40 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className={cn("w-5 h-5 transition-transform", active ? "scale-105" : "group-hover:scale-105")} />
    </button>
  );
}
