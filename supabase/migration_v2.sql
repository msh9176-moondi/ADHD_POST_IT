-- =============================================
-- Migration v2: 다중 포스트잇 일일 계획표 지원
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1. daily_plans 테이블 신규 생성
CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  brain_dump_id UUID REFERENCES brain_dumps(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_plans' AND policyname = 'Users can view own daily_plans') THEN
    CREATE POLICY "Users can view own daily_plans" ON daily_plans FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_plans' AND policyname = 'Users can insert own daily_plans') THEN
    CREATE POLICY "Users can insert own daily_plans" ON daily_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_plans' AND policyname = 'Users can update own daily_plans') THEN
    CREATE POLICY "Users can update own daily_plans" ON daily_plans FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. plan_sentences 테이블에 새 컬럼 추가
ALTER TABLE plan_sentences
  ADD COLUMN IF NOT EXISTS daily_plan_id UUID REFERENCES daily_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS backup_tiny_action TEXT,
  ADD COLUMN IF NOT EXISTS estimated_start_time TEXT,
  ADD COLUMN IF NOT EXISTS start_time TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 1;

-- brain_dump_id를 nullable로 변경 (기존 NOT NULL 제약 해제)
ALTER TABLE plan_sentences ALTER COLUMN brain_dump_id DROP NOT NULL;

-- 3. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_daily_plans_user_date ON daily_plans(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_plan_sentences_daily_plan ON plan_sentences(daily_plan_id, display_order);
