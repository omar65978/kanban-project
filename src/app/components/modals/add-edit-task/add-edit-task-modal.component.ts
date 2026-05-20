import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KanbanService } from '../../../services/kanban.service';
import { Board, Task } from '../../../models/kanban.model';

interface SubtaskForm { title: string; isCompleted: boolean; touched: boolean; }

@Component({
  selector: 'app-add-edit-task-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-edit-task-modal.component.html',
  styleUrl: './add-edit-task-modal.component.scss'
})
export class AddEditTaskModalComponent implements OnInit {
  @Input({ required: true }) mode!: 'add' | 'edit';
  @Input() taskId?: string;

  board: Board | null = null;
  existingTask: Task | null = null;

  title       = '';
  description = '';
  status      = '';
  subtasks: SubtaskForm[] = [{ title: '', isCompleted: false, touched: false }];

  titleTouched = false;
  submitted    = false;

  constructor(public kanban: KanbanService) {}

  ngOnInit(): void {
    const state = this.kanban['_state$'].value;
    this.board  = state.boards.find(b => b.id === state.activeBoardId) ?? null;
    this.status = this.board?.columns[0]?.name ?? '';

    if (this.mode === 'edit' && this.taskId) {
      this.existingTask = this.kanban.getTaskById(state.activeBoardId!, this.taskId);
      if (this.existingTask) {
        this.title       = this.existingTask.title;
        this.description = this.existingTask.description;
        this.status      = this.existingTask.status;
        this.subtasks    = this.existingTask.subtasks.map(s => ({
          title: s.title, isCompleted: s.isCompleted, touched: false
        }));
        if (!this.subtasks.length) this.subtasks = [{ title: '', isCompleted: false, touched: false }];
      }
    }
  }

  get columnNames(): string[] { return this.board?.columns.map(c => c.name) ?? []; }

  get titleError(): string | null {
    if ((this.titleTouched || this.submitted) && !this.title.trim()) return "Can't be empty";
    return null;
  }

  subtaskError(idx: number): string | null {
    const s = this.subtasks[idx];
    if ((s.touched || this.submitted) && !s.title.trim()) return "Can't be empty";
    return null;
  }

  addSubtask(): void {
    this.subtasks.push({ title: '', isCompleted: false, touched: false });
  }

  removeSubtask(idx: number): void {
    this.subtasks.splice(idx, 1);
  }

  save(): void {
    this.submitted = true;
    if (!this.title.trim()) return;
    if (this.subtasks.some(s => !s.title.trim())) return;

    if (this.mode === 'add') {
      this.kanban.addTask(this.board!.id, {
        title: this.title, description: this.description,
        status: this.status,
        subtasks: this.subtasks
      });
    } else if (this.taskId) {
      this.kanban.editTask(this.board!.id, this.taskId, {
        title: this.title, description: this.description,
        status: this.status,
        subtasks: this.subtasks
      });
    }
    this.kanban.closeModal();
  }

  close(): void { this.kanban.closeModal(); }

  @HostListener('click', ['$event'])
  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close();
  }
}
