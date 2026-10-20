import { Component, inject } from '@angular/core';
import { EntityCrudComponent } from '../../shared/entity-crud.component';
import { CrudColumn, CrudField } from '../../shared/crud-types';
import { PlaceService } from '../../services/place.service';

@Component({
  selector: 'app-places-admin',
  imports: [EntityCrudComponent],
  template: `
    <app-entity-crud
      title="Lugares"
      subtitle="Los destinos y paradas que forman parte de tus tours."
      icon="location_on"
      entityName="lugar"
      addLabel="Nuevo lugar"
      [columns]="columns"
      [fields]="fields"
      [service]="service"
      idKey="idPlace"
      [searchKeys]="['namePlace']"
      searchPlaceholder="Buscar lugar..."
      emptyTitle="Todavía no hay lugares"
      emptyText="Registra los destinos y luego asígnalos a un tour."
      [toPayload]="toPayload"
    ></app-entity-crud>
  `,
})
export class PlacesAdminComponent {
  protected readonly service = inject(PlaceService);

  protected readonly columns: CrudColumn[] = [
    { key: 'idPlace', label: 'ID' },
    { key: 'namePlace', label: 'Lugar' },
    { key: 'entryFee', label: 'Tarifa de entrada', type: 'currency' },
  ];

  protected readonly fields: CrudField[] = [
    {
      key: 'namePlace',
      label: 'Nombre del lugar',
      required: true,
      minLength: 3,
      maxLength: 100,
      placeholder: 'Ej. Valle Sagrado',
      wide: true,
    },
    {
      key: 'entryFee',
      label: 'Tarifa de entrada (S/)',
      type: 'number',
      required: true,
      min: 0,
      step: 0.01,
    },
  ];

  protected readonly toPayload = (value: Record<string, any>) => ({
    ...value,
    entryFee: Number(value['entryFee']),
  });
}
