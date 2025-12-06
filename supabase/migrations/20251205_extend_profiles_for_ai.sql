-- Add medical information fields to the existing profiles table
-- This extends the profiles table to include patient medical data for AI recommendations

-- Add medical information columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2); -- Weight in kg
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height DECIMAL(5,2); -- Height in cm
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blood_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medical_condition TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allergies TEXT[]; -- Array of allergies
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medical_history TEXT[]; -- Array of medical history items
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- Create medicine_recommendations table to store AI recommendations
CREATE TABLE IF NOT EXISTS public.medicine_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  treatment_id UUID REFERENCES public.treatments(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  instructions TEXT,
  category TEXT,
  confidence_score DECIMAL(5,2), -- Confidence percentage (0-100)
  reasoning TEXT,
  side_effects TEXT[],
  interactions TEXT[],
  contraindications TEXT[],
  is_accepted BOOLEAN DEFAULT FALSE,
  is_rejected BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,
  recommended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create treatment_analytics table for learning and improvement
CREATE TABLE IF NOT EXISTS public.treatment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  treatment_id UUID REFERENCES public.treatments(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES public.medicines(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES public.medicine_recommendations(id) ON DELETE SET NULL,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  side_effects_experienced TEXT[],
  adherence_percentage DECIMAL(5,2), -- 0-100%
  treatment_outcome TEXT,
  patient_feedback TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS for new tables
ALTER TABLE public.medicine_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medicine_recommendations
CREATE POLICY IF NOT EXISTS "Users can view own medicine recommendations"
  ON public.medicine_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own medicine recommendations"
  ON public.medicine_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own medicine recommendations"
  ON public.medicine_recommendations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can view all medicine recommendations"
  ON public.medicine_recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for treatment_analytics
CREATE POLICY IF NOT EXISTS "Users can view own treatment analytics"
  ON public.treatment_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own treatment analytics"
  ON public.treatment_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own treatment analytics"
  ON public.treatment_analytics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can view all treatment analytics"
  ON public.treatment_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_medicine_recommendations_user_id ON public.medicine_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_medicine_recommendations_treatment_id ON public.medicine_recommendations(treatment_id);
CREATE INDEX IF NOT EXISTS idx_treatment_analytics_user_id ON public.treatment_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_treatment_analytics_treatment_id ON public.treatment_analytics(treatment_id);

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.age IS 'Patient age for medication dosing calculations';
COMMENT ON COLUMN public.profiles.weight IS 'Patient weight in kilograms for dosing calculations';
COMMENT ON COLUMN public.profiles.height IS 'Patient height in centimeters';
COMMENT ON COLUMN public.profiles.blood_type IS 'Patient blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)';
COMMENT ON COLUMN public.profiles.medical_condition IS 'Primary medical condition or diagnosis';
COMMENT ON COLUMN public.profiles.allergies IS 'Array of known allergies and sensitivities';
COMMENT ON COLUMN public.profiles.medical_history IS 'Array of past medical conditions and treatments';
COMMENT ON COLUMN public.profiles.emergency_contact_name IS 'Emergency contact person full name';
COMMENT ON COLUMN public.profiles.emergency_contact_phone IS 'Emergency contact phone number';

COMMENT ON TABLE public.medicine_recommendations IS 'AI-generated medicine recommendations for treatments';
COMMENT ON TABLE public.treatment_analytics IS 'Patient feedback and treatment effectiveness data for AI learning';