"use client";

import { lazy, Suspense } from "react";

const HeroBold = lazy(() => import("./HeroBold"));

function HeroBoldLazy() {
  return (
    <Suspense
      fallback={
        <div className="bg-strawhat-bg fixed inset-0 -z-10 overflow-hidden transition-colors duration-700">
          {/* CSS-only placeholder - shows instantly while 3D loads */}
          <div
            className="absolute inset-0 opacity-100"
            style={{ contain: "strict" }}
          >
            {/* Animated gradient core - mimics the 3D digital core */}
            <div
              className="absolute animate-pulse"
              style={{
                right: "15%",
                top: "50%",
                transform: "translateY(-50%)",
                width: "250px",
                height: "250px",
                background:
                  "radial-gradient(circle, rgba(225,29,72,0.3) 0%, rgba(225,29,72,0.1) 40%, transparent 70%)",
                borderRadius: "50%",
                filter: "blur(20px)",
              }}
            />
          </div>
        </div>
      }
    >
      <HeroBold />
    </Suspense>
  );
}

export default HeroBoldLazy;
