// ============================================================
// MENU LATERAL PADRÃO - AMOVIN ERP SOCIAL
// ============================================================

function renderizarMenu(paginaAtiva) {
    var mapaAtivo = {
        'dashboard': 'dashboard',
        'bi': 'bi',
        'capta': 'capta',
        'sala-espera': 'sala-espera',
        'pre-cadastro': 'pre-cadastro',
        'pessoas': 'pessoas',
        'profissionais': 'profissionais',
        'voluntarios': 'voluntarios',
        'agenda-telefonica': 'agenda-telefonica',
        'agenda': 'agenda',
        'financeiro': 'financeiro',
        'orcamentos': 'orcamentos',
        'prestacao-contas': 'prestacao-contas',
        'estoque': 'estoque',
        'patrimonio': 'patrimonio',
        'documentos': 'documentos',
        'qrcodes': 'qrcodes',
        'notas-fiscais': 'notas-fiscais',
        'biblioteca': 'biblioteca',
        'certificados': 'certificados',
        'chat': 'chat',
        'assistente': 'assistente',
        'relatorios': 'relatorios',
        'configuracoes': 'configuracoes',
        'backup': 'backup'
    };

    var ativo = mapaAtivo[paginaAtiva] || 'dashboard';

    var html = '';
    html += '<aside class="sidebar">';
    html += '  <div class="sidebar-header">';
    html += '    <img src="images/amovin-logo.png" alt="AMOVIN" class="sidebar-logo-img" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\';">';
    html += '    <div class="sidebar-logo-fallback">🌻</div>';
    html += '    <div class="brand">Amovin ERP Social</div>';
    html += '  </div>';
    html += '  <nav class="sidebar-nav">';
    
    // ============================================================
    // PRINCIPAL
    // ============================================================
    html += '    <div class="nav-categoria">Principal</div>';
    html += '    <a href="dashboard.html" class="nav-item ' + (ativo === 'dashboard' ? 'ativo' : '') + '"><span class="icone">📊</span> Dashboard</a>';
    html += '    <a href="bi.html" class="nav-item ' + (ativo === 'bi' ? 'ativo' : '') + '"><span class="icone">📈</span> BI Executivo</a>';
    
    // ============================================================
    // CAPTAÇÃO
    // ============================================================
    html += '    <div class="nav-categoria">Captação</div>';
    html += '    <a href="https://amovin-capta.vercel.app/login" target="_blank" class="nav-item"><span class="icone">🚀</span> Amovin Capta+</a>';
    html += '    <a href="sala-espera.html" class="nav-item ' + (ativo === 'sala-espera' ? 'ativo' : '') + '"><span class="icone">📋</span> Sala de Espera</a>';
    html += '    <a href="pre-cadastro.html" class="nav-item ' + (ativo === 'pre-cadastro' ? 'ativo' : '') + '"><span class="icone">📝</span> Pré-Cadastro</a>';
    
    // ============================================================
    // FINANCEIRO
    // ============================================================
    html += '    <div class="nav-categoria">Financeiro</div>';
    html += '    <a href="financeiro.html" class="nav-item ' + (ativo === 'financeiro' ? 'ativo' : '') + '"><span class="icone">💰</span> Financeiro</a>';
    html += '    <a href="orcamentos.html" class="nav-item ' + (ativo === 'orcamentos' ? 'ativo' : '') + '"><span class="icone">📊</span> Orçamentos</a>';
    html += '    <a href="prestacao-contas.html" class="nav-item ' + (ativo === 'prestacao-contas' ? 'ativo' : '') + '"><span class="icone">📋</span> Prest. Contas</a>';
    
    // ============================================================
    // PESSOAS
    // ============================================================
    html += '    <div class="nav-categoria">Pessoas</div>';
    html += '    <a href="pessoas.html" class="nav-item ' + (ativo === 'pessoas' ? 'ativo' : '') + '"><span class="icone">👥</span> Beneficiários</a>';
    html += '    <a href="profissionais.html" class="nav-item ' + (ativo === 'profissionais' ? 'ativo' : '') + '"><span class="icone">👨‍⚕️</span> Profissionais</a>';
    html += '    <a href="voluntarios.html" class="nav-item ' + (ativo === 'voluntarios' ? 'ativo' : '') + '"><span class="icone">💪</span> Voluntários</a>';
    html += '    <a href="agenda-telefonica.html" class="nav-item ' + (ativo === 'agenda-telefonica' ? 'ativo' : '') + '"><span class="icone">☎️</span> CRM Social</a>';
    
    // ============================================================
    // ATENDIMENTO
    // ============================================================
    html += '    <div class="nav-categoria">Atendimento</div>';
    html += '    <a href="agenda.html" class="nav-item ' + (ativo === 'agenda' ? 'ativo' : '') + '"><span class="icone">📅</span> Agenda</a>';
    
    // ============================================================
    // DOCUMENTOS
    // ============================================================
    html += '    <div class="nav-categoria">Documentos</div>';
    html += '    <a href="documentos.html" class="nav-item ' + (ativo === 'documentos' ? 'ativo' : '') + '"><span class="icone">📝</span> Documentos</a>';
    html += '    <a href="qrcodes.html" class="nav-item ' + (ativo === 'qrcodes' ? 'ativo' : '') + '"><span class="icone">📱</span> QR Codes</a>';
    html += '    <a href="notas-fiscais.html" class="nav-item ' + (ativo === 'notas-fiscais' ? 'ativo' : '') + '"><span class="icone">📄</span> Notas Fiscais</a>';
    html += '    <a href="estoque.html" class="nav-item ' + (ativo === 'estoque' ? 'ativo' : '') + '"><span class="icone">📦</span> Estoque</a>';
    html += '    <a href="patrimonio.html" class="nav-item ' + (ativo === 'patrimonio' ? 'ativo' : '') + '"><span class="icone">🏢</span> Patrimônio</a>';
    
    // ============================================================
    // EDUCAÇÃO
    // ============================================================
    html += '    <div class="nav-categoria">Educação</div>';
    html += '    <a href="biblioteca.html" class="nav-item ' + (ativo === 'biblioteca' ? 'ativo' : '') + '"><span class="icone">📚</span> Biblioteca</a>';
    html += '    <a href="certificados.html" class="nav-item ' + (ativo === 'certificados' ? 'ativo' : '') + '"><span class="icone">🎓</span> Certificados</a>';
    
    // ============================================================
    // COMUNICAÇÃO
    // ============================================================
    html += '    <div class="nav-categoria">Comunicação</div>';
    html += '    <a href="chat.html" class="nav-item ' + (ativo === 'chat' ? 'ativo' : '') + '"><span class="icone">💬</span> Chat</a>';
    html += '    <a href="assistente.html" class="nav-item ' + (ativo === 'assistente' ? 'ativo' : '') + '"><span class="icone">🤖</span> Assistente IA</a>';
    
    // ============================================================
    // RELATÓRIOS
    // ============================================================
    html += '    <div class="nav-categoria">Relatórios</div>';
    html += '    <a href="relatorios.html" class="nav-item ' + (ativo === 'relatorios' ? 'ativo' : '') + '"><span class="icone">📈</span> Relatórios</a>';
    
    // ============================================================
    // SISTEMA
    // ============================================================
    html += '    <div class="nav-categoria">Sistema</div>';
    html += '    <a href="configuracoes.html" class="nav-item ' + (ativo === 'configuracoes' ? 'ativo' : '') + '"><span class="icone">⚙️</span> Configurações</a>';
    html += '    <a href="backup.html" class="nav-item ' + (ativo === 'backup' ? 'ativo' : '') + '"><span class="icone">💾</span> Backup</a>';
    
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
    // CONTROLE DE PERFIL (Admin vê tudo, outros só o liberado)
    // ============================================================
    var perfil = sessionStorage.getItem('amovin_perfil') || 'admin';
    var modulosPermitidos = {
        admin: ['dashboard','bi','capta','sala-espera','pre-cadastro','financeiro','orcamentos','prestacao-contas','pessoas','profissionais','voluntarios','agenda-telefonica','agenda','documentos','qrcodes','notas-fiscais','estoque','patrimonio','biblioteca','certificados','chat','assistente','relatorios','configuracoes','backup'],
        recepcao: ['dashboard','pessoas','agenda-telefonica','agenda','documentos'],
        consulta: ['dashboard','agenda','agenda-telefonica','assistente'],
        financeiro: ['dashboard','financeiro','orcamentos','prestacao-contas','relatorios'],
        voluntario: ['dashboard','agenda','voluntarios','agenda-telefonica']
    };

    var permitidos = modulosPermitidos[perfil] || modulosPermitidos.admin;
    document.querySelectorAll('.nav-item').forEach(function(item) {
        var href = item.getAttribute('href') || '';
        var pagina = href.replace('.html', '');
        pagina = pagina.split('?')[0].split('#')[0];
        if (pagina && permitidos.indexOf(pagina) === -1 && pagina !== 'dashboard' && pagina !== '') {
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

document.addEventListener('mousemove', resetTimeout);
document.addEventListener('keypress', resetTimeout);
document.addEventListener('click', resetTimeout);

// ============================================================
// INICIALIZAÇÃO
// ============================================================
var paginaAtual = window.location.pathname.split('/').pop().replace('.html', '');
if (!paginaAtual || paginaAtual === '') paginaAtual = 'dashboard';
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
