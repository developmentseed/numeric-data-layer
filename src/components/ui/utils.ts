import { useState, useRef, useEffect } from "react";

// Define the callback function type
type AnimationFrameCallback = (deltaTime: number) => void;

// Define the return type for our hook
interface PausableAnimationControls {
  isRunning: boolean;
  startAnimation: () => void;
  stopAnimation: () => void;
  toggleAnimation: () => void;
}

/**
 * A custom hook that provides requestAnimationFrame with pause/resume functionality
 * @param callback Function to call on each animation frame with deltaTime parameter
 * @returns Object with animation control functions and state
 */
export function usePausableAnimation(
  callback: AnimationFrameCallback
): PausableAnimationControls {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | undefined>(undefined);
  // Add a state to control whether the animation is running
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const animate = (time: number): void => {
    if (previousTimeRef.current !== undefined && isRunning) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning]); // Re-run when isRunning changes

  // Return functions to start and stop the animation
  const startAnimation = (): void => setIsRunning(true);
  const stopAnimation = (): void => setIsRunning(false);
  const toggleAnimation = (): void => setIsRunning((prev) => !prev);

  return { isRunning, startAnimation, stopAnimation, toggleAnimation };
}
