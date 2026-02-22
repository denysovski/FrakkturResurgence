import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [dot, setDot] = useState({ x: 0, y: 0 });
  const [ring, setRing] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      setDot({ x: event.clientX, y: event.clientY });
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
      setRing((prev) => ({
        x: prev.x + (dot.x - prev.x) * 0.16,
        y: prev.y + (dot.y - prev.y) * 0.16,
      }));
      animationId = window.requestAnimationFrame(animate);
    };

    animationId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationId);
  }, [dot.x, dot.y]);

  return (
    <>
      <span
        className={`custom-cursor-dot ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{ transform: `translate3d(${dot.x}px, ${dot.y}px, 0) scale(${isInteractive ? 1.5 : 1})` }}
      />
      <span
        className={`custom-cursor-ring ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{ transform: `translate3d(${ring.x}px, ${ring.y}px, 0)` }}
      />
    </>
  );
}
