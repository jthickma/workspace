// MindScribe Note-Taking App
// Main JavaScript file

// Global state for the application
const appState = {
    notes: [],
    tasks: [],
    bookmarks: [],
    projects: [],
    events: [],
    currentView: 'dashboard',
    currentUser: {
        name: 'Alex Smith',
        email: 'alex@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Alex+Smith&background=7c3aed&color=fff'
    },
    storageUsage: {
        used: 2.7,
        total: 5
    }
};

// DOM Elements
const elements = {
    // Navigation elements
    navLinks: document.querySelectorAll('.sidebar-hover'),
    
    // Dashboard elements
    searchInput: document.querySelector('input[type="text"][placeholder*="Search"]'),
    newNoteBtn: document.querySelector('button:has(.fa-plus)'),
    createNoteBtn: document.querySelector('button:has(.fa-plus):contains("Create New Note")'),
    
    // Task elements
    taskCheckboxes: document.querySelectorAll('input[type="checkbox"]'),
    addTaskBtn: document.querySelector('button:has(.fa-plus):contains("Add New Task")'),
    
    // Note elements
    noteCards: document.querySelectorAll('.note-card'),
    
    // Calendar elements
    calendarPrevBtn: document.querySelector('button:has(.fa-chevron-left)'),
    calendarNextBtn: document.querySelector('button:has(.fa-chevron-right)'),
};

// Initialize the application
function initApp() {
    loadData();
    setupEventListeners();
    updateUI();
}

// Load data from localStorage or use defaults
function loadData() {
    try {
        // Try to load data from localStorage
        const savedNotes = localStorage.getItem('mindscribe_notes');
        const savedTasks = localStorage.getItem('mindscribe_tasks');
        const savedBookmarks = localStorage.getItem('mindscribe_bookmarks');
        const savedProjects = localStorage.getItem('mindscribe_projects');
        const savedEvents = localStorage.getItem('mindscribe_events');
        
        // Update appState with saved data or use defaults
        appState.notes = savedNotes ? JSON.parse(savedNotes) : getSampleNotes();
        appState.tasks = savedTasks ? JSON.parse(savedTasks) : getSampleTasks();
        appState.bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
        appState.projects = savedProjects ? JSON.parse(savedProjects) : [];
        appState.events = savedEvents ? JSON.parse(savedEvents) : getSampleEvents();
    } catch (error) {
        console.error('Error loading data:', error);
        // If there's an error, use sample data
        appState.notes = getSampleNotes();
        appState.tasks = getSampleTasks();
        appState.events = getSampleEvents();
    }
}

// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('mindscribe_notes', JSON.stringify(appState.notes));
        localStorage.setItem('mindscribe_tasks', JSON.stringify(appState.tasks));
        localStorage.setItem('mindscribe_bookmarks', JSON.stringify(appState.bookmarks));
        localStorage.setItem('mindscribe_projects', JSON.stringify(appState.projects));
        localStorage.setItem('mindscribe_events', JSON.stringify(appState.events));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.getAttribute('data-view') || 'dashboard';
            changeView(view);
        });
    });
    
    // Search functionality
    elements.searchInput.addEventListener('input', handleSearch);
    
    // New note button
    if (elements.newNoteBtn) {
        elements.newNoteBtn.addEventListener('click', () => openNoteEditor());
    }
    
    // Create note button
    if (elements.createNoteBtn) {
        elements.createNoteBtn.addEventListener('click', () => openNoteEditor());
    }
    
    // Task checkboxes
    elements.taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = e.target.getAttribute('data-task-id');
            toggleTaskCompletion(taskId);
        });
    });
    
    // Add task button
    if (elements.addTaskBtn) {
        elements.addTaskBtn.addEventListener('click', () => openTaskEditor());
    }
    
    // Note cards
    elements.noteCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const noteId = card.getAttribute('data-note-id');
            openNoteViewer(noteId);
        });
    });
    
    // Calendar navigation
    if (elements.calendarPrevBtn) {
        elements.calendarPrevBtn.addEventListener('click', () => navigateCalendar('prev'));
    }
    
    if (elements.calendarNextBtn) {
        elements.calendarNextBtn.addEventListener('click', () => navigateCalendar('next'));
    }
}

// Change the current view
function changeView(view) {
    appState.currentView = view;
    
    // Update active state in navigation
    elements.navLinks.forEach(link => {
        const linkView = link.getAttribute('data-view') || 'dashboard';
        if (linkView === view) {
            link.classList.add('bg-primary-600');
        } else {
            link.classList.remove('bg-primary-600');
        }
    });
    
    // Update the main content area based on the view
    updateUI();
}

