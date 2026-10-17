export default function AdminInventarioLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black dark:border-zinc-700 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#0A0A0A]" />
            <div className="h-4 w-60 bg-slate-200 dark:bg-zinc-700" />
          </div>
          <div className="h-10 w-72 bg-slate-200 dark:bg-zinc-700 mt-2" />
        </div>

        <div className="h-8 w-36 bg-slate-200 dark:bg-zinc-700 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A]" />
      </div>

      {/* BLOQUE 1: KPIs DE INVENTARIO */}
      <div className="space-y-2">
        <div className="h-4 w-64 bg-slate-200 dark:bg-zinc-700" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 p-4 shadow-[4px_4px_0px_#0A0A0A] dark:shadow-[4px_4px_0px_#000000] space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-700" />
                <div className="h-4 w-4 bg-slate-200 dark:bg-zinc-700" />
              </div>
              <div className="h-8 w-16 bg-slate-200 dark:bg-zinc-700" />
              <div className="h-2.5 w-32 bg-slate-200 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      </div>

      {/* BLOQUE 2: TABLA DE INVENTARIO */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="h-5 w-56 bg-slate-200 dark:bg-zinc-700" />
        </div>

        {/* Pestañas de categorías + botón nuevo */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-8 w-20 sm:w-24 bg-slate-200 dark:bg-zinc-700 border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#0A0A0A]"
              />
            ))}
          </div>
          <div className="h-9 w-36 bg-slate-200 dark:bg-zinc-700 border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_#0A0A0A]" />
        </div>

        {/* Barra de búsqueda */}
        <div className="h-11 w-full bg-slate-200 dark:bg-zinc-700 border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_#0A0A0A]" />

        {/* Tabla neo-brutalista de ítems */}
        <div className="bg-white dark:bg-[#1E1E1E] border-2 border-black dark:border-zinc-700 shadow-[5px_5px_0px_#0A0A0A] dark:shadow-[5px_5px_0px_#000000] overflow-hidden">
          {/* Header */}
          <div className="border-b-2 border-black dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 p-3 grid grid-cols-12 gap-2">
            <div className="col-span-4 h-4 bg-slate-200 dark:bg-zinc-700" />
            <div className="col-span-2 h-4 bg-slate-200 dark:bg-zinc-700" />
            <div className="col-span-3 h-4 bg-slate-200 dark:bg-zinc-700" />
            <div className="col-span-1 h-4 bg-slate-200 dark:bg-zinc-700" />
            <div className="col-span-2 h-4 bg-slate-200 dark:bg-zinc-700" />
          </div>

          {/* Filas */}
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 p-2 space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="py-3 px-2 grid grid-cols-12 gap-2 items-center"
              >
                <div className="col-span-4 space-y-1">
                  <div className="h-4 w-40 bg-slate-200 dark:bg-zinc-700" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="col-span-2">
                  <div className="h-6 w-20 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="h-7 w-7 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                  <div className="h-6 w-14 bg-slate-200 dark:bg-zinc-700" />
                  <div className="h-7 w-7 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                </div>
                <div className="col-span-1">
                  <div className="h-4 w-12 bg-slate-200 dark:bg-zinc-700" />
                </div>
                <div className="col-span-2 flex justify-end gap-1.5">
                  <div className="h-7 w-7 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                  <div className="h-7 w-7 bg-slate-200 dark:bg-zinc-700 border border-black dark:border-zinc-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
