import { Component, inject } from '@angular/core';
import { EntityCrudComponent } from '../../shared/entity-crud.component';
import { CrudColumn, CrudField } from '../../shared/crud-types';
import { UserDataService } from '../../services/user-data.service';

@Component({
  selector: 'app-users-admin',
  imports: [EntityCrudComponent],
  template: `
    <app-entity-crud
      title="Usuarios"
      subtitle="Usuarios del sistema asociados a las reservas."
      icon="manage_accounts"
      entityName="usuario"
      addLabel="Nuevo usuario"
      [columns]="columns"
      [fields]="fields"
      [service]="service"
      idKey="idUser"
      [searchKeys]="['nameUser']"
      searchPlaceholder="Buscar usuario..."
      emptyTitle="Todavía no hay usuarios"
      emptyText="Crea al menos un usuario para poder registrar reservas."
    ></app-entity-crud>
  `,
})
export class UsersAdminComponent {
  protected readonly service = inject(UserDataService);

  protected readonly columns: CrudColumn[] = [
    { key: 'idUser', label: 'ID' },
    { key: 'nameUser', label: 'Usuario' },
    { key: 'enabled', label: 'Estado', type: 'boolean' },
  ];

  protected readonly fields: CrudField[] = [
    {
      key: 'nameUser',
      label: 'Nombre de usuario',
      required: true,
      minLength: 3,
      maxLength: 50,
      autocomplete: 'username',
    },
    {
      key: 'passwordUser',
      label: 'Contraseña',
      type: 'password',
      required: true,
      minLength: 4,
      maxLength: 255,
      autocomplete: 'new-password',
      hint: 'En este proyecto académico se almacena tal como la escribes.',
    },
    {
      key: 'enabled',
      label: 'Usuario activo',
      type: 'checkbox',
    },
  ];
}
