import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EvaluationReport from "@/components/interview/EvaluationReport";

vi.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
    PolarGrid: () => <div data-testid="polar-grid" />,
    PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
    Radar: () => <div data-testid="radar" />,
  };
});

vi.mock("react-markdown", () => ({
  default: ({ children }: any) => <div data-testid="markdown-content">{children}</div>,
}));

const mockPrint = vi.fn();
Object.defineProperty(window, "print", {
  writable: true,
  configurable: true,
  value: mockPrint,
});

describe("EvaluationReport", () => {
  const mockSetReport = vi.fn();
  const mockReportData = {
    avgScore: 8.5,
    theory: 9.0,
    coding: 8.0,
    softSkills: 8.5,
    radarData: [90, 80, 85, 90, 95],
    summary: "# Đánh giá tổng quan\nỨng viên có kỹ năng lập trình xuất sắc.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders detail report statistics correctly in Vietnamese", () => {
    render(<EvaluationReport report={mockReportData} setReport={mockSetReport} />);

    expect(screen.getByText("Báo Cáo Phỏng Vấn Chi Tiết")).toBeInTheDocument();
    expect(screen.getByText("Hệ thống đánh giá AI Dojo v2.0")).toBeInTheDocument();

    expect(screen.getAllByText("8.5").length).toBe(2);
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getAllByText("Kỹ năng mềm").length).toBe(2);
  });

  it("renders chart elements and skill progress bars", () => {
    render(<EvaluationReport report={mockReportData} setReport={mockSetReport} />);

    expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();

    expect(screen.getByText("Lý thuyết (Theory)")).toBeInTheDocument();
    expect(screen.getByText("Thực hành (Coding)")).toBeInTheDocument();
    expect(screen.getAllByText("Kỹ năng mềm").length).toBe(2);
    expect(screen.getByText("Tổng quan")).toBeInTheDocument();

    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getAllByText("85%").length).toBe(2);
  });

  it("renders markdown content with correct summary props", () => {
    render(<EvaluationReport report={mockReportData} setReport={mockSetReport} />);

    const markdownDiv = screen.getByTestId("markdown-content");
    expect(markdownDiv).toBeInTheDocument();
    expect(markdownDiv.textContent).toContain("Đánh giá tổng quan");
    expect(markdownDiv.textContent).toContain("Ứng viên có kỹ năng lập trình xuất sắc.");
  });

  it("calls setReport(null) when clicking close button", () => {
    render(<EvaluationReport report={mockReportData} setReport={mockSetReport} />);

    const closeBtn = screen.getByRole("button", { name: "×" });
    fireEvent.click(closeBtn);

    expect(mockSetReport).toHaveBeenCalledWith(null);
  });

  it("calls window.print() when clicking XUẤT PDF button", () => {
    render(<EvaluationReport report={mockReportData} setReport={mockSetReport} />);

    const printBtn = screen.getByRole("button", { name: "XUẤT PDF" });
    fireEvent.click(printBtn);

    expect(mockPrint).toHaveBeenCalled();
  });
});
