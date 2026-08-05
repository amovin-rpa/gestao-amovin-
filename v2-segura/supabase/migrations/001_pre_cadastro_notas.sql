-- ============================================================
-- TABELA: pre_cadastros
-- ============================================================
CREATE TABLE IF NOT EXISTS pre_cadastros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('beneficiario', 'profissional', 'voluntario')),
    nome VARCHAR(200) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    rg VARCHAR(20),
    data_nascimento DATE,
    sexo VARCHAR(10) CHECK (sexo IN ('Masculino', 'Feminino', 'Outro')),
    telefone VARCHAR(15),
    whatsapp VARCHAR(15),
    email VARCHAR(100),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    responsavel VARCHAR(200),
    especialidade VARCHAR(200),
    area VARCHAR(200),
    disponibilidade VARCHAR(100),
    observacoes TEXT,
    
    -- Assinatura
    assinatura_nome VARCHAR(200) NOT NULL,
    assinatura_cpf VARCHAR(14) NOT NULL,
    assinatura_data TIMESTAMP NOT NULL,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'reprovado', 'duplicado')),
    data_cadastro TIMESTAMP NOT NULL DEFAULT NOW(),
    data_aprovacao TIMESTAMP,
    aprovado_por VARCHAR(100),
    motivo_reprovacao TEXT,
    
    -- Integração Firebase
    firebase_id VARCHAR(100),
    duplicado BOOLEAN DEFAULT FALSE,
    observacao_duplicado TEXT,
    
    -- Índices para buscas
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_pre_cadastros_status ON pre_cadastros(status);
CREATE INDEX idx_pre_cadastros_tipo ON pre_cadastros(tipo);
CREATE INDEX idx_pre_cadastros_cpf ON pre_cadastros(cpf);
CREATE INDEX idx_pre_cadastros_data_cadastro ON pre_cadastros(data_cadastro DESC);

-- ============================================================
-- TABELA: notas_fiscais
-- ============================================================
CREATE TABLE IF NOT EXISTS notas_fiscais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave_acesso VARCHAR(44) UNIQUE NOT NULL,
    numero VARCHAR(20) NOT NULL,
    serie VARCHAR(5),
    modelo VARCHAR(5),
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    
    -- Emitente
    emitente_nome VARCHAR(200) NOT NULL,
    emitente_cnpj VARCHAR(18) NOT NULL,
    emitente_endereco TEXT,
    
    -- Destinatário
    destinatario_nome VARCHAR(200) NOT NULL,
    destinatario_cnpj VARCHAR(18) NOT NULL,
    destinatario_endereco TEXT,
    
    -- Valores
    valor_total DECIMAL(15,2) NOT NULL,
    data_emissao DATE NOT NULL,
    data_recebimento DATE NOT NULL,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'reprovada', 'cancelada')),
    
    -- Arquivos
    arquivo_url TEXT,
    arquivo_nome VARCHAR(255),
    
    -- Observações
    observacoes TEXT,
    
    -- Auditoria
    usuario_criacao VARCHAR(100) NOT NULL,
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    data_aprovacao TIMESTAMP,
    aprovado_por VARCHAR(100),
    motivo_reprovacao TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: nota_fiscal_itens
-- ============================================================
CREATE TABLE IF NOT EXISTS nota_fiscal_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nota_fiscal_id UUID NOT NULL REFERENCES notas_fiscais(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    quantidade DECIMAL(15,3) NOT NULL,
    unidade VARCHAR(10),
    valor_unitario DECIMAL(15,2) NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES NOTAS FISCAIS
-- ============================================================
CREATE INDEX idx_notas_fiscais_status ON notas_fiscais(status);
CREATE INDEX idx_notas_fiscais_chave_acesso ON notas_fiscais(chave_acesso);
CREATE INDEX idx_notas_fiscais_emitente_cnpj ON notas_fiscais(emitente_cnpj);
CREATE INDEX idx_notas_fiscais_data_emissao ON notas_fiscais(data_emissao DESC);

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pre_cadastros_updated_at 
    BEFORE UPDATE ON pre_cadastros 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notas_fiscais_updated_at 
    BEFORE UPDATE ON notas_fiscais 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
