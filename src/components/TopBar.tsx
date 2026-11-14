interface TopBarProps {
  onQuickStartFiveMin: () => void;
}

export function TopBar({ onQuickStartFiveMin }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E2E6EC] bg-[#FFFFFF]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-4 sm:px-6">
        <a
          href="#timer"
          className="font-display text-lg font-bold tracking-tight text-[#111827] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E] rounded"
        >
          集中デスク
        </a>

        <nav
          aria-label="メインナビゲーション"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4B5563]"
        >
          <a
            href="#timer"
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            集中タイマー
          </a>
          <a
            href="#environment"
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            環境チェック
          </a>
          <a
            href="#tasks"
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            タスクと雑念
          </a>
          <a
            href="#condition"
            className="hover:text-[#111827] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            コンディション
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onQuickStartFiveMin}
            className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0D5F59] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F766E]"
          >
            5分だけ始める
          </button>
        </div>
      </div>
    </header>
  );
}
