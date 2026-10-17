export default function AdminCostosLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-6 space-y-6 animate-pulse">
      {/* HEADER DE COSTOS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black dark:border-zinc-700 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#0A0A0A]" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-zinc-700" />
          </div>
          <div className="h-9 w-80 bg-slate-200 dark:bg-zinc-700 mt-2" />
        </div>

        <div className="h-10 w-40 bg-slate-200 dark:bg-zinc-700 border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_#0A0A0A]" />
      </div>

      {/* BLOQUE DE KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-3.5 shadow-[3px_3px_0px_#0A0A0A] dark:shadow-[3px_3px_0px_#000000] flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-700" />
              <div className="h-4 w-4 bg-slate-200 dark:bg-zinc-700" />
            </div>
            <div>
              <div className="h-7 w-16 bg-slate-200 dark:bg-zinc-700 mb-1" />
              <div className="h-2.5 w-24 bg-slate-200 dark:bg-zinc-700" />
            </div>
          </div>
        ))}
      </div>

      {/* TABS DE SELECCIÓN */}
      <div className="flex gap-2 border-b-2 border-black dark:border-zinc-700 pb-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-36 sm:w-44 bg-slate-200 dark:bg-zinc-700 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A]"
          />
        ))}
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-7 w-20 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#0A0A0A]"
              />
            ))}
          </div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-zinc-700 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A]" />
        </div>

        {/* GRID DE RECETAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-5 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="h-5 w-40 bg-slate-200 dark:bg-zinc-700" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="h-6 w-20 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-zinc-900 p-2.5 border border-black dark:border-zinc-700">
                <div className="space-y-1">
                  <div className="h-2.5 w-10 bg-slate-200 dark:bg-zinc-700" />
                  <div className="h-5 w-12 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="space-y-1">
                  <div className="h-2.5 w-10 bg-slate-200 dark:bg-zinc-700" />
                  <div className="h-5 w-12 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="space-y-1">
                  <div className="h-2.5 w-10 bg-slate-200 dark:bg-zinc-700" />
                  <div className="h-5 w-12 bg-slate-200 dark:bg-zinc-700" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="h-8 w-24 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#0A0A0A]" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                  <div className="h-8 w-8 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
