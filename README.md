# 🌱 Kitchen Plant Care

A shared watering schedule for your household. Everyone signs in with their email, joins the same household, and sees the same plants, schedules and watering history — updated live across devices.

**Live app:** https://plant-care-ruddy.vercel.app/

📖 New here? Start with the [Quick Start Guide](QUICK_START.md), or see the full [Features Guide](FEATURES.md).

## Features

- **Shared households** – create a household and invite others with an 8-character invite code
- **Passwordless sign-in** – email magic links via Supabase Auth
- **Real-time sync** – when someone waters a plant or edits the list, everyone else's screen updates automatically
- **Watering schedules** – each plant has its own frequency (every 1–30 days)
- **Status badges** – ✅ All Good · 📅 Water Tomorrow · ⏰ Water Today · ⚠️ Overdue
- **Watering history** – the last 10 waterings, with who did it and when
- **Plant management** – add, edit and delete plants, with a name, location, emoji, growing environment and plant type
- **Weather-informed guidance** – for outdoor and greenhouse plants, the local forecast can suggest watering a few days earlier (hot/dry) or later (rain)
- **Browser notifications** – hourly reminders while the app is open
- **No build step** – plain HTML, CSS and JavaScript

## How to use

1. **Sign in** – enter your name and email, then open the link sent to your inbox.
2. **Create or join a household**
   - The first person creates a household. It starts with five default plants: Basil, Mint, Tomato, Succulent and Aloe Vera.
   - Everyone else joins with the invite code shown at the top of the app. Each person can belong to one household.
3. **Water plants** – tap **💧 Water Plant** on a card after watering it.
4. **Manage plants** – use ⚙️ to add, edit or delete plants.
5. **Notifications** – use 🔔 to turn on reminders.
6. **Weather (household creator only)** – use 🌦️ to search for your city or postal code. The forecast is shared with the whole household and refreshed at most once an hour.

### Plant emoji ideas

Copy and paste any of these into the **Icon** field:

- **Herbs and greenery:** 🌱 🌿 🍃 🌾 🌵 🪴 🌴 🌳 🌲 🎋 🎍 🍀 ☘️
- **Flowers:** 🌷 🌹 🥀 🌺 🌸 🌼 🌻
- **Fruit:** 🍈 🍉 🍊 🍋 🍋‍🟩 🍌 🍍 🥭 🍎 🍏 🍐 🍑 🍒 🍓 🫐 🥝 🍅 🫒 🥥
- **Vegetables:** 🍆 🥔 🥕 🌽 🌶️ 🫑 🥒 🥬 🥦 🧄 🧅 🥜 🫘 🌰 🫚 🫛 🍄‍🟫 🫜

### How weather guidance works

Guidance appears only on plants marked **Outdoor** or **Greenhouse**; indoor plants always follow their base schedule. It uses the next three days of the [Open-Meteo](https://open-meteo.com/) forecast:

| Condition | Effect |
|---|---|
| Max temperature ≥ 30 °C and evapotranspiration ≥ 4 mm/day | Water earlier |
| Max temperature ≥ 26 °C and evapotranspiration ≥ 3 mm/day | Water up to 2 days earlier |
| ≥ 15 mm rain (outdoor only) | Water later |
| ≥ 6 mm rain (outdoor only) | Water up to 2 days later |

How far the date can move depends on the plant type: herbs and fruiting vegetables up to 3 days, foliage and custom up to 2 days, and succulents 1 day.

## Tech stack

- **Frontend:** vanilla HTML/CSS/JS (`index.html`, `styles.css`, `app.js`, `weather.js`)
- **Backend:** [Supabase](https://supabase.com/) for Postgres, Auth (magic links), Row Level Security and Realtime
- **Weather:** Open-Meteo forecast and geocoding APIs (free, no API key)
- **Hosting:** [Vercel](https://vercel.com/) as a static site

## Project structure

```
index.html                     App markup, modals and script includes
styles.css                     Styling
app.js                         Auth, households, plants, watering logs, realtime, notifications
weather.js                     Location search, forecast refresh, watering recommendations
supabase-config.js             Supabase project URL and publishable key
supabase/schema.sql            Tables, RLS policies, household functions, realtime setup
supabase/weather-migration.sql Weather columns, plant environment/type, creator update policy
```

## Running your own copy

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com/).
2. In the **SQL Editor**, run these in order:
   1. `supabase/schema.sql`
   2. `supabase/weather-migration.sql`
3. Under **Authentication → Providers**, make sure **Email** is enabled.
4. Under **Authentication → URL Configuration**, set the **Site URL** to your deployed URL (for example `https://your-app.vercel.app`) and add it to **Redirect URLs**. For local testing, also add `http://localhost:8000`.

### 2. Configure the app

Edit `supabase-config.js` with the values from **Project Settings → API**:

```js
window.PLANT_CARE_SUPABASE_CONFIG = {
  url: 'https://YOUR-PROJECT.supabase.co',
  publishableKey: 'sb_publishable_...'
};
```

The publishable key is designed to be public. Access to data is enforced by the Row Level Security policies in `schema.sql`. **Never** put the `service_role` or secret key in this file.

### 3. Run locally

Serve the folder over HTTP, since magic links need a real URL rather than `file://`:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

### 4. Deploy to Vercel

Import the GitHub repository in Vercel. It's a static site, so no build command or output directory is needed. Every push to `main` redeploys automatically.

## Data model

| Table | Purpose |
|---|---|
| `households` | Name, invite code, creator, shared weather location and cached forecast |
| `household_members` | Links users to their household |
| `plants` | Name, location, icon, watering frequency, growing environment, plant type |
| `watering_logs` | Which plant was watered, by whom, and when |

Row Level Security ensures users can only read and change data from their own household. Households are created and joined only through the `create_household` and `join_household` database functions.

## Troubleshooting

**The sign-in link opens the wrong page or shows an error**
Check that your deployed URL is set as the Site URL and listed in **Redirect URLs** in Supabase.

**"App configuration is missing"**
`supabase-config.js` is missing values, or the Supabase library didn't load from the CDN.

**The 🌦️ button isn't visible**
Only the person who created the household can set the weather location.

**No weather guidance on a plant**
Guidance appears only for outdoor and greenhouse plants that have been watered at least once, when the forecast actually suggests a change.

**Notifications don't arrive**
Reminders are sent only while the app is open in a browser tab, and only if notifications are allowed for the site.

## Version history

- **V3 – Shared households (current)** – Supabase backend, magic-link sign-in, households with invite codes, real-time sync, weather-informed guidance
- **V2 – Scheduling and reminders** – watering frequencies, status badges, notifications, plant management (browser localStorage only)
- **V1 – Basic log** – simple watering log with user tracking

## License

Free to use and modify for personal use.

**Author:** Built with ❤️ for plant lovers
