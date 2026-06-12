import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { enableOfflineSync, setupConnectionMonitor } from './utils/firebaseSync';

const initializeApp = async () => {
  try {
    console.log('🚀 Inicializando AMOVIN...');
    await enableOfflineSync();
    setupConnectionMonitor(() => console.log('🔄 Reconectando...'));
    console.log('✅ Sistema pronto!');
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

initializeApp();
