import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

const mockUser: Partial<User> = {
  id: 1,
  username: 'testuser',
  password: '$2b$10$hashedpassword',
  created_at: new Date(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let fakeUsersService: Partial<UsersService>;
  let fakeJwtService: Partial<JwtService>;

  beforeEach(async () => {
    fakeUsersService = {
      findByUsername: jest.fn(),
      create: jest.fn(),
    };

    fakeJwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
        { provide: JwtService, useValue: fakeJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    it('throws if username is already taken', async () => {
      (fakeUsersService.findByUsername as jest.Mock).mockResolvedValue(
        mockUser,
      );

      await expect(
        authService.signup('testuser', 'password123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates a new user and returns access token', async () => {
      (fakeUsersService.findByUsername as jest.Mock).mockResolvedValue(null);
      (fakeUsersService.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.signup('testuser', 'password123');

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('signed-jwt-token');
      expect(result.user).toEqual({ id: 1, username: 'testuser' });
    });

    it('hashes the password before saving', async () => {
      (fakeUsersService.findByUsername as jest.Mock).mockResolvedValue(null);
      (fakeUsersService.create as jest.Mock).mockImplementation(
        (username: string, password: string) => {
          expect(password).not.toBe('password123');
          expect(password.length).toBeGreaterThan(20);
          return Promise.resolve({ ...mockUser, username, password });
        },
      );

      await authService.signup('testuser', 'password123');
      expect(fakeUsersService.create).toHaveBeenCalled();
    });
  });

  describe('signin', () => {
    it('throws if user is not found', async () => {
      (fakeUsersService.findByUsername as jest.Mock).mockResolvedValue(null);

      await expect(authService.signin('nobody', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws if password is wrong', async () => {
      (fakeUsersService.findByUsername as jest.Mock).mockResolvedValue(
        mockUser,
      );

      await expect(
        authService.signin('testuser', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
