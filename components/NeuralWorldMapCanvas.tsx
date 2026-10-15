'use client';

import React, { useEffect, useRef } from 'react';

export function NeuralWorldMapCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Detailed world map clusters (continents + major geographic nodes)
    const continentClusters = [
      // North America (West, East, North, Central)
      { x: 0.16, y: 0.28, count: 18, radius: 0.10 },
      { x: 0.24, y: 0.32, count: 16, radius: 0.09 },
      { x: 0.20, y: 0.44, count: 10, radius: 0.07 },
      // Central & South America
      { x: 0.27, y: 0.58, count: 10, radius: 0.08 },
      { x: 0.32, y: 0.72, count: 16, radius: 0.11 },
      { x: 0.30, y: 0.85, count: 8, radius: 0.07 },
      // Europe (West, Nordic, Central, East)
      { x: 0.47, y: 0.26, count: 14, radius: 0.07 },
      { x: 0.52, y: 0.24, count: 12, radius: 0.08 },
      { x: 0.50, y: 0.35, count: 12, radius: 0.07 },
      // Africa (North, West, East, South)
      { x: 0.48, y: 0.48, count: 12, radius: 0.08 },
      { x: 0.53, y: 0.60, count: 16, radius: 0.10 },
      { x: 0.54, y: 0.78, count: 10, radius: 0.07 },
      // Middle East & Central Asia
      { x: 0.59, y: 0.38, count: 14, radius: 0.07 },
      { x: 0.66, y: 0.30, count: 16, radius: 0.09 },
      // South Asia (India) & East Asia (China, Japan, Korea)
      { x: 0.69, y: 0.46, count: 16, radius: 0.08 },
      { x: 0.77, y: 0.34, count: 22, radius: 0.10 },
      { x: 0.84, y: 0.32, count: 12, radius: 0.06 },
      // South East Asia & Oceania
      { x: 0.78, y: 0.56, count: 12, radius: 0.08 },
      { x: 0.83, y: 0.74, count: 16, radius: 0.10 },
      { x: 0.89, y: 0.82, count: 8, radius: 0.06 },
    ];

    interface NodePoint {
      normX: number;
      normY: number;
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      radius: number;
      alpha: number;
      pulseSpeed: number;
      isHub: boolean;
    }

    const points: NodePoint[] = [];

    continentClusters.forEach((cluster) => {
      // Create main cluster hub
      points.push({
        normX: cluster.x,
        normY: cluster.y,
        x: 0,
        y: 0,
        baseX: 0,
        baseY: 0,
        radius: 2.5,
        alpha: 0.85,
        pulseSpeed: 0.03,
        isHub: true,
      });

      // Scatter surrounding satellite neural nodes
      for (let i = 0; i < cluster.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * cluster.radius;
        const nx = Math.min(0.96, Math.max(0.04, cluster.x + Math.cos(angle) * dist * 1.3));
        const ny = Math.min(0.94, Math.max(0.06, cluster.y + Math.sin(angle) * dist));

        points.push({
          normX: nx,
          normY: ny,
          x: 0,
          y: 0,
          baseX: 0,
          baseY: 0,
          radius: Math.random() * 1.5 + 0.8,
          alpha: Math.random() * 0.5 + 0.25,
          pulseSpeed: Math.random() * 0.025 + 0.01,
          isHub: false,
        });
      }
    });

    const updatePointPositions = () => {
      points.forEach((p) => {
        p.baseX = p.normX * width;
        p.baseY = p.normY * height;
        p.x = p.baseX;
        p.y = p.baseY;
      });
    };

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width || window.innerWidth;
      height = canvas.height = rect.height || window.innerHeight;
      updatePointPositions();
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Neural transmission pulses traversing continents
    interface SignalPacket {
      fromIndex: number;
      toIndex: number;
      progress: number;
      speed: number;
    }

    const packets: SignalPacket[] = [];
    for (let i = 0; i < 18; i++) {
      const from = Math.floor(Math.random() * points.length);
      const to = (from + Math.floor(Math.random() * 15) + 1) % points.length;
      packets.push({
        fromIndex: from,
        toIndex: to,
        progress: Math.random(),
        speed: Math.random() * 0.006 + 0.003,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Cybernetic Latitude / Longitude & Grid coordinate Matrix
      ctx.strokeStyle = 'rgba(0, 85, 34, 0.14)';
      ctx.lineWidth = 1;
      const stepX = Math.max(40, width / 24);
      const stepY = Math.max(40, height / 14);

      // Vertical Longitude Lines
      for (let x = 0; x < width; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      // Horizontal Latitude Lines
      for (let y = 0; y < height; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Equator & Prime Meridian Highlight
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.5);
      ctx.lineTo(width, height * 0.5);
      ctx.stroke();

      // 2. Oscillate and draw Neural Synaptic Connections
      const maxConnectDist = Math.min(width, height) * 0.095;

      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        p1.x = p1.baseX + Math.sin(time + i * 0.5) * 3;
        p1.y = p1.baseY + Math.cos(time + i * 0.3) * 2.5;

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxConnectDist * maxConnectDist) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / maxConnectDist) * 0.28;
            ctx.strokeStyle = `rgba(0, 255, 102, ${lineAlpha})`;
            ctx.lineWidth = p1.isHub || p2.isHub ? 1 : 0.6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 3. Draw High-Speed Synaptic Signals traveling along neural pathways
      packets.forEach((pkt) => {
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) {
          pkt.progress = 0;
          pkt.fromIndex = Math.floor(Math.random() * points.length);
          pkt.toIndex = (pkt.fromIndex + Math.floor(Math.random() * 20) + 1) % points.length;
        }

        const pA = points[pkt.fromIndex];
        const pB = points[pkt.toIndex];
        if (pA && pB) {
          const curX = pA.x + (pB.x - pA.x) * pkt.progress;
          const curY = pA.y + (pB.y - pA.y) * pkt.progress;

          ctx.fillStyle = '#00ff66';
          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(curX, curY, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // 4. Draw World Topological Neural Nodes
      points.forEach((p) => {
        const pulse = Math.sin(time * 2.5 + p.pulseSpeed * 70) * 0.25 + 0.75;
        ctx.fillStyle = p.isHub
          ? `rgba(0, 255, 102, ${0.9 * pulse})`
          : `rgba(0, 255, 102, ${p.alpha * pulse})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.isHub ? p.radius * pulse : p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing rings for major global data hubs
        if (p.isHub) {
          ctx.strokeStyle = `rgba(0, 255, 102, ${0.25 * pulse})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5 * pulse, 0, Math.PI * 2);
          ctx.stroke();
        }
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
      className={`pointer-events-none ${className}`}
    />
  );
}
