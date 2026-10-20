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
import { Booking } from '../../models/booking';
import { Client } from '../../models/client';
import { Trip } from '../../models/trip';
import { Tour } from '../../models/tour';
import { UserData } from '../../models/user-data';
import { BookingService } from '../../services/booking.service';
import { ClientService } from '../../services/client.service';
import { TripService } from '../../services/trip.service';
import { TourService } from '../../services/tour.service';
import { UserDataService } from '../../services/user-data.service';
import { CrudDialogData, CrudField, CrudOption } from '../../shared/crud-types';
import { FormDialogComponent } from '../../shared/form-dialog.component';
import { FechaHoraPipe, MoneyPipe } from '../../pipes';

@Component({
  selector: 'app-bookings-admin',
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
    FechaHoraPipe,
    MoneyPipe,
  ],
  templateUrl: './bookings-admin.component.html',
  styleUrl: './admin-table.css',
})
export class BookingsAdminComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly clientService = inject(ClientService);
  private readonly tripService = inject(TripService);
  private readonly tourService = inject(TourService);
  private readonly userService = inject(UserDataService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly rows = signal<Booking[]>([]);
  protected readonly clients = signal<Client[]>([]);
  protected readonly trips = signal<Trip[]>([]);
  protected readonly tours = signal<Tour[]>([]);
  protected readonly users = signal<UserData[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly filter = signal('');

  protected readonly displayedColumns = [
    'idBooking',
    'client',
    'trip',
    'dateTime',
    'totalPrice',
    'actions',
  ];

  protected readonly paginator = viewChild(MatPaginator);
  protected readonly sort = viewChild(MatSort);
  protected readonly dataSource = new MatTableDataSource<Booking>([]);

  protected readonly filteredRows = computed(() => {
    const query = this.filter().trim().toLowerCase();
    if (!query) return this.rows();

    return this.rows().filter((booking) =>
      [
        this.clientName(booking.idClient),
        this.tripLabel(booking.idTrip),
        this.userName(booking.idUser),
        booking.dateTime,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  });

  protected readonly fields = computed<CrudField[]>(() => [
    {
      key: 'dateTime',
      label: 'Fecha y hora de la reserva',
      type: 'datetime',
      required: true,
    },
    {
      key: 'totalPrice',
      label: 'Precio total (S/)',
      type: 'number',
      required: true,
      min: 0,
      step: 0.01,
    },
    {
      key: 'idClient',
      label: 'Cliente',
      type: 'select',
      required: true,
      options: this.clients().map((client): CrudOption => ({
        value: client.idClient ?? 0,
        label: `${client.firstName} ${client.lastName} · ${client.dni}`,
      })),
      wide: true,
    },
    {
      key: 'idUser',
      label: 'Usuario',
      type: 'select',
      required: true,
      options: this.users().map((user): CrudOption => ({
        value: user.idUser ?? 0,
        label: user.nameUser,
      })),
    },
    {
      key: 'idTrip',
      label: 'Viaje',
      type: 'select',
      required: true,
      options: this.trips().map((trip): CrudOption => ({
        value: trip.idTrip ?? 0,
        label: `${this.tourName(trip.idTour)} · ${trip.tripDate} ${trip.departureTime?.slice(0, 5)}`,
      })),
      wide: true,
      hint: 'El precio total no se calcula automáticamente; ingrésalo según la tarifa acordada.',
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
      bookings: this.bookingService.findAll(),
      clients: this.clientService.findAll().pipe(catchError(() => of([]))),
      trips: this.tripService.findAll().pipe(catchError(() => of([]))),
      tours: this.tourService.findAll().pipe(catchError(() => of([]))),
      users: this.userService.findAll().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ bookings, clients, trips, tours, users }) => {
        this.rows.set(bookings);
        this.clients.set(clients);
        this.trips.set(trips);
        this.tours.set(tours);
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.rows.set([]);
        this.loading.set(false);
        this.error.set(
          'No se pudieron cargar las reservas. Verifica que Spring Boot esté disponible y que la API responda correctamente.',
        );
      },
    });
  }

  protected loadBookings(): void {
    this.bookingService.findAll().subscribe({
      next: (bookings) => this.rows.set(bookings),
      error: () =>
        this.snackBar.open('No se pudieron actualizar las reservas.', 'Cerrar', { duration: 3500 }),
    });
  }

  protected applyFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  protected clearFilter(): void {
    this.filter.set('');
  }

  protected clientName(id: number): string {
    const client = this.clients().find((item) => item.idClient === id);
    return client ? `${client.firstName} ${client.lastName}` : `Cliente #${id}`;
  }

  protected clientDni(id: number): string {
    return this.clients().find((item) => item.idClient === id)?.dni ?? '';
  }

  protected userName(id: number): string {
    return this.users().find((item) => item.idUser === id)?.nameUser ?? `Usuario #${id}`;
  }

  protected tourName(id: number): string {
    return this.tours().find((item) => item.idTour === id)?.nameTour ?? `Tour #${id}`;
  }

  protected tripLabel(id: number): string {
    const trip = this.trips().find((item) => item.idTrip === id);
    if (!trip) return `Viaje #${id}`;
    return `${this.tourName(trip.idTour)} · ${trip.tripDate} ${trip.departureTime?.slice(0, 5)}`;
  }

  protected openCreate(): void {
    this.openDialog(undefined, false);
  }

  protected openEdit(row: Booking): void {
    this.openDialog(row, true);
  }

  private openDialog(row: Booking | undefined, isEdit: boolean): void {
    const data: CrudDialogData = {
      title: isEdit ? 'Editar reserva' : 'Nueva reserva',
      subtitle: isEdit
        ? 'Actualiza los datos de la reserva.'
        : 'Registra una reserva asociada a un cliente, un viaje y un usuario.',
      fields: this.fields(),
      row: row as Record<string, any> | undefined,
      isEdit,
    };

    this.dialog
      .open(FormDialogComponent, { data, width: '680px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((value) => {
        if (!value) return;

        let dateTime = String(value['dateTime']);
        if (dateTime.length === 16) dateTime = `${dateTime}:00`;

        const payload = {
          ...value,
          dateTime,
          totalPrice: Number(value['totalPrice']),
          idClient: Number(value['idClient']),
          idUser: Number(value['idUser']),
          idTrip: Number(value['idTrip']),
        };

        const request =
          isEdit && row?.idBooking
            ? this.bookingService.update(row.idBooking, payload as Booking)
            : this.bookingService.save(payload as Booking);

        request.subscribe({
          next: () => {
            this.snackBar.open(isEdit ? 'Reserva actualizada' : 'Reserva creada', 'OK', {
              duration: 2500,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.loadBookings();
          },
          error: () =>
            this.snackBar.open(
              'No se pudo guardar la reserva. Revisa los datos y relaciones.',
              'Cerrar',
              {
                duration: 4500,
                horizontalPosition: 'right',
                verticalPosition: 'top',
              },
            ),
        });
      });
  }

  protected remove(row: Booking): void {
    if (!row.idBooking) return;
    const confirmed = window.confirm('¿Eliminar esta reserva? Esta acción no se puede deshacer.');
    if (!confirmed) return;

    this.bookingService.delete(row.idBooking).subscribe({
      next: () => {
        this.snackBar.open('Reserva eliminada', 'OK', { duration: 2400 });
        this.loadBookings();
      },
      error: () =>
        this.snackBar.open('No se pudo eliminar la reserva.', 'Cerrar', { duration: 4000 }),
    });
  }
}
