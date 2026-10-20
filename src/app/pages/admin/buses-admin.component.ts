import { Component, inject } from '@angular/core';
import { EntityCrudComponent } from '../../shared/entity-crud.component';
import { CrudColumn, CrudField } from '../../shared/crud-types';
import { BusService } from '../../services/bus.service';

@Component({
  selector: 'app-buses-admin',
  imports: [EntityCrudComponent],
  template: `
    <app-entity-crud
      title="Buses"
      subtitle="La flota que transporta a los viajeros en cada salida."
      icon="airport_shuttle"
      entityName="bus"
      addLabel="Nuevo bus"
      [columns]="columns"
      [fields]="fields"
      [service]="service"
      idKey="idBus"
      [searchKeys]="['plate', 'brand', 'model']"
      searchPlaceholder="Buscar por placa, marca o modelo..."
      emptyTitle="Todavía no hay buses"
      emptyText="Registra la flota para poder asignar buses a los viajes."
      [toPayload]="toPayload"
    ></app-entity-crud>
  `,
})
export class BusesAdminComponent {
  protected readonly service = inject(BusService);

  protected readonly columns: CrudColumn[] = [
    { key: 'idBus', label: 'ID' },
    { key: 'plate', label: 'Placa' },
    { key: 'brand', label: 'Marca' },
    { key: 'model', label: 'Modelo' },
    { key: 'capacity', label: 'Capacidad', type: 'number' },
  ];

  protected readonly fields: CrudField[] = [
    {
      key: 'plate',
      label: 'Placa',
      required: true,
      maxLength: 8,
      placeholder: 'Ej. ABC-123',
    },
    { key: 'brand', label: 'Marca', required: true, maxLength: 50 },
    { key: 'model', label: 'Modelo', required: true, maxLength: 50 },
    {
      key: 'capacity',
      label: 'Capacidad de pasajeros',
      type: 'number',
      required: true,
      min: 1,
      max: 100,
    },
  ];

  protected readonly toPayload = (value: Record<string, any>) => ({
    ...value,
    capacity: Number(value['capacity']),
  });
}
