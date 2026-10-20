import { Pipe, PipeTransform } from '@angular/core';

/** S/ 1,250.00 */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const amount = Number(value ?? 0);
    if (Number.isNaN(amount)) return 'S/ 0';
    const hasDecimals = Math.abs(amount % 1) > 0.001;
    return `S/ ${amount.toLocaleString('es-PE', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  }
}

/** 2026-11-02 → 2 nov 2026 */
@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, style: 'short' | 'long' = 'short'): string {
    if (!value) return '—';
    const date = this.toDate(value);
    if (!date) return '—';

    if (style === 'long') {
      return new Intl.DateTimeFormat('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    }

    return new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
      .format(date)
      .replace('.', '');
  }

  private toDate(value: string | Date): Date | null {
    if (value instanceof Date) return value;
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const date = new Date(dateOnly ? `${value}T00:00:00` : value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}

/** 2026-11-02T18:30:00 → 2 nov 2026 · 18:30 */
@Pipe({ name: 'fechaHora' })
export class FechaHoraPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    const day = new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
      .format(date)
      .replace('.', '');

    const time = new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);

    return `${day} · ${time}`;
  }
}

/** 08:30:00 → 08:30 */
@Pipe({ name: 'hora' })
export class HoraPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    const match = /^(\d{1,2}):(\d{2})/.exec(value);
    return match ? `${match[1].padStart(2, '0')}:${match[2]}` : value;
  }
}

/** 8.5 → 8 h 30 min */
@Pipe({ name: 'duracion' })
export class DuracionPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const hours = Number(value ?? 0);
    if (!hours) return '—';
    const whole = Math.floor(hours);
    const minutes = Math.round((hours - whole) * 60);
    if (!minutes) return `${whole} h`;
    return `${whole} h ${minutes} min`;
  }
}

/** 1 → 1 viajero · 2 → 2 viajeros */
@Pipe({ name: 'viajeros' })
export class ViajerosPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const count = Number(value ?? 0);
    return `${count} ${count === 1 ? 'viajero' : 'viajeros'}`;
  }
}
