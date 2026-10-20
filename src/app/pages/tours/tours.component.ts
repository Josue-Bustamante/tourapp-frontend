import { Component, computed, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Tour } from '../../models/tour';
import { TourService } from '../../services/tour.service';
import { TourCardComponent } from '../../shared/tour-card.component';

type DurationFilter = 'all' | 'short' | 'half' | 'long';
type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'duration-asc' | 'name';

@Component({
  selector: 'app-tours',
  imports: [
    RouterLink,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    TourCardComponent,
  ],
  templateUrl: './tours.component.html',
  styleUrl: './tours.component.css',
})
export class ToursComponent {
  private readonly tourService = inject(TourService);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(true);
  protected readonly tours = signal<Tour[]>([]);
  protected readonly demoMode = this.tourService.$demoMode;

  protected readonly query = signal(this.route.snapshot.queryParamMap.get('q') ?? '');
  protected readonly duration = signal<DurationFilter>('all');
  protected readonly sortBy = signal<SortOption>('recommended');

  protected readonly durationOptions: Array<{ value: DurationFilter; label: string }> = [
    { value: 'all', label: 'Todas las duraciones' },
    { value: 'short', label: 'Hasta 4 horas' },
    { value: 'half', label: '5 a 8 horas' },
    { value: 'long', label: 'Más de 8 horas' },
  ];

  protected readonly filteredTours = computed(() => {
    const query = this.query().trim().toLowerCase();
    const duration = this.duration();

    let result = this.tours().filter((tour) => {
      const haystack = [
        tour.nameTour,
        tour.description,
        ...(tour.places ?? []).map((place) => place.namePlace),
      ]
        .join(' ')
        .toLowerCase();

      const matchesQuery = !query || haystack.includes(query);
      const hours = Number(tour.durationHours);

      const matchesDuration =
        duration === 'all' ||
        (duration === 'short' && hours <= 4) ||
        (duration === 'half' && hours > 4 && hours <= 8) ||
        (duration === 'long' && hours > 8);

      return matchesQuery && matchesDuration;
    });

    switch (this.sortBy()) {
      case 'price-asc':
        result = [...result].sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
        break;
      case 'duration-asc':
        result = [...result].sort((a, b) => Number(a.durationHours) - Number(b.durationHours));
        break;
      case 'name':
        result = [...result].sort((a, b) => a.nameTour.localeCompare(b.nameTour, 'es'));
        break;
    }

    return result;
  });

  protected readonly hasFilters = computed(
    () =>
      Boolean(this.query().trim()) || this.duration() !== 'all' || this.sortBy() !== 'recommended',
  );

  constructor() {
    this.tourService.findAllWithFallback().subscribe({
      next: (tours) => {
        this.tours.set(tours);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected setQuery(value: string): void {
    this.query.set(value);
  }

  protected setDuration(value: DurationFilter): void {
    this.duration.set(value);
  }

  protected clearFilters(): void {
    this.query.set('');
    this.duration.set('all');
    this.sortBy.set('recommended');
  }
}
