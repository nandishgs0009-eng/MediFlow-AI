-- Create patient_profiles table for detailed medical information
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  age INTEGER,
  weight DECIMAL(5,2), -- Weight in kg
  height DECIMAL(5,2), -- Height in cm
  blood_type TEXT,
  medical_condition TEXT,
  allergies TEXT[], -- Array of allergies
  medical_history TEXT[], -- Array of medical history items
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_patient_profiles_updated_at
    BEFORE UPDATE ON public.patient_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_profiles
CREATE POLICY "Users can view own patient profile"
  ON public.patient_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patient profile"
  ON public.patient_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patient profile"
  ON public.patient_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all patient profiles"
  ON public.patient_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for medicine_recommendations
CREATE POLICY "Users can view own medicine recommendations"
  ON public.medicine_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medicine recommendations"
  ON public.medicine_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medicine recommendations"
  ON public.medicine_recommendations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all medicine recommendations"
  ON public.medicine_recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for treatment_analytics
CREATE POLICY "Users can view own treatment analytics"
  ON public.treatment_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own treatment analytics"
  ON public.treatment_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own treatment analytics"
  ON public.treatment_analytics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all treatment analytics"
  ON public.treatment_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_patient_profiles_user_id ON public.patient_profiles(user_id);
CREATE INDEX idx_medicine_recommendations_user_id ON public.medicine_recommendations(user_id);
CREATE INDEX idx_medicine_recommendations_treatment_id ON public.medicine_recommendations(treatment_id);
CREATE INDEX idx_treatment_analytics_user_id ON public.treatment_analytics(user_id);
CREATE INDEX idx_treatment_analytics_treatment_id ON public.treatment_analytics(treatment_id);