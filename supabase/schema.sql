-- =============================================
-- 10분 포스트잇 - Supabase Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. profiles table
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  plan_time TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. nfc_logs table
-- =============================================
CREATE TABLE IF NOT EXISTS nfc_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reward_given BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for nfc_logs
ALTER TABLE nfc_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nfc_logs"
  ON nfc_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nfc_logs"
  ON nfc_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nfc_logs"
  ON nfc_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- 3. brain_dumps table
-- =============================================
CREATE TABLE IF NOT EXISTS brain_dumps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for brain_dumps
ALTER TABLE brain_dumps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own brain_dumps"
  ON brain_dumps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brain_dumps"
  ON brain_dumps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4. daily_plans table
-- =============================================
CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  brain_dump_id UUID REFERENCES brain_dumps(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for daily_plans
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily_plans"
  ON daily_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily_plans"
  ON daily_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_plans"
  ON daily_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- 5. plan_sentences table
-- =============================================
CREATE TABLE IF NOT EXISTS plan_sentences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brain_dump_id UUID REFERENCES brain_dumps(id) ON DELETE SET NULL,
  daily_plan_id UUID REFERENCES daily_plans(id) ON DELETE SET NULL,
  original_task TEXT NOT NULL,
  final_sentence TEXT NOT NULL,
  backup_tiny_action TEXT,
  estimated_start_time TEXT,
  start_time TEXT,
  display_order INTEGER NOT NULL DEFAULT 1,
  written_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for plan_sentences
ALTER TABLE plan_sentences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan_sentences"
  ON plan_sentences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plan_sentences"
  ON plan_sentences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plan_sentences"
  ON plan_sentences FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- 6. reward_logs table
-- =============================================
CREATE TABLE IF NOT EXISTS reward_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('nfc_tag', 'brain_dump', 'plan_sentence', 'postit_written', 'return_bonus')),
  xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for reward_logs
ALTER TABLE reward_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reward_logs"
  ON reward_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reward_logs"
  ON reward_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 7. daily_stats table
-- =============================================
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  nfc_count INTEGER NOT NULL DEFAULT 0,
  brain_dump_count INTEGER NOT NULL DEFAULT 0,
  plan_sentence_count INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- RLS for daily_stats
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily_stats"
  ON daily_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily_stats"
  ON daily_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_stats"
  ON daily_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- RPC: increment_xp
-- =============================================
CREATE OR REPLACE FUNCTION increment_xp(user_id_input UUID, xp_input INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET
    total_xp = total_xp + xp_input,
    updated_at = NOW()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Trigger: auto-create profile on user signup
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname, total_xp, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nickname',
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_nfc_logs_user_accessed ON nfc_logs(user_id, accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_dumps_user_created ON brain_dumps(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plan_sentences_user_created ON plan_sentences(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_logs_user_created ON reward_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_logs_user_type_created ON reward_logs(user_id, reward_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date ON daily_plans(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_plan_sentences_daily_plan ON plan_sentences(daily_plan_id, display_order);
