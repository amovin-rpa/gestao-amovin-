// ============================================================
// MENU.JS - AMOVIN ERP SOCIAL
// Versão completa com identidade internacional SAP/ERP
// ============================================================

// ============================================================
// MÓDULOS DO SISTEMA
// ============================================================
var MODULOS_SISTEMA = [
    // ========== PRINCIPAL ==========
    { id: 'dashboard', nome: 'Dashboard', categoria: 'Principal', url: 'dashboard.html', icone: '📊', externo: false },
    { id: 'bi', nome: 'BI Executivo', categoria: 'Principal', url: 'bi.html', icone: '📈', externo: false },

    // ========== CAPTAÇÃO ==========
    { id: 'capta', nome: 'Amovin Capta+', categoria: 'Captação', url: 'https://amovin-capta.vercel.app/login', icone: '🚀', externo: true },
    { id: 'sala-espera', nome: 'Sala de Espera', categoria: 'Captação', url: 'sala-espera.html', icone: '📋', externo: false },
    { id: 'pre-cadastro', nome: 'Pré-Cadastro', categoria: 'Captação', url: 'pre-cadastro.html', icone: '📝', externo: false },

    // ========== FINANCEIRO ==========
    { id: 'financeiro', nome: 'Financeiro', categoria: 'Financeiro', url: 'financeiro.html', icone: '💰', externo: false },
    { id: 'orcamentos', nome: 'Orçamentos', categoria: 'Financeiro', url: 'orcamentos.html', icone: '📊', externo: false },
    { id: 'prestacao-contas', nome: 'Prest. Contas', categoria: 'Financeiro', url: 'prestacao-contas.html', icone: '📋', externo: false },
    { id: 'idp', nome: 'IDP - Leitor de Docs', categoria: 'Financeiro', url: 'idp.html', icone: '📄', externo: false },

    // ========== PESSOAS ==========
    { id: 'pessoas', nome: 'Beneficiários', categoria: 'Pessoas', url: 'pessoas.html', icone: '👥', externo: false },
    { id: 'profissionais', nome: 'Profissionais', categoria: 'Pessoas', url: 'profissionais.html', icone: '👨‍⚕️', externo: false },
    { id: 'voluntarios', nome: 'Voluntários', categoria: 'Pessoas', url: 'voluntarios.html', icone: '💪', externo: false },
    { id: 'agenda-telefonica', nome: 'CRM Social', categoria: 'Pessoas', url: 'agenda-telefonica.html', icone: '☎️', externo: false },

    // ========== ATENDIMENTO ==========
    { id: 'agenda', nome: 'Agenda', categoria: 'Atendimento', url: 'agenda.html', icone: '📅', externo: false },

    // ========== DOCUMENTOS ==========
    { id: 'documentos', nome: 'Documentos', categoria: 'Documentos', url: 'documentos.html', icone: '📝', externo: false },
    { id: 'qrcodes', nome: 'QR Codes', categoria: 'Documentos', url: 'qrcodes.html', icone: '📱', externo: false },
    { id: 'notas-fiscais', nome: 'Notas Fiscais', categoria: 'Documentos', url: 'notas-fiscais.html', icone: '📄', externo: false },
    { id: 'estoque', nome: 'Estoque', categoria: 'Documentos', url: 'estoque.html', icone: '📦', externo: false },
    { id: 'patrimonio', nome: 'Patrimônio', categoria: 'Documentos', url: 'patrimonio.html', icone: '🏢', externo: false },

    // ========== EDUCAÇÃO ==========
    { id: 'biblioteca', nome: 'Biblioteca', categoria: 'Educação', url: 'biblioteca.html', icone: '📚', externo: false },
    { id: 'certificados', nome: 'Certificados', categoria: 'Educação', url: 'certificados.html', icone: '🎓', externo: false },

    // ========== COMUNICAÇÃO ==========
    { id: 'chat', nome: 'Chat', categoria: 'Comunicação', url: 'chat.html', icone: '💬', externo: false },
    { id: 'assistente', nome: 'Assistente IA', categoria: 'Comunicação', url: 'assistente.html', icone: '🤖', externo: false },

    // ========== RELATÓRIOS ==========
    { id: 'relatorios', nome: 'Relatórios', categoria: 'Relatórios', url: 'relatorios.html', icone: '📈', externo: false },

    // ========== SISTEMA ==========
    { id: 'configuracoes', nome: 'Configurações', categoria: 'Sistema', url: 'configuracoes.html', icone: '⚙️', externo: false },
    { id: 'backup', nome: 'Backup', categoria: 'Sistema', url: 'backup.html', icone: '💾', externo: false },
];

