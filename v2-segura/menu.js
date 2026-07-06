// ============================================================
// MENU LATERAL PADRÃO - AMOVIN ERP SOCIAL
// ============================================================
// Este arquivo é carregado em todas as páginas via JavaScript
// Para atualizar o menu, edite APENAS este arquivo.
// ============================================================

function renderizarMenu(paginaAtiva) {
    // Mapeamento de páginas para destacar o item ativo
    var mapaAtivo = {
        'dashboard': 'dashboard',
        'bi': 'bi',
        'financeiro': 'financeiro',
        'orcamentos': 'orcamentos',
        'prestacao-contas': 'prestacao-contas',
        'pessoas': 'pessoas',
        'beneficiarios': 'pessoas',
        'profissionais': 'profissionais',
        'voluntarios': 'voluntarios',
        'agenda-telefonica': 'agenda-telefonica',
        'agenda': 'agenda',
        'documentos': 'documentos',
        'qrcodes': 'qrcodes',
        'estoque': 'estoque',
        'patrimonio': 'patrimonio',
        'biblioteca': 'biblioteca',
        'certificados': 'certificados',
        'chat': 'chat',
        'assistente': 'assistente',
        'relatorios': 'relatorios',
        'configuracoes': 'configuracoes',
        'backup': 'backup'
    };

    var ativo = mapaAtivo[paginaAtiva] || 'dashboard';

    var html = `
    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="images/amovin-logo.png" alt="AMOVIN" class="sidebar-logo-img" onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
        <div class="sidebar-logo-fallback">🌻</div>
        <div class="brand">Amovin ERP Social</div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-categoria">Principal</div>
        <a href="dashboard.html" class="nav-item ${ativo === 'dashboard' ? 'ativo' : ''}"><span class="icone">📊</span> Dashboard</a>
        <a href="bi.html" class="nav-item ${ativo === 'bi' ? 'ativo' : ''}"><span class="icone">📈</span> BI Executivo</a>

        <div class="nav-categoria">Captação</div>
        <a href="em-breve.html" class="nav-item ${ativo === 'editais' ? 'ativo' : ''}"><span class="icone">🔍</span> Editais</a>
        <a href="em-breve.html" class="nav-item ${ativo === 'oficios' ? 'ativo' : ''}"><span class="icone">📄</span> Ofícios IA</a>
        <a href="em-breve.html" class="nav-item ${ativo === 'projetos' ? 'ativo' : ''}"><span class="icone">📋</span> Projetos IA</a>

        <div class="nav-categoria">Financeiro</div>
        <a href="financeiro.html" class="nav-item ${ativo === 'financeiro' ? 'ativo' : ''}"><span class="icone">💰</span> Financeiro</a>
        <a href="orcamentos.html" class="nav-item ${ativo === 'orcamentos' ? 'ativo' : ''}"><span class="icone">📊</span> Orçamentos</a>
        <a href="prestacao-contas.html" class="nav-item ${ativo === 'prestacao-contas' ? 'ativo' : ''}"><span class="icone">📋</span> Prest. Contas</a>

        <div class="nav-categoria">Pessoas</div>
        <a href="pessoas.html" class="nav-item ${ativo === 'pessoas' ? 'ativo' : ''}"><span class="icone">👥</span> Beneficiários</a>
        <a href="profissionais.html" class="nav-item ${ativo === 'profissionais' ? 'ativo' : ''}"><span class="icone">👨‍⚕️</span> Profissionais</a>
        <a href="voluntarios.html" class="nav-item ${ativo === 'voluntarios' ? 'ativo' : ''}"><span class="icone">💪</span> Voluntários</a>
        <a href="agenda-telefonica.html" class="nav-item ${ativo === 'agenda-telefonica' ? 'ativo' : ''}"><span class="icone">☎️</span> CRM Social</a>

        <div class="nav-categoria">Atendimento</div>
        <a href="agenda.html" class="nav-item ${ativo === 'agenda' ? 'ativo' : ''}"><span class="icone">📅</span> Agenda</a>

        <div class="nav-categoria">Documentos</div>
        <a href="documentos.html" class="nav-item ${ativo === 'documentos' ? 'ativo' : ''}"><span class="icone">📝</span> Documentos</a>
        <a href="qrcodes.html" class="nav-item ${ativo === 'qrcodes' ? 'ativo' : ''}"><span class="icone">📱</span> QR Codes</a>
        <a href="estoque.html" class="nav-item ${ativo === 'estoque' ? 'ativo' : ''}"><span class="icone">📦</span> Estoque</a>
        <a href="patrimonio.html" class="nav-item ${ativo === 'patrimonio' ? 'ativo' : ''}"><span class="icone">🏢</span> Patrimônio</a>

        <div class="nav-categoria">Educação</div>
        <a href="biblioteca.html" class="nav-item ${ativo === 'biblioteca' ? 'ativo' : ''}"><span class="icone">📚</span> Biblioteca</a>
        <a href="certificados.html" class="nav-item ${ativo === 'certificados' ? 'ativo' : ''}"><span class="icone">🎓</span> Certificados</a>

        <div class="nav-categoria">Comunicação</div>
        <a href="chat.html" class="nav-item ${ativo === 'chat' ? 'ativo' : ''}"><span class="icone">💬</span> Chat</a>
        <a href="assistente.html" class="nav-item ${ativo === 'assistente' ? 'ativo' : ''}"><span class="icone">🤖</span> Assistente IA</a>

        <div class="nav-categoria">Relatórios</div>
        <a href="relatorios.html" class="nav-item ${ativo === 'relatorios' ? 'ativo' : ''}"><span class="icone">📈</span> Relatórios</a>

        <div class="nav-categoria">Sistema</div>
        <a href="configuracoes.html" class="nav-item ${ativo === 'configuracoes' ? 'ativo' : ''}"><span class="icone">⚙️</span> Configurações</a>
        <a href="backup.html" class="nav-item ${ativo === 'backup' ? 'ativo' : ''}"><span class="icone">💾</span> Backup</a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar" id="userAvatarMenu">A</div>
          <div class="user-info">
            <div class="nome" id="userNomeMenu">Administrador</div>
            <div class="cargo" id="userCargoMenu">Admin</div>
          </div>
        </div>
        <button class="btn-sair" onclick="fazerLogout()">🚪 Sair do Sistema</button>
      </div>
    </aside>
    `;

    return html;
}

