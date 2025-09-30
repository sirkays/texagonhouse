"use client";

import {useEffect, useState} from "react";

interface Dot {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

export function DecorativeDots() {
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    const colors = [
      "oklch(0.62 0.19 45)", // orange
      "oklch(0.55 0.15 200)", // blue
      "oklch(0.65 0.18 280)", // purple
      "oklch(0.7 0.15 140)", // green
      "oklch(0.6 0.2 340)", // pink
    ];

    const generatedDots: Dot[] = Array.from({length: 30}, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      delay: Math.random() * 5,
    }));

    setDots(generatedDots);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute rounded-full animate-float"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            backgroundColor: dot.color,
            animationDelay: `${dot.delay}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}
