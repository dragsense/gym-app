import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from  '@/modules/v1/users/entities/user.entity';
import { LoggerService } from '@/common/logger/logger.service';

export interface OnboardingEmailContext {
  user: User;
  tempPassword?: string;
  createdBy?: User;
  welcomeMessage?: string;
  additionalInstructions?: string;
}

interface EmailTemplateData {
  user: User;
  appName: string;
  loginUrl: string;
  tempPassword?: string;
  createdBy?: User;
}

@Injectable()
export class UserEmailService {
  private readonly logger = new LoggerService(UserEmailService.name);
  private readonly appConfig: any;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.appConfig = this.configService.get('app');
  }

  /**
   * Sends appropriate onboarding email based on context
   */
  async sendOnboardingEmail(context: OnboardingEmailContext): Promise<void> {
    try {
      const { user } = context;
      await this.sendWelcomeEmail(context);
      this.logger.log(`Onboarding email sent successfully to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send onboarding email to ${context.user.email}:`, error);
      throw error;
    }
  }

  /**
   * Admin self-registration welcome email
   */
  async sendWelcomeEmail(context: OnboardingEmailContext): Promise<void> {
    const { user, tempPassword, createdBy } = context;
    const loginUrl = `${this.appConfig.appUrl}/${this.appConfig.loginPath}`;

    const templateData: EmailTemplateData = {
      user,
      appName: this.appConfig.name,
      loginUrl,
      tempPassword,
      createdBy
    };

    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get('MAIL_FROM'),
      subject: `Welcome to ${this.appConfig.name} - Account Created`,
      html: this.generateWelcomeEmailHTML(templateData),
      text: this.generateWelcomeEmailText(templateData),
    });
  }

  private generateWelcomeEmailHTML(data: EmailTemplateData): string {
    const { user, appName, loginUrl, tempPassword, createdBy } = data;
    const userName = user.profile?.firstName || 'Valued Customer';
    const createdByName = createdBy?.profile?.firstName ? `${createdBy.profile.firstName} ${createdBy.profile.lastName || ''}` : 'System Administrator';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${appName}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background: #f9f9f9;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px;
            border-bottom: 2px solid #4caf50;
            padding-bottom: 20px;
        }
        .company-name {
            color: #4caf50;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #4caf50;
        }
        .section-title {
            color: #333;
            margin-top: 0;
            font-size: 18px;
        }
        .credentials {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .login-button {
            display: inline-block;
            padding: 15px 30px;
            background: #4caf50;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
        }
        .footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            background: #e8f4fd;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
        }
        .info-item {
            margin: 8px 0;
        }
        .warning {
            color: #856404;
            font-size: 14px;
            margin: 10px 0 0 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="color: #333; margin: 0;">Welcome to ${appName}</h2>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Your account has been successfully created</p>
        </div>
        
        <p>Dear ${userName},</p>
        
        <p>Welcome to ${appName}! We're excited to have you on board. Your account has been created and is ready for use.</p>

        <div class="section">
            <h3 class="section-title">📋 Account Information</h3>
            <div class="info-item"><strong>Email:</strong> ${user.email}</div>
            <div class="info-item"><strong>Name:</strong> ${user.profile?.firstName || 'Customer'} ${user.profile?.lastName || ''}</div>
            <div class="info-item"><strong>Role:</strong> Personal Customer</div>
            ${createdBy ? `<div class="info-item"><strong>Created by:</strong> ${createdByName}</div>` : ''}
        </div>

        ${tempPassword ? `
        <div class="credentials">
            <h3 style="color: #856404; margin-top: 0;">🔐 Login Credentials</h3>
            <div class="info-item">
                <strong>Temporary Password:</strong> 
                <code style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace;">
                    ${tempPassword}
                </code>
            </div>
            <p class="warning">⚠️ For security reasons, please change your password after your first login.</p>
        </div>
        ` : ''}

        <div style="text-align: center;">
            <a href="${loginUrl}" class="login-button">Access Your Account</a>
        </div>


        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            <p><a href="${this.appConfig.appUrl}" style="color: #4caf50; text-decoration: none;">Visit our website</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateWelcomeEmailText(data: EmailTemplateData): string {
    const { user, appName, loginUrl, tempPassword, createdBy } = data;
    const userName = user.profile?.firstName || 'Valued Customer';
    const createdByName = createdBy?.profile?.firstName ? `${createdBy.profile.firstName} ${createdBy.profile.lastName || ''}` : 'System Administrator';

    return `
Welcome to ${appName}!

Dear ${userName},

Your account has been successfully created with ${appName}.

Account Details:
- Email: ${user.email}
- Name: ${user.profile?.firstName || 'Customer'} ${user.profile?.lastName || ''}
- Role: Personal Customer
${createdBy ? `- Created by: ${createdByName}\n` : ''}

${tempPassword ? `
Login Credentials:
- Temporary Password: ${tempPassword}
- Login URL: ${loginUrl}

⚠️ For security reasons, please change your password after your first login.
` : `
Access your account at: ${loginUrl}
`}


Best regards,
The ${appName} Team

© ${new Date().getFullYear()} ${appName}. All rights reserved.
    `.trim();
  }

  /**
   * Send password reset success notification
   */
  async sendPasswordResetConfirmation(user: User): Promise<void> {
    try {
      const supportEmail = this.appConfig.superAdmin.email;

      await this.mailerService.sendMail({
        to: user.email,
        from: this.configService.get('MAIL_FROM'),
        subject: `Password Reset Successful - ${this.appConfig.name}`,
        html: this.generatePasswordResetConfirmationHTML(user, supportEmail),
        text: this.generatePasswordResetConfirmationText(user, supportEmail),
      });

      this.logger.log(`Password reset confirmation sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset confirmation to ${user.email}:`, error);
    }
  }

  private generatePasswordResetConfirmationHTML(user: User, supportEmail: string): string {
    const userName = user.profile?.firstName || 'User';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #28a745; padding-bottom: 20px; }
        .success { color: #28a745; font-size: 24px; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
        .security-note { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success">✅ Password Reset Successful</div>
        </div>
        
        <p>Hello ${userName},</p>
        
        <p>Your password has been successfully reset for your ${this.appConfig.name} account.</p>
        
        <div class="security-note">
            <strong>Security Notice:</strong> If you did not request this password reset, 
            please contact our support team immediately at ${supportEmail}.
        </div>
        
        <p>Best regards,<br>The ${this.appConfig.name} Team</p>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${this.appConfig.name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generatePasswordResetConfirmationText(user: User, supportEmail: string): string {
    const userName = user.profile?.firstName || 'User';
    
    return `
Password Reset Successful

Hello ${userName},

Your password has been successfully reset for your ${this.appConfig.name} account.

Security Notice: If you did not request this password reset, please contact our support team immediately at ${supportEmail}.

Best regards,
  The ${this.appConfig.name} Team

© ${new Date().getFullYear()} ${this.appConfig.name}. All rights reserved.
    `.trim();
  }
}