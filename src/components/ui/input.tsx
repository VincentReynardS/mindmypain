import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-calm-border bg-white px-3 py-2 text-sm text-calm-text shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-calm-text placeholder:text-calm-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm-blue disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
