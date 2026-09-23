import { Injectable } from '@nestjs/common';
import {createHash} from 'crypto';


@Injectable()
export class DuplicateService {


  hash(title:string){

    return createHash('sha256')
      .update(title.trim())
      .digest('hex');

  }


}