// Handle search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm.length < 2) {
        // If search term is too short, reset to normal view
        updateUI();
        return;
    }
    
    // Filter notes, tasks, and bookmarks based on search term
    const filteredNotes = appState.notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm) || 
        note.content.toLowerCase().includes(searchTerm) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    const filteredTasks = appState.tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm)
    );
    
    // Display search results
    displaySearchResults(filteredNotes, filteredTasks);
}

// Display search results
function displaySearchResults(notes, tasks) {
    // Implementation will depend on the UI structure
    console.log('Search results:', { notes, tasks });
    
    // For now, just update the notes section with filtered notes
    renderNotes(notes);
}

// Open note editor
function openNoteEditor(noteId = null) {
    // If noteId is provided, we're editing an existing note
    const note = noteId ? appState.notes.find(n => n.id === noteId) : null;
    
    // Create modal for note editor
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.id = 'note-editor-modal';
    
    const currentDate = new Date().toISOString();
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">${note ? 'Edit Note' : 'Create New Note'}</h3>
                <button id="close-note-editor" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="space-y-4">
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
                        <option value="Research" ${note && note.category === 'Research' ? 'selected' : ''}>Research</option>
                        <option value="Meeting" ${note && note.category === 'Meeting' ? 'selected' : ''}>Meeting</option>
                        <option value="Personal" ${note && note.category === 'Personal' ? 'selected' : ''}>Personal</option>
                        <option value="Project" ${note && note.category === 'Project' ? 'selected' : ''}>Project</option>
                        <option value="Idea" ${note && note.category === 'Idea' ? 'selected' : ''}>Idea</option>
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
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (!title) {
            alert('Please enter a title for your note');
            return;
        }
        
        if (note) {
            // Update existing note
            const updatedNote = {
                ...note,
                title,
                category,
                content,
                tags,
                updatedAt: new Date().toISOString()
            };
            
            const noteIndex = appState.notes.findIndex(n => n.id === note.id);
            appState.notes[noteIndex] = updatedNote;
        } else {
            // Create new note
            const newNote = {
                id: generateId(),
                title,
                category,
                content,
                tags,
                createdAt: currentDate,
                updatedAt: currentDate
            };
            
            appState.notes.unshift(newNote);
        }
        
        // Save data and update UI
        saveData();
        updateUI();
        
        // Close the modal
        document.body.removeChild(modal);
    });
}

// Open note viewer
function openNoteViewer(noteId) {
    const note = appState.notes.find(n => n.id === noteId);
    
    if (!note) {
        console.error('Note not found:', noteId);
        return;
    }
    
    // Create modal for note viewer
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.id = 'note-viewer-modal';
    
    // Format the date
    const updatedDate = new Date(note.updatedAt).toLocaleString();
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div class="flex justify-between items-center mb-4">
                <div>
                    <span class="inline-block px-2 py-1 text-xs font-medium bg-${getCategoryColor(note.category)}-100 text-${getCategoryColor(note.category)}-800 rounded mb-1">${note.category}</span>
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
            
            <div class="prose max-w-none mb-6">
                ${formatNoteContent(note.content)}
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
        openNoteEditor(noteId);
    });
    
    document.getElementById('delete-note').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this note?')) {
            deleteNote(noteId);
            document.body.removeChild(modal);
        }
    });
}

// Delete a note
function deleteNote(noteId) {
    appState.notes = appState.notes.filter(note => note.id !== noteId);
    saveData();
    updateUI();
}

// Open task editor
function openTaskEditor(taskId = null) {
    // If taskId is provided, we're editing an existing task
    const task = taskId ? appState.tasks.find(t => t.id === taskId) : null;
    
    // Create modal for task editor
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.id = 'task-editor-modal';
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
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
                        value="${task && task.dueDate ? task.dueDate.split('T')[0] : currentDate}"
                    >
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select 
                        id="task-priority" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="Low" ${task && task.priority === 'Low' ? 'selected' : ''}>Low</option>
                        <option value="Medium" ${task && task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="High" ${task && task.priority === 'High' ? 'selected' : ''}>High</option>
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
            alert('Please enter a title for your task');
            return;
        }
        
        if (task) {
            // Update existing task
            const updatedTask = {
                ...task,
                title,
                dueDate: dueDate + 'T00:00:00Z',
                priority,
                completed,
                updatedAt: new Date().toISOString()
            };
            
            const taskIndex = appState.tasks.findIndex(t => t.id === task.id);
            appState.tasks[taskIndex] = updatedTask;
        } else {
            // Create new task
            const newTask = {
                id: generateId(),
                title,
                dueDate: dueDate + 'T00:00:00Z',
                priority,
                completed,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            appState.tasks.unshift(newTask);
        }
        
        // Save data and update UI
        saveData();
        updateUI();
        
        // Close the modal
        document.body.removeChild(modal);
    });
}

