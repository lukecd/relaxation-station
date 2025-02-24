import React from 'react';

interface HorizontalSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export const HorizontalSlider = ({
  value,
  onChange
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

  return (
    <div className="flex justify-center">
      <div 
        ref={sliderRef}
        className="w-48 h-6 bg-sunrise-clouds rounded-full relative cursor-pointer shadow-lg"
        onMouseDown={(e) => {
          isDragging.current = true;
          handleDrag(e.clientX);
        }}
      >
        <div 
          className="absolute left-0 h-full bg-sunrise-sun rounded-full transition-all shadow-inner"
          style={{ width: `${value}%` }}
        />
        <div 
          className="absolute h-4 w-4 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing"
          style={{ left: `${value}%` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            isDragging.current = true;
          }}
        />
      </div>
    </div>
  );
};

export default HorizontalSlider; 