import { Component } from '@angular/core';
import { UsuarioService } from '../../usuario.service';
import { Progreso } from '../../auxiliar/progreso';
import { Usuario } from '../../usuario';
import { Ejercicio } from '../../ejercicio';
import { DiaProgreso } from '../../auxiliar/dia-progreso';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-progreso',
  standalone: false,
  templateUrl: './progreso.component.html',
  styleUrl: './progreso.component.css'
})
export class ProgresoComponent {
  
  usuario: Usuario | null = null;

  idUsuario = 0; 
  semana = 0;
  sesion = 0;
  maxSemana = 8;
  diasPorSemana = 0;

  ejercicios: Ejercicio[] = []; //Array donde se guardaran los ejercicios de ese dia 
  progresoInputs: { [clave: string]: Progreso[] } = {};
  mostrarProgresoHistorico = false; //Ocula el hidtorial del progreso 
  
  progresoCompleto: DiaProgreso[] = [];


  constructor(private usuarioServicio: UsuarioService) {}
  

   ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0]; //Formato dia/mes/año

    this.usuario = this.usuarioServicio.getUsuario();  
    this.idUsuario = this.usuario?.id ?? 0;
    const rutinaUsuario = this.usuario?.idRutina ?? 0;

    if (!this.idUsuario) {
      console.error('Usuario no encontrado');
      return;
    }

    this.usuarioServicio.getFiltrosPorId(rutinaUsuario).subscribe({
    next: (filtros: any) => {
      this.diasPorSemana = filtros.diasPorSemana ?? 2; // fallback 2
      
      // Obtener último progreso para calcular semana y sesión actuales
      this.usuarioServicio.obtenerUltimoProgreso(this.idUsuario).subscribe({
        next: (ultimoProgreso) => {
          if (ultimoProgreso) {
            this.semana = ultimoProgreso.semanaNumero;
            this.sesion = ultimoProgreso.sesionNumero + 1;
            if (this.sesion > this.diasPorSemana) {
              this.sesion = 1;
              this.semana++;
              if (this.semana > this.maxSemana) {
                this.semana = this.maxSemana;

                Swal.fire({
                  title: '¡Has completado las 8 semanas de entrenamiento!',
                  html: `
      <p>🎉 <b>Enhorabuena</b></p>
      <p>Cambia de rutina, elige ejercicios nuevos y ¡dale caña!</p>
      <p>💪 Ve al siguiente nivel</p>
    `,
                  icon: 'success',
                  showCancelButton: true,
                  confirmButtonText: 'Reiniciar rutina',
                  cancelButtonText: 'Más tarde',
                  confirmButtonColor: '#435D75',
                  cancelButtonColor: '#aaa',
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.resetearProgresoYRutina();  // Llama al método que vamos a crear
                  }
                });
              }

            }
          } else {
            // Si no hay progreso previo, inicializamos a semana 1 sesión 1
            this.semana = 1;
            this.sesion = 1;
          }
           this.cargarEjerciciosYInicializarProgreso(today, this.sesion);
        },
        error: (err) => {
          console.error('Error al obtener último progreso', err);
          // Inicializar igual aunque falle
          this.semana = 1;
          this.sesion = 1;
          this.inicializarProgreso(today);
        }
      });
    },
    error: err => {
      console.error('Error al obtener filtros de rutina', err);
      this.semana = 1;
      this.sesion = 1;
      this.inicializarProgreso(today);
    }
  });
  }

  //cargar los ejercicios de usuario correspondiente 
  private cargarEjerciciosYInicializarProgreso(today: string, idDiaRutina: number): void {
    this.usuarioServicio.obtenerEjerciciosPorUsuarioYDia(this.idUsuario, idDiaRutina).subscribe({
      next: (ejerciciosData) => {
        this.ejercicios = ejerciciosData.map(e => new Ejercicio(e)); 
        this.inicializarProgreso(today);
        console.log(ejerciciosData); //Aqui funciona el id del ejercicio
      },
      error: (err) => {
        console.error('Error al obtener ejercicios:', err);
        this.ejercicios = [];
        this.inicializarProgreso(today);
      }
    });
  }


  //Método iniciar progreso
  inicializarProgreso(today: string) {
  const nuevosProgresos: { [key: string]: Progreso[] } = {};

  for (let iEjercicio = 0; iEjercicio < this.ejercicios.length; iEjercicio++) {
    const ejercicio = this.ejercicios[iEjercicio];
    const key = ejercicio.id + '_' + iEjercicio; // clave única por ejercicio

    nuevosProgresos[key] = [];

    for (let i = 0; i < 4; i++) {
      nuevosProgresos[key].push({
        idUsuario: this.idUsuario,
        semanaNumero: this.semana,
        sesionNumero: this.sesion,
        serieNumero: i + 1,
        pesoUsado: 0,
        repeticionesRealizadas: 0,
        idEjercicio: ejercicio.id, 
        fecha: today
      });
    }
  }

  this.progresoInputs = { ...nuevosProgresos };
}




  //Método guardar progreso
  guardarProgreso(): void {
    let progresos: Progreso[] = [];

    for (let key in this.progresoInputs) {
      const [idEjercicioStr] = key.split('_');
      const idEjercicio = parseInt(idEjercicioStr, 10);
      console.log("Los ejercicios son:", this.ejercicios);

      for (let serie of this.progresoInputs[key]) {
        if (serie.repeticionesRealizadas > 0 || serie.pesoUsado > 0) {
          serie.idEjercicio = idEjercicio; // REASIGNAR POR SEGURIDAD
          serie.semanaNumero = this.semana;
          serie.sesionNumero = this.sesion;
          serie.idUsuario = this.idUsuario;
          progresos.push(serie);
        }
      }
    }


    if (progresos.length === 0) {
      alert('No hay datos para guardar.');
      return;
    }

    console.log('Progresos a guardar:', JSON.stringify(progresos, null, 2));

    this.usuarioServicio.guardarProgreso(progresos).subscribe({
      next: res => {
        alert('Progreso guardado con éxito.');
        this.avanzarSesionYSemana();
        this.actualizarFechasProgreso();
      },
      error: err => console.error('Error guardando progreso:', err)
    });
  }



  //Metodo para avanzar sesion y semana
  avanzarSesionYSemana() {
  this.sesion++;
  if (this.sesion > this.diasPorSemana) {
    this.sesion = 1;
    this.semana++;
    if (this.semana > this.maxSemana) {
      this.semana = this.maxSemana;

      // ⬇️ TU ALERTA SWEETALERT2 AQUÍ
      Swal.fire({
        title: '¡Has completado las 8 semanas de entrenamiento!',
        html: `
          <p>🎉 <b>Enhorabuena</b></p>
          <p>Cambia de rutina, elige ejercicios nuevos y ¡dale caña!</p>
          <p>💪 Ve al siguiente nivel</p>
        `,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Reiniciar rutina',
        cancelButtonText: 'Más tarde',
        confirmButtonColor: '#435D75',
        cancelButtonColor: '#aaa',
      }).then((result) => {
        if (result.isConfirmed) {
          this.resetearProgresoYRutina();
        }
      });

      return; 
    }
  }
}


  //Actualizar datos 
  actualizarFechasProgreso() {
  const today = new Date().toISOString().split('T')[0];

  for (let key in this.progresoInputs) {
    this.progresoInputs[key].forEach((serie) => {
      serie.semanaNumero = this.semana;
      serie.sesionNumero = this.sesion;
      serie.pesoUsado = 0;
      serie.repeticionesRealizadas = 0;
      serie.fecha = today;
    });
  }
}


  get tituloProgreso(): string {
    return `Semana ${this.semana}, Sesión ${this.sesion}`;
  }

  getClaveProgreso(idEjercicio: number, index: number): string {
  return `${idEjercicio}_${index}`;
}

