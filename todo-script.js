// To-Do List App - JavaScript with Local Storage

class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingId = null;
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.render();
        this.loadThemePreference();
    }

    setupEventListeners() {
        // Add task
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Clear completed
        document.getElementById('clearCompletedBtn').addEventListener('click', () => this.clearCompleted());

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const category = document.getElementById('categorySelect').value;
        const dueDate = document.getElementById('dueDateInput').value;
        const text = input.value.trim();

        if (!text) {
            alert('Please enter a task');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            category: category,
            dueDate: dueDate,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveToStorage();
        this.render();

        input.value = '';
        document.getElementById('dueDateInput').value = '';
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveToStorage();
            this.render();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        this.render();
    }

    clearCompleted() {
        if (confirm('Delete all completed tasks?')) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveToStorage();
            this.render();
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateThemeToggleButton();
    }

    loadThemePreference() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        }
        this.updateThemeToggleButton();
    }

    updateThemeToggleButton() {
        const btn = document.getElementById('themeToggle');
        const isDark = document.body.classList.contains('dark-mode');
        btn.textContent = isDark ? '☀️' : '🌙';
    }

    getFilteredTasks() {
        return this.tasks.filter(task => {
            if (this.currentFilter === 'all') return true;
            if (this.currentFilter === 'active') return !task.completed;
            if (this.currentFilter === 'completed') return task.completed;
            return task.category === this.currentFilter;
        });
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    isOverdue(dueDate, completed) {
        if (!dueDate || completed) return false;
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return due < today;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');

        // Update stats
        const completedCount = this.tasks.filter(t => t.completed).length;
        const activeCount = this.tasks.length - completedCount;
        document.getElementById('totalTasks').textContent = this.tasks.length;
        document.getElementById('activeTasks').textContent = activeCount;
        document.getElementById('completedTasks').textContent = completedCount;

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tasksList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onchange="app.toggleTask(${task.id})"
                >
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="task-category ${task.category}">${task.category}</span>
                        ${task.dueDate ? `
                            <span class="task-due-date ${this.isOverdue(task.dueDate, task.completed) ? 'overdue' : ''}">
                                📅 ${this.formatDate(task.dueDate)}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn delete-btn" onclick="app.deleteTask(${task.id})" title="Delete">🗑️</button>
                </div>
            </li>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveToStorage() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('todoTasks');
        this.tasks = stored ? JSON.parse(stored) : [];
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});