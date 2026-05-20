export interface Subtask {
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  subtasks: Subtask[];
}

export interface Column {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
}

export interface KanbanState {
  boards: Board[];
  activeBoardId: string | null;
}

export type ModalType =
  | 'view-task'
  | 'add-task'
  | 'edit-task'
  | 'add-board'
  | 'edit-board'
  | 'delete-board'
  | 'delete-task'
  | null;

export interface ModalState {
  type: ModalType;
  taskId?: string;
  columnId?: string;
}
