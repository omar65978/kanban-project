import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanbanService } from '../../services/kanban.service';
import { ThemeService } from '../../services/theme.service';
import { Board } from '../../models/kanban.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() visible = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  boards$      = this.kanban.boards$;
  activeBoard$ = this.kanban.activeBoard$;
  isDark$      = this.theme.isDark$;

  constructor(
    public kanban: KanbanService,
    public theme: ThemeService
  ) {}

  selectBoard(id: string): void { this.kanban.setActiveBoard(id); }
  openAddBoard(): void          { this.kanban.openModal('add-board'); }
  hideSidebar(): void           { this.toggleSidebar.emit(); }
  toggleTheme(): void           { this.theme.toggle(); }
}
