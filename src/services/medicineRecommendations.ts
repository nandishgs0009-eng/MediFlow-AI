// AI-driven medicine recommendation system
import { supabase } from "@/integrations/supabase/client";

export interface MedicalCondition {
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  duration?: string;
}

export interface PatientProfile {
  age: number;
  weight?: number;
  height?: number;
  allergies: string[];
  currentMedications: string[];
  medicalHistory: string[];
  conditions: MedicalCondition[];
}

export interface MedicineRecommendation {
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  category: string;
  interactions: string[];
  contraindications: string[];
  confidence: number;
  reasoning: string;
  sideEffects: string[];
}

export interface TreatmentContext {
  treatmentType: string;
  condition: string;
  severity: string;
  symptoms: string[];
  startDate: string;
  targetDuration?: string;
}

// Medicine database with comprehensive information
const MEDICINE_DATABASE: Record<string, any> = {
  // Pain Management
  "ibuprofen": {
    name: "Ibuprofen",
    genericName: "ibuprofen",
    category: "NSAIDs",
    indications: ["pain", "inflammation", "fever", "arthritis", "headache"],
    dosage: {
      adult: "200-400mg every 4-6 hours",
      elderly: "200mg every 6-8 hours",
      child: "5-10mg/kg every 6-8 hours"
    },
    maxDaily: "1200mg",
    interactions: ["warfarin", "aspirin", "ACE inhibitors"],
    contraindications: ["peptic ulcer", "severe heart failure", "kidney disease"],
    sideEffects: ["stomach upset", "dizziness", "headache"],
    pregnancy: "C"
  },
  "acetaminophen": {
    name: "Acetaminophen",
    genericName: "acetaminophen",
    category: "Analgesic",
    indications: ["pain", "fever", "headache"],
    dosage: {
      adult: "325-650mg every 4-6 hours",
      elderly: "325-500mg every 6 hours",
      child: "10-15mg/kg every 4-6 hours"
    },
    maxDaily: "3000mg",
    interactions: ["warfarin", "alcohol"],
    contraindications: ["severe liver disease"],
    sideEffects: ["rare allergic reactions"],
    pregnancy: "B"
  },
  
  // Antibiotics
  "amoxicillin": {
    name: "Amoxicillin",
    genericName: "amoxicillin",
    category: "Antibiotics",
    indications: ["bacterial infection", "pneumonia", "bronchitis", "ear infection"],
    dosage: {
      adult: "250-500mg every 8 hours",
      child: "20-40mg/kg/day divided every 8 hours"
    },
    duration: "7-10 days",
    interactions: ["methotrexate", "warfarin"],
    contraindications: ["penicillin allergy"],
    sideEffects: ["diarrhea", "nausea", "rash"],
    pregnancy: "B"
  },
  
  // Cardiovascular
  "lisinopril": {
    name: "Lisinopril",
    genericName: "lisinopril",
    category: "ACE Inhibitors",
    indications: ["hypertension", "heart failure", "diabetes"],
    dosage: {
      adult: "10-20mg once daily",
      elderly: "5-10mg once daily"
    },
    interactions: ["potassium supplements", "NSAIDs"],
    contraindications: ["pregnancy", "angioedema"],
    sideEffects: ["dry cough", "dizziness", "hyperkalemia"],
    pregnancy: "D"
  },
  
  // Diabetes
  "metformin": {
    name: "Metformin",
    genericName: "metformin",
    category: "Antidiabetic",
    indications: ["type 2 diabetes", "prediabetes", "PCOS"],
    dosage: {
      adult: "500mg twice daily with meals",
      elderly: "500mg once daily initially"
    },
    interactions: ["alcohol", "contrast dyes"],
    contraindications: ["kidney disease", "liver disease"],
    sideEffects: ["gastrointestinal upset", "metallic taste"],
    pregnancy: "B"
  },
  
  // Mental Health
  "sertraline": {
    name: "Sertraline",
    genericName: "sertraline",
    category: "SSRI",
    indications: ["depression", "anxiety", "panic disorder", "PTSD"],
    dosage: {
      adult: "25-50mg once daily",
      elderly: "25mg once daily initially"
    },
    interactions: ["MAOIs", "warfarin", "tramadol"],
    contraindications: ["MAOI use within 14 days"],
    sideEffects: ["nausea", "insomnia", "sexual dysfunction"],
    pregnancy: "C"
  },
  
  // Respiratory Medicines
  "albuterol": {
    name: "Albuterol",
    genericName: "albuterol",
    category: "Bronchodilator",
    indications: ["asthma", "copd", "breathing", "respiratory", "bronchospasm"],
    dosage: {
      adult: "2 puffs every 4-6 hours as needed",
      child: "1-2 puffs every 4-6 hours as needed"
    },
    interactions: ["beta blockers", "MAOIs"],
    contraindications: ["known hypersensitivity"],
    sideEffects: ["tremor", "nervousness", "headache"],
    pregnancy: "C"
  },
  "dextromethorphan": {
    name: "Dextromethorphan",
    genericName: "dextromethorphan",
    category: "Antitussive",
    indications: ["cough", "respiratory", "dry cough"],
    dosage: {
      adult: "15-30mg every 4 hours",
      child: "7.5-15mg every 4 hours"
    },
    maxDaily: "120mg",
    interactions: ["MAOIs", "SSRIs"],
    contraindications: ["MAOI use within 14 days"],
    sideEffects: ["dizziness", "drowsiness"],
    pregnancy: "C"
  },
  "guaifenesin": {
    name: "Guaifenesin",
    genericName: "guaifenesin",
    category: "Expectorant",
    indications: ["chest congestion", "productive cough", "respiratory", "mucus"],
    dosage: {
      adult: "200-400mg every 4 hours",
      child: "100-200mg every 4 hours"
    },
    maxDaily: "2400mg",
    interactions: [],
    contraindications: [],
    sideEffects: ["nausea", "vomiting", "stomach upset"],
    pregnancy: "C"
  },
  "fluticasone": {
    name: "Fluticasone",
    genericName: "fluticasone",
    category: "Corticosteroid",
    indications: ["asthma", "allergic rhinitis", "respiratory inflammation"],
    dosage: {
      adult: "1-2 sprays each nostril daily",
      child: "1 spray each nostril daily"
    },
    interactions: ["ritonavir", "ketoconazole"],
    contraindications: ["untreated infections"],
    sideEffects: ["nasal irritation", "headache"],
    pregnancy: "C"
  },
  "montelukast": {
    name: "Montelukast",
    genericName: "montelukast",
    category: "Leukotriene Antagonist",
    indications: ["asthma", "allergic rhinitis", "respiratory"],
    dosage: {
      adult: "10mg once daily in evening",
      child: "4-5mg once daily in evening"
    },
    interactions: ["phenobarbital", "rifampin"],
    contraindications: ["known hypersensitivity"],
    sideEffects: ["headache", "upper respiratory infection"],
    pregnancy: "B"
  },
  "cetirizine": {
    name: "Cetirizine",
    genericName: "cetirizine",
    category: "Antihistamine",
    indications: ["allergies", "rhinitis", "respiratory allergies", "hay fever"],
    dosage: {
      adult: "10mg once daily",
      elderly: "5mg once daily",
      child: "5mg once daily"
    },
    interactions: ["alcohol", "CNS depressants"],
    contraindications: ["severe kidney disease"],
    sideEffects: ["drowsiness", "dry mouth"],
    pregnancy: "B"
  }
};

