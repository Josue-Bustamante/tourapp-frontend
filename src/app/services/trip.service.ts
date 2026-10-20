import { Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Trip } from '../models/trip';
import { CrudService } from './crud-service';

@Service()
export class TripService extends CrudService<Trip> {
  protected readonly url = `${environment.HOST}/v1/trips`;
}