/**
   * Nuevo método: al hacer clic en “Ver mi progreso”…
   * - Llama al endpoint que devuelve DiaProgreso[]
   * - Asigna esa respuesta a this.progresoCompleto
   * - Activa mostrarProgresoHistorico para que el template lo muestre
   */
  verMiProgreso(): void {
    this.mostrarProgresoHistorico = false;       // ocultamos temporalmente mientras cargamos
    this.progresoCompleto = [];                  // limpiamos
    this.usuarioServicio.getProgresoCompleto(this.idUsuario).subscribe({
      next: (dias: DiaProgreso[]) => {
        this.progresoCompleto = dias;
        this.mostrarProgresoHistorico = true;
      },
      error: (err) => {
        console.error('Error al obtener progreso completo:', err);
      }
    });
  }

  resetearProgresoYRutina(): void {
    if (!this.idUsuario) return;

    this.usuarioServicio.resetearUsuario(this.idUsuario).subscribe({
      next: () => {
        Swal.fire(
          '¡Listo!',
          'Tu rutina anterior ha sido eliminada. Puedes elegir una nueva.',
          'success'
        );
        // Reiniciar variables locales
        this.semana = 1;
        this.sesion = 1;
        this.ejercicios = [];
        this.progresoInputs = {};
        this.mostrarProgresoHistorico = false;
      },
      error: (err) => {
        console.error('Error al resetear datos del usuario:', err);
        Swal.fire('Error', 'No se pudo reiniciar la rutina. Inténtalo más tarde.', 'error');
      }
    });
  }



}
