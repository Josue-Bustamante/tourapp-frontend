import { Component, inject } from '@angular/core';
import { EntityCrudComponent } from '../../shared/entity-crud.component';
import { CrudColumn, CrudField } from '../../shared/crud-types';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-clients-admin',
  imports: [EntityCrudComponent],
  template: `
    <app-entity-crud
      title="Clientes"
      subtitle="Las personas que viajan con TourApp."
      icon="groups"
      entityName="cliente"
      addLabel="Nuevo cliente"
      [columns]="columns"
      [fields]="fields"
      [service]="service"
      idKey="idClient"
      [searchKeys]="['firstName', 'lastName', 'dni', 'email']"
      searchPlaceholder="Buscar por nombre, DNI o correo..."
      emptyTitle="Todavía no hay clientes"
      emptyText="Los clientes también se crean automáticamente al completar una reserva."
    ></app-entity-crud>
  `,
})
export class ClientsAdminComponent {
  protected readonly service = inject(ClientService);

  protected readonly columns: CrudColumn[] = [
    { key: 'idClient', label: 'ID' },
    {
      key: 'fullName',
      label: 'Cliente',
      value: (row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'dni', label: 'DNI' },
    { key: 'email', label: 'Correo' },
    { key: 'phoneNumberClient', label: 'Teléfono' },
  ];

  protected readonly fields: CrudField[] = [
    {
      key: 'firstName',
      label: 'Nombres',
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    {
      key: 'lastName',
      label: 'Apellidos',
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    {
      key: 'dni',
      label: 'DNI o documento',
      required: true,
      minLength: 8,
      maxLength: 15,
      pattern: '^[0-9A-Za-z-]+$',
      patternMessage: 'Solo letras, números y guiones',
    },
    {
      key: 'email',
      label: 'Correo electrónico',
      type: 'email',
      required: true,
      maxLength: 150,
    },
    {
      key: 'phoneNumberClient',
      label: 'Teléfono',
      maxLength: 15,
      placeholder: 'Opcional',
    },
    {
      key: 'address',
      label: 'Dirección',
      maxLength: 200,
      placeholder: 'Opcional',
      wide: true,
    },
  ];
}
