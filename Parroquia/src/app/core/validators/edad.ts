import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function edadMinimaValidator(edadMinima: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const edad = calcularEdad(control.value);
    
    if (edad < edadMinima) {
      return { 
        edadMinima: { 
          requiredAge: edadMinima, 
          actualAge: edad 
        } 
      };
    }

    return null;
  };
}

export function edadMaximaValidator(edadMaxima: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
        return null;
    }

    const edad = calcularEdad(control.value);
    
    if (edad > edadMaxima) {
        return { 
            edadMaxima: { 
            requiredAge: edadMaxima, 
            actualAge: edad 
            } 
        };
    }

    return null;
    };
}

function calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}

export function fechaNoFuturaValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
        return null;
    }

    const fechaSeleccionada = new Date(control.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada > hoy) {
        return hoy;
    }

    return null;
    };
}