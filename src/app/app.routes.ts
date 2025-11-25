import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio';
import { LoginComponent } from './login/login';
import { CadastroEstabelecimento } from './cadastro/cadastro';
import { Estabelecimento } from './estabelecimento/estabelecimento';


export const routes: Routes = [

    { path: '', component: InicioComponent },
    { path: 'login', component: Login },
    { path: 'cadastro', component: CadastroEstabelecimento }  
];
