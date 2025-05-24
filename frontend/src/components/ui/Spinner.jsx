const Spinner = ({ size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  }

  const sizeClass = sizeClasses[size] || sizeClasses.medium

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClass} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      ></div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default Spinner
