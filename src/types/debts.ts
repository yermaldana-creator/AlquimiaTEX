export type DebtType = "por_cobrar" | "por_pagar";
export type DebtCurrency = "USD" | "BS";
export type DebtStatus = "pendiente" | "parcial" | "pagada" | "vencida";

export interface DebtPaymentRecord {
  id: string;
  amount: number;
  payment_method: string;
  date: string;
  notes?: string | null;
  registered_by?: string;
  created_at: string;
}

export interface Debt {
  id: string;
  type: DebtType;
  entity_name: string;
  description: string | null;
  currency: DebtCurrency;
  amount_original: number;
  amount_paid: number;
  status: DebtStatus;
  due_date: string | null;
  payments: DebtPaymentRecord[];
  order_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DebtsKpiData {
  // Cuentas por Cobrar (Clientes nos deben)
  totalReceivableUsd: number;
  totalReceivableBs: number;
  pendingReceivableCount: number;

  // Cuentas por Pagar (Debemos a proveedores/socios)
  totalPayableUsd: number;
  totalPayableBs: number;
  pendingPayableCount: number;

  // Balance Neto Estimado en USD (Cobrar USD - Pagar USD)
  netBalanceUsd: number;

  // Alertas
  overdueDebtsCount: number;
}

export interface GetDebtsParams {
  type?: DebtType | "todos";
  status?: DebtStatus | "todos";
  currency?: DebtCurrency | "todas";
  search?: string;
}

export interface GetDebtsResult {
  debts: Debt[];
  kpis: DebtsKpiData;
  totalCount: number;
  error?: string | null;
}

export interface DebtFormData {
  type: DebtType;
  entity_name: string;
  description?: string | null;
  currency: DebtCurrency;
  amount_original: number;
  due_date?: string | null;
  notes?: string | null;
}

export interface DebtPaymentFormData {
  amount: number;
  payment_method: string;
  date: string;
  notes?: string | null;
}
