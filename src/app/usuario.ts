export class Usuario {
    
    id?: number;  // Opcional porque se genera automáticamente al crear

  nombre!: string;
  apellidos!: string;
  email!: string;
  contrasena!: string;

  sexo?: 'masculino' | 'femenino' ;  

  peso?: number;
  fechaNacimiento?: Date;
  altura?: number;

  horasSuenoDiarias?: number;
  horasActivasDiarias?: number;

  tmb?: number;
  tmbActivo?: number;
  imc?: number;

  imcOms?: 
    'bajo peso' |
    'peso normal' |
    'sobrepeso' |
    'obesidad grado 1' |
    'obesidad grado 2' |
    'obesidad mórbida grado 3';

  porcentajeGrasa?: number;
  porcentajeMusculo?: number;

  lipidos?: number;
  hidratos?: number;
  proteina?: number;

  idRutina?: number;   
  repetirContrasena: any;

}
