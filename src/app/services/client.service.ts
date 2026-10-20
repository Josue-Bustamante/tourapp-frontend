import { Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { Client } from '../models/client';
import { CrudService } from './crud-service';

@Service()
export class ClientService extends CrudService<Client> {
  protected readonly url = `${environment.HOST}/v1/clients`;
}
