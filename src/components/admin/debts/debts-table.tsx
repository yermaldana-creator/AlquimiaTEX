"use client";

import { useState, useMemo } from "react";
import {
  HandCoins,
  Receipt,
  Search,
  Plus,
  DollarSign,
  History,
  CheckCircle2,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Debt, DebtStatus, DebtType, DebtCurrency } from "@/types";

interface DebtsTableProps {
  debts: Debt[];
  activeTypeTab: DebtType | "todos";
  onOpenCreateModal: (type?: DebtType) => void;
  onOpenEditModal: (debt: Debt) => void;
  onOpenPaymentModal: (debt: Debt) => void;
  onOpenHistoryModal: (debt: Debt) => void;
  onMarkAsPaid: (debtId: string) => Promise<void>;
  onDeleteDebt: (debtId: string) => Promise<void>;
  isProcessingId?: string | null;
}

export function DebtsTable({
  debts,
  activeTypeTab,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenPaymentModal,
  onOpenHistoryModal,
  onMarkAsPaid,
  onDeleteDebt,
  isProcessingId,
}: DebtsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DebtStatus | "todos">("todos");
  const [currencyFilter, setCurrencyFilter] = useState<DebtCurrency | "todas">("todas");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filtrado reactivo en cliente
  const filteredDebts = useMemo(() => {
    return debts.filter((d) => {
      // 1. Filtro por tipo de pestaña superior
      if (activeTypeTab !== "todos" && d.type !== activeTypeTab) {
        return false;
      }

      // 2. Filtro por estado
      if (statusFilter !== "todos" && d.status !== statusFilter) {
        return false;
      }

      // 3. Filtro por moneda
      if (currencyFilter !== "todas" && d.currency !== currencyFilter) {
        return false;
      }

      // 4. Búsqueda por texto (nombre, concepto, notas)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = d.entity_name.toLowerCase().includes(query);
        const matchDesc = d.description?.toLowerCase().includes(query);
        const matchNotes = d.notes?.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [debts, activeTypeTab, statusFilter, currencyFilter, searchTerm]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredDebts.length / pageSize));
  const paginatedDebts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDebts.slice(start, start + pageSize);
  }, [filteredDebts, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-3 sm:p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por cliente, proveedor, concepto o notas..."
            className="w-full bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 pl-9 pr-3 py-2 font-mono text-xs sm:text-sm text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
          />
        </div>

        {/* Filtros selectores */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Estado */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as DebtStatus | "todos");
              setCurrentPage(1);
            }}
            aria-label="Filtrar por estado"
            className="bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 px-3 py-2 font-mono text-xs font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
          >
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="parcial">Con Abonos (Parcial)</option>
            <option value="pagada">Pagadas (Saldadas)</option>
            <option value="vencida">Vencidas</option>
          </select>

          {/* Filtro Moneda */}
          <select
            value={currencyFilter}
            onChange={(e) => {
              setCurrencyFilter(e.target.value as DebtCurrency | "todas");
              setCurrentPage(1);
            }}
            aria-label="Filtrar por moneda"
            className="bg-[#F8F5EE] dark:bg-[#262626] border-2 border-black dark:border-zinc-700 px-3 py-2 font-mono text-xs font-bold text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
          >
            <option value="todas">Moneda: Todas</option>
            <option value="USD">Solo USD ($)</option>
            <option value="BS">Solo BS (Bs.)</option>
          </select>

          {/* Botón Nueva Deuda */}
          <button
            type="button"
            onClick={() => onOpenCreateModal(activeTypeTab === "todos" ? "por_cobrar" : activeTypeTab)}
            className="px-4 py-2 bg-[#FACC15] text-black border-2 border-black dark:border-zinc-700 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>+ Registrar Deuda</span>
          </button>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black dark:border-zinc-700 bg-[#F8F5EE] dark:bg-[#262626] font-mono text-[11px] font-black uppercase text-slate-700 dark:text-zinc-300">
              <th className="py-3 px-3 sm:px-4">Tipo</th>
              <th className="py-3 px-3 sm:px-4">Persona / Entidad</th>
              <th className="py-3 px-3 sm:px-4">Concepto</th>
              <th className="py-3 px-3 sm:px-4 text-right">Monto Original</th>
              <th className="py-3 px-3 sm:px-4 text-right">Abonado</th>
              <th className="py-3 px-3 sm:px-4">Saldo Pendiente</th>
              <th className="py-3 px-3 sm:px-4 text-center">Estado</th>
              <th className="py-3 px-3 sm:px-4 text-center">Vencimiento</th>
              <th className="py-3 px-3 sm:px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black/10 dark:divide-zinc-800 font-mono text-xs">
            {paginatedDebts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-zinc-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <HandCoins className="h-8 w-8 text-slate-400 opacity-50" />
                    <p className="font-bold uppercase tracking-wide">
                      No se encontraron registros de deudas
                    </p>
                    <p className="text-[11px]">
                      {searchTerm || statusFilter !== "todos" || currencyFilter !== "todas"
                        ? "Prueba cambiando o limpiando los filtros de búsqueda."
                        : "Haz clic en '+ Registrar Deuda' para agregar la primera cuenta."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedDebts.map((debt) => {
                const currencySym = debt.currency === "USD" ? "$" : "Bs.";
                const pending = Math.max(0, debt.amount_original - debt.amount_paid);
                const percentPaid =
                  debt.amount_original > 0
                    ? Math.min(100, Math.round((debt.amount_paid / debt.amount_original) * 100))
                    : 100;

                const isOverdue = debt.status === "vencida";
                const isPaid = debt.status === "pagada" || pending <= 0;
                const isProcessing = isProcessingId === debt.id;

                return (
                  <tr
                    key={debt.id}
                    className={`hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors ${
                      isPaid
                        ? "opacity-60 bg-emerald-50/30 dark:bg-emerald-950/10"
                        : isOverdue
                        ? "bg-rose-50/40 dark:bg-rose-950/10"
                        : ""
                    }`}
                  >
                    {/* 1. Tipo */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      {debt.type === "por_cobrar" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-black dark:border-emerald-800 font-mono text-[10px] font-black uppercase bg-[#DCFCE7] text-[#14532D] dark:bg-emerald-950/60 dark:text-emerald-300">
                          <HandCoins className="h-3 w-3" />
                          Cobrar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-black dark:border-orange-800 font-mono text-[10px] font-black uppercase bg-[#FFEDD5] text-[#7C2D12] dark:bg-orange-950/60 dark:text-orange-300">
                          <Receipt className="h-3 w-3" />
                          Pagar
                        </span>
                      )}
                    </td>

                    {/* 2. Persona / Entidad */}
                    <td className="py-3 px-3 sm:px-4">
                      <div className="font-oswald text-sm sm:text-base font-bold text-black dark:text-white uppercase leading-snug">
                        {debt.entity_name}
                      </div>
                      {debt.notes && (
                        <p className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 truncate max-w-xs">
                          {debt.notes}
                        </p>
                      )}
                    </td>

                    {/* 3. Concepto */}
                    <td className="py-3 px-3 sm:px-4 text-slate-700 dark:text-zinc-300 max-w-[200px] truncate">
                      {debt.description || "—"}
                    </td>

                    {/* 4. Monto Original */}
                    <td className="py-3 px-3 sm:px-4 text-right font-bold text-black dark:text-white whitespace-nowrap">
                      {currencySym} {debt.amount_original.toFixed(2)}
                    </td>

                    {/* 5. Monto Abonado */}
                    <td className="py-3 px-3 sm:px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                      {debt.amount_paid > 0 ? `${currencySym} ${debt.amount_paid.toFixed(2)}` : "—"}
                    </td>

                    {/* 6. Saldo Pendiente + Barra de Progreso */}
                    <td className="py-3 px-3 sm:px-4 min-w-[130px]">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`font-black ${pending > 0 ? "text-amber-800 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-400"}`}>
                          {currencySym} {pending.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {percentPaid}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-600 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isPaid ? "bg-emerald-500" : "bg-amber-400"
                          }`}
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>
                    </td>

                    {/* 7. Estado Badge */}
                    <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                      {debt.status === "pagada" && (
                        <span className="inline-block px-2 py-0.5 border border-black font-mono text-[10px] font-black uppercase bg-[#DCFCE7] text-[#14532D]">
                          Saldada
                        </span>
                      )}
                      {debt.status === "parcial" && (
                        <span className="inline-block px-2 py-0.5 border border-black font-mono text-[10px] font-black uppercase bg-[#FEF08A] text-[#854D0E]">
                          Parcial ({percentPaid}%)
                        </span>
                      )}
                      {debt.status === "pendiente" && (
                        <span className="inline-block px-2 py-0.5 border border-black font-mono text-[10px] font-black uppercase bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200">
                          Pendiente
                        </span>
                      )}
                      {debt.status === "vencida" && (
                        <span className="inline-block px-2 py-0.5 border border-rose-600 font-mono text-[10px] font-black uppercase bg-[#FFE4E6] text-[#9F1239] animate-pulse">
                          Vencida
                        </span>
                      )}
                    </td>

                    {/* 8. Vencimiento */}
                    <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                      {debt.due_date ? (
                        <div className={`flex items-center justify-center gap-1 font-mono text-[11px] ${
                          isOverdue ? "text-rose-600 dark:text-rose-400 font-black" : "text-slate-600 dark:text-zinc-400"
                        }`}>
                          {isOverdue && <AlertTriangle className="h-3 w-3 shrink-0" />}
                          <span>{debt.due_date}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* 9. Acciones */}
                    <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botón Abonar */}
                        {!isPaid && (
                          <button
                            type="button"
                            onClick={() => onOpenPaymentModal(debt)}
                            disabled={isProcessing}
                            title="Registrar Abono"
                            className="px-2 py-1 bg-white dark:bg-zinc-800 hover:bg-[#DCFCE7] text-slate-800 dark:text-zinc-100 hover:text-[#14532D] border border-black dark:border-zinc-600 font-mono text-[10px] font-black uppercase transition-all shadow-[1px_1px_0px_#0A0A0A] flex items-center gap-1"
                          >
                            <DollarSign className="h-3 w-3 text-emerald-600" />
                            <span>Abonar</span>
                          </button>
                        )}

                        {/* Botón Saldar Todo */}
                        {!isPaid && (
                          <button
                            type="button"
                            onClick={() => onMarkAsPaid(debt.id)}
                            disabled={isProcessing}
                            title="Saldar deuda completa"
                            className="px-2 py-1 bg-[#22C55E] hover:bg-[#16A34A] text-white border border-black dark:border-zinc-600 font-mono text-[10px] font-black uppercase transition-all shadow-[1px_1px_0px_#0A0A0A] flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Saldar</span>
                          </button>
                        )}

                        {/* Botón Historial de Abonos */}
                        <button
                          type="button"
                          onClick={() => onOpenHistoryModal(debt)}
                          title="Ver historial de abonos"
                          className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-black dark:border-zinc-600 text-slate-700 dark:text-zinc-300 transition-colors"
                        >
                          <History className="h-3.5 w-3.5" />
                        </button>

                        {/* Botón Editar */}
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(debt)}
                          title="Editar detalles"
                          className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-black dark:border-zinc-600 text-slate-700 dark:text-zinc-300 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Botón Eliminar con confirmación */}
                        {confirmDeleteId === debt.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteDebt(debt.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-1.5 py-0.5 bg-rose-600 text-white border border-black font-mono text-[10px] font-bold"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 bg-slate-200 text-black border border-black font-mono text-[10px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(debt.id)}
                            title="Eliminar registro"
                            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-black dark:border-zinc-600 text-rose-600 dark:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación y Resumen */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-slate-600 dark:text-zinc-400 py-2">
        <div className="flex items-center gap-2">
          <span>
            Mostrando <strong>{paginatedDebts.length}</strong> de <strong>{filteredDebts.length}</strong> cuentas
            {filteredDebts.length !== debts.length && ` (filtradas de ${debts.length} totales)`}
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-[#262626] border border-black dark:border-zinc-700 px-2 py-1 text-[11px] font-bold"
          >
            <option value={15}>15 por pág.</option>
            <option value={25}>25 por pág.</option>
            <option value={50}>50 por pág.</option>
            <option value={100}>100 por pág.</option>
          </select>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-[#262626] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-bold text-black dark:text-white">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-black dark:border-zinc-700 bg-white dark:bg-[#262626] disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
