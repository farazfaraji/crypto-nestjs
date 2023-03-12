import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bullmq';
import { EmailData } from './Types/email-data.type';
import { EmailService } from './email.service';

@Processor('send-mail')
export class WorkerService {
  constructor(private readonly emailService: EmailService) {}

  @Process('user-data')
  async processUserData(job: Job<EmailData>) {
    await this.emailService.send(job.data.email, job.data.data);
  }
}
