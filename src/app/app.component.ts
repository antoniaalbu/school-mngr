import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { CommonModule } from '@angular/common';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { environment } from './enviroment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule, AngularFireModule, AngularFireAuthModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isHomePage: boolean = false;

  // Inject Firebase Auth
  private auth: Auth = inject(Auth);

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize Firebase with the environment config
    AngularFireModule.initializeApp(environment.firebase);

    // Listen to router events and set `isHomePage` when the current route is the home page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isHomePage = event.urlAfterRedirects === '/';
    });
  }
}
