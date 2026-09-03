// ============================================================
// SCRIPT PARA REMOVER MENUS EMBUTIDOS DOS HTMLs
// ============================================================
// Executar: node scripts/limpar-menus.js
// ============================================================

const fs = require('fs');
const path = require('path');

// Caminho da pasta public
const PUBLIC_DIR = path.join(__dirname, '../v2-segura/public');

// Padrões para identificar menus embutidos
const MENU_PATTERNS = [
    // Menu embutido com função gerarMenuHTML
    /function\s+gerarMenuHTML\s*\(\s*\)\s*\{[\s\S]*?function\s+carregarMenu[\s\S]*?\}\s*\)\s*\(\s*\)\s*;/g,
    
    // Menu embutido com MENU_CONFIG
    /var\s+MENU_CONFIG\s*=\s*\{[\s\S]*?\}\s*\)\s*\(\s*\)\s*;/g,
    
    // Bloco inteiro do menu que começa com (function()
    /\(\s*function\s*\(\s*\)\s*\{[\s\S]*?var\s+MENU_CONFIG[\s\S]*?\}\s*\)\s*\(\s*\)\s*;/g,
    
    // Menu que define sidebar
    /var\s+menuHTML\s*=\s*['"][\s\S]*?sidebar[\s\S]*?['"]\s*;[\s\S]*?document\.getElementById\s*\(\s*['"]menu-container['"]\s*\)/g,
];

// ============================================================
// FUNÇÃO PARA LIMPAR UM ARQUIVO
// ============================================================
function limparArquivo(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Remove menus embutidos
        MENU_PATTERNS.forEach(pattern => {
            if (pattern.test(content)) {
                // Reseta o regex para usar novamente
                pattern.lastIndex = 0;
                const match = content.match(pattern);
                if (match) {
                    content = content.replace(pattern, '');
                    modified = true;
                    console.log(`  ✅ Menu embutido removido de ${path.basename(filePath)}`);
                }
            }
        });

        // Garante que o script do menu.js esteja presente
        if (content.includes('menu.js') && !content.includes('menu.js?v=20261007')) {
            content = content.replace(/src="menu\.js"/g, 'src="menu.js?v=20261007"');
            modified = true;
        }

        // Se não tiver o script do menu, adiciona antes do </body>
        if (!content.includes('menu.js')) {
            const scriptTag = '<script src="menu.js?v=20261007"></script>\n';
            content = content.replace(/<\/body>/, scriptTag + '</body>');
            modified = true;
            console.log(`  ✅ Script menu.js adicionado em ${path.basename(filePath)}`);
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            return true;
        }
        return false;

    } catch (error) {
        console.error(`❌ Erro ao processar ${filePath}:`, error.message);
        return false;
    }
}

// ============================================================
// EXECUTA EM TODOS OS HTMLs
// ============================================================
function limparTodos() {
    console.log('🚀 Iniciando limpeza de menus embutidos...');
    console.log('═'.repeat(60));

    if (!fs.existsSync(PUBLIC_DIR)) {
        console.error(`❌ Pasta não encontrada: ${PUBLIC_DIR}`);
        return;
    }

    const files = fs.readdirSync(PUBLIC_DIR);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    if (htmlFiles.length === 0) {
        console.log('⚠️ Nenhum arquivo HTML encontrado.');
        return;
    }

    console.log(`📁 ${htmlFiles.length} arquivos HTML encontrados.`);

    let count = 0;
    htmlFiles.forEach(file => {
        const filePath = path.join(PUBLIC_DIR, file);
        if (limparArquivo(filePath)) {
            count++;
        }
    });

    console.log('═'.repeat(60));
    console.log(`✅ Limpeza concluída! ${count} arquivos modificados.`);
    console.log('📋 Execute git add . && git commit -m "Remove menus embutidos" && git push');
    console.log('🔄 Depois faça o redeploy na Vercel.');
}

// ============================================================
// EXECUTA
// ============================================================
limparTodos();
