const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-4 animate-pulse">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8 flex justify-between items-center">
          <div className="h-10 bg-gray-700/50 rounded-lg w-48"></div>
          <div className="h-10 bg-gray-700/50 rounded-lg w-32"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl"
            >
              <div className="h-4 bg-gray-700/50 rounded w-24 mb-3"></div>
              <div className="h-8 bg-gray-600/50 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-700/50 rounded w-32"></div>
            </div>
          ))}
        </div>

        {/* Heatmap Skeleton */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl mb-8">
          <div className="h-6 bg-gray-700/50 rounded w-40 mb-6"></div>
          <div className="grid grid-cols-12 gap-2">
            {Array.from({ length: 84 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-700/30 rounded"></div>
            ))}
          </div>
        </div>

        {/* Monthly Overview Skeleton */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl">
          <div className="h-6 bg-gray-700/50 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-gray-700/30 rounded-xl p-4 h-20"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
