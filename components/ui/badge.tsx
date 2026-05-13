import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white",
        secondary: "border-transparent bg-muted text-foreground",
        outline: "border-border text-foreground",
        teal: "border-transparent bg-teal-100 text-teal-700",
        purple: "border-transparent bg-violet-100 text-violet-700",
        gold: "border-transparent bg-amber-100 text-amber-700",
        green: "border-transparent bg-emerald-100 text-emerald-700",
        free: "border-transparent bg-teal-100 text-teal-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
