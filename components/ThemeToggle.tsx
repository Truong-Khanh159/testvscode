"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button className="rounded-full bg-white px-3 py-2 text-xs font-bold text-rosewood shadow-sm dark:bg-white/10" onClick={() => setDark((value) => !value)} type="button">
      {dark ? "Light" : "Dark"}
    </button>
  );
}
