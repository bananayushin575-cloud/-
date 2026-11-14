import { useEffect, useRef, useState } from 'react';
import { ConditionPanel } from './components/ConditionPanel';
import { EnvironmentChecklist } from './components/EnvironmentChecklist';
import { FocusTimerStage } from './components/FocusTimerStage';
import { SessionHistory } from './components/SessionHistory';
import { TaskAndBrainDump } from './components/TaskAndBrainDump';
import { TopBar } from './components/TopBar';
import type {
  DistractionNote,
  EnvironmentItem,
  MicroTask,
  StretchStep,
  StudyLocation,
  StudySessionLog,
  TimerMode,
} from './types/study';
import {
  formatSeconds,
  TIMER_DURATIONS_SECONDS,
  TIMER_MODE_META,
} from './utils/focusLogic';
import { playCompletionChime } from './utils/sound';

const STORAGE_KEY = 'shuchu-desk-state-v1';

const DEFAULT_ENVIRONMENT_ITEMS: EnvironmentItem[] = [
  {
    id: 'phone',
    label: 'スマホを視界から消す',
    detail: '別の部屋に置く・電源を切る・タイムロッキングコンテナに入れる',
    checked: false,
  },
  {
    id: 'desk',
    label: '机の上には「今使うもの」だけ置く',
    detail: 'マンガや別教科のテキストを片付け、今の教材と筆記用具のみにする',
    checked: false,
  },
  {
    id: 'place',
    label: '集中できる場所を選ぶ',
    detail: '自宅が散漫なときは図書館・自習室・カフェへ環境を切り替える',
    checked: false,
  },
  {
    id: 'water',
    label: '手元に水・無糖のお茶を用意する',
    detail: '脱水による集中力低下を防ぎ、席を立つ回数を減らす',
    checked: false,
  },
];

const DEFAULT_STRETCH_STEPS: StretchStep[] = [
  {
    id: 'shoulders',
    title: '肩を大きく回す（前後5回ずつ）',
    detail: '同じ姿勢で滞った肩まわりの血流を戻します。',
    done: false,
  },
  {
    id: 'neck',
    title: '首を左右にゆっくり倒す',
    detail: '目を閉じて視覚情報も休ませながら深呼吸します。',
    done: false,
  },
  {
    id: 'stand',
    title: '立ち上がって少し歩く',
    detail: '休憩中はスマホを見ず、体を動かして脳をリフレッシュします。',
    done: false,
  },
];

const DEFAULT_TASKS: MicroTask[] = [
  {
    id: 'seed-task-1',
    title: '英単語帳 P.20〜25を覚える',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

interface PersistedState {
  location: StudyLocation;
  environmentItems: EnvironmentItem[];
  tasks: MicroTask[];
  activeTaskId: string | null;
  notes: DistractionNote[];
  waterMl: number;
  stretchSteps: StretchStep[];
  logs: StudySessionLog[];
  soundEnabled: boolean;
}

function loadInitialState(): PersistedState {
  const fallback: PersistedState = {
    location: 'home',
    environmentItems: DEFAULT_ENVIRONMENT_ITEMS,
    tasks: DEFAULT_TASKS,
    activeTaskId: DEFAULT_TASKS[0].id,
    notes: [],
    waterMl: 200,
    stretchSteps: DEFAULT_STRETCH_STEPS,
    logs: [],
    soundEnabled: true,
  };

  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      location: parsed.location ?? fallback.location,
      environmentItems:
        Array.isArray(parsed.environmentItems) && parsed.environmentItems.length > 0
          ? parsed.environmentItems
          : fallback.environmentItems,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : fallback.tasks,
      activeTaskId: parsed.activeTaskId !== undefined ? parsed.activeTaskId : fallback.activeTaskId,
      notes: Array.isArray(parsed.notes) ? parsed.notes : fallback.notes,
      waterMl: typeof parsed.waterMl === 'number' ? parsed.waterMl : fallback.waterMl,
      stretchSteps:
        Array.isArray(parsed.stretchSteps) && parsed.stretchSteps.length > 0
          ? parsed.stretchSteps
          : fallback.stretchSteps,
      logs: Array.isArray(parsed.logs) ? parsed.logs : fallback.logs,
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
    };
  } catch {
    return fallback;
  }
}

