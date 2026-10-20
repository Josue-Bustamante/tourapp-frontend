import { Component, inject } from '@angular/core';
import { EntityCrudComponent } from '../../shared/entity-crud.component';
import { CrudColumn, CrudField } from '../../shared/crud-types';
import { DriverService } from '../../services/driver.service';

@Component({
  selector: 'app-drivers-admin',
  imports: [EntityCrudComponent],
  template: `
    <app-entity-crud
      title="Conductores"
      subtitle="El equipo que lleva a los viajeros con seguridad."
      icon="directions_bus"
      entityName="conductor"
      addLabel="Nuevo conductor"
      [columns]="columns"
      [fields]="fields"
      [service]="service"
      idKey="idDriver"
      [searchKeys]="['firstName', 'lastName', 'dni', 'numLicense']"
      searchPlaceholder="Buscar conductor..."
      emptyTitle="Todavía no hay conductores"
      emptyText="Registra a los conductores para asignarlos a los viajes."
    ></app-entity-crud>
  `,
})
export class DriversAdminComponent {
  protected readonly service = inject(DriverService);

  protected readonly columns: CrudColumn[] = [
    { key: 'idDriver', label: 'ID' },
    {
      key: 'fullName',
      label: 'Conductor',
      value: (row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'dni', label: 'DNI' },
    { key: 'numLicense', label: 'Licencia' },
    { key: 'phoneDriver', label: 'Teléfono' },
  ];

  protected readonly fields: CrudField[] = [
    { key: 'firstName', label: 'Nombres', required: true, minLength: 3, maxLength: 100 },
    { key: 'lastName', label: 'Apellidos', required: true, minLength: 3, maxLength: 100 },
    {
      key: 'dni',
      label: 'DNI',
      required: true,
      minLength: 8,
      maxLength: 8,
      pattern: '^[0-9]+$',
      patternMessage: 'El DNI debe tener solo números',
    },
    { key: 'numLicense', label: 'Número de licencia', required: true, maxLength: 20 },
    {
      key: 'phoneDriver',
      label: 'Teléfono',
      required: true,
      maxLength: 15,
      pattern: '^[0-9+\\s-]{6,15}$',
      patternMessage: 'Ingresa un teléfono válido',
    },
  ];
}
