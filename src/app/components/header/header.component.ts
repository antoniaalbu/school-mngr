import { Component, OnInit } from '@angular/core';
import { ConfigService, MenuItem } from '../../services/config.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.configService.getConfig().subscribe(config => {
      this.menu = config.menu.filter(item => item.enabled);  // Ensure only enabled items are shown
      this.sticky = config.header.sticky; // Apply header config
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
