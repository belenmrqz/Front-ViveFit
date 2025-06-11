export class RutinaUsuarios {

    idUsuario: number;
  idDiaRutina: number;
  idEjercicio: number;

  constructor(id_usuario: number, id_dia_rutina: number, id_ejercicio: number) {
    this.idUsuario = id_usuario;
    this.idDiaRutina = id_dia_rutina;
    this.idEjercicio = id_ejercicio;
  }
}
