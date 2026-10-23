export declare enum UserRole {
    USER = "user",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    role: UserRole;
    otpHash: string;
    otpExpiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
