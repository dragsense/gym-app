import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  BeforeUpdate,
  BeforeInsert,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { GeneralBaseEntity } from '@/common/entities';
import { Profile } from '../profiles/entities/profile.entity';
import { EUserLevels } from '@shared/enums/user.enum';
import { RefreshToken } from '@/modules/v1/auth/entities/tokens.entity';
import * as bcrypt from 'bcrypt';
import { StripeConnectAccount } from '@/modules/v1/stripe/entities/stripe-connect-account.entity';

@Entity('users')
export class User extends GeneralBaseEntity {
  @ApiProperty({
    example: 'email@example.com',
    description: "user's email address",
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @ApiProperty({ example: 'secrete', description: "user's password" })
  @Column({ type: 'varchar', length: 100, select: false })
  password: string;

  @ApiPropertyOptional({ example: true, description: 'User active status' })
  @Column({ type: 'boolean', default: true })
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'User level (0=USER, 1=TRAINER, 2=CLIENT)',
  })
  @Column({ type: 'int', default: EUserLevels.USER })
  level?: number;

  @OneToOne(() => Profile, { cascade: true, eager: true })
  @JoinColumn()
  profile?: Profile;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @Column({ type: 'timestamp', nullable: true })
  lastPasswordChange: Date;

  @Column('text', { array: true, default: [], select: false })
  passwordHistory: string[];

  @Column({ type: 'varchar', nullable: true })
  stripeCustomerId: string;

  @ApiProperty({
    type: () => StripeConnectAccount,
    description: 'Stripe Connect account of the trainer',
    required: false,
  })
  @OneToOne(() => StripeConnectAccount, (stripeConnect) => stripeConnect.user, {
    cascade: true,
  })
  stripeConnectAccount: StripeConnectAccount;

  @ApiProperty({
    type: () => User,
    description: 'User who created this user record',
    required: false,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
      this.lastPasswordChange = new Date();
      this.passwordHistory = [
        this.password,
        ...(this.passwordHistory || []),
      ].slice(0, 5); // Keep last 5 passwords
    }
  }
}
