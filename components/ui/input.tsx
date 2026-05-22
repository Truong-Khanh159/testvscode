import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input className={cn("focus-ring rounded-2xl border border-blush bg-white/85 px-4 py-3 dark:bg-white/10", className)} ref={ref} {...props} />
));
Input.displayName = "Input";
