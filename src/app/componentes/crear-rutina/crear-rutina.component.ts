import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UsuarioService } from '../../usuario.service';
import { TipoRutina } from '../../tipo-rutina';
import Swal from 'sweetalert2';
import { json } from 'stream/consumers';
import { Usuario } from '../../usuario';
import { Ejercicio } from '../../ejercicio';
import { RutinaUsuarios } from '../../auxiliar/rutina-usuarios';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';


@Component({
  selector: 'app-crear-rutina',
  standalone: false,
  templateUrl: './crear-rutina.component.html',
  styleUrl: './crear-rutina.component.css'
})
export class CrearRutinaComponent implements OnInit{

  currentStep = 0; //paso actual (contador para el formulario)
  pasos = ['objetivo', 'dias', 'sexo'];
  mostrarParte2 = false; //mostarr parte 2: datos rutina
  mostrarParte3 = false; //mostrar parte 3: rellenar con ejercicios
  rutinaAsignada!: TipoRutina;
  idRutinaFiltros = 0;

  idUsuario!: number;
  mostrarFormulario: boolean = false;

  rutinaForm: FormGroup; //formulario reactivo 
 

  constructor(private fb: FormBuilder, private usuarioService: UsuarioService, private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.rutinaForm = this.fb.group({
      objetivo: ['', Validators.required], //los campos son obligatorios 
      dias: ['', [Validators.required, Validators.min(2), Validators.max(4)]],
      sexo: ['', Validators.required]
    });
  }