// Disease-specific treatment protocols
const TREATMENT_PROTOCOLS: Record<string, any> = {
  // Cardiovascular
  hypertension: {
    firstLine: ["lisinopril", "amlodipine", "hydrochlorothiazide"],
    secondLine: ["losartan", "metoprolol"],
    lifestyle: ["low sodium diet", "regular exercise", "weight management"]
  },
  
  // Metabolic
  diabetes: {
    firstLine: ["metformin"],
    secondLine: ["glipizide", "insulin"],
    lifestyle: ["diet modification", "regular exercise", "blood glucose monitoring"]
  },
  
  // Mental Health
  depression: {
    firstLine: ["sertraline", "fluoxetine", "escitalopram"],
    secondLine: ["venlafaxine", "bupropion"],
    lifestyle: ["therapy", "exercise", "sleep hygiene"]
  },
  
  // Respiratory
  respiratory: {
    firstLine: ["albuterol", "dextromethorphan", "guaifenesin"],
    secondLine: ["fluticasone", "montelukast", "cetirizine"],
    supportive: ["saline spray", "humidifier"]
  },
  asthma: {
    firstLine: ["albuterol", "fluticasone"],
    secondLine: ["montelukast", "budesonide"],
    lifestyle: ["avoid triggers", "use spacer"]
  },
  cough: {
    firstLine: ["dextromethorphan", "guaifenesin"],
    secondLine: ["honey", "throat lozenges"],
    lifestyle: ["stay hydrated", "humidify air"]
  },
  "respiratory infection": {
    firstLine: ["guaifenesin", "dextromethorphan", "cetirizine"],
    secondLine: ["albuterol", "fluticasone"]
  },
  allergies: {
    firstLine: ["cetirizine", "fluticasone"],
    secondLine: ["montelukast", "diphenhydramine"]
  },
  
  // Infections
  infection: {
    bacterial: ["amoxicillin", "azithromycin"],
    viral: ["supportive care", "antiviral if severe"],
    lifestyle: ["rest", "hydration", "isolation"]
  }
};

