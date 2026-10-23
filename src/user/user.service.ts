import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt'; // Ensure you import JwtService
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly jwtService: JwtService, // Added to fix the verifyAdminOtp error
  ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
    // Destructure all needed properties including username
    const { email, username, password, role } = createUserDto;

    // Check if user already exists
    const existingUser = await this.repo.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash the raw password safely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Force type assertion on role using your UserRole Enum to satisfy TypeORM overloads
    const userRole = (role as UserRole) || UserRole.USER;

    //  Build the object structure exactly matching the User Entity
    const newUser = this.repo.create({
      email,
      username,         
      passwordHash,
      role: userRole,   
    });

    //  Save to your PostgreSQL database
    const savedUser = await this.repo.save(newUser);
    
    // Clean up sensitive fields from the payload instance before sending back to client
    delete savedUser.passwordHash; 
    return savedUser;
  }

  findAll() {
    return `This action returns all user`;
  }

  async verifyCredentialsAndSendOtp(email: string, password: string): Promise<{ message: string; step2Required: boolean }> {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    
    const user = await this.repo.findOne({ where: { email: email } });
    
    // Generic error message to prevent username/email enumeration
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    // Strict Role Check: Reject if not an admin
    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Access denied');
    }
    
    // Verify main account password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt();
    user.otpHash = await bcrypt.hash(otp, salt);
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // Valid for 5 minutes
    await this.repo.save(user);

    // Call the internal helper method
    await this.sendSecureEmail(user.email, otp);
    
    return { 
      message: 'Password accepted. Please provide the OTP sent to your registered email.',
      step2Required: true 
    };
  }

  //  Added missing sendSecureEmail method definition
  private async sendSecureEmail(email: string, otp: string): Promise<void> {
    // Replace this console.log with your actual Mailer module/service call later
    console.log(`[MAILER] Sending secure login OTP: ${otp} to admin email: ${email}`);
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

    // Clear OTP fields immediately to avoid replay attacks
    user.otpHash = null;
    user.otpExpiresAt = null;
    await this.repo.save(user);

    // Return the admin access token
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
findOne(id:number){
  return `the user is`;
}
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
