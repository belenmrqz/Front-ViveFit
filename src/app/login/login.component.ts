import { Component, OnInit } from '@angular/core';
import { Usuario } from '../usuario';
import { UsuarioService } from '../usuario.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  usuario : Usuario = new Usuario();
  emailRepetido : boolean = false; //Aquí se guarda si el email se repite en la bbdd

  passwordPattern: string = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,25}$';

  ocultarRegistro: boolean = false;
  
  usuarioContrasena = { //Aquí se comparam las contraseñas al registrarse para que sean iguales 
    contrasena: '',
    confirmarContrasena: ''
  };


  constructor(private usuarioServicio: UsuarioService, private router:Router){ }

  ngOnInit(): void{
  }

  //Iniciar sesión o registrarte 
  iniciarSesion(){
    this.ocultarRegistro = true;
  }
  registrate(){
    this.ocultarRegistro = false;
  }

  IniciarSesion(){
    if (!this.usuario.email || !this.usuario.contrasena) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, rellena todos los campos',
      });
      return;
    }
  
    this.usuarioServicio.login(this.usuario.email, this.usuario.contrasena).subscribe(
      (usuario) => {
        console.log('Respuesta del login:', usuario); 
        localStorage.setItem('token', usuario.token);
        localStorage.setItem('usuario', JSON.stringify(usuario));

        Swal.fire({
          icon: 'success',
          title: '¡Login correcto!',
          text: `Bienvenido/a ${usuario.nombre}`,
        });
        this.router.navigate(['/home']); // Cambiá la ruta según tu app
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error de login',
          text: 'Email o contraseña incorrectos',
        });
      }
    );
  }

  //Registrar usuario
  registrarUsuario(){
    if (!this.usuario.nombre || !this.usuario.apellidos || !this.usuario.fechaNacimiento || !this.usuario.email || !this.usuario.contrasena ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor, rellena todos los campos',
      });
      return;
    }

    this.usuarioServicio.registrarUsuario(this.usuario).subscribe(usuarioCreado => {
      console.log(usuarioCreado);
      localStorage.setItem('usuario', JSON.stringify(usuarioCreado));
      this.alertaRegistroCorrecto();
      this.router.navigate(['/home']);
    }, error => {
      console.log(error);
      this.alertaRegistroFallido();
    });
  }

  verificarEmail(){
    if(this.usuario.email && this.usuario.email !== ''){
      this.usuarioServicio.emailRepetido(this.usuario.email).subscribe(
        (respuesta: boolean) => {
          this.emailRepetido = respuesta;
        },
        error => {
          console.log('Error al verificar email', error);
          this.emailRepetido = false
          Swal.fire({
            icon: 'error',
            title: 'El email ya existente',
            text: 'Ya hay un usuario registrado con ese email, por favor registrese con uno diferente',
          });
        }
      );
    }
  }


  alertaRegistroCorrecto(){
    Swal.fire({
      icon: 'success',
      title: 'Usuario registrado',
      text: 'El usuario fue guardado correctamente',
    });
  }

  alertaRegistroFallido(){
    Swal.fire({
      icon: 'error',
      title: 'Error de registro',
      text: 'No hemos podido registrar el usuario, intentelo de nuevo',
    });
  }

  onSubmit(formulario : NgForm){

    // Marcar todos los campos como tocados
    Object.values(formulario.controls).forEach((control) => {
      control.markAsTouched();
    });

    //Si los campos estan vacios
    if (formulario.invalid ) {  

      // Buscar el primer campo con error
      const primerCampoConError = Object.keys(formulario.controls).find(
        (key) => formulario.controls[key].invalid
      );

      if (primerCampoConError) {
        // Buscar el elemento en el DOM
        const elemento = document.getElementsByName(primerCampoConError)[0];
        if (elemento) {
          elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
          elemento.focus(); // También hace que el cursor vaya allí
        }
      }

      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, rellena todos los campos para registrarse',
      });
      return;
    }

    //Si el email ya exist en la bbdd
    if (this.emailRepetido){
      Swal.fire({
        icon: 'error',
        title: 'El email ya existente',
        text: 'Ya hay un usuario registrado con ese email, por favor registrese con uno diferente',
      });
      return;
    }

    //Si las contraseñas no coinciden
    if (this.usuario.contrasena !== this.usuarioContrasena.confirmarContrasena) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseñas no coinciden',
        text: 'Por favor, asegúrate de que ambas contraseñas sean iguales',
      });
      return;
    }

    //Si todo está correcto
    this.registrarUsuario();
   
  
  }


}
