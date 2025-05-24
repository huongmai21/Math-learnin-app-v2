import React from "react";

const Skeleton = () => (
  <div className="bg-[#f9f9f9] rounded-md overflow-hidden shadow-sm animate-pulse">
    <div className="w-full h-40 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export default Skeleton;