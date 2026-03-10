import type { CourseDifficulty, CourseSpotType } from '../../../services/courseService';

// ── Spot Types ──

export const SPOT_TYPES: { type: CourseSpotType; emoji: string; label: string }[] = [
  { type: 'CONVENIENCE_STORE', emoji: '🏪', label: '편의점' },
  { type: 'WATER_FOUNTAIN',   emoji: '💧', label: '음수대' },
  { type: 'RESTROOM',         emoji: '🚻', label: '화장실' },
  { type: 'PET_CAFE',         emoji: '☕', label: '펫카페' },
  { type: 'PARK',             emoji: '🌳', label: '공원' },
  { type: 'DANGER_ZONE',      emoji: '⚠️', label: '위험구역' },
  { type: 'REST_AREA',        emoji: '🪑', label: '쉼터' },
  { type: 'TRASH_CAN',        emoji: '🗑️', label: '쓰레기통' },
  { type: 'PHOTO_SPOT',       emoji: '📷', label: '포토스팟' },
  { type: 'OTHER',            emoji: '📍', label: '기타' },
];

export function spotEmoji(type: CourseSpotType | string): string {
  return SPOT_TYPES.find(s => s.type === type)?.emoji ?? '📍';
}

export function spotLabel(type: CourseSpotType | string): string {
  return SPOT_TYPES.find(s => s.type === type)?.label ?? '기타';
}

// ── Difficulty ──

const DIFFICULTY_LABEL: Record<CourseDifficulty, string> = {
  EASY: '초급',
  MODERATE: '중급',
  HARD: '상급',
};

const DIFFICULTY_CLASS: Record<CourseDifficulty, string> = {
  EASY: 'easy',
  MODERATE: 'moderate',
  HARD: 'hard',
};

export function difficultyLabel(d: CourseDifficulty): string {
  return DIFFICULTY_LABEL[d];
}

export function difficultyClass(d: CourseDifficulty): string {
  return DIFFICULTY_CLASS[d];
}
