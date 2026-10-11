import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryService {

  classify(title:string, text:string='') {

    const value = `${title} ${text}`.toLowerCase();


    if(value.includes('دلار') ||
       value.includes('بورس') ||
       value.includes('اقتصاد')) {
      return 'اقتصادی';
    }


    if(value.includes('فوتبال') ||
       value.includes('ورزش')) {
      return 'ورزشی';
    }


    if(value.includes('دولت') ||
       value.includes('مجلس')) {
      return 'سیاسی';
    }


    return 'جامعه';
  }

}
