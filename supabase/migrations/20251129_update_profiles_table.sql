-- Update existing profiles table to include patient information
-- This migration adds patient-specific fields to the profiles table

-- Add new columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height DECIMAL(5,2); -- in cm
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2); -- in kg
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_medications_notes TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Update RLS policies if needed (keeping existing ones intact, adding new)
-- Assuming profiles table already has RLS enabled

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add comment to table explaining the new fields
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN public.profiles.gender IS 'User gender (male, female, other, prefer_not_to_say)';
COMMENT ON COLUMN public.profiles.blood_type IS 'User blood type (O+, O-, A+, A-, B+, B-, AB+, AB-)';
COMMENT ON COLUMN public.profiles.height IS 'User height in centimeters';
COMMENT ON COLUMN public.profiles.weight IS 'User weight in kilograms';
COMMENT ON COLUMN public.profiles.emergency_contact_name IS 'Emergency contact person name';
COMMENT ON COLUMN public.profiles.emergency_contact_phone IS 'Emergency contact person phone';
COMMENT ON COLUMN public.profiles.medical_conditions IS 'User medical conditions and history';
COMMENT ON COLUMN public.profiles.allergies IS 'User known allergies';
COMMENT ON COLUMN public.profiles.current_medications_notes IS 'Additional notes about current medications';
COMMENT ON COLUMN public.profiles.address IS 'User street address';
COMMENT ON COLUMN public.profiles.city IS 'User city';
COMMENT ON COLUMN public.profiles.state IS 'User state or province';
COMMENT ON COLUMN public.profiles.zip_code IS 'User zip or postal code';
