import type { CourseDifficulty } from '../../../services/courseService';

interface CourseFilters {
  difficulty?: CourseDifficulty;
  sortBy: string;
}

interface CourseFilterProps {
  filters: CourseFilters;
  onFilterChange: (filters: CourseFilters) => void;
}

const DIFFICULTY_OPTIONS: { label: string; value: CourseDifficulty | undefined }[] = [
  { label: '전체', value: undefined },
  { label: '초급', value: 'EASY' },
  { label: '중급', value: 'MODERATE' },
  { label: '상급', value: 'HARD' },
];

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: '인기순', value: 'popular' },
  { label: '최신순', value: 'latest' },
  { label: '거리순', value: 'distance' },
  { label: '평점순', value: 'rating' },
];

export function CourseFilter({ filters, onFilterChange }: CourseFilterProps) {
  return (
    <div className="course_filter_wrap">
      <div className="course_filter_tab">
        {DIFFICULTY_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            className={filters.difficulty === opt.value ? 'active' : ''}
            onClick={() => onFilterChange({ ...filters, difficulty: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="course_filter_row">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`course_filter_chip${filters.sortBy === opt.value ? ' active' : ''}`}
            onClick={() => onFilterChange({ ...filters, sortBy: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
