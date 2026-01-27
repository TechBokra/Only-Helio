
-- Add projectType column to Project table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Project' AND column_name = 'projectType') THEN
        ALTER TABLE "Project" ADD COLUMN "projectType" TEXT;
    END IF;
END $$;
