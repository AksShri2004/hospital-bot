
export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  location: string;
  availability: Record<string, string[]>;
  image: string;
}

export interface Appointment {
  id: number;
  doctor: Doctor;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

const mockDoctors: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Evelyn Reed',
    specialization: 'Cardiology',
    location: 'Heart & Vascular Institute',
    availability: {
      '2024-08-10': ['09:00 AM', '11:00 AM', '02:00 PM'],
      '2024-08-11': ['10:00 AM', '03:00 PM'],
      '2024-08-12': ['09:00 AM', '11:00 AM'],
    },
    image: 'https://placehold.co/400x400',
  },
  {
    id: 2,
    name: 'Dr. Marcus Thorne',
    specialization: 'Dermatology',
    location: 'The Skin Health Center',
    availability: {
      '2024-08-10': ['09:30 AM', '11:30 AM'],
      '2024-08-12': ['01:00 PM', '04:00 PM'],
      '2024-08-13': ['10:00 AM', '12:00 PM'],
    },
    image: 'https://placehold.co/400x400',
  },
  {
    id: 3,
    name: 'Dr. Elena Petrova',
    specialization: 'Neurology',
    location: 'City General Hospital - Neurology Wing',
    availability: {
      '2024-08-12': ['08:00 AM', '10:00 AM'],
      '2024-08-13': ['11:00 AM', '02:30 PM'],
      '2024-08-14': ['08:00 AM', '10:00 AM'],
    },
    image: 'https://placehold.co/400x400',
  },
  {
    id: 4,
    name: 'Dr. Samuel Chen',
    specialization: 'Orthopedics',
    location: 'Metro Orthopedic Institute',
    availability: {
      '2024-08-11': ['09:00 AM', '01:00 PM'],
      '2024-08-14': ['10:00 AM', '03:00 PM'],
      '2024-08-15': ['09:00 AM', '11:30 AM'],
    },
    image: 'https://placehold.co/400x400',
  },
  {
    id: 5,
    name: 'Dr. Isabella Vance',
    specialization: 'Gastroenterology',
    location: 'Midtown Digestive Health',
    availability: {
      '2024-08-13': ['09:00 AM', '11:00 AM'],
      '2024-08-15': ['02:00 PM', '04:00 PM'],
      '2024-08-16': ['09:00 AM', '11:00 AM'],
    },
    image: 'https://placehold.co/400x400',
  },
  {
    id: 6,
    name: 'Dr. Liam Gallagher',
    specialization: 'General Practitioner',
    location: 'Community Health Clinic',
    availability: {
      '2024-08-10': ['10:00 AM', '12:00 PM', '03:00 PM'],
      '2024-08-11': ['09:00 AM', '11:00 AM'],
      '2024-08-12': ['02:00 PM', '04:00 PM'],
    },
    image: 'https://placehold.co/400x400',
  },
  {
    id: 7,
    name: 'Dr. Anya Sharma',
    specialization: 'Oncology',
    location: 'Hope Cancer Center',
    availability: {
      '2024-08-12': ['10:30 AM', '01:30 PM'],
      '2024-08-14': ['09:00 AM', '12:00 PM'],
      '2024-08-16': ['11:00 AM', '02:00 PM'],
    },
    image: 'https://placehold.co/400x400',
  },
  {
    id: 8,
    name: 'Dr. Ben Carter',
    specialization: 'Pediatrics',
    location: 'Children First Pediatrics',
    availability: {
      '2024-08-10': ['09:00 AM', '10:00 AM', '11:00 AM'],
      '2024-08-13': ['02:00 PM', '03:00 PM', '04:00 PM'],
      '2024-08-15': ['09:00 AM', '10:00 AM'],
    },
    image: 'https://placehold.co/400x400',
  },
];

const mockAppointments: Appointment[] = [
    {
        id: 1,
        doctor: mockDoctors[0],
        date: '2024-08-20',
        time: '09:00 AM',
        status: 'Upcoming',
    },
    {
        id: 2,
        doctor: mockDoctors[2],
        date: '2024-07-25',
        time: '11:00 AM',
        status: 'Completed',
    },
    {
        id: 3,
        doctor: mockDoctors[1],
        date: '2024-07-15',
        time: '01:00 PM',
        status: 'Completed',
    },
];


export const getDoctorsBySpecialization = (specializations: string[]): Doctor[] => {
  const normalizedSpecs = specializations.map(s => {
    const lower = s.toLowerCase();
    if (lower.endsWith('logist')) {
      return lower.slice(0, -3); // cardiologist -> cardiolog
    }
    if (lower.endsWith('ist')) {
      return lower.slice(0, -3); // dentist -> dent
    }
    if (lower.endsWith('ian')) {
      return lower.slice(0, -3); // pediatrician -> pediatric
    }
    if (lower.endsWith('s')) {
      return lower.slice(0, -1); // orthopedics -> orthopedic
    }
    return lower;
  });

  const doctors = mockDoctors.filter(doctor => {
    const doctorSpec = doctor.specialization.toLowerCase();
    return normalizedSpecs.some(spec => doctorSpec.includes(spec));
  });

  // If no specialist is found, recommend a General Practitioner
  if (doctors.length === 0) {
      return mockDoctors.filter(doc => doc.specialization.toLowerCase() === 'general practitioner');
  }
  return doctors;
};

export const getAllDoctors = (): Doctor[] => mockDoctors;
export const getDoctorById = (id: number): Doctor | undefined => mockDoctors.find(d => d.id === id);
export const getAppointments = (): Appointment[] => mockAppointments;
