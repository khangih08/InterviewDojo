import Link from "next/link";
import { MoveRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CtaBanner() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="rounded-2xl bg-primary text-primary-foreground p-10 text-center space-y-5">
        <ShieldCheck className="h-10 w-10 mx-auto opacity-80" />
        <h2 className="text-3xl font-bold">Ready to enter the Dojo?</h2>
        <p className="text-primary-foreground/80 max-w-md mx-auto">
          Join thousands of engineers leveling up their interview skills every
          day.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/register">
            Start for free <MoveRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
