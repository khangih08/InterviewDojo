import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
};

function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const renderAction = (item: EmptyStateAction, variant: "default" | "secondary") =>
    item.href ? (
      <Button asChild variant={variant}>
        <Link href={item.href}>{item.label}</Link>
      </Button>
    ) : (
      <Button variant={variant} onClick={item.onClick}>
        {item.label}
      </Button>
    );

  return (
    <Card className={cn("border-dashed border-border/70 bg-card/70", className)}>
      <div className="flex flex-col items-center justify-center px-6 py-14 text-center sm:px-10">
        {icon ? (
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/60 text-primary shadow-sm">
            {icon}
          </div>
        ) : null}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {action || secondaryAction ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {secondaryAction ? renderAction(secondaryAction, "secondary") : null}
            {action ? renderAction(action, "default") : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export { EmptyState };