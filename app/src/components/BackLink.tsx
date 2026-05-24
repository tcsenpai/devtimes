"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  fallback: string;
  className?: string;
  children: React.ReactNode;
};

export function BackLink({ fallback, className, children }: Props) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ref = document.referrer;
    const sameOrigin = !!ref && new URL(ref).origin === window.location.origin;
    setCanGoBack(sameOrigin && window.history.length > 1);
  }, []);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (canGoBack) router.back();
    else router.push(fallback);
  };

  return (
    <a href={fallback} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
