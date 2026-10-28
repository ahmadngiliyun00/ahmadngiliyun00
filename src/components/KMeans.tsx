"use client";

import { useEffect, useRef, useState } from "react";

export type KMeansLabels = {
  aria: string;
  caption: string;
  add: string;
  reset: string;
  iteration: string;
  running: string;
  converged: string;
};

type Point = { x: number; y: number; c: number };
type Centroid = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  fx: number;
  fy: number;
};
type Api = { add: () => void; reset: () => void };

const K = 3;
const COLORS = ["#3FD35A", "#6B97FF", "#F2EFE6"];
const IDLE = "#6C7EA6";
const HALO = "#0A1633";
const BLOBS: [number, number][] = [
  [0.22, 0.3],
  [0.76, 0.26],
  [0.52, 0.78],
];
const PER_BLOB = 46;
const STEP_MS = 700;
const PAUSE_MS = 280;
const EPS = 0.0015;
const MAX_POINTS = 360;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number) {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(v: number) {
  return Math.min(0.97, Math.max(0.03, v));
}

function ease(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function KMeans({ labels }: { labels: KMeansLabels }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<Api | null>(null);
  const [iter, setIter] = useState(0);
  const [converged, setConverged] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (canvas === null || wrap === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seeded = mulberry32(11);

    let points: Point[] = [];
    let cents: Centroid[] = [];
    let size = { w: 1, h: 1, dpr: 1 };
    let raf = 0;
    let moving = false;
    let done = false;
    let t0 = 0;
    let iterCount = 0;

    const seedPoints = () => {
      points = [];
      BLOBS.forEach(([bx, by]) => {
        for (let i = 0; i < PER_BLOB; i++) {
          points.push({
            x: clamp(bx + gauss(seeded) * 0.075),
            y: clamp(by + gauss(seeded) * 0.085),
            c: -1,
          });
        }
      });
    };

    const seedCentroids = (rand: () => number) => {
      cents = [];
      for (let i = 0; i < K; i++) {
        const x = 0.18 + rand() * 0.64;
        const y = 0.18 + rand() * 0.64;
        cents.push({ x, y, tx: x, ty: y, fx: x, fy: y });
      }
    };

    const assign = () => {
      points.forEach((p) => {
        let best = 0;
        let bd = Infinity;
        cents.forEach((c, i) => {
          const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
          if (d < bd) {
            bd = d;
            best = i;
          }
        });
        p.c = best;
      });
    };

    const computeTargets = () => {
      let shift = 0;
      cents.forEach((c, i) => {
        let sx = 0;
        let sy = 0;
        let n = 0;
        points.forEach((p) => {
          if (p.c === i) {
            sx += p.x;
            sy += p.y;
            n += 1;
          }
        });
        c.fx = c.x;
        c.fy = c.y;
        if (n > 0) {
          c.tx = sx / n;
          c.ty = sy / n;
        } else {
          c.tx = c.x;
          c.ty = c.y;
        }
        shift = Math.max(shift, Math.hypot(c.tx - c.x, c.ty - c.y));
      });
      return shift;
    };

    const draw = () => {
      const { w, h, dpr } = size;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const r = Math.max(3, w * 0.0085);

      ctx.lineWidth = 1;
      points.forEach((p) => {
        if (p.c < 0) return;
        const c = cents[p.c];
        ctx.strokeStyle = COLORS[p.c] + "22";
        ctx.beginPath();
        ctx.moveTo(p.x * w, p.y * h);
        ctx.lineTo(c.x * w, c.y * h);
        ctx.stroke();
      });

      points.forEach((p) => {
        ctx.fillStyle = p.c < 0 ? IDLE : COLORS[p.c];
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
        ctx.fill();
      });

      cents.forEach((c, i) => {
        const cx = c.x * w;
        const cy = c.y * h;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 3.4, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[i] + "26";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = COLORS[i];
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[i];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = HALO;
        ctx.stroke();
      });
    };

    const finish = () => {
      done = true;
      setIter(iterCount);
      setConverged(true);
    };

    const startStep = (now: number) => {
      assign();
      const shift = computeTargets();
      if (shift < EPS) {
        finish();
        return;
      }
      iterCount += 1;
      setIter(iterCount);
      moving = true;
      t0 = now;
    };

    const frame = (now: number) => {
      if (moving) {
        const t = Math.min(1, (now - t0) / STEP_MS);
        const e = ease(t);
        cents.forEach((c) => {
          c.x = c.fx + (c.tx - c.fx) * e;
          c.y = c.fy + (c.ty - c.fy) * e;
        });
        if (t >= 1) moving = false;
      } else if (now - t0 > STEP_MS + PAUSE_MS) {
        startStep(now);
      }
      draw();
      if (!done) raf = requestAnimationFrame(frame);
    };

    const settle = () => {
      for (let i = 0; i < 60; i++) {
        assign();
        const shift = computeTargets();
        cents.forEach((c) => {
          c.x = c.tx;
          c.y = c.ty;
        });
        if (shift < EPS) break;
        iterCount += 1;
      }
      done = true;
      setIter(iterCount);
      setConverged(true);
      draw();
    };

    const run = () => {
      cancelAnimationFrame(raf);
      done = false;
      setConverged(false);
      if (reduce) {
        settle();
        return;
      }
      moving = false;
      t0 = performance.now() - STEP_MS;
      raf = requestAnimationFrame(frame);
    };

    const addCluster = (cx: number, cy: number, n: number) => {
      const overflow = points.length + n - MAX_POINTS;
      if (overflow > 0) points.splice(0, overflow);
      for (let i = 0; i < n; i++) {
        points.push({
          x: clamp(cx + gauss(Math.random) * 0.04),
          y: clamp(cy + gauss(Math.random) * 0.045),
          c: -1,
        });
      }
      run();
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      draw();
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      addCluster(
        (e.clientX - rect.left) / rect.width,
        (e.clientY - rect.top) / rect.height,
        7,
      );
    };

    apiRef.current = {
      add: () =>
        addCluster(0.12 + Math.random() * 0.76, 0.12 + Math.random() * 0.76, 10),
      reset: () => {
        seedCentroids(Math.random);
        points.forEach((p) => {
          p.c = -1;
        });
        iterCount = 0;
        setIter(0);
        run();
      },
    };

    seedPoints();
    seedCentroids(seeded);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    canvas.addEventListener("pointerdown", onPointer);
    run();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointer);
      apiRef.current = null;
    };
  }, []);

  return (
    <figure className="m-0">
      <div
        ref={wrapRef}
        className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-line bg-surface"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={labels.aria}
          className="block h-full w-full cursor-crosshair touch-manipulation"
        />
      </div>
      <figcaption className="mt-5 flex flex-col gap-4 text-sm text-muted">
        <p className="max-w-[48ch]">{labels.caption}</p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn btn-line btn-small"
            onClick={() => apiRef.current?.add()}
          >
            {labels.add}
          </button>
          <button
            type="button"
            className="btn btn-line btn-small"
            onClick={() => apiRef.current?.reset()}
          >
            {labels.reset}
          </button>
          <span aria-hidden="true" className="text-xs">
            {labels.iteration} {iter}, {converged ? labels.converged : labels.running}
          </span>
        </div>
        <span className="sr-only" aria-live="polite">
          {converged ? labels.converged : labels.running}
        </span>
      </figcaption>
    </figure>
  );
}
