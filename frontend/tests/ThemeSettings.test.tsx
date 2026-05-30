import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeSettings } from "@/components/settings/ThemeSettings";

const mockSetTheme = vi.fn();
const mockTheme = {
  theme: "light",
  setTheme: mockSetTheme,
};

vi.mock("next-themes", () => ({
  useTheme: () => mockTheme,
}));

describe("ThemeSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme.theme = "light";
  });

  it("renders theme settings correctly with current Light theme", () => {
    render(<ThemeSettings />);

    expect(screen.getByText("Theme Preference")).toBeInTheDocument();
    expect(screen.getByText("Choose how InterviewDojo looks to you.")).toBeInTheDocument();
    
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("calls setTheme when a theme card is clicked", () => {
    render(<ThemeSettings />);

    const darkBtn = screen.getByRole("button", { name: /Dark/ });
    fireEvent.click(darkBtn);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");

    const systemBtn = screen.getByRole("button", { name: /System/ });
    fireEvent.click(systemBtn);

    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("displays checkmark indicator on the active theme card", () => {
    mockTheme.theme = "dark";
    const { container } = render(<ThemeSettings />);

    const darkButton = screen.getByRole("button", { name: /Dark/ });
    const svgPath = container.querySelector("path[d='M5 13l4 4L19 7']");
    expect(svgPath).toBeInTheDocument();
    expect(darkButton).toHaveClass("border-primary/50");
  });
});
