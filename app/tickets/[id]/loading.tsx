export default function Loading() {
  return (
    <div className="container max-w-5xl mx-auto py-10 px-4">
      {/* Back link skeleton */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white p-6">
        <div className="animate-pulse space-y-6">
          {/* Header: Title + Status + Action buttons */}
          <div className="flex justify-between items-start">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="h-8 w-96 bg-gray-200 rounded" /> {/* Title */}
                <div className="h-7 w-24 bg-gray-200 rounded-full" /> {/* Status badge */}
              </div>

              {/* Meta row: Priority, Assignee, Created date */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded" />
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded" />
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                </div>
              </div>
            </div>

            {/* Edit & Delete buttons */}
            <div className="flex gap-2">
              <div className="h-9 w-9 bg-gray-200 rounded-md" />
              <div className="h-9 w-9 bg-gray-200 rounded-md" />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200" />

          {/* Description section */}
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded" /> {/* "Description" label */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
          </div>

          {/* Info grid (2x2) */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-5 w-32 bg-gray-200 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-5 w-28 bg-gray-200 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-5 w-36 bg-gray-200 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-5 w-40 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}