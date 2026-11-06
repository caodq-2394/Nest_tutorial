import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/registerUser.dto';
import { AuthService } from '../auth/auth.service';
import { LoginUserDto } from './dto/loginUser.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserInfo } from './decorators/user.decorator';
import { User } from './entities/user.entity';
import { I18nService } from 'nestjs-i18n/dist/services/i18n.service';

import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refreshToken.dto';

@ApiTags('Users')
@Controller('/api/v1/users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered',
    type: RegisterUserDto,
  })
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @Post('/login')
  async login(@Body() loginDto: LoginUserDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @ApiExcludeEndpoint()
  @Post('/refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    if (!refreshTokenDto?.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    return await this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('/logout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async logout(@UserInfo() userInfo: User) {
    await this.authService.logout(userInfo.id);

    return {
      message: this.i18n.t('common.logout', {
        args: { id: userInfo.id },
      }),
    };
  }

  @Get('/profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile found',
  })
  getUserInfo(@UserInfo() userInfo: User) {
    return userInfo;
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Return all users',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // Update
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'User updated',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  update(@UserInfo() userInfo: User, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userInfo.id, updateUserDto);
  }

  // Delete
  @Delete(':id')
  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
