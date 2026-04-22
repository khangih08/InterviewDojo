/// <reference types="jest" />

import { UserControllers } from '../src/user/user.controller';

describe('UserControllers', () => {
  const usersService = {
    findOneById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    changePassword: jest.fn(),
    remove: jest.fn(),
  };

  let controller: UserControllers;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UserControllers(usersService as any);
  });

  it('gets current user profile from request user id', async () => {
    const response = { id: 'u-1', email: 'user@example.com' };
    usersService.findOneById.mockResolvedValue(response);

    await expect(
      controller.getProfile({ user: { id: 'u-1' } } as any),
    ).resolves.toEqual(response);
    expect(usersService.findOneById).toHaveBeenCalledWith('u-1');
  });

  it('returns all users', async () => {
    usersService.findAll.mockResolvedValue([{ id: 'u-1' }]);

    await expect(controller.findAll()).resolves.toEqual([{ id: 'u-1' }]);
  });

  it('gets a single user by id', async () => {
    usersService.findOneById.mockResolvedValue({ id: 'u-2' });

    await expect(controller.findOne('u-2')).resolves.toEqual({ id: 'u-2' });
    expect(usersService.findOneById).toHaveBeenCalledWith('u-2');
  });

  it('updates current user profile', async () => {
    const dto = { full_name: 'Updated Name' };
    usersService.update.mockResolvedValue({ id: 'u-1', ...dto });

    await expect(controller.updateProfile('u-1', dto as any)).resolves.toEqual({
      id: 'u-1',
      ...dto,
    });
    expect(usersService.update).toHaveBeenCalledWith('u-1', dto);
  });

  it('changes password for current user', async () => {
    usersService.changePassword.mockResolvedValue({
      message: 'Password changed successfully',
    });

    await expect(
      controller.changePassword('u-1', {
        currentPassword: 'old',
        newPassword: 'new',
      } as any),
    ).resolves.toEqual({
      message: 'Password changed successfully',
    });
  });

  it('deletes current user account', async () => {
    usersService.remove.mockResolvedValue({
      message: 'User account deleted successfully',
    });

    await expect(controller.deleteAccount('u-1')).resolves.toEqual({
      message: 'User account deleted successfully',
    });
    expect(usersService.remove).toHaveBeenCalledWith('u-1');
  });

  it('deletes a user by id', async () => {
    usersService.remove.mockResolvedValue({
      message: 'User account deleted successfully',
    });

    await expect(controller.deleteUser('u-2')).resolves.toEqual({
      message: 'User account deleted successfully',
    });
    expect(usersService.remove).toHaveBeenCalledWith('u-2');
  });
});
