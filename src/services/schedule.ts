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

export async function createScheduleSlot(data) {
  const docRef = await addDoc(collection(db, 'schedule'), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateScheduleSlot(id, data) {
  await updateDoc(doc(db, 'schedule', id), data);
}

export async function deleteScheduleSlot(id) {
  await deleteDoc(doc(db, 'schedule', id));
}

export async function getScheduleByProfessional(professionalId) {
  const q = query(collection(db, 'schedule'), where('professionalId', '==', professionalId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(function(d) { return { id: d.id, ...d.data() }; });
}

export async function getScheduleByMonth(yearMonth) {
  const snapshot = await getDocs(collection(db, 'schedule'));
  return snapshot.docs
    .map(function(d) { return { id: d.id, ...d.data() }; })
    .filter(function(s) { return s.date.startsWith(yearMonth); });
}
