import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Brain,
  Check,
  X,
  AlertTriangle,
  Clock,
  Pill,
  Info,
  ChevronDown,
  ChevronUp,
  Star,
  Loader2,
  Edit
} from "lucide-react";
import { MedicineRecommendation } from "@/services/medicineRecommendations";
import { useAIRecommendations } from "@/hooks/use-ai-recommendations";
import { useToast } from "@/hooks/use-toast";

interface MedicineRecommendationsProps {
  recommendations: MedicineRecommendation[];
  treatmentId: string;
  onAcceptRecommendation: (recommendation: MedicineRecommendation) => void;
  loading?: boolean;
}

export function MedicineRecommendations({
  recommendations,
  treatmentId,
  onAcceptRecommendation,
  loading = false
}: MedicineRecommendationsProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    instructions: ""
  });
  const { rejectRecommendation } = useAIRecommendations();
  const { toast } = useToast();

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500";
    if (confidence >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 80) return "default";
    if (confidence >= 60) return "secondary";
    return "destructive";
  };

  const handleEdit = (recommendation: MedicineRecommendation, index: number) => {
    setEditForm({
      name: recommendation.name,
      dosage: recommendation.dosage,
      frequency: recommendation.frequency,
      instructions: recommendation.instructions || ""
    });
    setEditDialogOpen(`${recommendation.name}-${index}`);
  };

  const handleSaveEdit = (originalRecommendation: MedicineRecommendation) => {
    if (!editForm.name.trim()) {
      toast({
        title: "Error",
        description: "Medicine name is required",
        variant: "destructive"
      });
      return;
    }

    // Create updated recommendation
    const updatedRecommendation: MedicineRecommendation = {
      ...originalRecommendation,
      name: editForm.name,
      dosage: editForm.dosage,
      frequency: editForm.frequency,
      instructions: editForm.instructions
    };
    
    // Call the accept function with updated recommendation
    onAcceptRecommendation(updatedRecommendation);
    
    // Close dialog and reset form
    setEditDialogOpen(null);
    setEditForm({ name: "", dosage: "", frequency: "", instructions: "" });
    
    toast({
      title: "Success",
      description: "Medicine has been updated and added to your treatment"
    });
  };

  const handleReject = async (recommendationId: string) => {
    if (!rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }

    try {
      // For demo purposes, we'll just show a success message since we're working with temporary recommendations
      toast({
        title: "Recommendation Rejected",
        description: `Thank you for the feedback: "${rejectReason}". This helps improve our AI system.`,
      });
      
      // In a real implementation, you would save this to analytics
      console.log(`Recommendation rejected: ${recommendationId}, Reason: ${rejectReason}`);
      
      // Close dialog and reset form
      setRejectDialogOpen(null);
      setRejectReason("");
    } catch (error) {
      console.error('Error rejecting recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to record rejection. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating AI Recommendations...
          </CardTitle>
          <CardDescription>
            Our AI is analyzing your treatment and generating personalized medicine recommendations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            No Recommendations Available
          </CardTitle>
          <CardDescription>
            No medicine recommendations could be generated for this treatment. 
            Please consult with your healthcare provider.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">AI-Generated Medicine Recommendations</h3>
        <Badge variant="outline" className="ml-2">
          {recommendations.length} suggestion{recommendations.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {recommendations.map((recommendation, index) => (
        <Card key={`${recommendation.name}-${index}`} className="border border-blue-100">
          <CardHeader className="pb-3">
            <div className="flex flex-col space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Pill className="h-5 w-5 text-blue-600" />
                    <span className="truncate">{recommendation.name}</span>
                    {recommendation.genericName && recommendation.genericName !== recommendation.name && (
                      <span className="text-sm font-normal text-gray-500 hidden sm:inline">
                        ({recommendation.genericName})
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant={getConfidenceBadgeVariant(recommendation.confidence)} className="text-xs">
                      {Math.round(recommendation.confidence)}% confidence
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {recommendation.category}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAcceptRecommendation(recommendation)}
                  className="bg-green-600 hover:bg-green-700 flex-shrink-0"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(recommendation, index)}
                  className="border-blue-500 text-blue-600 hover:bg-blue-50 flex-shrink-0"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                <AlertDialog 
                  open={rejectDialogOpen === `${recommendation.name}-${index}`}
                  onOpenChange={(open) => {
                    if (open) {
                      setRejectDialogOpen(`${recommendation.name}-${index}`);
                    } else {
                      setRejectDialogOpen(null);
                      setRejectReason("");
                    }
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="flex-shrink-0">
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Recommendation</AlertDialogTitle>
                      <AlertDialogDescription>
                        Please provide a reason for rejecting this recommendation for {recommendation.name}. 
                        This helps improve our AI system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label htmlFor="reject-reason">Reason for rejection</Label>
                      <Textarea
                        id="reject-reason"
                        placeholder="e.g., Patient is allergic to this medication, Already taking similar medication, Prefer different treatment approach..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel 
                        onClick={() => {
                          setRejectDialogOpen(null);
                          setRejectReason("");
                        }}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleReject(`${recommendation.name}-${index}`)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Edit Dialog */}
                <Dialog 
                  open={editDialogOpen === `${recommendation.name}-${index}`}
                  onOpenChange={(open) => {
                    if (!open) {
                      setEditDialogOpen(null);
                      setEditForm({ name: "", dosage: "", frequency: "", instructions: "" });
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-500 text-blue-600 hover:bg-blue-50 flex-shrink-0"
                      onClick={() => handleEdit(recommendation, index)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Medicine</DialogTitle>
                      <DialogDescription>
                        Modify the medicine details before adding to your treatment.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">Medicine Name</Label>
                        <Input
                          id="edit-name"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter medicine name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-dosage">Dosage</Label>
                        <Input
                          id="edit-dosage"
                          value={editForm.dosage}
                          onChange={(e) => setEditForm(prev => ({ ...prev, dosage: e.target.value }))}
                          placeholder="e.g., 500mg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-frequency">Frequency</Label>
                        <Input
                          id="edit-frequency"
                          value={editForm.frequency}
                          onChange={(e) => setEditForm(prev => ({ ...prev, frequency: e.target.value }))}
                          placeholder="e.g., Twice daily"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-instructions">Instructions</Label>
                        <Textarea
                          id="edit-instructions"
                          value={editForm.instructions}
                          onChange={(e) => setEditForm(prev => ({ ...prev, instructions: e.target.value }))}
                          placeholder="Enter special instructions"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditDialogOpen(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => handleSaveEdit(recommendation)}>
                        Save & Accept
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Dosage</Label>
                <p className="text-sm font-semibold break-words">{recommendation.dosage}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Frequency</Label>
                <p className="text-sm break-words">{recommendation.frequency}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">Duration</Label>
                <p className="text-sm break-words">{recommendation.duration || "As prescribed"}</p>
              </div>
            </div>

            {recommendation.instructions && (
              <div className="bg-blue-50 p-3 rounded-md">
                <Label className="text-sm font-medium text-blue-800">Instructions</Label>
                <p className="text-sm text-blue-700 mt-1">{recommendation.instructions}</p>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedCard(
                expandedCard === `${recommendation.name}-${index}` 
                  ? null 
                  : `${recommendation.name}-${index}`
              )}
              className="w-full justify-between"
            >
              <span>View Details</span>
              {expandedCard === `${recommendation.name}-${index}` ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {expandedCard === `${recommendation.name}-${index}` && (
              <div className="space-y-4 border-t pt-4">
                <div className="bg-green-50 p-3 rounded-md">
                  <Label className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    AI Reasoning
                  </Label>
                  <p className="text-sm text-green-700 mt-1 break-words whitespace-pre-wrap">{recommendation.reasoning}</p>
                </div>

                {recommendation.sideEffects && recommendation.sideEffects.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-md">
                    <Label className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Potential Side Effects
                    </Label>
                    <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside space-y-1">
                      {recommendation.sideEffects.map((effect, idx) => (
                        <li key={idx} className="break-words">{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendation.interactions && recommendation.interactions.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <Label className="text-sm font-medium text-red-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Drug Interactions
                    </Label>
                    <ul className="text-sm text-red-700 mt-1 list-disc list-inside space-y-1">
                      {recommendation.interactions.map((interaction, idx) => (
                        <li key={idx} className="break-words">{interaction}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendation.contraindications && recommendation.contraindications.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-md">
                    <Label className="text-sm font-medium text-red-800 flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Contraindications
                    </Label>
                    <ul className="text-sm text-red-700 mt-1 list-disc list-inside space-y-1">
                      {recommendation.contraindications.map((contra, idx) => (
                        <li key={idx} className="break-words">{contra}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Important Notice</h4>
            <p className="text-sm text-blue-800">
              These are AI-generated recommendations based on your treatment information. 
              Always consult with your healthcare provider before starting any new medication. 
              Your doctor may adjust dosages or recommend different medications based on your 
              complete medical history and current health status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}