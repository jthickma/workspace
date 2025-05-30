// MindScribe Note-Taking App
// UI Components and Rendering

class UIManager {
    constructor() {
        this.elements = {};
        this.currentView = 'dashboard';
        this.eventListeners = {};
    }
    
    /**
     * Initialize the UI manager
     */
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.renderDashboard();
    }
    
    /**
     * Cache DOM elements for faster access
     */
    cacheElements() {
        // Navigation elements
        this.elements.navLinks = document.querySelectorAll('.sidebar-hover');
        this.elements.contentArea = document.querySelector('.flex-1.overflow-y-auto.p-6');
        
        // Dashboard elements
        this.elements.searchInput = document.querySelector('input[type="text"][placeholder*="Search"]');
        this.elements.newNoteBtn = document.querySelector('button:has(.fa-plus)');
        
        // Note elements
        this.elements.notesContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-5');
        this.elements.createNoteBtn = document.querySelector('button:contains("Create New Note")');
        
        // Task elements
        this.elements.tasksContainer = document.querySelector('.p-5:has(div.mb-4.pb-4.border-b.border-gray-100)');
        this.elements.addTaskBtn = document.querySelector('button:contains("Add New Task")');
        
        // Calendar elements
        this.elements.calendarContainer = document.querySelector('.text-center.mb-4');
        this.elements.calendarPrevBtn = document.querySelector('button:has(.fa-chevron-left)');
        this.elements.calendarNextBtn = document.querySelector('button:has(.fa-chevron-right)');
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Navigation
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Extract view name from classes or data attribute
                let view = 'dashboard';
                if (link.textContent.trim().toLowerCase().includes('notes')) {
                    view = 'notes';
                } else if (link.textContent.trim().toLowerCase().includes('tasks')) {
                    view = 'tasks';
                } else if (link.textContent.trim().toLowerCase().includes('calendar')) {
                    view = 'calendar';
                } else if (link.textContent.trim().toLowerCase().includes('bookmarks')) {
                    view = 'bookmarks';
                }
                
                this.changeView(view);
            });
        });
        
        // Search functionality
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
        
        // New note button
        if (this.elements.newNoteBtn) {
            this.elements.newNoteBtn.addEventListener('click', () => {
                this.openNoteEditor();
            });
        }
        
        // Create note button
        if (this.elements.createNoteBtn) {
            this.elements.createNoteBtn.addEventListener('click', () => {
                this.openNoteEditor();
            });
        }
        
        // Add task button
        if (this.elements.addTaskBtn) {
            this.elements.addTaskBtn.addEventListener('click', () => {
                this.openTaskEditor();
            });
        }
        
        // Calendar navigation
        if (this.elements.calendarPrevBtn) {
            this.elements.calendarPrevBtn.addEventListener('click', () => {
                calendarManager.previousMonth();
                this.renderCalendar();
            });
        }
        
        if (this.elements.calendarNextBtn) {
            this.elements.calendarNextBtn.addEventListener('click', () => {
                calendarManager.nextMonth();
                this.renderCalendar();
            });
        }
    }
    
    /**
     * Change the current view
     * @param {string} view - View name
     */
    changeView(view) {
        this.currentView = view;
        
        // Update active state in navigation
        this.elements.navLinks.forEach(link => {
            if (link.textContent.trim().toLowerCase().includes(view)) {
                link.classList.add('bg-primary-600');
            } else {
                link.classList.remove('bg-primary-600');
            }
        });
        
        // Render the appropriate view
        switch (view) {
            case 'notes':
                this.renderNotesView();
                break;
            case 'tasks':
                this.renderTasksView();
                break;
            case 'calendar':
                this.renderCalendarView();
                break;
            case 'bookmarks':
                this.renderBookmarksView();
                break;
            case 'dashboard':
            default:
                this.renderDashboard();
                break;
        }
    }
    
    /**
     * Handle search functionality
     * @param {string} query - Search query
     */
    handleSearch(query) {
        if (!query || query.length < 2) {
            // If search term is too short, reset to normal view
            this.changeView(this.currentView);
            return;
        }
        
        // Search in different data sources based on current view
        switch (this.currentView) {
            case 'notes':
                const filteredNotes = notesManager.searchNotes(query);
                this.renderNotes(filteredNotes);
                break;
            case 'tasks':
                const filteredTasks = tasksManager.getAllTasks().filter(task => 
                    task.title.toLowerCase().includes(query.toLowerCase())
                );
                this.renderTasks(filteredTasks);
                break;
            case 'dashboard':
                // For dashboard, search across all data types
                const notes = notesManager.searchNotes(query);
                const tasks = tasksManager.getAllTasks().filter(task => 
                    task.title.toLowerCase().includes(query.toLowerCase())
                );
                
                this.renderSearchResults(query, notes, tasks);
                break;
            default:
                break;
        }
    }
    
    /**
     * Render search results
     * @param {string} query - Search query
     * @param {Array} notes - Filtered notes
     * @param {Array} tasks - Filtered tasks
     */
    renderSearchResults(query, notes, tasks) {
        if (!this.elements.contentArea) return;
        
        this.elements.contentArea.innerHTML = `
            <div class="mb-8">
                <h2 class="text-2xl font-bold text-dark-900 mb-2">Search Results for "${query}"</h2>
                <p class="text-gray-600">Found ${notes.length} notes and ${tasks.length} tasks matching your search</p>
            </div>
            
            <div class="space-y-6">
                ${notes.length > 0 ? `
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Notes</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            ${this.generateNoteCardsHTML(notes, query)}
                        </div>
                    </div>
                ` : ''}
                
                ${tasks.length > 0 ? `
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Tasks</h3>
                        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div class="p-5 space-y-4">
                                ${this.generateTaskItemsHTML(tasks, query)}
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${notes.length === 0 && tasks.length === 0 ? `
                    <div class="text-center py-8">
                        <div class="text-gray-400 text-5xl mb-4">
                            <i class="fas fa-search"></i>
                        </div>
                        <h3 class="text-xl font-medium text-gray-600 mb-2">No results found</h3>
                        <p class="text-gray-500">Try different keywords or check your spelling</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add event listeners to the newly created elements
        this.addNoteCardEventListeners();
        this.addTaskItemEventListeners();
    }
    
    /**
     * Render the dashboard view
     */
    renderDashboard() {
        // Dashboard is already in the HTML, just update dynamic content
        this.renderNotes(notesManager.getAllNotes().slice(0, 4));
        this.renderTasks(tasksManager.getAllTasks());
        this.renderCalendar();
        this.updateStats();
    }
    
    /**
     * Render the notes view
     */
    renderNotesView() {
        if (!this.elements.contentArea) return;
        
        const notes = notesManager.getAllNotes();
        const categories = ['All', ...notesManager.categories];
        const tags = notesManager.getAllTags();
        
        this.elements.contentArea.innerHTML = `
            <div class="mb-8">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-2xl font-bold text-dark-900">My Notes</h2>
                    <button id="new-note-btn" class="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                        <i class="fas fa-plus mr-2"></i> New Note
                    </button>
                </div>
                <p class="text-gray-600">You have ${notes.length} notes in your collection</p>
            </div>
            
            <div class="flex flex-col lg:flex-row lg:space-x-6">
                <!-- Sidebar -->
                <div class="lg:w-1/4 mb-6 lg:mb-0">
                    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        <div class="border-b border-gray-200 px-5 py-4">
                            <h3 class="font-semibold">Categories</h3>
                        </div>
                        <div class="p-4">
                            <ul class="space-y-2">
                                ${categories.map(category => `
                                    <li>
                                        <button class="category-filter w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 ${category === 'All' ? 'bg-gray-100 font-medium' : ''}" data-category="${category}">
                                            ${category === 'All' ? 'All Notes' : category}
                                            ${category !== 'All' ? `<span class="float-right text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">${notes.filter(note => note.category === category).length}</span>` : ''}
                                        </button>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div class="border-b border-gray-200 px-5 py-4">
                            <h3 class="font-semibold">Tags</h3>
                        </div>
                        <div class="p-4">
                            <div class="flex flex-wrap gap-2">
                                ${tags.map(tag => `
                                    <button class="tag-filter px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm" data-tag="${tag}">
                                        ${tag}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Notes Grid -->
                <div class="lg:w-3/4">
                    <div class="bg-white rounded-xl border border-gray-200">
                        <div class="border-b border-gray-200 px-5 py-4 flex justify-between items-center">
                            <h3 class="font-semibold">All Notes</h3>
                            <div class="flex space-x-2">
                                <select id="sort-notes" class="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm">
                                    <option value="updatedAt-desc">Recently Updated</option>
                                    <option value="createdAt-desc">Recently Created</option>
                                    <option value="title-asc">Title (A-Z)</option>
                                    <option value="title-desc">Title (Z-A)</option>
                                </select>
                                <button class="p-2 rounded-lg hover:bg-gray-100">
                                    <i class="fas fa-th-large text-gray-500"></i>
                                </button>
                                <button class="p-2 rounded-lg hover:bg-gray-100">
                                    <i class="fas fa-list text-gray-500"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- Note Cards -->
                        <div class="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="notes-grid">
                            ${this.generateNoteCardsHTML(notes)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to the newly created elements
        document.getElementById('new-note-btn').addEventListener('click', () => {
            this.openNoteEditor();
        });
        
        document.getElementById('sort-notes').addEventListener('change', (e) => {
            const [sortBy, direction] = e.target.value.split('-');
            const ascending = direction === 'asc';
            const sortedNotes = notesManager.sortNotes(sortBy, ascending);
            this.renderNotes(sortedNotes);
        });
        
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.getAttribute('data-category');
                const filteredNotes = category === 'All' 
                    ? notesManager.getAllNotes() 
                    : notesManager.filterByCategory(category);
                
                // Update active state
                document.querySelectorAll('.category-filter').forEach(b => {
                    b.classList.remove('bg-gray-100', 'font-medium');
                });
                e.currentTarget.classList.add('bg-gray-100', 'font-medium');
                
                // Update notes grid
                this.renderNotes(filteredNotes);
                
                // Update header
                const notesHeader = document.querySelector('.border-b.border-gray-200.px-5.py-4 h3');
                if (notesHeader) {
                    notesHeader.textContent = category === 'All' ? 'All Notes' : `${category} Notes`;
                }
            });
        });
        
        document.querySelectorAll('.tag-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tag = e.currentTarget.getAttribute('data-tag');
                const filteredNotes = notesManager.filterByTag(tag);
                
                // Update active state
                document.querySelectorAll('.tag-filter').forEach(b => {
                    b.classList.remove('bg-primary-100', 'text-primary-700');
                });
                e.currentTarget.classList.add('bg-primary-100', 'text-primary-700');
                
                // Update notes grid
                this.renderNotes(filteredNotes);
                
                // Update header
                const notesHeader = document.querySelector('.border-b.border-gray-200.px-5.py-4 h3');
                if (notesHeader) {
                    notesHeader.textContent = `Notes tagged with "${tag}"`;
                }
            });
        });
        
        this.addNoteCardEventListeners();
    }
    
    /**
     * Render the tasks view
     */
    renderTasksView() {
        if (!this.elements.contentArea) return;
        
        const allTasks = tasksManager.getAllTasks();
        const pendingTasks = tasksManager.getPendingTasks();
        const completedTasks = tasksManager.getCompletedTasks();
        const overdueTasks = tasksManager.getOverdueTasks();
        const todayTasks = tasksManager.getTasksDueToday();
        
        this.elements.contentArea.innerHTML = `
            <div class="mb-8">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-2xl font-bold text-dark-900">Tasks & Todos</h2>
                    <button id="new-task-btn" class="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                        <i class="fas fa-plus mr-2"></i> New Task
                    </button>
                </div>
                <p class="text-gray-600">You have ${pendingTasks.length} pending tasks, ${overdueTasks.length} overdue</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl p-5 border border-gray-200">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold">All</h3>
                            <p class="text-3xl font-bold mt-1">${allTasks.length}</p>
                        </div>
                        <div class="p-3 rounded-lg bg-gray-100 text-gray-600">
                            <i class="fas fa-tasks text-xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-5 border border-gray-200">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold">Pending</h3>
                            <p class="text-3xl font-bold mt-1">${pendingTasks.length}</p>
                        </div>
                        <div class="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                            <i class="fas fa-clock text-xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-5 border border-gray-200">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold">Completed</h3>
                            <p class="text-3xl font-bold mt-1">${completedTasks.length}</p>
                        </div>
                        <div class="p-3 rounded-lg bg-green-100 text-green-600">
                            <i class="fas fa-check-circle text-xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl p-5 border border-gray-200">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold">Overdue</h3>
                            <p class="text-3xl font-bold mt-1">${overdueTasks.length}</p>
                        </div>
                        <div class="p-3 rounded-lg bg-red-100 text-red-600">
                            <i class="fas fa-exclamation-circle text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="flex flex-col lg:flex-row lg:space-x-6">
                <!-- Task Lists -->
                <div class="lg:w-2/3 mb-6 lg:mb-0">
                    <!-- Today's Tasks -->
                    <div class="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
                        <div class="border-b border-gray-200 px-5 py-4 flex justify-between items-center">
                            <h3 class="font-semibold">Today's Tasks</h3>
                            <div class="flex space-x-2">
                                <select id="sort-tasks" class="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm">
                                    <option value="dueDate-asc">Due Date (Earliest)</option>
                                    <option value="priority-desc">Priority (Highest)</option>
                                    <option value="title-asc">Title (A-Z)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="p-5">
                            ${todayTasks.length > 0 ? this.generateTaskItemsHTML(todayTasks) : `
                                <div class="text-center py-6">
                                    <div class="text-gray-400 text-4xl mb-3">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <h4 class="text-lg font-medium text-gray-600 mb-1">All caught up!</h4>
                                    <p class="text-gray-500 text-sm">No tasks due today</p>
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <!-- Upcoming Tasks -->
                    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div class="border-b border-gray-200 px-5 py-4 flex justify-between items-center">
                            <h3 class="font-semibold">Upcoming Tasks</h3>
                        </div>
                        
                        <div class="p-5">
                            ${pendingTasks.filter(task => !todayTasks.includes(task)).length > 0 
                                ? this.generateTaskItemsHTML(pendingTasks.filter(task => !todayTasks.includes(task)).slice(0, 5))
                                : `
                                    <div class="text-center py-6">
                                        <div class="text-gray-400 text-4xl mb-3">
                                            <i class="fas fa-calendar-check"></i>
                                        </div>
                                        <h4 class="text-lg font-medium text-gray-600 mb-1">No upcoming tasks</h4>
                                        <p class="text-gray-500 text-sm">Your schedule is clear</p>
                                    </div>
                                `
                            }
                            
                            <button id="add-task-btn" class="w-full mt-4 text-center text-primary-600 hover:text-primary-800 text-sm font-medium">
                                <i class="fas fa-plus mr-1"></i> Add New Task
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Completed Tasks -->
                <div class="lg:w-1/3">
                    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div class="border-b border-gray-200 px-5 py-4">
                            <h3 class="font-semibold">Recently Completed</h3>
                        </div>
                        
                        <div class="p-5">
                            ${completedTasks.length > 0 
                                ? this.generateTaskItemsHTML(completedTasks.slice(0, 5))
                                : `
                                    <div class="text-center py-6">
                                        <div class="text-gray-400 text-4xl mb-3">
                                            <i class="fas fa-clipboard-list"></i>
                                        </div>
                                        <h4 class="text-lg font-medium text-gray-600 mb-1">No completed tasks</h4>
                                        <p class="text-gray-500 text-sm">Complete a task to see it here</p>
                                    </div>
                                `
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to the newly created elements
        document.getElementById('new-task-btn').addEventListener('click', () => {
            this.openTaskEditor();
        });
        
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.openTaskEditor();
        });
        
        document.getElementById('sort-tasks').addEventListener('change', (e) => {
            const [sortBy, direction] = e.target.value.split('-');
            const ascending = direction === 'asc';
            const sortedTasks = tasksManager.sortTasks(sortBy, ascending);
            
            // Re-render the task lists
            const todayTasksContainer = document.querySelector('.bg-white.rounded-xl.border.border-gray-200.mb-6.overflow-hidden .p-5');
            const upcomingTasksContainer = document.querySelector('.bg-white.rounded-xl.border.border-gray-200.overflow-hidden .p-5');
            
            if (todayTasksContainer) {
                const filteredTodayTasks = sortedTasks.filter(task => !task.completed && MindScribeUtils.DateUtils.isToday(new Date(task.dueDate)));
                todayTasksContainer.innerHTML = filteredTodayTasks.length > 0 
                    ? this.generateTaskItemsHTML(filteredTodayTasks)
                    : `
                        <div class="text-center py-6">
                            <div class="text-gray-400 text-4xl mb-3">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h4 class="text-lg font-medium text-gray-600 mb-1">All caught up!</h4>
                            <p class="text-gray-500 text-sm">No tasks due today</p>
                        </div>
                    `;
            }
            
            if (upcomingTasksContainer) {
                const filteredUpcomingTasks = sortedTasks.filter(task => 
                    !task.completed && !MindScribeUtils.DateUtils.isToday(new Date(task.dueDate))
                ).slice(0, 5);
                
                upcomingTasksContainer.innerHTML = filteredUpcomingTasks.length > 0 
                    ? this.generateTaskItemsHTML(filteredUpcomingTasks) + `
                        <button id="add-task-btn" class="w-full mt-4 text-center text-primary-600 hover:text-primary-800 text-sm font-medium">
                            <i class="fas fa-plus mr-1"></i> Add New Task
                        </button>
                    `
                    : `
                        <div class="text-center py-6">
                            <div class="text-gray-400 text-4xl mb-3">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <h4 class="text-lg font-medium text-gray-600 mb-1">No upcoming tasks</h4>
                            <p class="text-gray-500 text-sm">Your schedule is clear</p>
                        </div>
                        
                        <button id="add-task-btn" class="w-full mt-4 text-center text-primary-600 hover:text-primary-800 text-sm font-medium">
                            <i class="fas fa-plus mr-1"></i> Add New Task
                        </button>
                    `;
                
                // Re-add event listener
                document.getElementById('add-task-btn').addEventListener('click', () => {
                    this.openTaskEditor();
                });
            }
            
            this.addTaskItemEventListeners();
        });
        
        this.addTaskItemEventListeners();
    }
    
    /**
     * Render the calendar view
     */
    renderCalendarView() {
        if (!this.elements.contentArea) return;
        
        const calendarData = calendarManager.getCalendarData();
        const monthName = new Date(calendarData.year, calendarData.month).toLocaleString('default', { month: 'long' });
        const todayEvents = calendarManager.getTodayEvents();
        
        this.elements.contentArea.innerHTML = `
            <div class="mb-8">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-2xl font-bold text-dark-900">Calendar</h2>
                    <button id="new-event-btn" class="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                        <i class="fas fa-plus mr-2"></i> New Event
                    </button>
                </div>
                <p class="text-gray-600">Plan your schedule and manage your time effectively</p>
            </div>
            
            <div class="flex flex-col lg:flex-row lg:space-x-6">
                <!-- Calendar -->
                <div class="lg:w-2/3 mb-6 lg:mb-0">
                    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div class="border-b border-gray-200 px-5 py-4 flex justify-between items-center">
                            <h3 class="font-semibold">Calendar</h3>
                            <div class="flex space-x-2">
                                <button class="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm hover:bg-gray-50" id="today-btn">
                                    Today
                                </button>
                                <select id="calendar-view" class="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm">
                                    <option value="month">Month</option>
                                    <option value="week">Week</option>
                                    <option value="day">Day</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="p-5">
                            <div class="text-center mb-4">
                                <div class="flex justify-between items-center mb-3">
                                    <button class="text-gray-500 hover:text-gray-700" id="prev-month">
                                        <i class="fas fa-chevron-left"></i>
                                    </button>
                                    <h4 class="font-medium">${monthName} ${calendarData.year}</h4>
                                    <button class="text-gray-500 hover:text-gray-700" id="next-month">
                                        <i class="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                                
                                <div class="grid grid-cols-7 gap-1 mb-2">
                                    <div class="text-xs font-medium text-gray-500 py-1">Sun</div>
                                    <div class="text-xs font-medium text-gray-500 py-1">Mon</div>
                                    <div class="text-xs font-medium text-gray-500 py-1">Tue</div>
                                    <div class="text-xs font-medium text-gray-500 py-1">Wed</div>
                                    <div class="text-xs font-medium text-gray-500 py-1">Thu</div>
                                    <div class="text-xs font-medium text-gray-500 py-1">Fri</div>
                                    <div class="text-xs font-medium text-gray-500 py-1">Sat</div>
                                </div>
                                
                                <div class="grid grid-cols-7 gap-1 text-sm">
                                    ${calendarData.weeks.flat().map(day => `
                                        <div class="calendar-day py-1 ${day.isCurrentMonth ? '' : 'inactive-day'} ${day.isToday ? 'today' : ''}" 
                                             data-date="${calendarData.year}-${calendarData.month + 1}-${day.day}">
                                            <div class="relative">
                                                ${day.day}
                                                ${day.events.length > 0 ? `
                                                    <span class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"></span>
                                                ` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="mt-6 border-t border-gray-100 pt-6">
                                <h4 class="text-sm font-medium mb-4">Upcoming Events</h4>
                                ${this.generateEventsListHTML(calendarManager.getCurrentMonthEvents().slice(0, 5))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Today's Events -->
                <div class="lg:w-1/3">
                    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                        <div class="border-b border-gray-200 px-5 py-4">
                            <h3 class="font-semibold">Today's Events</h3>
                        </div>
                        
                        <div class="p-5">
                            ${todayEvents.length > 0 
                                ? this.generateEventsListHTML(todayEvents)
                                : `
                                    <div class="text-center py-6">
                                        <div class="text-gray-400 text-4xl mb-3">
                                            <i class="fas fa-calendar-day"></i>
                                        </div>
                                        <h4 class="text-lg font-medium text-gray-600 mb-1">No events today</h4>
                                        <p class="text-gray-500 text-sm">Your day is clear</p>
                                    </div>
                                `
                            }
                            
                            <button id="add-event-btn" class="w-full mt-4 text-center text-primary-600 hover:text-primary-800 text-sm font-medium">
                                <i class="fas fa-plus mr-1"></i> Add Event
                            </button>
                        </div>
                    </div>
                    
                    <!-- Tasks Due Today -->
                    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div class="border-b border-gray-200 px-5 py-4">
                            <h3 class="font-semibold">Tasks Due Today</h3>
                        </div>
                        
                        <div class="p-5">
                            ${tasksManager.getTasksDueToday().length > 0 
                                ? this.generateTaskItemsHTML(tasksManager.getTasksDueToday())
                                : `
                                    <div class="text-center py-6">
                                        <div class="text-gray-400 text-4xl mb-3">
                                            <i class="fas fa-tasks"></i>
                                        </div>
                                        <h4 class="text-lg font-medium text-gray-600 mb-1">No tasks due today</h4>
                                        <p class="text-gray-500 text-sm">You're all caught up</p>
                                    </div>
                                `
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners to the newly created elements
        document.getElementById('new-event-btn').addEventListener('click', () => {
            this.openEventEditor();
        });
        
        document.getElementById('add-event-btn').addEventListener('click', () => {
            this.openEventEditor();
        });
        
        document.getElementById('prev-month').addEventListener('click', () => {
            calendarManager.previousMonth();
            this.renderCalendarView();
        });
        
        document.getElementById('next-month').addEventListener('click', () => {
            calendarManager.nextMonth();
            this.renderCalendarView();
        });
        
        document.getElementById('today-btn').addEventListener('click', () => {
            const today = new Date();
            calendarManager.setCurrentMonth(today.getMonth(), today.getFullYear());
            this.renderCalendarView();
        });
        
        document.getElementById('calendar-view').addEventListener('change', (e) => {
            // For a real implementation, this would switch between different calendar views
            // For now, we'll just show a message
            MindScribeUtils.Toast.info(`${e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)} view is not implemented in this demo`);
        });
        
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', (e) => {
                const dateStr = e.currentTarget.getAttribute('data-date');
                if (dateStr) {
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    
                    // Show events for the selected date
                    this.showEventsForDate(date);
                }
            });
        });
        
        this.addTaskItemEventListeners();
    }
    
    /**
     * Render the bookmarks view
     */
    renderBookmarksView() {
        if (!this.elements.contentArea) return;
        
        // For now, just show a placeholder
        this.elements.contentArea.innerHTML = `
            <div class="mb-8">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-2xl font-bold text-dark-900">Bookmarks</h2>
                    <button id="new-bookmark-btn" class="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                        <i class="fas fa-plus mr-2"></i> New Bookmark
                    </button>
                </div>
                <p class="text-gray-600">Save and organize important links and resources</p>
            </div>
            
            <div class="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div class="text-gray-400 text-6xl mb-4">
                    <i class="fas fa-bookmark"></i>
                </div>
                <h3 class="text-xl font-medium text-gray-700 mb-2">Bookmarks Coming Soon</h3>
                <p class="text-gray-500 max-w-md mx-auto mb-6">This feature is under development. Soon you'll be able to save and organize all your important links and resources here.</p>
                <button class="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg">
                    Get Notified When Ready
                </button>
            </div>
        `;
        
        // Add event listener for the button
        document.getElementById('new-bookmark-btn').addEventListener('click', () => {
            MindScribeUtils.Toast.info('Bookmarks feature is coming soon!');
        });
    }
    
    /**
     * Show events for a specific date
     * @param {Date} date - The date to show events for
     */
    showEventsForDate(date) {
        const events = calendarManager.getEventsForDate(date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Create modal for events
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'events-modal';
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">${formattedDate}</h3>
                    <button id="close-events-modal" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-6">
                    <h4 class="text-sm font-medium text-gray-500 mb-3">EVENTS</h4>
                    ${events.length > 0 
                        ? this.generateEventsListHTML(events)
                        : `
                            <div class="text-center py-6 bg-gray-50 rounded-lg">
                                <div class="text-gray-400 text-3xl mb-2">
                                    <i class="fas fa-calendar"></i>
                                </div>
                                <p class="text-gray-500">No events scheduled for this day</p>
                            </div>
                        `
                    }
                </div>
                
                <div class="flex justify-end">
                    <button id="add-event-for-date" class="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg">
                        <i class="fas fa-plus mr-2"></i> Add Event
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('close-events-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('add-event-for-date').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.openEventEditor(date);
        });
    }
    
    /**
     * Open note editor
     * @param {string} noteId - Note ID (optional)
     */
    openNoteEditor(noteId = null) {
        const note = noteId ? notesManager.getNoteById(noteId) : null;
        
        // Create modal for note editor
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay';
        modal.id = 'note-editor-modal';
        
        const currentDate = new Date().toISOString();
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 modal-content">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">${note ? 'Edit Note' : 'Create New Note'}</h3>
                    <button id="close-note-editor" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4 note-editor">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input 
                            type="text" 
                            id="note-title" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value="${note ? note.title : ''}"
                            placeholder="Enter note title..."
                        >
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select 
                            id="note-category" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            ${notesManager.categories.map(category => `
                                <option value="${category}" ${note && note.category === category ? 'selected' : ''}>${category}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea 
                            id="note-content" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[200px]"
                            placeholder="Enter note content..."
                        >${note ? note.content : ''}</textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                        <input 
                            type="text" 
                            id="note-tags" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value="${note ? note.tags.join(', ') : ''}"
                            placeholder="Enter tags..."
                        >
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button 
                            id="cancel-note" 
                            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button 
                            id="save-note" 
                            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            ${note ? 'Update Note' : 'Save Note'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up event listeners for the modal
        document.getElementById('close-note-editor').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancel-note').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('save-note').addEventListener('click', () => {
            const title = document.getElementById('note-title').value;
            const category = document.getElementById('note-category').value;
            const content = document.getElementById('note-content').value;
            const tagsInput = document.getElementById('note-tags').value;
            const tags = MindScribeUtils.TextUtils.parseTags(tagsInput);
            
            if (!title) {
                MindScribeUtils.Toast.error('Please enter a title for your note');
                return;
            }
            
            if (note) {
                // Update existing note
                notesManager.updateNote(note.id, {
                    title,
                    category,
                    content,
                    tags
                });
                
                MindScribeUtils.Toast.success('Note updated successfully');
            } else {
                // Create new note
                notesManager.createNote({
                    title,
                    category,
                    content,
                    tags
                });
                
                MindScribeUtils.Toast.success('Note created successfully');
            }
            
            // Update UI
            this.changeView(this.currentView);
            
            // Close the modal
            document.body.removeChild(modal);
        });
    }
    
    /**
     * Open task editor
     * @param {string} taskId - Task ID (optional)
     */
    openTaskEditor(taskId = null) {
        const task = taskId ? tasksManager.getTaskById(taskId) : null;
        
        // Create modal for task editor
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay';
        modal.id = 'task-editor-modal';
        
        const currentDate = new Date().toISOString().split('T')[0];
        const dueDate = task && task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : currentDate;
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 modal-content">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">${task ? 'Edit Task' : 'Create New Task'}</h3>
                    <button id="close-task-editor" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input 
                            type="text" 
                            id="task-title" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value="${task ? task.title : ''}"
                            placeholder="Enter task title..."
                        >
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input 
                            type="date" 
                            id="task-due-date" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value="${dueDate}"
                        >
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select 
                            id="task-priority" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            ${tasksManager.priorities.map(priority => `
                                <option value="${priority}" ${task && task.priority === priority ? 'selected' : ''}>${priority}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="flex items-center">
                        <input 
                            type="checkbox" 
                            id="task-completed" 
                            class="rounded text-primary-600 focus:ring-primary-500 mr-2"
                            ${task && task.completed ? 'checked' : ''}
                        >
                        <label for="task-completed" class="text-sm font-medium text-gray-700">Mark as completed</label>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button 
                            id="cancel-task" 
                            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button 
                            id="save-task" 
                            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            ${task ? 'Update Task' : 'Save Task'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up event listeners for the modal
        document.getElementById('close-task-editor').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancel-task').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('save-task').addEventListener('click', () => {
            const title = document.getElementById('task-title').value;
            const dueDate = document.getElementById('task-due-date').value;
            const priority = document.getElementById('task-priority').value;
            const completed = document.getElementById('task-completed').checked;
            
            if (!title) {
                MindScribeUtils.Toast.error('Please enter a title for your task');
                return;
            }
            
            if (task) {
                // Update existing task
                tasksManager.updateTask(task.id, {
                    title,
                    dueDate: dueDate + 'T00:00:00Z',
                    priority,
                    completed
                });
                
                MindScribeUtils.Toast.success('Task updated successfully');
            } else {
                // Create new task
                tasksManager.createTask({
                    title,
                    dueDate: dueDate + 'T00:00:00Z',
                    priority,
                    completed
                });
                
                MindScribeUtils.Toast.success('Task created successfully');
            }
            
            // Update UI
            this.changeView(this.currentView);
            
            // Close the modal
            document.body.removeChild(modal);
        });
    }
    
    /**
     * Open event editor
     * @param {Date} date - Default date (optional)
     * @param {string} eventId - Event ID (optional)
     */
    openEventEditor(date = null, eventId = null) {
        const event = eventId ? calendarManager.getEventById(eventId) : null;
        
        // Create modal for event editor
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay';
        modal.id = 'event-editor-modal';
        
        const currentDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const startDate = event && event.start ? new Date(event.start).toISOString().split('T')[0] : currentDate;
        const startTime = event && event.start ? new Date(event.start).toISOString().split('T')[1].substring(0, 5) : '09:00';
        const endDate = event && event.end ? new Date(event.end).toISOString().split('T')[0] : currentDate;
        const endTime = event && event.end ? new Date(event.end).toISOString().split('T')[1].substring(0, 5) : '10:00';
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 modal-content">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">${event ? 'Edit Event' : 'Create New Event'}</h3>
                    <button id="close-event-editor" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input 
                            type="text" 
                            id="event-title" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value="${event ? event.title : ''}"
                            placeholder="Enter event title..."
                        >
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input 
                                type="date" 
                                id="event-start-date" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value="${startDate}"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input 
                                type="time" 
                                id="event-start-time" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value="${startTime}"
                            >
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input 
                                type="date" 
                                id="event-end-date" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value="${endDate}"
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input 
                                type="time" 
                                id="event-end-time" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value="${endTime}"
                            >
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select 
                            id="event-category" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Work" ${event && event.category === 'Work' ? 'selected' : ''}>Work</option>
                            <option value="Personal" ${event && event.category === 'Personal' ? 'selected' : ''}>Personal</option>
                            <option value="Meeting" ${event && event.category === 'Meeting' ? 'selected' : ''}>Meeting</option>
                            <option value="Appointment" ${event && event.category === 'Appointment' ? 'selected' : ''}>Appointment</option>
                            <option value="Other" ${event && event.category === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                            id="event-description" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                            placeholder="Enter event description..."
                        >${event ? event.description : ''}</textarea>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button 
                            id="cancel-event" 
                            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button 
                            id="save-event" 
                            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            ${event ? 'Update Event' : 'Save Event'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up event listeners for the modal
        document.getElementById('close-event-editor').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('cancel-event').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('save-event').addEventListener('click', () => {
            const title = document.getElementById('event-title').value;
            const startDate = document.getElementById('event-start-date').value;
            const startTime = document.getElementById('event-start-time').value;
            const endDate = document.getElementById('event-end-date').value;
            const endTime = document.getElementById('event-end-time').value;
            const category = document.getElementById('event-category').value;
            const description = document.getElementById('event-description').value;
            
            if (!title) {
                MindScribeUtils.Toast.error('Please enter a title for your event');
                return;
            }
            
            const start = `${startDate}T${startTime}:00Z`;
            const end = `${endDate}T${endTime}:00Z`;
            
            if (new Date(end) < new Date(start)) {
                MindScribeUtils.Toast.error('End time cannot be before start time');
                return;
            }
            
            if (event) {
                // Update existing event
                calendarManager.updateEvent(event.id, {
                    title,
                    start,
                    end,
                    category,
                    description
                });
                
                MindScribeUtils.Toast.success('Event updated successfully');
            } else {
                // Create new event
                calendarManager.createEvent({
                    title,
                    start,
                    end,
                    category,
                    description
                });
                
                MindScribeUtils.Toast.success('Event created successfully');
            }
            
            // Update UI
            this.changeView(this.currentView);
            
            // Close the modal
            document.body.removeChild(modal);
        });
    }
    
    /**
     * Render notes in the UI
     * @param {Array} notes - Notes to render
     * @param {string} searchTerm - Search term for highlighting (optional)
     */
    renderNotes(notes, searchTerm = '') {
        const notesContainer = document.getElementById('notes-grid') || this.elements.notesContainer;
        
        if (!notesContainer) {
            console.error('Notes container not found');
            return;
        }
        
        // Clear existing notes
        notesContainer.innerHTML = '';
        
        if (notes.length === 0) {
            notesContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="text-gray-400 text-5xl mb-4">
                        <i class="fas fa-sticky-note"></i>
                    </div>
                    <h3 class="text-xl font-medium text-gray-600 mb-2">No notes found</h3>
                    <p class="text-gray-500 mb-4">Create your first note to get started</p>
                    <button id="empty-create-note" class="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg">
                        <i class="fas fa-plus mr-2"></i> Create New Note
                    </button>
                </div>
            `;
            
            document.getElementById('empty-create-note').addEventListener('click', () => {
                this.openNoteEditor();
            });
            
            return;
        }
        
        // Add note cards
        notes.forEach(note => {
            const color = this.getCategoryColor(note.category);
            const timeAgo = MindScribeUtils.DateUtils.getRelativeTime(note.updatedAt);
            
            let title = note.title;
            let content = note.content;
            
            // Highlight search term if provided
            if (searchTerm) {
                title = MindScribeUtils.TextUtils.highlightSearchTerm(title, searchTerm);
                content = MindScribeUtils.TextUtils.highlightSearchTerm(content, searchTerm);
            }
            
            const noteCard = document.createElement('div');
            noteCard.className = `note-card bg-gradient-to-br from-${color}-50 to-${color}-100 border border-${color}-100 rounded-xl p-5 transition-all duration-300`;
            noteCard.setAttribute('data-note-id', note.id);
            
            noteCard.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <span class="inline-block px-2 py-1 text-xs font-medium bg-${color}-100 text-${color}-800 rounded mb-2">${note.category}</span>
                        <h4 class="font-semibold">${title}</h4>
                    </div>
                    <div class="p-2 rounded-lg bg-white shadow">
                        <i class="fas fa-file-alt text-${color}-500"></i>
                    </div>
                </div>
                <p class="text-sm text-gray-600 mb-4">${MindScribeUtils.TextUtils.truncate(content, 100)}</p>
                <div class="flex justify-between text-xs text-gray-500">
                    <div>
                        <i class="fas fa-clock mr-1"></i> Updated ${timeAgo}
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-tag mr-1"></i> ${note.tags.join(', ') || 'No tags'}
                    </div>
                </div>
            `;
            
            notesContainer.appendChild(noteCard);
        });
        
        this.addNoteCardEventListeners();
    }
    
    /**
     * Render tasks in the UI
     * @param {Array} tasks - Tasks to render
     * @param {string} searchTerm - Search term for highlighting (optional)
     */
    renderTasks(tasks, searchTerm = '') {
        const tasksContainer = this.elements.tasksContainer;
        
        if (!tasksContainer) {
            console.error('Tasks container not found');
            return;
        }
        
        // Clear existing tasks except the "Add New Task" button
        const addTaskBtn = tasksContainer.querySelector('button:has(.fa-plus)');
        tasksContainer.innerHTML = '';
        
        if (tasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="text-center py-6">
                    <div class="text-gray-400 text-4xl mb-3">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h4 class="text-lg font-medium text-gray-600 mb-1">All caught up!</h4>
                    <p class="text-gray-500 text-sm mb-4">No tasks to display</p>
                </div>
            `;
        } else {
            tasksContainer.innerHTML = this.generateTaskItemsHTML(tasks, searchTerm);
        }
        
        // Add the "Add New Task" button back if it existed
        if (addTaskBtn) {
            const newAddTaskBtn = document.createElement('button');
            newAddTaskBtn.className = 'w-full mt-4 text-center text-primary-600 hover:text-primary-800 text-sm font-medium';
            newAddTaskBtn.innerHTML = '<i class="fas fa-plus mr-1"></i> Add New Task';
            
            tasksContainer.appendChild(newAddTaskBtn);
            
            newAddTaskBtn.addEventListener('click', () => {
                this.openTaskEditor();
            });
        }
        
        this.addTaskItemEventListeners();
    }
    
    /**
     * Render calendar in the UI
     */
    renderCalendar() {
        const calendarContainer = this.elements.calendarContainer;
        
        if (!calendarContainer) {
            console.error('Calendar container not found');
            return;
        }
        
        const calendarData = calendarManager.getCalendarData();
        const monthName = new Date(calendarData.year, calendarData.month).toLocaleString('default', { month: 'long' });
        
        calendarContainer.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <button class="text-gray-500 hover:text-gray-700" id="calendar-prev">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h4 class="font-medium">${monthName} ${calendarData.year}</h4>
                <button class="text-gray-500 hover:text-gray-700" id="calendar-next">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-7 gap-1 mb-2">
                <div class="text-xs font-medium text-gray-500 py-1">Sun</div>
                <div class="text-xs font-medium text-gray-500 py-1">Mon</div>
                <div class="text-xs font-medium text-gray-500 py-1">Tue</div>
                <div class="text-xs font-medium text-gray-500 py-1">Wed</div>
                <div class="text-xs font-medium text-gray-500 py-1">Thu</div>
                <div class="text-xs font-medium text-gray-500 py-1">Fri</div>
                <div class="text-xs font-medium text-gray-500 py-1">Sat</div>
            </div>
            
            <div class="grid grid-cols-7 gap-1 text-sm">
                ${calendarData.weeks.flat().map(day => `
                    <div class="calendar-day py-1 ${day.isCurrentMonth ? '' : 'inactive-day'} ${day.isToday ? 'today' : ''}" 
                         data-date="${calendarData.year}-${calendarData.month + 1}-${day.day}">
                        <div class="relative">
                            ${day.day}
                            ${day.events.length > 0 ? `
                                <span class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"></span>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add event listeners
        document.getElementById('calendar-prev').addEventListener('click', () => {
            calendarManager.previousMonth();
            this.renderCalendar();
        });
        
        document.getElementById('calendar-next').addEventListener('click', () => {
            calendarManager.nextMonth();
            this.renderCalendar();
        });
        
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', (e) => {
                const dateStr = e.currentTarget.getAttribute('data-date');
                if (dateStr) {
                    const [year, month, day] = dateStr.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    
                    // Show events for the selected date
                    this.showEventsForDate(date);
                }
            });
        });
    }
    
    /**
     * Update statistics on the dashboard
     */
    updateStats() {
        // Update note count
        const noteCountElement = document.querySelector('.bg-white.rounded-xl.p-5.border.border-gray-200:has(.fa-sticky-note) .text-3xl.font-bold');
        if (noteCountElement) {
            noteCountElement.textContent = notesManager.getAllNotes().length;
        }
        
        // Update task count
        const taskCountElement = document.querySelector('.bg-white.rounded-xl.p-5.border.border-gray-200:has(.fa-tasks) .text-3xl.font-bold');
        if (taskCountElement) {
            taskCountElement.textContent = tasksManager.getAllTasks().length;
        }
        
        // Update bookmark count
        const bookmarkCountElement = document.querySelector('.bg-white.rounded-xl.p-5.border.border-gray-200:has(.fa-bookmark) .text-3xl.font-bold');
        if (bookmarkCountElement) {
            bookmarkCountElement.textContent = '87'; // Placeholder for now
        }
        
        // Update project count
        const projectCountElement = document.querySelector('.bg-white.rounded-xl.p-5.border.border-gray-200:has(.fa-folder) .text-3xl.font-bold');
        if (projectCountElement) {
            projectCountElement.textContent = '5'; // Placeholder for now
        }
    }
    
    /**
     * Add event listeners to note cards
     */
    addNoteCardEventListeners() {
        document.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', () => {
                const noteId = card.getAttribute('data-note-id');
                if (noteId) {
                    this.openNoteViewer(noteId);
                }
            });
        });
    }
    
    /**
     * Add event listeners to task items
     */
    addTaskItemEventListeners() {
        document.querySelectorAll('input[type="checkbox"][data-task-id]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                if (taskId) {
                    tasksManager.toggleTaskCompletion(taskId);
                    
                    // Update UI based on current view
                    if (this.currentView === 'tasks') {
                        this.renderTasksView();
                    } else {
                        this.renderTasks(tasksManager.getAllTasks());
                    }
                }
            });
        });
        
        document.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't trigger if checkbox was clicked
                if (e.target.type === 'checkbox') return;
                
                const taskId = item.getAttribute('data-task-id');
                if (taskId) {
                    this.openTaskEditor(taskId);
                }
            });
        });
    }
    
    /**
     * Open note viewer
     * @param {string} noteId - Note ID
     */
    openNoteViewer(noteId) {
        const note = notesManager.getNoteById(noteId);
        
        if (!note) {
            console.error('Note not found:', noteId);
            return;
        }
        
        // Create modal for note viewer
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay';
        modal.id = 'note-viewer-modal';
        
        // Format the date
        const updatedDate = MindScribeUtils.DateUtils.formatDate(note.updatedAt);
        const color = this.getCategoryColor(note.category);
        
        modal.innerHTML = `
            <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 modal-content">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <span class="inline-block px-2 py-1 text-xs font-medium bg-${color}-100 text-${color}-800 rounded mb-1">${note.category}</span>
                        <h3 class="text-xl font-bold">${note.title}</h3>
                    </div>
                    <div class="flex space-x-2">
                        <button id="edit-note" class="text-gray-500 hover:text-gray-700 p-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button id="delete-note" class="text-gray-500 hover:text-red-500 p-2">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button id="close-note-viewer" class="text-gray-500 hover:text-gray-700 p-2">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="prose max-w-none mb-6 markdown-preview">
                    ${this.formatNoteContent(note.content)}
                </div>
                
                <div class="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <div>
                        <i class="fas fa-clock mr-1"></i> Updated: ${updatedDate}
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-tag mr-1"></i> ${note.tags.join(', ') || 'No tags'}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set up event listeners for the modal
        document.getElementById('close-note-viewer').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('edit-note').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.openNoteEditor(noteId);
        });
        
        document.getElementById('delete-note').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this note?')) {
                notesManager.deleteNote(noteId);
                document.body.removeChild(modal);
                
                // Update UI based on current view
                this.changeView(this.currentView);
                
                MindScribeUtils.Toast.success('Note deleted successfully');
            }
        });
    }
    
    /**
     * Generate HTML for note cards
     * @param {Array} notes - Notes to render
     * @param {string} searchTerm - Search term for highlighting (optional)
     * @returns {string} HTML for note cards
     */
    generateNoteCardsHTML(notes, searchTerm = '') {
        if (notes.length === 0) {
            return `
                <div class="col-span-full text-center py-8">
                    <div class="text-gray-400 text-5xl mb-4">
                        <i class="fas fa-sticky-note"></i>
                    </div>
                    <h3 class="text-xl font-medium text-gray-600 mb-2">No notes found</h3>
                    <p class="text-gray-500 mb-4">Create your first note to get started</p>
                    <button id="empty-create-note" class="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg">
                        <i class="fas fa-plus mr-2"></i> Create New Note
                    </button>
                </div>
            `;
        }
        
        return notes.map(note => {
            const color = this.getCategoryColor(note.category);
            const timeAgo = MindScribeUtils.DateUtils.getRelativeTime(note.updatedAt);
            
            let title = note.title;
            let content = note.content;
            
            // Highlight search term if provided
            if (searchTerm) {
                title = MindScribeUtils.TextUtils.highlightSearchTerm(title, searchTerm);
                content = MindScribeUtils.TextUtils.highlightSearchTerm(content, searchTerm);
            }
            
            return `
                <div class="note-card bg-gradient-to-br from-${color}-50 to-${color}-100 border border-${color}-100 rounded-xl p-5 transition-all duration-300" data-note-id="${note.id}">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <span class="inline-block px-2 py-1 text-xs font-medium bg-${color}-100 text-${color}-800 rounded mb-2">${note.category}</span>
                            <h4 class="font-semibold">${title}</h4>
                        </div>
                        <div class="p-2 rounded-lg bg-white shadow">
                            <i class="fas fa-file-alt text-${color}-500"></i>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">${MindScribeUtils.TextUtils.truncate(content, 100)}</p>
                    <div class="flex justify-between text-xs text-gray-500">
                        <div>
                            <i class="fas fa-clock mr-1"></i> Updated ${timeAgo}
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-tag mr-1"></i> ${note.tags.join(', ') || 'No tags'}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Generate HTML for task items
     * @param {Array} tasks - Tasks to render
     * @param {string} searchTerm - Search term for highlighting (optional)
     * @returns {string} HTML for task items
     */
    generateTaskItemsHTML(tasks, searchTerm = '') {
        if (tasks.length === 0) {
            return '';
        }
        
        return tasks.map(task => {
            const dueDate = MindScribeUtils.DateUtils.formatDate(task.dueDate, 'short');
            const priorityColor = this.getPriorityColor(task.priority);
            
            let title = task.title;
            
            // Highlight search term if provided
            if (searchTerm) {
                title = MindScribeUtils.TextUtils.highlightSearchTerm(title, searchTerm);
            }
            
            return `
                <div class="task-item mb-4 ${task.completed ? '' : 'pb-4 border-b border-gray-100'}" data-task-id="${task.id}">
                    <div class="flex">
                        <div class="flex items-center h-5">
                            <input 
                                type="checkbox" 
                                class="rounded text-primary-600 focus:ring-primary-500"
                                data-task-id="${task.id}"
                                ${task.completed ? 'checked' : ''}
                            >
                        </div>
                        <div class="ml-3 text-sm flex-1">
                            <label class="font-medium ${task.completed ? 'text-gray-400 line-through' : ''}">${title}</label>
                            <div class="mt-1 flex items-center text-xs ${task.completed ? 'text-gray-400' : 'text-gray-500'}">
                                <i class="fas fa-calendar-alt mr-1"></i> ${dueDate}
                            </div>
                        </div>
                        ${!task.completed ? `
                            <div class="flex">
                                <span class="bg-${priorityColor}-100 text-${priorityColor}-800 text-xs font-medium px-2.5 py-0.5 rounded">${task.priority}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Generate HTML for events list
     * @param {Array} events - Events to render
     * @returns {string} HTML for events list
     */
    generateEventsListHTML(events) {
        if (events.length === 0) {
            return `
                <div class="text-center py-6">
                    <div class="text-gray-400 text-4xl mb-3">
                        <i class="fas fa-calendar"></i>
                    </div>
                    <h4 class="text-lg font-medium text-gray-600 mb-1">No events scheduled</h4>
                    <p class="text-gray-500 text-sm">Your calendar is clear</p>
                </div>
            `;
        }
        
        return events.map(event => {
            const startTime = new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const categoryColor = this.getCategoryColor(event.category);
            
            return `
                <div class="border-l-2 border-${categoryColor}-500 pl-3 py-2 mb-3" data-event-id="${event.id}">
                    <div class="flex justify-between">
                        <div>
                            <div class="text-sm font-medium">${event.title}</div>
                            <div class="text-xs text-gray-500">${startTime} - ${endTime}</div>
                        </div>
                        <div>
                            <span class="inline-block px-2 py-1 text-xs bg-${categoryColor}-100 text-${categoryColor}-800 rounded">${event.category}</span>
                        </div>
                    </div>
                    ${event.description ? `<div class="text-xs text-gray-600 mt-1">${MindScribeUtils.TextUtils.truncate(event.description, 50)}</div>` : ''}
                </div>
            `;
        }).join('');
    }
    
    /**
     * Format note content with basic markdown-like formatting
     * @param {string} content - Note content
     * @returns {string} Formatted HTML
     */
    formatNoteContent(content) {
        if (!content) return '';
        
        // Replace newlines with <br>
        let formatted = content.replace(/\n/g, '<br>');
        
        // Bold text (between ** **)
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic text (between * *)
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Headers (lines starting with #)
        formatted = formatted.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold my-2">$1</h1>');
        formatted = formatted.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold my-2">$1</h2>');
        formatted = formatted.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>');
        
        // Lists (lines starting with - or *)
        formatted = formatted.replace(/^- (.*?)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/^• (.*?)$/gm, '<li>$1</li>');
        
        // Wrap lists in <ul> tags
        if (formatted.includes('<li>')) {
            formatted = '<ul class="list-disc pl-5 my-2">' + formatted + '</ul>';
        }
        
        return formatted;
    }
    
    /**
     * Get color based on note category
     * @param {string} category - Note category
     * @returns {string} Color name
     */
    getCategoryColor(category) {
        const colorMap = {
            'Research': 'blue',
            'Meeting': 'purple',
            'Personal': 'green',
            'Project': 'yellow',
            'Idea': 'indigo',
            'Work': 'blue',
            'Appointment': 'red',
            'Other': 'gray'
        };
        
        return colorMap[category] || 'gray';
    }
    
    /**
     * Get color based on task priority
     * @param {string} priority - Task priority
     * @returns {string} Color name
     */
    getPriorityColor(priority) {
        const colorMap = {
            'Low': 'green',
            'Medium': 'yellow',
            'High': 'red'
        };
        
        return colorMap[priority] || 'gray';
    }
}

// Create global instance
window.uiManager = new UIManager();