-- Adiciona data de fim da mentoria pra alunos
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mentoria_end_date DATE;

-- Index pra queries do AuthContext que checam expiração
CREATE INDEX IF NOT EXISTS idx_profiles_mentoria_end_date
  ON profiles(mentoria_end_date)
  WHERE mentoria_end_date IS NOT NULL;
