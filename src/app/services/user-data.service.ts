import { Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserData } from '../models/user-data';
import { CrudService } from './crud-service';

@Service()
export class UserDataService extends CrudService<UserData> {
  protected readonly url = `${environment.HOST}/v1/userdata`;
}
