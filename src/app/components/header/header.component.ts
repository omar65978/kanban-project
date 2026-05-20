import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanbanService } from '../../services/kanban.service';
import { Board } from '../../models/kanban.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() sidebarVisible = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  activeBoard$ = this.kanban.activeBoard$;
  menuOpen = false;

  constructor(public kanban: KanbanService) {}

  get hasColumns(): boolean {
    const board = this.kanban['_state$'].value.boards.find(
      b => b.id === this.kanban['_state$'].value.activeBoardId
    );
    return (board?.columns?.length ?? 0) > 0;
  }

  addTask(): void   { this.kanban.openModal('add-task'); }
  editBoard(): void { this.menuOpen = false; this.kanban.openModal('edit-board'); }
  deleteBoard(): void { this.menuOpen = false; this.kanban.openModal('delete-board'); }
  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void  { this.menuOpen = false; }
}
