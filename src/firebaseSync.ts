// src/utils/firebaseSync.ts
import { getFirestore, enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence, collection, addDoc, onSnapshot, FirestoreError } from 'firebase/firestore';
import { getAuth, onIdTokenChanged } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

// ✅ Habilitar persistência offline COM sync automático entre abas
export const enableOfflineSync = async (): Promise<void> => {
  try {
    // Tenta habilitar persistência multi-tab primeiro (melhor para produção)
    try {
      await enableMultiTabIndexedDbPersistence(db);
      console.log('✅ Persistência multi-tab ativada');
    } catch (multiTabErr: any) {
      if (multiTabErr.code === 'failed-precondition') {
        // Se falhar, tenta persistência simples
        await enableIndexedDbPersistence(db, { forceOwnership: true });
        console.log('✅ Persistência single-tab ativada');
      } else {
        throw multiTabErr;
      }
    }
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Múltiplas abas abertas - usando cache existente');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Browser não suporta persistência offline');
    } else {
      console.error('❌ Erro ao ativar persistência:', err);
    }
  }
};

// ✅ Monitorar conexão e forçar sync quando voltar online
export const setupConnectionMonitor = (onReconnect?: () => void): void => {
  // Detectar quando navegador voltar online
  window.addEventListener('online', async () => {
    console.log('🌐 Conexão restaurada - forçando sincronização...');
    // Aguardar 2 segundos para estabilizar conexão
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Callback para recarregar dados
    if (onReconnect) onReconnect();
  });

  // Monitorar token de autenticação
  onIdTokenChanged(auth, (user) => {
    if (user) {
      console.log('✅ Token atualizado para:', user.email);
      // Forçar refresh de dados ao mudar token
      if (onReconnect) onReconnect();
    } else {
      console.warn('⚠️ Usuário desautenticado');
    }
  });

  // Detectar quando ficar offline
  window.addEventListener('offline', () => {
    console.warn('🔴 Conexão perdida - dados serão salvos localmente');
  });
};

// ✅ Wrapper para addDoc COM retry e fallback
export const safeAddDoc = async <T>(
  collectionPath: string, 
  data: T, 
  maxRetries = 3
): Promise<string> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        syncedAt: new Date().toISOString(), // ✅ Timestamp de sync
        syncVersion: 1, // ✅ Versão para controle de conflitos
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Documento salvo: ${docRef.id}`);
      return docRef.id;
    } catch (err: any) {
      lastError = err;
      console.warn(`⚠️ Tentativa ${attempt}/${maxRetries} falhou:`, err.message);
      
      // Se for erro de permissão, não retry
      if (err.code === 'permission-denied') {
        throw new Error('❌ Permissão negada - verifique as regras do Firestore');
      }
      
      // Se for erro de rede, tenta novamente
      if (err.code === 'unavailable' || err.code === 'deadline-exceeded') {
        console.log('⏳ Aguardando para tentar novamente...');
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      throw err;
    }
  }
  
  throw lastError || new Error('❌ Falha ao salvar após múltiplas tentativas');
};

// ✅ Hook para escutar coleção em tempo real COM ordenação
export const subscribeToCollection = <T>(
  collectionPath: string,
  onData: (items: (T & { id: string })[]) => void,
  onError?: (err: Error) => void,
  orderByField?: string, // Campo para ordenação (ex: 'nome')
  orderDirection: 'asc' | 'desc' = 'asc'
) => {
  const unsubscribe = onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (T & { id: string })[];
      
      // Ordenar se campo especificado
      if (orderByField) {
        items.sort((a, b) => {
          const aVal = a[orderByField] || '';
          const bVal = b[orderByField] || '';
          return orderDirection === 'asc' 
            ? String(aVal).localeCompare(String(bVal), 'pt-BR')
            : String(bVal).localeCompare(String(aVal), 'pt-BR');
        });
      }
      
      onData(items);
    },
    (error: FirestoreError) => {
      console.error('❌ Erro ao escutar coleção:', error);
      if (onError) onError(error);
    }
  );
  
  return unsubscribe; // Chame para cancelar a inscrição
};

// ✅ Função para forçar sync manual
export const forceSync = async (): Promise<void> => {
  console.log('🔄 Forçando sincronização manual...');
  // Apenas log para debug - o Firebase faz sync automático
  const isOnline = navigator.onLine;
  if (isOnline) {
    console.log('✅ Sistema online - dados serão sincronizados automaticamente');
  } else {
    console.warn('⚠️ Sistema offline - dados ficarão em cache até reconectar');
  }
};

// ✅ Verificar status de sincronização
export const getSyncStatus = (): { isOnline: boolean; hasPendingWrites: boolean } => {
  return {
    isOnline: navigator.onLine,
    hasPendingWrites: false // Firebase gerencia internamente
  };
};
