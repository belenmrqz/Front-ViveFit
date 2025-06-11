import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './componentes/navbar/navbar.component';
import { CrearRutinaComponent } from './componentes/crear-rutina/crear-rutina.component';
import { CrearDietaComponent } from './componentes/crear-dieta/crear-dieta.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { InformacionPrincipalComponent } from './componentes/informacion-principal/informacion-principal.component';
import { MiRutinaComponent } from './componentes/mi-rutina/mi-rutina.component';
import { ProgresoComponent } from './componentes/progreso/progreso.component';



@NgModule({
  declarations: [
    AppComponent,  LoginComponent, HomeComponent, NavbarComponent, CrearRutinaComponent, CrearDietaComponent, PerfilComponent, InformacionPrincipalComponent, MiRutinaComponent, ProgresoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
