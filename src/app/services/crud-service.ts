import { inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

/**
 * Servicio base para los CRUD del backend TourApp.
 * Mantiene una copia reactiva (signals) de la última lista consultada,
 * siguiendo el patrón usado en el curso (services + signals + HttpClient).
 */
export abstract class CrudService<T> {
  protected readonly http = inject(HttpClient);
  protected abstract readonly url: string;

  private readonly _items = signal<T[]>([]);
  private readonly _message = signal('');

  readonly $itemsChange = this._items.asReadonly();
  readonly $messageChange = this._message.asReadonly();

  findAll(): Observable<T[]> {
    return this.http.get<T[]>(this.url).pipe(tap((data) => this._items.set(data)));
  }

  findById(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  save(item: T): Observable<unknown> {
    return this.http.post(this.url, item);
  }

  update(id: number, item: T): Observable<unknown> {
    return this.http.put(`${this.url}/${id}`, item);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.url}/${id}`);
  }

  setItemsChange(data: T[]): void {
    this._items.set(data);
  }

  setMessageChange(message: string): void {
    this._message.set(message);
  }
}