// ============================================================
// FUNÇÃO PARA CARREGAR O MENU EM QUALQUER PÁGINA
// ============================================================
function carregarMenu(paginaAtiva) {
    // Verificar se já existe um container para o menu
    var container = document.getElementById('menu-container');
    if (!container) {
        // Se não existir, criar um no início do body
        container = document.createElement('div');
        container.id = 'menu-container';
        document.body.insertBefore(container, document.body.firstChild);
    }

    // Renderizar e inserir o menu
    container.innerHTML = renderizarMenu(paginaAtiva);

    // Atualizar informações do usuário
    var nome = sessionStorage.getItem('amovin_nome') || 'Administrador';
    var cargo = sessionStorage.getItem('amovin_perfil') || 'Admin';
    var inicial = nome.charAt(0).toUpperCase();

    var avatar = document.getElementById('userAvatarMenu');
    var nomeEl = document.getElementById('userNomeMenu');
    var cargoEl = document.getElementById('userCargoMenu');

    if (avatar) avatar.textContent = inicial;
    if (nomeEl) nomeEl.textContent = nome;
    if (cargoEl) cargoEl.textContent = cargo;
}

// ============================================================
// FUNÇÃO DE LOGOUT (global)
// ============================================================
function fazerLogout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// ============================================================
// CARREGAR MENU AUTOMATICAMENTE QUANDO A PÁGINA CARREGAR
// ============================================================
// Detecta a página atual pelo nome do arquivo
var paginaAtual = window.location.pathname.split('/').pop().replace('.html', '');
if (!paginaAtual || paginaAtual === '') paginaAtual = 'dashboard';

// Carregar o menu
carregarMenu(paginaAtual);
