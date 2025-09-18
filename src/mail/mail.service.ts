// mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Your Email',
      template: './verify-email', // refers to /templates/verify-email.hbs
      context: {
        link: `http://localhost:3000/auth/verify-email?token=${token}`,
      },
    });
  }
}
