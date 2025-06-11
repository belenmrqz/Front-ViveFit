export interface TipoRutina {

    id: number;            // Identificador único
    nombreRutina: string;        // Nombre de la rutina
    distribucion: string;         // Distribución de la rutina (ej: torso/pierna)
    numEjercicios: number;       // Número total de ejercicios
    series: string;               // Número de series por ejercicio
    repeticiones: string;         // Rango de repeticiones
    parteA: string;              // Primera parte del entrenamiento
    parteB: string;              // Segunda parte del entrenamiento
    descripcion: string;          // Explicación de la rutina
    
}
