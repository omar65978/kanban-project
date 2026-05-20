import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KanbanService } from '../../../services/kanban.service';
import { Board } from '../../../models/kanban.model';

interface ColForm { id?: string; name: string; touched: boolean; }

@Component({
  selector: 'app-add-edit-board-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-edit-board-modal.component.html',
  styleUrl: './add-edit-board-modal.component.scss'
})
export class AddEditBoardModalComponent implements OnInit {
  @Input({ required: true }) mode!: 'add' | 'edit';

  board: Board | null = null;
  name        = '';
  columns: ColForm[] = [{ name: '', touched: false }];
  nameTouched = false;
  submitted   = false;

  constructor(public kanban: KanbanService) {}

  ngOnInit(): void {
    if (this.mode === 'edit') {
      const state = this.kanban['_state$'].value;
      this.board  = state.boards.find(b => b.id === state.activeBoardId) ?? null;
      if (this.board) {
        this.name    = this.board.name;
        this.columns = this.board.columns.map(c => ({ id: c.id, name: c.name, touched: false }));
        if (!this.columns.length) this.columns = [{ name: '', touched: false }];
      }
    }
  }

  get nameError(): string | null {
    if ((this.nameTouched || this.submitted) && !this.name.trim()) return "Can't be empty";
    return null;
  }

  colError(idx: number): string | null {
    const c = this.columns[idx];
    if ((c.touched || this.submitted) && !c.name.trim()) return "Can't be empty";
    return null;
  }

  addColumn(): void  { this.columns.push({ name: '', touched: false }); }
  removeColumn(i: number): void { this.columns.splice(i, 1); }

  save(): void {
    this.submitted = true;
    if (!this.name.trim()) return;
    if (this.columns.some(c => !c.name.trim())) return;

    if (this.mode === 'add') {
      this.kanban.addBoard(this.name, this.columns.map(c => c.name));
    } else if (this.board) {
      this.kanban.editBoard(this.board.id, this.name, this.columns.map(c => ({ id: c.id, name: c.name })));
    }
    this.kanban.closeModal();
  }

  close(): void { this.kanban.closeModal(); }

  @HostListener('click', ['$event'])
  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close();
  }
}
