import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio';
import { LoginComponent } from './login/login';
import { CadastroEstabelecimento } from './cadastro/cadastro';
import { Estabelecimento } from './estabelecimento/estabelecimento';


export const routes: Routes = [

    { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    { path: 'inicio', component: InicioComponent },
    { path: 'login', component: LoginComponent },
    { path: 'cadastro', component: CadastroEstabelecimento },
    { path: 'estabelecimento', component: Estabelecimento } 
];
