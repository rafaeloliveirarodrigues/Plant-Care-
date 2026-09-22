// Plant Care V3 — shared Supabase household data
class PlantIrrigationApp {
    constructor() {
        this.config = window.PLANT_CARE_SUPABASE_CONFIG;
        this.supabase = null;
        this.plants = [];
        this.wateringLogs = [];
        this.currentUser = null;
        this.household = null;
        this.notificationsEnabled = false;
        this.editingPlantId = null;
        this.realtimeChannel = null;
    }

    async init() {
        if (!this.config?.url || !this.config?.publishableKey || !window.supabase) {
            this.showToast('App configuration is missing. Please contact the household owner.');
            return;
        }
        this.supabase = window.supabase.createClient(this.config.url, this.config.publishableKey);
        this.setupEventListeners();

        const { data: { session } } = await this.supabase.auth.getSession();
        await this.handleSession(session);
        this.supabase.auth.onAuthStateChange((_event, changedSession) => {
            window.setTimeout(() => this.handleSession(changedSession), 0);
        });
    }

    setupEventListeners() {
        document.getElementById('sign-in-form').addEventListener('submit', (event) => this.sendMagicLink(event));
        document.getElementById('sign-out-btn').addEventListener('click', () => this.signOut());
        document.getElementById('create-household-form').addEventListener('submit', (event) => this.createHousehold(event));
        document.getElementById('join-household-form').addEventListener('submit', (event) => this.joinHousehold(event));
        document.getElementById('clear-history-btn').addEventListener('click', () => this.clearHistory());
        document.getElementById('manage-plants-btn').addEventListener('click', () => this.openManagePlantsModal());
        document.getElementById('notifications-btn').addEventListener('click', () => this.toggleNotifications());
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal('plant-modal'));
        document.getElementById('close-form-modal').addEventListener('click', () => this.closeModal('plant-form-modal'));
        document.getElementById('add-plant-btn').addEventListener('click', () => this.openPlantForm());
        document.getElementById('plant-form').addEventListener('submit', (event) => this.savePlant(event));
        document.getElementById('cancel-form-btn').addEventListener('click', () => this.closeModal('plant-form-modal'));
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) this.closeModal(event.target.id);
        });
    }

    async sendMagicLink(event) {
        event.preventDefault();
        const name = document.getElementById('display-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const { error } = await this.supabase.auth.signInWithOtp({
            email,
            options: { data: { display_name: name }, emailRedirectTo: window.location.origin }
        });
        if (error) return this.showToast(error.message);
        this.showToast('Check your email for the sign-in link.');
        event.target.reset();
    }

    async signOut() {
        const { error } = await this.supabase.auth.signOut();
        if (error) this.showToast(error.message);
    }

    async handleSession(session) {
        this.currentUser = session?.user || null;
        this.household = null;
        this.unsubscribeRealtime();

        document.getElementById('signed-out-view').hidden = Boolean(this.currentUser);
        document.getElementById('signed-in-view').hidden = !this.currentUser;
        document.getElementById('household-setup').hidden = true;
        document.getElementById('app-content').hidden = true;
        document.getElementById('household-summary').hidden = true;
        this.setAppControls(false);
        if (!this.currentUser) return;

        document.getElementById('current-user').textContent = this.displayName();
        document.getElementById('current-email').textContent = this.currentUser.email || '';

        const { data: membership, error } = await this.supabase
            .from('household_members').select('household_id').eq('user_id', this.currentUser.id).maybeSingle();
        if (error) return this.showToast('Could not load household: ' + error.message);
        if (!membership) {
            document.getElementById('household-setup').hidden = false;
            return;
        }

        const { data: household, error: householdError } = await this.supabase
            .from('households').select('id, name, invite_code').eq('id', membership.household_id).single();
        if (householdError) return this.showToast('Could not load household: ' + householdError.message);

        this.household = household;
        document.getElementById('household-name').textContent = household.name;
        document.getElementById('invite-code').textContent = household.invite_code;
        document.getElementById('household-summary').hidden = false;
        document.getElementById('app-content').hidden = false;
        this.setAppControls(true);

        await this.loadData();
        this.checkNotificationPermission();
        this.startNotificationChecker();
        this.subscribeToChanges();
    }

    async createHousehold(event) {
        event.preventDefault();
        const name = document.getElementById('household-name-input').value.trim();
        const { error } = await this.supabase.rpc('create_household', { household_name: name });
        if (error) return this.showToast(error.message);
        this.showToast('Household created. Share your invite code with the other two people.');
        await this.handleSession((await this.supabase.auth.getSession()).data.session);
    }

    async joinHousehold(event) {
        event.preventDefault();
        const code = document.getElementById('household-code-input').value.trim();
        const { error } = await this.supabase.rpc('join_household', { code });
        if (error) return this.showToast(error.message);
        this.showToast('You joined the household.');
        await this.handleSession((await this.supabase.auth.getSession()).data.session);
    }

    async loadData() {
        const [plantsResult, logsResult] = await Promise.all([
            this.supabase.from('plants').select('*').eq('household_id', this.household.id).order('created_at'),
            this.supabase.from('watering_logs').select('*').order('watered_at', { ascending: false }).limit(100)
        ]);
        if (plantsResult.error || logsResult.error) return this.showToast((plantsResult.error || logsResult.error).message);

        this.plants = plantsResult.data.map((plant) => ({
            id: plant.id, name: plant.name, location: plant.location, icon: plant.icon,
            wateringFrequencyDays: plant.watering_frequency_days
        }));
        this.wateringLogs = logsResult.data.map((log) => ({
            id: log.id, plantId: log.plant_id, wateredBy: log.watered_by_name, timestamp: log.watered_at
        }));
        this.renderPlants();
        this.renderHistory();
    }

    subscribeToChanges() {
        this.realtimeChannel = this.supabase.channel('plant-care-' + this.household.id)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'plants', filter: 'household_id=eq.' + this.household.id }, () => this.loadData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'watering_logs' }, () => this.loadData())
            .subscribe();
    }

    unsubscribeRealtime() {
        if (this.realtimeChannel && this.supabase) {
            this.supabase.removeChannel(this.realtimeChannel);
            this.realtimeChannel = null;
        }
    }

    renderPlants() {
        const container = document.getElementById('plants-container');
        if (!this.plants.length) {
            container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><div class="empty-state-icon">🌱</div><p>No plants yet. Add your first plant in settings.</p></div>';
            return;
        }
        container.innerHTML = this.plants.map((plant) => {
            const lastWatering = this.getLastWatering(plant.id);
            const status = this.getPlantStatus(plant, lastWatering);
            const lastWatered = lastWatering
                ? '<div class="last-watered"><strong>Last watered:</strong><div class="last-watered-info">' + this.escapeHtml(this.getTimeAgo(lastWatering.timestamp)) + ' by ' + this.escapeHtml(lastWatering.wateredBy) + '</div></div>'
                : '<div class="last-watered">Never watered yet</div>';
            return '<article class="plant-card"><div class="status-badge status-' + status.class + '">' + status.text + '</div><div class="plant-header"><div class="plant-icon">' + this.escapeHtml(plant.icon) + '</div><div class="plant-info"><h3>' + this.escapeHtml(plant.name) + '</h3><div class="plant-location">📍 ' + this.escapeHtml(plant.location) + '</div></div></div>' + lastWatered + this.getNextWateringText(plant, lastWatering) + '<button class="water-btn" data-plant-id="' + plant.id + '">💧 Water Plant</button></article>';
        }).join('');
        container.querySelectorAll('.water-btn').forEach((button) => {
            button.addEventListener('click', () => this.waterPlant(button.dataset.plantId));
        });
    }

    getNextWateringText(plant, lastWatering) {
        if (!lastWatering) return '<div class="next-watering"><span class="next-watering-icon">💧</span><span>Water every ' + plant.wateringFrequencyDays + ' days</span></div>';
        const daysUntil = this.getDaysUntil(this.getNextWateringDate(lastWatering.timestamp, plant.wateringFrequencyDays));
        if (daysUntil > 0) return '<div class="next-watering"><span class="next-watering-icon">📅</span><span>Next watering in ' + daysUntil + ' day' + (daysUntil === 1 ? '' : 's') + '</span></div>';
        if (daysUntil === 0) return '<div class="next-watering"><span class="next-watering-icon">⏰</span><span>Water today!</span></div>';
        return '<div class="next-watering"><span class="next-watering-icon">⚠️</span><span>Overdue by ' + Math.abs(daysUntil) + ' day' + (Math.abs(daysUntil) === 1 ? '' : 's') + '!</span></div>';
    }

    async waterPlant(plantId) {
        const plant = this.plants.find((item) => item.id === plantId);
        if (!plant || !this.currentUser) return;
        const { error } = await this.supabase.from('watering_logs').insert({
            plant_id: plantId, watered_by: this.currentUser.id, watered_by_name: this.displayName()
        });
        if (error) return this.showToast(error.message);
        this.showToast(plant.icon + ' ' + plant.name + ' watered successfully!');
        await this.loadData();
    }

    getLastWatering(plantId) {
        return this.wateringLogs.find((log) => log.plantId === plantId);
    }

    renderHistory() {
        const container = document.getElementById('history-container');
        const recentLogs = this.wateringLogs.filter((log) => this.plants.some((plant) => plant.id === log.plantId)).slice(0, 10);
        if (!recentLogs.length) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🌱</div><p>No watering history yet. Start by watering your plants!</p></div>';
            return;
        }
        container.innerHTML = recentLogs.map((log) => {
            const plant = this.plants.find((item) => item.id === log.plantId);
            const formattedDate = new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return '<div class="history-item"><div class="history-info"><div class="history-plant">' + this.escapeHtml(plant.icon) + ' ' + this.escapeHtml(plant.name) + '</div><div class="history-details">Watered by <strong>' + this.escapeHtml(log.wateredBy) + '</strong> • ' + this.escapeHtml(this.getTimeAgo(log.timestamp)) + '</div></div><div class="history-time">' + this.escapeHtml(formattedDate) + '</div></div>';
        }).join('');
    }

    openManagePlantsModal() {
        const list = document.getElementById('plant-list-edit');
        list.innerHTML = this.plants.length
            ? this.plants.map((plant) => '<div class="plant-edit-item"><div class="plant-edit-icon">' + this.escapeHtml(plant.icon) + '</div><div class="plant-edit-info"><div class="plant-edit-name">' + this.escapeHtml(plant.name) + '</div><div class="plant-edit-details">' + this.escapeHtml(plant.location) + ' • Water every ' + plant.wateringFrequencyDays + ' days</div></div><div class="plant-edit-actions"><button class="btn-edit" data-edit="' + plant.id + '">Edit</button><button class="btn-delete" data-delete="' + plant.id + '">Delete</button></div></div>').join('')
            : '<div class="empty-state"><p>No plants yet. Add one to get started.</p></div>';
        list.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => this.openPlantForm(button.dataset.edit)));
        list.querySelectorAll('[data-delete]').forEach((button) => button.addEventListener('click', () => this.deletePlant(button.dataset.delete)));
        document.getElementById('plant-modal').classList.add('show');
    }

    openPlantForm(plantId = null) {
        this.editingPlantId = plantId;
        const form = document.getElementById('plant-form');
        const plant = plantId ? this.plants.find((item) => item.id === plantId) : null;
        document.getElementById('form-modal-title').textContent = plant ? 'Edit Plant' : 'Add Plant';
        form.reset();
        if (plant) {
            document.getElementById('plant-name').value = plant.name;
            document.getElementById('plant-location').value = plant.location;
            document.getElementById('plant-icon').value = plant.icon;
            document.getElementById('watering-frequency').value = plant.wateringFrequencyDays;
        }
        this.closeModal('plant-modal');
        document.getElementById('plant-form-modal').classList.add('show');
    }

    async savePlant(event) {
        event.preventDefault();
        const values = {
            name: document.getElementById('plant-name').value.trim(),
            location: document.getElementById('plant-location').value.trim(),
            icon: document.getElementById('plant-icon').value.trim(),
            watering_frequency_days: Number(document.getElementById('watering-frequency').value)
        };
        const result = this.editingPlantId
            ? await this.supabase.from('plants').update(values).eq('id', this.editingPlantId)
            : await this.supabase.from('plants').insert({ ...values, household_id: this.household.id });
        if (result.error) return this.showToast(result.error.message);
        this.closeModal('plant-form-modal');
        this.editingPlantId = null;
        await this.loadData();
        this.showToast('Plant saved.');
    }

    async deletePlant(plantId) {
        const plant = this.plants.find((item) => item.id === plantId);
        if (!plant || !window.confirm('Delete ' + plant.name + ' and its watering history?')) return;
        const { error } = await this.supabase.from('plants').delete().eq('id', plantId);
        if (error) return this.showToast(error.message);
        await this.loadData();
        this.openManagePlantsModal();
        this.showToast(plant.name + ' deleted.');
    }

    async clearHistory() {
        if (!window.confirm('Clear all shared watering history?')) return;
        const plantIds = this.plants.map((plant) => plant.id);
        if (!plantIds.length) return;
        const { error } = await this.supabase.from('watering_logs').delete().in('plant_id', plantIds);
        if (error) return this.showToast(error.message);
        await this.loadData();
        this.showToast('Shared watering history cleared.');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    setAppControls(enabled) {
        document.getElementById('manage-plants-btn').disabled = !enabled;
        document.getElementById('notifications-btn').disabled = !enabled;
    }

    async checkNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'granted') {
            this.notificationsEnabled = true;
            document.getElementById('notifications-btn').classList.add('active');
        }
    }

    async toggleNotifications() {
        if (!('Notification' in window)) return this.showToast('Notifications are not supported in this browser.');
        if (Notification.permission === 'denied') return this.showToast('Notifications are blocked in your browser settings.');
        const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
        this.notificationsEnabled = permission === 'granted' && !this.notificationsEnabled ? true : !this.notificationsEnabled;
        document.getElementById('notifications-btn').classList.toggle('active', this.notificationsEnabled);
        this.showToast(this.notificationsEnabled ? 'Notifications enabled.' : 'Notifications disabled.');
    }

    startNotificationChecker() {
        if (this.notificationTimer) return;
        this.notificationTimer = window.setInterval(() => this.checkPlantsNeedingWater(), 3600000);
    }

    checkPlantsNeedingWater() {
        if (!this.notificationsEnabled) return;
        const needingWater = this.plants.filter((plant) => {
            const lastWatering = this.getLastWatering(plant.id);
            return lastWatering && this.getDaysUntil(this.getNextWateringDate(lastWatering.timestamp, plant.wateringFrequencyDays)) <= 0;
        });
        if (needingWater.length) new Notification('🌱 Time to water plants', { body: needingWater.map((plant) => plant.icon + ' ' + plant.name).join(', ') });
    }

    displayName() {
        return this.currentUser?.user_metadata?.display_name?.trim() || this.currentUser?.email?.split('@')[0] || 'Household member';
    }

    getPlantStatus(plant, lastWatering) {
        if (!lastWatering) return { class: 'never', text: 'Not watered yet' };
        const daysUntil = this.getDaysUntil(this.getNextWateringDate(lastWatering.timestamp, plant.wateringFrequencyDays));
        if (daysUntil < 0) return { class: 'overdue', text: '⚠️ Overdue' };
        if (daysUntil === 0) return { class: 'soon', text: '⏰ Water Today' };
        if (daysUntil === 1) return { class: 'soon', text: '📅 Water Tomorrow' };
        return { class: 'good', text: '✅ All Good' };
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
        return Math.floor((target - now) / 86400000);
    }

    getTimeAgo(timestamp) {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMs / 3600000);
        const days = Math.floor(diffMs / 86400000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return minutes + ' minute' + (minutes === 1 ? '' : 's') + ' ago';
        if (hours < 24) return hours + ' hour' + (hours === 1 ? '' : 's') + ' ago';
        if (days < 7) return days + ' day' + (days === 1 ? '' : 's') + ' ago';
        return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    escapeHtml(value) {
        const element = document.createElement('span');
        element.textContent = String(value ?? '');
        return element.innerHTML;
    }

    showToast(message) {
        document.querySelector('.toast')?.remove();
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        window.setTimeout(() => toast.remove(), 4000);
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PlantIrrigationApp();
    app.init();
});