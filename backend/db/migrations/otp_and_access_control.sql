-- 1. CREATE OTP TABLE
CREATE TABLE IF NOT EXISTS otp_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at timestamptz NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at timestamptz DEFAULT now()
);

-- 2. ADD INDEX FOR OTP
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications (email);

-- 3. UPDATE APPLICATIONS TABLE
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS last_status_updated_at timestamptz DEFAULT now();

-- 4. CLEANUP OLD OTPs (Optional helper)
-- DELETE FROM otp_verifications WHERE expires_at < now();
