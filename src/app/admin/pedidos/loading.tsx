export default function AdminPedidosLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black dark:border-zinc-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#0A0A0A]" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-zinc-700" />
          </div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-zinc-700 mt-2" />
        </div>

        <div className="h-8 w-36 bg-slate-200 dark:bg-zinc-700 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A]" />
      </div>

      {/* CONTROLES: PESTAÑAS DE ESTADO + BÚSQUEDA */}
      <div className="space-y-4">
        {/* Pestañas de estado */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="h-8 w-24 sm:w-28 bg-slate-200 dark:bg-zinc-700 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A]"
            />
          ))}
        </div>

        {/* Input de búsqueda */}
        <div className="h-11 w-full bg-slate-200 dark:bg-zinc-700 border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_#0A0A0A]" />

        {/* TABLA DE PEDIDOS */}
        <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[5px_5px_0px_#0A0A0A] dark:shadow-[5px_5px_0px_#000000] overflow-hidden">
          {/* Header de tabla */}
          <div className="border-b-2 border-black dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 p-3 grid grid-cols-12 gap-2">
            <div className="col-span-2 h-4 bg-slate-200 dark:bg-zinc-700" />
            <div className="col-span-4 h-4 bg-slate-200 dark:bg-zinc-700" />
            <div className="col-span-2 h-4 bg-slate-200 dark:bg-zinc-700" />
            <div className="col-span-2 h-4 bg-slate-200 dark:bg-zinc-700" />
            <div className="col-span-2 h-4 bg-slate-200 dark:bg-zinc-700" />
          </div>

          {/* Filas */}
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 p-2 space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="py-3 px-2 grid grid-cols-12 gap-2 items-center"
              >
                <div className="col-span-2">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-zinc-700 font-mono" />
                </div>
                <div className="col-span-4 space-y-1">
                  <div className="h-4 w-36 bg-slate-200 dark:bg-zinc-700" />
                  <div className="h-3 w-28 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-16 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="col-span-2">
                  <div className="h-6 w-24 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                </div>
                <div className="col-span-2 flex justify-end">
                  <div className="h-7 w-20 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#0A0A0A]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paginación */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 w-40 bg-slate-200 dark:bg-zinc-700" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A]" />
            <div className="h-8 w-20 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A]" />
          </div>
        </div>
      </div>
    </div>
  );
}
