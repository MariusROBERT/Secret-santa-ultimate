import {loadSlim} from "tsparticles-slim";
import React, {useCallback} from "react";
import type {Engine} from "tsparticles-engine";
import Particles from "react-particles";

export default function SnowBackground({children}: { children: React.ReactNode }) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
      <>
        <div style={{position: 'absolute', zIndex: 0}}>
          <Particles
              init={particlesInit}
              options={{
                background: {
                  color: {
                    value: "rgb(255,0,0)",
                  },
                },
                fpsLimit: 60,
                particles: {
                  color: {
                    value: "#fff",
                  },
                  move: {
                    direction: "bottom",
                    enable: true,
                    random: true,
                    speed: 5,
                  },
                  number: {
                    value: 150,
                  },
                  opacity: {
                    value: 0.5,
                  },
                  shape: {
                    type: "circle",
                  },
                  size: {
                    value: {min: 1, max: 5},
                  },
                },
                detectRetina: true,
              }}
          />
        </div>
        {children}
      </>
  );
}