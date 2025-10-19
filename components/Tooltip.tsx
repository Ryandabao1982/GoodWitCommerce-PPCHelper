import React, { useState, useRef, useEffect } from 'react';

export interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  maxWidth?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  className = '',
  maxWidth = '200px',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, [showTimeout]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 dark:border-t-gray-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900 dark:border-b-gray-700',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900 dark:border-l-gray-700',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900 dark:border-r-gray-700',
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
          style={{ maxWidth }}
        >
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg py-2 px-3 shadow-lg">
            {content}
          </div>
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
};

export interface InfoTooltipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Compact info icon with tooltip - useful for inline help
 */
export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, position = 'top' }) => {
  return (
    <Tooltip content={content} position={position}>
      <span className="inline-flex items-center justify-center w-4 h-4 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-help rounded-full border border-current transition-colors">
        ?
      </span>
    </Tooltip>
  );
};

export interface KeyboardShortcutTooltipProps {
  description: string;
  shortcut: string;
  children: React.ReactNode;
}

/**
 * Tooltip that displays keyboard shortcut hints
 */
export const KeyboardShortcutTooltip: React.FC<KeyboardShortcutTooltipProps> = ({
  description,
  shortcut,
  children,
}) => {
  const content = (
    <div className="flex flex-col gap-1">
      <div>{description}</div>
      <div className="flex items-center gap-1 text-xs text-gray-300 dark:text-gray-400">
        <kbd className="px-1.5 py-0.5 bg-gray-800 dark:bg-gray-600 rounded border border-gray-700 dark:border-gray-500 font-mono">
          {shortcut}
        </kbd>
      </div>
    </div>
  );

  return (
    <Tooltip content={content} maxWidth="250px">
      {children}
    </Tooltip>
  );
};
