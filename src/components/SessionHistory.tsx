import type { StudySessionLog } from '../types/study';
import { calculateTodayStats, formatClockTime, TIMER_MODE_META } from '../utils/focusLogic';

interface SessionHistoryProps {
  logs: StudySessionLog[];
  onClearHistory: () => void;
}

export function SessionHistory({ logs, onClearHistory }: SessionHistoryProps) {
  const stats = calculateTodayStats(logs);

  return (
    <section
      aria-labelledby="history-heading"
      className="rounded-xl border border-[#E2E6EC] bg-[#FFFFFF] p-6 sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E6EC] pb-4">
        <div>
          <p className="text-xs font-medium text-[#6B7280]">
            まずは1つだけ試してみる — 積み上げの記録
          </p>
          <h2 id="history-heading" className="mt-1 text-xl font-bold text-[#111827]">
            今日の集中ログ
          </h2>
        </div>

        {stats.todayLogs.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="text-xs font-medium text-[#4B5563] hover:text-[#111827] underline underline-offset-4 whitespace-nowrap shrink-0"
          >
            記録をクリア
          </button>
        )}
      </div>

      {/* 4-column summary strip */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[#ECEFF3] pb-5">
        <div>
          <p className="text-xs text-[#6B7280]">今日の集中時間</p>
          <p className="font-mono-tabular mt-1 text-2xl font-bold text-[#111827]" data-testid="total-focus-minutes">
            {stats.totalFocusMinutes}分
          </p>
        </div>
        <div>
          <p className="text-xs text-[#6B7280]">ポモドーロ (25分)</p>
          <p className="font-mono-tabular mt-1 text-2xl font-bold text-[#111827]">
            {stats.completedPomodoros}回
          </p>
        </div>
        <div>
          <p className="text-xs text-[#6B7280]">5分着手</p>
          <p className="font-mono-tabular mt-1 text-2xl font-bold text-[#111827]">
            {stats.completedIgnitions}回
          </p>
        </div>
        <div>
          <p className="text-xs text-[#6B7280]">15分仮眠</p>
          <p className="font-mono-tabular mt-1 text-2xl font-bold text-[#111827]">
            {stats.completedNaps}回
          </p>
        </div>
      </div>

      {stats.todayLogs.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#6B7280]">
          まだ記録がありません。「5分だけ始める」または「ポモドーロ 25分」を完了するとここに記録されます。
        </p>
      ) : (
        <ul className="divide-y divide-[#ECEFF3] mt-2" data-testid="session-log-list">
          {stats.todayLogs.map((log) => (
            <li key={log.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-[#111827]">
                  {TIMER_MODE_META[log.mode].label}
                </span>
                <span aria-hidden="true" className="mx-2 text-[#9CA3AF]">·</span>
                <span className="text-[#4B5563]">
                  {log.taskTitle ? log.taskTitle : '目標指定なし'}
                </span>
              </div>
              <div className="font-mono-tabular flex items-center gap-3 text-xs text-[#6B7280] shrink-0">
                <span>{log.durationMinutes}分</span>
                <span>{formatClockTime(log.completedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
