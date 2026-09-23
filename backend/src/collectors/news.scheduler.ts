import { Injectable, Logger } from '@nestjs/common';
import { WebsiteCollector } from './website.collector';
import { TelegramCollector } from './telegram.collector';
import { NewsImportService } from './news-import.service';


@Injectable()
export class NewsScheduler {

  private logger = new Logger('NewsScheduler');


  constructor(
    private website: WebsiteCollector,
    private telegram: TelegramCollector,
    private importer: NewsImportService,
  ){}


  async run(){

    this.logger.log('Starting news collection');


    const websiteNews =
      await this.website.collect();


    const telegramNews =
      await this.telegram.collect();


    const items=[
      ...websiteNews,
      ...telegramNews
    ];


    for(const item of items){

      try{

        await this.importer.importNews(item);

      }catch(e:any){

        this.logger.error(
          e.message
        );

      }

    }


    this.logger.log(
      `Imported ${items.length} news`
    );

  }


}
