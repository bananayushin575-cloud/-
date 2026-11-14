import type {
  EnvironmentItem,
  StudyLocation,
  StudySessionLog,
  TimerMode,
} from '../types/study';

export const TIMER_DURATIONS_SECONDS: Record<TimerMode, number> = {
  ignition: 5 * 60,
  pomodoro: 25 * 60,
  break: 5 * 60,
  nap: 15 * 60,
};

export interface TimerModeMeta {
  id: TimerMode;
  label: string;
  shortLabel: string;
  minutes: number;
  guidance: string;
  restNotice: string | null;
}

export const TIMER_MODE_META: Record<TimerMode, TimerModeMeta> = {
  ignition: {
    id: 'ignition',
    label: '5分着手',
    shortLabel: '5分',
    minutes: 5,
    guidance: 'まずは机に座ってテキストを開くだけ。作業興奮で自然とエンジンがかかります。',
    restNotice: null,
  },
  pomodoro: {
    id: 'pomodoro',
    label: 'ポモドーロ 25分',
    shortLabel: '25分',
    minutes: 25,
    guidance: '25分間だけ1つのタスクに集中し、雑念が浮かんだらメモに書き出します。',
    restNotice: null,
  },
  break: {
    id: 'break',
    label: '休憩 5分',
    shortLabel: '5分休憩',
    minutes: 5,
    guidance: 'こまめな休憩で脳の疲れを防ぎます。',
    restNotice: '休憩中はスマホを見ず、目を閉じるか軽いストレッチで脳を休めましょう。',
  },
  nap: {
    id: 'nap',
    label: '仮眠 15分',
    shortLabel: '15分仮眠',
    minutes: 15,
    guidance: '机に伏せて15分だけ仮眠。寝過ぎを防ぎつつ脳をリセットします。',
    restNotice: 'アラームが鳴ったらすぐ起き、水分補給と軽い伸びをしましょう。',
  },
};

export const LOCATION_META: Record<
  StudyLocation,
  { label: string; tip: string }
> = {
  home: {
    label: '自宅デスク',
    tip: 'スマホを別の部屋に置き、机には今使う教材と筆記用具だけを置きます。',
  },
  library: {
    label: '図書館',
    tip: '周囲の静かな作業音が適度な緊張感をつくり、集中が持続しやすくなります。',
  },
  study_room: {
    label: '自習室',
    tip: '他の受験生や学習者の視線がある環境では、スマホを触りにくくなります。',
  },
  cafe: {
    label: 'カフェ',
    tip: '適度な環境音の中で「5分着手」から入るとスムーズに集中モードに入れます。',
  },
};

export function formatSeconds(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatClockTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

const CONCRETE_MARKER_REGEX =
  /([0-9０-９]+|p\.?|ページ|問|章|節|単元|分|個|題|回|〜|-|まで|から|単語|復習|音読|演習|過去問|要約|模試)/i;

const VAGUE_EXACT_WORDS = new Set([
  '勉強',
  '英語',
  '数学',
  '国語',
  '理科',
  '社会',
  '物理',
  '化学',
  '生物',
  '歴史',
  '日本史',
  '世界史',
  'プログラミング',
  '課題',
  '宿題',
  'テスト勉強',
  '復習',
  '予習',
]);

export function evaluateTaskSpecificity(rawTitle: string): {
  isSpecific: boolean;
  hint: string | null;
} {
  const trimmed = rawTitle.trim();
  if (!trimmed) {
    return {
      isSpecific: false,
      hint: '「何をするか」を具体的に入力してください。',
    };
  }

  if (VAGUE_EXACT_WORDS.has(trimmed)) {
    return {
      isSpecific: false,
      hint: `「${trimmed}」だけだと脳が迷います。「例: 英単語帳 P.20〜25を覚える」「例: 問題集を3問解く」のように範囲や数を決めましょう。`,
    };
  }

  const hasConcreteMarker = CONCRETE_MARKER_REGEX.test(trimmed);
  if (trimmed.length <= 6 && !hasConcreteMarker) {
    return {
      isSpecific: false,
      hint: 'ページ数・問題数・時間など、終わりの見える小さなゴールを足すと着手しやすくなります。',
    };
  }

  return {
    isSpecific: true,
    hint: null,
  };
}

export function calculateEnvironmentProgress(items: EnvironmentItem[]): {
  completed: number;
  total: number;
  percent: number;
  isReady: boolean;
} {
  const total = items.length;
  const completed = items.filter((item) => item.checked).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return {
    completed,
    total,
    percent,
    isReady: total > 0 && completed === total,
  };
}

export function getNextRecommendedMode(currentMode: TimerMode): TimerMode {
  switch (currentMode) {
    case 'ignition':
      return 'pomodoro';
    case 'pomodoro':
      return 'break';
    case 'break':
      return 'pomodoro';
    case 'nap':
      return 'ignition';
  }
}

export function isSameLocalDay(isoA: string, isoB: string): boolean {
  const a = new Date(isoA);
  const b = new Date(isoB);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
    return false;
  }
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function calculateTodayStats(
  logs: StudySessionLog[],
  referenceIso: string = new Date().toISOString()
): {
  totalFocusMinutes: number;
  completedPomodoros: number;
  completedIgnitions: number;
  completedNaps: number;
  todayLogs: StudySessionLog[];
} {
  const todayLogs = logs.filter((log) => isSameLocalDay(log.completedAt, referenceIso));

  let totalFocusMinutes = 0;
  let completedPomodoros = 0;
  let completedIgnitions = 0;
  let completedNaps = 0;

  for (const log of todayLogs) {
    if (log.mode === 'pomodoro') {
      totalFocusMinutes += log.durationMinutes;
      completedPomodoros += 1;
    } else if (log.mode === 'ignition') {
      totalFocusMinutes += log.durationMinutes;
      completedIgnitions += 1;
    } else if (log.mode === 'nap') {
      completedNaps += 1;
    }
  }

  return {
    totalFocusMinutes,
    completedPomodoros,
    completedIgnitions,
    completedNaps,
    todayLogs,
  };
}
