import { Routes } from '@angular/router';
import { InicioComponent } from './inicio/inicio';
import { Login } from './login/login';
import { CadastroEstabelecimento } from './cadastro/cadastro';

export const routes: Routes = [

    { path: '', component: InicioComponent },
    { path: 'login', component: Login },
    { path: 'cadastro', component: CadastroEstabelecimento }  
];
