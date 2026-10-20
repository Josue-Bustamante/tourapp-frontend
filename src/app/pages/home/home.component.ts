import { Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { Tour } from '../../models/tour';
import { TourService } from '../../services/tour.service';
import { DEMO_TOURS } from '../../demo-data';
import { tourImage } from '../../tour-images';
import { TourCardComponent } from '../../shared/tour-card.component';
import { DuracionPipe, MoneyPipe } from '../../pipes';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatIconModule, TourCardComponent, MoneyPipe, DuracionPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly tourService = inject(TourService);
  private readonly router = inject(Router);

  protected readonly search = signal('');
  protected readonly loading = signal(true);
  protected readonly tours = signal<Tour[]>([]);
  protected readonly demoMode = this.tourService.$demoMode;

  protected readonly heroTour = computed(() => this.tours()[0] ?? DEMO_TOURS[0]);
  protected readonly featuredTours = computed(() => this.tours().slice(0, 3));

  protected readonly quickSearches = ['Machu Picchu', 'Valle Sagrado', 'Amazonas', 'Titicaca'];

  protected readonly destinations = [
    {
      name: 'Cusco & Machu Picchu',
      tag: 'Historia viva',
      image: 'img/machu-picchu.jpg',
      query: 'Machu Picchu',
      featured: true,
    },
    {
      name: 'Amazonía',
      tag: 'Naturaleza',
      image: 'img/amazon.jpg',
      query: 'Amazonas',
    },
    {
      name: 'Costa y desierto',
      tag: 'Aire libre',
      image: 'img/coast.jpg',
      query: 'Paracas',
    },
    {
      name: 'Andes y lagos',
      tag: 'Altura',
      image: 'img/lake.jpg',
      query: 'Titicaca',
    },
  ];

  protected readonly benefits = [
    {
      icon: 'verified',
      title: 'Guías certificados',
      text: 'Expertos locales que conocen cada sendero, cada historia y cada parada fuera de ruta.',
    },
    {
      icon: 'groups',
      title: 'Grupos pequeños',
      text: 'Máximo 12 viajeros por salida. Más conversación, más calma y mejor ritmo.',
    },
    {
      icon: 'eco',
      title: 'Viajes responsables',
      text: 'Trabajamos con comunidades y hospedajes locales para que el impacto se quede en el destino.',
    },
  ];

  protected readonly steps = [
    {
      number: '01',
      icon: 'travel_explore',
      title: 'Elige tu experiencia',
      text: 'Explora tours por duración, precio o lugar. Cada ruta está pensada para vivirse sin prisa.',
    },
    {
      number: '02',
      icon: 'event_available',
      title: 'Reserva tu salida',
      text: 'Selecciona la fecha, cuéntanos quién viaja y confirma en pocos pasos.',
    },
    {
      number: '03',
      icon: 'landscape',
      title: 'Vive el viaje',
      text: 'Nosotros nos encargamos del transporte, el guía y los detalles. Tú solo lleva curiosidad.',
    },
  ];

  protected readonly testimonials = [
    {
      quote:
        'No fue solo ver Machu Picchu: fue entender la historia detrás de cada piedra. El guía hizo que todo tuviera sentido.',
      name: 'María Fernanda R.',
      detail: 'Machu Picchu Esencial · Lima',
      initials: 'MF',
    },
    {
      quote:
        'El viaje al Amazonas superó cualquier expectativa. Dormir escuchando la selva y despertar con el río es algo que no olvidaré.',
      name: 'Diego A.',
      detail: 'Amazonas: Río y Selva · Bogotá',
      initials: 'DA',
    },
    {
      quote:
        'Viajamos con nuestra hija de 9 años y todo fue fácil, seguro y muy humano. Se nota que aman lo que hacen.',
      name: 'Carolina y José',
      detail: 'Valle Sagrado · Arequipa',
      initials: 'CJ',
    },
  ];

  constructor() {
    this.tourService.findAllWithFallback().subscribe({
      next: (tours) => {
        this.tours.set(tours);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected imageFor(tour: Tour): string {
    return tourImage(tour);
  }

  protected searchTours(): void {
    const q = this.search().trim();
    this.router.navigate(['/tours'], { queryParams: q ? { q } : {} });
  }

  protected searchFor(term: string): void {
    this.router.navigate(['/tours'], { queryParams: { q: term } });
  }
}