class MedicineRecommendationEngine {
  
  /**
   * Generate personalized medicine recommendations based on treatment context
   */
  async generateRecommendations(
    treatmentContext: TreatmentContext,
    patientProfile: PatientProfile
  ): Promise<MedicineRecommendation[]> {
    const recommendations: MedicineRecommendation[] = [];
    
    // Get condition-specific medicines
    const conditionKey = this.normalizeCondition(treatmentContext.condition);
    const protocolMedicines = this.getProtocolMedicines(conditionKey);
    
    for (const medicine of protocolMedicines.slice(0, 6)) { // Limit to prevent too many recommendations
      const medicineData = MEDICINE_DATABASE[medicine.toLowerCase()];
      if (!medicineData) continue;
      
      // Check contraindications and allergies
      const safety = this.checkSafety(medicineData, patientProfile);
      if (!safety.safe && recommendations.length >= 2) continue; // Skip unsafe meds only if we have alternatives
      
      // Calculate personalized dosage
      const dosage = this.calculatePersonalizedDosage(
        medicineData,
        patientProfile,
        treatmentContext
      );
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(
        medicineData,
        treatmentContext,
        patientProfile
      );
      
      recommendations.push({
        name: medicineData.name,
        genericName: medicineData.genericName,
        dosage: dosage.recommendation,
        frequency: dosage.frequency,
        duration: this.calculateDuration(treatmentContext, medicineData),
        instructions: this.generateInstructions(medicineData, patientProfile),
        category: medicineData.category,
        interactions: medicineData.interactions,
        contraindications: medicineData.contraindications,
        confidence,
        reasoning: this.generateReasoning(medicineData, treatmentContext),
        sideEffects: medicineData.sideEffects
      });
    }
    
    // Sort by confidence score
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Normalize condition names for protocol matching
   */
  private normalizeCondition(condition: string): string {
    const normalized = condition.toLowerCase().trim();
    
    // Map common variations
    const conditionMap: Record<string, string> = {
      "high blood pressure": "hypertension",
      "diabetes mellitus": "diabetes",
      "type 2 diabetes": "diabetes",
      "major depression": "depression",
      "bacterial infection": "infection",
      "upper respiratory infection": "infection"
    };
    
    return conditionMap[normalized] || normalized;
  }
  
  /**
   * Get medicines from treatment protocols
   */
  private getProtocolMedicines(condition: string): string[] {
    const protocol = TREATMENT_PROTOCOLS[condition];
    if (!protocol) {
      // If exact condition not found, try to find similar conditions
      const lowerCondition = condition.toLowerCase();
      const similarCondition = Object.keys(TREATMENT_PROTOCOLS).find(key => 
        key.includes(lowerCondition) || lowerCondition.includes(key)
      );
      
      if (similarCondition) {
        const similarProtocol = TREATMENT_PROTOCOLS[similarCondition];
        return [
          ...(similarProtocol.firstLine || []),
          ...(similarProtocol.secondLine || []),
          ...(similarProtocol.supportive || [])
        ];
      }
      
      // Fallback to general treatment
      const fallback = TREATMENT_PROTOCOLS["general treatment"];
      return [...(fallback.firstLine || []), ...(fallback.secondLine || [])];
    }
    
    return [
      ...(protocol.firstLine || []),
      ...(protocol.secondLine || []),
      ...(protocol.supportive || [])
    ];
  }
  
  /**
   * Get recommendations for any treatment name - works like a chatbot
   */
  async getRecommendationsForTreatment(
    treatmentName: string,
    description: string,
    patientProfile: PatientProfile
  ): Promise<MedicineRecommendation[]> {
    const recommendations: MedicineRecommendation[] = [];
    
    // Normalize treatment name and find matching medicines
    const normalizedTreatment = treatmentName.toLowerCase().trim();
    
    // Get medicines from protocols
    let medicines: string[] = [];
    
    // Try to find exact matches first
    const exactMatch = TREATMENT_PROTOCOLS[normalizedTreatment];
    if (exactMatch) {
      medicines = [
        ...(exactMatch.firstLine || []),
        ...(exactMatch.secondLine || []),
        ...(exactMatch.supportive || [])
      ];
    } else {
      // Search for partial matches in protocol keys
      const partialMatches = Object.keys(TREATMENT_PROTOCOLS).filter(key => 
        key.includes(normalizedTreatment) || normalizedTreatment.includes(key)
      );
      
      if (partialMatches.length > 0) {
        for (const match of partialMatches) {
          const protocol = TREATMENT_PROTOCOLS[match];
          medicines.push(
            ...(protocol.firstLine || []),
            ...(protocol.secondLine || []),
            ...(protocol.supportive || [])
          );
        }
      }
      
      // If still no matches, extract conditions from the treatment name
      const extractedConditions = this.extractConditionsFromText(normalizedTreatment + ' ' + description);
      for (const condition of extractedConditions) {
        const protocol = TREATMENT_PROTOCOLS[condition];
        if (protocol) {
          medicines.push(
            ...(protocol.firstLine || []),
            ...(protocol.secondLine || []),
            ...(protocol.supportive || [])
          );
        }
      }
    }
    
    // If no medicines found, provide general recommendations
    if (medicines.length === 0) {
      medicines = ['acetaminophen', 'ibuprofen', 'multivitamin'];
    }
    
    // Remove duplicates
    medicines = [...new Set(medicines)];
    
    // Generate recommendations for each medicine
    for (const medicineName of medicines.slice(0, 8)) {
      const medicineData = MEDICINE_DATABASE[medicineName.toLowerCase()];
      if (!medicineData) continue;
      
      // Check safety
      const safety = this.checkSafety(medicineData, patientProfile);
      
      // Calculate confidence based on match quality and safety
      let confidence = 80;
      if (exactMatch) confidence += 15;
      if (safety.safe) confidence += 5;
      if (safety.warnings.length > 0) confidence -= 10;
      
      recommendations.push({
        name: medicineData.name,
        genericName: medicineData.genericName,
        dosage: medicineData.dosage.adult,
        frequency: 'As directed by physician',
        duration: '7-14 days',
        instructions: `Take ${medicineData.name} as prescribed for ${treatmentName}`,
        category: medicineData.category,
        interactions: medicineData.interactions,
        contraindications: medicineData.contraindications,
        confidence: Math.min(confidence, 95),
        reasoning: `Recommended for ${treatmentName} treatment based on standard medical protocols`,
        sideEffects: medicineData.sideEffects
      });
    }
    
    // Sort by confidence and return
    return recommendations.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  }
  
  /**
   * Extract conditions from any text - enhanced version
   */
  private extractConditionsFromText(text: string): string[] {
    const lowerText = text.toLowerCase();
    const conditions: string[] = [];
    
    // Check against all protocol keys
    for (const protocolKey of Object.keys(TREATMENT_PROTOCOLS)) {
      if (lowerText.includes(protocolKey) || protocolKey.includes(lowerText)) {
        conditions.push(protocolKey);
      }
    }
    
    return [...new Set(conditions)];
  }
  
  /**
   * ChatGPT-like medicine recommendations based purely on treatment name
   */
  generateChatbotRecommendations(treatmentName: string, description?: string): MedicineRecommendation[] {
    const searchText = `${treatmentName} ${description || ''}`.toLowerCase();
    const recommendations: MedicineRecommendation[] = [];
    
    // Intelligent keyword mapping for treatments
    const treatmentKeywords = {
      // Pain and inflammation
      'pain': ['acetaminophen', 'ibuprofen', 'naproxen'],
      'headache': ['acetaminophen', 'ibuprofen', 'sumatriptan'],
      'migraine': ['sumatriptan', 'acetaminophen', 'ibuprofen'],
      'back': ['ibuprofen', 'naproxen', 'diclofenac'],
      'joint': ['ibuprofen', 'naproxen', 'diclofenac'],
      'arthritis': ['ibuprofen', 'naproxen', 'diclofenac'],
      'muscle': ['ibuprofen', 'naproxen', 'acetaminophen'],
      'inflammation': ['ibuprofen', 'naproxen', 'diclofenac'],
      
      // Cardiovascular
      'blood pressure': ['lisinopril', 'amlodipine', 'hydrochlorothiazide'],
      'hypertension': ['lisinopril', 'amlodipine', 'metoprolol'],
      'heart': ['metoprolol', 'lisinopril', 'atorvastatin'],
      'cholesterol': ['atorvastatin', 'simvastatin', 'rosuvastatin'],
      'cardiac': ['metoprolol', 'lisinopril', 'atorvastatin'],
      
      // Mental health
      'depression': ['sertraline', 'fluoxetine', 'escitalopram'],
      'anxiety': ['sertraline', 'escitalopram', 'buspirone'],
      'stress': ['sertraline', 'escitalopram', 'buspirone'],
      'mood': ['sertraline', 'fluoxetine', 'escitalopram'],
      'panic': ['sertraline', 'escitalopram', 'alprazolam'],
      
      // Diabetes
      'diabetes': ['metformin', 'glipizide', 'insulin'],
      'blood sugar': ['metformin', 'glipizide', 'insulin'],
      'glucose': ['metformin', 'glipizide', 'insulin'],
      
      // Infections
      'infection': ['amoxicillin', 'azithromycin', 'cephalexin'],
      'bacterial': ['amoxicillin', 'azithromycin', 'ciprofloxacin'],
      'antibiotic': ['amoxicillin', 'azithromycin', 'cephalexin'],
      'pneumonia': ['azithromycin', 'amoxicillin', 'doxycycline'],
      
      // Respiratory
      'respiratory': ['albuterol', 'dextromethorphan', 'guaifenesin'],
      'asthma': ['albuterol', 'fluticasone', 'budesonide'],
      'breathing': ['albuterol', 'fluticasone', 'budesonide'],
      'cough': ['dextromethorphan', 'guaifenesin', 'honey'],
      'congestion': ['guaifenesin', 'cetirizine', 'fluticasone'],
      'chest congestion': ['guaifenesin', 'dextromethorphan'],
      'bronchitis': ['dextromethorphan', 'guaifenesin', 'albuterol'],
      'allergy': ['cetirizine', 'fluticasone', 'montelukast'],
      'allergies': ['cetirizine', 'fluticasone', 'montelukast'],
      'rhinitis': ['cetirizine', 'fluticasone'],
      'hay fever': ['cetirizine', 'fluticasone', 'montelukast'],
      'sinus': ['cetirizine', 'fluticasone', 'guaifenesin'],
      
      // Digestive
      'acid': ['omeprazole', 'ranitidine', 'famotidine'],
      'reflux': ['omeprazole', 'ranitidine', 'famotidine'],
      'stomach': ['omeprazole', 'ranitidine', 'simethicone'],
      'ulcer': ['omeprazole', 'amoxicillin', 'clarithromycin'],
      'nausea': ['ondansetron', 'metoclopramide', 'promethazine'],
      
      // Sleep
      'sleep': ['melatonin', 'diphenhydramine', 'zolpidem'],
      'insomnia': ['melatonin', 'diphenhydramine', 'trazodone'],
      
      // Skin
      'skin': ['hydrocortisone', 'clotrimazole', 'mupirocin'],
      'rash': ['hydrocortisone', 'cetirizine', 'calamine'],
      'eczema': ['hydrocortisone', 'tacrolimus', 'moisturizer'],
      'acne': ['benzoyl peroxide', 'tretinoin', 'clindamycin'],
      
      // General wellness
      'vitamin': ['multivitamin', 'vitamin d', 'vitamin c'],
      'supplement': ['multivitamin', 'omega-3', 'probiotics'],
      'immune': ['vitamin c', 'vitamin d', 'zinc'],
      'energy': ['vitamin b12', 'iron', 'multivitamin']
    };
    
    // Find matching medicines based on keywords
    const suggestedMedicines = new Set<string>();
    
    // Check for keyword matches
    for (const [keyword, medicines] of Object.entries(treatmentKeywords)) {
      if (searchText.includes(keyword)) {
        medicines.forEach(med => suggestedMedicines.add(med));
      }
    }
    
    // If no matches found, provide general recommendations
    if (suggestedMedicines.size === 0) {
      ['acetaminophen', 'ibuprofen', 'multivitamin'].forEach(med => suggestedMedicines.add(med));
    }
    
    // Convert to recommendation objects
    Array.from(suggestedMedicines).slice(0, 6).forEach(medicineName => {
      const medicineData = MEDICINE_DATABASE[medicineName.toLowerCase()];
      if (medicineData) {
        recommendations.push({
          name: medicineData.name,
          genericName: medicineData.genericName,
          dosage: medicineData.dosage.adult,
          frequency: 'As directed by physician',
          duration: '7-14 days',
          instructions: `Take ${medicineData.name} as prescribed for ${treatmentName}`,
          category: medicineData.category,
          interactions: medicineData.interactions,
          contraindications: medicineData.contraindications,
          confidence: this.calculateKeywordConfidence(searchText, medicineName),
          reasoning: `Recommended for ${treatmentName} based on standard medical protocols`,
          sideEffects: medicineData.sideEffects
        });
      }
    });
    
    return recommendations.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  }
  
  /**
   * Calculate confidence based on keyword relevance
   */
  private calculateKeywordConfidence(searchText: string, medicineName: string): number {
    const relevanceMap: { [key: string]: number } = {
      'acetaminophen': searchText.includes('pain') || searchText.includes('fever') ? 95 : 70,
      'ibuprofen': searchText.includes('pain') || searchText.includes('inflammation') ? 90 : 65,
      'amoxicillin': searchText.includes('infection') || searchText.includes('bacterial') ? 95 : 60,
      'sertraline': searchText.includes('depression') || searchText.includes('anxiety') ? 90 : 50,
      'metformin': searchText.includes('diabetes') || searchText.includes('blood sugar') ? 95 : 40,
      'lisinopril': searchText.includes('blood pressure') || searchText.includes('hypertension') ? 90 : 45,
      // Respiratory medicines
      'albuterol': searchText.includes('respiratory') || searchText.includes('asthma') || searchText.includes('breathing') ? 95 : 50,
      'dextromethorphan': searchText.includes('respiratory') || searchText.includes('cough') ? 90 : 45,
      'guaifenesin': searchText.includes('respiratory') || searchText.includes('congestion') || searchText.includes('cough') ? 90 : 45,
      'fluticasone': searchText.includes('respiratory') || searchText.includes('allergy') || searchText.includes('asthma') ? 85 : 40,
      'montelukast': searchText.includes('respiratory') || searchText.includes('asthma') ? 85 : 35,
      'cetirizine': searchText.includes('respiratory') || searchText.includes('allergy') ? 80 : 35,
    };
    
    return relevanceMap[medicineName] || 75;
  }
  
  /**
   * Extract potential conditions from treatment description
   */
  extractConditionsFromDescription(description: string): string[] {
    const lowerDescription = description.toLowerCase();
    const conditions: string[] = [];
    
    // Common condition keywords
    const conditionKeywords = {
      'pain': ['pain', 'ache', 'hurt', 'sore'],
      'infection': ['infection', 'bacterial', 'viral', 'fever'],
      'inflammation': ['inflammation', 'swelling', 'inflamed'],
      'anxiety': ['anxiety', 'stress', 'worry', 'nervous'],
      'depression': ['depression', 'sad', 'mood', 'mental health'],
      'headache': ['headache', 'migraine', 'head pain'],
      'cough': ['cough', 'throat', 'respiratory'],
      'stomach': ['stomach', 'nausea', 'digestive', 'gastric'],
      'skin condition': ['rash', 'itch', 'skin', 'dermatitis']
    };
    
    for (const [condition, keywords] of Object.entries(conditionKeywords)) {
      if (keywords.some(keyword => lowerDescription.includes(keyword))) {
        conditions.push(condition);
      }
    }
    
    return conditions;
  }
  
  /**
   * Check medicine safety for patient
   */
  private checkSafety(medicineData: any, patientProfile: PatientProfile): {safe: boolean, warnings: string[]} {
    const warnings: string[] = [];
    let safe = true;
    
    // Check allergies
    if (patientProfile.allergies.some(allergy => 
      medicineData.contraindications.some((contra: string) => 
        contra.toLowerCase().includes(allergy.toLowerCase())
      )
    )) {
      safe = false;
      warnings.push("Patient has known allergy to this medication");
    }
    
    // Check drug interactions
    if (patientProfile.currentMedications.some(med => 
      medicineData.interactions.includes(med.toLowerCase())
    )) {
      warnings.push("Potential drug interaction detected");
    }
    
    // Age-based warnings
    if (patientProfile.age > 65 && medicineData.category === "NSAIDs") {
      warnings.push("Use with caution in elderly patients");
    }
    
    return { safe, warnings };
  }
  
  /**
   * Calculate personalized dosage based on patient factors
   */
  private calculatePersonalizedDosage(
    medicineData: any,
    patientProfile: PatientProfile,
    treatmentContext: TreatmentContext
  ): {recommendation: string, frequency: string} {
    let dosage = medicineData.dosage.adult;
    let frequency = "as directed";
    
    // Age-based adjustments
    if (patientProfile.age > 65 && medicineData.dosage.elderly) {
      dosage = medicineData.dosage.elderly;
    }
    
    // Weight-based adjustments (for applicable medicines)
    if (patientProfile.weight && medicineData.weightBased) {
      // Implement weight-based dosing logic
    }
    
    // Severity-based adjustments
    if (treatmentContext.severity === "severe") {
      // May need higher initial dose for severe conditions
    }
    
    // Extract frequency from dosage string
    if (dosage.includes("every")) {
      frequency = dosage.split("every")[1].trim();
    } else if (dosage.includes("once daily")) {
      frequency = "once daily";
    } else if (dosage.includes("twice daily")) {
      frequency = "twice daily";
    }
    
    return { recommendation: dosage, frequency };
  }
  
  /**
   * Calculate confidence score for recommendation
   */
  private calculateConfidence(
    medicineData: any,
    treatmentContext: TreatmentContext,
    patientProfile: PatientProfile
  ): number {
    let confidence = 0;
    
    // Base confidence from indication match
    if (medicineData.indications.includes(treatmentContext.condition.toLowerCase())) {
      confidence += 40;
    }
    
    // Symptom matching
    const matchingSymptoms = treatmentContext.symptoms.filter(symptom =>
      medicineData.indications.some((indication: string) =>
        indication.includes(symptom.toLowerCase())
      )
    );
    confidence += (matchingSymptoms.length / treatmentContext.symptoms.length) * 30;
    
    // Safety profile
    const safetyCheck = this.checkSafety(medicineData, patientProfile);
    if (safetyCheck.safe) {
      confidence += 20;
    } else {
      confidence -= 30;
    }
    
    // First-line vs second-line
    const condition = this.normalizeCondition(treatmentContext.condition);
    const protocol = TREATMENT_PROTOCOLS[condition];
    if (protocol?.firstLine?.includes(medicineData.name.toLowerCase())) {
      confidence += 10;
    }
    
    return Math.max(0, Math.min(100, confidence));
  }
  
  /**
   * Calculate treatment duration
   */
  private calculateDuration(treatmentContext: TreatmentContext, medicineData: any): string {
    if (medicineData.duration) return medicineData.duration;
    
    // Default durations based on condition type
    const condition = treatmentContext.condition.toLowerCase();
    if (condition.includes("infection")) return "7-10 days";
    if (condition.includes("pain")) return "as needed";
    if (condition.includes("chronic") || condition.includes("diabetes") || 
        condition.includes("hypertension")) return "ongoing";
    
    return treatmentContext.targetDuration || "as directed by physician";
  }
  
  /**
   * Generate personalized instructions
   */
  private generateInstructions(medicineData: any, patientProfile: PatientProfile): string {
    let instructions = "Take as directed by your healthcare provider. ";
    
    if (medicineData.category === "Antibiotics") {
      instructions += "Complete the full course even if symptoms improve. ";
    }
    
    if (medicineData.name === "Metformin") {
      instructions += "Take with meals to reduce stomach upset. ";
    }
    
    if (patientProfile.age > 65) {
      instructions += "Monitor for side effects closely due to age. ";
    }
    
    return instructions.trim();
  }
  
  /**
   * Generate reasoning for recommendation
   */
  private generateReasoning(medicineData: any, treatmentContext: TreatmentContext): string {
    const condition = treatmentContext.condition;
    const severity = treatmentContext.severity;
    
    return `${medicineData.name} is recommended for ${condition} based on current clinical guidelines. ` +
           `This medication is ${medicineData.category === "firstLine" ? "first-line" : "effective"} ` +
           `treatment for ${severity} ${condition}. The recommendation considers the patient's ` +
           `specific symptoms and medical profile.`;
  }
}

/**
 * Get patient profile from database
 */
export async function getPatientProfile(userId: string): Promise<PatientProfile | null> {
  try {
    // Get profile with medical information from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!profile) return null;
    
    // Get current medications from active treatments
    const { data: treatments } = await supabase
      .from('treatments')
      .select(`
        medicines(
          name
        )
      `)
      .eq('patient_id', userId)
      .eq('status', 'active');
    
    return {
      age: (profile as any).age || 30,
      weight: (profile as any).weight,
      height: (profile as any).height,
      allergies: (profile as any).allergies ? (profile as any).allergies.split(',') : [],
      currentMedications: treatments?.flatMap(t => t.medicines?.map((m: any) => m.name) || []) || [],
      medicalHistory: (profile as any).medical_history || [],
      conditions: [{
        condition: (profile as any).medical_condition || 'general',
        severity: 'moderate' as const,
        symptoms: []
      }]
    };
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return null;
  }
}

/**
 * Main function to get medicine recommendations
 */
export async function getMedicineRecommendations(
  treatmentName: string,
  treatmentDescription: string,
  userId: string,
  condition?: string
): Promise<MedicineRecommendation[]> {
  const engine = new MedicineRecommendationEngine();
  
  // Create a default patient profile if none exists
  let patientProfile = await getPatientProfile(userId);
  if (!patientProfile) {
    patientProfile = {
      age: 35,
      weight: 70,
      height: 170,
      allergies: [],
      currentMedications: [],
      medicalHistory: [],
      conditions: [{
        condition: 'general',
        severity: 'mild' as const,
        symptoms: []
      }]
    };
  }
  
  // Generate recommendations based on treatment name
  return await engine.getRecommendationsForTreatment(treatmentName, treatmentDescription, patientProfile);
}

export { MedicineRecommendationEngine };