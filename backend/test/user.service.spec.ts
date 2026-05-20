/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../src/user/user.service';
import { User } from '../src/entities/user.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const user = {
    id: 'u-1',
    email: 'test@example.com',
    password: 'hashed-password',
    full_name: 'Test User',
    target_role: 'Frontend Developer',
    experience_level: 'Junior',
    role: 'user',
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneById', () => {
    it('returns user when found', async () => {
      userRepository.findOne.mockResolvedValue(user);

      await expect(service.findOneById('u-1')).resolves.toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u-1' } }),
      );
    });

    it('throws NotFoundException when user is missing', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('throws when user does not exist', async () => {
      userRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.update('missing', { full_name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when new email is already taken', async () => {
      userRepository.findOne.mockResolvedValueOnce(user).mockResolvedValueOnce({
        ...user,
        id: 'u-2',
        email: 'used@example.com',
      });

      await expect(
        service.update('u-1', { email: 'used@example.com' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates and returns selected fields', async () => {
      const updatedUser = { ...user, full_name: 'Updated User' };
      userRepository.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(updatedUser);
      userRepository.update.mockResolvedValue({ affected: 1 });

      await expect(
        service.update('u-1', { full_name: 'Updated User' }),
      ).resolves.toEqual(updatedUser);
      expect(userRepository.update).toHaveBeenCalledWith('u-1', {
        full_name: 'Updated User',
      });
    });
  });

  describe('changePassword', () => {
    it('throws when current password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.changePassword('u-1', {
          currentPassword: 'wrong-current',
          newPassword: 'NewStrongPass#123',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws when new password matches old password', async () => {
      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await expect(
        service.changePassword('u-1', {
          currentPassword: 'correct-current',
          newPassword: 'correct-current',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('hashes and updates password successfully', async () => {
      userRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      userRepository.update.mockResolvedValue({ affected: 1 });

      await expect(
        service.changePassword('u-1', {
          currentPassword: 'correct-current',
          newPassword: 'NewStrongPass#123',
        }),
      ).resolves.toEqual({ message: 'Password changed successfully' });
      expect(userRepository.update).toHaveBeenCalledWith('u-1', {
        password: 'new-hash',
      });
    });
  });

  describe('remove', () => {
    it('throws when removing missing user', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes user and returns success message', async () => {
      userRepository.findOne.mockResolvedValue(user);
      userRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove('u-1')).resolves.toEqual({
        message: 'User account deleted successfully',
      });
      expect(userRepository.delete).toHaveBeenCalledWith('u-1');
    });
  });
});
