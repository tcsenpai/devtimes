"use client";

import { useEffect, useRef } from "react";
import { isFound, markFound, loadFound } from "@/lib/secrets";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const MAGIC_WORD = "shibboleet"; // xkcd 806 nod

export function SecretDetector() {
  const buf = useRef<string[]>([]);
  const wordBuf = useRef<string>("");
  const sfxToggleCount = useRef(0);
  const visitedPages = useRef<Set<number>>(new Set());

  useEffect(() => {
    // ---- konami code ----
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const inField =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if (!inField) {
        // konami buffer
        buf.current.push(e.key);
        if (buf.current.length > KONAMI.length) buf.current.shift();
        if (
          buf.current.length === KONAMI.length &&
          buf.current.every((k, i) => k.toLowerCase() === KONAMI[i].toLowerCase())
        ) {
          markFound("konami");
          buf.current = [];
        }

        // magic word buffer (letters only, lowercase)
        if (/^[a-zA-Z]$/.test(e.key)) {
          wordBuf.current = (wordBuf.current + e.key.toLowerCase()).slice(-32);
          if (wordBuf.current.includes(MAGIC_WORD)) {
            markFound("type-secret-word");
            wordBuf.current = "";
          }
        }
      }
    }
    window.addEventListener("keydown", onKey);

    // ---- visited pages set ----
    function onPageVisit(e: Event) {
      const ce = e as CustomEvent<{ page: number; total: number }>;
      if (!ce.detail) return;
      visitedPages.current.add(ce.detail.page);
      if (
        ce.detail.total > 0 &&
        visitedPages.current.size >= ce.detail.total &&
        !isFound("all-page-numbers")
      ) {
        markFound("all-page-numbers");
      }
    }
    window.addEventListener("devtimes:page-visit", onPageVisit as EventListener);

    // ---- stained five (count distinct stains in localStorage) ----
    function checkStains() {
      try {
        const raw = localStorage.getItem("devtimes.stains.v1");
        if (!raw) return;
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length >= 5 && !isFound("stained-five")) {
          markFound("stained-five");
        }
      } catch {
        /* noop */
      }
    }
    window.addEventListener("devtimes:stain-added", checkStains);
    checkStains();

    // ---- sfx toggle count ----
    function onSfxToggled() {
      sfxToggleCount.current += 1;
      if (sfxToggleCount.current >= 6 && !isFound("sfx-toggled-many")) {
        markFound("sfx-toggled-many");
      }
    }
    window.addEventListener("devtimes:sfx-toggled", onSfxToggled);

    // ---- midnight late ----
    function checkMidnight() {
      const h = new Date().getHours();
      if (h === 0 && !isFound("midnight-late")) {
        markFound("midnight-late");
      }
    }
    checkMidnight();
    const midnightInt = window.setInterval(checkMidnight, 60 * 1000);

    // ---- composed edition ----
    function checkComposeFromUrl() {
      if (typeof window === "undefined") return;
      const sp = new URLSearchParams(window.location.search);
      const sources = sp.get("sources");
      if (sources && sources !== "community" && !isFound("compose-edition")) {
        markFound("compose-edition");
      }
    }
    checkComposeFromUrl();

    // ---- spurelation chart click ----
    function onSpurelationClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target && target.closest("[data-spurelation-source]")) {
        if (!isFound("spurelation-clicked")) markFound("spurelation-clicked");
      }
    }
    window.addEventListener("click", onSpurelationClick, true);

    // ---- letter sent ----
    function onLetterSent() {
      if (!isFound("letter-sent")) markFound("letter-sent");
    }
    window.addEventListener("devtimes:letter-sent", onLetterSent);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("devtimes:page-visit", onPageVisit as EventListener);
      window.removeEventListener("devtimes:stain-added", checkStains);
      window.removeEventListener("devtimes:sfx-toggled", onSfxToggled);
      window.removeEventListener("click", onSpurelationClick, true);
      window.removeEventListener("devtimes:letter-sent", onLetterSent);
      window.clearInterval(midnightInt);
    };
  }, []);

  // pre-load: nothing to render
  // touch loadFound so module is bundled
  useEffect(() => {
    loadFound();
  }, []);
  return null;
}
