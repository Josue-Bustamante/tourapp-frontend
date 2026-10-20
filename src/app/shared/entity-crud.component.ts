import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CrudColumn, CrudColumnType, CrudDialogData, CrudField } from './crud-types';
import { FormDialogComponent } from './form-dialog.component';
import { CrudService } from '../services/crud-service';
import { FechaHoraPipe, FechaPipe, HoraPipe, MoneyPipe } from '../pipes';

@Component({
  selector: 'app-entity-crud',
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    MatTooltipModule,
    MoneyPipe,
    FechaPipe,
    HoraPipe,
    FechaHoraPipe,
  ],
  templateUrl: './entity-crud.component.html',
  styleUrl: './entity-crud.component.css',
})
export class EntityCrudComponent implements OnInit {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly icon = input('table_view');
  readonly entityName = input('registro');
  readonly columns = input.required<CrudColumn[]>();
  readonly fields = input.required<CrudField[]>();
  readonly service = input.required<CrudService<any>>();
  readonly idKey = input.required<string>();
  readonly searchKeys = input<string[]>([]);
  readonly searchPlaceholder = input('Buscar...');
  readonly addLabel = input('Nuevo registro');
  readonly emptyTitle = input('Aún no hay registros');
  readonly emptyText = input('Crea el primer registro con el botón de arriba.');
  readonly toPayload = input<((value: Record<string, any>, isEdit: boolean) => unknown) | null>(
    null,
  );

  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly rows = signal<any[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly filter = signal('');

  protected readonly paginator = viewChild(MatPaginator);
  protected readonly sort = viewChild(MatSort);

  protected readonly dataSource = new MatTableDataSource<any>([]);

  protected readonly filteredRows = computed(() => {
    const query = this.filter().trim().toLowerCase();
    if (!query) return this.rows();

    const keys = this.searchKeys();
    return this.rows().filter((row) => {
      if (keys.length) {
        return keys.some((key) =>
          String(row?.[key] ?? '')
            .toLowerCase()
            .includes(query),
        );
      }

      return Object.entries(row ?? {})
        .filter(([key]) => !key.toLowerCase().includes('password'))
        .some(([, value]) => {
          const text = value !== null && typeof value === 'object' ? JSON.stringify(value) : value;
          return String(text ?? '')
            .toLowerCase()
            .includes(query);
        });
    });
  });

  protected readonly displayedColumns = computed(() => [
    ...this.columns().map((column) => column.key),
    'actions',
  ]);

  constructor() {
    effect(() => {
      this.dataSource.data = this.filteredRows();
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });
  }

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service()
      .findAll()
      .subscribe({
        next: (data) => {
          this.rows.set(this.sortById(data));
          this.loading.set(false);
        },
        error: () => {
          this.rows.set([]);
          this.loading.set(false);
          this.error.set(
            'No se pudieron cargar los datos. Verifica que Spring Boot esté disponible y que la API responda correctamente.',
          );
        },
      });
  }

  private sortById(data: any[]): any[] {
    const key = this.idKey();
    return [...data].sort((a, b) => Number(a?.[key] ?? 0) - Number(b?.[key] ?? 0));
  }

  protected applyFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  protected clearFilter(): void {
    this.filter.set('');
  }

  protected valueOf(column: CrudColumn, row: any): any {
    return column.value ? column.value(row) : row?.[column.key];
  }

  protected asArray(value: unknown): any[] {
    return Array.isArray(value) ? value : value === null || value === undefined ? [] : [value];
  }

  protected chipText(column: CrudColumn, item: any): string {
    if (column.chipLabel) return column.chipLabel(item);
    if (item !== null && typeof item === 'object') {
      return item.namePlace ?? item.name ?? item.label ?? JSON.stringify(item);
    }
    return String(item);
  }

  protected isDisabledSort(column: CrudColumn): boolean {
    return column.type === 'chips' || column.type === 'boolean' || Boolean(column.value);
  }

  protected isColumnType(column: CrudColumn, type: CrudColumnType): boolean {
    return (column.type ?? 'text') === type;
  }

  protected openCreate(): void {
    this.openDialog(undefined, false);
  }

  protected openEdit(row: any): void {
    this.openDialog(row, true);
  }

  private openDialog(row: any | undefined, isEdit: boolean): void {
    const data: CrudDialogData = {
      title: isEdit ? `Editar ${this.entityName()}` : `Nuevo ${this.entityName()}`,
      subtitle: isEdit
        ? 'Actualiza la información y guarda los cambios.'
        : 'Completa la información para registrar un nuevo elemento.',
      fields: this.fields(),
      row,
      isEdit,
    };

    this.dialog
      .open(FormDialogComponent, {
        data,
        width: '680px',
        maxWidth: '94vw',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      })
      .afterClosed()
      .subscribe((value) => {
        if (!value) return;

        const transform = this.toPayload();
        const payload = transform ? transform(value, isEdit) : value;
        const id = row?.[this.idKey()];

        const request =
          isEdit && id !== undefined
            ? this.service().update(Number(id), payload as any)
            : this.service().save(payload as any);

        request.subscribe({
          next: () => {
            this.snackBar.open(
              isEdit ? 'Registro actualizado correctamente' : 'Registro creado correctamente',
              'OK',
              { duration: 2600, horizontalPosition: 'right', verticalPosition: 'top' },
            );
            this.load();
          },
          error: () => {
            this.snackBar.open(
              'No se pudo guardar. Revisa los datos y vuelve a intentarlo.',
              'Cerrar',
              { duration: 4200, horizontalPosition: 'right', verticalPosition: 'top' },
            );
          },
        });
      });
  }

  protected remove(row: any): void {
    const label =
      row?.nameTour ?? row?.namePlace ?? row?.nameUser ?? row?.firstName ?? 'este registro';
    const confirmed = window.confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    this.service()
      .delete(Number(row[this.idKey()]))
      .subscribe({
        next: () => {
          this.snackBar.open('Registro eliminado', 'OK', {
            duration: 2400,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this.load();
        },
        error: () => {
          this.snackBar.open('No se pudo eliminar. Puede tener registros relacionados.', 'Cerrar', {
            duration: 4200,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        },
      });
  }
}
