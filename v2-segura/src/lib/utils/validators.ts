// src/lib/utils/validators.ts

// Valida CPF
export const validarCPF = (cpf: string): boolean => {
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpfLimpo)) return false;
  
  // Validação do dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto >= 10 ? 0 : resto;
  
  if (parseInt(cpfLimpo.charAt(9)) !== digito1) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto >= 10 ? 0 : resto;
  
  return parseInt(cpfLimpo.charAt(10)) === digito2;
};

// Valida E-mail
export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Valida Telefone (mínimo 10 dígitos)
export const validarTelefone = (telefone: string): boolean => {
  const digits = telefone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};

// Verifica se campo está vazio
export const isEmpty = (value: string): boolean => {
  return value.trim() === '';
};

// Valida senha (mínimo 6 caracteres)
export const validarSenha = (senha: string): boolean => {
  return senha.length >= 6;
};
