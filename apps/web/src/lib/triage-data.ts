export interface SymptomMapping {
  symptom: string;
  specialist: string;
  urgency: 'low' | 'moderate' | 'high' | 'emergency';
}

export const EMERGENCY_KEYWORDS = [
  'chest pain',
  'heart attack',
  'cannot breathe',
  "can't breathe",
  'difficulty breathing',
  'shortness of breath',
  'unconscious',
  'loss of consciousness',
  'stroke',
  'facial drooping',
  'slurred speech',
  'paralysis',
  'severe bleeding',
  'coughing blood',
  'vomiting blood',
  'seizure',
  'convulsion',
  'anaphylaxis',
  'severe allergic reaction',
  'head trauma',
  'choking',
  'collapsed',
  'poisoning',
  'poison',
  'electric shock',
  'severe burn',
];

export const SPECIALIST_KEYWORD_RULES: Array<{
  keywords: string[];
  specialist: string;
  explanation: string;
  defaultUrgency: 'low' | 'moderate' | 'high' | 'emergency';
}> = [
  {
    keywords: ['lower back pain', 'back pain', 'sciatica', 'spine', 'slip disc', 'lumbar', 'radiating down my leg', 'radiating pain', 'leg pain from back'],
    specialist: 'Orthopedic Surgeon',
    explanation: 'Lower back pain with radiation down the leg strongly indicates lumbar nerve root irritation or sciatica, which requires evaluation by an Orthopedic Surgeon or Spine Specialist.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['bone', 'joint', 'fracture', 'knee pain', 'hip pain', 'shoulder pain', 'ligament', 'sprain', 'swollen joint', 'arthritis', 'ortho'],
    specialist: 'Orthopedic Surgeon',
    explanation: 'Musculoskeletal and joint symptoms are best diagnosed and treated by an Orthopedic Surgeon.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['migraine', 'headache', 'severe headache', 'light sensitivity', 'throbbing head', 'cluster headache', 'dizziness', 'vertigo', 'loss of balance', 'numbness', 'tingling', 'tremor', 'neuropathy'],
    specialist: 'Neurologist',
    explanation: 'Severe headaches, light sensitivity, vertigo, or sensory changes are neurological symptoms best assessed by a Neurologist.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['skin rash', 'rash', 'itching', 'itchy skin', 'red rash', 'hives', 'urticaria', 'acne', 'eczema', 'psoriasis', 'boils', 'fungal infection', 'dermatitis', 'mole change', 'hair loss'],
    specialist: 'Dermatologist',
    explanation: 'Sudden or persistent skin rashes, eruptions, and dermatological conditions should be diagnosed by a Dermatologist.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['chest pain', 'chest tightness', 'heart', 'palpitation', 'irregular heartbeat', 'angina', 'cardiac', 'racing pulse'],
    specialist: 'Cardiologist',
    explanation: 'Chest discomfort, palpitations, or cardiac symptoms require immediate clinical investigation by a Cardiologist.',
    defaultUrgency: 'emergency',
  },
  {
    keywords: ['fever', 'high fever', 'chills', 'body aches', 'flu', 'viral', 'fatigue', 'weakness', 'malaise', 'infection', 'cold and cough'],
    specialist: 'General Physician',
    explanation: 'Acute febrile illnesses and generalized viral/bacterial infections are best managed initially by a General Physician.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['anxiety', 'panic attacks', 'panic', 'depression', 'insomnia', 'stress', 'mood swings', 'hallucinations', 'mental health', 'phobia'],
    specialist: 'Psychiatrist',
    explanation: 'Severe anxiety, panic episodes, or emotional distress benefit from professional psychiatric and behavioral assessment.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['asthma', 'cough', 'wheezing', 'phlegm', 'shortness of breath', 'bronchitis', 'lung', 'pulmonary', 'chest congestion'],
    specialist: 'Pulmonologist',
    explanation: 'Respiratory symptoms, persistent cough, or airway inflammation warrant consultation with a Pulmonologist.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['stomach pain', 'abdominal pain', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'acidity', 'gerd', 'heartburn', 'bloating', 'gas', 'indigestion', 'jaundice'],
    specialist: 'Gastroenterologist',
    explanation: 'Digestive symptoms, abdominal discomfort, and gastrointestinal concerns are treated by a Gastroenterologist.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['ear pain', 'tinnitus', 'ringing in ear', 'hearing loss', 'sore throat', 'sinus', 'sinusitis', 'nasal congestion', 'runny nose', 'tonsils', 'hoarseness'],
    specialist: 'ENT Specialist',
    explanation: 'Disorders affecting the ear, nose, sinuses, or throat should be examined by an Ear, Nose & Throat (ENT) Specialist.',
    defaultUrgency: 'low',
  },
  {
    keywords: ['toothache', 'tooth pain', 'bleeding gums', 'swollen gum', 'cavity', 'wisdom tooth', 'dental', 'teeth'],
    specialist: 'Dentist',
    explanation: 'Dental issues, tooth pain, or gum inflammation require clinical intervention by a Dentist.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['eye pain', 'blurred vision', 'double vision', 'red eye', 'eye discharge', 'cataract', 'dry eyes', 'vision loss'],
    specialist: 'Ophthalmologist',
    explanation: 'Vision disturbances, eye discomfort, and ocular pathology are evaluated by an Ophthalmologist.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['period pain', 'menstrual', 'irregular periods', 'pregnancy', 'vaginal discharge', 'pcos', 'pelvic pain', 'ovary'],
    specialist: 'Gynecologist',
    explanation: 'Reproductive and gynecological symptoms should be addressed by a Gynecologist.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['burning urination', 'kidney pain', 'blood in urine', 'frequent urination', 'renal', 'stone pain', 'foamy urine'],
    specialist: 'Nephrologist',
    explanation: 'Urinary abnormalities, flank pain, or renal system concerns require specialist assessment by a Nephrologist or Urologist.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['diabetes', 'high blood sugar', 'thyroid', 'hormonal imbalance', 'weight gain unexplained', 'unexplained weight loss'],
    specialist: 'Endocrinologist',
    explanation: 'Metabolic and endocrine disorders like diabetes or thyroid dysfunction are managed by an Endocrinologist.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['child', 'infant', 'baby', 'toddler', 'newborn'],
    specialist: 'Pediatrician',
    explanation: 'Medical symptoms occurring in children or infants require evaluation by a qualified Pediatrician.',
    defaultUrgency: 'moderate',
  },
  {
    keywords: ['physiotherapy', 'rehab', 'posture', 'muscle strain', 'mobility'],
    specialist: 'Physiotherapist',
    explanation: 'Physical conditioning, rehabilitation, and muscular mobility restoration are guided by a Physiotherapist.',
    defaultUrgency: 'low',
  },
];

