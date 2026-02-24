export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded-lg" />
          <div className="h-4 w-64 bg-gray-100 rounded mt-2" />
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-10 w-10 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded mt-2" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="h-6 w-40 bg-gray-200 rounded" />
        </div>
        <div className="divide-y divide-gray-50">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-100 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
