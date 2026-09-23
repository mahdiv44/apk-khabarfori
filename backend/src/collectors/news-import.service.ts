import { Injectable } from '@nestjs/common';
import { Db } from '../db';


@Injectable()
export class NewsImportService {


  constructor(
    private db: Db
  ){}



  async exists(title:string){

    const row =
      await this.db.news.findFirst({
        where:{
          title
        },
        select:{
          id:true
        }
      });


    return !!row;

  }



  async importNews(data:any){


    if(!data.title){
      return null;
    }



    if(await this.exists(data.title)){

      return {
        skipped:true,
        reason:'duplicate'
      };

    }



    const category =
      await this.db.category.findFirst({

        where:{
          name:
          data.category || 'جامعه'
        }

      });



    if(!category){

      throw new Error(
        'Category not found'
      );

    }



    const author =
      await this.db.user.findFirst({

        orderBy:{
          createdAt:'asc'
        }

      });



    if(!author){

      throw new Error(
        'No user available'
      );

    }




    const news =
      await this.db.news.create({

        data:{


          title:
            data.title.substring(0,200),


          description:
            (data.description || data.title)
            .substring(0,500),


          content:
            data.content || data.description || data.title,


          coverImage:
            data.image || null,


          categoryId:
            category.id,


          authorId:
            author.id,


          status:
            'PUBLISHED',


          publishedAt:
            new Date()


        }

      });



    return news;


  }


}
