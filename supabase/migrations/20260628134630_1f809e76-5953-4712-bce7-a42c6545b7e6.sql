
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  topic TEXT NOT NULL,
  card_id TEXT NOT NULL,
  card_title TEXT NOT NULL,
  card_category TEXT NOT NULL,
  student_steps JSONB NOT NULL,
  wrap_up_protocol TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'local',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own activity logs"
  ON public.activity_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX activity_logs_user_created_idx ON public.activity_logs (user_id, created_at DESC);
