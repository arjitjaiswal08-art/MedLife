import {
  EMERGENCY_KEYWORDS,
  SPECIALIST_KEYWORD_RULES,
  CITY_FEES,
  DEFAULT_FEE_RANGES,
} from './triage-data';

export interface AnalysisOutput {
  specialist_type: string;
  specialist_explanation: string;
  urgency_level: 'low' | 'moderate' | 'high' | 'emergency';
  urgency_reason: string;
  emergency_mode: boolean;
  fee_estimate: {
    min: number;
    max: number;
    currency: string;
    note: string;
  };
  search_id: string;
  fallback: boolean;
}

export function getFeeEstimate(specialist: string, city?: string) {
  const normCity = city ? city.trim().toLowerCase() : '';
  let matchCityKey = Object.keys(CITY_FEES).find(
    (c) => c.toLowerCase() === normCity
  );

  const cityTable = matchCityKey ? CITY_FEES[matchCityKey] : null;
  const range = (cityTable && cityTable[specialist]) || DEFAULT_FEE_RANGES[specialist] || { min: 400, max: 1200 };

  return {
    min: range.min,
    max: range.max,
    currency: 'INR',
    note: 'Estimated consultation range in India. Actual fees may vary by hospital and doctor seniority.',
  };
}

export async function analyzeSymptoms(
  symptomText: string,
  city?: string
): Promise<AnalysisOutput> {
  const text = (symptomText || '').toLowerCase().trim();
  const searchId = `srch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Check for life-threatening emergencies
  const isEmergency = EMERGENCY_KEYWORDS.some((kw) => text.includes(kw));
  if (isEmergency) {
    const isCardiac = text.includes('chest') || text.includes('heart') || text.includes('angina');
    const specialist = isCardiac ? 'Cardiologist' : 'Emergency Physician';
    return {
      specialist_type: specialist,
      specialist_explanation:
        'Your symptoms indicate a critical emergency requiring immediate clinical attention. Please seek urgent care at the nearest hospital emergency room.',
      urgency_level: 'emergency',
      urgency_reason: 'Red-flag acute symptoms detected that may pose severe immediate health risks.',
      emergency_mode: true,
      fee_estimate: getFeeEstimate(specialist, city),
      search_id: searchId,
      fallback: false,
    };
  }

  // 2. Check rule matches (highest priority matching)
  for (const rule of SPECIALIST_KEYWORD_RULES) {
    const matched = rule.keywords.some((kw) => text.includes(kw));
    if (matched) {
      let urgency = rule.defaultUrgency;
      if (text.includes('severe') || text.includes('unbearable') || text.includes('102') || text.includes('103') || text.includes('fever above')) {
        if (urgency === 'low' || urgency === 'moderate') urgency = 'high';
      }

      return {
        specialist_type: rule.specialist,
        specialist_explanation: rule.explanation,
        urgency_level: urgency,
        urgency_reason: `Symptom patterns map to ${rule.specialist} based on clinical triage criteria.`,
        emergency_mode: false,
        fee_estimate: getFeeEstimate(rule.specialist, city),
        search_id: searchId,
        fallback: false,
      };
    }
  }

  // 3. Fallback: General Physician
  const gp = 'General Physician';
  return {
    specialist_type: gp,
    specialist_explanation:
      'A General Physician is the recommended primary specialist to clinically assess your symptoms and guide any further diagnostic tests.',
    urgency_level: 'moderate',
    urgency_reason: 'Comprehensive initial evaluation recommended.',
    emergency_mode: false,
    fee_estimate: getFeeEstimate(gp, city),
    search_id: searchId,
    fallback: true,
  };
}
