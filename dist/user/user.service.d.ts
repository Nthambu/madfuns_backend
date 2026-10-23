import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
export declare class UserService {
    private readonly repo;
    private readonly jwtService;
    constructor(repo: Repository<User>, jwtService: JwtService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): string;
    verifyCredentialsAndSendOtp(email: string, password: string): Promise<{
        message: string;
        step2Required: boolean;
    }>;
    private sendSecureEmail;
    verifyAdminOtp(email: string, otp: string): Promise<{
        accessToken: string;
    }>;
    findOne(id: number): string;
    update(id: number, updateUserDto: UpdateUserDto): string;
    remove(id: number): string;
}
