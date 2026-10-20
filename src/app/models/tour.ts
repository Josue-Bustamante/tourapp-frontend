import { Place } from './place';

export interface Tour {
  idTour?: number;
  nameTour: string;
  description: string;
  basePrice: number;
  durationHours: number;
  places?: Place[];
  /** Marca local: el tour proviene de los datos de demostración. */
  demo?: boolean;
}
