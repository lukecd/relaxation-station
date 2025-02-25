import React from 'react';

interface VerticalSliderProps {
  value: number;
  onChange: (value: number) => void;
  color: string;
  index: number;
  onMute: (index: number) => void;
}

export const VerticalSlider = ({ 
  value,
  onChange,
  color,
  index,
  onMute 
}: VerticalSliderProps) => {
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);

  const handleDrag = React.useCallback((clientY: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const height = rect.height;
    const y = clientY - rect.top;
    const newValue = Math.max(0, Math.min(100, (1 - y / height) * 100));
    onChange(newValue);
  }, [onChange]);

  const handleTouch = React.useCallback((clientY: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const height = rect.height;
    const y = clientY - rect.top;
    const newValue = Math.max(0, Math.min(100, (1 - y / height) * 100));
    onChange(newValue);
  }, [onChange]);

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      handleDrag(e.clientY);
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
      handleTouch(e.touches[0].clientY);
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
    <div className="h-48 md:h-64 flex flex-col items-center gap-2">
      <div 
        ref={sliderRef}
        className="h-full w-4 md:w-6 bg-white/20 backdrop-blur-sm rounded-full relative cursor-pointer shadow-lg"
        onMouseDown={(e) => {
          isDragging.current = true;
          handleDrag(e.clientY);
        }}
        onTouchStart={(e) => {
          isDragging.current = true;
          handleTouch(e.touches[0].clientY);
        }}
      >
        <div 
          className={`absolute bottom-0 w-full rounded-full transition-all shadow-inner ${color}`}
          style={{ height: `${value}%` }}
        />
      </div>
      <button 
        className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/90 shadow-lg hover:bg-white hover:scale-110 active:scale-95 transition-all backdrop-blur-sm flex items-center justify-center"
        onClick={() => {
          onChange(0);
          onMute(index);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();  // Prevent touch event from bubbling
        }}
        title="Mute"
      >
        <div className="w-3 md:w-4 h-0.5 bg-black/20 rounded-full" />
      </button>
    </div>
  );
};

export default VerticalSlider; 