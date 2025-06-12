import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../usuario.service';
import { Usuario } from '../../usuario';
import { HttpClient } from '@angular/common/http';
import { TipoRutina } from '../../tipo-rutina';
import { MiRutinaComponent } from '../mi-rutina/mi-rutina.component';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit{

//Para obtener los datos de la BBDD
 usuario: Usuario | null = null; 
 rutina: TipoRutina | null = null;

 verFormulario01: boolean= false; //Editar info personal

 constructor(private usuarioService: UsuarioService, private router: Router, private formBuilder: FormBuilder) {}

 ngOnInit(): void { //Para obtener los datos de la BBDD
   this.usuario = this.usuarioService.getUsuario();

   if (this.usuario?.idRutina) {
    this.usuarioService.getRutinaPorId(this.usuario.idRutina).subscribe(data => {
      this.rutina = data;
    });
  }
 }

btnEditarInfoPersonal() {
  if (this.usuario) {
    this.cargarInfoFormulario(this.usuario);
    this.verFormulario01 = true;
  }
}



 //Ruteo cerrar sesion 
 cerrarSesion(){
 this.router.navigate(['']);
 }

 //Ruteo mi rutina 
 irAMiRutina(){
  this.router.navigate(['home/miRutina'])
 }

 //Ruteo progreso
 irAProgreso(){
  this.router.navigate(['home/progreso'])
 }

 //Ruteo progreso
 irADieta(){
  this.router.navigate(['home/crearDieta'])
 }


 //Para editar datos personales 
 form!: FormGroup;

 cargarInfoFormulario(usuario: any) { //Este método va a cargar los datos del usuario en el formulario para editarlos
  this.form = this.formBuilder.group({
  nombre: [usuario.nombre],
  apellidos: [usuario.apellidos],
  email: [usuario.email],
  contrasena: [''], // opcional
  fechaNacimiento: [usuario.fechaNacimiento]
});

}

editarInfoPersonal() {
  if (this.form.valid && this.usuario && this.usuario.id !== undefined) {
  const datosActualizados = this.form.value;

  this.usuarioService.actualizarDatosUsuario(this.usuario.id, datosActualizados).subscribe({
    next: () => {
        Swal.fire({
        icon: 'success',
        title: 'Datos actualizados correctamente',
      });
        // Actualizamos los datos locales del usuario
        const usuarioActualizado = {
          ...this.usuario,
          ...datosActualizados
        };
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        this.usuario = usuarioActualizado;

        this.verFormulario01 = false;
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        Swal.fire({
        icon: 'error',
        title: 'Error al actualizar datos, intentelo de nuevo más tarde',
      });      }
    });
  }
}


}
