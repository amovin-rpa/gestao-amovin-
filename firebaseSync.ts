import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

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

export type CollectionName = typeof COLLECTIONS[number];

let unsubscribes: (() => void)[] = [];

// Start listening - receives a setState function to avoid circular dependency
export function startFirebaseSync(setState: (data: Record<string, unknown>) => void) {
  stopFirebaseSync();

  for (const colName of COLLECTIONS) {
    const unsub = onSnapshot(collection(db, colName), (snapshot) => {
      if (snapshot.empty) return; // Don't wipe local data
      const items: Record<string, unknown>[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      setState({ [colName]: items });
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
    // Clean undefined values - Firestore doesn't accept undefined
    const cleanData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) cleanData[key] = value;
    }
    const docRef = doc(db, colName, id);
    await setDoc(docRef, cleanData, { merge: true });
    console.log(`Saved to Firebase: ${colName}/${id}`);
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

// Upload all data from a store state to Firebase
export async function uploadAllToFirebase(storeState: Record<string, unknown>) {
  let total = 0;
  for (const colName of COLLECTIONS) {
    const items = (storeState as Record<string, unknown[]>)[colName] || [];
    if (!Array.isArray(items) || items.length === 0) continue;

    const existing = await getDocs(collection(db, colName));
    const existingIds = new Set<string>();
    existing.forEach(d => existingIds.add(d.id));

    for (const item of items) {
      const record = item as Record<string, unknown>;
      if (!record.id) continue;
      if (existingIds.has(record.id as string)) continue;
      
      const cleanData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(record)) {
        if (value !== undefined) cleanData[key] = value;
      }
      await setDoc(doc(db, colName, record.id as string), cleanData);
      total++;
    }
  }
  return total;
}
