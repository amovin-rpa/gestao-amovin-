import { collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { useStore } from './store';

const COLLECTIONS = [
  'beneficiaries',
  'professionals',
  'volunteers',
  'finances',
  'consultations',
  'chatMessages',
  'medicalRecords',
  'schedule',
  'auditLogs',
] as const;

type CollectionName = typeof COLLECTIONS[number];

let unsubscribes: (() => void)[] = [];

// Listen to all collections in Firestore and sync to local store
export function startFirebaseSync() {
  stopFirebaseSync();

  for (const colName of COLLECTIONS) {
    const unsub = onSnapshot(collection(db, colName), (snapshot) => {
      const items: Record<string, unknown>[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Update local store without triggering a write back
      useStore.setState({ [colName]: items } as Record<string, unknown>);
    }, (error) => {
      console.error(`Firebase sync error on ${colName}:`, error);
    });

    unsubscribes.push(unsub);
  }
}

export function stopFirebaseSync() {
  unsubscribes.forEach((unsub) => unsub());
  unsubscribes = [];
}

// Save a single document to Firestore
export async function saveToFirebase(colName: CollectionName, data: Record<string, unknown>) {
  try {
    const id = data.id as string;
    if (!id) return;
    const docRef = doc(db, colName, id);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`Error saving to ${colName}:`, error);
  }
}

// Delete a document from Firestore
export async function deleteFromFirebase(colName: CollectionName, id: string) {
  try {
    const docRef = doc(db, colName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting from ${colName}:`, error);
  }
}

// Upload all local data to Firebase (first time migration)
export async function uploadAllToFirebase() {
  const state = useStore.getState();

  for (const colName of COLLECTIONS) {
    const items = (state as unknown as Record<string, unknown[]>)[colName] || [];
    if (items.length === 0) continue;

    const batch = writeBatch(db);
    for (const item of items) {
      const record = item as Record<string, unknown>;
      if (!record.id) continue;
      const docRef = doc(db, colName, record.id as string);
      batch.set(docRef, record);
    }
    await batch.commit();
  }
}
