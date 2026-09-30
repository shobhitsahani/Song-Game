'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div className="text-center max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}>
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">An unexpected error occurred. Please try again.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.location.href = '/'} icon={<Home className="w-4 h-4" />}>Go Home</Button>
          <Button variant="gradient" onClick={reset} icon={<RefreshCw className="w-4 h-4" />}>Try Again</Button>
        </div>
      </motion.div>
    </div>
  );
}
