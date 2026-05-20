import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanbanService } from '../../../services/kanban.service';
import { Board, Task } from '../../../models/kanban.model';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirm-modal.component.html',
  styleUrl: './delete-confirm-modal.component.scss'
})
export class DeleteConfirmModalComponent implements OnInit {
  @Input({ required: true }) type!: 'board' | 'task';
  @Input() taskId?: string;

  board: Board | null = null;
  task:  Task  | null = null;

  constructor(public kanban: KanbanService) {}

  ngOnInit(): void {
    const state = this.kanban['_state$'].value;
    this.board  = state.boards.find(b => b.id === state.activeBoardId) ?? null;
    if (this.type === 'task' && this.taskId && this.board) {
      this.task = this.kanban.getTaskById(this.board.id, this.taskId);
    }
  }

  get title(): string {
    return this.type === 'board'
      ? `Delete '${this.board?.name}' board?`
      : `Delete '${this.task?.title}' task?`;
  }

  get message(): string {
    return this.type === 'board'
      ? `Are you sure you want to delete the '${this.board?.name}' board? This action will remove all columns and tasks and cannot be reversed.`
      : `Are you sure you want to delete the '${this.task?.title}' task and its subtasks? This action cannot be reversed.`;
  }

  confirm(): void {
    if (this.type === 'board' && this.board) {
      this.kanban.deleteBoard(this.board.id);
    } else if (this.type === 'task' && this.board && this.taskId) {
      this.kanban.deleteTask(this.board.id, this.taskId);
    }
    this.kanban.closeModal();
  }

  close(): void { this.kanban.closeModal(); }

  @HostListener('click', ['$event'])
  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close();
  }
}