function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [persisted, setPersisted] = useState<PersistedState>(loadInitialState);

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [secondsLeft, setSecondsLeft] = useState<number>(TIMER_DURATIONS_SECONDS.pomodoro);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [justCompletedMode, setJustCompletedMode] = useState<TimerMode | null>(null);

  const activeTask =
    persisted.tasks.find((t) => t.id === persisted.activeTaskId) ?? null;

  const activeTaskTitleRef = useRef<string | null>(activeTask?.title ?? null);
  activeTaskTitleRef.current = activeTask?.title ?? null;

  const soundEnabledRef = useRef<boolean>(persisted.soundEnabled);
  soundEnabledRef.current = persisted.soundEnabled;

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // Ignore storage quota errors
    }
  }, [persisted]);

  useEffect(() => {
    if (isRunning) {
      document.title = `${formatSeconds(secondsLeft)} ${TIMER_MODE_META[mode].shortLabel} — 集中デスク`;
    } else {
      document.title = '集中デスク — 勉強に集中するための環境と仕組み';
    }
  }, [isRunning, secondsLeft, mode]);

  const recordCompletedSession = (completedMode: TimerMode) => {
    const newLog: StudySessionLog = {
      id: makeId('log'),
      mode: completedMode,
      durationMinutes: TIMER_MODE_META[completedMode].minutes,
      taskTitle:
        completedMode === 'ignition' || completedMode === 'pomodoro'
          ? activeTaskTitleRef.current
          : null,
      completedAt: new Date().toISOString(),
    };

    setPersisted((prev) => ({
      ...prev,
      logs: [newLog, ...prev.logs],
    }));
    setJustCompletedMode(completedMode);

    if (soundEnabledRef.current) {
      playCompletionChime();
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    const timerId = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerId);
          setIsRunning(false);
          recordCompletedSession(mode);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isRunning, mode]);

  const handleSelectMode = (nextMode: TimerMode) => {
    setIsRunning(false);
    setJustCompletedMode(null);
    setMode(nextMode);
    setSecondsLeft(TIMER_DURATIONS_SECONDS[nextMode]);
  };

  const handleAdvanceAndStart = (nextMode: TimerMode) => {
    setJustCompletedMode(null);
    setMode(nextMode);
    setSecondsLeft(TIMER_DURATIONS_SECONDS[nextMode]);
    setIsRunning(true);
    document.getElementById('timer')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleToggleRunning = () => {
    if (secondsLeft === 0) {
      setJustCompletedMode(null);
      setSecondsLeft(TIMER_DURATIONS_SECONDS[mode]);
      setIsRunning(true);
      return;
    }
    setJustCompletedMode(null);
    setIsRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setJustCompletedMode(null);
    setSecondsLeft(TIMER_DURATIONS_SECONDS[mode]);
  };

  const handleCompleteEarly = () => {
    setIsRunning(false);
    setSecondsLeft(0);
    recordCompletedSession(mode);
  };

  const handleToggleEnvironmentItem = (id: string) => {
    setPersisted((prev) => ({
      ...prev,
      environmentItems: prev.environmentItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const handleResetEnvironment = () => {
    setPersisted((prev) => ({
      ...prev,
      environmentItems: prev.environmentItems.map((item) => ({ ...item, checked: false })),
    }));
  };

  const handleSelectLocation = (location: StudyLocation) => {
    setPersisted((prev) => ({
      ...prev,
      location,
    }));
  };

  const handleAddTask = (title: string) => {
    const newTask: MicroTask = {
      id: makeId('task'),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setPersisted((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
      activeTaskId: prev.activeTaskId ?? newTask.id,
    }));
  };

  const handleToggleTask = (id: string) => {
    setPersisted((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const handleSelectActiveTask = (id: string) => {
    setPersisted((prev) => ({
      ...prev,
      activeTaskId: prev.activeTaskId === id ? null : id,
    }));
  };

  const handleDeleteTask = (id: string) => {
    setPersisted((prev) => {
      const nextTasks = prev.tasks.filter((t) => t.id !== id);
      const nextActiveId =
        prev.activeTaskId === id ? (nextTasks[0]?.id ?? null) : prev.activeTaskId;
      return {
        ...prev,
        tasks: nextTasks,
        activeTaskId: nextActiveId,
      };
    });
  };

  const handleAddNote = (content: string) => {
    const newNote: DistractionNote = {
      id: makeId('note'),
      content,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    setPersisted((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
  };

  const handleToggleNote = (id: string) => {
    setPersisted((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, resolved: !n.resolved } : n)),
    }));
  };

  const handleDeleteNote = (id: string) => {
    setPersisted((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
  };

  const handleClearResolvedNotes = () => {
    setPersisted((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => !n.resolved),
    }));
  };

  const handleAddWater = (delta: number) => {
    setPersisted((prev) => ({
      ...prev,
      waterMl: Math.max(0, prev.waterMl + delta),
    }));
  };

  const handleToggleStretch = (id: string) => {
    setPersisted((prev) => ({
      ...prev,
      stretchSteps: prev.stretchSteps.map((s) =>
        s.id === id ? { ...s, done: !s.done } : s
      ),
    }));
  };

  const handleClearHistory = () => {
    setPersisted((prev) => ({
      ...prev,
      logs: [],
    }));
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#111827]">
      <TopBar onQuickStartFiveMin={() => handleAdvanceAndStart('ignition')} />

      <main className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-7 space-y-8">
        <div className="max-w-3xl">
          <h1 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-[#111827] text-balance">
            気合いに頼らず、集中できる環境と仕組みをつくる
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[#4B5563]">
            スマホを遠ざけて「とりあえず5分だけ」始める。作業興奮・ポモドーロ・具体的なタスク設定・15分仮眠を1つのデスクで実践できます。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <FocusTimerStage
              mode={mode}
              secondsLeft={secondsLeft}
              isRunning={isRunning}
              justCompletedMode={justCompletedMode}
              activeTaskTitle={activeTask?.title ?? null}
              soundEnabled={persisted.soundEnabled}
              onSelectMode={handleSelectMode}
              onToggleRunning={handleToggleRunning}
              onReset={handleResetTimer}
              onCompleteEarly={handleCompleteEarly}
              onToggleSound={() =>
                setPersisted((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
              }
              onAdvanceMode={handleAdvanceAndStart}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <EnvironmentChecklist
              items={persisted.environmentItems}
              location={persisted.location}
              onToggleItem={handleToggleEnvironmentItem}
              onResetChecklist={handleResetEnvironment}
              onSelectLocation={handleSelectLocation}
            />
          </div>
        </div>

        <TaskAndBrainDump
          tasks={persisted.tasks}
          activeTaskId={persisted.activeTaskId}
          notes={persisted.notes}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onSelectActiveTask={handleSelectActiveTask}
          onDeleteTask={handleDeleteTask}
          onAddNote={handleAddNote}
          onToggleNote={handleToggleNote}
          onDeleteNote={handleDeleteNote}
          onClearResolvedNotes={handleClearResolvedNotes}
        />

        <ConditionPanel
          waterMl={persisted.waterMl}
          stretchSteps={persisted.stretchSteps}
          onAddWater={handleAddWater}
          onToggleStretch={handleToggleStretch}
          onStartPowerNap={() => handleAdvanceAndStart('nap')}
        />

        <SessionHistory logs={persisted.logs} onClearHistory={handleClearHistory} />
      </main>

      <footer className="border-t border-[#E2E6EC] bg-[#FFFFFF]">
        <div className="mx-auto flex max-w-[1200px] flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-6 text-xs text-[#6B7280]">
          <p>
            まずは1つだけ試してみる — スマホを別の部屋に置いて、25分タイマーをセットしてみましょう。
          </p>
          <p>集中デスク</p>
        </div>
      </footer>
    </div>
  );
}
