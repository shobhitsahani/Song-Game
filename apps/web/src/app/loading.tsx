import { Skeleton } from '@/components/ui/skeleton';
import { GlassSurface } from '@/components/glass/glass-surface';

export default function Loading() {
  return (
    <main id="main-content" className="min-h-screen pt-24 pb-28 px-4 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48 rounded-2xl" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>

      <GlassSurface variant="strong" radius="xl" className="p-8 space-y-6">
        <Skeleton className="h-8 w-3/4 max-w-md mx-auto rounded-xl" />
        <Skeleton className="h-44 w-44 rounded-3xl mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      </GlassSurface>
    </main>
  );
}
