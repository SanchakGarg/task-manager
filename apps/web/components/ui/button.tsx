import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-nb-primary text-white border-2 border-nb-border rounded-nb shadow-nb hover:shadow-nb-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none",
        secondary:
          "bg-nb-secondary text-white border-2 border-nb-border rounded-nb shadow-nb hover:shadow-nb-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none",
        accent:
          "bg-nb-accent text-nb-border border-2 border-nb-border rounded-nb shadow-nb hover:shadow-nb-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none",
        outline:
          "bg-card text-foreground border-2 border-nb-border dark:border-border rounded-nb shadow-nb-sm hover:bg-muted hover:shadow-nb hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none",
        ghost:
          "bg-transparent text-foreground rounded-nb hover:bg-muted border-2 border-transparent hover:border-nb-border",
        destructive:
          "bg-nb-danger text-white border-2 border-nb-border rounded-nb shadow-nb hover:shadow-nb-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none",
        success:
          "bg-nb-success text-white border-2 border-nb-border rounded-nb shadow-nb hover:shadow-nb-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none",
        link: "text-nb-primary underline-offset-4 hover:underline border-none shadow-none",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-nb-lg px-8 text-base",
        xl: "h-14 rounded-nb-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