  ngOnInit(): void { //Al cargar el componente 

    if (isPlatformBrowser(this.platformId)) {
      // Obtener el usuario logado desde localStorage (ajústalo a tu lógica real)
      const usuarioGuardado = JSON.parse(localStorage.getItem('usuario') || '{}');
      this.idUsuario = usuarioGuardado.id;

      if (!this.idUsuario) {
        console.error('ID de usuario no disponible');
        return;
      }

      this.usuarioService.comprobarSiTieneRutina(this.idUsuario).subscribe(response => {
        if (response.tieneRutina) {
          Swal.fire({
            title: 'Ya tienes una rutina asignada',
            text: `¿Quieres conservarla o eliminarla?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar rutina',
            cancelButtonText: 'Conservar rutina'
          }).then((result) => {
            if (result.isConfirmed) {
              // Llamar al backend para eliminar la rutina
              this.usuarioService.eliminarRutina(this.idUsuario).subscribe(() => {
                Swal.fire('Eliminada', 'La rutina ha sido eliminada.', 'success');
                this.mostrarFormulario = true;
              });
            } else {
              // Conservar rutina: opcionalmente puedes redirigir o bloquear el acceso
              Swal.fire('Rutina conservada', 'Puedes seguir con la actual.', 'info');
            }
          });
        } else {
          // No tiene rutina → mostrar formulario directamente
          this.mostrarFormulario = true;
        }
      });
    }
  }




  /*Pasos del formulario --------------------------------------------------------*/
  get pasoActual(): string { //Get: obtener el paso actual 
    return this.pasos[this.currentStep];
  }

  //Para pasar al siguiente paso 
  nextStep() {
    const control = this.rutinaForm.get(this.pasoActual);
    if (control?.valid) { //Si es valido pasa al siguiente 
      this.currentStep++;
    } else { //Si no, corrige con las validaciones 
      control?.markAsTouched();
    }
  }

  //Para volver al paso anterior
  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
  /*-------------------------------------------------------------------------------*/



  //Mostrar errores en pantalla si un campo es inavlido 
  isInvalid(campo: string): boolean {
    const control = this.rutinaForm.get(campo);
    return control?.touched && control?.invalid || false;
  }



  //Se enviará el formulario solo si es valido 
  onSubmit() { //al enviar 
    if (this.rutinaForm.valid) {
      console.log('Formulario correcto y enviado', this.rutinaForm.value); //comprobación por consola 

      const idUsuario = this.usuarioService.getUsuarioId(); //id del usuario que se ha resgistrado/ iniciado sesión 

      if (!idUsuario) { //Comprueba si el id es invalido
        alert("El ID de usuario es inválido o no está disponible.");
        return;
      }

      //Conexión con backend (spring) con el metodo POST (HttpClient)
      const datosFormulario = {
        objetivo: this.rutinaForm.value.objetivo,
        dias: this.rutinaForm.value.dias,
        sexo: this.rutinaForm.value.sexo,
        idUsuario: idUsuario  // Usamos el servicio para obtener el ID
      };

      console.log('Datos del formulario:', datosFormulario); //comprobación por consola 


      this.usuarioService.configurarRutina(datosFormulario).subscribe({
        next: (res: any) => {
          console.log('Rutina guardada correctamente:', res);
          Swal.fire({
            icon: 'success',
            title: '¡Estupendo!',
            text: 'Configuración de rutina exitosa',
          });

          this.mostrarParte2 = true; //se muestra la parte dos
          console.log('Respuesta completa del backend:', JSON.stringify(res, null, 2));


          // Verificación del formato correcto de la respuesta
          const idRutina = res?.id_rutina;

          if (idRutina) {
            console.log('idRutina es válido:', idRutina);
            // Paso clave: actualizar localStorage con nuevo idRutina
            const usuario = this.usuarioService.getUsuario();
            if (usuario) {
              usuario.idRutina = idRutina;  // Actualiza la propiedad
              localStorage.setItem('usuario', JSON.stringify(usuario));
            }

            this.usuarioService.getRutinaPorId(idRutina).subscribe({
              next: rutina => {
                this.rutinaAsignada = rutina;
                console.log('Datos de la rutina:', rutina);

                //Guardamos id para los filtros y usarlo en cambio a parte 3
                this.idRutinaFiltros = rutina.id;
                console.log('el id de la rutina es: ', this.idRutinaFiltros);

              },
              error: err => {
                console.error('Error al obtener la rutina:', err);
              }
            });
          } else {
            console.log('No se encontró id_rutina en la respuesta.');
          }


        },
        error: (err) => {
          console.error('Error al guardar rutina:', err);
          alert('Hubo un error al configurar la rutina');
          Swal.fire({
            icon: 'error',
            title: 'Error al configurar rutina',
            text: 'Intentelo de nuevo',
          });
        }
      });

    }



  }

  /*----------------------------------------------------------------------------------------*/
  //Aquí rellenamos la rutina establecida con  ejercicios

  //PARTE 3
  filtros: any;
  especialidadSeleccionada: string = ''; // si decides usar luego en filtros manuales
  ejercicios: Ejercicio[] = [];
  ejerciciosCompuestos: Ejercicio[] = [];
  ejerciciosAislados: Ejercicio[] = [];

  especialidad = '';    //filtro especialidad
  composicion = '';     //Aislado o compuesto
  diasPorSemana = 0;    //Dias x semana de la rutina 
  minCompuestos = 0;    //Cantidad minima de ejercicios compuestos x dia 
  maxCompuestos = 0;    //Cantidad maxima de ejercicios compuestos x dia 
  minAislados = 0;      //Cantidad minima de ejercicios aislados x dia 
  maxAislados = 0;      //Cantidad maxima de ejercicios aislados x dia 

  ejCompuestos = 0;     //Contador ejercicios compuestos guardados 
  ejAislados = 0;       //Contador ejercicios aislados guardados

  // Guardamos los ejercicios seleccionados por tipo y por día
  ejerciciosCompuestosPorDia: any[] = [];   //Id ejercicios compuestos guardados por día
  ejerciciosAisladosPorDia: any[] = [];     //Id ejercicios aislados guardados por día
  

  i = 1;  //Contador del día de la rutina por el que vamos 


  cambioAParte3() { //Oculta todo lo demas y muestra los ejercicios
    this.mostrarParte3 = true;

    //Comprobar que no tienes una rutina rellena *
    this.verificarRutinaExistente();

    if (this.idRutinaFiltros) { //Aquí se rellenan los filtros del back
      this.usuarioService.getFiltrosPorId(this.idRutinaFiltros).subscribe({
        next: filtros => {
          this.filtros = filtros;
          console.log('Filtros obtenidos:', this.filtros);


          //Aquí tenemos ya los filtros y con ellos imprimimos los ejercicios
          this.especialidad = filtros.laEspecialidad;
          this.diasPorSemana = filtros.diasPorSemana;
          this.minCompuestos = filtros.minCompuestos;
          this.maxCompuestos = filtros.maxCompuestos;
          this.minAislados = filtros.minAislados;
          this.maxAislados = filtros.maxAislados;

          this.cargarEjerciciosPorDia(); // 👈 Nueva función separada
          },
          error: err => {
            console.error('Error al obtener filtros:', err);
          }
        });
      } else {
        console.warn('idRutina no disponible aún.');
      }
    }
  
  cargarEjerciciosPorDia() {
    console.log("Parámetros para compuestos:", {
      especialidad: this.especialidad,
      composicion: 'compuesto',
      idRutina: this.idRutinaFiltros,
      diaDeLaRutina: this.i
    });
    this.usuarioService.obtenerEjerciciosPorEspecialidad(this.especialidad, 'compuesto', this.idRutinaFiltros, this.i).subscribe({
      next: ejerciciosC => {
        this.ejerciciosCompuestos = ejerciciosC.map((e: any) => new Ejercicio(e));
        console.log(`Ejercicios compuestos día ${this.i}:`, this.ejerciciosCompuestos);

        this.usuarioService.obtenerEjerciciosPorEspecialidad(this.especialidad, 'aislado', this.idRutinaFiltros, this.i).subscribe({
          next: ejerciciosA => {
            this.ejerciciosAislados = ejerciciosA.map((e: any) => new Ejercicio(e));
            console.log(`Ejercicios aislados día ${this.i}:`, this.ejerciciosAislados);
          },
          error: err => {
            console.error('Error al buscar ejercicios aislados:', err);
          }
        });
      },
      error: err => {
        console.error('Error al buscar ejercicios compuestos:', err);
      }
    });
  }


         


// Guarda un ejercicio compuesto para el día actual
  guardarCompuesto(ejercicioId: number) {

    // Verificamos si ya fue añadido ese ejercicio para ese día
    if(this.ejerciciosCompuestosPorDia.some(e => e.dia === this.i && e.idEjercicio === ejercicioId)){
      Swal.fire({
        icon: 'error',
        title: 'Ejercicio ya añadido',
        text: 'No puedes añadir dos ejercicios iguales a la rutina de un mismo día, por favor, selecciona otro',
      });
    //Si no hay problema se añade el ejercicio  
    }else if (this.ejCompuestos < this.maxCompuestos) {
      this.ejerciciosCompuestosPorDia.push({ dia: this.i, idEjercicio: ejercicioId });
      this.ejCompuestos++;
      console.log(`Compuesto guardado - Día ${this.i}, ID: ${ejercicioId}`);
      console.log('Ejercicios compuestos por día:', this.ejerciciosCompuestosPorDia);

      //Pasar datos al back para insertarlos en RutinaUsuarios
      const usuario = this.usuarioService.getUsuario();
      if (!usuario || usuario.id === undefined) {
        console.error('Usuario no válido o sin ID');
        return;
      }

      const rutinaUsuarios = new RutinaUsuarios(
        usuario.id,   
        this.i,
        ejercicioId
      );

      this.usuarioService.rellenarRutinaUsuarios(rutinaUsuarios).subscribe({
        next: res => console.log('Asignación exitosa', res),
        error: err => console.error('Error al asignar', err)
      }); 

    }else{//Si has superado el tope no te permite añadir el ejercicio
      Swal.fire({
        icon: 'error',
        title: 'No puedes añadir mas ejercicios compuestos',
        text: 'Has superado el límite establecido, elimina los que tienes o ve al siguiente paso',
      });
    }
  }

// Guarda un ejercicio aislado para el día actual
  guardarAislado(ejercicioId: number) {

    // Verificamos si ya fue añadido ese ejercicio para ese día
    if(this.ejerciciosAisladosPorDia.some(e => e.dia === this.i && e.idEjercicio === ejercicioId)){
      Swal.fire({
        icon: 'error',
        title: 'Ejercicio ya añadido',
        text: 'No puedes añadir dos ejercicios iguales a la rutina de un mismo día, por favor, selecciona otro',
      });
    //Si no hay problema se añade el ejercicio  
    }else if (this.ejAislados < this.maxAislados) {
      this.ejerciciosAisladosPorDia.push({ dia: this.i, idEjercicio: ejercicioId });
      this.ejAislados++;
      console.log(`Aislado guardado - Día ${this.i}, ID: ${ejercicioId}`);
      console.log('Ejercicios aislados por día:', this.ejerciciosAisladosPorDia);

      //Pasar datos al back para insertarlos en RutinaUsuarios
      const usuario = this.usuarioService.getUsuario();
      if (!usuario || usuario.id === undefined) {
        console.error('Usuario no válido o sin ID');
        return;
      }

      const rutinaUsuarios = new RutinaUsuarios(
        usuario.id,   
        this.i,
        ejercicioId
      );

      this.usuarioService.rellenarRutinaUsuarios(rutinaUsuarios).subscribe({
        next: res => console.log('Asignación exitosa', res),
        error: err => console.error('Error al asignar', err)
      }); 

    }else{
      Swal.fire({
        icon: 'error',
        title: 'No puedes añadir mas ejercicios aislados',
        text: 'Has superado el límite establecido, elimina los que tienes o ve al siguiente paso',
      });
    }
  }

// Pasa al día siguiente 
  siguienteDia() {
    if (this.ejCompuestos >= this.minCompuestos && this.ejAislados >= this.minAislados) {
      if (this.i < this.diasPorSemana) {
        this.i++;
        this.ejCompuestos = 0;
        this.ejAislados = 0;
        console.log(`Avanzando al día ${this.i}`);

        this.cargarEjerciciosPorDia(); // 👈 recarga ejercicios para el nuevo día

        window.scrollTo({ top: 0, behavior: 'smooth' }); //te lleva al inicio de la pag
      } else if (this.i = this.diasPorSemana) {
        Swal.fire({
          icon: 'success',
          title: 'Rutina guardada correctamente',
          text: 'Ya has rellenado tu rutina con ejerciocios, ahora usala durante dos semanas y no olvides apuntar el progreso',
        });
      }else {
        console.log('Rutina completada. Ejercicios finales:');
        console.log('Compuestos por día:', this.ejerciciosCompuestosPorDia);
        console.log('Aislados por día:', this.ejerciciosAisladosPorDia);
      }
    } else {
      console.warn('No se cumplen los mínimos para avanzar de día.');
    }
  }





//ALERTAS Y COMPROBACIONES
/*-------------------------------------------------------------------------------------------------------------------------- */ 
  //Comprobar que no tienes una rutina rellena
  verificarRutinaExistente() {
    const idUsuario = this.usuarioService.getUsuarioId();

    if (idUsuario === null) {
      Swal.fire('Error', 'No se encontró el usuario', 'error');
      return;
    }

    //Si hay registros en rutina_usuarios
    this.usuarioService.yaTienesRutina(idUsuario).subscribe({
      next: (existe) => {
        if (existe) {
          // Mostrar SweetAlert con opciones
          Swal.fire({
            title: 'Ya tienes registros guardados ¿Qué deseas hacer?',
            text: 'Si has cambiado de rutina te recomendamos borrar los registros y comenzar de nuevo con tu rutina asignada',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar registros y rellenar la nueva rutina',
            cancelButtonText: 'Conservar los registros de mi rutina'
          }).then((result) => {
            if (result.isConfirmed) {
              // Eliminar rutina
              this.usuarioService.eliminarRutinaUsuario(idUsuario).subscribe({
                next: () => {
                  Swal.fire('Eliminada', 'Tu rutina ha sido eliminada. Ahora puedes crear una nueva.', 'success');
                },
                error: () => {
                  Swal.fire('Error', 'No se pudo eliminar la rutina', 'error');
                }
              });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
             this.router.navigate(['/home/infoPrincipal']);

            }
          });
        } else {
          // No tiene rutina, seguir como siempre
          Swal.fire('¡Perfecto!', 'No tienes rutina, puedes crear una.', 'success');
          // Aquí puedes llamar a tu método para comenzar la creación
        }
      },
      error: () => {
        Swal.fire('Error', 'Error al verificar la rutina', 'error');
      }
    });
  }

  /*------------------------------------*/
}
