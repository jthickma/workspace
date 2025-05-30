// MindScribe Note-Taking App
// Notes functionality

class NotesManager {
    constructor() {
        this.notes = [];
        this.categories = ['Research', 'Meeting', 'Personal', 'Project', 'Idea'];
        this.eventListeners = {};
    }
    
    /**
     * Initialize the notes manager
     */
    init() {
        this.loadNotes();
    }
    
    /**
     * Load notes from storage
     */
    loadNotes() {
        this.notes = MindScribeUtils.StorageUtils.load('mindscribe_notes', []);
        
        // If no notes exist, create sample notes
        if (this.notes.length === 0) {
            this.notes = this.getSampleNotes();
            this.saveNotes();
        }
        
        this.trigger('notesLoaded', this.notes);
    }
    
    /**
     * Save notes to storage
     */
    saveNotes() {
        MindScribeUtils.StorageUtils.save('mindscribe_notes', this.notes);
    }
    
    /**
     * Get all notes
     * @returns {Array} All notes
     */
    getAllNotes() {
        return [...this.notes];
    }
    
    /**
     * Get a note by ID
     * @param {string} id - Note ID
     * @returns {Object|null} Note object or null if not found
     */
    getNoteById(id) {
        return this.notes.find(note => note.id === id) || null;
    }
    
    /**
     * Create a new note
     * @param {Object} noteData - Note data
     * @returns {Object} Created note
     */
    createNote(noteData) {
        const now = new Date().toISOString();
        
        const newNote = {
            id: this.generateId(),
            title: noteData.title || 'Untitled Note',
            category: noteData.category || 'Personal',
            content: noteData.content || '',
            tags: noteData.tags || [],
            createdAt: now,
            updatedAt: now
        };
        
        this.notes.unshift(newNote);
        this.saveNotes();
        
        this.trigger('noteCreated', newNote);
        return newNote;
    }
    
    /**
     * Update an existing note
     * @param {string} id - Note ID
     * @param {Object} noteData - Updated note data
     * @returns {Object|null} Updated note or null if not found
     */
    updateNote(id, noteData) {
        const index = this.notes.findIndex(note => note.id === id);
        
        if (index === -1) {
            return null;
        }
        
        const updatedNote = {
            ...this.notes[index],
            ...noteData,
            updatedAt: new Date().toISOString()
        };
        
        this.notes[index] = updatedNote;
        this.saveNotes();
        
        this.trigger('noteUpdated', updatedNote);
        return updatedNote;
    }
    
    /**
     * Delete a note
     * @param {string} id - Note ID
     * @returns {boolean} Success status
     */
    deleteNote(id) {
        const initialLength = this.notes.length;
        this.notes = this.notes.filter(note => note.id !== id);
        
        if (this.notes.length !== initialLength) {
            this.saveNotes();
            this.trigger('noteDeleted', id);
            return true;
        }
        
        return false;
    }
    
    /**
     * Search notes
     * @param {string} query - Search query
     * @returns {Array} Matching notes
     */
    searchNotes(query) {
        if (!query || query.trim() === '') {
            return this.getAllNotes();
        }
        
        const searchTerm = query.toLowerCase();
        
        return this.notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) || 
            note.content.toLowerCase().includes(searchTerm) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            note.category.toLowerCase().includes(searchTerm)
        );
    }
    
    /**
     * Filter notes by category
     * @param {string} category - Category to filter by
     * @returns {Array} Filtered notes
     */
    filterByCategory(category) {
        if (!category || category === 'All') {
            return this.getAllNotes();
        }
        
        return this.notes.filter(note => note.category === category);
    }
    
    /**
     * Filter notes by tag
     * @param {string} tag - Tag to filter by
     * @returns {Array} Filtered notes
     */
    filterByTag(tag) {
        if (!tag) {
            return this.getAllNotes();
        }
        
        return this.notes.filter(note => 
            note.tags.some(noteTag => noteTag.toLowerCase() === tag.toLowerCase())
        );
    }
    
    /**
     * Get all unique tags from notes
     * @returns {Array} Unique tags
     */
    getAllTags() {
        const tagSet = new Set();
        
        this.notes.forEach(note => {
            note.tags.forEach(tag => {
                tagSet.add(tag);
            });
        });
        
        return Array.from(tagSet).sort();
    }
    
    /**
     * Sort notes
     * @param {string} sortBy - Field to sort by
     * @param {boolean} ascending - Sort direction
     * @returns {Array} Sorted notes
     */
    sortNotes(sortBy = 'updatedAt', ascending = false) {
        const sortedNotes = [...this.notes];
        
        sortedNotes.sort((a, b) => {
            let valueA, valueB;
            
            // Handle different field types
            if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
                valueA = new Date(a[sortBy]).getTime();
                valueB = new Date(b[sortBy]).getTime();
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
        
        return sortedNotes;
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
     * Get sample notes for initial data
     * @returns {Array} Sample notes
     */
    getSampleNotes() {
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
}

// Create global instance
window.notesManager = new NotesManager();