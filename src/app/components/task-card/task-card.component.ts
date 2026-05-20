import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/kanban.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task-card">
      <h3 class="task-title">{{ task.title }}</h3>
      @if (task.subtasks.length > 0) {
        <p class="subtask-count">
          {{ completedCount }} of {{ task.subtasks.length }} subtasks
        </p>
      }
    </div>
  `,
  styles: [`
    .task-card {
      background: var(--color-surface);
      border-radius: 8px;
      padding: 23px 16px;
      box-shadow: 0 4px 6px rgba(54, 78, 126, 0.1);
      cursor: pointer;
      transition: all 0.15s;
      user-select: none;

      &:hover .task-title { color: #635FC7; }
    }

    .task-title {
      font-size: 15px;
      font-weight: 700;
      line-height: 19px;
      color: var(--color-text-1);
      transition: color 0.15s;
      word-break: break-word;
    }

    .subtask-count {
      font-size: 12px;
      font-weight: 700;
      color: #828FA3;
      margin-top: 8px;
    }
  `]
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;

  get completedCount(): number {
    return this.task.subtasks.filter(s => s.isCompleted).length;
  }
}
