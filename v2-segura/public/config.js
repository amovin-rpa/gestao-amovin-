// ============================================================
// CONFIG.JS - AMOVIN ERP SOCIAL
// ============================================================
// Arquivo central de configurações - SAP Enterprise
// ============================================================

var AMOVIN_CONFIG = (function() {
    'use strict';

    // ============================================================
    // CHAVE GEMINI
    // ============================================================
    function getGeminiKey() {
        return localStorage.getItem('amovin_gemini_key') || '';
    }

    function setGeminiKey(key) {
        localStorage.setItem('amovin_gemini_key', key);
        return key;
    }

    function hasGeminiKey() {
        return getGeminiKey().length > 0;
    }

    // ============================================================
    // FIREBASE
    // ============================================================
    function getFirebaseConfig() {
        return {
            apiKey: localStorage.getItem('amovin_firebase_api_key') || '',
            authDomain: localStorage.getItem('amovin_firebase_auth_domain') || '',
            projectId: localStorage.getItem('amovin_firebase_project_id') || '',
            storageBucket: localStorage.getItem('amovin_firebase_storage_bucket') || '',
            messagingSenderId: localStorage.getItem('amovin_firebase_messaging_sender_id') || '',
            appId: localStorage.getItem('amovin_firebase_app_id') || ''
        };
    }

    function setFirebaseConfig(config) {
        localStorage.setItem('amovin_firebase_api_key', config.apiKey || '');
        localStorage.setItem('amovin_firebase_auth_domain', config.authDomain || '');
        localStorage.setItem('amovin_firebase_project_id', config.projectId || '');
        localStorage.setItem('amovin_firebase_storage_bucket', config.storageBucket || '');
        localStorage.setItem('amovin_firebase_messaging_sender_id', config.messagingSenderId || '');
        localStorage.setItem('amovin_firebase_app_id', config.appId || '');
    }

    function hasFirebaseConfig() {
        var cfg = getFirebaseConfig();
        return cfg.apiKey.length > 0 && cfg.projectId.length > 0;
    }

    // ============================================================
    // SUPABASE
    // ============================================================
    function getSupabaseConfig() {
        return {
            url: localStorage.getItem('amovin_supabase_url') || '',
            anonKey: localStorage.getItem('amovin_supabase_anon_key') || '',
            serviceKey: localStorage.getItem('amovin_supabase_service_key') || ''
        };
    }

    function setSupabaseConfig(config) {
        localStorage.setItem('amovin_supabase_url', config.url || '');
        localStorage.setItem('amovin_supabase_anon_key', config.anonKey || '');
        localStorage.setItem('amovin_supabase_service_key', config.serviceKey || '');
    }

    function hasSupabaseConfig() {
        var cfg = getSupabaseConfig();
        return cfg.url.length > 0 && cfg.anonKey.length > 0;
    }

    // ============================================================
    // ORGANIZAÇÃO
    // ============================================================
    function getOrganization() {
        return {
            name: localStorage.getItem('amovin_org_nome') || 'AMOVIN - Associação e Movimento pela Inclusão',
            cnpj: localStorage.getItem('amovin_org_cnpj') || 'XX.XXX.XXX/XXXX-XX',
            cidade: localStorage.getItem('amovin_org_cidade') || 'Rio Paranaíba - MG',
            endereco: localStorage.getItem('amovin_org_endereco') || 'Rua Exemplo, 123 - Centro'
        };
    }

    function setOrganization(data) {
        localStorage.setItem('amovin_org_nome', data.name || '');
        localStorage.setItem('amovin_org_cnpj', data.cnpj || '');
        localStorage.setItem('amovin_org_cidade', data.cidade || '');
        localStorage.setItem('amovin_org_endereco', data.endereco || '');
    }

    // ============================================================
    // APARÊNCIA
    // ============================================================
    function getAparencia() {
        return {
            tema: localStorage.getItem('amovin_tema') || 'light',
            corPrimaria: localStorage.getItem('amovin_cor_primaria') || '#C65A11',
            sidebarFixa: localStorage.getItem('amovin_sidebar_fixa') !== 'false',
            animacoes: localStorage.getItem('amovin_animacoes') !== 'false'
        };
    }

    function setAparencia(data) {
        localStorage.setItem('amovin_tema', data.tema || 'light');
        localStorage.setItem('amovin_cor_primaria', data.corPrimaria || '#C65A11');
        localStorage.setItem('amovin_sidebar_fixa', String(data.sidebarFixa !== false));
        localStorage.setItem('amovin_animacoes', String(data.animacoes !== false));
    }

    // ============================================================
    // SEGURANÇA
    // ============================================================
    function getSeguranca() {
        return {
            minSenha: parseInt(localStorage.getItem('amovin_min_senha') || '8'),
            especiais: localStorage.getItem('amovin_especiais') !== 'false',
            maiusculas: localStorage.getItem('amovin_maiusculas') !== 'false',
            tempoSessao: parseInt(localStorage.getItem('amovin_tempo_sessao') || '30'),
            bloquearTentativas: localStorage.getItem('amovin_bloquear_tentativas') !== 'false',
            tentativas: parseInt(localStorage.getItem('amovin_tentativas') || '5')
        };
    }

    function setSeguranca(data) {
        localStorage.setItem('amovin_min_senha', String(data.minSenha || 8));
        localStorage.setItem('amovin_especiais', String(data.especiais !== false));
        localStorage.setItem('amovin_maiusculas', String(data.maiusculas !== false));
        localStorage.setItem('amovin_tempo_sessao', String(data.tempoSessao || 30));
        localStorage.setItem('amovin_bloquear_tentativas', String(data.bloquearTentativas !== false));
        localStorage.setItem('amovin_tentativas', String(data.tentativas || 5));
    }

    // ============================================================
    // SMTP (EMAIL)
    // ============================================================
    function getSMTP() {
        return {
            server: localStorage.getItem('amovin_smtp_server') || '',
            port: localStorage.getItem('amovin_smtp_port') || '587',
            email: localStorage.getItem('amovin_smtp_email') || '',
            password: localStorage.getItem('amovin_smtp_password') || ''
        };
    }

    function setSMTP(data) {
        localStorage.setItem('amovin_smtp_server', data.server || '');
        localStorage.setItem('amovin_smtp_port', data.port || '587');
        localStorage.setItem('amovin_smtp_email', data.email || '');
        localStorage.setItem('amovin_smtp_password', data.password || '');
    }

    // ============================================================
    // ACESSOS POR PERFIL
    // ============================================================
    function getAcessos() {
        try {
            return JSON.parse(localStorage.getItem('amovin_acessos') || 'null') || {
                admin: [],
                recepcao: ['dashboard', 'pessoas', 'agenda-telefonica', 'agenda', 'documentos'],
                consulta: ['dashboard', 'agenda', 'agenda-telefonica', 'prontuario', 'assistente', 'chat'],
                financeiro: ['dashboard', 'financeiro', 'orcamentos', 'prestacao-contas', 'notas-fiscais', 'relatorios'],
                voluntario: ['dashboard', 'agenda', 'voluntarios', 'agenda-telefonica']
            };
        } catch (e) {
            return {};
        }
    }

    function setAcessos(acessos) {
        localStorage.setItem('amovin_acessos', JSON.stringify(acessos));
    }

    function getModulosPorPerfil(perfil) {
        var acessos = getAcessos();
        return acessos[perfil] || [];
    }

    function usuarioTemAcesso(perfil, modulo) {
        var modulos = getModulosPorPerfil(perfil);
        return modulos.indexOf(modulo) >= 0;
    }

    // ============================================================
    // EXPORTAÇÃO
    // ============================================================
    return {
        // Gemini
        getGeminiKey: getGeminiKey,
        setGeminiKey: setGeminiKey,
        hasGeminiKey: hasGeminiKey,

        // Firebase
        getFirebaseConfig: getFirebaseConfig,
        setFirebaseConfig: setFirebaseConfig,
        hasFirebaseConfig: hasFirebaseConfig,

        // Supabase
        getSupabaseConfig: getSupabaseConfig,
        setSupabaseConfig: setSupabaseConfig,
        hasSupabaseConfig: hasSupabaseConfig,

        // Organização
        getOrganization: getOrganization,
        setOrganization: setOrganization,

        // Aparência
        getAparencia: getAparencia,
        setAparencia: setAparencia,

        // Segurança
        getSeguranca: getSeguranca,
        setSeguranca: setSeguranca,

        // SMTP
        getSMTP: getSMTP,
        setSMTP: setSMTP,

        // Acessos
        getAcessos: getAcessos,
        setAcessos: setAcessos,
        getModulosPorPerfil: getModulosPorPerfil,
        usuarioTemAcesso: usuarioTemAcesso,

        // Versão
        versao: '2.0.0',
        data: '2026-07-27'
    };

})();

console.log('✅ Configurações carregadas!');
console.log('📋 Versão:', AMOVIN_CONFIG.versao);
console.log('🤖 Gemini:', AMOVIN_CONFIG.hasGeminiKey() ? '✅ Configurada' : '⏳ Não configurada');
console.log('🔥 Firebase:', AMOVIN_CONFIG.hasFirebaseConfig() ? '✅ Configurado' : '⏳ Não configurado');
console.log('🔌 Supabase:', AMOVIN_CONFIG.hasSupabaseConfig() ? '✅ Configurado' : '⏳ Não configurado');
