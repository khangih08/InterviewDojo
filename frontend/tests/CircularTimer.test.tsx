import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CircularTimer from "@/components/interview/CircularTimer";

describe("CircularTimer", () => {
  it("formats the countdown as mm:ss", () => {
    render(<CircularTimer secondsLeft={65} total={120} />);

    expect(screen.getByText("01:05")).toBeInTheDocument();
  });

  it("uses the primary color when more than half the time remains", () => {
    const { container } = render(<CircularTimer secondsLeft={90} total={120} />);
    const circles = container.querySelectorAll("circle");

    expect(circles[1]).toHaveAttribute("stroke", "#6366f1");
    expect(circles[1]).toHaveAttribute(
      "stroke-dasharray",
      expect.stringMatching(/254\.4/),
    );
  });

  it("switches to warning and danger colors as time runs down", () => {
    const { container, rerender } = render(
      <CircularTimer secondsLeft={24} total={120} />,
    );

    expect(container.querySelectorAll("circle")[1]).toHaveAttribute(
      "stroke",
      "#ef4444",
    );

    rerender(<CircularTimer secondsLeft={36} total={120} />);

    expect(container.querySelectorAll("circle")[1]).toHaveAttribute(
      "stroke",
      "#f59e0b",
    );
  });

  it("clamps negative and overflow values for the progress ring", () => {
    const { container, rerender } = render(
      <CircularTimer secondsLeft={-15} total={120} />,
    );

    expect(container.querySelectorAll("circle")[1]).toHaveAttribute(
      "stroke-dasharray",
      expect.stringMatching(/^0 /),
    );

    rerender(<CircularTimer secondsLeft={180} total={120} />);

    expect(container.querySelectorAll("circle")[1]).toHaveAttribute(
      "stroke-dasharray",
      expect.stringMatching(/^339\.29/),
    );
  });
});
