import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BrainCircuit,
  ChartBar,
  Clock,
  Code2,
  Github,
  Layers,
  MessageSquare,
  MoveRight,
  ShieldCheck,
  Swords,
  Twitter,
  UserCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

/* ─────────────────────────── DATA ─────────────────────────── */

const features = [
  {
    icon: <BrainCircuit className="h-6 w-6 text-primary" />,
    title: "AI-Powered Feedback",
    description:
      "Get instant, detailed feedback on every answer — just like a real interviewer would give.",
  },
  {
    icon: <Code2 className="h-6 w-6 text-primary" />,
    title: "Coding Challenges",
    description:
      "Practice DSA, system design, and language-specific questions in an in-browser IDE.",
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    title: "Behavioral Questions",
    description:
      "Master STAR-method answers with curated questions from top-tier companies.",
  },
  {
    icon: <ChartBar className="h-6 w-6 text-primary" />,
    title: "Progress Tracking",
    description:
      "Visual dashboards show your skill growth, weak spots, and session streaks.",
  },
  {
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "Timed Mock Sessions",
    description:
      "Simulate real pressure with timed, full-length interview sessions.",
  },
  {
    icon: <Layers className="h-6 w-6 text-primary" />,
    title: "Multi-track Paths",
    description:
      "Choose your track: Frontend, Backend, Data Science, PM, or General SWE.",
  },
];

const steps = [
  {
    step: "01",
    title: "Pick your track",
    description:
      "Select the role and difficulty level you want to prepare for.",
  },
  {
    step: "02",
    title: "Enter the Dojo",
    description:
      "Answer questions in a realistic, distraction-free interview environment.",
  },
  {
    step: "03",
    title: "Get scored by AI",
    description:
      "Receive a detailed breakdown of your answer with tips to improve.",
  },
  {
    step: "04",
    title: "Level up & repeat",
    description:
      "Track your progress and unlock harder challenges as you improve.",
  },
];

const testimonials = [
  {
    name: "Linh Nguyễn",
    role: "Software Engineer @ Google",
    avatar: "LN",
    quote:
      "InterviewDojo was the game-changer for me. After two weeks of daily practice, I aced every behavioral round.",
  },
  {
    name: "Minh Trần",
    role: "Frontend Dev @ Shopee",
    avatar: "MT",
    quote:
      "The AI feedback is scarily accurate. It caught filler words and vague answers I didn't even notice myself.",
  },
  {
    name: "An Phạm",
    role: "Backend Engineer @ VNG",
    avatar: "AP",
    quote:
      "System design questions with instant scoring? That alone is worth every cent of the subscription.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 sessions / month",
      "Basic AI feedback",
      "3 question tracks",
      "Community access",
    ],
    cta: "Get started free",
    highlight: false,
  },
  {
    name: "Freemium",
    price: "$12",
    period: "/ month",
    features: [
      "Unlimited sessions",
      "Advanced AI scoring",
      "All tracks + custom",
      "Progress dashboard",
      "Priority support",
    ],
    cta: "Start 7-day trial",
    highlight: true,
  },
  {
    name: "Teams",
    price: "$39",
    period: "/ month",
    features: [
      "Everything in Pro",
      "Up to 10 seats",
      "Team leaderboard",
      "Manager analytics",
      "Dedicated onboarding",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

/* ─────────────────────────── PAGE ─────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Swords className="h-6 w-6 text-primary" />
            InterviewDojo
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how"
              className="hover:text-foreground transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="container mx-auto px-4 py-24 text-center space-y-6">
          <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
            <Zap className="h-3 w-3" /> AI-Powered Mock Interviews
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto">
            Train hard. <span className="text-primary">Interview smarter.</span>{" "}
            Land the job.
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            InterviewDojo puts you through real interview conditions and
            delivers instant AI feedback — so you show up confident on the day
            that matters.
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

        <Separator />

        {/* ── Features ── */}
        <section
          id="features"
          className="container mx-auto px-4 py-20 space-y-12"
        >
          <div className="text-center space-y-3">
            <Badge variant="outline">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need to ace it
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              From coding rounds to culture-fit questions, we've got every stage
              of the interview covered.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="mb-2">{f.icon}</div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── How it works ── */}
        <section id="how" className="bg-muted/40 py-20">
          <div className="container mx-auto px-4 space-y-12">
            <div className="text-center space-y-3">
              <Badge variant="outline">How it works</Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Four steps to interview mastery
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((s) => (
                <div key={s.step} className="space-y-3">
                  <span className="text-5xl font-black text-primary/20 leading-none">
                    {s.step}
                  </span>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Testimonials ── */}
        <section className="container mx-auto px-4 py-20 space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline">Testimonials</Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              Loved by candidates worldwide
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="flex flex-col gap-4 p-6">
                <p className="text-sm text-muted-foreground flex-1">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── Pricing ── */}
        <section id="pricing" className="bg-muted/40 py-20">
          <div className="container mx-auto px-4 space-y-12">
            <div className="text-center space-y-3">
              <Badge variant="outline">Pricing</Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Simple, transparent pricing
              </h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Start free. Upgrade when you're ready to go all-in.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {plans.map((p) => (
                <Card
                  key={p.name}
                  className={`flex flex-col ${p.highlight ? "border-primary shadow-lg" : ""}`}
                >
                  {p.highlight && (
                    <div className="bg-primary text-primary-foreground text-xs font-semibold text-center py-1 rounded-t-xl">
                      Most popular
                    </div>
                  )}
                  <CardHeader>
                    <p className="text-sm font-medium text-muted-foreground">
                      {p.name}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold">{p.price}</span>
                      <span className="text-sm text-muted-foreground">
                        {p.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 gap-6">
                    <ul className="space-y-2 flex-1">
                      {p.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-2 text-sm"
                        >
                          <UserCheck className="h-4 w-4 text-primary shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={p.highlight ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/register">{p.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="container mx-auto px-4 py-20">
          <div className="rounded-2xl bg-primary text-primary-foreground p-10 text-center space-y-5">
            <ShieldCheck className="h-10 w-10 mx-auto opacity-80" />
            <h2 className="text-3xl font-bold">Ready to enter the Dojo?</h2>
            <p className="text-primary-foreground/80 max-w-md mx-auto">
              Join thousands of engineers leveling up their interview skills
              every day.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Start for free <MoveRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Swords className="h-4 w-4 text-primary" />
            InterviewDojo
          </div>
          <p>
            © {new Date().getFullYear()} InterviewDojo. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">
              <Twitter className="h-4 w-4" />
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              <Github className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
