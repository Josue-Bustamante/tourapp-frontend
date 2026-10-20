import { Component, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
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
import { catchError, forkJoin, of } from 'rxjs';
import { Trip } from '../../models/trip';
import { Tour } from '../../models/tour';
import { Guide } from '../../models/guide';
import { Driver } from '../../models/driver';
import { Bus } from '../../models/bus';
import { TripService } from '../../services/trip.service';
import { TourService } from '../../services/tour.service';
import { GuideService } from '../../services/guide.service';
import { DriverService } from '../../services/driver.service';
import { BusService } from '../../services/bus.service';
import { CrudDialogData, CrudField, CrudOption } from '../../shared/crud-types';
import { FormDialogComponent } from '../../shared/form-dialog.component';
import { FechaPipe, HoraPipe } from '../../pipes';

@Component({
  selector: 'app-trips-admin',
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
    FechaPipe,
    HoraPipe,
  ],
  templateUrl: './trips-admin.component.html',
  styleUrl: './admin-table.css',
})
export class TripsAdminComponent implements OnInit {
  private readonly tripService = inject(TripService);
  private readonly tourService = inject(TourService);
  private readonly guideService = inject(GuideService);
  private readonly driverService = inject(DriverService);
  private readonly busService = inject(BusService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly rows = signal<Trip[]>([]);
  protected readonly tours = signal<Tour[]>([]);
  protected readonly guides = signal<Guide[]>([]);
  protected readonly drivers = signal<Driver[]>([]);
  protected readonly buses = signal<Bus[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly filter = signal('');

  protected readonly displayedColumns = [
    'idTrip',
    'tour',
    'tripDate',
    'departureTime',
    'guide',
    'driver',
    'bus',
    'actions',
  ];

  protected readonly paginator = viewChild(MatPaginator);
  protected readonly sort = viewChild(MatSort);
  protected readonly dataSource = new MatTableDataSource<Trip>([]);

  protected readonly filteredRows = computed(() => {
    const query = this.filter().trim().toLowerCase();
    if (!query) return this.rows();

    return this.rows().filter((trip) =>
      [
        this.tourName(trip.idTour),
        this.guideName(trip.idGuide),
        this.driverName(trip.idDriver),
        this.busLabel(trip.idBus),
        trip.tripDate,
        trip.departureTime,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  });

  protected readonly fields = computed<CrudField[]>(() => [
    {
      key: 'tripDate',
      label: 'Fecha del viaje',
      type: 'date',
      required: true,
    },
    {
      key: 'departureTime',
      label: 'Hora de salida',
      type: 'time',
      required: true,
    },
    {
      key: 'idTour',
      label: 'Tour',
      type: 'select',
      required: true,
      options: this.tours().map((tour): CrudOption => ({
        value: tour.idTour ?? 0,
        label: tour.nameTour,
      })),
      wide: true,
    },
    {
      key: 'idGuide',
      label: 'Guía',
      type: 'select',
      required: true,
      options: this.guides().map((guide): CrudOption => ({
        value: guide.idGuide ?? 0,
        label: `${guide.firstName} ${guide.lastName}`,
      })),
    },
    {
      key: 'idDriver',
      label: 'Conductor',
      type: 'select',
      required: true,
      options: this.drivers().map((driver): CrudOption => ({
        value: driver.idDriver ?? 0,
        label: `${driver.firstName} ${driver.lastName}`,
      })),
    },
    {
      key: 'idBus',
      label: 'Bus',
      type: 'select',
      required: true,
      options: this.buses().map((bus): CrudOption => ({
        value: bus.idBus ?? 0,
        label: `${bus.brand} ${bus.model} · ${bus.plate}`,
      })),
      wide: true,
    },
  ]);

  constructor() {
    effect(() => {
      this.dataSource.data = this.filteredRows();
      this.dataSource.paginator = this.paginator() ?? null;
      this.dataSource.sort = this.sort() ?? null;
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  protected loadAll(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      trips: this.tripService.findAll(),
      tours: this.tourService.findAll().pipe(catchError(() => of([]))),
      guides: this.guideService.findAll().pipe(catchError(() => of([]))),
      drivers: this.driverService.findAll().pipe(catchError(() => of([]))),
      buses: this.busService.findAll().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ trips, tours, guides, drivers, buses }) => {
        this.rows.set(trips);
        this.tours.set(tours);
        this.guides.set(guides);
        this.drivers.set(drivers);
        this.buses.set(buses);
        this.loading.set(false);
      },
      error: () => {
        this.rows.set([]);
        this.loading.set(false);
        this.error.set(
          'No se pudieron cargar los viajes. Verifica que Spring Boot esté disponible y que la API responda correctamente.',
        );
      },
    });
  }

  protected loadTrips(): void {
    this.tripService.findAll().subscribe({
      next: (trips) => this.rows.set(trips),
      error: () =>
        this.snackBar.open('No se pudieron actualizar los viajes.', 'Cerrar', { duration: 3500 }),
    });
  }

  protected applyFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  protected clearFilter(): void {
    this.filter.set('');
  }

  protected tourName(id: number): string {
    return this.tours().find((tour) => tour.idTour === id)?.nameTour ?? `Tour #${id}`;
  }

  protected guideName(id: number): string {
    const guide = this.guides().find((item) => item.idGuide === id);
    return guide ? `${guide.firstName} ${guide.lastName}` : `Guía #${id}`;
  }

  protected driverName(id: number): string {
    const driver = this.drivers().find((item) => item.idDriver === id);
    return driver ? `${driver.firstName} ${driver.lastName}` : `Conductor #${id}`;
  }

  protected busLabel(id: number): string {
    const bus = this.buses().find((item) => item.idBus === id);
    return bus ? `${bus.brand} ${bus.model} · ${bus.plate}` : `Bus #${id}`;
  }

  protected openCreate(): void {
    this.openDialog(undefined, false);
  }

  protected openEdit(row: Trip): void {
    this.openDialog(row, true);
  }

  private openDialog(row: Trip | undefined, isEdit: boolean): void {
    const data: CrudDialogData = {
      title: isEdit ? 'Editar viaje' : 'Nuevo viaje',
      subtitle: isEdit
        ? 'Actualiza la programación del viaje.'
        : 'Programa una salida y asigna tour, guía, conductor y bus.',
      fields: this.fields(),
      row: row as Record<string, any> | undefined,
      isEdit,
    };

    this.dialog
      .open(FormDialogComponent, { data, width: '680px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((value) => {
        if (!value) return;

        const payload = {
          ...value,
          idTour: Number(value['idTour']),
          idGuide: Number(value['idGuide']),
          idDriver: Number(value['idDriver']),
          idBus: Number(value['idBus']),
        };

        const request =
          isEdit && row?.idTrip
            ? this.tripService.update(row.idTrip, payload as Trip)
            : this.tripService.save(payload as Trip);

        request.subscribe({
          next: () => {
            this.snackBar.open(isEdit ? 'Viaje actualizado' : 'Viaje creado', 'OK', {
              duration: 2500,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.loadTrips();
          },
          error: () =>
            this.snackBar.open('No se pudo guardar el viaje. Revisa los datos.', 'Cerrar', {
              duration: 4200,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            }),
        });
      });
  }

  protected remove(row: Trip): void {
    if (!row.idTrip) return;
    const confirmed = window.confirm(
      '¿Eliminar este viaje? También podrían verse afectadas sus reservas.',
    );
    if (!confirmed) return;

    this.tripService.delete(row.idTrip).subscribe({
      next: () => {
        this.snackBar.open('Viaje eliminado', 'OK', { duration: 2400 });
        this.loadTrips();
      },
      error: () =>
        this.snackBar.open(
          'No se pudo eliminar el viaje. Puede tener reservas asociadas.',
          'Cerrar',
          {
            duration: 4200,
          },
        ),
    });
  }
}
