import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { MedicineRecommendations } from "./MedicineRecommendations";
import { useAIRecommendations } from "@/hooks/use-ai-recommendations";
import { MedicineRecommendation } from "@/services/medicineRecommendations";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AIRecommendationDialogProps {
  treatmentName: string;
  treatmentDescription: string;
  treatmentId?: string;
  onRecommendationAccepted?: (recommendation: MedicineRecommendation) => void;
  disabled?: boolean;
}

// Common medical conditions for quick selection
const MEDICAL_CONDITIONS = [
  { value: "hypertension", label: "High Blood Pressure (Hypertension)" },
  { value: "diabetes", label: "Diabetes Type 2" },
  { value: "depression", label: "Depression" },
  { value: "anxiety", label: "Anxiety" },
  { value: "pain", label: "Pain Management" },
  { value: "infection", label: "Bacterial Infection" },
  { value: "arthritis", label: "Arthritis" },
  { value: "asthma", label: "Asthma" },
  { value: "migraine", label: "Migraine" },
  { value: "insomnia", label: "Insomnia" },
  { value: "allergies", label: "Allergies" },
  { value: "acid_reflux", label: "Acid Reflux (GERD)" },
  { value: "other", label: "Other" }
];

export function AIRecommendationDialog({
  treatmentName,
  treatmentDescription,
  treatmentId,
  onRecommendationAccepted,
  disabled = false
}: AIRecommendationDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState("");
  const [customCondition, setCustomCondition] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState("");
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    state,
    getRecommendations,
    saveRecommendations,
    acceptRecommendation
  } = useAIRecommendations();

  const handleGetRecommendations = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to get recommendations",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCondition) {
      toast({
        title: "Error",
        description: "Please select a medical condition",
        variant: "destructive"
      });
      return;
    }

    const condition = selectedCondition === "other" ? customCondition : selectedCondition;
    const fullDescription = symptoms ? `${treatmentDescription}. Symptoms: ${symptoms}` : treatmentDescription;
    
    const recommendations = await getRecommendations(
      treatmentName,
      fullDescription,
      user.id,
      condition
    );

    if (recommendations.length > 0) {
      setShowRecommendations(true);
      
      // Save recommendations if treatmentId is provided
      if (treatmentId) {
        await saveRecommendations(recommendations, user.id, treatmentId);
      }
    }
  };

  const handleAcceptRecommendation = async (recommendation: MedicineRecommendation) => {
    if (treatmentId && user?.id) {
      // Find the recommendation ID (this would need to be handled differently in a real app)
      const success = await acceptRecommendation(
        `temp-id-${Date.now()}`, // Temporary ID
        treatmentId,
        recommendation
      );

      if (success && onRecommendationAccepted) {
        onRecommendationAccepted(recommendation);
        setOpen(false);
        resetForm();
      }
    } else if (onRecommendationAccepted) {
      onRecommendationAccepted(recommendation);
      setOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedCondition("");
    setCustomCondition("");
    setSymptoms("");
    setSeverity("");
    setShowRecommendations(false);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
          disabled={disabled}
        >
          <Brain className="h-4 w-4" />
          Get AI Recommendations
          <Sparkles className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Medicine Recommendations
          </DialogTitle>
          <DialogDescription>
            Get personalized medicine recommendations based on your treatment and medical condition.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2 min-h-0">
          {!showRecommendations ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Treatment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="treatment-name" className="text-sm font-medium">
                      Treatment Name
                    </Label>
                    <Input
                      id="treatment-name"
                      value={treatmentName}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="treatment-description" className="text-sm font-medium">
                      Treatment Description
                    </Label>
                    <Textarea
                      id="treatment-description"
                      value={treatmentDescription}
                      disabled
                      className="mt-1 bg-gray-50"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medical Condition</CardTitle>
                  <CardDescription>
                    Select the primary medical condition this treatment addresses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="condition" className="text-sm font-medium">
                      Primary Condition *
                    </Label>
                    <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a medical condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDICAL_CONDITIONS.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCondition === "other" && (
                    <div>
                      <Label htmlFor="custom-condition" className="text-sm font-medium">
                        Custom Condition *
                      </Label>
                      <Input
                        id="custom-condition"
                        placeholder="Enter the medical condition"
                        value={customCondition}
                        onChange={(e) => setCustomCondition(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="symptoms" className="text-sm font-medium">
                      Current Symptoms (Optional)
                    </Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Describe any symptoms you're experiencing..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="severity" className="text-sm font-medium">
                      Condition Severity (Optional)
                    </Label>
                    <Select value={severity} onValueChange={setSeverity}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select severity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Important Disclaimer</h4>
                    <p className="text-sm text-yellow-800">
                      AI recommendations are for informational purposes only and should not replace 
                      professional medical advice. Always consult your healthcare provider before 
                      starting any new medication.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleGetRecommendations}
                  disabled={state.loading || !selectedCondition || 
                           (selectedCondition === "other" && !customCondition)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {state.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Get Recommendations
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <MedicineRecommendations
                recommendations={state.recommendations}
                treatmentId={treatmentId || ""}
                onAcceptRecommendation={handleAcceptRecommendation}
                loading={state.loading}
              />
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowRecommendations(false)}
                >
                  Back to Form
                </Button>
              </div>
            </>
          )}

          {state.error && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">{state.error}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}