import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-welcome-component',
  imports: [
    RouterLink
  ],
  templateUrl: './welcome-component.html',
  styleUrl: './welcome-component.scss'
})
export class WelcomeComponent {

}
