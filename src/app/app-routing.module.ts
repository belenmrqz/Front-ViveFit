import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './componentes/navbar/navbar.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { CrearRutinaComponent } from './componentes/crear-rutina/crear-rutina.component';
import { CrearDietaComponent } from './componentes/crear-dieta/crear-dieta.component';
import { InformacionPrincipalComponent } from './componentes/informacion-principal/informacion-principal.component';
import { MiRutinaComponent } from './componentes/mi-rutina/mi-rutina.component';
import { ProgresoComponent } from './componentes/progreso/progreso.component';

const routes: Routes = [
  {path: '', component:LoginComponent},
  {path: 'home', component:HomeComponent, children:[
    {path: 'perfil', component:PerfilComponent},
    {path: 'crearRutina', component:CrearRutinaComponent},
    {path: 'miRutina', component:MiRutinaComponent},
    {path: 'crearDieta', component:CrearDietaComponent},
    {path: 'progreso', component:ProgresoComponent},
    {path: 'infoPrincipal', component:InformacionPrincipalComponent},
    { path: '', redirectTo: 'infoPrincipal', pathMatch: 'full' } //Este componente aparecerá ya cargado por defecto 
  ]},
  {path: 'navbar', component:NavbarComponent}


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
