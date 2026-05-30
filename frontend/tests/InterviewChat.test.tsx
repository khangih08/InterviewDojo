import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import InterviewChat from "@/components/interview/InterviewChat";

vi.mock("react-markdown", () => ({
  default: ({ children }: any) => <div data-testid="markdown">{children}</div>,
}));

describe("InterviewChat", () => {
  const mockMessages = [
    { role: "assistant", content: "Xin chào bạn!" },
    { role: "user", content: "Chào AI Dojo." },
  ];
  const mockSetInput = vi.fn();
  const mockOnSendMessage = vi.fn((e) => e.preventDefault());
  const mockOnToggleRecording = vi.fn();
  const mockFetchReport = vi.fn();
  const mockHandleReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when activeTab is THEORY or CODING", () => {
    it("renders message log correctly", () => {
      render(
        <InterviewChat
          activeTab="THEORY"
          messages={mockMessages}
          input=""
          setInput={mockSetInput}
          isLoading={false}
          isRecording={false}
          onSendMessage={mockOnSendMessage}
          onToggleRecording={mockOnToggleRecording}
          fetchReport={mockFetchReport}
          handleReset={mockHandleReset}
        />
      );

      const markdownDivs = screen.getAllByTestId("markdown");
      expect(markdownDivs.length).toBe(2);
      expect(markdownDivs[0].textContent).toBe("Xin chào bạn!");
      expect(markdownDivs[1].textContent).toBe("Chào AI Dojo.");
    });

    it("renders input field and action buttons", () => {
      render(
        <InterviewChat
          activeTab="THEORY"
          messages={mockMessages}
          input="Câu trả lời của tôi"
          setInput={mockSetInput}
          isLoading={false}
          isRecording={false}
          onSendMessage={mockOnSendMessage}
          onToggleRecording={mockOnToggleRecording}
          fetchReport={mockFetchReport}
          handleReset={mockHandleReset}
        />
      );

      const inputEl = screen.getByPlaceholderText("Nhập câu trả lời...");
      expect(inputEl).toBeInTheDocument();
      expect(inputEl).toHaveValue("Câu trả lời của tôi");

      fireEvent.change(inputEl, { target: { value: "Thay đổi mới" } });
      expect(mockSetInput).toHaveBeenCalledWith("Thay đổi mới");
    });

    it("submits message on form submission", () => {
      render(
        <InterviewChat
          activeTab="THEORY"
          messages={mockMessages}
          input="Câu trả lời"
          setInput={mockSetInput}
          isLoading={false}
          isRecording={false}
          onSendMessage={mockOnSendMessage}
          onToggleRecording={mockOnToggleRecording}
          fetchReport={mockFetchReport}
          handleReset={mockHandleReset}
        />
      );

      const formEl = screen.getByPlaceholderText("Nhập câu trả lời...").closest("form");
      expect(formEl).toBeInTheDocument();
      
      fireEvent.submit(formEl!);
      expect(mockOnSendMessage).toHaveBeenCalled();
    });

    it("calls onToggleRecording when recording button is clicked", () => {
      render(
        <InterviewChat
          activeTab="THEORY"
          messages={mockMessages}
          input=""
          setInput={mockSetInput}
          isLoading={false}
          isRecording={false}
          onSendMessage={mockOnSendMessage}
          onToggleRecording={mockOnToggleRecording}
          fetchReport={mockFetchReport}
          handleReset={mockHandleReset}
        />
      );

      const microBtn = screen.getAllByRole("button")[0];
      fireEvent.click(microBtn);

      expect(mockOnToggleRecording).toHaveBeenCalled();
    });

    it("disables input and shows animate-pulse when isRecording is true", () => {
      render(
        <InterviewChat
          activeTab="THEORY"
          messages={mockMessages}
          input=""
          setInput={mockSetInput}
          isLoading={false}
          isRecording={true}
          onSendMessage={mockOnSendMessage}
          onToggleRecording={mockOnToggleRecording}
          fetchReport={mockFetchReport}
          handleReset={mockHandleReset}
        />
      );

      const inputEl = screen.getByPlaceholderText("Nhập câu trả lời...");
      expect(inputEl).toBeDisabled();

      const microBtn = screen.getAllByRole("button")[0];
      expect(microBtn).toHaveClass("bg-red-500");
      expect(microBtn).toHaveClass("animate-pulse");
    });
  });

  describe("when activeTab is EVALUATION", () => {
    it("renders assessment buttons and hides normal chat input", () => {
      render(
        <InterviewChat
          activeTab="EVALUATION"
          messages={mockMessages}
          input=""
          setInput={mockSetInput}
          isLoading={false}
          isRecording={false}
          onSendMessage={mockOnSendMessage}
          onToggleRecording={mockOnToggleRecording}
          fetchReport={mockFetchReport}
          handleReset={mockHandleReset}
        />
      );

      expect(screen.queryByPlaceholderText("Nhập câu trả lời...")).not.toBeInTheDocument();

      const reportBtn = screen.getByRole("button", { name: "XEM BÁO CÁO" });
      const resetBtn = screen.getByRole("button", { name: "PHỎNG VẤN MỚI" });

      expect(reportBtn).toBeInTheDocument();
      expect(resetBtn).toBeInTheDocument();

      fireEvent.click(reportBtn);
      expect(mockFetchReport).toHaveBeenCalled();

      fireEvent.click(resetBtn);
      expect(mockHandleReset).toHaveBeenCalled();
    });
  });
});
