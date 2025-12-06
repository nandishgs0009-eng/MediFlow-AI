import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pill,
  Plus,
  Bell,
  Home,
  Stethoscope,
  FileText,
  Menu,
  X,
  Clock,
  LogOut,
  Settings,
  Trash2,
  Loader2,
  CheckCircle2,
  ChevronDown,
  User,
  Heart,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAIRecommendations } from "@/hooks/use-ai-recommendations";
import { AIRecommendationDialog } from "@/components/AIRecommendationDialog";
import { MedicineRecommendation } from "@/services/medicineRecommendations";
import "@/styles/mobile-responsive.css";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  schedule_time: string;
  instructions?: string;
  stock?: number;
  treatment_id: string;
}

interface Treatment {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  medicines: Medicine[];
  start_date: string;
  end_date?: string;
  patient_id: string;
}

const MyTreatments = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { getRecommendations } = useAIRecommendations();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTreatmentOpen, setAddTreatmentOpen] = useState(false);
  const [addMedicineOpen, setAddMedicineOpen] = useState(false);
  const [editMedicineOpen, setEditMedicineOpen] = useState(false);
  const [selectedMedicineForEdit, setSelectedMedicineForEdit] = useState<any>(null);
  const [showMedicineRecommendations, setShowMedicineRecommendations] = useState(false);
  const [selectedTreatmentForMedicine, setSelectedTreatmentForMedicine] = useState(null);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [medicineRecommendations, setMedicineRecommendations] = useState<MedicineRecommendation[]>([]);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [displayTime, setDisplayTime] = useState(new Date());
  
  const [treatmentForm, setTreatmentForm] = useState({
    name: "",
    description: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    status: "active" as "active" | "inactive",
  });

  const [medicineForm, setMedicineForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    schedule_time: "",
    instructions: "",
    stock: "",
    times: [] as string[], // Array to store multiple times
  });

  const [editMedicineForm, setEditMedicineForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    schedule_time: "",
    instructions: "",
    stock: "",
  });

  const [medicationLogOpen, setMedicationLogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [medicationTaken, setMedicationTaken] = useState<{
    [key: string]: boolean;
  }>({});
  const [intakeLogs, setIntakeLogs] = useState<any[]>([]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Play alert sound
  const playAlertSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Check if it's time for a medication and show reminder
  const checkMedicationTime = (medicine: Medicine) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [scheduleHour, scheduleMin] = medicine.schedule_time.split(":").map(Number);
    const scheduleMinutes = scheduleHour * 60 + scheduleMin;

    // Check if current time is within 5 minutes of scheduled time
    if (Math.abs(currentMinutes - scheduleMinutes) <= 5) {
      return true;
    }
    return false;
  };

  // Check if it's time for any added medicine times (for newly added medicines)
  const checkMedicineTimesForAlert = (times: string[]) => {
    if (!times || times.length === 0) return false;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    return times.some((time) => {
      if (!time) return false;
      const [hour, min] = time.split(":").map(Number);
      const timeMinutes = hour * 60 + min;
      return Math.abs(currentMinutes - timeMinutes) <= 5;
    });
  };

  // Handle medication confirmation
  const handleMedicationConfirm = async (medicine: Medicine) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    // Check if medicine has stock
    if (medicine.stock === null || medicine.stock === undefined || medicine.stock === 0) {
      toast({
        title: "⚠️ Out of Stock",
        description: `${medicine.name} has no stock available. Please add stock before marking as taken.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if medicine has already been taken today based on frequency
      const today = new Date().toISOString().split("T")[0];
      const { data: todayLogs, error: logsError } = await supabase
        .from("intake_logs")
        .select("*")
        .eq("medicine_id", medicine.id)
        .eq("user_id", user.id)
        .gte("taken_time", `${today}T00:00:00`)
        .lte("taken_time", `${today}T23:59:59`);

      if (!logsError && todayLogs && todayLogs.length > 0) {
        // Medicine has already been taken today
        const frequencyType = medicine.frequency.toLowerCase();
        
        if (frequencyType.includes("once")) {
          toast({
            title: "Already Taken",
            description: `${medicine.name} has already been taken once today. This medicine is for once daily use.`,
            variant: "destructive",
          });
          return;
        }
        
        // For twice or more daily, check if already taken at this scheduled time
        const timesLoggedToday = todayLogs.length;
        const dailyDoses = frequencyType.includes("twice") ? 2 : frequencyType.includes("three") ? 3 : 4;
        
        if (timesLoggedToday >= dailyDoses) {
          toast({
            title: "Already Taken",
            description: `${medicine.name} has already been taken ${timesLoggedToday} times today. Maximum daily doses: ${dailyDoses}`,
            variant: "destructive",
          });
          return;
        }
      }

      // Record intake log with proper format
      const now = new Date();
      const takenTime = now.toISOString();
      
      // Convert TIME (HH:MM:SS) to today's TIMESTAMP by creating a date from schedule_time
      const todayAtScheduledTime = new Date();
      const [hours, minutes, seconds] = medicine.schedule_time.split(':');
      todayAtScheduledTime.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || '0'), 0);
      const scheduledTimestamp = todayAtScheduledTime.toISOString();

      console.log("Attempting to log medication:", {
        medicine_id: medicine.id,
        user_id: user.id,
        scheduled_time: scheduledTimestamp,
        taken_time: takenTime,
        status: "taken",
      });

      const { data, error } = await supabase.from("intake_logs").insert({
        medicine_id: medicine.id,
        user_id: user.id,
        scheduled_time: scheduledTimestamp,
        taken_time: takenTime,
        status: "taken" as any,
        notes: null,
      });

      if (error) {
        console.error("Supabase insert error:", error);
        throw new Error(error.message);
      }

      console.log("Intake log inserted successfully:", data);

      // Record analytics for medication adherence
      try {
        // Calculate adherence percentage based on recent intake history
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { data: weeklyLogs } = await supabase
          .from("intake_logs")
          .select("*")
          .eq("medicine_id", medicine.id)
          .eq("user_id", user.id)
          .gte("taken_time", oneWeekAgo.toISOString());
        
        // Estimate expected doses (rough calculation)
        const frequency = medicine.frequency.toLowerCase();
        let expectedDosesPerDay = 1;
        if (frequency.includes('twice')) expectedDosesPerDay = 2;
        else if (frequency.includes('three')) expectedDosesPerDay = 3;
        else if (frequency.includes('four')) expectedDosesPerDay = 4;
        
        const expectedWeeklyDoses = expectedDosesPerDay * 7;
        const actualDoses = (weeklyLogs || []).length;
        const adherencePercentage = Math.min(100, Math.round((actualDoses / expectedWeeklyDoses) * 100));
        
        await supabase
          .from('treatment_analytics')
          .insert({
            user_id: user.id,
            treatment_id: medicine.treatment_id,
            medicine_id: medicine.id,
            effectiveness_rating: 4, // Default good rating for taken medication
            adherence_percentage: adherencePercentage,
            treatment_outcome: 'medication_taken',
            patient_feedback: `Patient took ${medicine.name} as scheduled`
          });
      } catch (analyticsError) {
        console.error('Error recording medication analytics:', analyticsError);
        // Don't fail the main operation if analytics fail
      }

      // Save confirmation notification
      try {
        await supabase.from("notifications").insert({
          user_id: user.id,
          medicine_id: medicine.id,
          title: `${medicine.name} taken`,
          message: `You confirmed taking ${medicine.name} (${medicine.dosage}) at ${new Date().toLocaleTimeString()}`,
          type: "info",
          scheduled_for: takenTime,
          read: false,
        });
      } catch (notifError) {
        console.error("Error saving confirmation notification:", notifError);
      }

      // Update stock
      if (medicine.stock !== null && medicine.stock > 0) {
        const { error: updateError } = await supabase
          .from("medicines")
          .update({ stock: medicine.stock - 1 })
          .eq("id", medicine.id);

        if (updateError) {
          console.error("Stock update error:", updateError);
        }
      }

      // Mark as taken
      setMedicationTaken((prev) => ({
        ...prev,
        [medicine.id]: true,
      }));

      // Add to intake logs
      setIntakeLogs((prev) => [
        ...prev,
        {
          medicine_id: medicine.id,
          user_id: user.id,
          scheduled_time: scheduledTimestamp,
          taken_time: takenTime,
          status: "taken",
        },
      ]);

      setMedicationLogOpen(false);
      setSelectedMedicine(null);

      // Play success sound
      playAlertSound();

      toast({
        title: "Success",
        description: `${medicine.name} marked as taken`,
      });

      // Refresh medicines to update stock
      // Add small delay to ensure database write is complete
      setTimeout(() => {
        fetchTreatments();
      }, 500);
    } catch (error) {
      console.error("Error logging medication:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to log medication";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Effect to populate edit form when a medicine is selected for editing
  useEffect(() => {
    if (selectedMedicineForEdit) {
      setEditMedicineForm({
        name: selectedMedicineForEdit.name || "",
        dosage: selectedMedicineForEdit.dosage || "",
        frequency: selectedMedicineForEdit.frequency || "",
        schedule_time: selectedMedicineForEdit.schedule_time || "",
        instructions: selectedMedicineForEdit.instructions || "",
        stock: selectedMedicineForEdit.stock?.toString() || "",
      });
    }
  }, [selectedMedicineForEdit]);

  // Check for due medications every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for due medications every minute
  useEffect(() => {
    const interval = setInterval(async () => {
      treatments.forEach(async (treatment) => {
        treatment.medicines.forEach(async (medicine) => {
          // Only show alert if not already taken today and has stock
          if (!medicationTaken[medicine.id] && checkMedicationTime(medicine) && (medicine.stock !== null && medicine.stock !== undefined && medicine.stock > 0)) {
            setSelectedMedicine(medicine);
            setMedicationLogOpen(true);
            playAlertSound();

            // Save notification to database
            try {
              await supabase.from("notifications").insert({
                user_id: user?.id,
                medicine_id: medicine.id,
                title: `Time to take ${medicine.name}`,
                message: `It's time to take ${medicine.name} (${medicine.dosage}). ${medicine.instructions ? 'Instructions: ' + medicine.instructions : ''}`,
                type: "reminder",
                scheduled_for: new Date().toISOString(),
                read: false,
              });
            } catch (error) {
              console.error("Error saving notification:", error);
            }
          }
        });
      });
    }, 60000); // Check every minute

    // Also run the check immediately when component mounts or dependencies change
    treatments.forEach(async (treatment) => {
      treatment.medicines.forEach(async (medicine) => {
        if (!medicationTaken[medicine.id] && checkMedicationTime(medicine) && (medicine.stock !== null && medicine.stock !== undefined && medicine.stock > 0)) {
          setSelectedMedicine(medicine);
          setMedicationLogOpen(true);
          playAlertSound();

          // Save notification to database
          try {
            await supabase.from("notifications").insert({
              user_id: user?.id,
              medicine_id: medicine.id,
              title: `Time to take ${medicine.name}`,
              message: `It's time to take ${medicine.name} (${medicine.dosage}). ${medicine.instructions ? 'Instructions: ' + medicine.instructions : ''}`,
              type: "reminder",
              scheduled_for: new Date().toISOString(),
              read: false,
            });
          } catch (error) {
            console.error("Error saving notification:", error);
          }
        }
      });
    });

    return () => clearInterval(interval);
  }, [treatments, medicationTaken, user?.id]);

  // Fetch treatments and medicines
  useEffect(() => {
    if (user?.id) {
      console.log('useEffect triggered - fetching treatments');
      fetchTreatments();
      
      // Safety timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log('Timeout triggered - setting loading to false');
        setLoading(false);
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timeout);
    } else {
      console.log('No user ID, setting loading to false');
      setLoading(false);
    }
  }, [user?.id]);

  // Refresh data when user returns to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        // Page became visible, refresh the data
        fetchTreatments();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user?.id]);

  const fetchTreatments = async () => {
    try {
      console.log('Fetching treatments for user:', user?.id);
      setLoading(true);
      const { data, error } = await supabase
        .from("treatments")
        .select("*")
        .eq("patient_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching treatments:', error);
        throw error;
      }

      console.log('Treatments data:', data);

      // Fetch medicines for each treatment
      const treatmentsWithMedicines = await Promise.all(
        (data || []).map(async (treatment) => {
          const { data: medicines, error: medicinesError } = await supabase
            .from("medicines")
            .select("*")
            .eq("treatment_id", treatment.id);

          if (medicinesError) {
            console.error('Error fetching medicines for treatment:', treatment.id, medicinesError);
            // Don't throw here, just return treatment without medicines
            return {
              ...treatment,
              medicines: [],
            };
          }

          return {
            ...treatment,
            medicines: medicines || [],
          };
        })
      );

      console.log('Treatments with medicines:', treatmentsWithMedicines);
      setTreatments(treatmentsWithMedicines);

      // Fetch intake logs for today
      const today = new Date().toISOString().split("T")[0];
      const { data: logs, error: logsError } = await supabase
        .from("intake_logs")
        .select("*")
        .eq("user_id", user?.id)
        .gte("taken_time", `${today}T00:00:00`)
        .lte("taken_time", `${today}T23:59:59`);

      if (!logsError && logs) {
        setIntakeLogs(logs);
        // Mark medicines as taken based on logs
        const takenMedicines: { [key: string]: boolean } = {};
        
        logs.forEach((log) => {
          if (log.status === "taken") {
            takenMedicines[log.medicine_id] = true;
          }
        });
        
        setMedicationTaken(takenMedicines);
      }
    } catch (error) {
      console.error("Error fetching treatments:", error);
      toast({
        title: "Error",
        description: "Failed to load treatments",
        variant: "destructive",
      });
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const handleAddTreatment = async () => {
    if (!user?.id || !treatmentForm.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a treatment name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("treatments")
        .insert({
          name: treatmentForm.name,
          description: treatmentForm.description || null,
          start_date: treatmentForm.start_date,
          end_date: treatmentForm.end_date || null,
          status: treatmentForm.status,
          patient_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setTreatments([{ ...data, medicines: [] } as Treatment, ...treatments]);
      
      // Record analytics for new treatment creation
      try {
        await supabase
          .from('treatment_analytics')
          .insert({
            user_id: user.id,
            treatment_id: data.id,
            effectiveness_rating: 3, // Neutral rating for new treatment
            treatment_outcome: 'treatment_created',
            patient_feedback: `New treatment created: ${data.name}`,
            adherence_percentage: 100 // Start with optimistic adherence
          });
      } catch (analyticsError) {
        console.error('Error recording treatment creation analytics:', analyticsError);
        // Don't fail the main operation
      }
      
      setTreatmentForm({
        name: "",
        description: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        status: "active",
      });
      setAddTreatmentOpen(false);
      toast({
        title: "Success",
        description: "Treatment added successfully",
      });
    } catch (error) {
      console.error("Error adding treatment:", error);
      toast({
        title: "Error",
        description: "Failed to add treatment",
        variant: "destructive",
      });
    }
  };

  // Handle AI recommendation acceptance
  const handleAcceptAIRecommendation = async (recommendation: MedicineRecommendation, treatmentId?: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    try {
      // If no treatmentId provided, we're adding to a new treatment
      let targetTreatmentId = treatmentId;
      
      if (!targetTreatmentId) {
        // First create the treatment
        const treatmentData = await supabase
          .from("treatments")
          .insert({
            name: treatmentForm.name || "New Treatment",
            description: treatmentForm.description || null,
            start_date: treatmentForm.start_date,
            end_date: treatmentForm.end_date || null,
            status: treatmentForm.status,
            patient_id: user.id,
          })
          .select()
          .single();

        if (treatmentData.error) throw treatmentData.error;
        targetTreatmentId = treatmentData.data.id;
      }

      // Add the recommended medicine to the treatment
      const { error: medicineError } = await supabase
        .from("medicines")
        .insert({
          treatment_id: targetTreatmentId,
          name: recommendation.name,
          dosage: recommendation.dosage,
          frequency: recommendation.frequency,
          schedule_time: "09:00", // Default time, user can modify later
          instructions: recommendation.instructions,
          stock: 30 // Default stock
        });

      if (medicineError) throw medicineError;

      // Refresh treatments
      await fetchTreatments();
      
      // Reset form if we created a new treatment
      if (!treatmentId) {
        setTreatmentForm({
          name: "",
          description: "",
          start_date: new Date().toISOString().split("T")[0],
          end_date: "",
          status: "active",
        });
        setAddTreatmentOpen(false);
      }

      toast({
        title: "Success",
        description: `${recommendation.name} has been added to your treatment`,
      });

    } catch (error) {
      console.error("Error accepting AI recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to add recommended medicine",
        variant: "destructive",
      });
    }
  };

  // Function to create sample analytics data for testing
  const createSampleAnalytics = async () => {
    if (!user?.id) return;
    
    try {
      // Get existing treatments
      const { data: userTreatments } = await supabase
        .from('treatments')
        .select('id, name')
        .eq('patient_id', user.id)
        .limit(3);
      
      if (!userTreatments || userTreatments.length === 0) {
        toast({
          title: "Info",
          description: "Create some treatments first to generate sample analytics",
          variant: "default"
        });
        return;
      }
      
      // Create sample analytics for existing treatments
      const sampleAnalytics = [];
      
      for (const treatment of userTreatments) {
        // Add various analytics entries
        sampleAnalytics.push(
          {
            user_id: user.id,
            treatment_id: treatment.id,
            effectiveness_rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
            adherence_percentage: Math.floor(Math.random() * 30) + 70, // 70-100%
            treatment_outcome: 'treatment_ongoing',
            patient_feedback: `Treatment ${treatment.name} showing good progress`
          },
          {
            user_id: user.id,
            treatment_id: treatment.id,
            effectiveness_rating: Math.floor(Math.random() * 2) + 4, // 4-5 rating
            adherence_percentage: Math.floor(Math.random() * 20) + 80, // 80-100%
            treatment_outcome: 'improvement_noted',
            patient_feedback: `Patient reports feeling better with ${treatment.name}`
          }
        );
      }
      
      const { error } = await supabase
        .from('treatment_analytics')
        .insert(sampleAnalytics);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Created ${sampleAnalytics.length} sample analytics entries`,
      });
    } catch (error) {
      console.error('Error creating sample analytics:', error);
      toast({
        title: "Error",
        description: "Failed to create sample analytics",
        variant: "destructive"
      });
    }
  };

  const getMedicineRecommendationsForTreatment = async (treatment: any) => {
    if (!user?.id) return;
    
    setRecommendationsLoading(true);
    setSelectedTreatmentForMedicine(treatment);
    setShowMedicineRecommendations(true);
    
    try {
      const recommendations = await getRecommendations(
        treatment.name,
        treatment.description || '',
        user.id
      );
      
      // Save recommendations to database for tracking
      if (recommendations && recommendations.length > 0) {
        try {
          const recommendationsData = recommendations.map(rec => ({
            user_id: user.id,
            treatment_id: treatment.id,
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
            contraindications: rec.contraindications,
            recommended_at: new Date().toISOString()
          }));

          await supabase
            .from('medicine_recommendations')
            .insert(recommendationsData);
        } catch (saveError) {
          console.error('Error saving recommendations:', saveError);
          // Continue even if saving fails
        }
      }
      
      setMedicineRecommendations(recommendations);
      
      // If no recommendations found, show manual form
      if (!recommendations || recommendations.length === 0) {
        setShowMedicineRecommendations(false);
        setSelectedTreatmentId(treatment.id);
        setAddMedicineOpen(true);
        toast({
          title: "No recommendations found",
          description: "Showing manual medicine entry form",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error getting medicine recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load medicine recommendations",
        variant: "destructive"
      });
      // Show manual add form as fallback
      setShowMedicineRecommendations(false);
      setSelectedTreatmentId(treatment.id);
      setAddMedicineOpen(true);
    } finally {
      setRecommendationsLoading(false);
    }
  };
  
  const addRecommendedMedicine = async (recommendation: MedicineRecommendation) => {
    if (!selectedTreatmentForMedicine) return;
    
    try {
      setLoading(true);
      
      // Parse frequency to determine times per day
      const times = ['09:00']; // Default morning time
      if (recommendation.frequency.toLowerCase().includes('twice')) {
        times.push('21:00'); // Add evening dose
      } else if (recommendation.frequency.toLowerCase().includes('three')) {
        times.push('14:00', '21:00'); // Add afternoon and evening
      }
      
      // Create medicine entries for each time
      const medicinePromises = times.map((time) =>
        supabase
          .from("medicines")
          .insert({
            name: recommendation.name,
            dosage: recommendation.dosage,
            frequency: recommendation.frequency,
            schedule_time: time,
            instructions: recommendation.instructions || null,
            stock: 30, // Default stock
            treatment_id: selectedTreatmentForMedicine.id,
          })
          .select()
          .single()
      );

      const results = await Promise.all(medicinePromises);
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error(errors[0].error.message);
      }

      const newMedicines = results.map((r) => r.data as Medicine);

      // Update treatments
      setTreatments(
        treatments.map((treatment) =>
          treatment.id === selectedTreatmentForMedicine.id
            ? { ...treatment, medicines: [...treatment.medicines, ...newMedicines] }
            : treatment
        )
      );

      // Record analytics for accepted recommendation
      try {
        await supabase
          .from('treatment_analytics')
          .insert({
            user_id: user.id,
            treatment_id: selectedTreatmentForMedicine.id,
            medicine_id: newMedicines[0]?.id, // Use first medicine ID
            effectiveness_rating: 5, // Default high rating for accepted recommendation
            treatment_outcome: 'recommendation_accepted',
            patient_feedback: `Patient accepted AI recommendation for ${recommendation.name}`,
            recommendation_id: null // We could link this if we stored the recommendation ID
          });
      } catch (analyticsError) {
        console.error('Error recording analytics:', analyticsError);
        // Don't fail the main operation if analytics fail
      }

      // Update recommendation status in database
      try {
        await supabase
          .from('medicine_recommendations')
          .update({
            is_accepted: true,
            accepted_at: new Date().toISOString()
          })
          .eq('treatment_id', selectedTreatmentForMedicine.id)
          .eq('medicine_name', recommendation.name)
          .eq('user_id', user.id);
      } catch (updateError) {
        console.error('Error updating recommendation status:', updateError);
        // Don't fail the main operation
      }

      setShowMedicineRecommendations(false);
      setSelectedTreatmentForMedicine(null);
      
      toast({
        title: "Success",
        description: `${recommendation.name} added to treatment`,
      });
    } catch (error) {
      console.error("Error adding recommended medicine:", error);
      toast({
        title: "Error",
        description: "Failed to add medicine",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async () => {
    if (!selectedTreatmentId || !medicineForm.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter medicine details",
        variant: "destructive",
      });
      return;
    }

    if (medicineForm.times.length === 0 || medicineForm.times.some(t => !t)) {
      toast({
        title: "Error",
        description: "Please add at least one valid time",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a medicine entry for each time slot (for multiple daily doses)
      const medicinePromises = medicineForm.times.map((time) =>
        supabase
          .from("medicines")
          .insert({
            name: medicineForm.name,
            dosage: medicineForm.dosage,
            frequency: medicineForm.frequency,
            schedule_time: time, // Each entry has its own time
            instructions: medicineForm.instructions || null,
            stock: medicineForm.stock ? parseInt(medicineForm.stock) : null,
            treatment_id: selectedTreatmentId,
          })
          .select()
          .single()
      );

      const results = await Promise.all(medicinePromises);
      
      // Check if any insert failed
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error(errors[0].error.message);
      }

      // Get all the inserted medicines
      const newMedicines = results.map((r) => r.data as Medicine);

      // Update treatment with all new medicines
      setTreatments(
        treatments.map((treatment) =>
          treatment.id === selectedTreatmentId
            ? { ...treatment, medicines: [...treatment.medicines, ...newMedicines] }
            : treatment
        )
      );

      // Record analytics for manually added medicine
      try {
        await supabase
          .from('treatment_analytics')
          .insert({
            user_id: user.id,
            treatment_id: selectedTreatmentId,
            medicine_id: newMedicines[0]?.id,
            effectiveness_rating: 4, // Default rating for manual addition
            treatment_outcome: 'manual_medicine_added',
            patient_feedback: `Patient manually added ${medicineForm.name}`,
            adherence_percentage: 100 // Assume good adherence for new medicine
          });
      } catch (analyticsError) {
        console.error('Error recording analytics for manual medicine:', analyticsError);
        // Don't fail the main operation
      }

      setMedicineForm({
        name: "",
        dosage: "",
        frequency: "",
        schedule_time: "",
        instructions: "",
        stock: "",
        times: [],
      });
      setAddMedicineOpen(false);
      
      const timesText = medicineForm.times.length > 1 
        ? `${medicineForm.times.length} times daily` 
        : "daily";
      
      toast({
        title: "Success",
        description: `${medicineForm.name} added ${timesText}`,
      });
    } catch (error) {
      console.error("Error adding medicine:", error);
      toast({
        title: "Error",
        description: "Failed to add medicine",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMedicine = async () => {
    if (!selectedMedicineForEdit || !editMedicineForm.name.trim()) {
      toast({
        title: "Error",
        description: "Please fill in the medicine name",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from("medicines")
        .update({
          name: editMedicineForm.name.trim(),
          dosage: editMedicineForm.dosage.trim(),
          frequency: editMedicineForm.frequency,
          schedule_time: editMedicineForm.schedule_time,
          instructions: editMedicineForm.instructions.trim(),
          stock: editMedicineForm.stock ? parseInt(editMedicineForm.stock) : null,
        })
        .eq("id", selectedMedicineForEdit.id);

      if (error) throw error;

      // Update local state
      setTreatments(prev => prev.map(treatment => ({
        ...treatment,
        medicines: treatment.medicines.map(medicine => 
          medicine.id === selectedMedicineForEdit.id 
            ? { 
                ...medicine, 
                name: editMedicineForm.name.trim(),
                dosage: editMedicineForm.dosage.trim(),
                frequency: editMedicineForm.frequency,
                schedule_time: editMedicineForm.schedule_time,
                instructions: editMedicineForm.instructions.trim(),
                stock: editMedicineForm.stock ? parseInt(editMedicineForm.stock) : null,
              }
            : medicine
        )
      })));

      setEditMedicineOpen(false);
      setSelectedMedicineForEdit(null);
      setEditMedicineForm({
        name: "",
        dosage: "",
        frequency: "",
        schedule_time: "",
        instructions: "",
        stock: "",
      });

      toast({
        title: "Success",
        description: "Medicine updated successfully",
      });
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast({
        title: "Error",
        description: "Failed to update medicine",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTreatment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this treatment?")) return;

    try {
      const { error } = await supabase
        .from("treatments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setTreatments(treatments.filter((t) => t.id !== id));
      toast({
        title: "Success",
        description: "Treatment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting treatment:", error);
      toast({
        title: "Error",
        description: "Failed to delete treatment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMedicine = async (medicineId: string, treatmentId: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;

    try {
      const { error } = await supabase
        .from("medicines")
        .delete()
        .eq("id", medicineId);

      if (error) throw error;

      setTreatments(
        treatments.map((treatment) =>
          treatment.id === treatmentId
            ? {
                ...treatment,
                medicines: treatment.medicines.filter((m) => m.id !== medicineId),
              }
            : treatment
        )
      );
      toast({
        title: "Success",
        description: "Medicine deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting medicine:", error);
      toast({
        title: "Error",
        description: "Failed to delete medicine",
        variant: "destructive",
      });
    }
  };

  // Add authentication check
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading user session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} ${isMobile && !sidebarOpen ? '-translate-x-full' : ''} bg-card border-r border-border/50 transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-40`}>
        {/* Logo */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-3">
              <span className="font-bold text-lg">MediFlow</span>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <div className={`text-xs font-semibold text-muted-foreground ${sidebarOpen ? 'px-3 mb-3' : 'hidden'}`}>
            MAIN
          </div>
          
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors">
            <Home className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Dashboard</span>}
          </Link>

          <div className={`text-xs font-semibold text-muted-foreground ${sidebarOpen ? 'px-3 mt-6 mb-3' : 'hidden'}`}>
            MENU
          </div>

          <Link to="/mytreatments" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Stethoscope className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">My Treatments</span>}
          </Link>

          <Link to="/history" className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors">
            <Clock className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>History</span>}
          </Link>

          <Link to="/recovery-reports" className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors">
            <FileText className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Recovery Reports</span>}
          </Link>

          <div className={`text-xs font-semibold text-muted-foreground ${sidebarOpen ? 'px-3 mt-6 mb-3' : 'hidden'}`}>
            SETTINGS
          </div>

          {/* Settings Dropdown */}
          <div className="w-full">
            <button 
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span>Settings</span>
                  <ChevronDown 
                    className={`w-4 h-4 ml-auto transition-transform ${settingsOpen ? 'rotate-180' : ''}`} 
                  />
                </>
              )}
            </button>

            {/* Settings Submenu */}
            {settingsOpen && sidebarOpen && (
              <div className="mt-2 space-y-1 pl-4">
                <Link to="/profile" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>Profile</span>
                </Link>
                <Link to="/notifications" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm">
                  <Bell className="w-4 h-4 flex-shrink-0" />
                  <span>Notifications</span>
                </Link>
                <Link to="/medical-records" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm">
                  <FileCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Medical Records</span>
                </Link>
                <Link to="/health-summary" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm">
                  <Heart className="w-4 h-4 flex-shrink-0" />
                  <span>Health Summary</span>
                </Link>
                <button 
                  onClick={createSampleAnalytics}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span>Generate Sample Data</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3" 
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isMobile ? 'ml-0' : sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border/50 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`${isMobile ? 'flex' : 'md:hidden'} flex-shrink-0`}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold truncate">My Treatments</h2>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">Manage your active treatments and associated medicines</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
            {/* 12-Hour Time Display - Compact with Seconds */}
            <div className="hidden sm:flex items-center gap-2 px-3 sm:px-5 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 backdrop-blur-sm">
              <div className="flex flex-col items-start">
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Current Time</div>
                <div className="flex items-center gap-1">
                  <div className="text-xs sm:text-base md:text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {(displayTime.getHours() % 12 || 12).toString().padStart(2, '0')}:
                    {displayTime.getMinutes().toString().padStart(2, '0')}:
                    {displayTime.getSeconds().toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {displayTime.getHours() >= 12 ? 'PM' : 'AM'}
                  </div>
                </div>
              </div>
              <div className="w-px h-6 sm:h-8 bg-blue-200 dark:bg-blue-800" />
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                {displayTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            {/* Add Treatment Button */}
            <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            </Button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 mobile-content mobile-text-container max-w-full overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading treatments...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Left Content - Treatment Cards */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {treatments.map((treatment) => (
                  <Card key={treatment.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 p-3 sm:p-4 lg:p-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
                            <CardTitle className="text-sm sm:text-base lg:text-lg break-words">{treatment.name}</CardTitle>
                            <Badge
                              className={`text-xs whitespace-nowrap ${
                                treatment.status === "active"
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-500 text-white"
                              }`}
                            >
                              {treatment.status.charAt(0).toUpperCase() +
                                treatment.status.slice(1)}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs sm:text-sm lg:text-base line-clamp-2">
                            {treatment.description || "No description provided"}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTreatment(treatment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-3 sm:pt-4 lg:pt-6 p-3 sm:p-4 lg:p-6">
                      {/* Treatment Info */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Start Date</p>
                          <p className="font-semibold text-sm sm:text-base">
                            {new Date(treatment.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        {treatment.end_date && (
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground mb-1">End Date</p>
                            <p className="font-semibold text-sm sm:text-base">
                              {new Date(treatment.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Duration</p>
                          <p className="font-semibold text-sm sm:text-base">
                            {treatment.status === "active" ? "Ongoing" : "Completed"}
                          </p>
                        </div>
                      </div>

                      {/* Medicines */}
                      <div className="mt-3 sm:mt-4 lg:mt-6 border-t pt-3 sm:pt-4 lg:pt-6">
                        <h4 className="font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2 text-sm sm:text-base">
                          <Pill className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                          Associated Medicines ({treatment.medicines.length})
                        </h4>
                        {treatment.medicines.length > 0 ? (
                          <>
                            <div className="space-y-2 sm:space-y-3">
                              {treatment.medicines.map((medicine) => (
                                <div
                                  key={medicine.id}
                                  className="p-2 sm:p-3 lg:p-4 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                                >
                                  <div className="flex items-start justify-between mb-1 sm:mb-2 gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold flex items-center gap-1 text-sm sm:text-base mb-1">
                                        {medicine.name}
                                        {medicationTaken[medicine.id] && (
                                          <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 flex-shrink-0" />
                                        )}
                                      </p>
                                      <p className="text-xs sm:text-sm text-muted-foreground">
                                        {medicine.dosage}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setSelectedMedicineForEdit(medicine);
                                          setEditMedicineOpen(true);
                                        }}
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </Button>
                                      <Badge variant="outline" className="text-xs sm:text-sm whitespace-nowrap">{medicine.frequency}</Badge>
                                    </div>
                                  </div>
                                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mb-1">
                                    <Clock className="w-3 sm:w-4 h-3 sm:h-4" />
                                    {medicine.schedule_time}
                                  </p>
                                  {medicine.instructions && (
                                    <p className="text-xs sm:text-sm text-muted-foreground italic mb-1">
                                      {medicine.instructions}
                                    </p>
                                  )}
                                  {medicine.stock !== null && (
                                    <p className="text-xs sm:text-sm mb-2">
                                      Stock:{" "}
                                      <span
                                        className={
                                          medicine.stock < 5
                                            ? "text-red-500 font-semibold"
                                            : "text-green-600"
                                        }
                                      >
                                        {medicine.stock} tablets
                                      </span>
                                    </p>
                                  )}
                                  <Dialog open={medicationLogOpen && selectedMedicine?.id === medicine.id && !medicationTaken[medicine.id]} onOpenChange={setMedicationLogOpen}>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant={medicationTaken[medicine.id] ? "outline" : "default"}
                                        disabled={medicationTaken[medicine.id]}
                                        onClick={() => {
                                          if (!medicationTaken[medicine.id]) {
                                            setSelectedMedicine(medicine);
                                            playAlertSound();
                                          }
                                        }}
                                        className="w-full gap-2 text-xs sm:text-sm h-9 sm:h-10"
                                      >
                                        {medicationTaken[medicine.id] ? (
                                          <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            Already Taken
                                          </>
                                        ) : (
                                          <>
                                            <Pill className="w-4 h-4" />
                                            Log Medication
                                          </>
                                        )}
                                      </Button>
                                    </DialogTrigger>
                                    {selectedMedicine?.id === medicine.id && (
                                      <DialogContent className="max-w-sm sm:max-w-md">
                                        <DialogHeader>
                                          <DialogTitle>Take Medication</DialogTitle>
                                          <DialogDescription>
                                            Confirm that you have taken this medication
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                            <p className="font-semibold text-lg mb-2">
                                              {selectedMedicine.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-2">
                                              Dosage: {selectedMedicine.dosage}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-2">
                                              Frequency: {selectedMedicine.frequency}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-2">
                                              Time: {selectedMedicine.schedule_time}
                                            </p>
                                            {selectedMedicine.instructions && (
                                              <p className="text-sm text-muted-foreground font-semibold">
                                                ℹ️ {selectedMedicine.instructions}
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex gap-3">
                                            <Button
                                              variant="outline"
                                              onClick={() => setMedicationLogOpen(false)}
                                              className="flex-1"
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              onClick={() =>
                                                handleMedicationConfirm(selectedMedicine)
                                              }
                                              className="flex-1 gap-2"
                                            >
                                              <CheckCircle2 className="w-4 h-4" />
                                              Confirm Taken
                                            </Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    )}
                                  </Dialog>
                                </div>
                              ))}
                            </div>
                            <Dialog open={addMedicineOpen} onOpenChange={setAddMedicineOpen}>
                                <Button
                                  variant="outline"
                                  className="mt-2 sm:mt-3 lg:mt-4 w-full gap-2 text-xs sm:text-sm h-9 sm:h-10"
                                  onClick={() => getMedicineRecommendationsForTreatment(treatment)}
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Medicine
                                </Button>
                              {selectedTreatmentId === treatment.id && (
                                <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                                  <DialogHeader className="pb-3 sm:pb-4">
                                    <DialogTitle className="text-base sm:text-lg">Add New Medicine</DialogTitle>
                                    <DialogDescription className="text-sm">
                                      Add a medicine to this treatment plan
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="med-name" className="text-sm font-medium">Medicine Name *</Label>
                                      <Input
                                        id="med-name"
                                        placeholder="e.g., Metformin"
                                        value={medicineForm.name}
                                        onChange={(e) =>
                                          setMedicineForm({
                                            ...medicineForm,
                                            name: e.target.value,
                                          })
                                        }
                                        className="h-11 text-base mt-2"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="med-dosage" className="text-sm font-medium">Dosage *</Label>
                                      <Input
                                        id="med-dosage"
                                        placeholder="e.g., 500mg"
                                        value={medicineForm.dosage}
                                        onChange={(e) =>
                                          setMedicineForm({
                                            ...medicineForm,
                                            dosage: e.target.value,
                                          })
                                        }
                                        className="h-11 text-base mt-2"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="med-frequency" className="text-sm font-medium">Frequency *</Label>
                                      <Select
                                        value={medicineForm.frequency}
                                        onValueChange={(value) =>
                                          setMedicineForm({
                                            ...medicineForm,
                                            frequency: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger id="med-frequency" className="h-11 text-base mt-2">
                                          <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Once daily">Once daily</SelectItem>
                                          <SelectItem value="Twice daily">Twice daily</SelectItem>
                                          <SelectItem value="Three times daily">Three times daily</SelectItem>
                                          <SelectItem value="Four times daily">Four times daily</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Times Management */}
                                    <div>
                                      <Label className="text-sm font-medium">Medicine Times *</Label>
                                      <div className="space-y-3 mt-2">
                                        {medicineForm.times.map((time, index) => (
                                          <div key={index} className="flex gap-2">
                                            <Input
                                              type="time"
                                              value={time}
                                              onChange={(e) => {
                                                const newTimes = [...medicineForm.times];
                                                newTimes[index] = e.target.value;
                                                setMedicineForm({
                                                  ...medicineForm,
                                                  times: newTimes,
                                                });
                                              }}
                                              className="flex-1 h-11 text-base"
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setMedicineForm({
                                                  ...medicineForm,
                                                  times: medicineForm.times.filter((_, i) => i !== index),
                                                });
                                              }}
                                              className="px-3 h-11 min-w-[44px]"
                                            >
                                              <X className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        ))}
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="w-full gap-2 h-11 text-sm"
                                          onClick={() => {
                                            setMedicineForm({
                                              ...medicineForm,
                                              times: [...medicineForm.times, ""],
                                            });
                                          }}
                                        >
                                          <Plus className="w-4 h-4" />
                                          Add Time
                                        </Button>
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor="med-instructions" className="text-sm font-medium">Instructions *</Label>
                                      <Select
                                        value={medicineForm.instructions}
                                        onValueChange={(value) =>
                                          setMedicineForm({
                                            ...medicineForm,
                                            instructions: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger id="med-instructions" className="h-11 text-base mt-2">
                                          <SelectValue placeholder="Select instruction" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Before food">Before food</SelectItem>
                                          <SelectItem value="After food">After food</SelectItem>
                                          <SelectItem value="Afternoon">Afternoon</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="med-stock" className="text-sm font-medium">Stock (tablets)</Label>
                                      <Input
                                        id="med-stock"
                                        type="number"
                                        placeholder="e.g., 30"
                                        value={medicineForm.stock}
                                        onChange={(e) =>
                                          setMedicineForm({
                                            ...medicineForm,
                                            stock: e.target.value,
                                          })
                                        }
                                        className="h-11 text-base mt-2"
                                      />
                                    </div>
                                    <Button onClick={handleAddMedicine} disabled={loading} className="w-full h-11 text-base mt-4 gap-2">
                                      {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Plus className="w-4 h-4" />
                                      )}
                                      {loading ? "Adding Medicine..." : "Add Medicine"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              )}
                            </Dialog>
                          </>
                        ) : (
                          <div className="text-center py-2 sm:py-3">
                            <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                              No medicines added
                            </p>
                            <Dialog open={addMedicineOpen} onOpenChange={setAddMedicineOpen}>
                                <Button
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={() => getMedicineRecommendationsForTreatment(treatment)}
                                >
                                  <Plus className="w-2.5 h-2.5 mr-1" />
                                  Add
                                </Button>
                              {selectedTreatmentId === treatment.id && (
                                <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto mobile-content mobile-text-container">
                                  <DialogHeader className="pb-3 sm:pb-4">
                                    <DialogTitle className="text-base sm:text-lg mobile-header">Add Medicine</DialogTitle>
                                    <DialogDescription className="text-sm mobile-text-fix">
                                      Add medicine to treatment
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 sm:space-y-5 mobile-text-container">
                                    <div>
                                      <Label htmlFor="med-name" className="text-sm font-medium block mb-2 mobile-text-fix">Medicine Name *</Label>
                                      <Input
                                        id="med-name"
                                        placeholder="e.g., Metformin"
                                        value={medicineForm.name}
                                        onChange={(e) =>
                                          setMedicineForm({
                                            ...medicineForm,
                                            name: e.target.value,
                                          })
                                        }
                                        className="h-11 sm:h-12 text-base mobile-text-fix"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="med-dosage" className="text-sm font-medium block mb-2 mobile-text-fix">Dosage *</Label>
                                      <Input
                                        id="med-dosage"
                                        placeholder="e.g., 500mg"
                                        value={medicineForm.dosage}
                                        onChange={(e) =>
                                          setMedicineForm({
                                            ...medicineForm,
                                            dosage: e.target.value,
                                          })
                                        }
                                        className="h-11 sm:h-12 text-base mobile-text-fix"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="med-frequency" className="text-sm font-medium block mb-2 mobile-text-fix">Frequency *</Label>
                                      <Select
                                        value={medicineForm.frequency}
                                        onValueChange={(value) =>
                                          setMedicineForm({
                                            ...medicineForm,
                                            frequency: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger id="med-frequency" className="h-11 sm:h-12 text-base mobile-text-fix">
                                          <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[99999]" position="popper" sideOffset={5}>
                                          <SelectItem value="Once daily">Once daily</SelectItem>
                                          <SelectItem value="Twice daily">Twice daily</SelectItem>
                                          <SelectItem value="Three times daily">Three times daily</SelectItem>
                                          <SelectItem value="Four times daily">Four times daily</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Times Management */}
                                    <div>
                                      <Label className="text-sm font-medium block mb-2 mobile-text-fix">Medicine Times *</Label>
                                      <div className="space-y-2 mt-2">
                                        {medicineForm.times.map((time, index) => (
                                          <div key={index} className="flex gap-2">
                                            <Input
                                              type="time"
                                              value={time}
                                              onChange={(e) => {
                                                const newTimes = [...medicineForm.times];
                                                newTimes[index] = e.target.value;
                                                setMedicineForm({
                                                  ...medicineForm,
                                                  times: newTimes,
                                                });
                                              }}
                                              className="flex-1 h-8 sm:h-9 text-xs"
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setMedicineForm({
                                                  ...medicineForm,
                                                  times: medicineForm.times.filter((_, i) => i !== index),
                                                });
                                              }}
                                              className="px-2 h-8 sm:h-9"
                                            >
                                              <X className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        ))}
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="w-full gap-1 h-8 text-xs"
                                          onClick={() => {
                                            setMedicineForm({
                                              ...medicineForm,
                                              times: [...medicineForm.times, ""],
                                            });
                                          }}
                                        >
                                          <Plus className="w-3 h-3" />
                                          Add Time
                                        </Button>
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor="med-instructions" className="text-sm font-medium block mb-2 mobile-text-fix">Instructions *</Label>
                                      <Select
                                        value={medicineForm.instructions}
                                        onValueChange={(value) =>
                                          setMedicineForm({
                                            ...medicineForm,
                                            instructions: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger id="med-instructions" className="h-11 sm:h-12 text-base mobile-text-fix">
                                          <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[99999]" position="popper" sideOffset={5}>
                                          <SelectItem value="Before food">Before food</SelectItem>
                                          <SelectItem value="After food">After food</SelectItem>
                                          <SelectItem value="Afternoon">Afternoon</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="med-stock" className="text-sm font-medium block mb-2 mobile-text-fix">Stock (tablets)</Label>
                                      <Input
                                        id="med-stock"
                                        type="number"
                                        placeholder="e.g., 30"
                                        value={medicineForm.stock}
                                        onChange={(e) =>
                                          setMedicineForm({
                                            ...medicineForm,
                                            stock: e.target.value,
                                          })
                                        }
                                        className="h-11 sm:h-12 text-base mobile-text-fix"
                                      />
                                    </div>
                                    <Button onClick={handleAddMedicine} disabled={loading} className="w-full h-11 text-base mt-4 gap-2">
                                      {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Plus className="w-4 h-4" />
                                      )}
                                      {loading ? "Adding Medicine..." : "Add Medicine"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              )}
                            </Dialog>
                          </div>
                        )}

                        {/* Edit Medicine Dialog */}
                        <Dialog open={editMedicineOpen} onOpenChange={setEditMedicineOpen}>
                          <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader className="pb-3 sm:pb-4">
                              <DialogTitle className="text-base sm:text-lg">Edit Medicine</DialogTitle>
                              <DialogDescription className="text-sm">
                                Update medicine information
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-med-name" className="text-sm font-medium">Medicine Name *</Label>
                                <Input
                                  id="edit-med-name"
                                  value={editMedicineForm.name}
                                  onChange={(e) => setEditMedicineForm({...editMedicineForm, name: e.target.value})}
                                  placeholder="Enter medicine name"
                                  className="h-9 text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-dosage" className="text-sm font-medium">Dosage *</Label>
                                <Input
                                  id="edit-dosage"
                                  value={editMedicineForm.dosage}
                                  onChange={(e) => setEditMedicineForm({...editMedicineForm, dosage: e.target.value})}
                                  placeholder="e.g., 10mg, 2 tablets"
                                  className="h-9 text-sm"
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                  <Label htmlFor="edit-frequency" className="text-sm font-medium">Frequency *</Label>
                                  <Select
                                    value={editMedicineForm.frequency}
                                    onValueChange={(value) => setEditMedicineForm({...editMedicineForm, frequency: value})}
                                  >
                                    <SelectTrigger className="h-9 text-sm">
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="As directed by physician">As directed by physician</SelectItem>
                                      <SelectItem value="Once daily">Once daily</SelectItem>
                                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                                      <SelectItem value="Four times daily">Four times daily</SelectItem>
                                      <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                                      <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                                      <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                                      <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                                      <SelectItem value="As needed">As needed</SelectItem>
                                      <SelectItem value="Before meals">Before meals</SelectItem>
                                      <SelectItem value="After meals">After meals</SelectItem>
                                      <SelectItem value="With food">With food</SelectItem>
                                      <SelectItem value="On empty stomach">On empty stomach</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="edit-schedule-time" className="text-sm font-medium">Schedule Time</Label>
                                  <Input
                                    id="edit-schedule-time"
                                    type="time"
                                    value={editMedicineForm.schedule_time}
                                    onChange={(e) => setEditMedicineForm({...editMedicineForm, schedule_time: e.target.value})}
                                    className="h-9 text-sm"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="edit-stock" className="text-sm font-medium">Stock (tablets/pills)</Label>
                                <Input
                                  id="edit-stock"
                                  type="number"
                                  min="0"
                                  value={editMedicineForm.stock}
                                  onChange={(e) => setEditMedicineForm({...editMedicineForm, stock: e.target.value})}
                                  placeholder="Enter stock count"
                                  className="h-9 text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-instructions" className="text-sm font-medium">Instructions (Optional)</Label>
                                <Textarea
                                  id="edit-instructions"
                                  value={editMedicineForm.instructions}
                                  onChange={(e) => setEditMedicineForm({...editMedicineForm, instructions: e.target.value})}
                                  placeholder="Any special instructions for taking this medicine"
                                  className="resize-none text-sm"
                                  rows={2}
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                                <Button
                                  onClick={() => setEditMedicineOpen(false)}
                                  variant="outline"
                                  className="h-9 text-sm"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleUpdateMedicine}
                                  disabled={loading || !editMedicineForm.name.trim()}
                                  className="h-9 text-sm"
                                >
                                  {loading ? "Updating Medicine..." : "Update Medicine"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {/* View History Button */}
                      <div className="mt-3 sm:mt-4 lg:mt-6 pt-3 sm:pt-4 lg:pt-6 border-t">
                        <Link to={`/history?treatment=${treatment.id}`} className="w-full">
                          <Button variant="outline" className="w-full gap-2 text-xs sm:text-sm h-9 sm:h-10">
                            <Clock className="w-4 h-4" />
                            View Treatment History
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  {/* Add Treatment Card */}
                  <Card variant="glass" className="p-4 sm:p-5 lg:p-6 sticky top-24">
                    <div className="text-center mb-4 sm:mb-5 lg:mb-6">
                      <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Plus className="w-6 sm:w-7 h-6 sm:h-7 text-primary" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2">Add New Treatment</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">Create a new treatment plan with medicines and schedule</p>
                    </div>
                    <Dialog open={addTreatmentOpen} onOpenChange={setAddTreatmentOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full gap-2 text-xs sm:text-sm h-9 sm:h-10">
                          <Plus className="w-4 h-4" />
                          Start New Treatment
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto mobile-content mobile-text-container">
                        <DialogHeader className="pb-3 sm:pb-4">
                          <DialogTitle className="text-base sm:text-lg mobile-header">Add New Treatment</DialogTitle>
                          <DialogDescription className="text-sm mobile-text-fix">
                            Create a new treatment plan
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 sm:space-y-5 mobile-text-container">
                          <div>
                            <Label htmlFor="name" className="text-sm font-medium block mb-2 mobile-text-fix">Treatment Name *</Label>
                            <Input
                              id="name"
                              placeholder="e.g., Diabetes Management"
                              value={treatmentForm.name}
                              onChange={(e) =>
                                setTreatmentForm({ ...treatmentForm, name: e.target.value })
                              }
                              className="h-11 sm:h-12 text-base mobile-text-fix"
                            />
                          </div>
                          <div>
                            <Label htmlFor="description" className="text-sm font-medium block mb-2 mobile-text-fix">Description</Label>
                            <Textarea
                              id="description"
                              placeholder="Treatment details and purpose"
                              value={treatmentForm.description}
                              onChange={(e) =>
                                setTreatmentForm({ ...treatmentForm, description: e.target.value })
                              }
                              className="h-24 sm:h-28 text-base resize-none mobile-text-fix"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <Label htmlFor="start_date" className="text-sm font-medium block mb-2 mobile-text-fix">Start Date *</Label>
                              <Input
                                id="start_date"
                                type="date"
                                value={treatmentForm.start_date}
                                onChange={(e) =>
                                  setTreatmentForm({ ...treatmentForm, start_date: e.target.value })
                                }
                                className="h-11 sm:h-12 text-base mobile-text-fix"
                              />
                            </div>
                            <div>
                              <Label htmlFor="end_date" className="text-sm font-medium block mb-2 mobile-text-fix">End Date</Label>
                              <Input
                                id="end_date"
                                type="date"
                                value={treatmentForm.end_date}
                                onChange={(e) =>
                                  setTreatmentForm({ ...treatmentForm, end_date: e.target.value })
                                }
                                className="h-11 sm:h-12 text-base mobile-text-fix"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="status" className="text-sm font-medium block mb-2 mobile-text-fix">Status *</Label>
                            <Select
                              value={treatmentForm.status}
                              onValueChange={(value: string) =>
                                setTreatmentForm({
                                  ...treatmentForm,
                                  status: value === "active" ? "active" : "inactive",
                                })
                              }
                            >
                              <SelectTrigger id="status" className="h-11 sm:h-12 text-base mobile-text-fix">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-3">
                            {/* AI Recommendation Button */}
                            <AIRecommendationDialog
                              treatmentName={treatmentForm.name}
                              treatmentDescription={treatmentForm.description || ""}
                              onRecommendationAccepted={(recommendation) => handleAcceptAIRecommendation(recommendation)}
                              disabled={!treatmentForm.name.trim()}
                            />
                            
                            {/* Regular Add Treatment Button */}
                            <Button onClick={handleAddTreatment} disabled={loading} className="w-full h-11 sm:h-12 text-base font-medium gap-2 mobile-text-fix">
                              {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                              {loading ? "Adding..." : "Add Treatment"}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Medicine Recommendations Dialog */}
                        <Dialog open={showMedicineRecommendations} onOpenChange={setShowMedicineRecommendations}>
                          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                                <Pill className="w-5 h-5" />
                                Recommended Medicines
                              </DialogTitle>
                              <DialogDescription>
                                AI-recommended medicines for {selectedTreatmentForMedicine?.name} treatment
                              </DialogDescription>
                            </DialogHeader>
                            
                            {recommendationsLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                <span>Getting recommendations...</span>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {medicineRecommendations.length > 0 ? (
                                  <>
                                    <div className="space-y-3">
                                      {medicineRecommendations.slice(0, 4).map((rec, index) => (
                                        <div key={index} className="border rounded-lg p-4 space-y-3">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Pill className="w-4 h-4 text-blue-600" />
                                                <h4 className="font-semibold text-base">{rec.name}</h4>
                                                <span className="text-xs text-gray-500">({rec.genericName})</span>
                                                <Badge variant="secondary" className="text-xs">
                                                  {rec.confidence}% confidence
                                                </Badge>
                                              </div>
                                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                                                <div><strong>Dosage:</strong> {rec.dosage}</div>
                                                <div><strong>Frequency:</strong> {rec.frequency}</div>
                                                <div><strong>Duration:</strong> {rec.duration}</div>
                                                <div><strong>Category:</strong> {rec.category}</div>
                                              </div>
                                              <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                                <strong>Instructions:</strong> {rec.instructions}
                                              </div>
                                            </div>
                                          </div>
                                          <Button 
                                            onClick={() => addRecommendedMedicine(rec)}
                                            disabled={loading}
                                            size="sm"
                                            className="w-full"
                                          >
                                            {loading ? (
                                              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Adding...</>
                                            ) : (
                                              <><Plus className="w-4 h-4 mr-2" />Add This Medicine</>
                                            )}
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    <div className="border-t pt-4">
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setShowMedicineRecommendations(false);
                                          setSelectedTreatmentId(selectedTreatmentForMedicine?.id);
                                          setAddMedicineOpen(true);
                                        }}
                                        className="w-full"
                                      >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Custom Medicine
                                      </Button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center py-8">
                                    <Pill className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 mb-4">No recommendations available for this treatment.</p>
                                    <Button
                                      onClick={() => {
                                        setShowMedicineRecommendations(false);
                                        setSelectedTreatmentId(selectedTreatmentForMedicine?.id);
                                        setAddMedicineOpen(true);
                                      }}
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Add Medicine Manually
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Add Medicine Dialog */}
                      </DialogContent>
                    </Dialog>

                    {/* Edit Medicine Dialog */}
                    <Dialog open={editMedicineOpen} onOpenChange={setEditMedicineOpen}>
                      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="pb-3 sm:pb-4">
                          <DialogTitle className="text-base sm:text-lg">Edit Medicine</DialogTitle>
                          <DialogDescription className="text-sm">
                            Update medicine information
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-med-name" className="text-sm font-medium">Medicine Name *</Label>
                            <Input
                              id="edit-med-name"
                              value={editMedicineForm.name}
                              onChange={(e) => setEditMedicineForm({...editMedicineForm, name: e.target.value})}
                              placeholder="Enter medicine name"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-dosage" className="text-sm font-medium">Dosage *</Label>
                            <Input
                              id="edit-dosage"
                              value={editMedicineForm.dosage}
                              onChange={(e) => setEditMedicineForm({...editMedicineForm, dosage: e.target.value})}
                              placeholder="e.g., 10mg, 2 tablets"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <Label htmlFor="edit-frequency" className="text-sm font-medium">Frequency *</Label>
                              <Select
                                value={editMedicineForm.frequency}
                                onValueChange={(value) => setEditMedicineForm({...editMedicineForm, frequency: value})}
                              >
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="As directed by physician">As directed by physician</SelectItem>
                                  <SelectItem value="Once daily">Once daily</SelectItem>
                                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                                  <SelectItem value="Three times daily">Three times daily</SelectItem>
                                  <SelectItem value="Four times daily">Four times daily</SelectItem>
                                  <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                                  <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                                  <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                                  <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                                  <SelectItem value="As needed">As needed</SelectItem>
                                  <SelectItem value="Before meals">Before meals</SelectItem>
                                  <SelectItem value="After meals">After meals</SelectItem>
                                  <SelectItem value="With food">With food</SelectItem>
                                  <SelectItem value="On empty stomach">On empty stomach</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="edit-schedule-time" className="text-sm font-medium">Schedule Time</Label>
                              <Input
                                id="edit-schedule-time"
                                type="time"
                                value={editMedicineForm.schedule_time}
                                onChange={(e) => setEditMedicineForm({...editMedicineForm, schedule_time: e.target.value})}
                                className="h-9 text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="edit-stock" className="text-sm font-medium">Stock (tablets/pills)</Label>
                            <Input
                              id="edit-stock"
                              type="number"
                              min="0"
                              value={editMedicineForm.stock}
                              onChange={(e) => setEditMedicineForm({...editMedicineForm, stock: e.target.value})}
                              placeholder="Enter stock count"
                              className="h-9 text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-instructions" className="text-sm font-medium">Instructions (Optional)</Label>
                            <Textarea
                              id="edit-instructions"
                              value={editMedicineForm.instructions}
                              onChange={(e) => setEditMedicineForm({...editMedicineForm, instructions: e.target.value})}
                              placeholder="Any special instructions for taking this medicine"
                              className="resize-none text-sm"
                              rows={2}
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                            <Button
                              onClick={() => setEditMedicineOpen(false)}
                              variant="outline"
                              className="h-9 text-sm"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleUpdateMedicine}
                              disabled={loading || !editMedicineForm.name.trim()}
                              className="h-9 text-sm"
                            >
                              {loading ? "Updating Medicine..." : "Update Medicine"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </Card>

                  {/* Treatments Summary Card */}
                  <Card variant="elevated" className="p-4 sm:p-5 lg:p-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      Summary
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800">
                        <span className="text-sm sm:text-base font-medium">Active Treatments</span>
                        <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">{treatments.filter(t => t.status === 'active').length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800">
                        <span className="text-sm sm:text-base font-medium">Total Medicines</span>
                        <span className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">{treatments.reduce((sum, t) => sum + t.medicines.length, 0)}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              {treatments.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Stethoscope className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No treatments yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start by adding your first treatment plan using the "Add New Treatment" card on the right
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyTreatments;