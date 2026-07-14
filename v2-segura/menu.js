// ============================================================
// MENU LATERAL PADRÃO - AMOVIN ERP SOCIAL (VERSÃO FIXA)
// ============================================================

// ============================================================
// LISTA COMPLETA DE MÓDULOS DO SISTEMA
// ============================================================
var MODULOS_SISTEMA = [
    { id: 'dashboard', nome: '📊 Dashboard', categoria: 'Principal' },
    { id: 'bi', nome: '📈 BI Executivo', categoria: 'Principal' },
    { id: 'capta', nome: '🚀 Amovin Capta+', categoria: 'Captação' },
    { id: 'sala-espera', nome: '📋 Sala de Espera', categoria: 'Captação' },
    { id: 'pre-cadastro', nome: '📝 Pré-Cadastro', categoria: 'Captação' },
    { id: 'financeiro', nome: '💰 Financeiro', categoria: 'Financeiro' },
    { id: 'orcamentos', nome: '📊 Orçamentos', categoria: 'Financeiro' },
    { id: 'prestacao-contas', nome: '📋 Prest. Contas', categoria: 'Financeiro' },
    { id: 'pessoas', nome: '👥 Beneficiários', categoria: 'Pessoas' },
    { id: 'profissionais', nome: '👨‍⚕️ Profissionais', categoria: 'Pessoas' },
    { id: 'voluntarios', nome: '💪 Voluntários', categoria: 'Pessoas' },
    { id: 'agenda-telefonica', nome: '☎️ CRM Social', categoria: 'Pessoas' },
    { id: 'agenda', nome: '📅 Agenda', categoria: 'Atendimento' },
    { id: 'documentos', nome: '📝 Documentos', categoria: 'Documentos' },
    { id: 'qrcodes', nome: '📱 QR Codes', categoria: 'Documentos' },
    { id: 'notas-fiscais', nome: '📄 Notas Fiscais', categoria: 'Documentos' },
    { id: 'estoque', nome: '📦 Estoque', categoria: 'Documentos' },
    { id: 'patrimonio', nome: '🏢 Patrimônio', categoria: 'Documentos' },
    { id: 'biblioteca', nome: '📚 Biblioteca', categoria: 'Educação' },
    { id: 'certificados', nome: '🎓 Certificados', categoria: 'Educação' },
    { id: 'chat', nome: '💬 Chat', categoria: 'Comunicação' },
    { id: 'assistente', nome: '🤖 Assistente IA', categoria: 'Comunicação' },
    { id: 'relatorios', nome: '📈 Relatórios', categoria: 'Relatórios' },
    { id: 'configuracoes', nome: '⚙️ Configurações', categoria: 'Sistema' },
    { id: 'backup', nome: '💾 Backup', categoria: 'Sistema' }
];

function renderizarMenu(paginaAtiva) {
    var mapaAtivo = {};
    MODULOS_SISTEMA.forEach(function(m) {
        mapaAtivo[m.id] = m.id;
    });

    var ativo = mapaAtivo[paginaAtiva] || 'dashboard';

    var html = '';
    html += '<aside class="sidebar" id="sidebar-principal">';
    html += '  <div class="sidebar-header">';
    html += '    <img src="images/amovin-logo.png" alt="AMOVIN" class="sidebar-logo-img" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\';">';
    html += '    <div class="sidebar-logo-fallback">🌻</div>';
    html += '    <div class="brand">Amovin ERP Social</div>';
    html += '  </div>';
    html += '  <nav class="sidebar-nav">';
    
    // Agrupa por categoria
    var categorias = {};
    MODULOS_SISTEMA.forEach(function(m) {
        if (!categorias[m.categoria]) categorias[m.categoria] = [];
        categorias[m.categoria].push(m);
    });

    for (var cat in categorias) {
        html += '    <div class="nav-categoria">' + cat + '</div>';
        categorias[cat].forEach(function(m) {
            var isAtivo = (ativo === m.id) ? 'ativo' : '';
            var icone = m.icone || '📌';
            // Para o Capta+, usa link externo
            if (m.id === 'capta') {
                html += '    <a href="https://amovin-capta.vercel.app/login" target="_blank" class="nav-item ' + isAtivo + '"><span class="icone">' + icone + '</span> ' + m.nome + '</a>';
            } else {
                html += '    <a href="' + m.id + '.html" class="nav-item ' + isAtivo + '"><span class="icone">' + icone + '</span> ' + m.nome + '</a>';
            }
        });
    }
    
    html += '  </nav>';
    html += '  <div class="sidebar-footer">';
    html += '    <div class="user-card">';
    html += '      <div class="user-avatar" id="userAvatarMenu">A</div>';
    html += '      <div class="user-info">';
    html += '        <div class="nome" id="userNomeMenu">Administrador</div>';
    html += '        <div class="cargo" id="userCargoMenu">Admin</div>';
    html += '      </div>';
    html += '    </div>';
    html += '    <button class="btn-sair" onclick="fazerLogout()">🚪 Sair do Sistema</button>';
    html += '  </div>';
    html += '</aside>';

    return html;
}

