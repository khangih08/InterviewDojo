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
    <footer className="border-t bg-background">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-black shadow-lg shadow-violet-900/30 text-white">
                ID
              </span>
              <span className="text-lg font-bold tracking-tight">
                InterviewDojo
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              AI-powered mock interviews to help you practice, improve, and land
              your dream job with confidence.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
      <div className="border-t">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} InterviewDojo. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {legalLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="hover:text-foreground transition-colors"
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
