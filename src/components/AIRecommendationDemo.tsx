import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Play, CheckCircle, AlertCircle } from "lucide-react";
import { MedicineRecommendation, MedicineRecommendationEngine } from "@/services/medicineRecommendations";

export function AIRecommendationDemo() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MedicineRecommendation[]>([]);
  const [demoComplete, setDemoComplete] = useState(false);

  const runDemo = async () => {
    setLoading(true);
    setDemoComplete(false);
    
    try {
      const engine = new MedicineRecommendationEngine();
      
      // Demo patient profile
      const demoPatient = {
        age: 45,
        weight: 75,
        height: 170,
        allergies: ["penicillin"],
        currentMedications: [],
        medicalHistory: ["hypertension"],
        conditions: [{
          condition: "hypertension",
          severity: 'moderate' as const,
          symptoms: ["headache", "dizziness"]
        }]
      };

      // Demo treatment context
      const demoTreatment = {
        treatmentType: "Blood Pressure Management",
        condition: "hypertension",
        severity: "moderate",
        symptoms: ["headache", "dizziness"],
        startDate: new Date().toISOString()
      };

      // Generate recommendations
      const results = await engine.generateRecommendations(demoTreatment, demoPatient);
      setRecommendations(results);
      setDemoComplete(true);
    } catch (error) {
      console.error('Demo error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI Recommendation System Demo
        </CardTitle>
        <CardDescription>
          See how our AI analyzes patient data and generates personalized medicine recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-2">Demo Scenario:</h4>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Patient:</strong> 45-year-old, 75kg, allergic to penicillin
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Condition:</strong> Moderate hypertension with headache and dizziness
          </p>
          <p className="text-sm text-gray-600">
            <strong>Treatment:</strong> Blood Pressure Management
          </p>
        </div>

        {!demoComplete && (
          <Button 
            onClick={runDemo} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Analyzing & Generating Recommendations...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run AI Analysis Demo
              </>
            )}
          </Button>
        )}

        {demoComplete && recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">AI Analysis Complete!</span>
            </div>
            
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-green-800">{rec.name}</h5>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {Math.round(rec.confidence)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Dosage:</strong> {rec.dosage} • <strong>Frequency:</strong> {rec.frequency}
                  </p>
                  <p className="text-xs text-gray-500">{rec.reasoning}</p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-800 mb-1">How it works:</p>
                  <p className="text-xs text-blue-700">
                    The AI considers patient age, weight, allergies, medical history, and current condition 
                    to recommend appropriate medications with calculated confidence scores based on clinical guidelines.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => {
                setRecommendations([]);
                setDemoComplete(false);
              }}
              variant="outline"
              className="w-full"
            >
              Run Demo Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}