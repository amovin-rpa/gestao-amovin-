import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
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
let initialSyncDone = false;

// First time: upload local data to Firebase if Firebase is empty
async function initialSync() {
  if (initialSyncDone) return;
  initialSyncDone = true;

  const state = useStore.getState();

  for (const colName of COLLECTIONS) {
    // Check if Firebase collection has data
    const snapshot = await getDocs(collection(db, colName));
    
    if (snapshot.empty) {
      // Firebase is empty - upload local data
      const localItems = (state as unknown as Record<string, unknown[]>)[colName] || [];
      if (localItems.length > 0) {
        console.log(`Uploading ${localItems.length} local items to Firebase: ${colName}`);
        const batch = writeBatch(db);
        for (const item of localItems) {
          const record = item as Record<string, unknown>;
          if (!record.id) continue;
          const docRef = doc(db, colName, record.id as string);
          batch.set(docRef, record);
        }
        await batch.commit();
      }
    }
    // If Firebase has data, it will be loaded by the listener below
  }
}

// Listen to all collections in Firestore and sync to local store
export function startFirebaseSync() {
  stopFirebaseSync();

  // First upload local data if Firebase is empty
  initialSync().then(() => {
    // Then start listening for changes
    for (const colName of COLLECTIONS) {
      const unsub = onSnapshot(collection(db, colName), (snapshot) => {
        // Only update local store if Firebase has data
        // This prevents wiping local data when Firebase is empty
        if (snapshot.empty) return;

        const items: Record<string, unknown>[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });

        useStore.setState({ [colName]: items } as Record<string, unknown>);
      }, (error) => {
        console.error(`Firebase sync error on ${colName}:`, error);
      });

      unsubscribes.push(unsub);
    }
  }).catch((error) => {
    console.error('Initial sync error:', error);
  });
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
