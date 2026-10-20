import { Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Booking } from '../models/booking';
import { CrudService } from './crud-service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';

@Service()
export class BookingService extends CrudService<Booking> {
  protected readonly url = `${environment.HOST}/v1/bookings`;
  private readonly httpClient = inject(HttpClient);

  /** Permite leer la cabecera Location con el id de la reserva creada. */
  saveWithLocation(booking: Booking): Observable<HttpResponse<unknown>> {
    return this.httpClient.post(this.url, booking, { observe: 'response' });
  }
}
