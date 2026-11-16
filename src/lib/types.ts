export type RoundType = 'kd' | 'vcnv' | 'tt' | 'vd' | 'chp';

export interface OlympiaQuestion {
  id: string;
  round: RoundType;
  category: string;
  question: string;
  answer: string;
  explanation?: string;
  points: number;
  time_limit: number;
  media_url?: string;
  media_type?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface ObstacleRow {
  row: number;
  char_count: number;
  question: string;
  answer: string;
  is_revealed?: boolean;
}

export interface Obstacle {
  id: string;
  title: string;
  keyword: string;
  char_count: number;
  image_url: string;
  rows: ObstacleRow[];
  center_clue: {
    question: string;
    answer: string;
    is_revealed?: boolean;
  };
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  slot: number;
  is_eliminated_vcnv?: boolean;
  star_of_hope_used?: boolean;
}

export interface MatchState {
  id: string;
  pin_code: string;
  title: string;
  status: 'lobby' | 'kd' | 'vcnv' | 'tt' | 'vd' | 'finished';
  current_round: RoundType;
  current_question_index: number;
  timer_seconds: number;
  is_timer_running: boolean;
  players: Player[];
}
