import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Tour } from '../../models/tour';
import { Trip } from '../../models/trip';
import { TourService } from '../../services/tour.service';
import { TripService } from '../../services/trip.service';
import { DEMO_TOURS, demoTripsFor } from '../../demo-data';
import { tourImage } from '../../tour-images';
import { TourCardComponent } from '../../shared/tour-card.component';
import { DuracionPipe, FechaPipe, HoraPipe, MoneyPipe } from '../../pipes';

@Component({
  selector: 'app-tour-detail',
  imports: [
    RouterLink,
    MatIconModule,
    TourCardComponent,
    MoneyPipe,
    DuracionPipe,
    FechaPipe,
    HoraPipe,
  ],
  templateUrl: './tour-detail.component.html',
  styleUrl: './tour-detail.component.css',
})
export class TourDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tourService = inject(TourService);
  private readonly tripService = inject(TripService);

  private readonly tourId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly tour = signal<Tour | null>(null);
  protected readonly trips = signal<Trip[]>([]);
  protected readonly related = signal<Tour[]>([]);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);

  protected readonly selectedTripId = signal<number | null>(null);
  protected readonly travelers = signal(1);

  protected readonly image = computed(() => tourImage(this.tour()));
  protected readonly availableTrips = computed(() =>
    this.trips().filter((trip) => Number(trip.idTour) === Number(this.tour()?.idTour)),
  );
  protected readonly selectedTrip = computed(
    () => this.availableTrips().find((trip) => trip.idTrip === this.selectedTripId()) ?? null,
  );
  protected readonly total = computed(() => Number(this.tour()?.basePrice ?? 0) * this.travelers());
  protected readonly included = [
    'Guía local certificado durante toda la experiencia',
    'Transporte turístico ida y vuelta',
    'Entradas a los lugares indicados en el itinerario',
    'Seguro básico de viaje para cada pasajero',
  ];

  constructor() {
    if (!Number.isFinite(this.tourId)) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    if (this.tourId < 0) {
      const demo = DEMO_TOURS.find((item) => item.idTour === this.tourId) ?? null;
      this.tour.set(demo);
      this.trips.set(demo ? demoTripsFor(this.tourId) : []);
      this.related.set(DEMO_TOURS.filter((item) => item.idTour !== this.tourId).slice(0, 3));
      this.selectFirstTrip();
      this.notFound.set(!demo);
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
        this.loadTrips(tour.idTour!);
        this.loadRelated(tour.idTour!);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  private loadTrips(idTour: number): void {
    this.tripService
      .findAll()
      .pipe(catchError(() => of([])))
      .subscribe((trips) => {
        this.trips.set(trips.filter((trip) => Number(trip.idTour) === Number(idTour)));
        this.selectFirstTrip();
      });
  }

  private loadRelated(idTour: number): void {
    this.tourService
      .findAllWithFallback()
      .pipe(catchError(() => of([])))
      .subscribe((tours) => {
        this.related.set(tours.filter((tour) => tour.idTour !== idTour).slice(0, 3));
      });
  }

  private selectFirstTrip(): void {
    const first = this.availableTrips()[0];
    if (first) this.selectedTripId.set(first.idTrip ?? null);
  }

  protected changeTravelers(delta: number): void {
    const next = Math.min(10, Math.max(1, this.travelers() + delta));
    this.travelers.set(next);
  }

  protected stopNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  protected hasEntryFee(fee: number | string | null | undefined): boolean {
    return Number(fee ?? 0) > 0;
  }

  protected reserve(): void {
    if (!this.tour() || !this.selectedTripId()) return;

    this.router.navigate(['/reservar', this.tour()!.idTour], {
      queryParams: {
        trip: this.selectedTripId(),
        travelers: this.travelers(),
      },
    });
  }
}