// ============================================================
// PERFIS E PERMISSÕES
// ============================================================
var PERFIS_PERMITIDOS = {
    admin: MODULOS_SISTEMA.map(function(m) { return m.id; }),
    recepcao: ['dashboard','pessoas','agenda-telefonica','agenda','documentos'],
    consulta: ['dashboard','agenda','agenda-telefonica','assistente'],
    financeiro: ['dashboard','financeiro','orcamentos','prestacao-contas','relatorios','idp'],
    voluntario: ['dashboard','agenda','voluntarios','agenda-telefonica']
};

// ============================================================
// CSS DA SIDEBAR (injetado via JS)
// ============================================================
function injectSidebarCSS() {
    var css = `
        /* ==================== SIDEBAR ==================== */
        .sidebar {
            width: 270px;
            background: #FFFFFF;
            color: #1A1A1A;
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 100;
            display: flex;
            flex-direction: column;
            border-right: 1px solid #F0E9DF;
            box-shadow: 0 0 20px rgba(0,0,0,0.03);
            transition: all 0.3s ease;
        }
        .sidebar-header {
            padding: 28px 24px 24px;
            text-align: center;
            border-bottom: 1px solid #F0E9DF;
            flex-shrink: 0;
        }
        .sidebar-logo-img {
            width: 80px;
            height: auto;
            margin-bottom: 8px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .sidebar-logo-fallback {
            font-size: 48px;
            margin-bottom: 8px;
            display: none;
        }
        .sidebar-header .brand {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 18px;
            font-weight: 700;
            color: #1A1A1A;
            letter-spacing: -0.4px;
        }
        .sidebar-nav {
            flex: 1;
            padding: 16px 0;
            overflow-y: auto;
            scrollbar-width: thin;
        }
        .sidebar-nav::-webkit-scrollbar {
            width: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
            background: #E5E0D8;
            border-radius: 4px;
        }
        .nav-categoria {
            padding: 16px 24px 6px;
            font-size: 10px;
            font-weight: 700;
            color: #9CA3AF;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }
        .nav-item {
            display: flex;
            align-items: center;
            gap: 13px;
            padding: 11px 24px;
            color: #4B5563;
            text-decoration: none;
            font-size: 13.5px;
            font-weight: 500;
            transition: all 0.2s ease;
            border-left: 3px solid transparent;
            cursor: pointer;
        }
        .nav-item:hover {
            background: #FFF8E7;
            color: #C65A11;
            border-left-color: #F5C518;
        }
        .nav-item.ativo {
            background: #FFF3E0;
            color: #C65A11;
            border-left-color: #C65A11;
            font-weight: 600;
        }
        .nav-item .icone {
            font-size: 17px;
            width: 24px;
            text-align: center;
            flex-shrink: 0;
        }
        .sidebar-footer {
            padding: 20px 24px;
            border-top: 1px solid #F0E9DF;
            flex-shrink: 0;
            background: #FFFFFF;
        }
        .user-card {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 14px;
        }
        .user-avatar {
            width: 38px;
            height: 38px;
            background: #F5C518;
            color: #1A1A1A;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 15px;
            flex-shrink: 0;
        }
        .user-info .nome {
            font-weight: 600;
            font-size: 13.5px;
            color: #1A1A1A;
        }
        .user-info .cargo {
            font-size: 11px;
            color: #6B7280;
        }
        .btn-sair {
            width: 100%;
            padding: 9px;
            background: #F8F4ED;
            color: #1A1A1A;
            border: none;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-sair:hover {
            background: #F0E9DF;
        }
        @media (max-width: 768px) {
            .sidebar {
                width: 100%;
                position: relative;
            }
            .main-content {
                margin-left: 0 !important;
            }
        }
    `;
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

// ============================================================
// RENDERIZAR MENU
// ============================================================
function renderizarMenu() {
    var perfil = sessionStorage.getItem('amovin_perfil') || 'admin';
    var permitidos = PERFIS_PERMITIDOS[perfil] || PERFIS_PERMITIDOS.admin;
    var paginaAtual = window.location.pathname.split('/').pop().replace('.html', '');
    var nome = sessionStorage.getItem('amovin_nome') || 'Administrador';
    var inicial = nome.charAt(0).toUpperCase();

    // Agrupar por categoria
    var categorias = {};
    MODULOS_SISTEMA.forEach(function(m) {
        if (permitidos.indexOf(m.id) === -1) return;
        if (!categorias[m.categoria]) categorias[m.categoria] = [];
        categorias[m.categoria].push(m);
    });

    // Montar HTML
    var html = '';
    html += '<aside class="sidebar">';
    html += '  <div class="sidebar-header">';
    html += '    <img src="images/amovin-logo.png" alt="AMOVIN" class="sidebar-logo-img" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\';">';
    html += '    <div class="sidebar-logo-fallback">🌻</div>';
    html += '    <div class="brand">Amovin ERP Social</div>';
    html += '  </div>';
    html += '  <nav class="sidebar-nav">';

    for (var cat in categorias) {
        html += '    <div class="nav-categoria">' + cat + '</div>';
        categorias[cat].forEach(function(m) {
            var ativo = (paginaAtual === m.id || (paginaAtual === '' && m.id === 'dashboard')) ? 'ativo' : '';
            var target = m.externo ? ' target="_blank"' : '';
            var url = m.externo ? m.url : m.url;
            html += '    <a href="' + url + '" class="nav-item ' + ativo + '"' + target + '>';
            html += '      <span class="icone">' + m.icone + '</span> ' + m.nome;
            html += '    </a>';
        });
    }

    html += '  </nav>';
    html += '  <div class="sidebar-footer">';
    html += '    <div class="user-card">';
    html += '      <div class="user-avatar">' + inicial + '</div>';
    html += '      <div class="user-info">';
    html += '        <div class="nome">' + nome + '</div>';
    html += '        <div class="cargo">' + (perfil === 'admin' ? 'Administrador Master' : perfil.charAt(0).toUpperCase() + perfil.slice(1)) + '</div>';
    html += '      </div>';
    html += '    </div>';
    html += '    <button class="btn-sair" onclick="sairSistema()">🚪 Sair do Sistema</button>';
    html += '  </div>';
    html += '</aside>';

    // Injetar no DOM
    var container = document.getElementById('menu-container');
    if (container) {
        container.innerHTML = html;
    } else {
        // Fallback: cria container antes do main-content
        var main = document.querySelector('.main-content');
        if (main) {
            var wrapper = document.createElement('div');
            wrapper.id = 'menu-container';
            wrapper.innerHTML = html;
            document.body.insertBefore(wrapper, main);
        } else {
            document.body.insertAdjacentHTML('afterbegin', html);
        }
    }
}

// ============================================================
// SAIR DO SISTEMA
// ============================================================
function sairSistema() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

// ============================================================
// INICIALIZAR
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    injectSidebarCSS();
    renderizarMenu();
});

