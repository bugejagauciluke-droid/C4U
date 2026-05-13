import Link from "next/link";
import { CheckCircle, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-28 text-center">
      <div className="h-16 w-16 rounded-full gradient-c4u flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold mb-3">You&apos;re in.</h1>
      <p className="text-muted-foreground text-lg mb-2">
        Welcome to C4U Premium. Your subscription is active and your free trial has started.
      </p>
      <p className="text-muted-foreground text-sm mb-10">
        A confirmation email is on its way. You can cancel anytime from your account settings.
      </p>
      <Link href="/support">
        <Button variant="gradient" size="lg">
          <Heart className="h-4 w-4" /> Get your first support session <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