export const CITY_FEES: Record<string, Record<string, { min: number; max: number }>> = {
  Delhi: {
    'General Physician': { min: 400, max: 800 },
    'Cardiologist': { min: 900, max: 2500 },
    'Neurologist': { min: 900, max: 2500 },
    'Orthopedic Surgeon': { min: 700, max: 2000 },
    'Dermatologist': { min: 600, max: 1800 },
    'Psychiatrist': { min: 800, max: 2500 },
    'Pulmonologist': { min: 700, max: 2000 },
    'ENT Specialist': { min: 500, max: 1500 },
    'Dentist': { min: 400, max: 1500 },
    'Gastroenterologist': { min: 800, max: 2200 },
    'Gynecologist': { min: 700, max: 2000 },
    'Pediatrician': { min: 500, max: 1500 },
    'Nephrologist': { min: 800, max: 2200 },
    'Endocrinologist': { min: 700, max: 2000 },
    'Emergency Physician': { min: 1000, max: 3000 },
  },
  Mumbai: {
    'General Physician': { min: 500, max: 1000 },
    'Cardiologist': { min: 1000, max: 3000 },
    'Neurologist': { min: 1000, max: 3000 },
    'Orthopedic Surgeon': { min: 800, max: 2500 },
    'Dermatologist': { min: 700, max: 2000 },
    'Psychiatrist': { min: 1000, max: 3000 },
    'Pulmonologist': { min: 800, max: 2500 },
    'ENT Specialist': { min: 600, max: 1800 },
    'Dentist': { min: 500, max: 2000 },
    'Gastroenterologist': { min: 900, max: 2800 },
    'Gynecologist': { min: 800, max: 2500 },
    'Pediatrician': { min: 600, max: 1800 },
    'Emergency Physician': { min: 1200, max: 3500 },
  },
  Bangalore: {
    'General Physician': { min: 400, max: 900 },
    'Cardiologist': { min: 900, max: 2800 },
    'Neurologist': { min: 900, max: 2800 },
    'Orthopedic Surgeon': { min: 750, max: 2200 },
    'Dermatologist': { min: 600, max: 1800 },
    'Psychiatrist': { min: 900, max: 2500 },
    'Pulmonologist': { min: 750, max: 2200 },
    'ENT Specialist': { min: 550, max: 1600 },
    'Dentist': { min: 400, max: 1800 },
    'Gastroenterologist': { min: 850, max: 2500 },
    'Gynecologist': { min: 750, max: 2200 },
    'Pediatrician': { min: 550, max: 1600 },
    'Emergency Physician': { min: 1000, max: 3000 },
  },
};

export const DEFAULT_FEE_RANGES: Record<string, { min: number; max: number }> = {
  'General Physician': { min: 400, max: 800 },
  'Cardiologist': { min: 800, max: 2500 },
  'Neurologist': { min: 800, max: 2500 },
  'Orthopedic Surgeon': { min: 700, max: 2000 },
  'Dermatologist': { min: 500, max: 1800 },
  'Psychiatrist': { min: 800, max: 2500 },
  'Pulmonologist': { min: 700, max: 2000 },
  'ENT Specialist': { min: 500, max: 1500 },
  'Dentist': { min: 400, max: 1500 },
  'Gastroenterologist': { min: 750, max: 2200 },
  'Gynecologist': { min: 700, max: 2000 },
  'Pediatrician': { min: 500, max: 1500 },
  'Nephrologist': { min: 800, max: 2200 },
  'Endocrinologist': { min: 700, max: 2000 },
  'Emergency Physician': { min: 1000, max: 3000 },
  'Physiotherapist': { min: 400, max: 1200 },
};
