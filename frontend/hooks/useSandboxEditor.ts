import { useState } from 'react';

const defaultSnippets: Record<string, string> = {
  javascript: `// Viết code Javascript của bạn tại đây...
console.log("Chào mừng bạn đến với buổi phỏng vấn!");

function checkLogic() {
  return "Ready";
}

console.log(checkLogic());`,

  typescript: `// Viết code TypeScript của bạn tại đây...
const candidateName: string = "Candidate";
const welcomeMsg: string = \`Chào mừng \${candidateName} đến với buổi phỏng vấn!\`;

function checkLogic(input: string): string {
  return \`Status: \${input}\`;
}

console.log(welcomeMsg);
console.log(checkLogic("Ready"));`,

  python: `# Viết code Python của bạn tại đây...
print("Chào mừng bạn đến với buổi phỏng vấn!")

def check_logic():
    return "Ready"

print(check_logic())`,

  cpp: `// Viết code C++ của bạn tại đây...
#include <iostream>
using namespace std;

string checkLogic() {
    return "Ready";
}

int main() {
    cout << "Chào mừng bạn đến với buổi phỏng vấn!" << endl;
    cout << checkLogic() << endl;
    return 0;
}`,

  java: `// Viết code Java của bạn tại đây...
public class Main {
    public static String checkLogic() {
        return "Ready";
    }

    public static void main(String[] args) {
        System.out.println("Chào mừng bạn đến với buổi phỏng vấn!");
        System.out.println(checkLogic());
    }
}`
};

export function useSandboxEditor() {
  const [language, setLanguage] = useState<string>('javascript');
  const [codeSnippet, setCodeSnippet] = useState<string>(defaultSnippets.javascript);
  const [codeOutput, setCodeOutput] = useState<string>('');
  const [isRunningCode, setIsRunningCode] = useState(false);

  const BACKEND_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/interviews`;

  const hasUserWrittenCode =
    codeSnippet.trim() !== '' &&
    codeSnippet.trim() !== (defaultSnippets[language] || '').trim();

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCodeSnippet(defaultSnippets[newLang] || '// Viết code...');
    setCodeOutput('');
  };

  const handleRunCode = async () => {
    setIsRunningCode(true);
    setCodeOutput("> Đang thực thi mã nguồn...\n");
    try {
      const res = await fetch(`${BACKEND_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeSnippet, language }),
      });
      const data = await res.json();
      if (data.error) {
        setCodeOutput(`❌ Lỗi thực thi:\n${data.error}`);
      } else {
        setCodeOutput(data.output || "> Code chạy thành công (không có output).");
      }
    } catch (err) {
      setCodeOutput("❌ Lỗi kết nối đến máy chủ thực thi code.");
    }
    setIsRunningCode(false);
  };

  return {
    codeSnippet,
    setCodeSnippet,
    codeOutput,
    setCodeOutput,
    isRunningCode,
    handleRunCode,
    language,
    handleLanguageChange,
    hasUserWrittenCode
  };
}