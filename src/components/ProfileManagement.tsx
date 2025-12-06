import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Heart,
  AlertTriangle,
  Plus,
  X,
  Save,
  Brain,
  Activity,
  Phone,
  Mail,
  Calendar,
  Weight,
  Ruler,
  Droplet
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAIRecommendations } from "@/hooks/use-ai-recommendations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PatientProfileData {
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

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const COMMON_ALLERGIES = [
  "Penicillin",
  "Aspirin",
  "NSAIDs",
  "Sulfa drugs",
  "Latex",
  "Shellfish",
  "Peanuts",
  "Tree nuts",
  "Dairy",
  "Eggs",
  "Soy"
];

const COMMON_CONDITIONS = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Arthritis",
  "Heart Disease",
  "Depression",
  "Anxiety",
  "Allergies",
  "Migraine",
  "Chronic Pain"
];

export function ProfileManagement() {
  const { user } = useAuth();
  const { updatePatientProfile } = useAIRecommendations();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [profileData, setProfileData] = useState<PatientProfileData>({});
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [showAllergyInput, setShowAllergyInput] = useState(false);
  const [showConditionInput, setShowConditionInput] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      setFetchLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setProfileData({
          age: (data as any).age,
          weight: (data as any).weight,
          height: (data as any).height,
          blood_type: (data as any).blood_type,
          medical_condition: (data as any).medical_conditions,
          allergies: (data as any).allergies ? (data as any).allergies.split(',') : [],
          medical_history: (data as any).medical_history || [],
          emergency_contact_name: (data as any).emergency_contact_name,
          emergency_contact_phone: (data as any).emergency_contact_phone,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const success = await updatePatientProfile(user.id, profileData);
      if (success) {
        toast({
          title: "Success",
          description: "Profile updated successfully. This will improve your AI recommendations!"
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAllergy = (allergy: string) => {
    if (allergy.trim() && !profileData.allergies?.includes(allergy.trim())) {
      setProfileData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), allergy.trim()]
      }));
    }
    setNewAllergy("");
    setShowAllergyInput(false);
  };

  const removeAllergy = (allergy: string) => {
    setProfileData(prev => ({
      ...prev,
      allergies: prev.allergies?.filter(a => a !== allergy) || []
    }));
  };

  const addCondition = (condition: string) => {
    if (condition.trim() && !profileData.medical_history?.includes(condition.trim())) {
      setProfileData(prev => ({
        ...prev,
        medical_history: [...(prev.medical_history || []), condition.trim()]
      }));
    }
    setNewCondition("");
    setShowConditionInput(false);
  };

  const removeCondition = (condition: string) => {
    setProfileData(prev => ({
      ...prev,
      medical_history: prev.medical_history?.filter(c => c !== condition) || []
    }));
  };

  if (fetchLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Enhancement Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Enhance AI Recommendations</h3>
              <p className="text-sm text-blue-800">
                Complete your medical profile to receive more accurate and personalized medicine recommendations.
                The more information you provide, the better our AI can assist you.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Your basic health information helps personalize recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Age
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={profileData.age || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="Weight in kg"
                value={profileData.weight || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="height" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                placeholder="Height in cm"
                value={profileData.height || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, height: parseFloat(e.target.value) || undefined }))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="blood_type" className="flex items-center gap-2">
                <Droplet className="h-4 w-4" />
                Blood Type
              </Label>
              <Select
                value={profileData.blood_type || ""}
                onValueChange={(value) => setProfileData(prev => ({ ...prev, blood_type: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="medical_condition" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Primary Medical Condition
              </Label>
              <Input
                id="medical_condition"
                placeholder="e.g., Diabetes, Hypertension"
                value={profileData.medical_condition || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, medical_condition: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Allergies & Sensitivities
          </CardTitle>
          <CardDescription>
            Critical for avoiding dangerous medicine interactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profileData.allergies?.map((allergy, index) => (
              <Badge key={index} variant="destructive" className="flex items-center gap-1">
                {allergy}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeAllergy(allergy)}
                />
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Common Allergies</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGIES.filter(allergy => 
                !profileData.allergies?.includes(allergy)
              ).map((allergy) => (
                <Button
                  key={allergy}
                  variant="outline"
                  size="sm"
                  onClick={() => addAllergy(allergy)}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {allergy}
                </Button>
              ))}
            </div>
          </div>

          {showAllergyInput ? (
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom allergy"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAllergy(newAllergy)}
              />
              <Button onClick={() => addAllergy(newAllergy)} size="sm">
                Add
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAllergyInput(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowAllergyInput(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Allergy
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Medical History
          </CardTitle>
          <CardDescription>
            Past and current conditions that affect medicine selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profileData.medical_history?.map((condition, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {condition}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeCondition(condition)}
                />
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Common Conditions</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_CONDITIONS.filter(condition => 
                !profileData.medical_history?.includes(condition)
              ).map((condition) => (
                <Button
                  key={condition}
                  variant="outline"
                  size="sm"
                  onClick={() => addCondition(condition)}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {condition}
                </Button>
              ))}
            </div>
          </div>

          {showConditionInput ? (
            <div className="flex gap-2">
              <Input
                placeholder="Enter medical condition"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCondition(newCondition)}
              />
              <Button onClick={() => addCondition(newCondition)} size="sm">
                Add
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowConditionInput(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowConditionInput(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
          <CardDescription>
            Contact information for medical emergencies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergency_name">Contact Name</Label>
              <Input
                id="emergency_name"
                placeholder="Full name"
                value={profileData.emergency_contact_name || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="emergency_phone">Phone Number</Label>
              <Input
                id="emergency_phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={profileData.emergency_contact_phone || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="p-4">
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}