import { useEffect } from "react";
import { initializeAuth } from "@/lib/auth";

/**
 * Hook that initializes authentication on app load.
 * Ensures session consistency by verifying stored user with server.
 */
export const useAuthInitialize = () => {
  useEffect(() => {
    void initializeAuth();
  }, []);
};
