-- 1. UPDATE application_status ENUM
-- Note: 'nda_pending' already exists in our schema. Adding 'joining_form_pending'.
-- ALTER TYPE cannot run inside a transaction in Postgres, so we run it separately if needed.
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'joining_form_pending';

-- 2. UPDATE applications TABLE
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS joining_form_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS nda_completed BOOLEAN DEFAULT FALSE;

-- 3. ADD PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_apps_onboarding_check 
ON applications (joining_form_completed, nda_completed);

-- 4. ENFORCE UNIQUE RECORDS (One per application)
-- Ensure Joining Forms are unique per application
ALTER TABLE joining_forms 
ADD CONSTRAINT unique_application_joining_form UNIQUE (application_id);

-- Ensure NDA Records are unique per application
ALTER TABLE nda_records 
ADD CONSTRAINT unique_application_nda_record UNIQUE (application_id);

-- 5. VALIDATION LOGIC DOCUMENTATION (Internal Reference)
/*
  STRICT ONBOARDING FLOW LOGIC:
  -----------------------------
  1. HR Selects Candidate:
     UPDATE applications SET status = 'joining_form_pending' WHERE id = :id;

  2. Candidate Submits Joining Form:
     UPDATE applications SET joining_form_completed = TRUE, status = 'nda_pending' WHERE id = :id;

  3. Candidate Signs NDA:
     UPDATE applications SET nda_completed = TRUE WHERE id = :id;
     
  4. Final Onboarding Trigger:
     UPDATE applications 
     SET status = 'onboarded', completed_at = now()
     WHERE id = :id AND joining_form_completed = TRUE AND nda_completed = TRUE;
*/
