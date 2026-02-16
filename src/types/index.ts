export interface Contact {
  id: number
  nome: string
  dataNascimento: Date | null
  celular: string
}

export interface CommercialAction {
  id: string
  data: string
  nome: string
  fone: string
  acao: string
  origemCampanha: string
  orcamento: number | null
  canalVenda: string
  statusAtendimento: string
  fechamento: string
  valor: number | null
  tipoProcedimento: string
  profissional: string
  observacoes: string
}

export const ACAO_OPTIONS = [
  'ATIVA',
  'RECEPTIVA',
] as const

export const ORIGEM_CAMPANHA_OPTIONS = [
  'TRÁFEGO INSTAGRAM',
  'TRÁFEGO LAVIEEN',
  'CAPTAÇÃO INSTAGRAM',
  'CAPTAÇÃO LISTA WHATTS',
  'CONTATO FACEBOOK',
  'DISPARO IA',
  'CAMPANHA ANIVERSÁRIO JAN',
  'INDICAÇÃO ELIANE VAZ',
  'INDICAÇÃO PACIENTE',
  'AGENDAMENTOS CANCELADOS',
  'REAGENDAMENTO',
  'REAGENDAMENTO CANCELADOS',
  'SORTEIO NOVEMBRO',
] as const

export const CANAL_VENDA_OPTIONS = [
  'IA',
  'IA +DAIANE',
  'WHATTS',
  'INSTAGRAM',
  'CLINICORP',
] as const

export const STATUS_ATENDIMENTO_OPTIONS = [
  'AGENDADO',
  'AGENDADO DAIANE',
  'AGENDADO IA',
  'AGENDADO IA +DAIANE',
  'AGUARDANDO RETORNO',
  'EM CONTATO',
  'NÃO COMPARECEU',
  'NÃO DEMONSTROU INTERESSE',
  'REAGENDADO DAIANE',
  'SEM RETORNO',
  'TRANSFERIDA PRA RECEPÇÃO',
  'TENTAR OUTRO DIA',
  'RESTRIÇÕES DE JANELA 24HRS',
] as const

export const FECHAMENTO_OPTIONS = [
  'FECHOU PROCEDIMENTO',
  'AGENDOU E Ñ COMPARECEU',
  'BRINDE BOAS VINDAS',
  'COMPARECEU PARA PROCEDIMENTO',
  'DECLINOU LOCALIZAÇÃO',
  'FALTOU',
  'FALTOU A 2 AGENDAMENTOS',
  'TINHA PROCEDIMENTO EM OUTRO LOCAL',
] as const

export const TIPO_PROCEDIMENTO_OPTIONS = [
  'BOTOX',
  'PREENCHIMENTO',
  'HARMONIZACAO',
  'BIOESTIMULADOR',
  'LIMPEZA DE PELE',
  'PEELING',
  'SKINBOOSTER',
  'FIOS DE PDO',
  'LAVIEEN',
  'OUTROS',
] as const

export const PROFISSIONAL_OPTIONS = [
  'DRA. KAREN',
  'DRA. LORENA',
  'DAIANE',
  'OUTRO',
] as const
