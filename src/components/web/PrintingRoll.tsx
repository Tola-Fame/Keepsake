"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { RollScene } from "./printingRollScene";

/** Home page section: a paper roll that prints Keepsake pages as it follows the pointer. */
export default function PrintingRoll() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<RollScene | null>(null);
  const [printed, setPrinted] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reducedMotion);
    let disposed = false;
    let visible = false;
    const sync = () => scene.current?.setRunning(visible && document.visibilityState === "visible");

    // load the 3D code only when the section is about to be seen
    const loader = new IntersectionObserver(
      async ([e]) => {
        if (!e.isIntersecting) return;
        loader.disconnect();
        try {
          const { createRollScene } = await import("./printingRollScene");
          if (disposed) return;
          scene.current = await createRollScene({ canvas: cv, container: el, reducedMotion, onPrinted: setPrinted });
          if (disposed) return scene.current.dispose();
          setReady(true);
          sync();
        } catch {
          setFailed(true); // no WebGL: the section still reads fine without the animation
        }
      },
      { rootMargin: "300px" },
    );
    loader.observe(el);

    // only animate while on screen and the tab is visible
    const onScreen = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    onScreen.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      disposed = true;
      loader.disconnect();
      onScreen.disconnect();
      document.removeEventListener("visibilitychange", sync);
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  const toggle = () => {
    setPaused((p) => {
      scene.current?.setPaused(!p);
      return !p;
    });
  };

  // a click (not a drag) on the scene pauses or resumes it
  const down = useRef({ x: 0, y: 0, t: 0 });

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16" aria-labelledby="print-title">
      <div
        ref={box}
        className="printing-roll relative h-[560px] overflow-hidden rounded-[2rem] bg-paper ring-1 ring-line sm:h-[520px]"
        onPointerDown={(e) => (down.current = { x: e.clientX, y: e.clientY, t: performance.now() })}
        onPointerUp={(e) => {
          const d = down.current;
          if (ready && !reduced && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8 && performance.now() - d.t < 400 && !(e.target as HTMLElement).closest("a,button")) toggle();
        }}
      >
        <canvas ref={canvas} className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`} aria-hidden />
        {failed && <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,#fde4ee,transparent_60%)]" aria-hidden />}

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between p-6 sm:p-10">
          <div className="max-w-sm rounded-3xl bg-paper/80 p-5 backdrop-blur-sm sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-accent-dark">Printed & shipped</p>
            <h2 id="print-title" className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              Every page, printed for real.
            </h2>
            <p className="mt-3 text-ink/75">We print your book on quality paper, bind it and send it to your door.</p>
            <Link href="/trip" className="btn-primary pointer-events-auto mt-5 px-6 py-3">
              Make a travel book
            </Link>
          </div>
          <div className="flex items-end justify-between gap-4">
            {ready && !reduced ? (
              <button onClick={toggle} className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-muted shadow-sm backdrop-blur hover:text-ink">
                {paused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
                {paused ? "Resume" : "Pause"}
                <span className="hidden font-bold normal-case tracking-normal md:inline">· move your cursor to steer</span>
              </button>
            ) : (
              <span />
            )}
            {ready && (
              <div className="rounded-2xl bg-white/85 px-4 py-2 text-right shadow-sm backdrop-blur" aria-live="off">
                <p className="font-display text-3xl font-extrabold tabular-nums leading-none sm:text-4xl">{String(printed).padStart(4, "0")}</p>
                <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted">Pages printed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
