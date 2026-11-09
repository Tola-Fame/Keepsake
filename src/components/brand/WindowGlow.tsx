/** Decorative airplane window with a soft, slowly drifting colour glow (brand motif). */
export default function WindowGlow({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`window-glow ${className}`}>
      <span className="left-[-20%] top-[-15%] h-[60%] w-[80%] bg-[#ff9a3c]" />
      <span className="right-[-25%] top-[5%] h-[45%] w-[70%] bg-[#ffe45c] [animation-delay:-4s]" />
      <span className="right-[-20%] top-[40%] h-[45%] w-[65%] bg-[#8fd0ff] [animation-delay:-8s]" />
      <span className="bottom-[-15%] left-[-15%] h-[55%] w-[75%] bg-[#a6f07c] [animation-delay:-2s]" />
      <span className="left-[25%] top-[35%] h-[35%] w-[50%] bg-[#ff4f9a] [animation-delay:-6s]" />
    </div>
  );
}
