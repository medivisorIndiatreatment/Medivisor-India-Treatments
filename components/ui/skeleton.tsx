import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md border-gray-200 bg-muted', className)}
      {...props}
    />
  );
}

// Skeleton with staggered animation delay for sequential loading effect
export function SkeletonItem({
  className,
  delay = 0,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { delay?: number }) {
  return (
    <div
      className={cn('animate-pulse rounded-md border-gray-200 bg-muted', className)}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
      {...props}
    />
  );
}

// Skeleton card with built-in sequential delays for better loading experience
export function SkeletonCard({
  index = 0,
  baseDelay = 50,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { index?: number; baseDelay?: number }) {
  const delay = index * baseDelay;
  return (
    <div
      className={cn('rounded-lg border border-gray-100 bg-white', props.className)}
      style={{ animation: `fadeIn 0.4s ease-out ${delay}ms forwards`, opacity: 0 }}
    >
      <div className="animate-pulse" style={{ animationDelay: `${delay + 100}ms` }}>
        {props.children}
      </div>
    </div>
  );
}

export { Skeleton };
