import { useState } from 'react';

export function useSandboxEditor() {
  const [codeSnippet, setCodeSnippet] = useState<string>('// Viết code Javascript của bạn tại đây...\nconsole.log("Chào mừng bạn đến với buổi phỏng vấn!");\n\nfunction checkLogic() {\n  return "Ready";\n}\n\nconsole.log(checkLogic());');
  const [codeOutput, setCodeOutput] = useState<string>('');
  const [isRunningCode, setIsRunningCode] = useState(false);

  // ĐÃ FIX LỖI API CHỖ NÀY: Dùng biến môi trường
const BACKEND_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/interviews`;
  const handleRunCode = async () => {
    setIsRunningCode(true);
    setCodeOutput("> Đang thực thi mã nguồn...\n");
    try {
      const res = await fetch(`${BACKEND_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeSnippet, language: 'javascript' }),
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

  return { codeSnippet, setCodeSnippet, codeOutput, setCodeOutput, isRunningCode, handleRunCode };
}