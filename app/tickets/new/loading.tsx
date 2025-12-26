export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Back link skeleton */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Card skeleton */}
      <div className="border border-gray-200 rounded-lg shadow-sm animate-pulse">
        <div className="p-6 pb-4">
          {/* Card Title */}
          <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
        </div>

        <div className="px-6 pb-8 space-y-6">
          {/* Title field */}
          <div className="space-y-2">
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-3 w-64 bg-gray-200 rounded" />
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-3 w-72 bg-gray-200 rounded" />
          </div>

          {/* Status & Priority row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 w-14 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Assignee field */}
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-3 w-56 bg-gray-200 rounded" />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <div className="h-10 w-36 bg-gray-200 rounded" />
            <div className="h-10 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}