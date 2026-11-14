export type TimerMode = 'ignition' | 'pomodoro' | 'break' | 'nap';

export type StudyLocation = 'home' | 'library' | 'study_room' | 'cafe';

export interface EnvironmentItem {
  id: string;
  label: string;
  detail: string;
  checked: boolean;
}

export interface MicroTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface DistractionNote {
  id: string;
  content: string;
  createdAt: string;
  resolved: boolean;
}

export interface StretchStep {
  id: string;
  title: string;
  detail: string;
  done: boolean;
}

export interface StudySessionLog {
  id: string;
  mode: TimerMode;
  durationMinutes: number;
  taskTitle: string | null;
  completedAt: string;
}