// ============================================================
// VERIFICAR SESSÃO
// ============================================================
if (!sessionStorage.getItem('amovin_logado')) {
    window.location.href = 'index.html';
}

// ============================================================
// TIMEOUT DE SESSÃO (30 MINUTOS)
// ============================================================
var timeoutSessao;
function resetarTimeout() {
    clearTimeout(timeoutSessao);
    timeoutSessao = setTimeout(function() {
        sessionStorage.clear();
        alert('⏰ Sessão expirada por inatividade.');
        window.location.href = 'index.html';
    }, 30 * 60 * 1000);
}

document.addEventListener('mousemove', resetarTimeout);
document.addEventListener('keypress', resetarTimeout);
document.addEventListener('click', resetarTimeout);
resetarTimeout();

// ============================================================
// BLOQUEAR VOLTAR PARA LOGIN
// ============================================================
history.pushState(null, null, location.href);
window.addEventListener('popstate', function() {
    if (window.location.pathname.includes('index.html')) {
        history.pushState(null, null, location.href);
        window.location.href = 'dashboard.html';
    }
});

console.log('✅ menu.js carregado com sucesso!');
console.log('📊 Total de módulos: ' + MODULOS_SISTEMA.length);
console.log('👤 Perfil atual: ' + (sessionStorage.getItem('amovin_perfil') || 'admin'));
