// Shared weather guidance powered by Open-Meteo.
document.addEventListener('DOMContentLoaded', () => {
    Object.assign(PlantIrrigationApp.prototype, {
        initializeWeatherFeature() {
            this.weatherSearchResults = [];
            this.weatherError = '';
            this.weatherRefreshInProgress = false;
        },

        setupWeatherEventListeners() {
            document.getElementById('weather-settings-btn').addEventListener('click', () => this.openWeatherSettings());
            document.getElementById('close-weather-modal').addEventListener('click', () => this.closeModal('weather-modal'));
            document.getElementById('weather-search-form').addEventListener('submit', (event) => this.searchWeatherLocations(event));
            document.getElementById('weather-results').addEventListener('click', (event) => {
                const index = event.target.dataset.locationIndex;
                if (index !== undefined) this.selectWeatherLocation(Number(index));
            });
        },

        isHouseholdCreator() {
            return Boolean(this.household && this.currentUser && this.household.created_by === this.currentUser.id);
        },

        setWeatherSettingsAccess() {
            const button = document.getElementById('weather-settings-btn');
            const canManage = this.isHouseholdCreator();
            button.hidden = !canManage;
            button.disabled = !canManage;
        },

        async loadWeatherSettings() {
            this.weatherError = '';
            this.setWeatherSettingsAccess();
            this.renderWeatherSummary();
            if (!this.household?.weather_location_label) return;
            const lastUpdated = this.household.weather_updated_at ? new Date(this.household.weather_updated_at).getTime() : 0;
            const stale = !lastUpdated || Date.now() - lastUpdated > 60 * 60 * 1000;
            if (stale && this.isHouseholdCreator()) await this.refreshWeather();
        },

        async refreshWeather(force = false) {
            if (!this.household?.weather_latitude || !this.isHouseholdCreator() || this.weatherRefreshInProgress) return;
            const lastUpdated = this.household.weather_updated_at ? new Date(this.household.weather_updated_at).getTime() : 0;
            if (!force && lastUpdated && Date.now() - lastUpdated < 60 * 60 * 1000) return;

            this.weatherRefreshInProgress = true;
            this.weatherError = '';
            try {
                const params = new URLSearchParams({
                    latitude: String(this.household.weather_latitude),
                    longitude: String(this.household.weather_longitude),
                    daily: 'weather_code,temperature_2m_max,precipitation_sum,et0_fao_evapotranspiration',
                    current: 'temperature_2m,weather_code',
                    forecast_days: '3',
                    timezone: 'auto'
                });
                const response = await fetch('https://api.open-meteo.com/v1/forecast?' + params);
                if (!response.ok) throw new Error('Weather service unavailable.');
                const weather = await response.json();
                const summary = {
                    current: weather.current || null,
                    daily: weather.daily || null,
                    fetched_at: new Date().toISOString()
                };
                const update = {
                    weather_summary: summary,
                    weather_updated_at: summary.fetched_at,
                    weather_timezone: weather.timezone || this.household.weather_timezone
                };
                const { data, error } = await this.supabase.from('households')
                    .update(update).eq('id', this.household.id)
                    .select('id, name, invite_code, created_by, weather_location_label, weather_latitude, weather_longitude, weather_timezone, weather_summary, weather_updated_at')
                    .single();
                if (error) throw error;
                this.household = data;
            } catch (error) {
                this.weatherError = error.message || 'Weather is unavailable.';
            } finally {
                this.weatherRefreshInProgress = false;
                this.renderWeatherSummary();
                this.renderPlants();
            }
        },

        renderWeatherSummary() {
            const section = document.getElementById('weather-section');
            const title = document.getElementById('weather-title');
            const detail = document.getElementById('weather-detail');
            if (!this.household?.weather_location_label) {
                section.hidden = true;
                return;
            }
            section.hidden = false;
            title.textContent = 'Weather · ' + this.household.weather_location_label;
            const current = this.household.weather_summary?.current;
            if (this.weatherError) {
                detail.textContent = 'Weather unavailable — base schedules are unchanged.';
            } else if (current?.temperature_2m !== undefined) {
                detail.textContent = this.weatherIcon(current.weather_code) + ' ' + Math.round(current.temperature_2m) + '°C · guidance updated from the local forecast';
            } else {
                detail.textContent = 'Weather forecast will update shortly.';
            }
        },

        openWeatherSettings() {
            if (!this.isHouseholdCreator()) return;
            document.getElementById('weather-search-input').value = this.household?.weather_location_label || '';
            document.getElementById('weather-results').innerHTML = '';
            document.getElementById('weather-modal').classList.add('show');
        },

        async searchWeatherLocations(event) {
            event.preventDefault();
            const query = document.getElementById('weather-search-input').value.trim();
            const results = document.getElementById('weather-results');
            if (query.length < 2) {
                results.innerHTML = '<p class="muted">Enter at least two characters.</p>';
                return;
            }
            results.innerHTML = '<p class="muted">Searching…</p>';
            try {
                const response = await fetch('https://geocoding-api.open-meteo.com/v1/search?' + new URLSearchParams({
                    name: query, count: '5', language: 'en', format: 'json'
                }));
                if (!response.ok) throw new Error('Location search is unavailable.');
                const data = await response.json();
                this.weatherSearchResults = data.results || [];
                if (!this.weatherSearchResults.length) {
                    results.innerHTML = '<p class="muted">No matching location found.</p>';
                    return;
                }
                results.innerHTML = this.weatherSearchResults.map((location, index) => {
                    const parts = [location.name, location.admin1, location.country].filter(Boolean);
                    return '<button type="button" class="location-result" data-location-index="' + index + '">' +
                        this.escapeHtml(parts.join(', ')) + '</button>';
                }).join('');
            } catch (error) {
                results.innerHTML = '<p class="muted">Could not search locations. Try again later.</p>';
            }
        },

        async selectWeatherLocation(index) {
            const location = this.weatherSearchResults[index];
            if (!location || !this.isHouseholdCreator()) return;
            const label = [location.name, location.admin1, location.country].filter(Boolean).join(', ');
            const { data, error } = await this.supabase.from('households')
                .update({
                    weather_location_label: label,
                    weather_latitude: location.latitude,
                    weather_longitude: location.longitude,
                    weather_timezone: location.timezone || null,
                    weather_summary: null,
                    weather_updated_at: null
                }).eq('id', this.household.id)
                .select('id, name, invite_code, created_by, weather_location_label, weather_latitude, weather_longitude, weather_timezone, weather_summary, weather_updated_at')
                .single();
            if (error) return this.showToast(error.message);
            this.household = data;
            this.closeModal('weather-modal');
            this.showToast('Shared weather location saved.');
            await this.refreshWeather(true);
        },

        getWeatherRecommendation(plant, lastWatering) {
            if (!lastWatering || plant.growingEnvironment === 'indoor') return null;
            const daily = this.household?.weather_summary?.daily;
            if (!daily?.time?.length) return null;

            const baseDate = this.getNextWateringDate(lastWatering.timestamp, plant.wateringFrequencyDays);
            if (this.getDaysUntil(baseDate) <= 0) return null;

            const sensitivity = { herb: 3, fruiting_vegetable: 3, foliage: 2, succulent: 1, custom: 2 };
            const maxShift = sensitivity[plant.plantType] || 2;
            const rainTotal = (daily.precipitation_sum || []).slice(0, 3).reduce((total, value) => total + (Number(value) || 0), 0);
            const temperatures = (daily.temperature_2m_max || []).slice(0, 3).map(Number);
            const evapotranspiration = (daily.et0_fao_evapotranspiration || []).slice(0, 3).map(Number);
            const maxTemperature = Math.max(...temperatures);
            const averageEt0 = evapotranspiration.reduce((total, value) => total + value, 0) / Math.max(evapotranspiration.length, 1);
            const dryShift = maxTemperature >= 30 && averageEt0 >= 4
                ? maxShift
                : maxTemperature >= 26 && averageEt0 >= 3
                    ? Math.min(2, maxShift)
                    : 0;
            const rainShift = plant.growingEnvironment === 'outdoor'
                ? rainTotal >= 15
                    ? maxShift
                    : rainTotal >= 6
                        ? Math.min(2, maxShift)
                        : 0
                : 0;
            const adjustment = Math.max(-maxShift, Math.min(maxShift, rainShift - dryShift));
            if (!adjustment) return null;

            const suggestedDate = new Date(baseDate);
            suggestedDate.setDate(suggestedDate.getDate() + adjustment);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (suggestedDate < today) suggestedDate.setTime(today.getTime());

            return {
                date: suggestedDate,
                icon: adjustment > 0 ? '🌧️' : '☀️',
                reason: adjustment > 0
                    ? 'Rain forecast: water ' + adjustment + ' day' + (adjustment === 1 ? '' : 's') + ' later'
                    : 'Hot/dry forecast: water ' + Math.abs(adjustment) + ' day' + (Math.abs(adjustment) === 1 ? '' : 's') + ' earlier'
            };
        },

        getWeatherRecommendationMarkup(plant, lastWatering) {
            const recommendation = this.getWeatherRecommendation(plant, lastWatering);
            if (!recommendation) return '';
            const formattedDate = recommendation.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            return '<div class="weather-guidance"><span>' + recommendation.icon + '</span><span>' +
                this.escapeHtml(recommendation.reason) + ' · ' + this.escapeHtml(formattedDate) + '</span></div>';
        },

        weatherIcon(code) {
            if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(Number(code))) return '🌧️';
            if ([71, 73, 75, 77, 85, 86].includes(Number(code))) return '❄️';
            if ([1, 2, 3].includes(Number(code))) return '⛅';
            return '☀️';
        }
    });
});