import { Component, inject } from '@angular/core';
import { EntityCrudComponent } from '../../shared/entity-crud.component';
import { CrudColumn, CrudField } from '../../shared/crud-types';
import { GuideService } from '../../services/guide.service';

@Component({
  selector: 'app-guides-admin',
  imports: [EntityCrudComponent],
  template: `
    <app-entity-crud
      title="Guías"
      subtitle="Las personas que cuentan las historias del camino."
      icon="badge"
      entityName="guía"
      addLabel="Nuevo guía"
      [columns]="columns"
      [fields]="fields"
      [service]="service"
      idKey="idGuide"
      [searchKeys]="['firstName', 'lastName', 'dni', 'miceturCard']"
      searchPlaceholder="Buscar guía..."
      emptyTitle="Todavía no hay guías"
      emptyText="Registra a los guías para asignarlos a los viajes."
    ></app-entity-crud>
  `,
})
export class GuidesAdminComponent {
  protected readonly service = inject(GuideService);

  protected readonly columns: CrudColumn[] = [
    { key: 'idGuide', label: 'ID' },
    {
      key: 'fullName',
      label: 'Guía',
      value: (row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'dni', label: 'DNI' },
    { key: 'phoneGuide', label: 'Teléfono' },
    { key: 'miceturCard', label: 'Credencial MICETUR' },
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
    {
      key: 'phoneGuide',
      label: 'Teléfono',
      required: true,
      maxLength: 15,
      pattern: '^[0-9+\\s-]{6,15}$',
      patternMessage: 'Ingresa un teléfono válido',
    },
    { key: 'miceturCard', label: 'Credencial MICETUR', required: true, maxLength: 20 },
  ];
}
