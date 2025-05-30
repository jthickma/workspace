// MindScribe Note-Taking App
// Tasks functionality

class TasksManager {
    constructor() {
        this.tasks = [];
        this.priorities = ['Low', 'Medium', 'High'];
        this.eventListeners = {};
    }
    
    /**
     * Initialize the tasks manager
     */
    init() {
        this.loadTasks();
    }
    
    /**
     * Load tasks from storage
     */
    loadTasks() {
        this.tasks = MindScribeUtils.StorageUtils.load('mindscribe_tasks', []);
        
        // If no tasks exist, create sample tasks
        if (this.tasks.length === 0) {
            this.tasks = this.getSampleTasks();
            this.saveTasks();
        }
        
        this.trigger('tasksLoaded', this.tasks);
    }
    
    /**
     * Save tasks to storage
     */
    saveTasks() {
        MindScribeUtils.StorageUtils.save('mindscribe_tasks', this.tasks);
    }
    
    /**
     * Get all tasks
     * @returns {Array} All tasks
     */
    getAllTasks() {
        return [...this.tasks];
    }
    
    /**
     * Get a task by ID
     * @param {string} id - Task ID
     * @returns {Object|null} Task object or null if not found
     */
    getTaskById(id) {
        return this.tasks.find(task => task.id === id) || null;
    }
    
    /**
     * Create a new task
     * @param {Object} taskData - Task data
     * @returns {Object} Created task
     */
    createTask(taskData) {
        const now = new Date().toISOString();
        
        const newTask = {
            id: this.generateId(),
            title: taskData.title || 'Untitled Task',
            dueDate: taskData.dueDate || now,
            priority: taskData.priority || 'Medium',
            completed: taskData.completed || false,
            createdAt: now,
            updatedAt: now
        };
        
        this.tasks.unshift(newTask);
        this.saveTasks();
        
        this.trigger('taskCreated', newTask);
        return newTask;
    }
    
    /**
     * Update an existing task
     * @param {string} id - Task ID
     * @param {Object} taskData - Updated task data
     * @returns {Object|null} Updated task or null if not found
     */
    updateTask(id, taskData) {
        const index = this.tasks.findIndex(task => task.id === id);
        
        if (index === -1) {
            return null;
        }
        
        const updatedTask = {
            ...this.tasks[index],
            ...taskData,
            updatedAt: new Date().toISOString()
        };
        
        this.tasks[index] = updatedTask;
        this.saveTasks();
        
        this.trigger('taskUpdated', updatedTask);
        return updatedTask;
    }
    
    /**
     * Delete a task
     * @param {string} id - Task ID
     * @returns {boolean} Success status
     */
    deleteTask(id) {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.id !== id);
        
        if (this.tasks.length !== initialLength) {
            this.saveTasks();
            this.trigger('taskDeleted', id);
            return true;
        }
        
        return false;
    }
    
    /**
     * Toggle task completion status
     * @param {string} id - Task ID
     * @returns {Object|null} Updated task or null if not found
     */
    toggleTaskCompletion(id) {
        const task = this.getTaskById(id);
        
        if (!task) {
            return null;
        }
        
        return this.updateTask(id, { completed: !task.completed });
    }
    
    /**
     * Get pending tasks
     * @returns {Array} Pending tasks
     */
    getPendingTasks() {
        return this.tasks.filter(task => !task.completed);
    }
    
    /**
     * Get completed tasks
     * @returns {Array} Completed tasks
     */
    getCompletedTasks() {
        return this.tasks.filter(task => task.completed);
    }
    
    /**
     * Get overdue tasks
     * @returns {Array} Overdue tasks
     */
    getOverdueTasks() {
        const now = new Date();
        
        return this.tasks.filter(task => {
            if (task.completed) return false;
            
            const dueDate = new Date(task.dueDate);
            return dueDate < now;
        });
    }
    
    /**
     * Get tasks due today
     * @returns {Array} Tasks due today
     */
    getTasksDueToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return this.tasks.filter(task => {
            if (task.completed) return false;
            
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            return dueDate >= today && dueDate < tomorrow;
        });
    }
    
    /**
     * Get tasks by priority
     * @param {string} priority - Priority level
     * @returns {Array} Tasks with specified priority
     */
    getTasksByPriority(priority) {
        return this.tasks.filter(task => task.priority === priority);
    }
    
    /**
     * Sort tasks
     * @param {string} sortBy - Field to sort by
     * @param {boolean} ascending - Sort direction
     * @returns {Array} Sorted tasks
     */
    sortTasks(sortBy = 'dueDate', ascending = true) {
        const sortedTasks = [...this.tasks];
        
        sortedTasks.sort((a, b) => {
            let valueA, valueB;
            
            // Handle different field types
            if (sortBy === 'dueDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
                valueA = new Date(a[sortBy]).getTime();
                valueB = new Date(b[sortBy]).getTime();
            } else if (sortBy === 'priority') {
                // Convert priority to numeric value for sorting
                const priorityValues = { 'Low': 1, 'Medium': 2, 'High': 3 };
                valueA = priorityValues[a.priority] || 0;
                valueB = priorityValues[b.priority] || 0;
            } else {
                valueA = a[sortBy];
                valueB = b[sortBy];
            }
            
            // Compare values
            if (typeof valueA === 'string') {
                return ascending 
                    ? valueA.localeCompare(valueB) 
                    : valueB.localeCompare(valueA);
            } else {
                return ascending 
                    ? valueA - valueB 
                    : valueB - valueA;
            }
        });
        
        return sortedTasks;
    }
    
    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        
        this.eventListeners[event].push(callback);
    }
    
    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (!this.eventListeners[event]) {
            return;
        }
        
        this.eventListeners[event] = this.eventListeners[event]
            .filter(cb => cb !== callback);
    }
    
    /**
     * Trigger event
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    trigger(event, data) {
        if (!this.eventListeners[event]) {
            return;
        }
        
        this.eventListeners[event].forEach(callback => {
            callback(data);
        });
    }
    
    /**
     * Get sample tasks for initial data
     * @returns {Array} Sample tasks
     */
    getSampleTasks() {
        return [
            {
                id: 'task1',
                title: 'Complete research for client proposal',
                dueDate: '2023-11-14T16:00:00Z',
                priority: 'High',
                completed: false,
                createdAt: '2023-11-13T09:30:00Z',
                updatedAt: '2023-11-13T09:30:00Z'
            },
            {
                id: 'task2',
                title: 'Schedule team meeting for Q2 planning',
                dueDate: '2023-11-15T12:00:00Z',
                priority: 'Medium',
                completed: false,
                createdAt: '2023-11-13T10:15:00Z',
                updatedAt: '2023-11-13T10:15:00Z'
            },
            {
                id: 'task3',
                title: 'Update expense reports',
                dueDate: '2023-11-13T17:00:00Z',
                priority: 'Low',
                completed: true,
                createdAt: '2023-11-12T14:00:00Z',
                updatedAt: '2023-11-13T11:30:00Z'
            }
        ];
    }
}

// Create global instance
window.tasksManager = new TasksManager();