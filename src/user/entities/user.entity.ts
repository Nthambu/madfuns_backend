import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
      id: string;
       @Column({ unique: true })
  email: string;
@Column()
username:string;

  @Column() // Store the hashed main password
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  otpHash: string;

  @Column({ type: 'timestamp', nullable: true })
  otpExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
