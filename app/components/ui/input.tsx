import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  search?: boolean;
  width?: string | number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, search = false, placeholder, width, style, ...props },
    ref
  ) => {
    return (
      <div className="relative" style={{ width: width || "100%" }}>
        {search && (
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}

        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-md",
            "bg-[#f5f5f5] text-sm",
            "px-3 py-2",
            search && "pl-9",
            "placeholder:text-muted-foreground",
            "border-none outline-none",
            "focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
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
