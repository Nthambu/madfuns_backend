"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const typeorm_2 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
let UserService = class UserService {
    constructor(repo, jwtService) {
        this.repo = repo;
        this.jwtService = jwtService;
    }
    async create(createUserDto) {
        const { email, username, password, role } = createUserDto;
        const existingUser = await this.repo.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.BadRequestException('Email already registered');
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const userRole = role || user_entity_1.UserRole.USER;
        const newUser = this.repo.create({
            email,
            username,
            passwordHash,
            role: userRole,
        });
        const savedUser = await this.repo.save(newUser);
        delete savedUser.passwordHash;
        return savedUser;
    }
    findAll() {
        return `This action returns all user`;
    }
    async verifyCredentialsAndSendOtp(email, password) {
        if (!email || !password) {
            throw new common_1.BadRequestException('Email and password are required');
        }
        const user = await this.repo.findOne({ where: { email: email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.UnauthorizedException('Access denied');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const otp = crypto.randomInt(100000, 999999).toString();
        const salt = await bcrypt.genSalt();
        user.otpHash = await bcrypt.hash(otp, salt);
        user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.repo.save(user);
        await this.sendSecureEmail(user.email, otp);
        return {
            message: 'Password accepted. Please provide the OTP sent to your registered email.',
            step2Required: true
        };
    }
    async sendSecureEmail(email, otp) {
        console.log(`[MAILER] Sending secure login OTP: ${otp} to admin email: ${email}`);
    }
    async verifyAdminOtp(email, otp) {
        const user = await this.repo.findOne({ where: { email } });
        if (!user || !user.otpHash || !user.otpExpiresAt || user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.UnauthorizedException('Invalid authentication attempt');
        }
        if (new Date() > user.otpExpiresAt) {
            throw new common_1.BadRequestException('OTP has expired');
        }
        const isMatch = await bcrypt.compare(otp, user.otpHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid OTP code');
        }
        user.otpHash = null;
        user.otpExpiresAt = null;
        await this.repo.save(user);
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
    findOne(id) {
        return `the user is`;
    }
    update(id, updateUserDto) {
        return `This action updates a #${id} user`;
    }
    remove(id) {
        return `This action removes a #${id} user`;
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        jwt_1.JwtService])
], UserService);
//# sourceMappingURL=user.service.js.map