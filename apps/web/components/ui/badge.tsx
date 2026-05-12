import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 border-nb-border px-2.5 py-0.5 text-xs font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-nb-primary text-white shadow-nb-sm",
        secondary: "bg-nb-secondary text-white shadow-nb-sm",
        accent: "bg-nb-accent text-nb-border shadow-nb-sm",
        outline: "bg-white text-nb-border",
        muted: "border-transparent bg-muted text-muted-foreground",
        success: "bg-green-100 text-green-800 border-green-800",
        warning: "bg-amber-100 text-amber-800 border-amber-800",
        danger: "bg-red-100 text-red-800 border-red-800",
        info: "bg-blue-100 text-blue-800 border-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
