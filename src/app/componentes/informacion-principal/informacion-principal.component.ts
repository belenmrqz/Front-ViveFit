import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-informacion-principal',
  standalone: false,
  templateUrl: './informacion-principal.component.html',
  styleUrl: './informacion-principal.component.css'
})
export class InformacionPrincipalComponent {


  constructor(private router: Router) {}

//Ruteo  
 irAMiRutina(){
  this.router.navigate(['home/miRutina'])
 }

 irADieta(){
  this.router.navigate(['home/crearDieta'])
 }

}
