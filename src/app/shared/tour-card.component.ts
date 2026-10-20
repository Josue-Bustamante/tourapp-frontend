import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Tour } from '../models/tour';
import { tourImage } from '../tour-images';
import { DuracionPipe, MoneyPipe } from '../pipes';

@Component({
  selector: 'app-tour-card',
  imports: [RouterLink, MatIconModule, MoneyPipe, DuracionPipe],
  templateUrl: './tour-card.component.html',
  styleUrl: './tour-card.component.css',
})
export class TourCardComponent {
  readonly tour = input.required<Tour>();

  protected readonly image = computed(() => tourImage(this.tour()));
  protected readonly firstPlaces = computed(() => (this.tour().places ?? []).slice(0, 2));
}
