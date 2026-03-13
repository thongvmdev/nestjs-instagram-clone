import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dtos/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from '../users/dtos/user.dto';
import { User } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() body: SignUpDto) {
    return this.authService.signup(body.username, body.password);
  }

  @Post('signin')
  signin(@Body() body: SignInDto) {
    return this.authService.signin(body.username, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Serialize(UserDto)
  me(@CurrentUser() user: User) {
    return user;
  }
}
