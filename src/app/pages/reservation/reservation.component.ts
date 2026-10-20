import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { Tour } from '../../models/tour';
import { Trip } from '../../models/trip';
import { Client } from '../../models/client';
import { UserData } from '../../models/user-data';
import { TourService } from '../../services/tour.service';
import { TripService } from '../../services/trip.service';
import { ClientService } from '../../services/client.service';
import { UserDataService } from '../../services/user-data.service';
import { BookingService } from '../../services/booking.service';
import { DEMO_TOURS, demoTripsFor } from '../../demo-data';
import { tourImage } from '../../tour-images';
import { DuracionPipe, FechaPipe, HoraPipe, MoneyPipe } from '../../pipes';

interface Confirmation {
  code: string;
  tourName: string;
  date: string;
  time: string;
  travelers: number;
  total: number;
  clientName: string;
  demo: boolean;
}

@Component({
  selector: 'app-reservation',
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    RouterLink,
    MoneyPipe,
    FechaPipe,
    HoraPipe,
    DuracionPipe,
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.css',
})
export class ReservationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tourService = inject(TourService);
  private readonly tripService = inject(TripService);
  private readonly clientService = inject(ClientService);
  private readonly userService = inject(UserDataService);
  private readonly bookingService = inject(BookingService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly tourId = Number(this.route.snapshot.paramMap.get('idTour'));
  private readonly tripParam = Number(this.route.snapshot.queryParamMap.get('trip'));
  private readonly travelersParam = Number(this.route.snapshot.queryParamMap.get('travelers'));

  protected readonly tour = signal<Tour | null>(null);
  protected readonly trips = signal<Trip[]>([]);
  protected readonly clients = signal<Client[]>([]);
  protected readonly users = signal<UserData[]>([]);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly notFound = signal(false);
  protected readonly confirmation = signal<Confirmation | null>(null);

  protected readonly form = new FormGroup({
    idTrip: new FormControl<number | null>(null, Validators.required),
    travelers: new FormControl<number>(1, [
      Validators.required,
      Validators.min(1),
      Validators.max(10),
    ]),
    mode: new FormControl<'existing' | 'new'>('new', { nonNullable: true }),
    idClient: new FormControl<number | null>(null),
    idUser: new FormControl<number | null>(null, Validators.required),
    firstName: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),
    lastName: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),
    dni: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(15),
      Validators.pattern('^[0-9A-Za-z-]+$'),
    ]),
    email: new FormControl<string>('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(150),
    ]),
    phoneNumberClient: new FormControl<string>('', [Validators.maxLength(15)]),
    address: new FormControl<string>('', [Validators.maxLength(200)]),
  });

  protected readonly image = computed(() => tourImage(this.tour()));
  protected readonly isDemo = computed(() => this.tour()?.demo === true);
  protected readonly selectedTrip = computed(
    () => this.trips().find((trip) => trip.idTrip === this.form.controls.idTrip.value) ?? null,
  );
  protected readonly selectedClient = computed(
    () =>
      this.clients().find((client) => client.idClient === this.form.controls.idClient.value) ??
      null,
  );
  protected readonly unitPrice = computed(() => Number(this.tour()?.basePrice ?? 0));
  protected readonly travelers = computed(() => Number(this.form.controls.travelers.value ?? 1));
  protected readonly total = computed(() => this.unitPrice() * this.travelers());
  protected readonly hasUsers = computed(() => this.users().length > 0);
  protected readonly hasTrips = computed(() => this.trips().length > 0);
  protected readonly enabledUsers = computed(() => this.users().filter((user) => user.enabled));

  constructor() {
    if (!Number.isFinite(this.tourId)) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    if (this.tourId < 0) {
      const demo = DEMO_TOURS.find((tour) => tour.idTour === this.tourId) ?? null;
      if (!demo) {
        this.notFound.set(true);
        this.loading.set(false);
        return;
      }

      this.tour.set(demo);
      this.trips.set(demoTripsFor(this.tourId));
      this.configureDemo();
      this.loading.set(false);
      return;
    }

    this.tourService.findByIdWithFallback(this.tourId).subscribe({
      next: (tour) => {
        if (!tour) {
          this.notFound.set(true);
          this.loading.set(false);
          return;
        }

        this.tour.set(tour);
        this.loadData(tour);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  private configureDemo(): void {
    const trip = this.trips()[0];
    this.form.patchValue({
      idTrip: trip?.idTrip ?? null,
      travelers: Number.isFinite(this.travelersParam)
        ? Math.min(10, Math.max(1, this.travelersParam))
        : 1,
      mode: 'new',
      idUser: null,
    });

    this.form.controls.idUser.clearValidators();
    this.form.controls.idUser.updateValueAndValidity();
    this.modeChanged('new');
  }

  private loadData(tour: Tour): void {
    forkJoin({
      trips: this.tripService.findAll().pipe(catchError(() => of([]))),
      clients: this.clientService.findAll().pipe(catchError(() => of([]))),
      users: this.userService.findAll().pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ trips, clients, users }) => {
        const toursTrips = trips.filter((trip) => Number(trip.idTour) === Number(tour.idTour));
        this.trips.set(toursTrips);
        this.clients.set(clients);
        this.users.set(users);

        const fromQuery = toursTrips.find((trip) => trip.idTrip === this.tripParam);
        const selectedTrip = fromQuery ?? toursTrips[0] ?? null;
        const enabledUser = users.find((user) => user.enabled) ?? users[0] ?? null;
        const mode = clients.length ? 'existing' : 'new';

        this.form.patchValue({
          idTrip: selectedTrip?.idTrip ?? null,
          travelers: Number.isFinite(this.travelersParam)
            ? Math.min(10, Math.max(1, this.travelersParam))
            : 1,
          idUser: enabledUser?.idUser ?? null,
          idClient: clients[0]?.idClient ?? null,
          mode,
        });

        this.modeChanged(mode);
      });
  }

  protected modeChanged(mode: 'existing' | 'new'): void {
    this.form.controls.mode.setValue(mode);

    const clientFields: Array<[string, ValidatorFn[]]> = [
      ['firstName', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      ['lastName', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      [
        'dni',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(15),
          Validators.pattern('^[0-9A-Za-z-]+$'),
        ],
      ],
      ['email', [Validators.required, Validators.email, Validators.maxLength(150)]],
      ['phoneNumberClient', [Validators.maxLength(15)]],
      ['address', [Validators.maxLength(200)]],
    ];

    for (const [key, validators] of clientFields) {
      const control = this.form.get(key);
      control?.clearValidators();
      if (mode === 'new') control?.setValidators(validators);
      control?.updateValueAndValidity();
    }

    const clientControl = this.form.controls.idClient;
    clientControl.clearValidators();
    if (mode === 'existing') clientControl.setValidators(Validators.required);
    clientControl.updateValueAndValidity();

    if (!this.isDemo() && mode === 'new') {
      this.form.controls.idUser.setValidators(Validators.required);
      this.form.controls.idUser.updateValueAndValidity();
    }
  }

  protected changeTravelers(delta: number): void {
    const current = this.travelers();
    this.form.controls.travelers.setValue(Math.min(10, Math.max(1, current + delta)));
  }

  protected clientName(): string {
    if (this.form.controls.mode.value === 'existing') {
      const client = this.selectedClient();
      return client ? `${client.firstName} ${client.lastName}` : 'Cliente';
    }

    const { firstName, lastName } = this.form.value;
    return [firstName, lastName].filter(Boolean).join(' ') || 'Viajero';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Revisa los datos marcados antes de continuar.', 'Cerrar', {
        duration: 3600,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
      return;
    }

    const tour = this.tour();
    const trip = this.selectedTrip();
    if (!tour || !trip) return;

    if (this.isDemo()) {
      this.finish({
        code: `TRP-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
        tourName: tour.nameTour,
        date: trip.tripDate,
        time: trip.departureTime,
        travelers: this.travelers(),
        total: this.total(),
        clientName: this.clientName(),
        demo: true,
      });
      return;
    }

    const userId = this.form.controls.idUser.value;
    if (!userId) {
      this.snackBar.open(
        'No hay un usuario asociado. Crea uno en el panel administrativo.',
        'Cerrar',
        {
          duration: 4200,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        },
      );
      return;
    }

    this.submitting.set(true);

    if (this.form.controls.mode.value === 'new') {
      const client: Client = {
        firstName: this.form.controls.firstName.value ?? '',
        lastName: this.form.controls.lastName.value ?? '',
        dni: this.form.controls.dni.value ?? '',
        email: this.form.controls.email.value ?? '',
        phoneNumberClient: this.form.controls.phoneNumberClient.value || undefined,
        address: this.form.controls.address.value || undefined,
      };

      this.clientService
        .save(client)
        .pipe(
          switchMap(() => this.clientService.findAll()),
          map(
            (clients) =>
              clients.find((item) => item.dni === client.dni) ?? clients[clients.length - 1],
          ),
          switchMap((created) => {
            if (!created?.idClient) throw new Error('No se pudo recuperar el cliente creado');
            return this.createBooking(created.idClient, userId);
          }),
        )
        .pipe(finalize(() => this.submitting.set(false)))
        .subscribe({
          next: (code) => this.finish(this.confirmationData(code, tour, trip)),
          error: (error) => this.handleError(error),
        });
      return;
    }

    const clientId = this.form.controls.idClient.value;
    if (!clientId) {
      this.submitting.set(false);
      return;
    }

    this.createBooking(clientId, userId)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (code) => this.finish(this.confirmationData(code, tour, trip)),
        error: (error) => this.handleError(error),
      });
  }

  private createBooking(idClient: number, idUser: number) {
    const trip = this.selectedTrip()!;
    const time = trip.departureTime?.length === 5 ? `${trip.departureTime}:00` : trip.departureTime;

    return this.bookingService
      .saveWithLocation({
        dateTime: `${trip.tripDate}T${time}`,
        totalPrice: this.total(),
        idClient,
        idUser,
        idTrip: trip.idTrip!,
      })
      .pipe(
        map((response) => {
          const location = response.headers.get('Location') ?? '';
          const id = location.split('/').filter(Boolean).pop();
          return id ? `TRP-${id.padStart(4, '0')}` : `TRP-${Date.now().toString().slice(-5)}`;
        }),
      );
  }

  private confirmationData(code: string, tour: Tour, trip: Trip): Confirmation {
    return {
      code,
      tourName: tour.nameTour,
      date: trip.tripDate,
      time: trip.departureTime,
      travelers: this.travelers(),
      total: this.total(),
      clientName: this.clientName(),
      demo: false,
    };
  }

  private finish(confirmation: Confirmation): void {
    this.confirmation.set(confirmation);
    this.snackBar.open('¡Reserva registrada con éxito!', 'OK', {
      duration: 3600,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private handleError(error: unknown): void {
    console.error(error);
    this.snackBar.open(
      'No se pudo completar la reserva. Revisa los datos y vuelve a intentarlo.',
      'Cerrar',
      { duration: 5000, horizontalPosition: 'center', verticalPosition: 'bottom' },
    );
  }

  protected showError(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (!control || !control.errors || !control.touched) return null;

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Ingresa un correo válido';
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.errors['pattern']) return 'Solo se permiten letras, números y guiones';

    return 'Revisa este campo';
  }
}
