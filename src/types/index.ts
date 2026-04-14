export type EntryType = 'revenue' | 'expense' | 'withdrawal'

export interface Entry {
  id: string
  user_id: string
  type: EntryType
  category: string
  description: string
  amount: number
  competence_date: string   // Data de Competência → DRE
  payment_date: string      // Data de Pagamento/Recebimento → Fluxo de Caixa
  created_at: string
  recurrence_id?: string | null
}

export interface DRE {
  // Receita
  faturamentoBruto: number
  // Impostos
  impostos: number
  faturamentoLiquido: number
  // CMV
  cmv: number
  lucroBruto: number
  lucroBrutoMargin: number
  // Despesas Variáveis de Venda
  comissoesVendas: number
  marketingAds: number
  taxasCartao: number
  totalDespesasVariaveis: number
  margemContribuicao: number
  margemContribuicaoMargin: number
  // Despesas Fixas
  despesasRH: number
  despesasOcupacao: number
  despesasAdmin: number
  totalDespesasFixas: number
  // EBITDA
  ebitda: number
  ebitdaMargin: number
  // Resultado
  retiradas: number
  lucro: number
  lucroMargin: number
}

export interface CashFlowEntry {
  date: string
  revenue: number
  costs: number
  withdrawals: number
  balance: number
}

export interface ProjectedCashFlow {
  month: string
  projectedRevenue: number
  projectedCosts: number
  projectedWithdrawals: number
  projectedBalance: number
}

export interface MonthlyData {
  month: string
  revenue: number
  fixedCosts: number
  variableCosts: number
  withdrawals: number
  profit: number
}

export interface CategoryData {
  category: string
  amount: number
  percentage: number
}

export interface User {
  id: string
  email: string
  created_at: string
  role?: string
}

// ── Receita ────────────────────────────────────────────────────────────────
export const REVENUE_CATEGORIES = [
  'Vendas',
  'Serviços',
  'Consultoria',
  'Assinaturas',
  'Outras Receitas',
]

// ── Impostos & CMV ─────────────────────────────────────────────────────────
export const IMPOSTOS_CMV_CATEGORIES = [
  'Impostos',
  'CMV',
]

// ── Despesas Variáveis de Venda ────────────────────────────────────────────
export const VAR_SALES_CATEGORIES = [
  'Comissões de Venda',
  'Marketing e Anúncios',
  'Taxas de Cartão',
  'Outras Despesas Variáveis',
]

// ── Despesas Fixas — RH ────────────────────────────────────────────────────
export const FIXED_RH_CATEGORIES = [
  'Salários',
  'Pró-labore',
  'Encargos e Outros',
]

// ── Despesas Fixas — Ocupação ──────────────────────────────────────────────
export const FIXED_OCUPACAO_CATEGORIES = [
  'Aluguel',
  'Energia',
  'Água',
  'Internet',
  'Telefone',
  'Outros Custos com Ocupação',
]

// ── Despesas Fixas — Administrativo ───────────────────────────────────────
export const FIXED_ADMIN_CATEGORIES = [
  'Contabilidade e Fiscal',
  'Telefonia e Internet',
  'Sistemas e Assinaturas',
  'Taxas Bancárias',
  'Consultorias e Assessorias',
  'Serviços Pontuais Contratados',
  'Marketing Fixo (agência/prestador)',
  'Outras Administrativas',
]

// ── Agregações ─────────────────────────────────────────────────────────────
export const ALL_FIXED_CATEGORIES = [
  ...FIXED_RH_CATEGORIES,
  ...FIXED_OCUPACAO_CATEGORIES,
  ...FIXED_ADMIN_CATEGORIES,
]

export const ALL_VARIABLE_CATEGORIES = [
  ...IMPOSTOS_CMV_CATEGORIES,
  ...VAR_SALES_CATEGORIES,
]

// ── Grupos para o select de categoria ─────────────────────────────────────
export const EXPENSE_CATEGORY_GROUPS = [
  { group: 'Impostos & CMV',              categories: IMPOSTOS_CMV_CATEGORIES },
  { group: 'Despesas Variáveis de Venda', categories: VAR_SALES_CATEGORIES },
  { group: 'Despesas Fixas — RH',         categories: FIXED_RH_CATEGORIES },
  { group: 'Despesas Fixas — Ocupação',   categories: FIXED_OCUPACAO_CATEGORIES },
  { group: 'Despesas Fixas — Administrativo', categories: FIXED_ADMIN_CATEGORIES },
]
