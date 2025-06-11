export class Ejercicio {

    id: number; // Usado en frontend
    id_ejercicio: number; // Mantienes el original por si lo necesitas
    nombre: string;
    composicion:  'compuesto' | 'aislado';
    musculos_implicados: string;
    instrumento: 'maquina' | 'mancuerna' | 'barra' | 'otro' | 'polea' | 'sin peso';
    tipo_a: 'tren_superior' | 'tren_inferior';
    tipo_b: 'empuje' | 'traccion' | 'pierna' | 'gluteo' | 'abdominales';
    tipo_c: 'empuje' | 'tricep-pecho' | 'bicep-espalda' | 'pierna' |  'hombro abdominales';
    especialidad: 'hipertrofia_fuerza' | 'hiit' | 'funcional' | 'comodin';
    descripcion: string;
   
    constructor(data: any) {
        // Compatibilidad con distintos nombres de ID
        this.id_ejercicio = data.id_ejercicio;
        this.id = data.id_ejercicio || data.id || data._id;
    //this.id_ejercicio = data.id_ejercicio;
        this.nombre = data.nombre;
        this.composicion = data.composicion;
        this.musculos_implicados = data.musculos_implicados;
        this.instrumento = data.instrumento;
        this.tipo_a = data.tipo_a;
        this.tipo_b = data.tipo_b;
        this.tipo_c = data.tipo_c;
        this.especialidad = data.especialidad;
        this.descripcion = data.descripcion;
    }
    
}
