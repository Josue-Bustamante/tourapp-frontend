import { Service, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tour } from '../models/tour';
import { DEMO_TOURS } from '../demo-data';
import { CrudService } from './crud-service';

@Service()
export class TourService extends CrudService<Tour> {
  protected readonly url = `${environment.HOST}/v1/tours`;

  private readonly _demoMode = signal(false);
  readonly $demoMode = this._demoMode.asReadonly();

  /**
   * Usado por las páginas públicas: si la API no responde o todavía no hay
   * tours publicados, muestra un catálogo de demostración para no dejar la
   * vista vacía. El panel administrativo siempre usa findAll().
   */
  findAllWithFallback(): Observable<Tour[]> {
    return super.findAll().pipe(
      map((data) => {
        if (data.length) {
          this._demoMode.set(false);
          return [...data].sort((a, b) => Number(a.idTour) - Number(b.idTour));
        }
        return this.useDemoTours();
      }),
      catchError(() => of(this.useDemoTours())),
    );
  }

  findByIdWithFallback(id: number): Observable<Tour | null> {
    if (id < 0) {
      return of(DEMO_TOURS.find((tour) => tour.idTour === id) ?? null);
    }

    return super.findById(id).pipe(
      map((tour) => tour ?? null),
      catchError(() => of(null)),
    );
  }

  private useDemoTours(): Tour[] {
    this._demoMode.set(true);
    const tours = DEMO_TOURS.map((tour) => ({ ...tour, demo: true }));
    this.setItemsChange(tours);
    return tours;
  }
}
