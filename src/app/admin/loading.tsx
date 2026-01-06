
//C:\Users\studi\my-next-app\src\app\admin\loading.tsx


export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-5 w-40 bg-slate-800 rounded mb-2" />
        <div className="h-3 w-56 bg-slate-900 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-slate-900 border border-slate-800"
          />
        ))}
      </div>
    </div>
  );
}
