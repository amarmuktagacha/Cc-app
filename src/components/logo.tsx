import { cn } from "@/lib/utils";

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid size-8 place-items-center rounded-md bg-primary text-primary-foreground",
          markClassName,
        )}
      >
        <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
          <path
            d="M13.2 7.2c-5 0-8.4 3.6-8.4 8.8s3.4 8.8 8.4 8.8c2.4 0 4.4-.8 5.9-2.2l-2.2-2.2c-.9.8-2.1 1.3-3.7 1.3-3.1 0-5.2-2.3-5.2-5.7s2.1-5.7 5.2-5.7c1.6 0 2.8.5 3.7 1.3l2.2-2.2c-1.5-1.4-3.5-2.2-5.9-2.2Z"
            fill="currentColor"
          />
          <path
            d="M21.6 7.2c-1.4 0-2.7.3-3.8.9l1.4 2.6c.7-.4 1.5-.6 2.4-.6 2.6 0 4.3 1.9 4.3 4.9s-1.7 4.9-4.3 4.9c-.9 0-1.7-.2-2.4-.6l-1.4 2.6c1.1.6 2.4.9 3.8.9 4.6 0 7.6-3.3 7.6-7.8s-3-7.8-7.6-7.8Z"
            fill="currentColor"
            opacity="0.7"
          />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Cc</span>
    </span>
  );
}
