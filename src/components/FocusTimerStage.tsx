import { Pause, Play, RotateCcw, Check, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import type { TimerMode } from '../types/study';
import {
  formatSeconds,
  getNextRecommendedMode,
  TIMER_DURATIONS_SECONDS,
  TIMER_MODE_META,
} from '../utils/focusLogic';

interface FocusTimerStageProps {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  justCompletedMode: TimerMode | null;
  activeTaskTitle: string | null;
  soundEnabled: boolean;
  onSelectMode: (mode: TimerMode) => void;
  onToggleRunning: () => void;
  onReset: () => void;
  onCompleteEarly: () => void;
  onToggleSound: () => void;
  onAdvanceMode: (nextMode: TimerMode) => void;
}

const MODE_ORDER: TimerMode[] = ['ignition', 'pomodoro', 'break', 'nap'];

export function FocusTimerStage({
  mode,
  secondsLeft,
  isRunning,
  justCompletedMode,
  activeTaskTitle,
  soundEnabled,
  onSelectMode,
  onToggleRunning,
  onReset,
  onCompleteEarly,
  onToggleSound,
  onAdvanceMode,
}: FocusTimerStageProps) {
  const meta = TIMER_MODE_META[mode];
  const totalSeconds = TIMER_DURATIONS_SECONDS[mode];
  const elapsedRatio = Math.min(1, Math.max(0, (totalSeconds - secondsLeft) / totalSeconds));

  const isRestMode = mode === 'break' || mode === 'nap';
  const strokeColor = isRestMode ? '#B45309' : '#0F766E';
  const accentBg = isRestMode ? 'bg-[#B45309] hover:bg-[#92400E]' : 'bg-[#0F766E] hover:bg-[#0D5F59]';
  const accentFocus = isRestMode
    ? 'focus-visible:outline-[#B45309]'
    : 'focus-visible:outline-[#0F766E]';

  const statusText = isRunning
    ? isRestMode
      ? '休息中'
      : '集中中'
    : secondsLeft === 0
      ? '完了'
      : secondsLeft < totalSeconds
        ? '一時停止'
        : '待機中';

  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - elapsedRatio);

  const recommendedNext = getNextRecommendedMode(justCompletedMode ?? mode);
  const recommendedNextMeta = TIMER_MODE_META[recommendedNext];

  return (
    <section
      id="timer"
      aria-labelledby="timer-heading"
      className="flex h-full flex-col justify-between rounded-xl border border-[#E2E6EC] bg-[#FFFFFF] p-6"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E6EC] pb-4">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">
              02. 始め方と時間管理
              <span aria-hidden="true" className="mx-1.5">·</span>
              <span>状態: {statusText}</span>
            </p>
            <h2 id="timer-heading" className="mt-1 text-xl font-bold text-[#111827]">
              {meta.label}タイマー
            </h2>
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? '終了通知音をオフにする' : '終了通知音をオンにする'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E6EC] bg-[#F6F7F9] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#EBEEF2] transition-colors whitespace-nowrap shrink-0"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{soundEnabled ? '終了音オン' : '終了音オフ'}</span>
          </button>
        </div>

        <div
          role="tablist"
          aria-label="タイマーモード切替"
          className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-lg bg-[#F1F3F6] p-1"
        >
          {MODE_ORDER.map((m) => {
            const item = TIMER_MODE_META[m];
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelectMode(m)}
                className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#FFFFFF] text-[#111827] shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col items-center text-center">
          <div className="relative flex h-52 w-52 items-center justify-center">
            <svg
              className="h-full w-full -rotate-90"
              viewBox="0 0 212 212"
              aria-hidden="true"
            >
              <circle
                cx="106"
                cy="106"
                r={radius}
                fill="none"
                stroke="#EAECEF"
                strokeWidth="7"
              />
              <circle
                cx="106"
                cy="106"
                r={radius}
                fill="none"
                stroke={strokeColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-[stroke-dashoffset] duration-300 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-[#6B7280]">{meta.label}</span>
              <div
                data-testid="timer-readout"
                className="font-mono-tabular mt-1 text-5xl font-bold tracking-tight text-[#111827]"
              >
                {formatSeconds(secondsLeft)}
              </div>
              <span className="mt-1 text-xs font-medium text-[#4B5563]">
                {statusText}
              </span>
            </div>
          </div>

          <div className="mt-4 w-full max-w-md border-t border-[#E2E6EC] pt-3.5">
            <p className="text-xs font-medium text-[#6B7280]">今の小さなゴール</p>
            <p className="mt-1 text-sm font-semibold text-[#111827]" data-testid="active-task-display">
              {activeTaskTitle ? activeTaskTitle : '未選択（下の「タスクの具体化」から1つ選ぶと迷いません）'}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">
              {meta.restNotice ?? meta.guidance}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-[#E2E6EC] pt-4">
        {justCompletedMode && (
          <div
            role="status"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-[#F0FDF9] border border-[#CCFBF1] px-4 py-3"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-[#115E59]">
                {TIMER_MODE_META[justCompletedMode].label}が完了しました
              </p>
              <p className="text-xs text-[#0F766E]">
                {justCompletedMode === 'ignition'
                  ? '作業興奮がオンになりました。このまま25分集中へ移行できます。'
                  : justCompletedMode === 'pomodoro'
                    ? '脳を休めるため、スマホを見ずに5分休憩をとりましょう。'
                    : 'リズムが整いました。次の集中セットに進めます。'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAdvanceMode(recommendedNext)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0F766E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0D5F59] transition-colors whitespace-nowrap shrink-0"
            >
              <span>{recommendedNextMeta.label}へ進む</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onToggleRunning}
            className={`inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0 ${accentBg} focus-visible:outline-2 focus-visible:outline-offset-2 ${accentFocus}`}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                <span>一時停止</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>{secondsLeft < totalSeconds && secondsLeft > 0 ? '再開する' : 'タイマー開始'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E6EC] bg-[#FFFFFF] px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F6F7F9] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
            <span>リセット</span>
          </button>

          <button
            type="button"
            onClick={onCompleteEarly}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E6EC] bg-[#FFFFFF] px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F6F7F9] transition-colors whitespace-nowrap shrink-0"
          >
            <Check className="h-4 w-4" />
            <span>完了して記録</span>
          </button>
        </div>

        {mode === 'ignition' && !justCompletedMode && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => onAdvanceMode('pomodoro')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F766E] hover:underline underline-offset-4"
            >
              <span>調子が出てきたら、このままポモドーロ 25分へ切り替える</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
