import { RotateCcw } from 'lucide-react';
import type { EnvironmentItem, StudyLocation } from '../types/study';
import { calculateEnvironmentProgress, LOCATION_META } from '../utils/focusLogic';

interface EnvironmentChecklistProps {
  items: EnvironmentItem[];
  location: StudyLocation;
  onToggleItem: (id: string) => void;
  onResetChecklist: () => void;
  onSelectLocation: (loc: StudyLocation) => void;
}

const LOCATIONS: StudyLocation[] = ['home', 'library', 'study_room', 'cafe'];

export function EnvironmentChecklist({
  items,
  location,
  onToggleItem,
  onResetChecklist,
  onSelectLocation,
}: EnvironmentChecklistProps) {
  const progress = calculateEnvironmentProgress(items);
  const locationInfo = LOCATION_META[location];

  return (
    <section
      id="environment"
      aria-labelledby="environment-heading"
      className="flex h-full flex-col justify-between rounded-xl border border-[#E2E6EC] bg-[#FFFFFF] p-6"
    >
      <div>
        <div className="flex items-start justify-between gap-4 border-b border-[#E2E6EC] pb-4">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">
              01. 環境を整える（誘惑を物理的に断つ）
            </p>
            <h2 id="environment-heading" className="mt-1 text-xl font-bold text-[#111827]">
              着席前リセット
            </h2>
          </div>

          <div className="text-right shrink-0">
            <span
              data-testid="env-progress-text"
              className="font-mono-tabular text-sm font-semibold text-[#111827]"
            >
              {progress.completed} / {progress.total}
            </span>
            <p className="text-xs text-[#6B7280]">
              {progress.isReady ? '準備完了' : '確認中'}
            </p>
          </div>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#ECEFF3]" aria-hidden="true">
          <div
            className="h-full bg-[#0F766E] transition-all duration-300"
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-[#4B5563]">今日の勉強場所</p>
          <div
            role="group"
            aria-label="勉強場所の選択"
            className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-lg bg-[#F1F3F6] p-1"
          >
            {LOCATIONS.map((loc) => {
              const active = location === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectLocation(loc)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#FFFFFF] text-[#111827] shadow-xs font-semibold'
                      : 'text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  {LOCATION_META[loc].label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#4B5563]">{locationInfo.tip}</p>
        </div>

        <ul className="mt-5 divide-y divide-[#ECEFF3] border-t border-[#ECEFF3]">
          {items.map((item) => (
            <li key={item.id} className="py-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => onToggleItem(item.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#CBD5E1] text-[#0F766E] accent-[#0F766E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]"
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm font-medium ${
                      item.checked ? 'text-[#6B7280] line-through' : 'text-[#111827]'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-[#6B7280]">
                    {item.detail}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#E2E6EC] pt-4">
        <p className="text-xs text-[#4B5563]">
          {progress.isReady
            ? '誘惑を断つ準備が整いました。タイマーを開始しましょう。'
            : 'まずはスマホを視界から消すことから始めましょう。'}
        </p>
        <button
          type="button"
          onClick={onResetChecklist}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#4B5563] hover:text-[#111827] whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>リセット</span>
        </button>
      </div>
    </section>
  );
}
