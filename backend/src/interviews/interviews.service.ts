import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Interview } from '../entities/interview.entity';
import { Message } from '../entities/message.entity';
import { User, UserPlan } from '../entities/user.entity';
import { AiService } from '../ai/ai.service';
import { RagService } from '../rag/rag.service';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { EvaluatorAgent } from '../ai/agents/evaluator.agent';
import { MentorAgent } from '../ai/agents/mentor.agent';


@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(
    @InjectRepository(Interview) private readonly interviewRepo: Repository<Interview>,
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    public readonly aiService: AiService,
    private readonly ragService: RagService,
  ) {}

  // --- API MỚI: Xử lý yêu cầu nâng cấp ---
  async requestPro(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Đánh dấu user đang chờ duyệt
    user.is_pending_pro = true;
    await this.userRepo.save(user);

    // LOG ra console để bạn biết (Trong thực tế có thể gửi Telegram ở đây)
    this.logger.warn(`[PAYMENT] User ${user.full_name} (${user.email}) vừa gửi xác nhận thanh toán PRO. Nội dung: UPGRADE ${user.id.substring(0, 8).toUpperCase()}`);

    return { success: true, message: 'Yêu cầu của bạn đã được gửi tới quản trị viên.' };
  }

  private async checkAndDeductCredits(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    if (user.plan === UserPlan.FREE && user.credits <= 0) {
      throw new BadRequestException('Bạn đã hết lượt phỏng vấn miễn phí. Vui lòng nâng cấp gói PRO để tiếp tục!');
    }

    if (user.plan === UserPlan.FREE) {
      user.credits -= 1;
      await this.userRepo.save(user);
    }
  }

  async getAllInterviewsByUser(userId: string) {
    const validInterviewIdsQuery = await this.interviewRepo
      .createQueryBuilder('interview')
      .select('interview.id')
      .leftJoin('interview.messages', 'msg')
      .where('interview.user_id = :userId', { userId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('interview.status = :status', { status: 'COMPLETED' })
            .orWhere('msg.role = :role', { role: 'user' });
        }),
      )
      .groupBy('interview.id')
      .getMany();

    const ids = validInterviewIdsQuery.map(i => i.id);
    if (ids.length === 0) return [];

    return await this.interviewRepo
      .createQueryBuilder('interview')
      .where('interview.id IN (:...ids)', { ids })
      .orderBy('interview.created_at', 'DESC')
      .getMany();
  }

  async getNextActionPlan(userId: string, targetRole: string = 'Software Engineer') {
    const lastInterview = await this.interviewRepo.findOne({
      where: { user_id: userId, status: 'COMPLETED' },
      order: { created_at: 'DESC' },
    });

    const mentorAgent = new MentorAgent(this.aiService['model']);

    if (!lastInterview || !lastInterview.final_report) {
      return {
        motivational_message: "Hành trình ngàn dặm bắt đầu từ một bước chân. Hãy làm bài phỏng vấn đầu tiên!",
        focus_topics: ["Lý thuyết cơ bản", "Thực hành Code", "Kỹ năng mềm"],
        suggested_track: `${targetRole} Starter Track`,
        track_description: "Bài kiểm tra đánh giá năng lực tổng quan để AI lên lộ trình cho bạn."
      };
    }

    // SỬA: Lấy CV text từ lịch sử phỏng vấn. Nếu ứng viên thi chay không có CV, fallback về job_title
    const cvContext = lastInterview.cv_text || `Thông tin ứng viên: Ứng tuyển vị trí ${lastInterview.job_title || targetRole}`;

    const plan = await mentorAgent.invoke(
      cvContext, // Đã truyền cvContext thay cho targetRole
      lastInterview.final_report,
      lastInterview.average_score
    );

    return plan;
  }

  async startNewInterview(userId: string, jobTitle: string = 'Frontend Developer') {
    await this.checkAndDeductCredits(userId);

    const newInterview = this.interviewRepo.create({
      user_id: userId,
      status: 'IN_PROGRESS',
      current_phase: 'THEORY',
      job_title: jobTitle,
    });

    const savedInterview = await this.interviewRepo.save(newInterview);

    const greetingMsg = `Chào bạn! Mình đã sẵn sàng phỏng vấn bạn cho vị trí ${jobTitle}. Bất cứ khi nào bạn sẵn sàng, hãy gõ "Bắt đầu" nhé!`;
    await this.messageRepo.save({
      interview_id: savedInterview.id,
      role: 'assistant',
      content: greetingMsg,
      phase: 'THEORY'
    });

    return { id: savedInterview.id, jobTitle, greeting: greetingMsg };
  }

  async startWithCv(userId: string, fileBuffer: Buffer) {
    await this.checkAndDeductCredits(userId);

    const blob = new Blob([new Uint8Array(fileBuffer)], { type: 'application/pdf' });
    const loader = new PDFLoader(blob, { splitPages: false });
    const docs = await loader.load();

    const cvText = docs.map(doc => doc.pageContent).join('\n').replace(/\s+/g, ' ').trim();
    if (!cvText || cvText.length < 10) {
      throw new BadRequestException('Không thể đọc được nội dung từ file PDF này.');
    }

    const cvProfile = await this.aiService.analyzeCvProfile(cvText);

    const newInterview = this.interviewRepo.create({
      user_id: userId,
      status: 'IN_PROGRESS',
      current_phase: 'THEORY',
      job_title: cvProfile.job_title,
      experience_level: cvProfile.experience_level,
      cv_text: cvText
    });

    const savedInterview = await this.interviewRepo.save(newInterview);
    await this.ragService.indexCv(userId, savedInterview.id, cvText);

    const greetingMsg = `Chào bạn! Mình đã đọc CV của bạn và sẵn sàng phỏng vấn cho vị trí ${cvProfile.job_title}. Chúng quy ta bắt đầu nhé!`;
    await this.messageRepo.save({
      interview_id: savedInterview.id,
      role: 'assistant',
      content: greetingMsg,
      phase: 'THEORY'
    });

    return { id: savedInterview.id, jobTitle: cvProfile.job_title, greeting: greetingMsg };
  }

  async getInterviewState(interviewId: string, userId: string) {
    const interview = await this.interviewRepo.findOne({ where: { id: interviewId, user_id: userId } });
    if (!interview) throw new NotFoundException('Không tìm thấy phiên phỏng vấn này.');

    const history = await this.messageRepo.find({ where: { interview_id: interviewId }, order: { created_at: 'ASC' } });

    return {
      interviewId: interview.id,
      jobTitle: interview.job_title,
      currentPhase: interview.current_phase,
      status: interview.status,
      lastCode: interview.last_code,
      chatHistory: history.map(msg => ({
        id: msg.id, role: msg.role, content: msg.content, phase: msg.phase, score: msg.score
      }))
    };
  }

  async *processUserMessageStream(
    interviewId: string,
    userId: string,
    userMessage: string,
    activeTab: 'THEORY' | 'CODING' | 'EVALUATION',
    codeSnippet: string,
    terminalOutput: string = '',
    emotion: string = 'neutral'
  ) {
    const interview = await this.interviewRepo.findOne({ where: { id: interviewId, user_id: userId } });
    if (!interview) throw new NotFoundException('Không tìm thấy phiên phỏng vấn');

    if (interview.status === 'COMPLETED') {
      throw new BadRequestException('Phiên phỏng vấn này đã kết thúc, không thể chat thêm.');
    }

    if (activeTab === 'CODING' && codeSnippet !== undefined) {
      interview.last_code = codeSnippet;
      await this.interviewRepo.save(interview);
    }

    if (userMessage && userMessage.trim().length > 0) {
      await this.messageRepo.save({
        interview_id: interviewId,
        role: 'user',
        content: userMessage,
        score: 0,
        phase: activeTab
      });
    }

    const rawHistory = await this.messageRepo.find({
      where: { interview_id: interviewId },
      order: { created_at: 'ASC' }
    });

    const aiGenerator = this.aiService.processInterviewTurnStream(
      userId,
      interviewId,
      userMessage,
      { target_role: interview.job_title, experience_level: interview.experience_level || 'Senior' },
      rawHistory.map(msg => ({ role: msg.role as any, content: msg.content })),
      activeTab,
      codeSnippet,
      terminalOutput,
      emotion
    );

    let aiFinalData: any = null;
    let fullReply = '';

    while (true) {
      const { value, done } = await aiGenerator.next();
      if (done) {
        aiFinalData = value;
        break;
      }
      fullReply += value;
      yield value;
    }

    const nextAction = aiFinalData?.next_action;
    let finalPhase = activeTab;

    if (nextAction === 'SWITCH_TO_CODING' && interview.current_phase !== 'CODING') {
      interview.current_phase = 'CODING';
      finalPhase = 'CODING';
      await this.interviewRepo.save(interview);
    } else if (nextAction === 'END_INTERVIEW' || activeTab === 'EVALUATION') {
      interview.status = 'COMPLETED';
      interview.current_phase = 'EVALUATION';
      finalPhase = 'EVALUATION';
      await this.interviewRepo.save(interview);
    }

    await this.messageRepo.save({
      interview_id: interviewId,
      role: 'assistant',
      content: fullReply,
      phase: finalPhase
    });

    yield `__METADATA__${JSON.stringify({ current_phase: finalPhase })}`;
  }

  async getSummaryReport(interviewId: string) {
    const interview = await this.interviewRepo.findOne({ where: { id: interviewId } });
    if (!interview) throw new NotFoundException('Không tìm thấy phiên phỏng vấn.');

    const fullHistory = await this.messageRepo.find({
      where: { interview_id: interviewId },
      order: { created_at: 'ASC' }
    });

    if (!fullHistory.some(m => m.role === 'user')) {
      throw new BadRequestException('Không thể xuất báo cáo cho bài thi chưa có tương tác.');
    }

    const hasData = interview.radar_data &&
                    Array.isArray(interview.radar_data) &&
                    interview.radar_data.some(value => value !== 0);

    if (interview.status === 'COMPLETED' && hasData) {
      return {
        avgScore: interview.average_score,
        theory: interview.score_theory,
        coding: interview.score_coding,
        softSkills: interview.score_softskills,
        radarData: interview.radar_data,
        learningPath: interview.learning_path,
        summary: interview.final_report,
        chatHistory: fullHistory
      };
    }

    const evaluator = new EvaluatorAgent(this.aiService['model']);
    const reportData = await evaluator.invoke(
      fullHistory,
      { target_role: interview.job_title },
      interview.last_code
    );

    interview.average_score = reportData.average_score;
    interview.score_theory = reportData.breakdown.theory;
    interview.score_coding = reportData.breakdown.coding;
    interview.score_softskills = reportData.breakdown.soft_skills;
    interview.radar_data = reportData.radar_chart;
    interview.learning_path = reportData.learning_path;
    interview.final_report = reportData.summary_markdown;
    interview.status = 'COMPLETED';
    interview.current_phase = 'EVALUATION';

    await this.interviewRepo.save(interview);

    return {
      avgScore: interview.average_score,
      theory: interview.score_theory,
      coding: interview.score_coding,
      softSkills: interview.score_softskills,
      radarData: interview.radar_data,
      learningPath: interview.learning_path,
      summary: interview.final_report,
      chatHistory: fullHistory
    };
  }

  async processAudioMessage(
    interviewId: string,
    userId: string,
    fileBuffer: Buffer,
    filename: string,
    activeTab: 'THEORY' | 'CODING' | 'EVALUATION',
    codeSnippet: string,
    terminalOutput: string = '',
    emotion: string = 'neutral'
  ) {
    const transcribedText = await this.aiService.transcribeAudio(fileBuffer, filename);
    if (!transcribedText || transcribedText.trim().length === 0) {
      return { reply: "Mình không nghe rõ, bạn nói lại được không?", recognizedText: "" };
    }
    const stream = this.processUserMessageStream(interviewId, userId, transcribedText, activeTab, codeSnippet, terminalOutput, emotion);
    let fullReply = "";
    for await (const chunk of stream) {
      if (!chunk.startsWith('__METADATA__')) fullReply += chunk;
    }
    const updatedInterview = await this.interviewRepo.findOne({ where: { id: interviewId } });
    return {
      recognizedText: transcribedText,
      reply: fullReply,
      current_phase: updatedInterview?.current_phase || activeTab
    };
  }
}