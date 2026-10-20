import { Service } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Place } from '../models/place';
import { CrudService } from './crud-service';

@Service()
export class PlaceService extends CrudService<Place> {
  protected readonly url = `${environment.HOST}/v1/places`;
}
