import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
export declare class UserService {
    private readonly repo;
    private readonly jwtService;
    private readonly mailService;
    constructor(repo: Repository<User>, jwtService: JwtService, mailService: MailService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): string;
    verifyCredentialsAndSendOtp(email: string, password: string): Promise<{
        message: string;
        step2Required: boolean;
    }>;
    private sendOtpEmail;
    verifyAdminOtp(email: string, otp: string): Promise<{
        accessToken: string;
    }>;
    findOne(id: number): string;
    update(id: number, updateUserDto: UpdateUserDto): string;
    remove(id: number): string;
}
