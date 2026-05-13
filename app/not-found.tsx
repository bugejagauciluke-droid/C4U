import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 rounded-full gradient-c4u-soft flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Heart className="h-8 w-8 text-white fill-white" />
        </div>
        <h1 className="text-5xl font-black gradient-text mb-4">404</h1>
        <h2 className="text-xl font-bold mb-3">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          This page doesn&apos;t exist — but support always does.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="outline">Go home</Button>
          </Link>
          <Link href="/support">
            <Button variant="gradient">
              Get support now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
