import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _isDark$ = new BehaviorSubject<boolean>(this.loadTheme());
  readonly isDark$ = this._isDark$.asObservable();

  get isDark(): boolean { return this._isDark$.value; }

  private loadTheme(): boolean {
    const stored = localStorage.getItem('kanban_theme');
    if (stored !== null) return stored === 'dark';
    return !window.matchMedia('(prefers-color-scheme: light)').matches;
  }

  toggle(): void {
    const next = !this._isDark$.value;
    this._isDark$.next(next);
    localStorage.setItem('kanban_theme', next ? 'dark' : 'light');
    this.applyTheme(next);
  }

  applyTheme(isDark: boolean): void {
    document.documentElement.classList.toggle('light', !isDark);
  }

  init(): void {
    this.applyTheme(this._isDark$.value);
  }
}
