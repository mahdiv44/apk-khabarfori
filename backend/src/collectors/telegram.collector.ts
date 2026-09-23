import { Injectable } from '@nestjs/common';
import { Db } from '../db';


@Injectable()
export class TelegramCollector {


  constructor(
    private db: Db
  ){}



  async collect(){

    const row =
      await this.db.setting.findUnique({
        where:{
          key:'telegram:akhbarefori'
        }
      });



    if(!row){
      return [];
    }



    const data:any = row.value;



    if(!data.items){
      return [];
    }



    return data.items.map((item:any)=>({

      title:
        item.title ||
        item.text?.slice(0,200) ||
        item.excerpt?.slice(0,200) ||
       'خبر فوری',


      description:
       item.text ||
       item.excerpt || 
       item.title ||
        '',


      content:
        item.text ||
        item.excerpt ||
        item.title ||
        '',


      image:
        item.image ||
        null,


      category:
        'جامعه'

    }));


  }


}
