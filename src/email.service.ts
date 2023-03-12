import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { CoinDetail } from './Types/coin-detail.type';
import { EmailServiceInterface } from './interfaces/email.service.interface';

@Injectable()
export class EmailService implements EmailServiceInterface {
  private transporter;

  constructor(configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('MAIL_SENDER_HOST'),
      port: configService.get<number>('MAIL_SENDER_PORT'),
      secure: true,
      auth: {
        user: configService.get('MAIL_SENDER_ADDRESS'),
        pass: configService.get('MAIL_SENDER_PASSWORD'),
      },
    });
  }

  async send(to: string, data: CoinDetail[]) {
    await this.transporter.sendMail({
      from: '"FirstCoinReminder" <info@first-coin-reminder.com>',
      to,
      subject: 'Latest update of crypto price',
      html: this.generateTemplate(data),
    });
  }

  private generateTemplate(data: CoinDetail[]): string {
    const tableRows = data.map(
      (item) =>
        `<tr><td>${item.currency}</td><td>${item.symbol}</td><td>${
          item.price
        }</td><td>${item.lastUpdate.toLocaleDateString()} ${item.lastUpdate.toLocaleTimeString()}</td></tr>`,
    );
    return `<table><thead><tr><th>Currency</th><th>Symbol</th><th>Price</th><th>Last Update</th></tr></thead><tbody>${tableRows.join(
      '',
    )}</tbody></table>`;
  }
}
