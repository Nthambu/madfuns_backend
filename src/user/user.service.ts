import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password, role } = createUserDto;

    const existingUser = await this.repo.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userRole = (role as UserRole) || UserRole.USER;

    const newUser = this.repo.create({ email, username, passwordHash, role: userRole });
    const savedUser = await this.repo.save(newUser);

    delete savedUser.passwordHash;
    delete savedUser.otpHash;
    delete savedUser.otpExpiresAt;
    return savedUser;
  }

  findAll() {
    return `This action returns all users`;
  }

  async verifyCredentialsAndSendOtp(
    email: string,
    password: string,
  ): Promise<{ message: string; step2Required: boolean }> {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.repo.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Access denied');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt();
    user.otpHash = await bcrypt.hash(otp, salt);
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await this.repo.save(user);

    await this.sendOtpEmail(user.email, otp);

    return {
      message: 'Password accepted. Please provide the OTP sent to your registered email.',
      step2Required: true,
    };
  }

  private async sendOtpEmail(to: string, otp: string): Promise<void> {
    await this.mailService.sendOtpEmail(to, otp);
  }

  async verifyAdminOtp(email: string, otp: string) {
    const user = await this.repo.findOne({ where: { email } });

    if (!user || !user.otpHash || !user.otpExpiresAt || user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Invalid authentication attempt');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    const isMatch = await bcrypt.compare(otp, user.otpHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Clear OTP fields to prevent replay attacks
    user.otpHash = null;
    user.otpExpiresAt = null;
    await this.repo.save(user);

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '1h' }),
    };
  }

  findOne(id: number) {
    return `the user is`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
