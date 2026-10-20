interface TourImageSource {
  idTour?: number;
  nameTour?: string;
}

const KEYWORD_IMAGES: Array<{ keywords: string[]; image: string }> = [
  { keywords: ['machu', 'inca', 'ciudadela'], image: 'img/machu-picchu.jpg' },
  { keywords: ['valle', 'sagrado', 'pisac', 'ollantay'], image: 'img/valley.jpg' },
  { keywords: ['amazon', 'selva', 'madre de dios', 'tambopata'], image: 'img/amazon.jpg' },
  { keywords: ['paracas', 'ballestas', 'costa', 'playa', 'ica'], image: 'img/coast.jpg' },
  { keywords: ['titicaca', 'uros', 'taquile', 'puno', 'lago'], image: 'img/lake.jpg' },
  { keywords: ['nazca', 'desierto', 'huacachina', 'duna'], image: 'img/desert.jpg' },
  { keywords: ['lima', 'ciudad', 'miraflores', 'barranco'], image: 'img/lima.jpg' },
  { keywords: ['andes', 'montaña', 'sierra', 'trekking', 'camino'], image: 'img/andes.jpg' },
  { keywords: ['gastronom', 'comida', 'mercado', 'sabor'], image: 'img/food.jpg' },
];

const FALLBACK_IMAGES = [
  'img/hero.jpg',
  'img/machu-picchu.jpg',
  'img/valley.jpg',
  'img/amazon.jpg',
  'img/coast.jpg',
  'img/lake.jpg',
  'img/desert.jpg',
  'img/andes.jpg',
];

/** Devuelve una fotografía coherente para el tour (los datos del backend no incluyen imagen). */
export function tourImage(tour?: TourImageSource | null): string {
  if (!tour) return FALLBACK_IMAGES[0];

  const name = (tour.nameTour ?? '').toLowerCase();
  const byKeyword = KEYWORD_IMAGES.find((entry) =>
    entry.keywords.some((keyword) => name.includes(keyword)),
  );
  if (byKeyword) return byKeyword.image;

  const id = Math.abs(tour.idTour ?? 0);
  return FALLBACK_IMAGES[id % FALLBACK_IMAGES.length];
}

export const DESTINATION_IMAGES = {
  cusco: 'img/cusco.jpg',
  amazon: 'img/amazon.jpg',
  coast: 'img/coast.jpg',
  andes: 'img/andes.jpg',
  lima: 'img/lima.jpg',
  lake: 'img/lake.jpg',
};
