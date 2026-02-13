import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Settings,
  CheckCircle2,
  Timer,
  TrendingUp
} from 'lucide-react';

type TimerMode = 'focus' | 'short-break' | 'long-break';

interface Session {
  date: string;
  completed: number;
}

export function PomodoroView() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Customizable durations (in minutes)
  const [durations, setDurations] = useState({
    focus: 25,
    'short-break': 5,
    'long-break': 15,
  });

  const modeConfig: Record<TimerMode, { label: string; color: string; bgColor: string }> = {
    focus: { label: 'Focus Time', color: 'text-black', bgColor: 'bg-gray-100' },
    'short-break': { label: 'Short Break', color: 'text-black', bgColor: 'bg-gray-100' },
    'long-break': { label: 'Long Break', color: 'text-black', bgColor: 'bg-gray-100' },
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode] * 60);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode] * 60);
  };

  // Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Play sound if enabled
      if (soundEnabled) {
        // TODO: Play notification sound
      }
      // Record session
      if (mode === 'focus') {
        const today = new Date().toISOString().split('T')[0];
        setSessions((prev) => {
          const existing = prev.find((s) => s.date === today);
          if (existing) {
            return prev.map((s) =>
              s.date === today ? { ...s, completed: s.completed + 1 } : s
            );
          }
          return [...prev, { date: today, completed: 1 }];
        });
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, soundEnabled]);

  // Update title with timer
  useEffect(() => {
    if (isRunning) {
      document.title = `(${formatTime(timeLeft)}) Studying... - StudBlud`;
    } else {
      document.title = 'StudBlud';
    }
    return () => {
      document.title = 'StudBlud';
    };
  }, [isRunning, timeLeft]);

  const todaySessions = sessions.find(
    (s) => s.date === new Date().toISOString().split('T')[0]
  )?.completed || 0;

  const totalSessions = sessions.reduce((acc, s) => acc + s.completed, 0);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Timer className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Pomodoro Timer</h2>
              <p className="text-sm text-gray-500">Stay focused and productive</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-gray-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mode Selector */}
          <div className="flex justify-center gap-2 mb-8">
            {(Object.keys(modeConfig) as TimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {modeConfig[m].label}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className={`relative w-64 h-64 mx-auto mb-8 rounded-full ${modeConfig[mode].bgColor} flex items-center justify-center`}>
            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - timeLeft / (durations[mode] * 60))}`}
                className={modeConfig[mode].color}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            
            {/* Time */}
            <div className="text-center">
              <div className={`text-6xl font-bold ${modeConfig[mode].color}`}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-gray-500 mt-2">{modeConfig[mode].label}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant="outline"
              size="lg"
              onClick={resetTimer}
              className="rounded-full w-14 h-14 p-0"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            
            <Button
              size="lg"
              onClick={toggleTimer}
              className={`rounded-full w-20 h-20 p-0 ${
                isRunning
                  ? 'bg-gray-700 hover:bg-gray-800'
                  : 'bg-black hover:bg-gray-800'
              } text-white`}
            >
              {isRunning ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <Card className="p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Timer Settings (minutes)</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Focus</span>
                    <span>{durations.focus} min</span>
                  </div>
                  <Slider
                    value={[durations.focus]}
                    onValueChange={(value) => {
                      setDurations({ ...durations, focus: value[0] });
                      if (mode === 'focus' && !isRunning) {
                        setTimeLeft(value[0] * 60);
                      }
                    }}
                    min={1}
                    max={60}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Short Break</span>
                    <span>{durations['short-break']} min</span>
                  </div>
                  <Slider
                    value={[durations['short-break']]}
                    onValueChange={(value) => {
                      setDurations({ ...durations, 'short-break': value[0] });
                      if (mode === 'short-break' && !isRunning) {
                        setTimeLeft(value[0] * 60);
                      }
                    }}
                    min={1}
                    max={30}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Long Break</span>
                    <span>{durations['long-break']} min</span>
                  </div>
                  <Slider
                    value={[durations['long-break']]}
                    onValueChange={(value) => {
                      setDurations({ ...durations, 'long-break': value[0] });
                      if (mode === 'long-break' && !isRunning) {
                        setTimeLeft(value[0] * 60);
                      }
                    }}
                    min={5}
                    max={60}
                    step={5}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-black" />
                <span className="text-sm text-gray-500">Today</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{todaySessions}</p>
              <p className="text-xs text-gray-400">sessions completed</p>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-black" />
                <span className="text-sm text-gray-500">Total</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
              <p className="text-xs text-gray-400">sessions completed</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