// ============================================================
// FUNÇÃO PARA CARREGAR O MENU
// ============================================================
function carregarMenu(paginaAtiva) {
    // Remove menus antigos se existirem (evita duplicação)
    var oldMenus = document.querySelectorAll('#menu-container, .sidebar:not(#sidebar-principal)');
    oldMenus.forEach(function(el) {
        el.remove();
    });

    var container = document.getElementById('menu-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'menu-container';
        document.body.insertBefore(container, document.body.firstChild);
    }

    container.innerHTML = renderizarMenu(paginaAtiva);

    var nome = sessionStorage.getItem('amovin_nome') || 'Administrador';
    var cargo = sessionStorage.getItem('amovin_perfil') || 'Admin';
    var inicial = nome.charAt(0).toUpperCase();

    var avatar = document.getElementById('userAvatarMenu');
    var nomeEl = document.getElementById('userNomeMenu');
    var cargoEl = document.getElementById('userCargoMenu');

    if (avatar) avatar.textContent = inicial;
    if (nomeEl) nomeEl.textContent = nome;
    if (cargoEl) cargoEl.textContent = cargo;

    // ============================================================
    // CONTROLE DE PERFIL - Carrega do localStorage
    // ============================================================
    var perfil = sessionStorage.getItem('amovin_perfil') || 'admin';
    
    // Tenta carregar os módulos permitidos do localStorage
    var perfisSalvos = JSON.parse(localStorage.getItem('amovin_perfis') || '[]');
    var perfilEncontrado = perfisSalvos.find(function(p) { return p.id === perfil; });
    
    var modulosPermitidos = {};
    
    // Perfis padrão (fallback)
    var perfisPadrao = {
        admin: MODULOS_SISTEMA.map(function(m) { return m.id; }),
        recepcao: ['dashboard','pessoas','agenda-telefonica','agenda','documentos'],
        consulta: ['dashboard','agenda','agenda-telefonica','assistente'],
        financeiro: ['dashboard','financeiro','orcamentos','prestacao-contas','relatorios'],
        voluntario: ['dashboard','agenda','voluntarios','agenda-telefonica']
    };

    // Se encontrou o perfil no localStorage, usa ele
    if (perfilEncontrado) {
        modulosPermitidos[perfil] = perfilEncontrado.modulos || [];
    }
    
    // Adiciona os perfis padrão como fallback
    for (var p in perfisPadrao) {
        if (!modulosPermitidos[p]) {
            modulosPermitidos[p] = perfisPadrao[p];
        }
    }

    var permitidos = modulosPermitidos[perfil] || modulosPermitidos.admin;

    document.querySelectorAll('.nav-item').forEach(function(item) {
        var href = item.getAttribute('href') || '';
        var pagina = href.replace('.html', '');
        pagina = pagina.split('?')[0].split('#')[0];
        
        // Verifica se a página está na lista de permitidos
        var permitido = permitidos.some(function(id) {
            return id === pagina || (pagina === '' && id === 'dashboard');
        });
        
        // Se for link externo (Capta+), sempre mostra
        if (href.includes('amovin-capta') || href.includes('http')) {
            return;
        }
        
        if (pagina && !permitido && pagina !== '') {
            item.style.display = 'none';
        }
    });

    // ============================================================
    // VERIFICAÇÃO DE SESSÃO
    // ============================================================
    if (!sessionStorage.getItem('amovin_logado')) {
        window.location.href = 'index.html';
    }
}

// ============================================================
// FUNÇÃO DE LOGOUT
// ============================================================
function fazerLogout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// ============================================================
// RESET DE SESSÃO (30 minutos)
// ============================================================
var timeout;
function resetTimeout() {
    clearTimeout(timeout);
    timeout = setTimeout(function() {
        sessionStorage.clear();
        alert('⏰ Sessão expirada. Faça login novamente.');
        window.location.href = 'index.html';
    }, 30 * 60 * 1000);
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
// Detecta a página atual
var paginaAtual = window.location.pathname.split('/').pop().replace('.html', '');
if (!paginaAtual || paginaAtual === '') paginaAtual = 'dashboard';

// Carrega o menu
carregarMenu(paginaAtual);
resetTimeout();

// Impede voltar para a página de login
history.pushState(null, null, location.href);
window.addEventListener('popstate', function() {
    if (window.location.pathname.includes('index.html')) {
        history.pushState(null, null, location.href);
        window.location.href = 'dashboard.html';
    }
});

// ============================================================
// OBSERVADOR PARA MANTER O MENU FIXO
// ============================================================
// Monitora mudanças no DOM para garantir que o menu não seja removido
var observer = new MutationObserver(function() {
    var sidebar = document.getElementById('sidebar-principal');
    if (!sidebar) {
        carregarMenu(paginaAtual);
    }
});
observer.observe(document.body, { childList: true, subtree: true });

// ============================================================
// RECARREGA O MENU QUANDO A PÁGINA MUDA (SPA)
// ============================================================
// Detecta mudanças de URL em SPAs
var lastUrl = location.href;
setInterval(function() {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        var novaPagina = location.pathname.split('/').pop().replace('.html', '');
        if (novaPagina && novaPagina !== paginaAtual) {
            paginaAtual = novaPagina;
            carregarMenu(paginaAtual);
        }
    }
}, 1000);
