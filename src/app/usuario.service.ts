import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuario } from './usuario';
import { Observable } from 'rxjs';
import { TipoRutina } from './tipo-rutina';
import { Ejercicio } from './ejercicio';
import { RutinaUsuarios } from './auxiliar/rutina-usuarios';
import { Progreso } from './auxiliar/progreso';
import { DiaProgreso } from './auxiliar/dia-progreso';
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  //Vamos a guardar la url del listado de empleados del backend, obtiene el listado de todos los empleados
  private baseURL = "http://localhost:8081/api/v1/usuarios"; 
  

  constructor(private httpClient : HttpClient) { }

  //Metodo para registrar un usuario
  registrarUsuario(usuario : Usuario): Observable<Object>{
    return this.httpClient.post(`${this.baseURL}`, usuario);
  }

  //Método que comprueba que el email no este repetido
  emailRepetido(email: string): Observable<boolean>{
    return this.httpClient.get<boolean>(`${this.baseURL}/validar-email?email=${email}`);
  }

  //Método para hacer login 
  login(email: string, contrasena: string): Observable<any> {
    const datos = { email, contrasena };
    return this.httpClient.post(`${this.baseURL}/login`, datos);
  }

  
  // Método para configurar la rutina
  configurarRutina(datosFormulario: any): Observable<any> {
    return this.httpClient.post('http://localhost:8081/api/v1/usuarios/configurar', datosFormulario);
  }

  getRutinaPorId(idRutina: number): Observable<TipoRutina>{
    return this.httpClient.get<TipoRutina>(`http://localhost:8081/api/v1/rutina/${idRutina}`);
  }


  getUsuarioId(): number | null {
    if (typeof window !== 'undefined' && localStorage.getItem('usuario')) {
      const usuario = JSON.parse(localStorage.getItem('usuario')!);
      return usuario?.id || null;
    } 
    return null;
  }
  
  getUsuario(): Usuario | null {
    if (typeof window !== 'undefined') {
      const usuario = localStorage.getItem('usuario');
      return usuario ? JSON.parse(usuario) as Usuario : null;
    }
    return null;
  }

  //Obtenemos los filtros segun la rutina que sea 
  getFiltrosPorId(idRutina: number): Observable<any> {
    return this.httpClient.get<any>(`http://localhost:8081/api/v1/filtros/${idRutina}`);
  }
  
  //Obtenemos los ejercicios segun las caracteristicas de la rutina (GET)
  obtenerEjerciciosPorEspecialidad(especialidad: string, composicion: string, idRutina: number, dia: number): Observable<Ejercicio[]> {
    return this.httpClient.get<any[]>(`http://localhost:8081/api/v1/filtrados`, {
      params: {
      especialidad,
      composicion,
      idRutina: idRutina.toString(),
      diaDeLaRutina: dia.toString()
    }  
    });
  }

  //Enviar datos a RutinaUsuarios
  rellenarRutinaUsuarios(rutinaUsuarios: RutinaUsuarios): Observable<any> {
    return this.httpClient.post('http://localhost:8081/api/v1/rutina-usuarios', rutinaUsuarios);
  }

  //Comprobar si ya tiene una rutina rellena
  yaTienesRutina(idUsuario: number): Observable<boolean> {
    return this.httpClient.get<boolean>(`http://localhost:8081/api/v1/rutina-usuarios/existe/${idUsuario}`);
  }

  //Eliminma los registros de la tabla rutina_usuarios
  eliminarRutinaUsuario(idUsuario: number): Observable<any> {
    return this.httpClient.delete(`http://localhost:8081/api/v1/rutina-usuarios/eliminar/${idUsuario}`, { responseType: 'text' });
  }

  //Obtener lista de ejercicios del usuario por dias
  obtenerEjerciciosPorUsuarioYDia(idUsuario: number, idDiaRutina: number): Observable<Ejercicio[]> {
    return this.httpClient.get<Ejercicio[]>(`http://localhost:8081/api/v1/rutina-usuarios/ejercicios/${idUsuario}/${idDiaRutina}`);
  }

  //Método que guarda el progreso del día  
  guardarProgreso(progresos: Progreso[]): Observable<any> {
    return this.httpClient.post(`http://localhost:8081/api/v1/progreso/guardar`, progresos, { responseType: 'text' });
  }

  //Método que obtiene el progreso completo del usuario 
  obtenerProgreso(idUsuario: number, semana: number, sesion: number): Observable<Progreso[]> {
    return this.httpClient.get<Progreso[]>(`http://localhost:8081/api/v1/progreso/${idUsuario}/semana/${semana}/sesion/${sesion}`);
  }

  //
  obtenerUltimoProgreso(idUsuario: number): Observable<Progreso | null> {
  return this.httpClient.get<Progreso | null>(`http://localhost:8081/api/v1/progreso/ultimo/${idUsuario}`);
  }

  getProgresoPorUsuarioYEjercicio(idUsuario: number, idEjercicio: number) {
  return this.httpClient.get<Progreso[]>(`http://localhost:8081/api/v1/progreso/usuario/${idUsuario}/ejercicio/${idEjercicio}`);
}

crearRutina(idUsuario: number, data: any): Observable<any> {
  return this.httpClient.post(`http://localhost:8081/api/v1/crear-rutina/${idUsuario}`, data);
}

obtenerUsuarioPorId(id: number): Observable<any> {
  return this.httpClient.get<any>(`http://localhost:8081/api/v1/usuarios/${id}`);
}

comprobarDatosDieta(idUsuario: number): Observable<boolean> {
  return this.httpClient.get<boolean>(`http://localhost:8081/api/v1/usuarios/${idUsuario}/datos-dieta-completos`);
}

actualizarDatosUsuario(idUsuario: number, datosActualizados: any): Observable<any> {
  return this.httpClient.put(`http://localhost:8081/api/v1/usuarios/${idUsuario}`, datosActualizados);
}

getProgresoCompleto(idUsuario: number) {
    return this.httpClient.get<DiaProgreso[]>(
      `http://localhost:8081/api/v1/progreso/usuario/${idUsuario}/progreso-completo`
    );
  } 


  comprobarSiTieneRutina(id: number): Observable<any> {
    return this.httpClient.get(`http://localhost:8081/api/v1/usuarios/${id}/tiene-rutina`);
  }

  eliminarRutina(id: number): Observable<any> {
    return this.httpClient.put(`http://localhost:8081/api/v1/usuarios/${id}/eliminar-rutina`, {});
  }

  resetearUsuario(idUsuario: number): Observable<any> {
  return this.httpClient.delete(`http://localhost:8081/api/v1/usuarios/reset/${idUsuario}`);
}

}

