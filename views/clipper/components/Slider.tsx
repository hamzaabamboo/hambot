import React from 'react';
import 'rc-slider/assets/index.css';

interface SliderProps {
  value?: number;
  min?: number | string;
  max?: number | string;
  step?: number;
  onChange: (val: number) => void;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  onChange,
  step = 0.01,
}) => {
  return (
    <div className="flex mb-2">
      <input
        type="number"
        step={step}
        max={max}
        min={min}
        className="p-2 mr-2 rounded border border-black flex-shrink"
        value={value}
        onChange={(e) => {
          onChange(Number(e.target.value));
        }}
      />
      <input
        type="range"
        step=".01"
        className="w-100 flex-grow p-2"
        max={max}
        min={min}
        value={value}
        onChange={(e) => {
          onChange(Number(e.target.value));
        }}
      />
    </div>
  );
};
