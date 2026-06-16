import { 
  getFirestore, 
  enableIndexedDbPersistence, 
  collection, 
  addDoc, 
  doc,
  setDoc,
  deleteDoc,
  onSnapshot, 
  FirestoreError 
} from 'firebase/firestore';
import { getAuth, onIdTokenChanged } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

// ✅ 1. Habilitar Persistência Offline
export const enableOfflineSync = async (): Promise<void> => {
  try {
    await enableIndexedDbPersistence(db, { forceOwnership: true });
    console.log('✅ Persistência Offline Ativada');
  } catch (err: any) {
    if (err.code === 'failed-precondition') console.warn('⚠️ Múltiplas abas abertas');
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

// ✅ 3. Salvar com Retry (safeAddDoc)
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

// ✅ 4. Funções que o store.ts espera (saveToFirebase e deleteFromFirebase)
export const saveToFirebase = async (collectionName: string, data: Record<string, unknown>) => {
  try {
    if (!data.id) {
      console.error('❌ Dados sem ID não podem ser salvos');
      return;
    }
    
    // Limpa dados undefined antes de salvar
    const cleanedData: Record<string, any> = {};
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        cleanedData[key] = data[key];
      }
    }
    
    // Garante photoUrl como string vazia se não existir
    if (!cleanedData.photoUrl) {
      cleanedData.photoUrl = "";
    }
    
    await setDoc(doc(db, collectionName, data.id as string), {
      ...cleanedData,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ Firebase sync: ${collectionName}/${data.id}`);
  } catch (error) {
    console.error(`❌ Erro ao salvar no Firebase (${collectionName}):`, error);
  }
};

export const deleteFromFirebase = async (collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    console.log(`✅ Deletado do Firebase: ${collectionName}/${id}`);
  } catch (error) {
    console.error(`❌ Erro ao deletar do Firebase (${collectionName}):`, error);
  }
};

// ✅ 5. Escutar Coleção COM ORDENAÇÃO ALFABÉTICA
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

// ✅ 6. FUNÇÃO NOVA: Upload em massa para o DashboardHome (CORREÇÃO DO ERRO)
export const uploadAllToFirebase = async (
  store: Record<string, unknown>
): Promise<number> => {
  let total = 0;
  
  // Lista de todas as coleções do seu store
  const collections = [
    'beneficiaries', 
    'professionals', 
    'volunteers', 
    'finances', 
    'consultations', 
    'chatMessages', 
    'medicalRecords', 
    'schedule', 
    'auditLogs'
  ];
  
  for (const collectionName of collections) {
    const items = store[collectionName] as unknown[];
    
    if (Array.isArray(items)) {
      for (const item of items) {
        // Usa a função saveToFirebase que já limpa os dados
        await saveToFirebase(collectionName, item as Record<string, unknown>);
        total++;
      }
    }
  }
  
  console.log(`✅ Upload em massa concluído: ${total} registros enviados`);
  return total;
};
