"use client";

import { useState, useTransition } from "react";
import {
  HandCoins,
  Receipt,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { DebtsKpis } from "./debts-kpis";
import { DebtsTable } from "./debts-table";
import { DebtFormModal } from "./debt-form-modal";
import { DebtPaymentModal } from "./debt-payment-modal";
import { DebtHistoryModal } from "./debt-history-modal";
import {
  getDebts,
  createDebt,
  updateDebt,
  registerDebtPayment,
  markDebtAsPaid,
  deleteDebt,
} from "@/actions/debts.actions";
import type {
  Debt,
  DebtsKpiData,
  DebtType,
  DebtFormData,
  DebtPaymentFormData,
} from "@/types";

interface DebtsDashboardProps {
  initialDebts: Debt[];
  initialKpis: DebtsKpiData;
}

export function DebtsDashboard({ initialDebts, initialKpis }: DebtsDashboardProps) {
  const [debts, setDebts] = useState<Debt[]>(initialDebts);
  const [kpis, setKpis] = useState<DebtsKpiData>(initialKpis);
  const [activeTypeTab, setActiveTypeTab] = useState<DebtType | "todos">("por_cobrar");

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [defaultFormType, setDefaultFormType] = useState<DebtType>("por_cobrar");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyDebt, setHistoryDebt] = useState<Debt | null>(null);

  // Estados de carga y feedback
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Recarga datos desde el servidor
  const reloadData = async () => {
    startTransition(async () => {
      const res = await getDebts();
      if (res.debts) {
        setDebts(res.debts);
        setKpis(res.kpis);
      }
    });
  };

  // 1. Abrir modal de creación
  const handleOpenCreateModal = (type?: DebtType) => {
    setEditingDebt(null);
    setDefaultFormType(type || (activeTypeTab === "todos" ? "por_cobrar" : activeTypeTab));
    setIsFormModalOpen(true);
  };

  // 2. Abrir modal de edición
  const handleOpenEditModal = (debt: Debt) => {
    setEditingDebt(debt);
    setDefaultFormType(debt.type);
    setIsFormModalOpen(true);
  };

  // 3. Guardar (crear o editar)
  const handleFormSubmit = async (data: DebtFormData) => {
    try {
      if (editingDebt) {
        const res = await updateDebt(editingDebt.id, data);
        if (res.success) {
          showNotification("success", "Deuda actualizada correctamente.");
          await reloadData();
          return { success: true };
        } else {
          return { success: false, error: res.error };
        }
      } else {
        const res = await createDebt(data);
        if (res.success) {
          showNotification("success", res.message || "Deuda registrada con éxito.");
          await reloadData();
          return { success: true };
        } else {
          return { success: false, error: res.error };
        }
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error inesperado al guardar.",
      };
    }
  };

  // 4. Abrir modal de abono
  const handleOpenPaymentModal = (debt: Debt) => {
    setPaymentDebt(debt);
    setIsPaymentModalOpen(true);
  };

  // 5. Registrar abono
  const handlePaymentSubmit = async (debtId: string, data: DebtPaymentFormData) => {
    try {
      const res = await registerDebtPayment(debtId, data);
      if (res.success) {
        showNotification("success", res.message || "Abono registrado con éxito.");
        await reloadData();
        return { success: true };
      } else {
        return { success: false, error: res.error };
      }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al registrar el abono.",
      };
    }
  };

  // 6. Abrir historial
  const handleOpenHistoryModal = (debt: Debt) => {
    setHistoryDebt(debt);
    setIsHistoryModalOpen(true);
  };

  // 7. Saldar 100% en un clic
  const handleMarkAsPaid = async (debtId: string) => {
    setProcessingId(debtId);
    try {
      const res = await markDebtAsPaid(debtId);
      if (res.success) {
        showNotification("success", res.message || "Deuda saldada en su totalidad.");
        await reloadData();
      } else {
        showNotification("error", res.error || "No se pudo saldar la deuda.");
      }
    } catch {
      showNotification("error", "Error inesperado al saldar la deuda.");
    } finally {
      setProcessingId(null);
    }
  };

  // 8. Eliminar deuda
  const handleDeleteDebt = async (debtId: string) => {
    setProcessingId(debtId);
    try {
      const res = await deleteDebt(debtId);
      if (res.success) {
        showNotification("success", "Registro eliminado correctamente.");
        await reloadData();
      } else {
        showNotification("error", res.error || "No se pudo eliminar el registro.");
      }
    } catch {
      showNotification("error", "Error inesperado al eliminar.");
    } finally {
      setProcessingId(null);
    }
  };

  const countReceivable = debts.filter((d) => d.type === "por_cobrar").length;
  const countPayable = debts.filter((d) => d.type === "por_pagar").length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          className={`p-3.5 border-2 border-black dark:border-zinc-700 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] flex items-center justify-between font-mono text-xs sm:text-sm font-bold transition-all ${
            feedback.type === "success"
              ? "bg-[#DCFCE7] text-[#14532D] border-[#15803D]"
              : "bg-rose-100 text-rose-900 border-rose-600"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-[#15803D] shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs uppercase hover:underline ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-black dark:border-zinc-700">
        <div>
          <div className="flex items-center gap-2.5">
            <HandCoins className="h-7 w-7 text-[#FACC15]" />
            <h1 className="font-oswald text-2xl sm:text-3xl font-black uppercase text-black dark:text-white tracking-wide">
              Gestión de Deudas y Cuentas
            </h1>
          </div>
          <p className="font-mono text-xs text-slate-600 dark:text-zinc-400 mt-1">
            Control bimonetario ($ / Bs.) de cuentas por cobrar (clientes) y compromisos por pagar (proveedores y taller).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reloadData}
            disabled={isPending}
            title="Recargar datos"
            className="p-2 border-2 border-black dark:border-zinc-700 bg-white dark:bg-[#1E1E1E] text-black dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 shadow-[2px_2px_0px_#0A0A0A] dark:shadow-[2px_2px_0px_#000000] disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 bg-[#FACC15] text-black border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>+ Nueva Cuenta</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <DebtsKpis kpis={kpis} />

      {/* Pestañas Principales (Por Cobrar vs Por Pagar vs Todas) */}
      <div className="flex items-center gap-2 border-b-2 border-black dark:border-zinc-700 pb-0 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTypeTab("por_cobrar")}
          className={`flex items-center gap-2 py-2.5 px-4 font-mono text-xs sm:text-sm font-black uppercase border-t-2 border-x-2 border-black dark:border-zinc-700 transition-all shrink-0 ${
            activeTypeTab === "por_cobrar"
              ? "bg-[#DCFCE7] text-[#14532D] shadow-[3px_0px_0px_#0A0A0A] -mb-[2px] pb-3"
              : "bg-white dark:bg-[#262626] text-slate-700 dark:text-zinc-300 opacity-75 hover:opacity-100"
          }`}
        >
          <HandCoins className="h-4 w-4" />
          <span>Por Cobrar (Clientes)</span>
          <span className="ml-1 px-1.5 py-0.2 bg-black/10 dark:bg-white/10 rounded-xs text-[10px]">
            {countReceivable}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTypeTab("por_pagar")}
          className={`flex items-center gap-2 py-2.5 px-4 font-mono text-xs sm:text-sm font-black uppercase border-t-2 border-x-2 border-black dark:border-zinc-700 transition-all shrink-0 ${
            activeTypeTab === "por_pagar"
              ? "bg-[#FFEDD5] text-[#7C2D12] shadow-[3px_0px_0px_#0A0A0A] -mb-[2px] pb-3"
              : "bg-white dark:bg-[#262626] text-slate-700 dark:text-zinc-300 opacity-75 hover:opacity-100"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Por Pagar (Proveedores)</span>
          <span className="ml-1 px-1.5 py-0.2 bg-black/10 dark:bg-white/10 rounded-xs text-[10px]">
            {countPayable}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTypeTab("todos")}
          className={`flex items-center gap-2 py-2.5 px-4 font-mono text-xs sm:text-sm font-black uppercase border-t-2 border-x-2 border-black dark:border-zinc-700 transition-all shrink-0 ${
            activeTypeTab === "todos"
              ? "bg-[#FEF08A] text-black shadow-[3px_0px_0px_#0A0A0A] -mb-[2px] pb-3"
              : "bg-white dark:bg-[#262626] text-slate-700 dark:text-zinc-300 opacity-75 hover:opacity-100"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Todas las Cuentas</span>
          <span className="ml-1 px-1.5 py-0.2 bg-black/10 dark:bg-white/10 rounded-xs text-[10px]">
            {debts.length}
          </span>
        </button>
      </div>

      {/* Tabla de Deudas */}
      <DebtsTable
        debts={debts}
        activeTypeTab={activeTypeTab}
        onOpenCreateModal={handleOpenCreateModal}
        onOpenEditModal={handleOpenEditModal}
        onOpenPaymentModal={handleOpenPaymentModal}
        onOpenHistoryModal={handleOpenHistoryModal}
        onMarkAsPaid={handleMarkAsPaid}
        onDeleteDebt={handleDeleteDebt}
        isProcessingId={processingId}
      />

      {/* Modales */}
      <DebtFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingDebt}
        defaultType={defaultFormType}
      />

      <DebtPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentDebt(null);
        }}
        debt={paymentDebt}
        onSubmit={handlePaymentSubmit}
      />

      <DebtHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setHistoryDebt(null);
        }}
        debt={historyDebt}
      />
    </div>
  );
}
