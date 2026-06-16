// src/utils/firebaseSync.ts

import { getFirestore, enableIndexedDbPersistence, collection, addDoc, onSnapshot, FirestoreError } from 'firebase/firestore';
import { getAuth, onIdTokenChanged } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

// ✅ 1. Habilitar Persistência Offline
export const enableOfflineSync = async (): Promise<void> => {
  try {
    await enableIndexedDbPersistence(db, { forceOwnership: true });
    console.log('✅ Persistência Offline Ativada');
  } catch (err: any) {
    if (err.code === 'failed-precondition') console.warn('️ Múltiplas abas abertas');
    else console.error('❌ Erro offline:', err);
  }
};

// ✅ 2. Monitorar Conexão
export const setupConnectionMonitor = (onReconnect?: () => void): void => {
  window.addEventListener('online', async () => {
    console.log('🌐 Conexão Restaurada!');
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (onReconnect) onReconnect();
  });

  onIdTokenChanged(auth, (user) => {
    if (user) console.log('🔒 Token atualizado:', user.email);
  });
};

// ✅ 3. Salvar com Retry
export const safeAddDoc = async <T>(
  collectionPath: string,
  data: T,
  maxRetries = 3
): Promise<string> => {
  let lastError: any = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Salvo: ${docRef.id}`);
      return docRef.id;
    } catch (err: any) {
      lastError = err;
      if (err.code === 'permission-denied') throw new Error('Permissão negada');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw lastError;
};

// ✅ 4. Escutar Coleção COM ORDENAÇÃO ALFABÉTICA
export const subscribeToCollectionSorted = <T>(
  collectionPath: string,
  orderByField: string,
  onData: (items: (T & { id: string })[]) => void,
  onError?: (err: Error) => void
) => {
  const unsubscribe = onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (T & { id: string })[];

      // Ordenação A-Z
      items.sort((a, b) => 
        String(a[orderByField] || '').localeCompare(String(b[orderByField] || ''), 'pt-BR')
      );

      onData(items);
    },
    (error: FirestoreError) => {
      console.error('❌ Erro:', error);
      if (onError) onError(error);
    }
  );
  return unsubscribe;
};
