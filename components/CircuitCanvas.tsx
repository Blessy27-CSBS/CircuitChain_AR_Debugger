
import React, { useRef, useEffect, useState } from 'react';
import { CircuitAnalysisResult, Fault, DetectedComponent } from '../types';

interface Props {
  image: string;
  result: CircuitAnalysisResult | null;
  selectedFaultId: string | null;
  onSelectFault: (id: string) => void;
  selectedComponentLabel: string | null;
  onSelectComponent: (comp: DetectedComponent) => void;
}

export const CircuitCanvas: React.FC<Props> = ({ 
  image, 
  result, 
  selectedFaultId, 
  onSelectFault,
  selectedComponentLabel,
  onSelectComponent
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, [image, result]);

  const getPos = (coord: { x: number; y: number } | [number, number]) => {
    if (Array.isArray(coord)) {
        return {
            left: `${(coord[0] / 1000) * 100}%`,
            top: `${(coord[1] / 1000) * 100}%`,
        };
    }
    return {
        left: `${(coord.x / 1000) * 100}%`,
        top: `${(coord.y / 1000) * 100}%`,
    };
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-pink-100 shadow-inner bg-slate-900 group"
    >
      <img 
        src={image} 
        alt="Circuit Under Analysis" 
        className="w-full h-full object-contain"
        onLoad={() => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        }}
      />

      {result?.faults.map((fault) => (
        <div
          key={fault.id}
          className={`absolute cursor-pointer transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
            selectedFaultId === fault.id ? 'z-30 scale-125' : 'z-10'
          }`}
          style={getPos(fault.marker_coordinates)}
          onClick={(e) => {
            e.stopPropagation();
            onSelectFault(fault.id);
          }}
        >
          {fault.ar_element === 'pulse' && (
            <div className={`absolute w-12 h-12 rounded-full animate-ping opacity-75 ${
              fault.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-400'
            }`} />
          )}
          
          <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center shadow-lg transition-colors ${
            fault.severity === 'critical' 
              ? 'bg-red-500 border-white text-white' 
              : 'bg-yellow-400 border-white text-black'
          } ${selectedFaultId === fault.id ? 'ring-4 ring-pink-300' : ''}`}>
            {fault.severity === 'critical' ? '!' : '?'}
          </div>
        </div>
      ))}

      {/* Component labels */}
      {result?.detected_components.map((comp, idx) => (
        <div
          key={idx}
          className={`absolute cursor-pointer transition-all duration-200 border-2 rounded-lg transform -translate-x-1/2 -translate-y-1/2 flex items-start group/label ${
            selectedComponentLabel === comp.label ? 'z-20 border-blue-500 bg-blue-500/20 shadow-lg scale-110' : 'z-10 border-blue-400/50 hover:border-blue-500'
          }`}
          style={getPos(comp.center)}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(comp);
          }}
        >
          <span className={`text-[10px] text-white px-2 py-0.5 font-bold -translate-y-full rounded-t-lg transition-colors ${
            selectedComponentLabel === comp.label ? 'bg-blue-600' : 'bg-blue-500'
          }`}>
            {comp.label}
          </span>
          {/* Visual crosshair or box can be added here */}
          <div className={`w-12 h-12 -mt-6 -ml-6 border-2 border-dashed rounded-full pointer-events-none transition-opacity ${
            selectedComponentLabel === comp.label ? 'opacity-100 animate-spin-slow' : 'opacity-0'
          }`} style={{ animationDuration: '8s' }} />
        </div>
      ))}

      {/* Anime Mascot Overlay on Loading */}
      {!result && !image && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-50 text-pink-300">
              <span className="text-6xl mb-4">🔌</span>
              <p className="font-bold tracking-widest uppercase">Upload Circuit Image</p>
          </div>
      )}
    </div>
  );
};
