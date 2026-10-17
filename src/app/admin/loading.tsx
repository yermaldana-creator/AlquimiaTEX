export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* BANNER DE BIENVENIDA Y ESTADO */}
      <div className="space-y-3 border-b-2 border-black dark:border-zinc-800 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-44 bg-slate-200 dark:bg-zinc-700 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A]" />
            <div className="h-6 w-36 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
          </div>
          <div className="h-7 w-32 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-1">
          <div className="space-y-2">
            <div className="h-9 w-72 sm:w-96 bg-slate-200 dark:bg-zinc-700" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-zinc-700" />
          </div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-700" />
        </div>
      </div>

      {/* BLOQUE 1: KPIs */}
      <div className="space-y-2">
        <div className="h-4 w-60 bg-slate-200 dark:bg-zinc-700" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-700" />
                <div className="h-4 w-4 bg-slate-200 dark:bg-zinc-700" />
              </div>
              <div className="h-8 w-14 bg-slate-200 dark:bg-zinc-700" />
              <div className="h-2.5 w-28 bg-slate-200 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      </div>

      {/* BLOQUE 2: TARJETAS DE MÓDULOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-5 shadow-[5px_5px_0px_#0A0A0A] dark:shadow-[5px_5px_0px_#000000] flex flex-col justify-between gap-4 h-48"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-slate-200 dark:bg-zinc-700" />
                <div className="h-5 w-36 bg-slate-200 dark:bg-zinc-700" />
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-zinc-700" />
              <div className="h-3 w-3/4 bg-slate-200 dark:bg-zinc-700" />
            </div>
            <div className="h-10 w-full bg-slate-200 dark:bg-zinc-700 border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_#0A0A0A]" />
          </div>
        ))}
      </div>

      {/* BLOQUE 3: PEDIDOS RECIENTES */}
      <div className="space-y-3">
        <div className="h-5 w-52 bg-slate-200 dark:bg-zinc-700" />
        <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[5px_5px_0px_#0A0A0A] dark:shadow-[5px_5px_0px_#000000] p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-700" />
                <div className="h-3 w-48 bg-slate-200 dark:bg-zinc-700" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-28 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                <div className="h-7 w-20 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
