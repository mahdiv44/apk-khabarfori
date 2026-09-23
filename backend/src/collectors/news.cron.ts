import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NewsScheduler } from './news.scheduler';


@Injectable()
export class NewsCron implements OnModuleInit {

  private logger = new Logger('NewsCron');


  constructor(
    private scheduler: NewsScheduler
  ){}


  onModuleInit(){

    this.logger.log('News collector started');


    setInterval(async()=>{

      try{

        await this.scheduler.run();

        this.logger.log('News sync completed');

      }catch(e:any){

        this.logger.error(e.message);

      }


    },300000);

  }

}
