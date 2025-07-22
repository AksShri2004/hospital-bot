
import { collection, addDoc, getDocs, query, where, doc, getDoc, orderBy, Timestamp } from "firebase/firestore"; 
import { db, auth } from "./firebase";

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  availability: Record<string, string[]>;
  image: string;
}

export interface Appointment {
  id: string;
  doctor: Doctor;
  doctorId: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  userId: string;
}

// You will need to seed this data into your Firestore "doctors" collection
export const mockDoctors: Omit<Doctor, 'id'>[] = [
  {
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


const processDoctorData = (doc: any): Doctor => {
    const data = doc.data();
    return { id: doc.id, ...data } as Doctor;
}

export const addAppointment = async (appointment: Omit<Appointment, 'id' | 'status' | 'userId' | 'doctor'> & { doctorId: string }) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const newAppointment = {
        ...appointment,
        userId: user.uid,
        status: 'Upcoming' as const,
    };
    const docRef = await addDoc(collection(db, "appointments"), newAppointment);
    return { ...newAppointment, id: docRef.id };
};


export const getDoctorsBySpecialization = async (specializations: string[]): Promise<Doctor[]> => {
  const doctorsCol = collection(db, 'doctors');
  let q;

  if (specializations.length > 0 && !specializations.includes('General Practitioner')) {
     q = query(doctorsCol, where("specialization", "in", specializations));
  } else {
    // If no specific specialization or if "General Practitioner" is requested, fetch all or just GPs.
    // For simplicity, we can fetch GPs in the else case.
    q = query(doctorsCol, where("specialization", "==", 'General Practitioner'));
  }
 
  const querySnapshot = await getDocs(q);
  const doctors = querySnapshot.docs.map(processDoctorData);
  
  // Fallback to General Practitioner if no specialists found
  if (doctors.length === 0 && !specializations.includes('General Practitioner')) {
    const gpQuery = query(doctorsCol, where("specialization", "==", "General Practitioner"));
    const gpSnapshot = await getDocs(gpQuery);
    return gpSnapshot.docs.map(processDoctorData);
  }
  
  return doctors;
};

export const getAllDoctors = async (): Promise<Doctor[]> => {
    const querySnapshot = await getDocs(collection(db, "doctors"));
    return querySnapshot.docs.map(processDoctorData);
};

export const getDoctorById = async (id: string): Promise<Doctor | undefined> => {
    const docRef = doc(db, "doctors", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return processDoctorData(docSnap);
    }
    return undefined;
};

export const getAppointments = async (): Promise<Appointment[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(collection(db, "appointments"), where("userId", "==", user.uid), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    const appointments = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const doctor = await getDoctorById(data.doctorId);
        if (!doctor) {
            // This case should ideally not happen if data integrity is maintained
            console.error(`Doctor with ID ${data.doctorId} not found for appointment ${doc.id}`);
            return null;
        }
        return { 
            id: doc.id, 
            ...data,
            doctor,
        } as Appointment;
    }));

    return appointments.filter((app): app is Appointment => app !== null);
};
