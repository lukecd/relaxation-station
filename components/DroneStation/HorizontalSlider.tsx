import React from 'react';

interface HorizontalSliderProps {
  value: number;
  onChange: (value: number) => void;
  variant?: 'ambient' | 'melody';
}

export const HorizontalSlider = ({
  value,
  onChange,
  variant = 'ambient'
}: HorizontalSliderProps) => {
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);

  const handleDrag = React.useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const width = rect.width;
    const x = clientX - rect.left;
    const newValue = Math.max(0, Math.min(100, (x / width) * 100));
    onChange(newValue);
  }, [onChange]);

  const handleTouch = React.useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const width = rect.width;
    const x = clientX - rect.left;
    const newValue = Math.max(0, Math.min(100, (x / width) * 100));
    onChange(newValue);
  }, [onChange]);

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      handleDrag(e.clientX);
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleDrag]);

  React.useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      handleTouch(e.touches[0].clientX);
    };

    const onTouchEnd = () => {
      isDragging.current = false;
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleTouch]);

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <div className="flex justify-center flex-1">
        <div 
          ref={sliderRef}
          className={`w-36 md:w-48 h-4 md:h-6 ${
            variant === 'ambient' ? 'bg-sunrise-clouds' : 'bg-white/20'
          } rounded-full relative cursor-pointer shadow-lg`}
          onMouseDown={(e) => {
            isDragging.current = true;
            handleDrag(e.clientX);
          }}
          onTouchStart={(e) => {
            isDragging.current = true;
            handleTouch(e.touches[0].clientX);
          }}
        >
          <div 
            className={`absolute left-0 h-full ${
              variant === 'ambient' ? 'bg-sunrise-sun' : 'bg-[rgb(255,229,217)]'
            } rounded-full transition-all shadow-inner`}
            style={{ width: `${value}%` }}
          />
          <div 
            className="absolute h-3 w-3 md:h-4 md:w-4 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing"
            style={{ left: `${value}%` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              isDragging.current = true;
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              isDragging.current = true;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HorizontalSlider; 