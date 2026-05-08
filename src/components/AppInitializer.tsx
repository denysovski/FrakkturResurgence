import { useAuthInitialize } from "@/hooks/useAuthInitialize";

/**
 * Component that initializes app-level setup (like auth verification).
 * Wraps the entire app content to ensure initialization runs early.
 */
export const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  useAuthInitialize();
  
  return <>{children}</>;
};
