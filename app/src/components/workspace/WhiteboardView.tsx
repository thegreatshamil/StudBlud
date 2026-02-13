import { useState, useRef, useEffect, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { 
  MousePointer, 
  Pencil, 
  Square, 
  Circle, 
  ArrowRight, 
  Minus, 
  Type,
  Undo,
  Redo,
  Trash2,
  Download,
  Eraser,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check
} from 'lucide-react';

type Tool = 'select' | 'pen' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'text' | 'eraser';
type FontStyle = 'normal' | 'bold' | 'italic' | 'bold-italic';
type TextAlign = 'left' | 'center' | 'right';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  id: string;
  points: Point[];
  color: string;
  size: number;
  tool: Tool;
  text?: string;
  fontStyle?: FontStyle;
  textAlign?: TextAlign;
}

interface TextInput {
  x: number;
  y: number;
  text: string;
  visible: boolean;
}

const colors = [
  '#000000', '#EF4444', '#F59E0B', '#10B981', 
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'
];

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

const tools: { id: Tool; icon: typeof Pencil; label: string }[] = [
  { id: 'select', icon: MousePointer, label: 'Select' },
  { id: 'pen', icon: Pencil, label: 'Pen' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
];

export function WhiteboardView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>('pen');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<Stroke[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [textInput, setTextInput] = useState<TextInput>({ x: 0, y: 0, text: '', visible: false });
  const [fontSize, setFontSize] = useState(16);
  const [fontStyle, setFontStyle] = useState<FontStyle>('normal');
  const [textAlign, setTextAlign] = useState<TextAlign>('left');
  const [showTextPanel, setShowTextPanel] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        redrawCanvas();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Redraw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw all strokes
    strokes.forEach(stroke => drawStroke(ctx, stroke));
  }, [strokes]);

  useEffect(() => {
    redrawCanvas();
  }, [strokes, redrawCanvas]);

  const getFontString = (size: number, style: FontStyle) => {
    let font = '';
    if (style === 'bold' || style === 'bold-italic') font += 'bold ';
    if (style === 'italic' || style === 'bold-italic') font += 'italic ';
    font += `${size}px Inter, sans-serif`;
    return font;
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.tool === 'text' && stroke.text) {
      ctx.font = getFontString(stroke.size * 4, stroke.fontStyle || 'normal');
      ctx.fillStyle = stroke.color;
      ctx.textAlign = (stroke.textAlign || 'left') as CanvasTextAlign;
      const point = stroke.points[0];
      ctx.fillText(stroke.text, point.x, point.y);
      return;
    }

    if (stroke.points.length < 2) return;

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const start = stroke.points[0];
    const end = stroke.points[stroke.points.length - 1];

    if (stroke.tool === 'rectangle') {
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (stroke.tool === 'circle') {
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (stroke.tool === 'arrow') {
      drawArrow(ctx, start, end, stroke.size);
    } else if (stroke.tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else {
      // Pen or eraser - draw freehand
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, start: Point, end: Point, size: number) => {
    const headLength = size * 5;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  };

  const getPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'text') {
      const point = getPoint(e);
      setTextInput({ x: point.x, y: point.y, text: '', visible: true });
      setShowTextPanel(true);
      return;
    }

    if (selectedTool === 'select') return;

    const point = getPoint(e);
    setIsDrawing(true);

    const newStroke: Stroke = {
      id: Date.now().toString(),
      points: [point],
      color: selectedTool === 'eraser' ? '#ffffff' : selectedColor,
      size: brushSize,
      tool: selectedTool,
    };

    setCurrentStroke(newStroke);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;

    const point = getPoint(e);
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, point],
    };

    setCurrentStroke(updatedStroke);

    // Draw preview for shapes
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    redrawCanvas();
    drawStroke(ctx, updatedStroke);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);
    
    if (currentStroke.points.length > 1) {
      const newStrokes = [...strokes, currentStroke];
      setStrokes(newStrokes);
      
      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newStrokes);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    setCurrentStroke(null);
    redrawCanvas();
  };

  const handleTextSubmit = () => {
    if (textInput.text.trim()) {
      const newStroke: Stroke = {
        id: Date.now().toString(),
        points: [{ x: textInput.x, y: textInput.y }],
        color: selectedColor,
        size: fontSize,
        tool: 'text',
        text: textInput.text,
        fontStyle,
        textAlign,
      };

      const newStrokes = [...strokes, newStroke];
      setStrokes(newStrokes);

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newStrokes);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    setTextInput({ x: 0, y: 0, text: '', visible: false });
    setShowTextPanel(false);
    redrawCanvas();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setStrokes(history[historyIndex - 1]);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setStrokes([]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setStrokes(history[historyIndex + 1]);
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Tools */}
          <div className="flex items-center gap-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    setSelectedTool(tool.id);
                    setShowTextPanel(tool.id === 'text');
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedTool === tool.id
                      ? 'bg-gray-900 text-white'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title={tool.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  selectedColor === color
                    ? 'border-gray-900 scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Brush Size */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Size:</span>
            <Slider
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              min={1}
              max={20}
              step={1}
              className="w-24"
            />
            <div
              className="rounded-full bg-gray-800"
              style={{ width: brushSize * 2, height: brushSize * 2 }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex < 0}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30"
              title="Undo"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30"
              title="Redo"
            >
              <Redo className="w-5 h-5" />
            </button>
            <button
              onClick={handleClear}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
              title="Clear All"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
              title="Export as PNG"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Text Formatting Panel */}
        {showTextPanel && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Font Size:</span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setFontStyle(fontStyle === 'bold' || fontStyle === 'bold-italic' ? 'normal' : 'bold')}
                className={`p-2 rounded ${fontStyle === 'bold' || fontStyle === 'bold-italic' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFontStyle(fontStyle === 'italic' || fontStyle === 'bold-italic' ? 'normal' : 'italic')}
                className={`p-2 rounded ${fontStyle === 'italic' || fontStyle === 'bold-italic' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setTextAlign('left')}
                className={`p-2 rounded ${textAlign === 'left' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTextAlign('center')}
                className={`p-2 rounded ${textAlign === 'center' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTextAlign('right')}
                className={`p-2 rounded ${textAlign === 'right' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            {textInput.visible && (
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="text"
                  value={textInput.text}
                  onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
                  placeholder="Enter text..."
                  className="px-3 py-1 border border-gray-300 rounded text-sm w-48"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTextSubmit();
                    if (e.key === 'Escape') {
                      setTextInput({ x: 0, y: 0, text: '', visible: false });
                      setShowTextPanel(false);
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleTextSubmit}
                  className="p-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`absolute inset-0 ${
            selectedTool === 'select' ? 'cursor-default' : 'cursor-crosshair'
          }`}
          style={{ background: 'white' }}
        />

        {/* Text Input Overlay */}
        {textInput.visible && (
          <div
            className="absolute pointer-events-none"
            style={{ left: textInput.x, top: textInput.y }}
          >
            <div
              className="text-gray-400 whitespace-pre"
              style={{
                fontSize: `${fontSize * 2}px`,
                fontWeight: fontStyle.includes('bold') ? 'bold' : 'normal',
                fontStyle: fontStyle.includes('italic') ? 'italic' : 'normal',
                textAlign,
              }}
            >
              {textInput.text || 'Type...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
