import Link from "next/link";
import { Github, Twitter, Linkedin, Youtube } from "lucide-react";

const footerLinks = {
  "Interview Prep": [
    { label: "Behavioral Questions", href: "/practice/behavioral" },
    { label: "Technical Questions", href: "/practice/technical" },
    { label: "System Design", href: "/practice/system-design" },
    { label: "Mock Interviews", href: "/practice/mock" },
    { label: "Question Bank", href: "/questions" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Interview Tips", href: "/blog/tips" },
    { label: "Resume Guide", href: "/blog/resume" },
    { label: "Salary Negotiation", href: "/blog/salary" },
    { label: "Success Stories", href: "/stories" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Contact", href: "/contact" },
    { label: "Affiliates", href: "/affiliates" },
  ],
};

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Accessibility", href: "/accessibility" },
];

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Github, href: "#", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl glow-gradient text-sm font-black text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
                ID
              </span>
              <span className="text-lg font-bold tracking-tight">
                Interview<span className="glow-gradient-text">Dojo</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              AI-powered mock interviews to help you practice, improve, and land
              your dream job with confidence.
            </p>

            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-4">{category}</h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/50">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} InterviewDojo. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {legalLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="hover:text-primary transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
