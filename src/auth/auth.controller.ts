import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuario registrado correctamente' })
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return user;
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    const token = await this.authService.login(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    });
    return {
      message: 'Login exitoso',
      token, // Devolver el token también para uso cross-domain
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('whoami')
  @ApiOperation({ summary: 'Obtener usuario autenticado' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Usuario autenticado' })
  async whoAmI(@Req() req: Request & { user: User }) {
    return req.user;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { message: 'Sesión cerrada' };
  }
}
