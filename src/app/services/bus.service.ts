import { Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Bus } from '../models/bus';
import { CrudService } from './crud-service';

@Service()
export class BusService extends CrudService<Bus> {
  protected readonly url = `${environment.HOST}/v1/buses`;
}
