"use client";

import { useEffect } from "react";

type Tod = "morning" | "day" | "evening" | "night";

function todForHour(h: number): Tod {
  if (h >= 5 && h < 10) return "morning";
  if (h >= 10 && h < 17) return "day";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

/**
 * Sun/lamp angle: morning = upper-left, midday = top-center, afternoon = upper-right,
 * evening = right, night = warm low glow from bottom-right.
 */
function lampPosition(h: number): { x: string; y: string } {
  if (h >= 5 && h < 12) {
    // sun rises from east — left side, climbs from low to high
    const t = (h - 5) / 7; // 0..1
    return { x: `${20 + t * 30}%`, y: `${60 - t * 35}%` };
  }
  if (h >= 12 && h < 17) {
    // sun moves right and lowers
    const t = (h - 12) / 5;
    return { x: `${50 + t * 30}%`, y: `${25 + t * 25}%` };
  }
  if (h >= 17 && h < 21) {
    // evening lamp from upper-right corner
    return { x: "78%", y: "30%" };
  }
  // night: warm candle low from one side
  return { x: "30%", y: "75%" };
}

export function TimeOfDay() {
  useEffect(() => {
    function apply() {
      const h = new Date().getHours();
      const tod = todForHour(h);
      const { x, y } = lampPosition(h);
      const body = document.body;
      body.classList.remove("tod-morning", "tod-day", "tod-evening", "tod-night");
      body.classList.add(`tod-${tod}`);
      body.style.setProperty("--lamp-x", x);
      body.style.setProperty("--lamp-y", y);
    }
    apply();
    // re-check every 5 minutes; cheap and keeps long-open tabs honest
    const id = window.setInterval(apply, 5 * 60 * 1000);
    return () => {
      window.clearInterval(id);
      const body = document.body;
      body.classList.remove("tod-morning", "tod-day", "tod-evening", "tod-night");
      body.style.removeProperty("--lamp-x");
      body.style.removeProperty("--lamp-y");
    };
  }, []);
  return null;
}
