// MindScribe Note-Taking App
// Utility functions

/**
 * Toast notification system
 */
const Toast = {
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of toast (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     */
    show: function(message, type = 'info', duration = 3000) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, duration);
    },
    
    /**
     * Show a success toast
     * @param {string} message - The message to display
     */
    success: function(message) {
        this.show(message, 'success');
    },
    
    /**
     * Show an error toast
     * @param {string} message - The message to display
     */
    error: function(message) {
        this.show(message, 'error');
    },
    
    /**
     * Show a warning toast
     * @param {string} message - The message to display
     */
    warning: function(message) {
        this.show(message, 'warning');
    }
};

/**
 * Date utility functions
 */
const DateUtils = {
    /**
     * Format a date string to a readable format
     * @param {string} dateString - ISO date string
     * @param {string} format - Format type (short, medium, long)
     * @returns {string} Formatted date string
     */
    formatDate: function(dateString, format = 'medium') {
        const date = new Date(dateString);
        
        switch (format) {
            case 'short':
                return date.toLocaleDateString();
            case 'long':
                return date.toLocaleString();
            case 'time':
                return date.toLocaleTimeString();
            case 'medium':
            default:
                return date.toLocaleDateString() + ' ' + 
                       date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    },
    
    /**
     * Get relative time (e.g., "2 hours ago")
     * @param {string} dateString - ISO date string
     * @returns {string} Relative time string
     */
    getRelativeTime: function(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 30) {
            return this.formatDate(dateString, 'short');
        }
        
        if (days > 0) {
            return days === 1 ? 'yesterday' : days + ' days ago';
        }
        
        if (hours > 0) {
            return hours === 1 ? '1 hour ago' : hours + ' hours ago';
        }
        
        if (minutes > 0) {
            return minutes === 1 ? '1 minute ago' : minutes + ' minutes ago';
        }
        
        return 'just now';
    },
    
    /**
     * Get the start and end of a week
     * @param {Date} date - The date to get the week for
     * @returns {Object} Object with start and end dates
     */
    getWeekRange: function(date = new Date()) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        
        const start = new Date(date);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        
        return { start, end };
    },
    
    /**
     * Get the start and end of a month
     * @param {Date} date - The date to get the month for
     * @returns {Object} Object with start and end dates
     */
    getMonthRange: function(date = new Date()) {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        
        return { start, end };
    },
    
    /**
     * Check if a date is today
     * @param {Date} date - The date to check
     * @returns {boolean} True if the date is today
     */
    isToday: function(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }
};

/**
 * Storage utility functions
 */
const StorageUtils = {
    /**
     * Save data to localStorage
     * @param {string} key - The key to save under
     * @param {any} data - The data to save
     * @returns {boolean} Success status
     */
    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },
    
    /**
     * Load data from localStorage
     * @param {string} key - The key to load
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} The loaded data or default value
     */
    load: function(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    },
    
    /**
     * Remove data from localStorage
     * @param {string} key - The key to remove
     * @returns {boolean} Success status
     */
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    /**
     * Clear all app data from localStorage
     * @returns {boolean} Success status
     */
    clearAll: function() {
        try {
            // Only clear keys that start with our app prefix
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('mindscribe_')) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },
    
    /**
     * Calculate total storage usage
     * @returns {number} Size in MB
     */
    getStorageUsage: function() {
        let total = 0;
        
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('mindscribe_')) {
                total += localStorage.getItem(key).length * 2 / 1024 / 1024; // Convert to MB
            }
        });
        
        return total;
    }
};

/**
 * Text utility functions
 */
const TextUtils = {
    /**
     * Truncate text to a specific length
     * @param {string} text - The text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add when truncated
     * @returns {string} Truncated text
     */
    truncate: function(text, maxLength, suffix = '...') {
        if (!text) return '';
        
        if (text.length <= maxLength) {
            return text;
        }
        
        return text.substring(0, maxLength) + suffix;
    },
    
    /**
     * Highlight search terms in text
     * @param {string} text - The text to search in
     * @param {string} searchTerm - The term to highlight
     * @returns {string} HTML with highlighted terms
     */
    highlightSearchTerm: function(text, searchTerm) {
        if (!searchTerm || !text) return text;
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    },
    
    /**
     * Convert plain text to HTML with basic formatting
     * @param {string} text - The text to convert
     * @returns {string} Formatted HTML
     */
    textToHtml: function(text) {
        if (!text) return '';
        
        // Replace newlines with <br>
        let html = text.replace(/\n/g, '<br>');
        
        // Replace URLs with links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        html = html.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
        return html;
    },
    
    /**
     * Parse tags from a comma-separated string
     * @param {string} tagString - Comma-separated tags
     * @returns {string[]} Array of tags
     */
    parseTags: function(tagString) {
        if (!tagString) return [];
        
        return tagString.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
    },
    
    /**
     * Generate a slug from text
     * @param {string} text - The text to convert
     * @returns {string} URL-friendly slug
     */
    generateSlug: function(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .trim();
    }
};

/**
 * Export utilities
 */
window.MindScribeUtils = {
    Toast,
    DateUtils,
    StorageUtils,
    TextUtils
};