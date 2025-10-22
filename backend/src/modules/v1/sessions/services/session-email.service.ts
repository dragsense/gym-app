import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Session } from '../entities/session.entity';
import { LoggerService } from '@/common/logger/logger.service';


export enum ReminderType {
  CONFIRMATION = 'confirmation',
  REMINDER = 'reminder',
  DELETED = 'deleted',
  STATUS_UPDATE = 'status_update',
}

export interface SessionEmailContext {
  session: Session;
  recipientEmail?: string;
  recipientName?: string;
  reminderType?: ReminderType;
  sendBefore?: number; // minutes before session
}

interface SessionEmailTemplateData {
  session: Session;
  recipientEmail: string;
  recipientName: string;
  loginUrl: string;
  sessionUrl: string;
  reminderType: ReminderType;
  sendBefore?: number;
}

@Injectable()
export class SessionEmailService {
  private readonly logger = new LoggerService(SessionEmailService.name);
  private readonly appConfig: any;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.appConfig = this.configService.get('app');
  }

  /**
   * Send session confirmation email when session is created
   */
  async sendSessionConfirmation(session: Session, recipientEmail: string, recipientName: string): Promise<void> {
    try {
      const context: SessionEmailContext = {
        session,
        reminderType: ReminderType.CONFIRMATION,
        recipientEmail,
        recipientName,
      };

      await this.sendSessionEmail(context);
      this.logger.log(`Session confirmation email sent for session: ${session.title}`);
    } catch (error) {
      this.logger.error(`Failed to send session confirmation email for session ${session.id}:`, error);
      throw error;
    }
  }

  /**
   * Send session reminder email
   */
  async sendSessionReminder(session: Session, recipientEmail: string, recipientName: string): Promise<void> {
    try {
      const context: SessionEmailContext = {
        session,
        reminderType: ReminderType.REMINDER,
        recipientEmail,
        recipientName,
      };

      await this.sendSessionEmail(context);
      this.logger.log(`Session reminder email sent for session: ${session.title}`);
    } catch (error) {
      this.logger.error(`Failed to send session reminder email for session ${session.id}:`, error);
      throw error;
    }
  }


  async sendSessionStatusUpdate(session: Session, recipientEmail: string, recipientName: string): Promise<void> {
    try {
      const context: SessionEmailContext = {
        session,
        reminderType: ReminderType.STATUS_UPDATE,
        recipientEmail,
        recipientName,
      };

      await this.sendSessionEmail(context);
      this.logger.log(`Session status update email sent for session: ${session.title}`);
    } catch (error) {
      this.logger.error(`Failed to send session status update email for session ${session.id}:`, error);
      throw error;
    }
  }


    /**
   * Send session reminder email
   */
    async sendSessionDeleted(session: Session, recipientEmail: string, recipientName: string, sendBefore?: number): Promise<void> {
      try {
        const context: SessionEmailContext = {
          session,
          reminderType: ReminderType.DELETED,
          recipientEmail,
          recipientName
        };
  
        await this.sendSessionEmail(context);
        this.logger.log(`Session deleted email sent for session: ${session.title}`);
      } catch (error) {
        this.logger.error(`Failed to send session deleted email for session ${session.id}:`, error);
        throw error;
      }
    }

  /**
   * Generic method to send session-related emails
   */
  private async sendSessionEmail(context: SessionEmailContext): Promise<void> {
    try {
      const { session, recipientEmail, recipientName, reminderType, sendBefore } = context;

      if (!recipientEmail) {
        this.logger.warn(`No recipient email found for session ${session.id}`);
        return;
      }

      const templateData: SessionEmailTemplateData = {
        session,
        recipientEmail,
        recipientName: recipientName || 'User',
        loginUrl: `${this.appConfig.frontendUrl}/login`,
        sessionUrl: `${this.appConfig.frontendUrl}/sessions`,
        reminderType: reminderType || ReminderType.CONFIRMATION,
        sendBefore,
      };

      const emailConfig = this.getEmailConfig(reminderType || ReminderType.CONFIRMATION);

      await this.mailerService.sendMail({
        to: recipientEmail,
        subject: emailConfig.subject,
        html: this.generateSessionEmailHTML(templateData, reminderType || ReminderType.CONFIRMATION),
        text: this.generateSessionEmailText(templateData, reminderType || ReminderType.CONFIRMATION),
      });

    } catch (error) {
      this.logger.error(`Failed to send session email:`, error);
      throw error;
    }
  }

  /**
   * Get email configuration based on reminder type
   */
  private getEmailConfig(reminderType: ReminderType) {
    const baseUrl = this.appConfig.frontendUrl;

    switch (reminderType) {
      case ReminderType.CONFIRMATION:
        return {
          subject: 'Session Confirmation - Your Session is Scheduled',
          template: 'session-confirmation',
        };

      case ReminderType.REMINDER:
        return {
          subject: 'Session Reminder - Your Session is Coming Up',
          template: 'session-reminder',
        };

      case ReminderType.STATUS_UPDATE:
        return {
          subject: 'Session Status Update - Your Session Status has Changed',
          template: 'session-status-update',
        };

      case ReminderType.DELETED:
        return {
          subject: 'Session Deleted - Your Session has been Deleted',
          template: 'session-deleted',
        };

      default:
        return {
          subject: 'Session Update',
          template: 'session-default',
        };
    }
  }

  /**
   * Generate HTML email template for session emails
   */
  private generateSessionEmailHTML(data: SessionEmailTemplateData, reminderType: ReminderType): string {
    const { session, recipientName, loginUrl, sessionUrl, sendBefore } = data;
    const appName = this.appConfig.name;
    const sessionDate = new Date(session.startDateTime).toLocaleDateString();
    const sessionTime = new Date(session.startDateTime).toLocaleTimeString();
    const sessionEndTime = session.endDateTime ? new Date(session.endDateTime).toLocaleTimeString() : 'TBD';

    const getEmailContent = () => {
      switch (reminderType) {
        case ReminderType.CONFIRMATION:
          return {
            title: 'Session Confirmed!',
            message: `Your session "${session.title}" has been successfully scheduled.`,
            icon: '✅',
            actionText: 'View Session Details',
            actionUrl: sessionUrl,
            additionalInfo: 'Please arrive on time and bring any necessary materials.'
          };
        case ReminderType.REMINDER:
          return {
            title: 'Session Reminder',
            message: `This is a reminder that your session "${session.title}" is coming up soon.`,
            icon: '⏰',
            actionText: 'View Session Details',
            actionUrl: sessionUrl,
            additionalInfo: sendBefore ? `This reminder is sent ${sendBefore} minutes before your session.` : 'Please arrive on time.'
          };
        case ReminderType.STATUS_UPDATE:
          return {
            title: 'Session Status Update',
            message: `Your session "${session.title}" status has been updated.`,
            icon: '📋',
            actionText: 'View Session Details',
            actionUrl: sessionUrl,
            additionalInfo: 'Please check the updated details for any changes.'
          };
        case ReminderType.DELETED:
          return {
            title: 'Session Cancelled',
            message: `Your session "${session.title}" has been cancelled.`,
            icon: '❌',
            actionText: 'View Other Sessions',
            actionUrl: sessionUrl,
            additionalInfo: 'If you have any questions, please contact your trainer.'
          };
        default:
          return {
            title: 'Session Update',
            message: `Your session "${session.title}" has been updated.`,
            icon: '📝',
            actionText: 'View Session Details',
            actionUrl: sessionUrl,
            additionalInfo: 'Please check the details for any changes.'
          };
      }
    };

    const content = getEmailContent();

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${content.title} - ${appName}</title>
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
        .session-details {
            background: #e8f4fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #b3d9ff;
        }
        .action-button {
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
        .info-item {
            margin: 8px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-scheduled { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        .status-completed { background: #d1ecf1; color: #0c5460; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="color: #333; margin: 0;">${content.icon} ${content.title}</h2>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">${appName}</p>
        </div>
        
        <p>Dear ${recipientName},</p>
        
        <p>${content.message}</p>

        <div class="session-details">
            <h3 class="section-title">📅 Session Details</h3>
            <div class="info-item"><strong>Title:</strong> ${session.title}</div>
            <div class="info-item"><strong>Date:</strong> ${sessionDate}</div>
            <div class="info-item"><strong>Time:</strong> ${sessionTime} - ${sessionEndTime}</div>
            <div class="info-item"><strong>Duration:</strong> ${session.endDateTime ? Math.round((new Date(session.endDateTime).getTime() - new Date(session.startDateTime).getTime()) / (1000 * 60)) : session.duration || 'TBD'} minutes</div>
            ${session.description ? `<div class="info-item"><strong>Description:</strong> ${session.description}</div>` : ''}
            ${session.location ? `<div class="info-item"><strong>Location:</strong> ${session.location}</div>` : ''}
            <div class="info-item">
                <strong>Status:</strong> 
                <span class="status-badge status-${session.status?.toLowerCase() || 'scheduled'}">${session.status || 'Scheduled'}</span>
            </div>
        </div>

        ${content.additionalInfo ? `
        <div class="section">
            <h3 class="section-title">ℹ️ Important Information</h3>
            <p>${content.additionalInfo}</p>
        </div>
        ` : ''}

        <div style="text-align: center;">
            <a href="${content.actionUrl}" class="action-button">${content.actionText}</a>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            <p><a href="${this.appConfig.frontendUrl}" style="color: #4caf50; text-decoration: none;">Visit our website</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate text email template for session emails
   */
  private generateSessionEmailText(data: SessionEmailTemplateData, reminderType: ReminderType): string {
    const { session, recipientName, loginUrl, sessionUrl, sendBefore } = data;
    const appName = this.appConfig.name;
    const sessionDate = new Date(session.startDateTime).toLocaleDateString();
    const sessionTime = new Date(session.startDateTime).toLocaleTimeString();
    const sessionEndTime = session.endDateTime ? new Date(session.endDateTime).toLocaleTimeString() : 'TBD';

    const getEmailContent = () => {
      switch (reminderType) {
        case ReminderType.CONFIRMATION:
          return {
            title: 'Session Confirmed!',
            message: `Your session "${session.title}" has been successfully scheduled.`,
            additionalInfo: 'Please arrive on time and bring any necessary materials.'
          };
        case ReminderType.REMINDER:
          return {
            title: 'Session Reminder',
            message: `This is a reminder that your session "${session.title}" is coming up soon.`,
            additionalInfo: sendBefore ? `This reminder is sent ${sendBefore} minutes before your session.` : 'Please arrive on time.'
          };
        case ReminderType.STATUS_UPDATE:
          return {
            title: 'Session Status Update',
            message: `Your session "${session.title}" status has been updated.`,
            additionalInfo: 'Please check the updated details for any changes.'
          };
        case ReminderType.DELETED:
          return {
            title: 'Session Cancelled',
            message: `Your session "${session.title}" has been cancelled.`,
            additionalInfo: 'If you have any questions, please contact your trainer.'
          };
        default:
          return {
            title: 'Session Update',
            message: `Your session "${session.title}" has been updated.`,
            additionalInfo: 'Please check the details for any changes.'
          };
      }
    };

    const content = getEmailContent();

    return `${content.title} - ${appName}

Dear ${recipientName},

${content.message}

SESSION DETAILS:
================
Title: ${session.title}
Date: ${sessionDate}
Time: ${sessionTime} - ${sessionEndTime}
Duration: ${session.endDateTime ? Math.round((new Date(session.endDateTime).getTime() - new Date(session.startDateTime).getTime()) / (1000 * 60)) : session.duration || 'TBD'} minutes
${session.description ? `Description: ${session.description}` : ''}
${session.location ? `Location: ${session.location}` : ''}
Status: ${session.status || 'Scheduled'}

${content.additionalInfo ? `\nIMPORTANT INFORMATION:\n${content.additionalInfo}\n` : ''}

View Session Details: ${sessionUrl}

---
${appName}
Visit our website: ${this.appConfig.frontendUrl}

© ${new Date().getFullYear()} ${appName}. All rights reserved.`;
  }
}
