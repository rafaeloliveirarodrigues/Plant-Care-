// Plant Irrigation App - V2 (Scheduling & Reminders)
// Enhanced with watering schedules, status indicators, and plant management

class PlantIrrigationApp {
    constructor() {
        this.plants = this.loadPlants();
        this.wateringLogs = this.loadWateringLogs();
        this.currentUser = '';
        this.notificationsEnabled = false;
        this.editingPlantId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderPlants();
        this.renderHistory();
        this.checkNotificationPermission();
        this.startNotificationChecker();
    }

    setupEventListeners() {
        // User selection
        const userSelect = document.getElementById('current-user');
        userSelect.addEventListener('change', (e) => {
            this.currentUser = e.target.value;
            this.updateWaterButtons();
        });

        // Clear history button
        const clearBtn = document.getElementById('clear-history-btn');
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all watering history?')) {
                this.clearHistory();
            }
        });

        // Manage plants button
        const managePlantsBtn = document.getElementById('manage-plants-btn');
        managePlantsBtn.addEventListener('click', () => this.openManagePlantsModal());

        // Notifications button
        const notificationsBtn = document.getElementById('notifications-btn');
        notificationsBtn.addEventListener('click', () => this.toggleNotifications());

        // Modal close buttons
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal('plant-modal'));
        document.getElementById('close-form-modal').addEventListener('click', () => this.closeModal('plant-form-modal'));

        // Add plant button
        document.getElementById('add-plant-btn').addEventListener('click', () => this.openPlantForm());

        // Plant form
        document.getElementById('plant-form').addEventListener('submit', (e) => this.savePlant(e));
        document.getElementById('cancel-form-btn').addEventListener('click', () => this.closeModal('plant-form-modal'));

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    renderPlants() {
        const container = document.getElementById('plants-container');
        container.innerHTML = '';

        if (this.plants.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">🌱</div>
                    <p>No plants yet. Click the ⚙️ button to add your first plant!</p>
                </div>
            `;
            return;
        }

        this.plants.forEach(plant => {
            const lastWatering = this.getLastWatering(plant.id);
            const status = this.getPlantStatus(plant, lastWatering);
            const card = this.createPlantCard(plant, lastWatering, status);
            container.appendChild(card);
        });
    }

    createPlantCard(plant, lastWatering, status) {
        const card = document.createElement('div');
        card.className = 'plant-card';
        
        let statusBadge = `<div class="status-badge status-${status.class}">${status.text}</div>`;
        
        let lastWateredHTML = '<div class="last-watered">Never watered yet</div>';
        let nextWateringHTML = '';
        
        if (lastWatering) {
            const timeAgo = this.getTimeAgo(lastWatering.timestamp);
            lastWateredHTML = `
                <div class="last-watered">
                    <strong>Last watered:</strong>
                    <div class="last-watered-info">
                        ${timeAgo} by ${lastWatering.wateredBy}
                    </div>
                </div>
            `;
            
            const nextDate = this.getNextWateringDate(lastWatering.timestamp, plant.wateringFrequencyDays);
            const daysUntil = this.getDaysUntil(nextDate);
            
            if (daysUntil > 0) {
                nextWateringHTML = `
                    <div class="next-watering">
                        <span class="next-watering-icon">📅</span>
                        <span>Next watering in ${daysUntil} day${daysUntil > 1 ? 's' : ''}</span>
                    </div>
                `;
            } else if (daysUntil === 0) {
                nextWateringHTML = `
                    <div class="next-watering">
                        <span class="next-watering-icon">⏰</span>
                        <span>Water today!</span>
                    </div>
                `;
            } else {
                nextWateringHTML = `
                    <div class="next-watering">
                        <span class="next-watering-icon">⚠️</span>
                        <span>Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) > 1 ? 's' : ''}!</span>
                    </div>
                `;
            }
        } else {
            nextWateringHTML = `
                <div class="next-watering">
                    <span class="next-watering-icon">💧</span>
                    <span>Water every ${plant.wateringFrequencyDays} days</span>
                </div>
            `;
        }

        card.innerHTML = `
            ${statusBadge}
            <div class="plant-header">
                <div class="plant-icon">${plant.icon}</div>
                <div class="plant-info">
                    <h3>${plant.name}</h3>
                    <div class="plant-location">📍 ${plant.location}</div>
                </div>
            </div>
            ${lastWateredHTML}
            ${nextWateringHTML}
            <button class="water-btn" data-plant-id="${plant.id}" ${!this.currentUser ? 'disabled' : ''}>
                💧 Water Plant
            </button>
        `;

        const waterBtn = card.querySelector('.water-btn');
        waterBtn.addEventListener('click', () => this.waterPlant(plant.id));

        return card;
    }

    getPlantStatus(plant, lastWatering) {
        if (!lastWatering) {
            return { class: 'never', text: 'Not watered yet' };
        }

        const nextDate = this.getNextWateringDate(lastWatering.timestamp, plant.wateringFrequencyDays);
        const daysUntil = this.getDaysUntil(nextDate);

        if (daysUntil < 0) {
            return { class: 'overdue', text: '⚠️ Overdue' };
        } else if (daysUntil === 0) {
            return { class: 'soon', text: '⏰ Water Today' };
        } else if (daysUntil === 1) {
            return { class: 'soon', text: '📅 Water Tomorrow' };
        } else {
            return { class: 'good', text: '✅ All Good' };
        }
    }

    getNextWateringDate(lastWateredDate, frequencyDays) {
        const date = new Date(lastWateredDate);
        date.setDate(date.getDate() + frequencyDays);
        return date;
    }

    getDaysUntil(targetDate) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const target = new Date(targetDate);
        target.setHours(0, 0, 0, 0);
        const diffMs = target - now;
        return Math.floor(diffMs / 86400000);
    }

    waterPlant(plantId) {
        if (!this.currentUser) {
            this.showToast('Please select your name first!');
            return;
        }

        const plant = this.plants.find(p => p.id === plantId);
        if (!plant) return;

        const log = {
            id: Date.now().toString(),
            plantId: plantId,
            wateredBy: this.currentUser,
            timestamp: new Date().toISOString()
        };

        this.wateringLogs.unshift(log);
        this.saveWateringLogs();
        
        this.renderPlants();
        this.renderHistory();
        
        this.showToast(`${plant.icon} ${plant.name} watered successfully!`);
    }

    getLastWatering(plantId) {
        return this.wateringLogs.find(log => log.plantId === plantId);
    }

    renderHistory() {
        const container = document.getElementById('history-container');
        
        if (this.wateringLogs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🌱</div>
                    <p>No watering history yet. Start by watering your plants!</p>
                </div>
            `;
            return;
        }

        const recentLogs = this.wateringLogs.slice(0, 10);
        
        container.innerHTML = recentLogs.map(log => {
            const plant = this.plants.find(p => p.id === log.plantId);
            if (!plant) return '';

            const timeAgo = this.getTimeAgo(log.timestamp);
            const date = new Date(log.timestamp);
            const formattedDate = date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="history-item">
                    <div class="history-info">
                        <div class="history-plant">${plant.icon} ${plant.name}</div>
                        <div class="history-details">
                            Watered by <strong>${log.wateredBy}</strong> • ${timeAgo}
                        </div>
                    </div>
                    <div class="history-time">${formattedDate}</div>
                </div>
            `;
        }).join('');
    }

    // Plant Management
    openManagePlantsModal() {
        const modal = document.getElementById('plant-modal');
        const listContainer = document.getElementById('plant-list-edit');
        
        if (this.plants.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <p>No plants yet. Click "Add New Plant" to get started!</p>
                </div>
            `;
        } else {
            listContainer.innerHTML = this.plants.map(plant => `
                <div class="plant-edit-item">
                    <div class="plant-edit-icon">${plant.icon}</div>
                    <div class="plant-edit-info">
                        <div class="plant-edit-name">${plant.name}</div>
                        <div class="plant-edit-details">
                            ${plant.location} • Water every ${plant.wateringFrequencyDays} days
                        </div>
                    </div>
                    <div class="plant-edit-actions">
                        <button class="btn-edit" onclick="app.editPlant('${plant.id}')">Edit</button>
                        <button class="btn-delete" onclick="app.deletePlant('${plant.id}')">Delete</button>
                    </div>
                </div>
            `).join('');
        }
        
        modal.classList.add('show');
    }

    openPlantForm(plantId = null) {
        const modal = document.getElementById('plant-form-modal');
        const title = document.getElementById('form-modal-title');
        const form = document.getElementById('plant-form');
        
        this.editingPlantId = plantId;
        
        if (plantId) {
            const plant = this.plants.find(p => p.id === plantId);
            if (plant) {
                title.textContent = 'Edit Plant';
                document.getElementById('plant-name').value = plant.name;
                document.getElementById('plant-location').value = plant.location;
                document.getElementById('plant-icon').value = plant.icon;
                document.getElementById('watering-frequency').value = plant.wateringFrequencyDays;
            }
        } else {
            title.textContent = 'Add Plant';
            form.reset();
        }
        
        this.closeModal('plant-modal');
        modal.classList.add('show');
    }

    savePlant(e) {
        e.preventDefault();
        
        const name = document.getElementById('plant-name').value.trim();
        const location = document.getElementById('plant-location').value.trim();
        const icon = document.getElementById('plant-icon').value.trim();
        const frequency = parseInt(document.getElementById('watering-frequency').value);
        
        if (this.editingPlantId) {
            // Edit existing plant
            const plantIndex = this.plants.findIndex(p => p.id === this.editingPlantId);
            if (plantIndex !== -1) {
                this.plants[plantIndex] = {
                    ...this.plants[plantIndex],
                    name,
                    location,
                    icon,
                    wateringFrequencyDays: frequency
                };
                this.showToast(`${icon} ${name} updated successfully!`);
            }
        } else {
            // Add new plant
            const newPlant = {
                id: Date.now().toString(),
                name,
                location,
                icon,
                wateringFrequencyDays: frequency
            };
            this.plants.push(newPlant);
            this.showToast(`${icon} ${name} added successfully!`);
        }
        
        this.savePlants();
        this.renderPlants();
        this.closeModal('plant-form-modal');
        this.editingPlantId = null;
    }

    editPlant(plantId) {
        this.openPlantForm(plantId);
    }

    deletePlant(plantId) {
        const plant = this.plants.find(p => p.id === plantId);
        if (!plant) return;
        
        if (confirm(`Are you sure you want to delete ${plant.icon} ${plant.name}?`)) {
            this.plants = this.plants.filter(p => p.id !== plantId);
            this.wateringLogs = this.wateringLogs.filter(log => log.plantId !== plantId);
            
            this.savePlants();
            this.saveWateringLogs();
            this.renderPlants();
            this.renderHistory();
            
            this.showToast(`${plant.icon} ${plant.name} deleted`);
            this.openManagePlantsModal();
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }

    // Notifications
    async checkNotificationPermission() {
        if ('Notification' in window) {
            const permission = Notification.permission;
            const btn = document.getElementById('notifications-btn');
            
            if (permission === 'granted') {
                this.notificationsEnabled = true;
                btn.classList.add('active');
            }
        }
    }

    async toggleNotifications() {
        if (!('Notification' in window)) {
            this.showToast('Notifications not supported in this browser');
            return;
        }

        const btn = document.getElementById('notifications-btn');

        if (Notification.permission === 'granted') {
            this.notificationsEnabled = !this.notificationsEnabled;
            btn.classList.toggle('active');
            this.showToast(this.notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled');
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.notificationsEnabled = true;
                btn.classList.add('active');
                this.showToast('Notifications enabled!');
                this.sendTestNotification();
            }
        } else {
            this.showToast('Notifications blocked. Enable in browser settings.');
        }
    }

    sendTestNotification() {
        new Notification('🌱 Plant Irrigation', {
            body: 'Notifications are now enabled! You\'ll be reminded when plants need water.',
            icon: '🌱'
        });
    }

    startNotificationChecker() {
        // Check every hour for plants that need watering
        setInterval(() => {
            if (this.notificationsEnabled) {
                this.checkPlantsNeedingWater();
            }
        }, 3600000); // 1 hour

        // Also check on load
        if (this.notificationsEnabled) {
            setTimeout(() => this.checkPlantsNeedingWater(), 5000);
        }
    }

    checkPlantsNeedingWater() {
        const plantsNeedingWater = [];
        
        this.plants.forEach(plant => {
            const lastWatering = this.getLastWatering(plant.id);
            if (lastWatering) {
                const nextDate = this.getNextWateringDate(lastWatering.timestamp, plant.wateringFrequencyDays);
                const daysUntil = this.getDaysUntil(nextDate);
                
                if (daysUntil <= 0) {
                    plantsNeedingWater.push(plant);
                }
            }
        });

        if (plantsNeedingWater.length > 0) {
            const plantNames = plantsNeedingWater.map(p => `${p.icon} ${p.name}`).join(', ');
            new Notification('🌱 Time to Water Plants!', {
                body: `These plants need water: ${plantNames}`,
                icon: '💧'
            });
        }
    }

    // Utility methods
    updateWaterButtons() {
        const buttons = document.querySelectorAll('.water-btn');
        buttons.forEach(btn => {
            btn.disabled = !this.currentUser;
        });
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    showToast(message) {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    clearHistory() {
        this.wateringLogs = [];
        this.saveWateringLogs();
        this.renderPlants();
        this.renderHistory();
        this.showToast('History cleared successfully!');
    }

    // LocalStorage methods
    loadPlants() {
        try {
            const stored = localStorage.getItem('plantIrrigationPlants');
            if (stored) {
                return JSON.parse(stored);
            }
            // Default plants for first-time users
            return [
                { id: '1', name: 'Basil', location: 'Window Sill', icon: '🌿', wateringFrequencyDays: 2 },
                { id: '2', name: 'Mint', location: 'Counter', icon: '🍃', wateringFrequencyDays: 2 },
                { id: '3', name: 'Tomato', location: 'Window Sill', icon: '🍅', wateringFrequencyDays: 1 },
                { id: '4', name: 'Succulent', location: 'Shelf', icon: '🌵', wateringFrequencyDays: 7 },
                { id: '5', name: 'Aloe Vera', location: 'Counter', icon: '🪴', wateringFrequencyDays: 10 }
            ];
        } catch (error) {
            console.error('Error loading plants:', error);
            return [];
        }
    }

    savePlants() {
        try {
            localStorage.setItem('plantIrrigationPlants', JSON.stringify(this.plants));
        } catch (error) {
            console.error('Error saving plants:', error);
            this.showToast('Error saving plants. Storage might be full.');
        }
    }

    loadWateringLogs() {
        try {
            const stored = localStorage.getItem('plantWateringLogs');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading watering logs:', error);
            return [];
        }
    }

    saveWateringLogs() {
        try {
            localStorage.setItem('plantWateringLogs', JSON.stringify(this.wateringLogs));
        } catch (error) {
            console.error('Error saving watering logs:', error);
            this.showToast('Error saving data. Storage might be full.');
        }
    }
}

// Global app instance
let app;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app = new PlantIrrigationApp();
});

// Made with Bob
