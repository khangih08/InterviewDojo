export const features = [
  {
    title: "AI-Powered Feedback",
    description:
      "Get instant, detailed feedback on every answer — just like a real interviewer would give.",
  },
  {
    title: "Coding Challenges",
    description:
      "Practice DSA, system design, and language-specific questions in an in-browser IDE.",
  },
  {
    title: "Behavioral Questions",
    description:
      "Master STAR-method answers with curated questions from top-tier companies.",
  },
  {
    title: "Progress Tracking",
    description:
      "Visual dashboards show your skill growth, weak spots, and session streaks.",
  },
  {
    title: "Timed Mock Sessions",
    description:
      "Simulate real pressure with timed, full-length interview sessions.",
  },
  {
    title: "Multi-track Paths",
    description:
      "Choose your track: Frontend, Backend, Data Science, PM, or General SWE.",
  },
];

export const steps = [
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

export const testimonials = [
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

export type Plan = {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  highlight: boolean;
};

export const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    highlight: false,
    cta: "Get started free",
    features: [
      "5 sessions / month",
      "Basic AI feedback",
      "3 question tracks",
      "Community access",
    ],
  },
  {
    name: "Pro",
    price: "$12",
    period: "/ month",
    highlight: true,
    cta: "Start 7-day trial",
    features: [
      "Unlimited sessions",
      "Advanced AI scoring",
      "All tracks + custom",
      "Progress dashboard",
      "Priority support",
    ],
  },
  {
    name: "Teams",
    price: "$39",
    period: "/ month",
    highlight: false,
    cta: "Contact sales",
    features: [
      "Everything in Pro",
      "Up to 10 seats",
      "Team leaderboard",
      "Manager analytics",
      "Dedicated onboarding",
    ],
  },
];

export type CellValue = string | boolean;

export type ComparisonRow = {
  feature: string;
  dojo: CellValue;
  others: CellValue;
};

export const comparisonRows: ComparisonRow[] = [
  { feature: "AI scoring on every answer", dojo: true, others: "Partial" },
  { feature: "In-browser coding IDE", dojo: true, others: false },
  { feature: "System design practice", dojo: true, others: false },
  {
    feature: "Role-specific question tracks",
    dojo: "6 tracks",
    others: "Generic only",
  },
  { feature: "Timed full-length mock sessions", dojo: true, others: false },
  { feature: "Streak & progress dashboard", dojo: true, others: "Limited" },
  { feature: "Free plan available", dojo: true, others: "Trial only" },
  { feature: "Behavioural + Technical in one app", dojo: true, others: false },
];

export type FaqItem = {
  q: string;
  a: string;
};

export const faqs: FaqItem[] = [
  {
    q: "What makes InterviewDojo different from other interview prep platforms?",
    a: "InterviewDojo is the only platform that combines live coding challenges, system design, and behavioural prep under one roof — all scored by AI in real time. Most platforms focus on one area; we cover the full interview loop.",
  },
  {
    q: "Do I need coding experience to use InterviewDojo?",
    a: "Not at all. We have tracks for non-technical roles (PM, design, general SWE) as well as beginner-friendly coding paths. You choose your level and the platform adapts accordingly.",
  },
  {
    q: "How does the AI feedback work?",
    a: "After each answer, our AI analyses your response for clarity, structure (STAR method for behavioural), correctness (for coding), use of filler words, and pacing — then gives you a score and actionable tips to improve.",
  },
  {
    q: "Can I practise for a specific company like Google or Meta?",
    a: "Yes. Each track includes curated question sets tagged by company and difficulty. You can filter by FAANG, unicorn startups, or by role to get the most relevant practice questions.",
  },
  {
    q: "Is there a free plan? What's included?",
    a: "The free plan gives you 5 full sessions per month, basic AI feedback, and access to 3 question tracks — more than enough to evaluate whether InterviewDojo is right for you before upgrading.",
  },
  {
    q: "How is InterviewDojo priced for teams or bootcamps?",
    a: "Our Teams plan starts at $39/month for up to 10 seats and includes a leaderboard, manager analytics, and dedicated onboarding. Larger cohorts can contact us for custom enterprise pricing.",
  },
  {
    q: "Can I cancel my subscription at any time?",
    a: "Absolutely. There are no lock-in contracts. You can cancel from your account settings at any time and retain access until the end of your billing period.",
  },
];
