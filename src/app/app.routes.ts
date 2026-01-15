import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.commponent';
import { RegisterComponent } from './auth/register/register.component';
import { CreateBoardComponent } from './board/createBoard/createboard.component';
import { ShowBoardComponent } from './board/showboard/showboard.component';
import { UpdateUserComponent } from './auth/profil/profil.component';
import {MainLayoutComponent} from './main-layout-component/main-layout-component';
import {WelcomeComponent} from './welcome-component/welcome-component';

export const routes: Routes = [
  // СТОРІНКИ БЕЗ НАВІГАЦІЇ "ГОЛОВНА"
  { path: '', component: WelcomeComponent }, // Твоя нова головна сторінка
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },


  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'create-board', component: CreateBoardComponent },
      { path: 'boards/:id', component: ShowBoardComponent },
      { path: 'profil', component: UpdateUserComponent },
    ]
  },

  { path: '**', redirectTo: '' }, // Якщо помилка — на головну
];


