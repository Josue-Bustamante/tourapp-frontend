import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { EntityCrudComponent } from '../../shared/entity-crud.component';
import { CrudColumn, CrudField, CrudOption } from '../../shared/crud-types';
import { TourService } from '../../services/tour.service';
import { PlaceService } from '../../services/place.service';

@Component({
  selector: 'app-tours-admin',
  imports: [EntityCrudComponent],
  template: `
    <app-entity-crud
      title="Tours"
      subtitle="Crea y edita las experiencias que se muestran en el sitio."
      icon="travel_explore"
      entityName="tour"
      addLabel="Nuevo tour"
      [columns]="columns"
      [fields]="fields()"
      [service]="service"
      idKey="idTour"
      [searchKeys]="['nameTour', 'description']"
      searchPlaceholder="Buscar tour..."
      emptyTitle="Todavía no hay tours"
      emptyText="Crea tu primera experiencia y aparecerá automáticamente en el catálogo público."
      [toPayload]="toPayload"
    ></app-entity-crud>
  `,
})
export class ToursAdminComponent {
  protected readonly service = inject(TourService);
  private readonly placeService = inject(PlaceService);

  private readonly placeOptions = toSignal(
    this.placeService.findAll().pipe(
      map((places) =>
        places.map((place): CrudOption => ({
          value: place.idPlace ?? 0,
          label: place.namePlace,
        })),
      ),
      catchError(() => of([] as CrudOption[])),
    ),
    { initialValue: [] as CrudOption[] },
  );

  protected readonly columns: CrudColumn[] = [
    { key: 'idTour', label: 'ID' },
    { key: 'nameTour', label: 'Tour' },
    { key: 'description', label: 'Descripción', type: 'truncate' },
    { key: 'basePrice', label: 'Precio base', type: 'currency' },
    { key: 'durationHours', label: 'Duración', type: 'text' },
    {
      key: 'places',
      label: 'Lugares',
      type: 'chips',
      chipLabel: (place) => place?.namePlace ?? '',
    },
  ];

  protected readonly fields = computed<CrudField[]>(() => [
    {
      key: 'nameTour',
      label: 'Nombre del tour',
      required: true,
      minLength: 3,
      maxLength: 100,
      placeholder: 'Ej. Machu Picchu Esencial',
      wide: true,
    },
    {
      key: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: true,
      maxLength: 100,
      placeholder: 'Describe la experiencia en una frase',
      wide: true,
    },
    {
      key: 'basePrice',
      label: 'Precio base (S/)',
      type: 'number',
      required: true,
      min: 0,
      step: 0.01,
    },
    {
      key: 'durationHours',
      label: 'Duración (horas)',
      type: 'number',
      required: true,
      min: 0.1,
      step: 0.5,
    },
    {
      key: 'places',
      label: 'Lugares incluidos',
      type: 'select',
      multiple: true,
      optionValueKey: 'idPlace',
      options: this.placeOptions(),
      wide: true,
      hint: 'Selecciona uno o varios lugares del itinerario.',
    },
  ]);

  protected readonly toPayload = (value: Record<string, any>) => ({
    ...value,
    basePrice: Number(value['basePrice']),
    durationHours: Number(value['durationHours']),
    places: ((value['places'] as number[]) ?? []).map((idPlace) => ({ idPlace: Number(idPlace) })),
  });
}
