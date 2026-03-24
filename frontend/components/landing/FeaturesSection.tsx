import {
  BrainCircuit,
  ChartBar,
  Clock,
  Code2,
  Layers,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { features } from "@/lib/landing";

const icons: Record<string, React.ReactNode> = {
  "AI-Powered Feedback": <BrainCircuit className="h-6 w-6 text-primary" />,
  "Coding Challenges": <Code2 className="h-6 w-6 text-primary" />,
  "Behavioral Questions": <MessageSquare className="h-6 w-6 text-primary" />,
  "Progress Tracking": <ChartBar className="h-6 w-6 text-primary" />,
  "Timed Mock Sessions": <Clock className="h-6 w-6 text-primary" />,
  "Multi-track Paths": <Layers className="h-6 w-6 text-primary" />,
};

export default function FeaturesSection() {
  return (
    <section id="features" className="container mx-auto px-4 py-20 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="outline">Features</Badge>
        <h2 className="text-3xl font-bold tracking-tight">
          Everything you need to ace it
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          From coding rounds to culture-fit questions, we've got every stage of
          the interview covered.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <Card key={f.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="mb-2">{icons[f.title]}</div>
              <CardTitle className="text-base">{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
