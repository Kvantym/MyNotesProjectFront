import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.commponent';
import { RegisterComponent } from './auth/register/register.component';
import { CreateBoardComponent } from './board/createBoard/createboard.component';
import { ShowBoardComponent } from './board/showboard/showboard.component';
import { UpdateUserComponent } from './auth/profil/profil.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {path:'dashboard', component:DashboardComponent},
  {path:'register', component:RegisterComponent },
{path:'create-board', component:CreateBoardComponent},
 { path: 'boards/:id', component: ShowBoardComponent },
 {path: 'profil', component: UpdateUserComponent},

    { path: '**', redirectTo: 'login' },
];
