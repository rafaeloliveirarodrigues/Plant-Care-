# 🌱 Features Guide

A detailed look at everything Kitchen Plant Care can do. For a five-minute intro, see [QUICK_START.md](QUICK_START.md).

---

## 👥 Shared households

Everyone in your flat shares one household with the same plants, schedules and history.

- **Creating:** the first person creates the household and gets an 8-character **invite code**. New households start with five plants:

  | Plant | Location | Waters every |
  |---|---|---|
  | 🌿 Basil | Window Sill | 2 days |
  | 🍃 Mint | Counter | 2 days |
  | 🍅 Tomato | Window Sill | 1 day |
  | 🌵 Succulent | Shelf | 7 days |
  | 🪴 Aloe Vera | Counter | 10 days |

- **Joining:** others enter the invite code to join. Each person belongs to one household.
- **Privacy:** you can only see and change data from your own household. This is enforced in the database, not just in the app.

## 🔐 Sign-in

Sign-in uses email magic links, so there are no passwords. The name you enter the first time you sign in is shown in the watering history.

## ⚡ Real-time sync

When anyone waters a plant, edits a plant or changes the weather location, every open copy of the app updates automatically. There's no need to refresh.

## 📅 Watering schedules

Each plant has a watering frequency from 1 to 30 days. The app works out the next watering date from the last time the plant was watered.

Each plant card shows:
- When it was last watered, and by whom
- Days until the next watering, or how many days it's overdue
- A status badge:
  - **✅ All Good:** nothing to do
  - **📅 Water Tomorrow:** due tomorrow
  - **⏰ Water Today:** due today
  - **⚠️ Overdue:** past its watering date
  - **Not watered yet:** no watering logged

## ⚙️ Plant management

Open plant management with the ⚙️ button in the header. Any household member can:

- **Add** a plant with **+ Add New Plant**
- **Edit** a plant's details
- **Delete** a plant, which also removes its watering history

Each plant has:

| Field | Options |
|---|---|
| Name | Up to 80 characters |
| Location | Up to 80 characters, e.g. "Window sill" |
| Icon | Any emoji |
| Watering frequency | 1–30 days |
| Growing environment | Indoor, Outdoor, Greenhouse |
| Plant type | Herb, Fruiting vegetable, Foliage, Succulent, Custom |

The growing environment and plant type are used by the weather guidance.

## 🌦️ Weather-informed guidance

The household creator can set a shared location with the 🌦️ button, by searching for a city or postal code. The app then fetches a 3-day forecast from [Open-Meteo](https://open-meteo.com/), at most once an hour, and shares it with everyone.

For **outdoor** and **greenhouse** plants, a suggestion appears on the card when the forecast calls for a change:

- **☀️ Hot/dry forecast: water earlier.** Triggered at a max temperature of 26 °C or more with high evaporation.
- **🌧️ Rain forecast: water later.** Triggered at 6 mm of rain or more over 3 days. This applies only to outdoor plants, since greenhouses don't get rain.

How far the date can move depends on the plant type:

| Plant type | Max shift |
|---|---|
| Herb, Fruiting vegetable | 3 days |
| Foliage, Custom | 2 days |
| Succulent | 1 day |

Indoor plants always follow their base schedule. The suggestion is advice only: the badge and the schedule don't change.

## 🔔 Notifications

Click 🔔 and allow notifications in your browser. While the app is open in a tab, it checks every hour and notifies you about plants that are due or overdue.

## 📜 Watering history

The history section shows the 10 most recent waterings, with the plant, who watered it, and when. **Clear All History** at the bottom removes the whole household's history for everyone, so use it with care.

---

## ❓ FAQ

**Can I be in two households?**
No, each account belongs to one household.

**Someone left the flat. How do I remove them?**
This isn't possible in the app yet. It can be done from the Supabase dashboard by deleting their row in `household_members`.

**Who can change the weather location?**
Only the person who created the household.

**Does it work offline?**
No. The app needs an internet connection to sync with the shared household.

---

**Author:** Built with ❤️ for plant lovers
