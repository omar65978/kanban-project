# Kanban Task Management App

Built with **Angular 17** • **Angular CDK** (drag & drop) • **SCSS**

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm start
```

Then open **http://localhost:4200** in your browser.

## 🏗️ Build for Production

```bash
npm run build
```

Output goes to `dist/kanban-app/`.

## ✨ Features

- 📋 **Multiple boards** — create, edit, delete boards with custom columns
- 🗂️ **Columns & Tasks** — full CRUD for tasks with subtasks
- ☑️ **Subtask tracking** — toggle completion with progress count
- 🔀 **Drag & Drop** — reorder tasks across columns (Angular CDK)
- 🌗 **Dark / Light theme** — toggle with smooth transitions
- 💾 **LocalStorage** — all data persists between sessions
- 📱 **Responsive** — works on mobile, tablet, and desktop
- ✅ **Form validation** — inline errors on all forms

## 📁 Project Structure

```
src/app/
├── models/          # TypeScript interfaces
├── data/            # Seed data (initial boards)
├── services/        # KanbanService + ThemeService
└── components/
    ├── sidebar/     # Board navigation + theme toggle
    ├── header/      # Board title + actions
    ├── board/       # Columns + drag-drop
    ├── task-card/   # Individual task card
    └── modals/
        ├── task-detail/      # View task + subtasks
        ├── add-edit-task/    # Create / edit task
        ├── add-edit-board/   # Create / edit board
        └── delete-confirm/   # Delete confirmation
```
