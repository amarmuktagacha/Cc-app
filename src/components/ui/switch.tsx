import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full shadow-[var(--shadow-border)] transition-[background-color] duration-150 ease-out data-[state=checked]:bg-live data-[state=unchecked]:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:cursor-not-allowed disabled:opacity-40",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block size-5 rounded-full bg-foreground shadow-sm transition-transform duration-150 ease-out data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1 data-[state=checked]:bg-live-fg",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
