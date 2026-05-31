import { Controller, Get, Post, Body, Param, Patch, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserPlan } from '../entities/user.entity';
import { Interview } from '../entities/interview.entity';

@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Interview) private readonly interviewRepo: Repository<Interview>,
  ) {}

  // 1. Lấy thống kê tổng quan (Dashboard Cards)
  @Get('stats')
  async getStats() {
    const [totalUsers, proUsers, pendingPayments, totalInterviews] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { plan: UserPlan.PRO } }),
      this.userRepo.count({ where: { is_pending_pro: true } }),
      this.interviewRepo.count(),
    ]);

    return {
      totalUsers,
      proUsers,
      pendingPayments,
      totalInterviews,
      revenue: proUsers * 199000
    };
  }

  // 2. Lấy danh sách toàn bộ User
  @Get('users')
  async getUsers() {
    return await this.userRepo.find({
      order: { is_pending_pro: 'DESC', plan: 'DESC', full_name: 'ASC' }
    });
  }

  // 3. Lấy chi tiết lịch sử phỏng vấn của 1 User (Dùng cho Modal Xem Log)
  @Get('user-interviews/:userId')
  async getUserInterviews(@Param('userId') userId: string) {
    return await this.interviewRepo.find({
      where: { user_id: userId  },
      order: { created_at: 'DESC' },
      relations: ['messages'], // Lấy kèm các tin nhắn chat
    });
  }

  // 4. API Duyệt PRO
  @Post('approve-pro/:id')
  async approvePro(@Param('id') userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User không tồn tại');

    user.plan = UserPlan.PRO;
    user.credits = 9999;
    user.is_pending_pro = false;
    await this.userRepo.save(user);

    return { success: true, message: `Đã nâng cấp PRO cho ${user.full_name}` };
  }

  // 5. API Tặng/Cập nhật Credits thủ công
  @Post('update-credits/:id')
  async updateCredits(@Param('id') userId: string, @Body('credits') credits: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User không tồn tại');

    user.credits = credits;
    await this.userRepo.save(user);

    return { success: true, message: `Đã cập nhật credits cho ${user.full_name}` };
  }

  // 6. API Thu hồi PRO (Hạ cấp xuống FREE)
  @Post('revoke-pro/:id')
  async revokePro(@Param('id') userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User không tồn tại');

    user.plan = UserPlan.FREE;
    user.credits = 10; // Reset lại 10 credits mặc định của gói FREE
    user.is_pending_pro = false;
    await this.userRepo.save(user);

    return { success: true, message: `Đã hạ cấp xuống FREE cho ${user.full_name}` };
  }
}