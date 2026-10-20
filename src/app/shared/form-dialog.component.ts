import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CrudDialogData, CrudField } from './crud-types';

@Component({
  selector: 'app-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './form-dialog.component.html',
  styleUrl: './form-dialog.component.css',
})
export class FormDialogComponent {
  protected readonly data = inject<CrudDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<FormDialogComponent, Record<string, any>>);

  protected readonly form = this.buildForm();
  protected submitted = false;

  private buildForm(): FormGroup {
    const controls: Record<string, FormControl> = {};

    for (const field of this.data.fields) {
      const validators: ValidatorFn[] = [];

      if (field.required) validators.push(Validators.required);
      if (field.type === 'email') validators.push(Validators.email);
      if (field.minLength) validators.push(Validators.minLength(field.minLength));
      if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));
      if (field.min !== undefined) validators.push(Validators.min(field.min));
      if (field.max !== undefined) validators.push(Validators.max(field.max));
      if (field.pattern) validators.push(Validators.pattern(field.pattern));

      controls[field.key] = new FormControl(this.initialValue(field), validators);
    }

    return new FormGroup(controls);
  }

  private initialValue(field: CrudField): unknown {
    const raw = this.data.row?.[field.key];

    if (field.type === 'checkbox') return Boolean(raw ?? true);

    if (field.type === 'select') {
      if (field.multiple) {
        const list = Array.isArray(raw) ? raw : [];
        return list
          .map((item) =>
            item !== null && typeof item === 'object'
              ? item[field.optionValueKey ?? 'value']
              : item,
          )
          .filter((item) => item !== null && item !== undefined);
      }

      if (raw !== null && raw !== undefined && typeof raw === 'object') {
        return raw[field.optionValueKey ?? 'value'] ?? null;
      }
    }

    if (raw === null || raw === undefined) {
      return field.type === 'number' ? null : '';
    }

    if (field.type === 'date') return String(raw).slice(0, 10);
    if (field.type === 'time') return String(raw).slice(0, 5);
    if (field.type === 'datetime') return String(raw).slice(0, 16);
    if (field.type === 'number') return Number(raw);

    return raw;
  }

  protected isWide(field: CrudField): boolean {
    return Boolean(field.wide || field.type === 'textarea' || field.multiple);
  }

  protected inputType(field: CrudField): string {
    switch (field.type) {
      case 'email':
        return 'email';
      case 'password':
        return 'password';
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'time':
        return 'time';
      case 'datetime':
        return 'datetime-local';
      default:
        return 'text';
    }
  }

  protected controlError(field: CrudField): string | null {
    const control = this.form.get(field.key);
    if (!control || !control.errors || !(control.touched || control.dirty || this.submitted)) {
      return null;
    }

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Ingresa un correo válido';
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.errors['min']) return `El valor mínimo es ${control.errors['min'].min}`;
    if (control.errors['max']) return `El valor máximo es ${control.errors['max'].max}`;
    if (control.errors['pattern']) return field.patternMessage ?? 'El formato no es válido';

    return 'Revisa este campo';
  }

  protected save(): void {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue());
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
