"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-3">Something went wrong</h2>
        <p className="text-muted-foreground mb-8">
          An unexpected error occurred. Try refreshing — if it keeps happening, please get in touch.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
          <Link href="/">
            <Button variant="gradient">Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
