import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface ScheduleSlot {
  id?: string;
  professionalId: string;
  professionalName: string;
  date: string;
  time: string;
  office: string;
  isAvailable: boolean;
  isBlocked: boolean;
  patientId?: string;
  patientName?: string;
  createdAt: string;
}

export async function createScheduleSlot(data: Omit<ScheduleSlot, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'schedule'), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateScheduleSlot(id: string, data: Partial<ScheduleSlot>): Promise<void> {
  await updateDoc(doc(db, 'schedule', id), data as any);
}

export async function deleteScheduleSlot(id: string): Promise<void> {
  await deleteDoc(doc(db, 'schedule', id));
}

export async function getScheduleByProfessional(professionalId: string): Promise<ScheduleSlot[]> {
  const q = query(collection(db, 'schedule'), where('professionalId', '==', professionalId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ScheduleSlot);
}

export async function getScheduleByMonth(yearMonth: string): Promise<ScheduleSlot[]> {
  const snapshot = await getDocs(collection(db, 'schedule'));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as ScheduleSlot)
    .filter((s) => s.date.startsWith(yearMonth));
}
