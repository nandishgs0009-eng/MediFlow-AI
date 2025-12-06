import { useState, useCallback } from 'react';
import { MedicineRecommendation, getMedicineRecommendations } from '@/services/medicineRecommendations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RecommendationState {
  recommendations: MedicineRecommendation[];
  loading: boolean;
  error: string | null;
}

export interface SavedRecommendation {
  id: string;
  medicine_name: string;
  generic_name: string | null;
  dosage: string;
  frequency: string;
  duration: string | null;
  instructions: string | null;
  category: string | null;
  confidence_score: number | null;
  reasoning: string | null;
  side_effects: string[] | null;
  interactions: string[] | null;
  contraindications: string[] | null;
  is_accepted: boolean;
  is_rejected: boolean;
  rejection_reason: string | null;
  recommended_at: string;
  accepted_at: string | null;
}

export function useAIRecommendations() {
  const [state, setState] = useState<RecommendationState>({
    recommendations: [],
    loading: false,
    error: null
  });
  const { toast } = useToast();

  /**
   * Get AI-generated medicine recommendations for a treatment
   */
  const getRecommendations = useCallback(async (
    treatmentName: string,
    treatmentDescription: string,
    userId: string,
    condition?: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const recommendations = await getMedicineRecommendations(
        treatmentName,
        treatmentDescription || '', // Ensure description is never undefined
        userId,
        condition // This is now optional - will use treatmentName if not provided
      );
      
      setState(prev => ({
        ...prev,
        recommendations,
        loading: false
      }));
      
      return recommendations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get recommendations';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return [];
    }
  }, [toast]);

  /**
   * Save AI recommendations to database
   */
  const saveRecommendations = useCallback(async (
    recommendations: MedicineRecommendation[],
    userId: string,
    treatmentId: string
  ) => {
    try {
      const recommendationsData = recommendations.map(rec => ({
        user_id: userId,
        treatment_id: treatmentId,
        medicine_name: rec.name,
        generic_name: rec.genericName,
        dosage: rec.dosage,
        frequency: rec.frequency,
        duration: rec.duration,
        instructions: rec.instructions,
        category: rec.category,
        confidence_score: rec.confidence,
        reasoning: rec.reasoning,
        side_effects: rec.sideEffects,
        interactions: rec.interactions,
        contraindications: rec.contraindications
      }));

      const { error } = await (supabase as any)
        .from('medicine_recommendations')
        .insert(recommendationsData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recommendations saved successfully"
      });
    } catch (error) {
      console.error('Error saving recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to save recommendations",
        variant: "destructive"
      });
    }
  }, [toast]);

  /**
   * Accept a recommendation and add it as a medicine to treatment
   */
  const acceptRecommendation = useCallback(async (
    recommendationId: string,
    treatmentId: string,
    recommendation: MedicineRecommendation
  ) => {
    try {
      // Start a transaction
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Update recommendation status
      const { error: updateError } = await (supabase as any)
        .from('medicine_recommendations')
        .update({
          is_accepted: true,
          accepted_at: new Date().toISOString()
        })
        .eq('id', recommendationId);

      if (updateError) throw updateError;

      // Add medicine to treatment
      const { error: medicineError } = await supabase
        .from('medicines')
        .insert({
          treatment_id: treatmentId,
          name: recommendation.name,
          dosage: recommendation.dosage,
          frequency: recommendation.frequency,
          schedule_time: '09:00', // Default time, user can modify
          instructions: recommendation.instructions,
          stock: 30 // Default stock
        });

      if (medicineError) throw medicineError;

      toast({
        title: "Success",
        description: `${recommendation.name} has been added to your treatment`
      });

      return true;
    } catch (error) {
      console.error('Error accepting recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to accept recommendation",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  /**
   * Reject a recommendation with reason
   */
  const rejectRecommendation = useCallback(async (
    recommendationId: string,
    reason: string
  ) => {
    try {
      const { error } = await (supabase as any)
        .from('medicine_recommendations')
        .update({
          is_rejected: true,
          rejection_reason: reason
        })
        .eq('id', recommendationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recommendation rejected"
      });

      return true;
    } catch (error) {
      console.error('Error rejecting recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to reject recommendation",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  /**
   * Get saved recommendations for a treatment
   */
  const getSavedRecommendations = useCallback(async (
    treatmentId: string
  ): Promise<SavedRecommendation[]> => {
    try {
      const { data, error } = await (supabase as any)
        .from('medicine_recommendations')
        .select('*')
        .eq('treatment_id', treatmentId)
        .order('confidence_score', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching saved recommendations:', error);
      return [];
    }
  }, []);

  /**
   * Record treatment analytics for learning
   */
  const recordAnalytics = useCallback(async (
    treatmentId: string,
    medicineId: string,
    analytics: {
      effectiveness_rating: number;
      side_effects_experienced?: string[];
      adherence_percentage?: number;
      treatment_outcome?: string;
      patient_feedback?: string;
    }
  ) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await (supabase as any)
        .from('treatment_analytics')
        .insert({
          user_id: user.user.id,
          treatment_id: treatmentId,
          medicine_id: medicineId,
          effectiveness_rating: analytics.effectiveness_rating,
          side_effects_experienced: analytics.side_effects_experienced,
          adherence_percentage: analytics.adherence_percentage,
          treatment_outcome: analytics.treatment_outcome,
          patient_feedback: analytics.patient_feedback
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Thank you for your feedback!"
      });
    } catch (error) {
      console.error('Error recording analytics:', error);
      toast({
        title: "Error",
        description: "Failed to record feedback",
        variant: "destructive"
      });
    }
  }, [toast]);

  /**
   * Update patient profile for better recommendations
   */
  const updatePatientProfile = useCallback(async (
    userId: string,
    profileData: {
      age?: number;
      weight?: number;
      height?: number;
      blood_type?: string;
      medical_condition?: string;
      allergies?: string[];
      medical_history?: string[];
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
    }
  ) => {
    try {
      // Convert arrays to strings for the profiles table structure
      const updateData = {
        age: profileData.age,
        weight: profileData.weight,
        height: profileData.height,
        blood_type: profileData.blood_type,
        medical_conditions: profileData.medical_condition,
        allergies: profileData.allergies ? profileData.allergies.join(',') : null,
        emergency_contact_name: profileData.emergency_contact_name,
        emergency_contact_phone: profileData.emergency_contact_phone,
      };

      // Update the profiles table with medical information
      const { error } = await supabase
        .from('profiles')
        .update(updateData as any)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

      return true;
    } catch (error) {
      console.error('Error updating patient profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  /**
   * Edit an existing medicine in treatment
   */
  const editMedicine = useCallback(async (
    medicineId: string,
    updates: {
      name?: string;
      dosage?: string;
      frequency?: string;
      instructions?: string;
      stock?: number;
    }
  ) => {
    try {
      const { error } = await supabase
        .from('medicines')
        .update(updates)
        .eq('id', medicineId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medicine updated successfully"
      });

      return true;
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast({
        title: "Error",
        description: "Failed to update medicine",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return {
    state,
    getRecommendations,
    saveRecommendations,
    acceptRecommendation,
    rejectRecommendation,
    getSavedRecommendations,
    recordAnalytics,
    updatePatientProfile,
    editMedicine
  };
}