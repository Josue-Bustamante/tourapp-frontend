import { Tour } from './models/tour';
import { Trip } from './models/trip';

/**
 * Tours de demostración. Se muestran únicamente cuando el backend no está
 * disponible o cuando la base de datos todavía no tiene tours publicados.
 * Todos los identificadores son negativos para no confundirlos con datos reales.
 */
export const DEMO_TOURS: Tour[] = [
  {
    idTour: -1,
    nameTour: 'Machu Picchu Esencial',
    description:
      'Un día completo en la ciudadela inca, con guía certificado, tren panorámico y almuerzo andino.',
    basePrice: 289,
    durationHours: 12,
    demo: true,
    places: [
      { idPlace: -1, namePlace: 'Machu Picchu', entryFee: 0 },
      { idPlace: -2, namePlace: 'Aguas Calientes', entryFee: 0 },
      { idPlace: -3, namePlace: 'Ollantaytambo', entryFee: 12 },
    ],
  },
  {
    idTour: -2,
    nameTour: 'Valle Sagrado entre Andenes',
    description:
      'Pisa, Pisac y Ollantaytambo en una ruta de mercados, terrazas y pueblos con historia viva.',
    basePrice: 149,
    durationHours: 8,
    demo: true,
    places: [
      { idPlace: -4, namePlace: 'Pisac', entryFee: 15 },
      { idPlace: -5, namePlace: 'Ollantaytambo', entryFee: 15 },
      { idPlace: -6, namePlace: 'Chinchero', entryFee: 10 },
    ],
  },
  {
    idTour: -3,
    nameTour: 'Amazonas: Río y Selva',
    description:
      'Navega el río Madre de Dios, camina entre gigantes y descubre la vida de la selva amazónica.',
    basePrice: 349,
    durationHours: 10,
    demo: true,
    places: [
      { idPlace: -7, namePlace: 'Reserva Tambopata', entryFee: 30 },
      { idPlace: -8, namePlace: 'Lago Sandoval', entryFee: 20 },
      { idPlace: -9, namePlace: 'Puerto Maldonado', entryFee: 0 },
    ],
  },
  {
    idTour: -4,
    nameTour: 'Paracas y las Islas Ballestas',
    description:
      'Navega entre lobos marinos y aves guaneras, y termina el día entre dunas y viñedos de Ica.',
    basePrice: 119,
    durationHours: 9,
    demo: true,
    places: [
      { idPlace: -10, namePlace: 'Islas Ballestas', entryFee: 18 },
      { idPlace: -11, namePlace: 'Reserva de Paracas', entryFee: 12 },
      { idPlace: -12, namePlace: 'Huacachina', entryFee: 0 },
    ],
  },
  {
    idTour: -5,
    nameTour: 'Lago Titicaca y los Uros',
    description:
      'Navega hacia las islas flotantes de los Uros y comparte una tarde con una familia de Taquile.',
    basePrice: 189,
    durationHours: 8,
    demo: true,
    places: [
      { idPlace: -13, namePlace: 'Islas Uros', entryFee: 15 },
      { idPlace: -14, namePlace: 'Taquile', entryFee: 10 },
      { idPlace: -15, namePlace: 'Puno', entryFee: 0 },
    ],
  },
  {
    idTour: -6,
    nameTour: 'Nazca: Líneas y Desierto',
    description:
      'Sobrevuela las enigmáticas líneas de Nazca y cierra la jornada entre oasis y atardeceres dorados.',
    basePrice: 259,
    durationHours: 7,
    demo: true,
    places: [
      { idPlace: -16, namePlace: 'Líneas de Nazca', entryFee: 35 },
      { idPlace: -17, namePlace: 'Mirador de Nazca', entryFee: 8 },
      { idPlace: -18, namePlace: 'Oasis de Huacachina', entryFee: 0 },
    ],
  },
];

export function demoTripsFor(idTour: number): Trip[] {
  const today = new Date();
  const dates = [8, 16, 27].map((days) => {
    const date = new Date(today);
    date.setDate(today.getDate() + days);
    return date.toISOString().slice(0, 10);
  });

  return dates.map((tripDate, index) => ({
    idTrip: -100 - index,
    tripDate,
    departureTime: index === 1 ? '06:30:00' : '07:00:00',
    idTour,
    idGuide: 1,
    idDriver: 1,
    idBus: 1,
  }));
}
