export interface Progreso {
  idProgreso?: number; // Opcional porque lo genera el backend
  idUsuario: number;
  sesionNumero: number;
  serieNumero: number;
  pesoUsado: number;
  repeticionesRealizadas: number;
  fecha: string; // ISO (yyyy-MM-dd)
  idEjercicio: number;
  semanaNumero: number;
}
