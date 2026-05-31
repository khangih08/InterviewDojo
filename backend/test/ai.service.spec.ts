/// <reference types="jest" />

const mockExec = jest.fn();
jest.mock('child_process', () => {
  return {
    exec: mockExec,
  };
});

const mockInvokeModel = jest.fn();
jest.mock('@langchain/openai', () => {
  return {
    ChatOpenAI: jest.fn().mockImplementation(() => {
      return {
        invoke: mockInvokeModel,
      };
    }),
  };
});

const mockTranscribeCreate = jest.fn();
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        audio: {
          transcriptions: {
            create: mockTranscribeCreate,
          },
        },
      };
    }),
    toFile: jest.fn().mockResolvedValue('mocked-file'),
  };
});

const mockGraphInvoke = jest.fn();
jest.mock('../src/ai/workflows/interview.graph', () => {
  return {
    InterviewGraph: jest.fn().mockImplementation(() => {
      return {
        graph: {
          invoke: mockGraphInvoke,
        },
      };
    }),
  };
});

const mockEvaluatorInvoke = jest.fn();
jest.mock('../src/ai/agents/evaluator.agent', () => {
  return {
    EvaluatorAgent: jest.fn().mockImplementation(() => {
      return {
        invoke: mockEvaluatorInvoke,
      };
    }),
  };
});

import { AiService } from '../src/ai/ai.service';

