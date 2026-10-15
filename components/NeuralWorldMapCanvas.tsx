'use client';

import React, { useEffect, useRef } from 'react';

export function NeuralWorldMapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // World node clusters (representing continents/global data hubs)
    const continents = [
      // North America
      { x: 0.20, y: 0.35, nodes: 14 },
      // South America
      { x: 0.32, y: 0.70, nodes: 10 },
      // Europe
      { x: 0.48, y: 0.30, nodes: 12 },
      // Africa
      { x: 0.52, y: 0.60, nodes: 11 },
      // Asia
      { x: 0.72, y: 0.35, nodes: 18 },
      // Australia / Oceania
      { x: 0.84, y: 0.75, nodes: 8 },
    ];

    interface NodePoint {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      pulseSpeed: number;
    }

    const points: NodePoint[] = [];

    // Generate clusters of points mimicking world map topology
    continents.forEach((cont) => {
      for (let i = 0; i < cont.nodes; i++) {
        const spreadX = (Math.random() - 0.5) * 0.16;
        const spreadY = (Math.random() - 0.5) * 0.22;
        const px = Math.min(0.95, Math.max(0.05, cont.x + spreadX));
        const py = Math.min(0.92, Math.max(0.08, cont.y + spreadY));

        points.push({
          x: px * width,
          y: py * height,
          baseX: px * width,
          baseY: py * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.8 + 1,
          alpha: Math.random() * 0.6 + 0.3,
          pulseSpeed: Math.random() * 0.03 + 0.01,
        });
      }
    });

    // Connecting signal pulses traveling between neural nodes
    interface SignalPacket {
      fromIndex: number;
      toIndex: number;
      progress: number;
      speed: number;
    }

    const packets: SignalPacket[] = [];
    for (let i = 0; i < 6; i++) {
      const from = Math.floor(Math.random() * points.length);
      const to = (from + Math.floor(Math.random() * 8) + 1) % points.length;
      packets.push({
        fromIndex: from,
        toIndex: to,
        progress: Math.random(),
        speed: Math.random() * 0.008 + 0.004,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Subtle grid coordinate lines
      ctx.strokeStyle = 'rgba(0, 85, 34, 0.12)';
      ctx.lineWidth = 1;
      const step = 28;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update and draw neural connection lines between nearby world points
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];

        // Slight natural floating oscillation
        p1.x = p1.baseX + Math.sin(time + i) * 3;
        p1.y = p1.baseY + Math.cos(time + i * 0.7) * 2.5;

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect if within proximity threshold
          if (dist < 65) {
            const lineAlpha = (1 - dist / 65) * 0.35;
            ctx.strokeStyle = `rgba(0, 255, 102, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw transmitting signal packets
      packets.forEach((pkt) => {
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) {
          pkt.progress = 0;
          pkt.fromIndex = Math.floor(Math.random() * points.length);
          pkt.toIndex = (pkt.fromIndex + Math.floor(Math.random() * 10) + 1) % points.length;
        }

        const pA = points[pkt.fromIndex];
        const pB = points[pkt.toIndex];
        if (pA && pB) {
          const curX = pA.x + (pB.x - pA.x) * pkt.progress;
          const curY = pA.y + (pB.y - pA.y) * pkt.progress;

          ctx.fillStyle = '#00ff66';
          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(curX, curY, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw world nodes
      points.forEach((p) => {
        const pulse = Math.sin(time * 2 + p.pulseSpeed * 50) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(0, 255, 102, ${p.alpha * pulse})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none opacity-45"
    />
  );
}
