import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@/modules/v1/users/entities/user.entity';

@Injectable()
export class PasswordService {

    async validatePasswordChange(user: User, newPassword: string): Promise<void> {
        // Check against password history
        for (const oldPassword of user.passwordHistory) {
            if (await bcrypt.compare(newPassword, oldPassword)) {
                throw new BadRequestException('Cannot reuse previous passwords');
            }
        }
    }


}