import { useState } from 'react';
import { Moon, Droplets, Minus, Plus } from 'lucide-react';
import type { StretchStep } from '../types/study';

interface ConditionPanelProps {
  waterMl: number;
  stretchSteps: StretchStep[];
  onAddWater: (delta: number) => void;
  onToggleStretch: (id: string) => void;
  onStartPowerNap: () => void;
}

type SnackTab = 'recommended' | 'avoid';

export function ConditionPanel({
  waterMl,
  stretchSteps,
  onAddWater,
  onToggleStretch,
  onStartPowerNap,
}: ConditionPanelProps) {
  const [snackTab, setSnackTab] = useState<SnackTab>('recommended');

  const waterTargetMl = 1500;
  const waterPercent = Math.min(100, Math.round((waterMl / waterTargetMl) * 100));

  return (
    <section id="condition" aria-labelledby="condition-heading" className="space-y-4">
      <div>
        <p className="text-xs font-medium text-[#6B7280]">04. コンディションを整える</p>
        <h2 id="condition-heading" className="mt-1 text-xl font-bold text-[#111827]">
          眠気・水分・血糖値のリセット
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: 15-min Power Nap */}
        <div className="flex flex-col justify-between rounded-xl border border-[#E2E6EC] bg-[#FFFFFF] p-6">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-[#ECEFF3] pb-3">
              <h3 className="text-base font-bold text-[#111827]">15分だけの仮眠</h3>
              <Moon className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#374151]">
              眠いまま勉強しても効率は落ちる一方です。思い切って机に伏せて15〜20分だけ仮眠をとると、脳がリセットされてその後の集中力が格段に上がります。
            </p>
            <p className="mt-2 text-xs text-[#6B7280]">
              注意点: 30分以上寝ると深い睡眠に入り、起きた後の眠気が残るため15分設定が最適です。
            </p>
          </div>

          <div className="mt-5 border-t border-[#ECEFF3] pt-4">
            <button
              type="button"
              onClick={onStartPowerNap}
              className="w-full rounded-lg bg-[#B45309] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#92400E] transition-colors whitespace-nowrap"
            >
              15分仮眠タイマーを開始
            </button>
          </div>
        </div>

        {/* Card 2: Hydration & Light Stretch */}
        <div className="flex flex-col justify-between rounded-xl border border-[#E2E6EC] bg-[#FFFFFF] p-6">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-[#ECEFF3] pb-3">
              <h3 className="text-base font-bold text-[#111827]">水分補給とストレッチ</h3>
              <Droplets className="h-4 w-4 text-[#0F766E]" aria-hidden="true" />
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-[#4B5563]">今日の水分摂取</span>
                <span data-testid="water-ml-display" className="font-mono-tabular text-sm font-bold text-[#111827]">
                  {waterMl} / {waterTargetMl} ml
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#ECEFF3]" aria-hidden="true">
                <div
                  className="h-full bg-[#0F766E] transition-all duration-300"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAddWater(-200)}
                  disabled={waterMl <= 0}
                  aria-label="水分量を200ml減らす"
                  className="inline-flex items-center justify-center rounded-lg border border-[#E2E6EC] bg-[#FFFFFF] p-2 text-[#374151] hover:bg-[#F6F7F9] disabled:opacity-40 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onAddWater(200)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E6EC] bg-[#F6F7F9] px-3 py-2 text-xs font-semibold text-[#111827] hover:bg-[#EBEEF2] transition-colors whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+1杯 (200ml)</span>
                </button>
              </div>
            </div>

            <ul className="mt-4 divide-y divide-[#ECEFF3] border-t border-[#ECEFF3]">
              {stretchSteps.map((step) => (
                <li key={step.id} className="py-2.5">
                  <label className="flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={step.done}
                      onChange={() => onToggleStretch(step.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#CBD5E1] accent-[#0F766E]"
                    />
                    <span className="min-w-0">
                      <span
                        className={`block text-xs font-semibold ${
                          step.done ? 'text-[#6B7280] line-through' : 'text-[#111827]'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span className="block text-xs text-[#6B7280]">{step.detail}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Card 3: Blood Sugar & Snack Control */}
        <div className="flex flex-col justify-between rounded-xl border border-[#E2E6EC] bg-[#FFFFFF] p-6">
          <div>
            <div className="border-b border-[#ECEFF3] pb-3">
              <h3 className="text-base font-bold text-[#111827]">糖分の摂りすぎに注意</h3>
            </div>

            <div
              role="tablist"
              aria-label="間食の比較"
              className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-[#F1F3F6] p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={snackTab === 'recommended'}
                onClick={() => setSnackTab('recommended')}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  snackTab === 'recommended'
                    ? 'bg-[#FFFFFF] text-[#0F766E] shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                おすすめの間食
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={snackTab === 'avoid'}
                onClick={() => setSnackTab('avoid')}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  snackTab === 'avoid'
                    ? 'bg-[#FFFFFF] text-[#B91C1C] shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                控えたい間食
              </button>
            </div>

            {snackTab === 'recommended' ? (
              <div className="mt-4 space-y-3 text-sm text-[#374151]">
                <p className="text-xs leading-relaxed text-[#4B5563]">
                  血糖値をゆるやかに保つ食品を選ぶと、食後の急激な眠気を防げます。
                </p>
                <ul className="divide-y divide-[#ECEFF3] border-t border-[#ECEFF3] text-xs">
                  <li className="py-2.5">
                    <span className="font-semibold text-[#111827]">素焼きナッツ（アーモンド等）</span>
                    <p className="mt-0.5 text-[#6B7280]">噛む刺激と良質な脂質で満足感が続きます。</p>
                  </li>
                  <li className="py-2.5">
                    <span className="font-semibold text-[#111827]">高カカオチョコレート (70%以上)</span>
                    <p className="mt-0.5 text-[#6B7280]">糖分が少なく、少量のテオブロミンでリフレッシュ。</p>
                  </li>
                  <li className="py-2.5">
                    <span className="font-semibold text-[#111827]">水・無糖のお茶</span>
                    <p className="mt-0.5 text-[#6B7280]">脱水による集中力低下を穏やかに防ぎます。</p>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-[#374151]">
                <p className="text-xs leading-relaxed text-[#4B5563]">
                  甘いお菓子やジュースを一気に摂ると血糖値が急上昇し、その後の急降下で強い眠気やだるさが起こります。
                </p>
                <ul className="divide-y divide-[#ECEFF3] border-t border-[#ECEFF3] text-xs">
                  <li className="py-2.5">
                    <span className="font-semibold text-[#111827]">加糖のジュース・炭酸飲料</span>
                    <p className="mt-0.5 text-[#6B7280]">液体糖分は吸収が速く、集中切れの原因になります。</p>
                  </li>
                  <li className="py-2.5">
                    <span className="font-semibold text-[#111827]">菓子パン・甘いスナック菓子</span>
                    <p className="mt-0.5 text-[#6B7280]">勉強の合間ではなく、集中が終わった後のご褒美に。</p>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
