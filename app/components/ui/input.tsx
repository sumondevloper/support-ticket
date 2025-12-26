import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  search?: boolean; // show search icon
  width?: string | number; // NEW: dynamic width prop
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, search = false, placeholder, width, style, ...props }, ref) => {
    return (
      <div className="relative" style={{ width: width || '100%' }}>
        {search && (
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}

        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={cn(
            "flex h-10 rounded-md w-full", // Keep w-full for input to fill container
            "bg-[#f5f5f5] text-sm", // smoky white
            "px-3 py-2",
            search && "pl-9", // space for search icon
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "border-none",
            className
          )}
          style={style}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };