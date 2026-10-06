import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Animated Ripple Circles */}
        <div className="absolute w-16 h-16 rounded-full border-2 border-brand-indigo/20 animate-ping opacity-75" />
        <div className="absolute w-12 h-12 rounded-full border-2 border-brand-orange/30 animate-pulse" />
        
        {/* ClickCart Branded Icon */}
        <div className="relative z-10 w-12 h-12 bg-white rounded-2xl shadow-sm border border-brand-border flex items-center justify-center p-2.5">
          <img 
            src="/logo-icon.svg" 
            alt="ClickCart" 
            className="w-full h-full object-contain animate-bounce"
            style={{ animationDuration: '1.4s' }}
          />
        </div>
      </div>
      
      <p className="text-sm font-medium text-brand-muted tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
