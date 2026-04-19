import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CodeEditorPanel from "@/components/interview/CodeEditorPanel";

describe("CodeEditorPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();

    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      configurable: true,
    });

    Object.defineProperty(URL, "createObjectURL", {
      value: vi.fn(() => "blob:mock"),
      configurable: true,
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: vi.fn(() => {}),
      configurable: true,
      writable: true,
    });
  });

  it("renders default starter code with question content", async () => {
    render(
      <CodeEditorPanel questionId="q-101" questionContent="Solve two sum" />,
    );

    const textarea = await screen.findByPlaceholderText(
      "Write your solution here...",
    );

    await waitFor(() => {
      const value = (textarea as HTMLTextAreaElement).value;
      expect(value).toContain("Solve two sum");
      expect(value).toContain("function solve");
    });
  });

  it("loads previously saved editor state from localStorage", async () => {
    window.localStorage.setItem(
      "idc_code_editor_q-9",
      JSON.stringify({
        language: "python",
        code: "print('hello from cache')",
      }),
    );

    render(<CodeEditorPanel questionId="q-9" />);

    const languageSelect = await screen.findByLabelText("Programming language");
    const textarea = await screen.findByPlaceholderText(
      "Write your solution here...",
    );

    await waitFor(() => {
      expect(languageSelect).toHaveValue("python");
      expect((textarea as HTMLTextAreaElement).value).toBe(
        "print('hello from cache')",
      );
    });
  });

  it("switches language and replaces template when user confirms", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <CodeEditorPanel questionId="q-1" questionContent="Tree traversal" />,
    );

    const languageSelect = await screen.findByLabelText("Programming language");
    const textarea = await screen.findByPlaceholderText(
      "Write your solution here...",
    );

    await userEvent.selectOptions(languageSelect, "python");

    await waitFor(() => {
      expect(languageSelect).toHaveValue("python");
      expect((textarea as HTMLTextAreaElement).value).toContain("def solve");
    });
  });

  it("does not switch language when user cancels confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<CodeEditorPanel questionId="q-2" />);

    const languageSelect = await screen.findByLabelText("Programming language");
    const textarea = await screen.findByPlaceholderText(
      "Write your solution here...",
    );

    await userEvent.selectOptions(languageSelect, "java");

    await waitFor(() => {
      expect(languageSelect).toHaveValue("javascript");
      expect((textarea as HTMLTextAreaElement).value).toContain(
        "function solve",
      );
    });
  });

  it("resets code to default template when user confirms", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<CodeEditorPanel questionId="q-33" questionContent="Palindrome" />);

    const textarea = (await screen.findByPlaceholderText(
      "Write your solution here...",
    )) as HTMLTextAreaElement;
    const resetButton = await screen.findByRole("button", { name: "Reset" });

    await userEvent.clear(textarea);
    await userEvent.type(textarea, "custom code");
    expect(textarea.value).toBe("custom code");

    await userEvent.click(resetButton);

    await waitFor(() => {
      expect(textarea.value).toContain("Problem: Palindrome");
      expect(textarea.value).toContain("function solve");
    });
  });

  it("does not reset code when user cancels reset confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<CodeEditorPanel questionId="q-34" questionContent="Palindrome" />);

    const textarea = (await screen.findByPlaceholderText(
      "Write your solution here...",
    )) as HTMLTextAreaElement;
    const resetButton = await screen.findByRole("button", { name: "Reset" });

    await userEvent.clear(textarea);
    await userEvent.type(textarea, "keep this code");
    expect(textarea.value).toBe("keep this code");

    await userEvent.click(resetButton);

    await waitFor(() => {
      expect(textarea.value).toBe("keep this code");
    });
  });

  it("copies current code to clipboard", async () => {
    render(<CodeEditorPanel questionId="q-44" />);

    const copyButton = await screen.findByRole("button", { name: "Copy" });

    await userEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
      expect(
        screen.getByRole("button", { name: "Copied" }),
      ).toBeInTheDocument();
    });
  });

  it("downloads code with correct extension for each language", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const clickMock = vi.fn();
    const createdAnchors: Array<{
      click: () => void;
      href: string;
      download: string;
    }> = [];
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string) => {
        if (tagName === "a") {
          const anchor = {
            click: clickMock,
            href: "",
            download: "",
          };
          createdAnchors.push(anchor);
          return anchor as HTMLAnchorElement;
        }
        return originalCreateElement(tagName);
      });

    render(<CodeEditorPanel questionId="q-55" />);

    const languageSelect = await screen.findByLabelText("Programming language");
    const downloadButton = await screen.findByRole("button", {
      name: "Download",
    });

    const cases = [
      { language: "javascript", expected: "solution.js" },
      { language: "typescript", expected: "solution.ts" },
      { language: "python", expected: "solution.py" },
      { language: "java", expected: "solution.java" },
      { language: "cpp", expected: "solution.cpp" },
      { language: "go", expected: "solution.go" },
    ] as const;

    for (const testCase of cases) {
      await userEvent.selectOptions(languageSelect, testCase.language);
      await userEvent.click(downloadButton);
    }

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalledTimes(cases.length);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
      expect(clickMock).toHaveBeenCalledTimes(cases.length);
      expect(createdAnchors.map((anchor) => anchor.download)).toEqual(
        cases.map((testCase) => testCase.expected),
      );
    });

    createElementSpy.mockRestore();
  });
});