// Toggle task completion
function toggleTaskCompletion(taskId) {
    const taskIndex = appState.tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        appState.tasks[taskIndex].completed = !appState.tasks[taskIndex].completed;
        appState.tasks[taskIndex].updatedAt = new Date().toISOString();
        
        saveData();
        updateUI();
    }
}

// Navigate calendar
function navigateCalendar(direction) {
    // This would update the calendar view based on the direction ('prev' or 'next')
    console.log('Calendar navigation:', direction);
    
    // For a real implementation, we would need to track the current month/year
    // and update the calendar display accordingly
}

// Update the UI based on the current state
function updateUI() {
    // This function would update all parts of the UI based on the current state
    // For now, we'll just update the notes section
    renderNotes(appState.notes);
    renderTasks(appState.tasks);
}

// Render notes in the UI
function renderNotes(notes) {
    const notesContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-5');
    
    if (!notesContainer) {
        console.error('Notes container not found');
        return;
    }
    
    // Clear existing notes
    notesContainer.innerHTML = '';
    
    // Add note cards
    notes.slice(0, 4).forEach(note => {
        const color = getCategoryColor(note.category);
        const timeAgo = getTimeAgo(note.updatedAt);
        
        const noteCard = document.createElement('div');
        noteCard.className = `note-card bg-gradient-to-br from-${color}-50 to-${color}-100 border border-${color}-100 rounded-xl p-5 transition-all duration-300`;
        noteCard.setAttribute('data-note-id', note.id);
        
        noteCard.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <span class="inline-block px-2 py-1 text-xs font-medium bg-${color}-100 text-${color}-800 rounded mb-2">${note.category}</span>
                    <h4 class="font-semibold">${note.title}</h4>
                </div>
                <div class="p-2 rounded-lg bg-white shadow">
                    <i class="fas fa-file-alt text-${color}-500"></i>
                </div>
            </div>
            <p class="text-sm text-gray-600 mb-4">${truncateText(note.content, 100)}</p>
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
        
        // Add click event listener
        noteCard.addEventListener('click', () => {
            openNoteViewer(note.id);
        });
    });
}

// Render tasks in the UI
function renderTasks(tasks) {
    const tasksContainer = document.querySelector('.p-5:has(div.mb-4.pb-4.border-b.border-gray-100)');
    
    if (!tasksContainer) {
        console.error('Tasks container not found');
        return;
    }
    
    // Clear existing tasks except the "Add New Task" button
    const addTaskBtn = tasksContainer.querySelector('button:has(.fa-plus)');
    tasksContainer.innerHTML = '';
    
    // Add task items
    tasks.filter(task => !task.completed).slice(0, 3).forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'mb-4 pb-4 border-b border-gray-100';
        
        const dueDate = new Date(task.dueDate).toLocaleDateString();
        const priorityColor = getPriorityColor(task.priority);
        
        taskItem.innerHTML = `
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
                    <label class="font-medium">${task.title}</label>
                    <div class="mt-1 flex items-center text-xs text-gray-500">
                        <i class="fas fa-calendar-alt mr-1"></i> ${dueDate}
                    </div>
                </div>
                <div class="flex">
                    <span class="bg-${priorityColor}-100 text-${priorityColor}-800 text-xs font-medium px-2.5 py-0.5 rounded">${task.priority}</span>
                </div>
            </div>
        `;
        
        tasksContainer.appendChild(taskItem);
        
        // Add event listener for the checkbox
        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            toggleTaskCompletion(task.id);
        });
    });
    
    // Add completed tasks
    tasks.filter(task => task.completed).slice(0, 1).forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'mb-4';
        
        taskItem.innerHTML = `
            <div class="flex">
                <div class="flex items-center h-5">
                    <input 
                        type="checkbox" 
                        class="rounded text-primary-600 focus:ring-primary-500"
                        data-task-id="${task.id}"
                        checked
                    >
                </div>
                <div class="ml-3 text-sm flex-1">
                    <label class="font-medium text-gray-400 line-through">${task.title}</label>
                    <div class="mt-1 flex items-center text-xs text-gray-400">
                        <i class="fas fa-calendar-alt mr-1"></i> ${new Date(task.dueDate).toLocaleDateString()}
                    </div>
                </div>
            </div>
        `;
        
        tasksContainer.appendChild(taskItem);
        
        // Add event listener for the checkbox
        const checkbox = taskItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            toggleTaskCompletion(task.id);
        });
    });
    
    // Add the "Add New Task" button back
    const newAddTaskBtn = document.createElement('button');
    newAddTaskBtn.className = 'w-full mt-4 text-center text-primary-600 hover:text-primary-800 text-sm font-medium';
    newAddTaskBtn.innerHTML = '<i class="fas fa-plus mr-1"></i> Add New Task';
    newAddTaskBtn.addEventListener('click', () => openTaskEditor());
    
    tasksContainer.appendChild(newAddTaskBtn);
}

