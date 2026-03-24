import Link from "next/link";
import { MoveRight, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-24 text-center space-y-6">
      <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
        <Zap className="h-3 w-3" /> AI-Powered Mock Interviews
      </Badge>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto">
        Train hard. <span className="text-primary">Interview smarter.</span>{" "}
        Land the job.
      </h1>
      <p className="text-muted-foreground text-lg max-w-xl mx-auto">
        InterviewDojo puts you through real interview conditions and delivers
        instant AI feedback — so you show up confident on the day that matters.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" asChild>
          <Link href="/register">
            Start practicing free <MoveRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="#how">See how it works</Link>
        </Button>
      </div>
    </section>
  );
}
