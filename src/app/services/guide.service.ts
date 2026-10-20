import { Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Guide } from '../models/guide';
import { CrudService } from './crud-service';

@Service()
export class GuideService extends CrudService<Guide> {
  protected readonly url = `${environment.HOST}/v1/guides`;
}