// Helper Functions

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Get color based on note category
function getCategoryColor(category) {
    const colorMap = {
        'Research': 'blue',
        'Meeting': 'purple',
        'Personal': 'green',
        'Project': 'yellow',
        'Idea': 'indigo'
    };
    
    return colorMap[category] || 'gray';
}

// Get color based on task priority
function getPriorityColor(priority) {
    const colorMap = {
        'Low': 'green',
        'Medium': 'yellow',
        'High': 'red'
    };
    
    return colorMap[priority] || 'gray';
}

// Format note content with basic markdown-like formatting
function formatNoteContent(content) {
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

// Truncate text to a specific length
function truncateText(text, maxLength) {
    if (!text) return '';
    
    if (text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength) + '...';
}

// Get time ago string from date
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return days === 1 ? 'yesterday' : days + ' days ago';
    }
    
    if (hours > 0) {
        return hours + ' hours ago';
    }
    
    if (minutes > 0) {
        return minutes + ' minutes ago';
    }
    
    return 'just now';
}

// Sample data for initial load
function getSampleNotes() {
    return [
        {
            id: 'note1',
            title: 'Web Development Trends 2024',
            category: 'Research',
            content: 'Exploration of emerging frameworks, tools, and methodologies that will shape frontend development in the coming year. Key trends include:\n\n- **AI-assisted coding** becoming mainstream\n- Increased adoption of **WebAssembly**\n- **Edge computing** for web applications\n- **Micro-frontends** architecture gaining popularity\n- **Server components** in React and other frameworks',
            tags: ['Tech', 'Trends'],
            createdAt: '2023-11-14T10:30:00Z',
            updatedAt: '2023-11-14T14:45:00Z'
        },
        {
            id: 'note2',
            title: 'Q2 Marketing Strategy',
            category: 'Meeting',
            content: 'Notes from the leadership meeting discussing marketing initiatives, budget allocations, and campaign timelines.\n\n# Key Decisions\n\n1. Increase social media budget by 15%\n2. Launch new product line in May\n3. Redesign website homepage\n4. Partner with influencers in our industry\n\n# Action Items\n\n- Sarah to prepare social media calendar\n- John to finalize product launch materials\n- Team to review website mockups by Friday',
            tags: ['Marketing'],
            createdAt: '2023-11-12T09:00:00Z',
            updatedAt: '2023-11-13T11:20:00Z'
        },
        {
            id: 'note3',
            title: 'Book Club Reading List',
            category: 'Personal',
            content: 'Curated selection of novels for monthly book club meetings with ratings and discussion points for each title.\n\n## January\n*The Midnight Library* by Matt Haig\n\n## February\n*Project Hail Mary* by Andy Weir\n\n## March\n*Klara and the Sun* by Kazuo Ishiguro\n\n## April\n*The Lincoln Highway* by Amor Towles',
            tags: ['Reading'],
            createdAt: '2023-11-09T16:15:00Z',
            updatedAt: '2023-11-09T16:15:00Z'
        },
        {
            id: 'note4',
            title: 'Mobile App UI Design System',
            category: 'Project',
            content: 'Complete UI documentation for the company\'s flagship mobile application covering colors, typography and components.\n\n### Color Palette\n- Primary: #3B82F6\n- Secondary: #8B5CF6\n- Accent: #10B981\n- Background: #F9FAFB\n- Text: #1F2937\n\n### Typography\n- Headings: Inter Bold\n- Body: Inter Regular\n- Buttons: Inter Medium',
            tags: ['Design', 'UI'],
            createdAt: '2023-11-11T13:45:00Z',
            updatedAt: '2023-11-11T13:45:00Z'
        }
    ];
}

function getSampleTasks() {
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

function getSampleEvents() {
    return [
        {
            id: 'event1',
            title: 'Team Meeting',
            start: '2023-11-14T14:00:00Z',
            end: '2023-11-14T15:30:00Z',
            category: 'Work',
            createdAt: '2023-11-10T09:00:00Z'
        },
        {
            id: 'event2',
            title: 'Project Deadline',
            start: '2023-11-14T18:00:00Z',
            end: '2023-11-14T18:00:00Z',
            category: 'Work',
            createdAt: '2023-11-01T10:30:00Z'
        }
    ];
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);