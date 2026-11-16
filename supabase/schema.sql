-- SCHEMA & SEED DATA FOR "ĐƯỜNG LÊN ĐỈNH OLYMPIA" (SUPABASE)

CREATE TABLE IF NOT EXISTS olympia_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round TEXT NOT NULL, -- 'kd', 'vcnv', 'tt', 'vd', 'chp'
  category TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT,
  points INT DEFAULT 10,
  time_limit INT DEFAULT 10,
  media_url TEXT,
  media_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS olympia_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_code TEXT NOT NULL,
  title TEXT DEFAULT 'Trận đấu Olympia',
  status TEXT DEFAULT 'lobby',
  current_round TEXT DEFAULT 'kd',
  current_question_index INT DEFAULT 0,
  timer_seconds INT DEFAULT 0,
  is_timer_running BOOLEAN DEFAULT FALSE,
  host_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS olympia_match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES olympia_matches(id) ON DELETE CASCADE,
  slot INT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '👨‍🎓',
  score INT DEFAULT 0,
  is_eliminated_vcnv BOOLEAN DEFAULT FALSE,
  star_of_hope_used BOOLEAN DEFAULT FALSE,
  is_ready BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS olympia_buzzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES olympia_matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES olympia_match_players(id) ON DELETE CASCADE,
  player_name TEXT,
  round TEXT NOT NULL,
  question_id UUID,
  buzzed_at TIMESTAMPTZ DEFAULT NOW(),
  reaction_ms INT DEFAULT 0,
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS olympia_obstacles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  keyword TEXT NOT NULL,
  char_count INT NOT NULL,
  image_url TEXT,
  rows JSONB NOT NULL,
  center_clue JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE olympia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympia_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympia_match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympia_buzzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympia_obstacles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read olympia_questions" ON olympia_questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert olympia_questions" ON olympia_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public all olympia_matches" ON olympia_matches FOR ALL USING (true);
CREATE POLICY "Allow public all olympia_match_players" ON olympia_match_players FOR ALL USING (true);
CREATE POLICY "Allow public all olympia_buzzes" ON olympia_buzzes FOR ALL USING (true);
CREATE POLICY "Allow public all olympia_obstacles" ON olympia_obstacles FOR ALL USING (true);
