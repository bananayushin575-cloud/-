import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEnvironmentProgress,
  calculateTodayStats,
  evaluateTaskSpecificity,
  formatSeconds,
  getNextRecommendedMode,
} from './focusLogic';
import type { EnvironmentItem, StudySessionLog } from '../types/study';

test('formatSeconds formats minutes and seconds with zero padding', () => {
  assert.equal(formatSeconds(1500), '25:00');
  assert.equal(formatSeconds(300), '05:00');
  assert.equal(formatSeconds(65), '01:05');
  assert.equal(formatSeconds(0), '00:00');
  assert.equal(formatSeconds(-12), '00:00');
});

test('evaluateTaskSpecificity flags vague study goals and accepts concrete goals', () => {
  const emptyResult = evaluateTaskSpecificity('   ');
  assert.equal(emptyResult.isSpecific, false);
  assert.ok(emptyResult.hint);

  const vagueSubject = evaluateTaskSpecificity('英語');
  assert.equal(vagueSubject.isSpecific, false);
  assert.ok(vagueSubject.hint?.includes('英単語帳'));

  const shortVague = evaluateTaskSpecificity('読書');
  assert.equal(shortVague.isSpecific, false);

  const concretePages = evaluateTaskSpecificity('英単語帳 P.20〜25を覚える');
  assert.equal(concretePages.isSpecific, true);
  assert.equal(concretePages.hint, null);

  const concreteCount = evaluateTaskSpecificity('数学の問題集を3問解く');
  assert.equal(concreteCount.isSpecific, true);
  assert.equal(concreteCount.hint, null);
});

test('calculateEnvironmentProgress computes completion counts and readiness', () => {
  const items: EnvironmentItem[] = [
    { id: 'phone', label: 'スマホ', detail: '別室', checked: true },
    { id: 'desk', label: '机', detail: '教材のみ', checked: true },
    { id: 'place', label: '場所', detail: '図書館', checked: false },
    { id: 'water', label: '水', detail: '手元', checked: false },
  ];

  const partial = calculateEnvironmentProgress(items);
  assert.equal(partial.completed, 2);
  assert.equal(partial.total, 4);
  assert.equal(partial.percent, 50);
  assert.equal(partial.isReady, false);

  const allDone = calculateEnvironmentProgress(
    items.map((item) => ({ ...item, checked: true }))
  );
  assert.equal(allDone.completed, 4);
  assert.equal(allDone.percent, 100);
  assert.equal(allDone.isReady, true);
});

test('getNextRecommendedMode guides natural study rhythm transitions', () => {
  assert.equal(getNextRecommendedMode('ignition'), 'pomodoro');
  assert.equal(getNextRecommendedMode('pomodoro'), 'break');
  assert.equal(getNextRecommendedMode('break'), 'pomodoro');
  assert.equal(getNextRecommendedMode('nap'), 'ignition');
});

test('calculateTodayStats sums only same-day focus sessions', () => {
  const ref = '2026-11-14T10:00:00.000Z';
  const logs: StudySessionLog[] = [
    {
      id: '1',
      mode: 'ignition',
      durationMinutes: 5,
      taskTitle: '英単語帳 P.20〜25を覚える',
      completedAt: '2026-11-14T08:30:00.000Z',
    },
    {
      id: '2',
      mode: 'pomodoro',
      durationMinutes: 25,
      taskTitle: '数学の問題集を3問解く',
      completedAt: '2026-11-14T09:10:00.000Z',
    },
    {
      id: '3',
      mode: 'break',
      durationMinutes: 5,
      taskTitle: null,
      completedAt: '2026-11-14T09:35:00.000Z',
    },
    {
      id: '4',
      mode: 'nap',
      durationMinutes: 15,
      taskTitle: null,
      completedAt: '2026-11-14T09:50:00.000Z',
    },
    {
      id: '5',
      mode: 'pomodoro',
      durationMinutes: 25,
      taskTitle: '昨日の記録',
      completedAt: '2026-11-10T09:10:00.000Z',
    },
  ];

  const stats = calculateTodayStats(logs, ref);
  assert.equal(stats.totalFocusMinutes, 30);
  assert.equal(stats.completedPomodoros, 1);
  assert.equal(stats.completedIgnitions, 1);
  assert.equal(stats.completedNaps, 1);
  assert.equal(stats.todayLogs.length, 4);
});
