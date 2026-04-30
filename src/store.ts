import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type Role = 'admin' | 'recepcao' | 'consulta' | null;

export interface User {
  name: string;
  role: Role;
  specialty?: string;
  professionalId?: string;
}

export interface Beneficiary {
  id: string;
  photoUrl?: string;
  // DADOS DO BENEFICIARIO
  fullName: string;
  birthDate: string;
  gender: string;
  rg: string;
  cpf: string;
  diagnosis: string;
  cid: string;
  supportLevel: string; // 'Sim' ou 'Não'
  supportLevelDetails?: string;
  comorbidities: string;
  isStudent: string; // 'Sim' ou 'Não'
  schoolName?: string;
  schoolGrade?: string;
  // PERFIL E NECESSIDADES
  hasAllergies: string;
  allergiesDetails?: string;
  continuousMedication: string;
  medicationDetails?: string;
  activities: string[]; // Apoio Informativo, etc
  // DADOS DO RESPONSÁVEL
  respName: string;
  respPhone: string;
  respAddress: string;
  respRg: string;
  respCpf: string;
  respRelationship: string;
  respRelationshipOther?: string;
  familyIncome: string;
  irpfDependent: string;
  
  inclusionDate: string;
}

export interface Professional {
  id: string;
  photoUrl?: string;
  name: string;
  specialty: string;
  phone: string;
  cpf?: string;
  login: string;
  password: string;
  accessRole: Exclude<Role, null>;
  registration?: string;
}

export interface Volunteer {
  id: string;
  photoUrl?: string;
  name: string;
  function: string;
  phone: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  value: number;
  date: string;
  category: string;
  description?: string;
  eventDate?: string;
}

export interface Consultation {
  id: string;
  beneficiaryId: string;
  professionalId: string;
  date: string;
  anamnesis: string;
  record: string;
  attendance: 'presente' | 'falta';
}

export interface MedicalEvolution {
  id: string;
  dateTime: string;
  activities: string;
  performance: string;
  planning: string;
}

export interface MedicalRecord {
  id: string;
  beneficiaryId: string;
  professionalId: string;
  professionalName: string;
  specialty: string;
  registration?: string;
  weight?: string;
  height?: string;
  evaluationDate?: string;
  supports?: string[];
  supportObservations?: string;
  clinicalHistory?: string;
  mainComplaint?: string;
  hmpHma?: string;
  medicationInUse?: string;
  foodRestriction?: string;
  foodRestrictionDetails?: string;
  lifeHabits?: string;
  treatmentsDone?: string;
  surgeries?: string;
  surgeryDetails?: string;
  examResults?: string;
  generalHealth?: string;
  seizures?: string;
  seizureFrequency?: string;
  constipation?: string;
  sleep?: string;
  feeding?: string[];
  liquids?: string[];
  hygiene?: string;
  hygieneObservations?: string;
  clothing?: string;
  safety?: string;
  familyPotentials?: string;
  familyDifficulties?: string;
  familyExpectations?: string;
  evolutions: MedicalEvolution[];
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  beneficiaryId: string;
  professionalId: string;
  date: string;
  time: string;
  type: string;
  notes?: string;
}

interface AppState {
  currentUser: User | null;
  beneficiaries: Beneficiary[];
  professionals: Professional[];
  volunteers: Volunteer[];
  finances: FinanceRecord[];
  consultations: Consultation[];
  chatMessages: ChatMessage[];
  medicalRecords: MedicalRecord[];
  schedule: ScheduleItem[];
  
  login: (role: Role, name: string, specialty?: string, professionalId?: string) => void;
  logout: () => void;
  
  addBeneficiary: (b: Omit<Beneficiary, 'id' | 'inclusionDate'>) => void;
  updateBeneficiary: (id: string, b: Partial<Beneficiary>) => void;
  deleteBeneficiary: (id: string) => void;

  addProfessional: (p: Omit<Professional, 'id'>) => void;
  updateProfessional: (id: string, p: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;

  addVolunteer: (v: Omit<Volunteer, 'id'>) => void;
  updateVolunteer: (id: string, v: Partial<Volunteer>) => void;
  deleteVolunteer: (id: string) => void;

  addFinance: (f: Omit<FinanceRecord, 'id'>) => void;
  
  addConsultation: (c: Omit<Consultation, 'id'>) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  saveMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'updatedAt'> & { id?: string }) => void;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  deleteScheduleItem: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      beneficiaries: [],
      professionals: [],
      volunteers: [],
      finances: [],
      consultations: [],
      chatMessages: [],
      medicalRecords: [],
      schedule: [],
      
      login: (role, name, specialty, professionalId) => set({ currentUser: { role, name, specialty, professionalId } }),
      logout: () => set({ currentUser: null }),
      
      addBeneficiary: (b) => set((state) => ({
        beneficiaries: [...state.beneficiaries, { ...b, id: uuidv4(), inclusionDate: new Date().toISOString() }]
      })),
      updateBeneficiary: (id, b) => set((state) => ({
        beneficiaries: state.beneficiaries.map((item) => item.id === id ? { ...item, ...b } : item)
      })),
      deleteBeneficiary: (id) => set((state) => ({
        beneficiaries: state.beneficiaries.filter((item) => item.id !== id)
      })),

      addProfessional: (p) => set((state) => ({
        professionals: [...state.professionals, { ...p, id: uuidv4() }]
      })),
      updateProfessional: (id, p) => set((state) => ({
        professionals: state.professionals.map((item) => item.id === id ? { ...item, ...p } : item)
      })),
      deleteProfessional: (id) => set((state) => ({
        professionals: state.professionals.filter((item) => item.id !== id)
      })),

      addVolunteer: (v) => set((state) => ({
        volunteers: [...state.volunteers, { ...v, id: uuidv4() }]
      })),
      updateVolunteer: (id, v) => set((state) => ({
        volunteers: state.volunteers.map((item) => item.id === id ? { ...item, ...v } : item)
      })),
      deleteVolunteer: (id) => set((state) => ({
        volunteers: state.volunteers.filter((item) => item.id !== id)
      })),

      addFinance: (f) => set((state) => ({
        finances: [...state.finances, { ...f, id: uuidv4() }]
      })),

      addConsultation: (c) => set((state) => ({
        consultations: [...state.consultations, { ...c, id: uuidv4() }]
      })),
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, { ...message, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),
      saveMedicalRecord: (record) => set((state) => {
        const id = record.id || uuidv4();
        const nextRecord = { ...record, id, updatedAt: new Date().toISOString() } as MedicalRecord;
        const exists = state.medicalRecords.some((item) => item.id === id);
        return {
          medicalRecords: exists
            ? state.medicalRecords.map((item) => item.id === id ? nextRecord : item)
            : [...state.medicalRecords, nextRecord]
        };
      }),
      addScheduleItem: (item) => set((state) => ({
        schedule: [...state.schedule, { ...item, id: uuidv4() }]
      })),
      deleteScheduleItem: (id) => set((state) => ({
        schedule: state.schedule.filter((item) => item.id !== id)
      })),
    }),
    {
      name: 'frb-storage', // local storage key
    }
  )
);