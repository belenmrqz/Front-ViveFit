import { Component } from '@angular/core';
import { UsuarioService } from '../../usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-dieta',
  standalone: false,
  templateUrl: './crear-dieta.component.html',
  styleUrl: './crear-dieta.component.css'
})
export class CrearDietaComponent {

  peso: number = 0;
  altura: number = 0;
  sexo: string = '';
  edad: number = 0;
  objetivo: string = 'dieta_saludable';
  horasSueno: number = 8;
  horasActivas: number = 8;
  mostrarSexo = false;

  mensaje: string = '';
  error: string = '';

  mostrarResultados: boolean = false;
  resultados: any = null;

  constructor(private usuarioServicio: UsuarioService, private router: Router) { }

  ngOnInit(): void {
  const usuario = this.usuarioServicio.getUsuario();
  const idUsuario = this.usuarioServicio.getUsuarioId();

  if (!idUsuario) {
    this.error = 'No se pudo obtener el usuario.';
    return;
  }

  this.mostrarSexo = !usuario?.sexo;

  this.usuarioServicio.comprobarDatosDieta(idUsuario).subscribe({
    next: (completos) => {
      if (completos) {
        this.usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe({
          next: (usuarioActualizado) => {
            this.resultados = {
              tmb: usuarioActualizado.tmb?.toFixed(2),
              tmbActivo: usuarioActualizado.tmbActivo?.toFixed(2),
              imc: usuarioActualizado.imc?.toFixed(2),
              imcOms: usuarioActualizado.imcOms,
              hidratos: usuarioActualizado.hidratos?.toFixed(2),
              lipidos: usuarioActualizado.lipidos?.toFixed(2),
              proteina: usuarioActualizado.proteina?.toFixed(2)
            };
            this.mostrarResultados = true;
          },
          error: err => {
            this.error = 'No se pudieron cargar los resultados guardados.';
            console.error(err);
          }
        });
      } else {
        this.mostrarResultados = false;
      }
    },
    error: err => {
      this.error = 'Error al verificar los datos.';
      console.error(err);
    }
  });
}


  onSubmit() {
    this.error = '';
    this.mensaje = '';

    if (this.horasSueno + this.horasActivas > 24) {
      this.error = 'La suma de horas de sueño y activas no puede superar 24.';
      return;
    }

    const idUsuario = this.usuarioServicio.getUsuarioId();
    if (!idUsuario) {
      this.error = 'No se encontró el usuario.';
      return;
    }

    const payload = {
      peso: this.peso,
      altura: this.altura,
      sexo: this.sexo,
      edad: this.edad,
      objetivo: this.objetivo,
      horasSueno: this.horasSueno,
      horasActivas: this.horasActivas
    };

    this.usuarioServicio.crearRutina(idUsuario, payload).subscribe({
      next: () => {
        this.mensaje = 'Rutina calculada y guardada con éxito.';

        // SOLUCIÓN: obtener el usuario actualizado del backend
        this.usuarioServicio.obtenerUsuarioPorId(idUsuario).subscribe({
          next: (usuarioActualizado) => {
            // Actualizamos localStorage con el usuario actualizado
            localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));

            // Actualizamos resultados para mostrar
            this.resultados = {
              tmb: usuarioActualizado.tmb?.toFixed(2),
              tmbActivo: usuarioActualizado.tmbActivo?.toFixed(2),
              imc: usuarioActualizado.imc?.toFixed(2),
              imcOms: usuarioActualizado.imcOms,
              hidratos: usuarioActualizado.hidratos?.toFixed(2),
              lipidos: usuarioActualizado.lipidos?.toFixed(2),
              proteina: usuarioActualizado.proteina?.toFixed(2)
            };
            this.mostrarResultados = true;
          },
          error: (err) => {
            this.error = 'Error al obtener los resultados actualizados.';
            console.error(err);
          }
        });
      },
      error: err => {
        this.error = 'Ocurrió un error al guardar los datos.';
        console.error(err);
      }
    });



  }

  modificarDatos() {
  this.mostrarResultados = false;
  this.mensaje = '';
  this.error = '';
}

}
