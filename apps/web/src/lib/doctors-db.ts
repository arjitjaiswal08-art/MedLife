export interface DoctorPlace {
  place_id: string;
  name: string;
  place_type: 'hospital' | 'clinic';
  address: string;
  city: string;
  phone: string;
  rating: number;
  review_count: number;
  open_now: boolean;
  speciality: string;
  specialist_types: string[];
  emergency_capable: boolean;
  location: {
    lat: number;
    lng: number;
  };
  photo_url: string;
  photos?: string[];
  website?: string;
}

export const DOCTORS_DATABASE: DoctorPlace[] = [
  // ── Delhi NCR ──
  {
    place_id: 'del_ortho_1',
    name: 'Fortis Escorts & Orthopedic Spine Centre',
    place_type: 'hospital',
    address: 'Okhla Road, Sukhdev Vihar, New Delhi',
    city: 'Delhi',
    phone: '+91 11 4713 5000',
    rating: 4.8,
    review_count: 512,
    open_now: true,
    speciality: 'Orthopedic Surgeon, Spine & Joint Care',
    specialist_types: ['Orthopedic Surgeon', 'Neurologist', 'Physiotherapist', 'Emergency Physician'],
    emergency_capable: true,
    location: { lat: 28.5603, lng: 77.2732 },
    photo_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
    ],
    website: 'https://www.fortishealthcare.com',
  },
  {
    place_id: 'del_doc_2',
    name: 'Dr. Gaurav Saini Ortho & Spine Clinic',
    place_type: 'clinic',
    address: 'Ring Road, South Extension Part II, New Delhi',
    city: 'Delhi',
    phone: '+91 98112 34567',
    rating: 4.9,
    review_count: 230,
    open_now: true,
    speciality: 'Orthopedic Surgeon',
    specialist_types: ['Orthopedic Surgeon', 'Physiotherapist'],
    emergency_capable: false,
    location: { lat: 28.5701, lng: 77.2215 },
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80',
    website: 'https://drgauravspine.com',
  },
  {
    place_id: 'del_neuro_1',
    name: 'Indraprastha Apollo Neuro & Brain Institute',
    place_type: 'hospital',
    address: 'Sarita Vihar, Mathura Road, New Delhi',
    city: 'Delhi',
    phone: '+91 11 2692 5858',
    rating: 4.7,
    review_count: 890,
    open_now: true,
    speciality: 'Neurologist & Neurosurgeon',
    specialist_types: ['Neurologist', 'General Physician', 'Emergency Physician', 'Cardiologist'],
    emergency_capable: true,
    location: { lat: 28.5385, lng: 77.2842 },
    photo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
    website: 'https://delhi.apollohospitals.com',
  },
  {
    place_id: 'del_cardio_1',
    name: 'Max Super Speciality Hospital Saket',
    place_type: 'hospital',
    address: '1, 2 Press Enclave Road, Saket, New Delhi',
    city: 'Delhi',
    phone: '+91 11 2651 5050',
    rating: 4.8,
    review_count: 1420,
    open_now: true,
    speciality: 'Cardiologist, Emergency Care & Multispeciality',
    specialist_types: ['Cardiologist', 'Pulmonologist', 'General Physician', 'Emergency Physician', 'Orthopedic Surgeon', 'Gastroenterologist'],
    emergency_capable: true,
    location: { lat: 28.5283, lng: 77.2115 },
    photo_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80',
    website: 'https://www.maxhealthcare.in',
  },
  {
    place_id: 'del_derm_1',
    name: 'Kaya Skin & Dermatology Clinic',
    place_type: 'clinic',
    address: 'Block M, Greater Kailash II, New Delhi',
    city: 'Delhi',
    phone: '+91 11 4163 1234',
    rating: 4.6,
    review_count: 180,
    open_now: true,
    speciality: 'Dermatologist',
    specialist_types: ['Dermatologist'],
    emergency_capable: false,
    location: { lat: 28.5355, lng: 77.2415 },
    photo_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
  },
  {
    place_id: 'del_gp_1',
    name: 'Apollo Spectra Clinic & Diagnostics',
    place_type: 'clinic',
    address: 'A-19, Kailash Colony, New Delhi',
    city: 'Delhi',
    phone: '+91 11 4050 5555',
    rating: 4.7,
    review_count: 310,
    open_now: true,
    speciality: 'General Physician & Family Medicine',
    specialist_types: ['General Physician', 'ENT Specialist', 'Pediatrician', 'Dermatologist'],
    emergency_capable: false,
    location: { lat: 28.5539, lng: 77.2412 },
    photo_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
  },

  // ── Mumbai ──
  {
    place_id: 'mum_hosp_1',
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    place_type: 'hospital',
    address: 'Rao Saheb, Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai',
    city: 'Mumbai',
    phone: '+91 22 4269 6969',
    rating: 4.8,
    review_count: 1890,
    open_now: true,
    speciality: 'Orthopedic Surgeon, Cardiologist, Neurologist',
    specialist_types: ['Orthopedic Surgeon', 'Cardiologist', 'Neurologist', 'Emergency Physician', 'General Physician', 'Pulmonologist'],
    emergency_capable: true,
    location: { lat: 19.1314, lng: 72.8256 },
    photo_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
  },
  {
    place_id: 'mum_ortho_1',
    name: 'Dr. L. H. Hiranandani Spine & Joint Clinic',
    place_type: 'hospital',
    address: 'Hillside Avenue, Hiranandani Gardens, Powai, Mumbai',
    city: 'Mumbai',
    phone: '+91 22 2576 3300',
    rating: 4.7,
    review_count: 940,
    open_now: true,
    speciality: 'Orthopedic Surgeon',
    specialist_types: ['Orthopedic Surgeon', 'Physiotherapist', 'Neurologist'],
    emergency_capable: true,
    location: { lat: 19.1197, lng: 72.9051 },
    photo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
  },
  {
    place_id: 'mum_derm_1',
    name: 'Skinfiniti Aesthetic & Dermatology Clinic',
    place_type: 'clinic',
    address: 'Linking Road, Bandra West, Mumbai',
    city: 'Mumbai',
    phone: '+91 22 2642 9898',
    rating: 4.8,
    review_count: 215,
    open_now: true,
    speciality: 'Dermatologist',
    specialist_types: ['Dermatologist'],
    emergency_capable: false,
    location: { lat: 19.0596, lng: 72.8295 },
    photo_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
  },

  // ── Bangalore ──
  {
    place_id: 'blr_ortho_1',
    name: 'Manipal Hospital Spine, Joint & Orthopedics',
    place_type: 'hospital',
    address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru',
    city: 'Bangalore',
    phone: '+91 80 2502 4444',
    rating: 4.8,
    review_count: 1720,
    open_now: true,
    speciality: 'Orthopedic Surgeon & Emergency Trauma',
    specialist_types: ['Orthopedic Surgeon', 'Neurologist', 'Emergency Physician', 'Cardiologist', 'Pulmonologist', 'General Physician'],
    emergency_capable: true,
    location: { lat: 12.9592, lng: 77.6534 },
    photo_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
  },
  {
    place_id: 'blr_neuro_1',
    name: 'NIMHANS Speciality Neuro Centre',
    place_type: 'hospital',
    address: 'Hosur Road, Lakkasandra, Bengaluru',
    city: 'Bangalore',
    phone: '+91 80 2699 5000',
    rating: 4.9,
    review_count: 2100,
    open_now: true,
    speciality: 'Neurologist & Psychiatrist',
    specialist_types: ['Neurologist', 'Psychiatrist', 'Emergency Physician'],
    emergency_capable: true,
    location: { lat: 12.9389, lng: 77.5956 },
    photo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
  },
  {
    place_id: 'blr_clinic_1',
    name: 'Aster Clinic Indiranagar',
    place_type: 'clinic',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
    city: 'Bangalore',
    phone: '+91 80 4555 8888',
    rating: 4.7,
    review_count: 340,
    open_now: true,
    speciality: 'General Physician & Dermatology Care',
    specialist_types: ['General Physician', 'Dermatologist', 'ENT Specialist', 'Pediatrician', 'Dentist'],
    emergency_capable: false,
    location: { lat: 12.9719, lng: 77.6412 },
    photo_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
  },

  // ── Chennai ──
  {
    place_id: 'chn_hosp_1',
    name: 'Apollo Hospitals Greams Road',
    place_type: 'hospital',
    address: '21 Greams Lane, Off Greams Road, Thousand Lights, Chennai',
    city: 'Chennai',
    phone: '+91 44 2829 0200',
    rating: 4.8,
    review_count: 2450,
    open_now: true,
    speciality: 'Multispeciality Hospital & Orthopedic Institute',
    specialist_types: ['Orthopedic Surgeon', 'Cardiologist', 'Neurologist', 'Emergency Physician', 'General Physician', 'Gastroenterologist'],
    emergency_capable: true,
    location: { lat: 13.0604, lng: 80.2524 },
    photo_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
  },

  // ── Hyderabad ──
  {
    place_id: 'hyd_hosp_1',
    name: 'KIMS Hospitals Secunderabad',
    place_type: 'hospital',
    address: 'Minister Road, Krishna Nagar Colony, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    phone: '+91 40 4488 5000',
    rating: 4.8,
    review_count: 1600,
    open_now: true,
    speciality: 'Orthopedic Surgeon, Cardiologist & Neurosciences',
    specialist_types: ['Orthopedic Surgeon', 'Cardiologist', 'Neurologist', 'Emergency Physician', 'General Physician'],
    emergency_capable: true,
    location: { lat: 17.4375, lng: 78.4855 },
    photo_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
  },

  // ── Mohali / Chandigarh ──
  {
    place_id: 'moh_ortho_1',
    name: 'Max Super Speciality Hospital Mohali',
    place_type: 'hospital',
    address: 'Near Civil Hospital, Phase-VI, Mohali',
    city: 'Mohali',
    phone: '+91 172 665 2000',
    rating: 4.8,
    review_count: 880,
    open_now: true,
    speciality: 'Orthopedic Surgeon & Emergency Care',
    specialist_types: ['Orthopedic Surgeon', 'Neurologist', 'Cardiologist', 'Emergency Physician', 'General Physician'],
    emergency_capable: true,
    location: { lat: 30.7161, lng: 76.7118 },
    photo_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
  },
  {
    place_id: 'moh_doc_2',
    name: 'Dr. Vinay Sakhuja Nephro & Medical Centre',
    place_type: 'clinic',
    address: 'SCO 45, Phase-VII, Mohali',
    city: 'Mohali',
    phone: '+91 172 509 8877',
    rating: 4.9,
    review_count: 140,
    open_now: true,
    speciality: 'Nephrologist & Internal Medicine',
    specialist_types: ['Nephrologist', 'General Physician'],
    emergency_capable: false,
    location: { lat: 30.7046, lng: 76.7179 },
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80',
  },
];

// Haversine distance in meters
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
