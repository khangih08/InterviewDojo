import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';

describe('UserService', () => {
  let service: UserService;

  const repositoryMock = {
    create: jest.fn().mockImplementation((data) => ({ ...data })),
    save: jest.fn().mockImplementation(async (user) => ({ id: 'uuid', ...user })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('check', async () => {
    const rawPassword = '300720';
    const userData = { email: 'test1@gmail.com', password: rawPassword };

    const result = await service.create(userData) as any;

    expect(result.password).not.toEqual(rawPassword);
    expect(result.password).toContain('$2');
    expect(repositoryMock.create).toHaveBeenCalled();
    expect(repositoryMock.save).toHaveBeenCalled();
  });
});