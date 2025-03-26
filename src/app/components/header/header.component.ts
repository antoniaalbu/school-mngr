import { Component, OnInit } from '@angular/core';
import { ConfigService, MenuItem } from '../../services/config.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  menu: MenuItem[] = [];
  sticky = false;
  menuOpen = false;

  constructor(private configService: ConfigService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.configService.getConfig().subscribe(config => {
      this.menu = config.menu.filter(item => item.enabled);  
      this.sticky = config.header.sticky; 
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  onLogout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/auth']); 
    });
  }
}
