import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  private transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 587,
    auth: {
      user: 'c5a6c92147b136', // Copié de Mailtrap
      pass: '01ca99a0632289',
    },
  });

  async sendAccountRequestMail(to: string, employeName: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Nouvelle demande de création de compte',
      html: `
        <h3>Bonjour RH,</h3>
        <p>L'employé <strong>${employeName}</strong> a demandé la création d'un compte.</p>
        <p>Merci de vous connecter au tableau de bord RH pour approuver ou refuser cette demande.</p>
      `,
    });
  }
}
