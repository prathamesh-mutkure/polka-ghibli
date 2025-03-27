import React from "react";

interface LoadingAnimationProps {
  message: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center my-16">
      <div className="w-24 h-24 relative">
        {/* Ghibli-inspired loading animation */}
        <div className="absolute w-24 h-24 border-8 border-indigo-200 rounded-full"></div>
        <div className="absolute w-24 h-24 border-8 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute w-12 h-12 top-6 left-6 bg-white rounded-full"></div>
        <div className="absolute w-4 h-4 bg-indigo-600 rounded-full top-10 left-10 animate-bounce"></div>
      </div>
      <p className="mt-6 text-center text-gray-600 max-w-md">{message}</p>
    </div>
  );
};

export default LoadingAnimation;
