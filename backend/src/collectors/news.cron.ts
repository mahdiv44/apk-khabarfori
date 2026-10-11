import {Injectable,Logger,OnModuleInit,OnModuleDestroy} from '@nestjs/common';
import {NewsScheduler} from './news.scheduler';
@Injectable()
export class NewsCron implements OnModuleInit,OnModuleDestroy {
 private timer?:ReturnType<typeof setInterval>;
 private logger=new Logger('NewsCron');
 constructor(private scheduler:NewsScheduler){}
 private async run(){try{await this.scheduler.run()}catch{this.logger.error('News synchronization failed')}}
 onModuleInit(){void this.run();this.timer=setInterval(()=>void this.run(),300000)}
 onModuleDestroy(){if(this.timer)clearInterval(this.timer)}
}
