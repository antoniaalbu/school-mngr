import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';  // Import map and catchError for observable handling

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const expectedRole = next.data['role'];  // Role from route data
    
    // Subscribe to get the current user
    return this.authService.getCurrentUser().pipe(
      map((currentUser) => {
        if (currentUser && currentUser.role === expectedRole) {
          // Role matches, allow access
          return true;
        } else {
          // If role doesn't match, redirect to login
          this.router.navigate(['/auth']);
          return false;
        }
      }),
      catchError(() => {
        // In case of error (e.g., no user), redirect to login
        this.router.navigate(['/auth']);
        return [false];  // Return false if there's an error
      })
    );
  }
}
