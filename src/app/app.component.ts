import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';
import { KanbanService } from './services/kanban.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { BoardComponent } from './components/board/board.component';
import { TaskDetailModalComponent } from './components/modals/task-detail/task-detail-modal.component';
import { AddEditTaskModalComponent } from './components/modals/add-edit-task/add-edit-task-modal.component';
import { AddEditBoardModalComponent } from './components/modals/add-edit-board/add-edit-board-modal.component';
import { DeleteConfirmModalComponent } from './components/modals/delete-confirm/delete-confirm-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    BoardComponent,
    TaskDetailModalComponent,
    AddEditTaskModalComponent,
    AddEditBoardModalComponent,
    DeleteConfirmModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  sidebarVisible = true;
  modal$ = this.kanban.modal$;

  constructor(
    private theme: ThemeService,
    public kanban: KanbanService
  ) {}

  ngOnInit(): void {
    this.theme.init();
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }
}
