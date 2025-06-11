import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { UsuarioService } from '../../usuario.service';

import { Usuario } from '../../usuario';
import { TipoRutina } from '../../tipo-rutina';
import { Ejercicio } from '../../ejercicio';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';


@Component({
  selector: 'app-mi-rutina',
  standalone: false,
  templateUrl: './mi-rutina.component.html',
  styleUrl: './mi-rutina.component.css'
})
export class MiRutinaComponent implements OnInit{

//Tablas de la bbdd
 usuario: Usuario | null = null; 
 tipoRutinas: TipoRutina | null = null; 

 
 ejerciciosPorDia: { [key: number]: Ejercicio[] } = {}; // Ejercicios agrupados por día
 diasDeLaRutina!: number;
 filtrosRutina: any;



 constructor(private usuarioService: UsuarioService,  @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    this.usuario = this.usuarioService.getUsuario();

    if (!this.usuario || !this.usuario.id || !this.usuario.idRutina) {
      console.warn('Usuario no válido o sin rutina asignada');
      return;
    }

    const idUsuario = this.usuario.id;
    const idRutinaUsuario = this.usuario.idRutina;

    this.usuarioService.getRutinaPorId(idRutinaUsuario).subscribe({
      next: (rutina) => {
        console.log('Rutina recibida del backend:', rutina);
        this.tipoRutinas = rutina;

        this.usuarioService.getFiltrosPorId(rutina.id).subscribe({
          next: (dias) => {
            this.filtrosRutina = dias;
            this.diasDeLaRutina = dias.diasPorSemana;
            console.log("Días de rutina cargados:", this.diasDeLaRutina);
            this.cargarEjerciciosPorDia(); // se llama solo si hay días
          },
          error: (err) => console.error('Error al obtener filtros:', err)
        });
      },
      error: (err) => console.error('Error al obtener rutina:', err)
    });
  } else {
    console.warn('Este componente solo debe ejecutarse en el navegador.');
  }
}


  cargarEjerciciosPorDia() {
    const idUsuario = this.usuario?.id;
    if (idUsuario && this.diasDeLaRutina > 0) {
      for (let dia = 1; dia <= this.diasDeLaRutina; dia++) {
        this.usuarioService.obtenerEjerciciosPorUsuarioYDia(idUsuario, dia).subscribe({
          next: (ejercicios) => {
            this.ejerciciosPorDia[dia] = ejercicios;
            console.log(`Ejercicios del día ${dia}:`, ejercicios); // << DEBUG

          },
          error: (err) => {
            console.error(`Error cargando ejercicios del día ${dia}:`, err);
          }
        });
      }
    }else {
      console.warn("No se puede cargar ejercicios: usuario o días no definidos.");
    }
  }

  arrayDesdeDias(): number[] {
    return Array.from({ length: this.diasDeLaRutina }, (_, i) => i + 1);
  }

 
}
