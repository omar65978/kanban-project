import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KanbanService } from '../../../services/kanban.service';
import { Task, Board } from '../../../models/kanban.model';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail-modal.component.html',
  styleUrl: './task-detail-modal.component.scss'
})
export class TaskDetailModalComponent implements OnInit {
  @Input({ required: true }) taskId!: string;
  @Input({ required: true }) columnId!: string;

  task: Task | null = null;
  board: Board | null = null;
  selectedStatus = '';
  menuOpen = false;

  constructor(public kanban: KanbanService) {}

  ngOnInit(): void {
    const state = this.kanban['_state$'].value;
    this.board = state.boards.find(b => b.id === state.activeBoardId) ?? null;
    this.task  = this.kanban.getTaskById(state.activeBoardId!, this.taskId);
    if (this.task) this.selectedStatus = this.task.status;
  }

  get completedCount(): number {
    return this.task?.subtasks.filter(s => s.isCompleted).length ?? 0;
  }

  get columnNames(): string[] {
    return this.board?.columns.map(c => c.name) ?? [];
  }

  toggleSubtask(idx: number): void {
    if (!this.board || !this.task) return;
    this.kanban.toggleSubtask(this.board.id, this.task.id, idx);
    this.task = this.kanban.getTaskById(this.board.id, this.task.id);
  }

  onStatusChange(): void {
    if (!this.board || !this.task) return;
    if (this.selectedStatus !== this.task.status) {
      this.kanban.moveTask(this.board.id, this.task.id, this.selectedStatus);
      this.task = { ...this.task, status: this.selectedStatus };
    }
  }

  editTask(): void {
    this.menuOpen = false;
    this.kanban.closeModal();
    setTimeout(() => this.kanban.openModal('edit-task', { taskId: this.taskId }), 50);
  }

  deleteTask(): void {
    this.menuOpen = false;
    this.kanban.closeModal();
    setTimeout(() => this.kanban.openModal('delete-task', { taskId: this.taskId }), 50);
  }

  close(): void { this.kanban.closeModal(); }

  @HostListener('click', ['$event'])
  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close();
  }
}
