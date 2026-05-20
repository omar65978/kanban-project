import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { KanbanService } from '../../services/kanban.service';
import { TaskCardComponent } from '../task-card/task-card.component';
import { Column, Task } from '../../models/kanban.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, TaskCardComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  activeBoard$ = this.kanban.activeBoard$;

  constructor(public kanban: KanbanService) {}

  get connectedListIds(): string[] {
    const board = this.kanban['_state$'].value.boards.find(
      b => b.id === this.kanban['_state$'].value.activeBoardId
    );
    return (board?.columns ?? []).map(c => 'col-' + c.id);
  }

  trackById(_i: number, item: { id: string }): string { return item.id; }

  onTaskDrop(event: CdkDragDrop<Task[]>, toCol: Column, boardId: string): void {
    const fromColId = event.previousContainer.id.replace('col-', '');
    const toColId   = toCol.id;
    this.kanban.reorderTask(boardId, fromColId, toColId, event.previousIndex, event.currentIndex);
  }

  openAddColumn(): void { this.kanban.openModal('edit-board'); }

  openTask(taskId: string, colId: string): void {
    this.kanban.openModal('view-task', { taskId, columnId: colId });
  }
}
