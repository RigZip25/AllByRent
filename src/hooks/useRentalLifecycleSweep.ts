import { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import {
  resetRentalLifecycleSweep,
  runRentalLifecycleSweep,
} from "../lib/rentalLifecycleSweep";

/**
 * Runs the rental deadline sweep where the app starts, not where rentals are
 * shown: a request that expired, a pickup nobody came to and a no-show the host
 * never confirmed all used to sit unchanged until somebody opened the Rentals
 * tab — including in the notification badge and the host's dashboard, which
 * read the same records.
 */
export function useRentalLifecycleSweep(): void {
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) {
      resetRentalLifecycleSweep();
      return;
    }

    void runRentalLifecycleSweep(userId, { force: true });

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      // Coming back after an hour in a pocket is exactly when a deadline has
      // passed; the sweep throttles itself so a tab switch costs nothing.
      void runRentalLifecycleSweep(userId);
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [userId]);
}
