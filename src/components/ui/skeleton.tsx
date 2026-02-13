import { cn } from "@/lib/utils";

/** Pulsing placeholder block used as a loading indicator while content is being fetched. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
