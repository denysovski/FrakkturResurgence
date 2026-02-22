import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [crosshair, setCrosshair] = useState({ x: 0, y: 0 });
  const [circle, setCircle] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      setCrosshair({ x: event.clientX, y: event.clientY });
      setIsVisible(true);

      const target = event.target as HTMLElement | null;
      const interactive =
        target?.closest("a,button,[role='button'],input,textarea,select,label,.cursor-clickable") !== null;
      setIsInteractive(interactive);
    };

    const handleLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseout", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseout", handleLeave);
    };
  }, []);

  useEffect(() => {
    let animationId = 0;

    const animate = () => {
      setCircle((prev) => ({
        x: prev.x + (crosshair.x - prev.x) * 0.16,
        y: prev.y + (crosshair.y - prev.y) * 0.16,
      }));
      animationId = window.requestAnimationFrame(animate);
    };

    animationId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationId);
  }, [crosshair.x, crosshair.y]);

  return (
    <>
      {/* Gun Scope Circle that follows with delay */}
      <span
        className={`custom-cursor-circle ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{ 
          transform: `translate3d(${circle.x}px, ${circle.y}px, 0)`,
        }}
      />
      
      {/* Crosshair (+ shape) at exact cursor position */}
      <span
        className={`custom-cursor-crosshair ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{ 
          transform: `translate3d(${crosshair.x}px, ${crosshair.y}px, 0) scale(${isInteractive ? 1.3 : 1})`
        }}
      >
        {/* Vertical line */}
        <div className="absolute w-[1px] h-4 bg-red-500 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        {/* Horizontal line */}
        <div className="absolute h-[1px] w-4 bg-red-500 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      </span>
    </>
  );
}
