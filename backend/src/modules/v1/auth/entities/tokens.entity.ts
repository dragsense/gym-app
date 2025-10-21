// auth/refresh-token.entity.ts
import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from '@/modules/v1/users/entities/user.entity';
import { GeneralBaseEntity } from '../../../../common/entities';

@Entity('refresh_tokens')
export class RefreshToken extends GeneralBaseEntity {

  @Column()
  token: string;

  @Column({ nullable: true })
  lastToken: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @ManyToOne(() => User, user => user.refreshTokens, { onDelete: 'CASCADE' })
  user: User;

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isValid(): boolean {
    return !this.revoked && !this.isExpired();
  }
}