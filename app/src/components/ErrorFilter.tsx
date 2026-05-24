"use client";

import { useEffect } from "react";

const EXTENSION_PATTERNS = [
  /chrome-extension:/i,
  /moz-extension:/i,
  /safari-extension:/i,
  /safari-web-extension:/i,
  /Extension context invalidated/i,
  /A listener indicated an asynchronous response/i,
  /message channel closed/i,
  /ResizeObserver loop limit exceeded/i,
  /ResizeObserver loop completed/i,
];

function isExtensionNoise(text: string): boolean {
  return EXTENSION_PATTERNS.some((re) => re.test(text));
}

export function ErrorFilter() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      const msg = `${e.message} ${e.filename ?? ""} ${e.error?.stack ?? ""}`;
      if (isExtensionNoise(msg)) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      const msg =
        typeof reason === "string"
          ? reason
          : (reason && (reason.message || reason.stack)) || String(reason);
      if (isExtensionNoise(msg)) {
        e.preventDefault();
      }
    };
    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection, true);
    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection, true);
    };
  }, []);
  return null;
}
