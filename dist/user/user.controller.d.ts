import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<import("./entities/user.entity").User>;
    login(dto: LoginUserDto): Promise<{
        message: string;
        step2Required: boolean;
    }>;
    verifyOtp(otpDto: VerifyOtpDto): Promise<{
        accessToken: string;
    }>;
    verifyEmail(email: string): Promise<{
        message: string;
        step2Required: boolean;
    }>;
    updateAdminPassword(updatePasswordDto: UpdatePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateUserDto: UpdateUserDto): string;
    remove(id: string): string;
}
