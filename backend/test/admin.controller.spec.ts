/// <reference types="jest" />

import { BadRequestException } from '@nestjs/common';
import { AdminController } from '../src/admin/admin.controller';
import { UserPlan } from '../src/entities/user.entity';

describe('AdminController', () => {
  const mockUserRepo = {
    count: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockInterviewRepo = {
    count: jest.fn(),
    find: jest.fn(),
  };

  let controller: AdminController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminController(mockUserRepo as any, mockInterviewRepo as any);
  });

  describe('getStats', () => {
    it('should return aggregated stats correctly', async () => {
      mockUserRepo.count.mockImplementation((options) => {
        if (!options) return Promise.resolve(10); // totalUsers
        if (options.where?.plan === UserPlan.PRO) return Promise.resolve(3); // proUsers
        if (options.where?.is_pending_pro === true) return Promise.resolve(2); // pendingPayments
        return Promise.resolve(0);
      });
      mockInterviewRepo.count.mockResolvedValue(15); // totalInterviews

      const result = await controller.getStats();

      expect(result).toEqual({
        totalUsers: 10,
        proUsers: 3,
        pendingPayments: 2,
        totalInterviews: 15,
        revenue: 3 * 199000,
      });

      expect(mockUserRepo.count).toHaveBeenCalledTimes(3);
      expect(mockInterviewRepo.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUsers', () => {
    it('should return all users ordered', async () => {
      const mockUsers = [
        { id: 'u-1', full_name: 'Alice', plan: UserPlan.PRO, is_pending_pro: false },
        { id: 'u-2', full_name: 'Bob', plan: UserPlan.FREE, is_pending_pro: true },
      ];
      mockUserRepo.find.mockResolvedValue(mockUsers);

      const result = await controller.getUsers();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepo.find).toHaveBeenCalledWith({
        order: { is_pending_pro: 'DESC', plan: 'DESC', full_name: 'ASC' },
      });
    });
  });

  describe('getUserInterviews', () => {
    it('should return interviews of specified user with messages relation', async () => {
      const mockInterviews = [
        { id: 'i-1', user_id: 'u-1', messages: [{ id: 'm-1', content: 'hello' }] },
      ];
      mockInterviewRepo.find.mockResolvedValue(mockInterviews);

      const result = await controller.getUserInterviews('u-1');

      expect(result).toEqual(mockInterviews);
      expect(mockInterviewRepo.find).toHaveBeenCalledWith({
        where: { user_id: 'u-1' },
        order: { created_at: 'DESC' },
        relations: ['messages'],
      });
    });
  });

  describe('approvePro', () => {
    it('should throw BadRequestException if user is not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(controller.approvePro('u-notfound')).rejects.toThrow(
        new BadRequestException('User không tồn tại'),
      );
    });

    it('should upgrade user plan to PRO and reset status', async () => {
      const mockUser = {
        id: 'u-1',
        full_name: 'Alice',
        plan: UserPlan.FREE,
        credits: 5,
        is_pending_pro: true,
      };
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserRepo.save.mockResolvedValue({
        ...mockUser,
        plan: UserPlan.PRO,
        credits: 9999,
        is_pending_pro: false,
      });

      const result = await controller.approvePro('u-1');

      expect(result).toEqual({
        success: true,
        message: 'Đã nâng cấp PRO cho Alice',
      });
      expect(mockUser.plan).toBe(UserPlan.PRO);
      expect(mockUser.credits).toBe(9999);
      expect(mockUser.is_pending_pro).toBe(false);
      expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('updateCredits', () => {
    it('should throw BadRequestException if user is not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(controller.updateCredits('u-notfound', 50)).rejects.toThrow(
        new BadRequestException('User không tồn tại'),
      );
    });

    it('should update user credits successfully', async () => {
      const mockUser = {
        id: 'u-1',
        full_name: 'Alice',
        credits: 5,
      };
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserRepo.save.mockResolvedValue({
        ...mockUser,
        credits: 100,
      });

      const result = await controller.updateCredits('u-1', 100);

      expect(result).toEqual({
        success: true,
        message: 'Đã cập nhật credits cho Alice',
      });
      expect(mockUser.credits).toBe(100);
      expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('revokePro', () => {
    it('should throw BadRequestException if user is not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(controller.revokePro('u-notfound')).rejects.toThrow(
        new BadRequestException('User không tồn tại'),
      );
    });

    it('should downgrade user plan to FREE and reset credits', async () => {
      const mockUser = {
        id: 'u-1',
        full_name: 'Alice',
        plan: UserPlan.PRO,
        credits: 9999,
        is_pending_pro: false,
      };
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockUserRepo.save.mockResolvedValue({
        ...mockUser,
        plan: UserPlan.FREE,
        credits: 10,
        is_pending_pro: false,
      });

      const result = await controller.revokePro('u-1');

      expect(result).toEqual({
        success: true,
        message: 'Đã hạ cấp xuống FREE cho Alice',
      });
      expect(mockUser.plan).toBe(UserPlan.FREE);
      expect(mockUser.credits).toBe(10);
      expect(mockUser.is_pending_pro).toBe(false);
      expect(mockUserRepo.save).toHaveBeenCalledWith(mockUser);
    });
  });
});
