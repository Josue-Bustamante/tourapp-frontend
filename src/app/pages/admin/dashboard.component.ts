import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { Booking } from '../../models/booking';
import { Client } from '../../models/client';
import { Driver } from '../../models/driver';
import { Guide } from '../../models/guide';
import { Tour } from '../../models/tour';
import { Trip } from '../../models/trip';
import { UserData } from '../../models/user-data';
import { BookingService } from '../../services/booking.service';
import { ClientService } from '../../services/client.service';
import { DriverService } from '../../services/driver.service';
import { GuideService } from '../../services/guide.service';
import { TourService } from '../../services/tour.service';
import { TripService } from '../../services/trip.service';
import { UserDataService } from '../../services/user-data.service';
import { FechaPipe, HoraPipe, MoneyPipe } from '../../pipes';

interface MonthBar {
  label: string;
  count: number;
  height: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MoneyPipe,
    FechaPipe,
    HoraPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly tourService = inject(TourService);
  private readonly tripService = inject(TripService);
  private readonly bookingService = inject(BookingService);
  private readonly clientService = inject(ClientService);
  private readonly guideService = inject(GuideService);
  private readonly driverService = inject(DriverService);
  private readonly userService = inject(UserDataService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly tours = signal<Tour[]>([]);
  protected readonly trips = signal<Trip[]>([]);
  protected readonly bookings = signal<Booking[]>([]);
  protected readonly clients = signal<Client[]>([]);
  protected readonly guides = signal<Guide[]>([]);
  protected readonly drivers = signal<Driver[]>([]);
  protected readonly users = signal<UserData[]>([]);

  protected readonly today = new Date();
  protected readonly todayLabel = (() => {
    const label = new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(this.today);

    return label.charAt(0).toUpperCase() + label.slice(1);
  })();

  protected readonly revenue = computed(() =>
    this.bookings().reduce((sum, booking) => sum + Number(booking.totalPrice ?? 0), 0),
  );

  protected readonly averageTicket = computed(() => {
    const count = this.bookings().length;
    return count ? this.revenue() / count : 0;
  });

  protected readonly upcomingTrips = computed(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    return this.trips()
      .filter((trip) => trip.tripDate >= todayISO)
      .sort((a, b) =>
        `${a.tripDate}T${a.departureTime}`.localeCompare(`${b.tripDate}T${b.departureTime}`),
      )
      .slice(0, 5);
  });

  protected readonly recentBookings = computed(() =>
    [...this.bookings()]
      .sort((a, b) => String(b.dateTime).localeCompare(String(a.dateTime)))
      .slice(0, 5),
  );

  protected readonly monthlyBars = computed<MonthBar[]>(() => {
    const formatter = new Intl.DateTimeFormat('es-PE', { month: 'short' });
    const bars: MonthBar[] = [];

    for (let index = 5; index >= 0; index--) {
      const date = new Date(this.today.getFullYear(), this.today.getMonth() - index, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const count = this.bookings().filter((booking) => {
        const value = new Date(booking.dateTime);
        return value.getFullYear() === year && value.getMonth() === month;
      }).length;

      bars.push({
        label: formatter.format(date).replace('.', ''),
        count,
        height: 0,
      });
    }

    const max = Math.max(...bars.map((bar) => bar.count), 1);
    return bars.map((bar) => ({
      ...bar,
      height: bar.count ? Math.max(10, (bar.count / max) * 100) : 4,
    }));
  });

  protected readonly quickActions = [
    {
      label: 'Nuevo tour',
      description: 'Publica una experiencia',
      icon: 'travel_explore',
      path: '/admin/tours',
    },
    {
      label: 'Programar viaje',
      description: 'Agrega una salida',
      icon: 'route',
      path: '/admin/trips',
    },
    {
      label: 'Nuevo cliente',
      description: 'Registra un viajero',
      icon: 'person_add',
      path: '/admin/clients',
    },
    {
      label: 'Ver reservas',
      description: 'Gestiona las ventas',
      icon: 'confirmation_number',
      path: '/admin/bookings',
    },
  ];

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      tours: this.tourService.findAll(),
      trips: this.tripService.findAll().pipe(catchError(() => of([]))),
      bookings: this.bookingService.findAll(),
      clients: this.clientService.findAll(),
      guides: this.guideService.findAll(),
      drivers: this.driverService.findAll().pipe(catchError(() => of([]))),
      users: this.userService.findAll(),
    }).subscribe({
      next: (data) => {
        this.tours.set(data.tours);
        this.trips.set(data.trips);
        this.bookings.set(data.bookings);
        this.clients.set(data.clients);
        this.guides.set(data.guides);
        this.drivers.set(data.drivers);
        this.users.set(data.users);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(
          'No se pudieron cargar los indicadores. Verifica que Spring Boot esté disponible y que la API responda correctamente.',
        );
      },
    });
  }

  protected tourName(id: number): string {
    return this.tours().find((tour) => tour.idTour === id)?.nameTour ?? `Tour #${id}`;
  }

  protected clientName(id: number): string {
    const client = this.clients().find((item) => item.idClient === id);
    return client ? `${client.firstName} ${client.lastName}` : `Cliente #${id}`;
  }

  protected guideName(id: number): string {
    const guide = this.guides().find((item) => item.idGuide === id);
    return guide ? `${guide.firstName} ${guide.lastName}` : `Guía #${id}`;
  }

  protected tripLabel(id: number): string {
    const trip = this.trips().find((item) => item.idTrip === id);
    if (!trip) return `Viaje #${id}`;
    return `${trip.tripDate} · ${trip.departureTime?.slice(0, 5)}`;
  }
}
