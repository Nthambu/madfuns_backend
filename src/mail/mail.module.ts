import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Global()   // no need to import MailModule in each feature module
@Module({
  providers: [MailService],
  exports:   [MailService],
})
export class MailModule {}
