const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        {/* Main Spinner */}
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 dark:border-blue-800 dark:border-t-blue-400"></div>
        
        {/* Pulse Effect */}
        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-100 dark:border-blue-900"></div>
      </div>
      
      <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
        {message}
      </p>
      
      <div className="mt-2 flex space-x-1">
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
