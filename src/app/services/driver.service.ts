import { Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Driver } from '../models/driver';
import { CrudService } from './crud-service';

@Service()
export class DriverService extends CrudService<Driver> {
  protected readonly url = `${environment.HOST}/v1/drivers`;
}
