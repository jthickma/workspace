// MindScribe Note-Taking App
// Calendar and events functionality

class CalendarManager {
    constructor() {
        this.events = [];
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.eventListeners = {};
    }
    
    /**
     * Initialize the calendar manager
     */
    init() {
        this.loadEvents();
    }
    
    /**
     * Load events from storage
     */
    loadEvents() {
        this.events = MindScribeUtils.StorageUtils.load('mindscribe_events', []);
        
        // If no events exist, create sample events
        if (this.events.length === 0) {
            this.events = this.getSampleEvents();
            this.saveEvents();
        }
        
        this.trigger('eventsLoaded', this.events);
    }
    
    /**
     * Save events to storage
     */
    saveEvents() {
        MindScribeUtils.StorageUtils.save('mindscribe_events', this.events);
    }
    
    /**
     * Get all events
     * @returns {Array} All events
     */
    getAllEvents() {
        return [...this.events];
    }
    
    /**
     * Get an event by ID
     * @param {string} id - Event ID
     * @returns {Object|null} Event object or null if not found
     */
    getEventById(id) {
        return this.events.find(event => event.id === id) || null;
    }
    
    /**
     * Create a new event
     * @param {Object} eventData - Event data
     * @returns {Object} Created event
     */
    createEvent(eventData) {
        const now = new Date().toISOString();
        
        const newEvent = {
            id: this.generateId(),
            title: eventData.title || 'Untitled Event',
            start: eventData.start || now,
            end: eventData.end || now,
            category: eventData.category || 'Personal',
            description: eventData.description || '',
            createdAt: now
        };
        
        this.events.push(newEvent);
        this.saveEvents();
        
        this.trigger('eventCreated', newEvent);
        return newEvent;
    }
    
    /**
     * Update an existing event
     * @param {string} id - Event ID
     * @param {Object} eventData - Updated event data
     * @returns {Object|null} Updated event or null if not found
     */
    updateEvent(id, eventData) {
        const index = this.events.findIndex(event => event.id === id);
        
        if (index === -1) {
            return null;
        }
        
        const updatedEvent = {
            ...this.events[index],
            ...eventData
        };
        
        this.events[index] = updatedEvent;
        this.saveEvents();
        
        this.trigger('eventUpdated', updatedEvent);
        return updatedEvent;
    }
    
    /**
     * Delete an event
     * @param {string} id - Event ID
     * @returns {boolean} Success status
     */
    deleteEvent(id) {
        const initialLength = this.events.length;
        this.events = this.events.filter(event => event.id !== id);
        
        if (this.events.length !== initialLength) {
            this.saveEvents();
            this.trigger('eventDeleted', id);
            return true;
        }
        
        return false;
    }
    
    /**
     * Get events for a specific date
     * @param {Date} date - The date to get events for
     * @returns {Array} Events on the specified date
     */
    getEventsForDate(date) {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        return this.events.filter(event => {
            const eventStart = new Date(event.start);
            return eventStart >= targetDate && eventStart < nextDay;
        });
    }
    
    /**
     * Get events for today
     * @returns {Array} Today's events
     */
    getTodayEvents() {
        return this.getEventsForDate(new Date());
    }
    
    /**
     * Get events for a specific month
     * @param {number} month - Month (0-11)
     * @param {number} year - Year
     * @returns {Array} Events in the specified month
     */
    getEventsForMonth(month, year) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
        
        return this.events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate >= startDate && eventDate <= endDate;
        });
    }
    
    /**
     * Get events for the current month
     * @returns {Array} Events in the current month
     */
    getCurrentMonthEvents() {
        return this.getEventsForMonth(this.currentMonth, this.currentYear);
    }
    
    /**
     * Get events by category
     * @param {string} category - Event category
     * @returns {Array} Events in the specified category
     */
    getEventsByCategory(category) {
        if (!category || category === 'All') {
            return this.getAllEvents();
        }
        
        return this.events.filter(event => event.category === category);
    }
    
    /**
     * Navigate to the previous month
     */
    previousMonth() {
        this.currentMonth--;
        
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        
        this.trigger('monthChanged', { month: this.currentMonth, year: this.currentYear });
    }
    
    /**
     * Navigate to the next month
     */
    nextMonth() {
        this.currentMonth++;
        
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        
        this.trigger('monthChanged', { month: this.currentMonth, year: this.currentYear });
    }
    
    /**
     * Set the current month and year
     * @param {number} month - Month (0-11)
     * @param {number} year - Year
     */
    setCurrentMonth(month, year) {
        this.currentMonth = month;
        this.currentYear = year;
        
        this.trigger('monthChanged', { month, year });
    }
    
    /**
     * Get calendar data for the current month
     * @returns {Object} Calendar data
     */
    getCalendarData() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Get the previous month's last days to fill in the first week
        const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
        
        // Calculate days from previous month to show
        const prevMonthDays = [];
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            prevMonthDays.push({
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                isToday: false,
                events: []
            });
        }
        
        // Current month days
        const currentMonthDays = [];
        const today = new Date();
        const isCurrentMonthAndYear = 
            today.getMonth() === this.currentMonth && 
            today.getFullYear() === this.currentYear;
        
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(this.currentYear, this.currentMonth, i);
            const isToday = isCurrentMonthAndYear && today.getDate() === i;
            const events = this.getEventsForDate(date);
            
            currentMonthDays.push({
                day: i,
                isCurrentMonth: true,
                isToday,
                events
            });
        }
        
        // Next month days to fill the last week
        const nextMonthDays = [];
        const totalDaysShown = prevMonthDays.length + currentMonthDays.length;
        const daysToAdd = 42 - totalDaysShown; // 6 rows of 7 days = 42
        
        for (let i = 1; i <= daysToAdd; i++) {
            nextMonthDays.push({
                day: i,
                isCurrentMonth: false,
                isToday: false,
                events: []
            });
        }
        
        // Combine all days
        const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
        
        // Group into weeks
        const weeks = [];
        for (let i = 0; i < allDays.length; i += 7) {
            weeks.push(allDays.slice(i, i + 7));
        }
        
        return {
            month: this.currentMonth,
            year: this.currentYear,
            weeks
        };
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
     * Get sample events for initial data
     * @returns {Array} Sample events
     */
    getSampleEvents() {
        return [
            {
                id: 'event1',
                title: 'Team Meeting',
                start: '2023-11-14T14:00:00Z',
                end: '2023-11-14T15:30:00Z',
                category: 'Work',
                description: 'Weekly team sync to discuss project progress and roadblocks.',
                createdAt: '2023-11-10T09:00:00Z'
            },
            {
                id: 'event2',
                title: 'Project Deadline',
                start: '2023-11-14T18:00:00Z',
                end: '2023-11-14T18:00:00Z',
                category: 'Work',
                description: 'Final submission deadline for the client project.',
                createdAt: '2023-11-01T10:30:00Z'
            },
            {
                id: 'event3',
                title: 'Dentist Appointment',
                start: '2023-11-16T13:00:00Z',
                end: '2023-11-16T14:00:00Z',
                category: 'Personal',
                description: 'Regular checkup at Dr. Smith\'s office.',
                createdAt: '2023-11-05T11:15:00Z'
            },
            {
                id: 'event4',
                title: 'Birthday Party',
                start: '2023-11-18T18:00:00Z',
                end: '2023-11-18T22:00:00Z',
                category: 'Personal',
                description: 'Sarah\'s birthday celebration at Riverfront Restaurant.',
                createdAt: '2023-11-02T09:45:00Z'
            }
        ];
    }
}

// Create global instance
window.calendarManager = new CalendarManager();