describe('AiService', () => {
  const mockRagService = {
    search: jest.fn(),
    indexCv: jest.fn(),
  };

  let service: AiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AiService(mockRagService as any);
  });

  describe('executeCode', () => {
    it('should execute valid JS code successfully', async () => {
      const code = `console.log("hello"); console.log("world");`;
      const result = await service.executeCode(code, 'javascript');
      expect(result).toEqual({
        output: 'hello\nworld\n',
      });
    });

    it('should return error message when code throws an error', async () => {
      const code = `nonExistentFunction();`;
      const result = await service.executeCode(code, 'javascript');
      expect(result.error).toBeDefined();
      expect(result.output).toBe('');
    });

    it('should prevent sandboxed code from accessing global process', async () => {
      const code = `console.log(process.env);`;
      const result = await service.executeCode(code, 'javascript');
      expect(result.error).toBeDefined(); // process is not defined in sandbox
    });

    it('should transpile and execute TS code successfully', async () => {
      const code = `const x: number = 42; console.log(x);`;
      const result = await service.executeCode(code, 'typescript');
      expect(result).toEqual({
        output: '42\n',
      });
    });

    it('should execute Python code successfully through child_process', async () => {
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(null, 'hello python\n', '');
      });
      const code = `print("hello python")`;
      const result = await service.executeCode(code, 'python');
      expect(result).toEqual({
        output: 'hello python\n',
      });
      expect(mockExec).toHaveBeenCalled();
    });

    it('should return simulation output for C++ and Java', async () => {
      const codeCpp = `int x = 10;`;
      const resultCpp = await service.executeCode(codeCpp, 'cpp');
      expect(resultCpp.output).toContain('Đang biên dịch mã nguồn CPP');

      const codeJava = `public class Main {}`;
      const resultJava = await service.executeCode(codeJava, 'java');
      expect(resultJava.output).toContain('Đang biên dịch mã nguồn JAVA');
    });

    it('should return error for unsupported language', async () => {
      const result = await service.executeCode('print("hi")', 'ruby');
      expect(result.error).toContain('Chưa hỗ trợ ngôn ngữ lập trình: ruby');
    });

    it('should execute console.warn and console.error and return formatted log in JS VM', async () => {
      const code = `console.warn("warning!"); console.error("error!");`;
      const result = await service.executeCode(code, 'javascript');
      expect(result.output).toContain('⚠️ Warn: warning!');
      expect(result.output).toContain('❌ Error: error!');
    });

    it('should return no-output message when execution produces no logs', async () => {
      const code = `const a = 1 + 2;`;
      const result = await service.executeCode(code, 'javascript');
      expect(result.output).toContain('> Code executed successfully (no output).');
    });

    it('should return compilation error when ts transpile fails', async () => {
      jest.doMock('typescript', () => {
        return {
          transpileModule: () => {
            throw new Error('Transpile error');
          },
          ModuleKind: { CommonJS: 1 }
        };
      });
      
      const code = `const a = 1;`;
      const result = await service.executeCode(code, 'typescript');
      expect(result.error).toContain('❌ Lỗi biên dịch TypeScript');
      
      jest.dontMock('typescript');
    });

    it('should return custom message if python executable is not found', async () => {
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(new Error('python is not recognized as an internal or external command'), '', '');
      });
      const code = `print("hi")`;
      const result = await service.executeCode(code, 'python');
      expect(result.output).toContain('Trình thông dịch Python chưa được cài đặt');
      expect(result.error).toBeUndefined();
    });

    it('should return timeout error if python execution is killed', async () => {
      const err = new Error('Killed') as any;
      err.killed = true;
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(err, '', '');
      });
      const code = `import time; time.sleep(10)`;
      const result = await service.executeCode(code, 'python');
      expect(result.error).toContain('Thực thi mã nguồn quá thời gian cho phép');
    });

    it('should return execution stderr on python script failure', async () => {
      mockExec.mockImplementation((cmd, opts, callback) => {
        callback(new Error('script failed'), '', 'SyntaxError: invalid syntax');
      });
      const code = `print "hi"`;
      const result = await service.executeCode(code, 'python');
      expect(result.error).toContain('SyntaxError: invalid syntax');
    });
  });

  describe('transcribeAudio', () => {
    it('should return transcribed text on success', async () => {
      mockTranscribeCreate.mockResolvedValue({ text: 'Đây là đoạn âm thanh' });
      const buffer = Buffer.from('dummy-audio');
      
      const result = await service.transcribeAudio(buffer, 'test.webm');
      
      expect(result).toBe('Đây là đoạn âm thanh');
      expect(mockTranscribeCreate).toHaveBeenCalledWith({
        file: 'mocked-file',
        model: 'whisper-large-v3',
        language: 'vi',
      });
    });

    it('should throw an error when Whisper API fails', async () => {
      mockTranscribeCreate.mockRejectedValue(new Error('API error'));
      const buffer = Buffer.from('dummy-audio');

      await expect(service.transcribeAudio(buffer, 'test.webm')).rejects.toThrow(
        'Không thể nhận diện giọng nói từ Audio.',
      );
    });
  });

  describe('analyzeCvProfile', () => {
    it('should parse valid JSON response from LLM', async () => {
      mockInvokeModel.mockResolvedValue({
        content: JSON.stringify({
          job_title: 'Senior Node.js Developer',
          experience_level: 'Senior',
        }),
      });

      const result = await service.analyzeCvProfile('CV Content details here');

      expect(result).toEqual({
        job_title: 'Senior Node.js Developer',
        experience_level: 'Senior',
      });
      expect(mockInvokeModel).toHaveBeenCalled();
    });

    it('should extract JSON if it is wrapped in other text', async () => {
      mockInvokeModel.mockResolvedValue({
        content: `Sure, here is the result:
        {
          "job_title": "React Developer",
          "experience_level": "Junior"
        }
        Hope this helps!`,
      });

      const result = await service.analyzeCvProfile('CV Content');

      expect(result).toEqual({
        job_title: 'React Developer',
        experience_level: 'Junior',
      });
    });

    it('should return fallback object if JSON parsing fails', async () => {
      mockInvokeModel.mockResolvedValue({
        content: 'invalid-json',
      });

      const result = await service.analyzeCvProfile('CV Content');

      expect(result).toEqual({
        job_title: 'Chưa xác định',
        experience_level: 'Chưa xác định',
      });
    });
  });

  describe('processInterviewTurnStream', () => {
    it('should stream chunks and return final output state', async () => {
      mockRagService.search.mockResolvedValue([
        { pageContent: 'Relevant CV text chunk' },
      ]);
      const finalStateOutput = {
        reply_to_user: 'Xin chào bạn nhé',
        reasoning: 'Gợi ý lý thuyết',
        score: 80,
        next_action: 'CONTINUE_THEORY',
      };
      mockGraphInvoke.mockResolvedValue({
        finalAgentOutput: finalStateOutput,
      });

      const stream = service.processInterviewTurnStream(
        'u-1',
        'i-1',
        'Tôi muốn ứng tuyển',
        { target_role: 'Frontend', experience_level: 'Senior' },
        [],
        'THEORY',
      );

      const yieldedValues: string[] = [];
      let finalReturn = null;
      while (true) {
        const next = await stream.next();
        if (next.done) {
          finalReturn = next.value;
          break;
        }
        yieldedValues.push(next.value);
      }

      expect(yieldedValues.join('')).toBe('Xin chào bạn nhé');
      expect(finalReturn).toEqual(finalStateOutput);
      expect(mockRagService.search).toHaveBeenCalledWith(
        'Tôi muốn ứng tuyển',
        'interviews',
        { userId: 'u-1', interviewId: 'i-1' },
      );
    });

    it('should return yield friendly error message if graph execution throws', async () => {
      mockRagService.search.mockResolvedValue([]);
      mockGraphInvoke.mockRejectedValue(new Error('Graph failed'));

      const stream = service.processInterviewTurnStream(
        'u-1',
        'i-1',
        'Tôi muốn ứng tuyển',
        { target_role: 'Frontend', experience_level: 'Senior' },
        [],
        'THEORY',
      );

      const yieldedValues: string[] = [];
      let finalReturn = null;
      while (true) {
        const next = await stream.next();
        if (next.done) {
          finalReturn = next.value;
          break;
        }
        yieldedValues.push(next.value);
      }

      expect(yieldedValues.join('')).toContain('Hệ thống gặp gián đoạn nhỏ');
      expect(finalReturn).toBeNull();
    });

    it('should format history User/Assistant roles and handle EVALUATION tab without userMessage', async () => {
      mockRagService.search.mockResolvedValue([]);
      mockGraphInvoke.mockResolvedValue({
        finalAgentOutput: {
          reply_to_user: 'Báo cáo cuối cùng',
          reasoning: 'Evaluation complete',
          score: 85,
          next_action: 'END_INTERVIEW',
        },
      });

      const history = [
        { role: 'user', content: 'Tôi đã trả lời' },
        { role: 'assistant', content: 'Tuyệt vời' },
      ];

      const stream = service.processInterviewTurnStream(
        'u-1',
        'i-1',
        '', // empty user message
        { target_role: 'Frontend', experience_level: 'Senior' },
        history,
        'EVALUATION',
      );

      const yieldedValues: string[] = [];
      let finalReturn: any = null;
      while (true) {
        const next = await stream.next();
        if (next.done) {
          finalReturn = next.value;
          break;
        }
        yieldedValues.push(next.value);
      }

      expect(yieldedValues.join('')).toBe('Báo cáo cuối cùng');
      expect(finalReturn?.score).toBe(85);
    });
  });

  describe('generateFinalReport', () => {
    it('should invoke evaluator and return report text', async () => {
      mockEvaluatorInvoke.mockResolvedValue({
        reply_to_user: 'Báo cáo phỏng vấn hoàn chỉnh...',
      });

      const chatHistory = [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi' },
      ];

      const result = await service.generateFinalReport(
        'Backend Developer',
        chatHistory,
        75,
      );

      expect(result).toBe('Báo cáo phỏng vấn hoàn chỉnh...');
      expect(mockEvaluatorInvoke).toHaveBeenCalled();
    });
  });
});
