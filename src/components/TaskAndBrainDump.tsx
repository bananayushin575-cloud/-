import { useState, type FormEvent } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';
import type { DistractionNote, MicroTask } from '../types/study';
import { evaluateTaskSpecificity, formatClockTime } from '../utils/focusLogic';

interface TaskAndBrainDumpProps {
  tasks: MicroTask[];
  activeTaskId: string | null;
  notes: DistractionNote[];
  onAddTask: (title: string) => void;
  onToggleTask: (id: string) => void;
  onSelectActiveTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddNote: (content: string) => void;
  onToggleNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onClearResolvedNotes: () => void;
}

const TASK_PRESETS = [
  '英単語帳 P.20〜25を覚える',
  '数学の問題集を3問解く',
  'テキストを5分だけ音読する',
];

export function TaskAndBrainDump({
  tasks,
  activeTaskId,
  notes,
  onAddTask,
  onToggleTask,
  onSelectActiveTask,
  onDeleteTask,
  onAddNote,
  onToggleNote,
  onDeleteNote,
  onClearResolvedNotes,
}: TaskAndBrainDumpProps) {
  const [taskInput, setTaskInput] = useState('');
  const [taskError, setTaskError] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const liveEvaluation = taskInput.trim() ? evaluateTaskSpecificity(taskInput) : null;

  const handleTaskSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = taskInput.trim();
    if (!trimmed) {
      setTaskError('具体的な小さなゴールを入力してください。');
      return;
    }
    onAddTask(trimmed);
    setTaskInput('');
    setTaskError(null);
  };

  const handleNoteSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = noteInput.trim();
    if (!trimmed) return;
    onAddNote(trimmed);
    setNoteInput('');
  };

  const resolvedCount = notes.filter((n) => n.resolved).length;

  return (
    <section
      id="tasks"
      aria-labelledby="tasks-heading"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Left: Concrete Micro-Task Setter */}
      <div className="flex flex-col justify-between rounded-xl border border-[#E2E6EC] bg-[#FFFFFF] p-6 sm:p-7">
        <div>
          <div className="border-b border-[#E2E6EC] pb-4">
            <p className="text-xs font-medium text-[#6B7280]">
              03. タスクを明確にする（迷いをなくす）
            </p>
            <h2 id="tasks-heading" className="mt-1 text-xl font-bold text-[#111827]">
              具体的マイクロタスク
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#4B5563]">
              「英語を勉強する」のような曖昧な目標ではなく、ページ数や問題数で小さなゴールを決めます。
            </p>
          </div>

          <form onSubmit={handleTaskSubmit} className="mt-5">
            <label htmlFor="micro-task-input" className="block text-xs font-medium text-[#374151]">
              今から取り組む小さなゴール
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="micro-task-input"
                type="text"
                value={taskInput}
                onChange={(e) => {
                  setTaskInput(e.target.value);
                  if (taskError) setTaskError(null);
                }}
                placeholder="例: 英単語帳 P.20〜25を覚える"
                className="min-w-0 flex-1 rounded-lg border border-[#D1D5DB] bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#0F766E] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1F2937] transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>追加</span>
              </button>
            </div>

            {taskError && (
              <p role="alert" className="mt-2 text-xs font-medium text-[#B91C1C]">
                {taskError}
              </p>
            )}

            {!taskError && liveEvaluation && !liveEvaluation.isSpecific && liveEvaluation.hint && (
              <p
                data-testid="task-specificity-hint"
                className="mt-2 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] px-3 py-2 text-xs leading-relaxed text-[#92400E]"
              >
                {liveEvaluation.hint}
              </p>
            )}
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#6B7280]">例から選ぶ:</span>
            {TASK_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  onAddTask(preset);
                  setTaskError(null);
                }}
                className="rounded-md border border-[#E2E6EC] bg-[#F6F7F9] px-2.5 py-1 text-xs font-medium text-[#374151] hover:bg-[#EBEEF2] transition-colors whitespace-nowrap shrink-0"
              >
                + {preset}
              </button>
            ))}
          </div>

          <div className="mt-5 border-t border-[#ECEFF3]">
            {tasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#6B7280]">
                まだタスクがありません。上の欄から「終わりの見える小さなゴール」を1つ登録しましょう。
              </p>
            ) : (
              <ul className="divide-y divide-[#ECEFF3]" data-testid="micro-task-list">
                {tasks.map((task) => {
                  const isActive = task.id === activeTaskId;
                  return (
                    <li
                      key={task.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => onToggleTask(task.id)}
                          aria-label={`「${task.title}」を完了にする`}
                          className="h-4 w-4 shrink-0 rounded border-[#CBD5E1] accent-[#0F766E]"
                        />
                        <span
                          className={`truncate text-sm ${
                            task.completed
                              ? 'text-[#9CA3AF] line-through'
                              : isActive
                                ? 'font-semibold text-[#0F766E]'
                                : 'font-medium text-[#111827]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onSelectActiveTask(task.id)}
                          aria-pressed={isActive}
                          aria-label={`「${task.title}」を現在の集中目標にする`}
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                            isActive
                              ? 'bg-[#0F766E] text-white'
                              : 'border border-[#E2E6EC] bg-[#FFFFFF] text-[#374151] hover:bg-[#F6F7F9]'
                          }`}
                        >
                          <Target className="h-3 w-3" />
                          <span>{isActive ? '集中対象' : 'これを選ぶ'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          aria-label={`「${task.title}」を削除`}
                          className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Right: Distraction Brain Dump */}
      <div className="flex flex-col justify-between rounded-xl border border-[#E2E6EC] bg-[#FFFFFF] p-6 sm:p-7">
        <div>
          <div className="flex items-start justify-between gap-4 border-b border-[#E2E6EC] pb-4">
            <div>
              <p className="text-xs font-medium text-[#6B7280]">
                雑念は紙に書き出す（ブレインダンプ）
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#111827]">雑念メモ</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#4B5563]">
                「あとで買うもの」「気になる予定」を頭の外に追い出し、目の前の勉強にすぐ戻ります。
              </p>
            </div>
            {resolvedCount > 0 && (
              <button
                type="button"
                onClick={onClearResolvedNotes}
                className="text-xs font-medium text-[#4B5563] hover:text-[#111827] underline underline-offset-4 whitespace-nowrap shrink-0"
              >
                整理済みを削除
              </button>
            )}
          </div>

          <form onSubmit={handleNoteSubmit} className="mt-5">
            <label htmlFor="brain-dump-input" className="block text-xs font-medium text-[#374151]">
              頭に浮かんだ用事・雑念
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="brain-dump-input"
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="例: 明日ノートを買う / 〇〇さんに返信する"
                className="min-w-0 flex-1 rounded-lg border border-[#D1D5DB] bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#0F766E] focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D1D5DB] bg-[#F6F7F9] px-4 py-2 text-sm font-medium text-[#111827] hover:bg-[#EBEEF2] transition-colors whitespace-nowrap shrink-0"
              >
                <span>書き出す</span>
              </button>
            </div>
          </form>

          <div className="mt-5 border-t border-[#ECEFF3]">
            {notes.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#6B7280]">
                浮かんだ雑念をここに預けておけば、「あとで確認できる」と脳が安心します。
              </p>
            ) : (
              <ul className="divide-y divide-[#ECEFF3]" data-testid="brain-dump-list">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={note.resolved}
                        onChange={() => onToggleNote(note.id)}
                        aria-label={`雑念「${note.content}」を処理済みにする`}
                        className="h-4 w-4 shrink-0 rounded border-[#CBD5E1] accent-[#0F766E]"
                      />
                      <span
                        className={`truncate text-sm ${
                          note.resolved ? 'text-[#9CA3AF] line-through' : 'text-[#111827]'
                        }`}
                      >
                        {note.content}
                      </span>
                    </label>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono-tabular text-xs text-[#6B7280]">
                        {formatClockTime(note.createdAt)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(note.id)}
                        aria-label={`雑念「${note.content}」を削除`}
                        className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
