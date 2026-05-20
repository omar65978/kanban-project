import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, combineLatest } from 'rxjs';
import { Board, Column, Task, KanbanState, ModalState, ModalType } from '../models/kanban.model';
import { INITIAL_DATA } from '../data/initial-data';

const STORAGE_KEY = 'kanban_state';
const COLORS = ['#49C4E5','#8471F2','#67E2AE','#EA5555','#F0C100','#E99138','#49E5C4','#F26C6C','#635FC7','#A8A4FF'];

function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

@Injectable({ providedIn: 'root' })
export class KanbanService {
  private _state$ = new BehaviorSubject<KanbanState>(this.loadState());
  private _modal$ = new BehaviorSubject<ModalState>({ type: null });

  // ── Public observables ──
  readonly state$    = this._state$.asObservable();
  readonly modal$    = this._modal$.asObservable();
  readonly boards$   = this.state$.pipe(map(s => s.boards));
  readonly activeBoard$ = this.state$.pipe(
    map(s => s.boards.find(b => b.id === s.activeBoardId) ?? s.boards[0] ?? null)
  );

  // ── Private helpers ──
  private get state(): KanbanState { return this._state$.value; }

  private setState(state: KanbanState): void {
    this._state$.next(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  private updateBoards(boards: Board[]): void {
    this.setState({ ...this.state, boards });
  }

  private loadState(): KanbanState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as KanbanState;
        if (parsed?.boards?.length) return parsed;
      }
    } catch { /* ignore */ }
    return { boards: INITIAL_DATA, activeBoardId: INITIAL_DATA[0]?.id ?? null };
  }

  private nextColor(existingColors: string[]): string {
    for (const c of COLORS) {
      if (!existingColors.includes(c)) return c;
    }
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  // ── Board operations ──
  setActiveBoard(id: string): void {
    this.setState({ ...this.state, activeBoardId: id });
  }

  addBoard(name: string, columnNames: string[]): void {
    const usedColors: string[] = [];
    const columns: Column[] = columnNames
      .filter(n => n.trim())
      .map(n => {
        const color = this.nextColor(usedColors);
        usedColors.push(color);
        return { id: uid(), name: n.trim(), color, tasks: [] };
      });
    const board: Board = { id: uid(), name: name.trim(), columns };
    const boards = [...this.state.boards, board];
    this.setState({ boards, activeBoardId: board.id });
  }

  editBoard(boardId: string, name: string, columnEdits: { id?: string; name: string }[]): void {
    const boards = this.state.boards.map(b => {
      if (b.id !== boardId) return b;
      const existingColors = b.columns.map(c => c.color);
      const columns: Column[] = columnEdits
        .filter(c => c.name.trim())
        .map(c => {
          if (c.id) {
            const existing = b.columns.find(col => col.id === c.id);
            if (existing) return { ...existing, name: c.name.trim() };
          }
          const color = this.nextColor(existingColors);
          existingColors.push(color);
          return { id: uid(), name: c.name.trim(), color, tasks: [] };
        });
      return { ...b, name: name.trim(), columns };
    });
    this.updateBoards(boards);
  }

  deleteBoard(boardId: string): void {
    const boards = this.state.boards.filter(b => b.id !== boardId);
    const activeBoardId = boards.length ? boards[0].id : null;
    this.setState({ boards, activeBoardId });
  }

  // ── Task operations ──
  addTask(boardId: string, task: { title: string; description: string; status: string; subtasks: { title: string }[] }): void {
    const boards = this.state.boards.map(b => {
      if (b.id !== boardId) return b;
      const columns = b.columns.map(col => {
        if (col.name !== task.status) return col;
        const newTask = {
          id: uid(),
          title: task.title.trim(),
          description: task.description.trim(),
          status: task.status,
          subtasks: task.subtasks.filter(s => s.title.trim()).map(s => ({ title: s.title.trim(), isCompleted: false }))
        };
        return { ...col, tasks: [...col.tasks, newTask] };
      });
      return { ...b, columns };
    });
    this.updateBoards(boards);
  }

  editTask(boardId: string, taskId: string, updates: { title: string; description: string; status: string; subtasks: { title: string; isCompleted: boolean }[] }): void {
    const boards = this.state.boards.map(b => {
      if (b.id !== boardId) return b;
      // Remove from old column, add to new
      let task: Task | null = null;
      const columns = b.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => {
          if (t.id === taskId) { task = t; return false; }
          return true;
        })
      }));
      if (!task) return b;
      const updatedTask: Task = {
        ...(task as Task),
        title: updates.title.trim(),
        description: updates.description.trim(),
        status: updates.status,
        subtasks: updates.subtasks.filter(s => s.title.trim()).map(s => ({ title: s.title.trim(), isCompleted: s.isCompleted }))
      };
      const finalColumns = columns.map(col => {
        if (col.name !== updates.status) return col;
        return { ...col, tasks: [...col.tasks, updatedTask] };
      });
      return { ...b, columns: finalColumns };
    });
    this.updateBoards(boards);
  }

  deleteTask(boardId: string, taskId: string): void {
    const boards = this.state.boards.map(b => {
      if (b.id !== boardId) return b;
      return {
        ...b,
        columns: b.columns.map(col => ({
          ...col,
          tasks: col.tasks.filter(t => t.id !== taskId)
        }))
      };
    });
    this.updateBoards(boards);
  }

  toggleSubtask(boardId: string, taskId: string, subtaskIdx: number): void {
    const boards = this.state.boards.map(b => {
      if (b.id !== boardId) return b;
      return {
        ...b,
        columns: b.columns.map(col => ({
          ...col,
          tasks: col.tasks.map(t => {
            if (t.id !== taskId) return t;
            const subtasks = t.subtasks.map((s, i) =>
              i === subtaskIdx ? { ...s, isCompleted: !s.isCompleted } : s
            );
            return { ...t, subtasks };
          })
        }))
      };
    });
    this.updateBoards(boards);
  }

  moveTask(boardId: string, taskId: string, newStatus: string): void {
    const boards = this.state.boards.map(b => {
      if (b.id !== boardId) return b;
      let task: Task | null = null;
      const stripped = b.columns.map(col => ({
        ...col,
        tasks: col.tasks.filter(t => {
          if (t.id === taskId) { task = t; return false; }
          return true;
        })
      }));
      if (!task) return b;
      const moved = stripped.map(col => {
        if (col.name !== newStatus) return col;
        return { ...col, tasks: [...col.tasks, { ...(task as Task), status: newStatus }] };
      });
      return { ...b, columns: moved };
    });
    this.updateBoards(boards);
  }

  // ── Drag & drop reorder ──
  reorderTask(boardId: string, fromColId: string, toColId: string, fromIdx: number, toIdx: number): void {
    const boards = this.state.boards.map(b => {
      if (b.id !== boardId) return b;
      const columns = b.columns.map(c => ({ ...c, tasks: [...c.tasks] }));
      const fromCol = columns.find(c => c.id === fromColId);
      const toCol   = columns.find(c => c.id === toColId);
      if (!fromCol || !toCol) return b;

      const [task] = fromCol.tasks.splice(fromIdx, 1);
      task.status = toCol.name;
      toCol.tasks.splice(toIdx, 0, task);
      return { ...b, columns };
    });
    this.updateBoards(boards);
  }

  // ── Modal ──
  openModal(type: ModalType, extra?: Partial<ModalState>): void {
    this._modal$.next({ type, ...extra });
  }

  closeModal(): void {
    this._modal$.next({ type: null });
  }

  getTaskById(boardId: string, taskId: string): Task | null {
    const board = this.state.boards.find(b => b.id === boardId);
    if (!board) return null;
    for (const col of board.columns) {
      const t = col.tasks.find(t => t.id === taskId);
      if (t) return t;
    }
    return null;
  }

  getColumnForTask(boardId: string, taskId: string): Column | null {
    const board = this.state.boards.find(b => b.id === boardId);
    if (!board) return null;
    return board.columns.find(col => col.tasks.some(t => t.id === taskId)) ?? null;
  }
}
