# 🌱 Kitchen Plant Irrigation App - V2

An intelligent plant care system with watering schedules, reminders, and full plant management for you and your flatmates.

## Features (V2 - Scheduling & Reminders)

### Core Features
✅ **Watering Schedules** - Set custom watering frequency for each plant
✅ **Status Indicators** - Color-coded badges (All Good, Water Today, Overdue)
✅ **Smart Reminders** - Browser notifications when plants need water
✅ **Plant Management** - Add, edit, and delete plants with custom settings
✅ **Next Watering Info** - See exactly when each plant needs water next
✅ **One-Click Watering** - Easy button to log watering events
✅ **Watering History** - View last 10 watering events with timestamps
✅ **User Tracking** - See who watered which plant and when
✅ **Persistent Storage** - All data saved in browser's LocalStorage
✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
✅ **No Installation Required** - Pure HTML/CSS/JavaScript, no build tools

## Quick Start

### 1. Open the App
Simply open `index.html` in any modern web browser:
- Double-click the file, or
- Right-click → Open With → Your browser, or
- Drag and drop into browser window

### 2. Enable Notifications (Recommended)
Click the 🔔 bell icon in the header and allow notifications to get reminders.

### 3. Manage Your Plants
Click the ⚙️ settings icon to add, edit, or remove plants. Set watering frequencies for each.

### 4. Select Your Name
Choose your name from the dropdown at the top of the page.

### 5. Water Plants
Click the "💧 Water Plant" button on any plant card. Status updates automatically!

### 6. Monitor Status
Check color-coded badges:
- **Green (✅ All Good)** - Plant is well-watered
- **Yellow (⏰ Water Today)** - Needs water today
- **Red (⚠️ Overdue)** - Urgent, needs water now!

📖 **For detailed V2 features, see [V2_FEATURES.md](V2_FEATURES.md)**

## Default Plants & Schedules

The app comes pre-configured with these plants and watering frequencies:
- 🌿 **Basil** (Window Sill) - Every 2 days
- 🍃 **Mint** (Counter) - Every 2 days
- 🍅 **Tomato** (Window Sill) - Daily
- 🌵 **Succulent** (Shelf) - Every 7 days
- 🪴 **Aloe Vera** (Counter) - Every 10 days

**You can customize all of these!** Click the ⚙️ button to edit or add your own plants.

## Customization

### Change Flatmate Names
Edit `index.html` lines 20-24 to update the names:
```html
<option value="Your Name">Your Name</option>
<option value="Flatmate 1">Flatmate 1</option>
<option value="Flatmate 2">Flatmate 2</option>
```

### Manage Plants (V2 Feature!)
**No code editing needed!** Use the built-in plant management:
1. Click ⚙️ button in header
2. Add, edit, or delete plants
3. Set custom watering frequencies
4. Choose emoji icons

Available plant emojis: 🌱 🌿 🍃 🌾 🌵 🪴 🌴 🌳 🌲 🎋 🎍 🍀 ☘️ 🌷 🌹 🥀 🌺 🌸 🌼 🌻 🍅 🥬 🥒 🌶️ 🫑 
🍈
🍉
🍊
🍋
🍋‍🟩
🍌
🍍
🥭
🍎
🍏
🍐
🍑
🍒
🍓
🫐
🥝
🍅
🫒
🥥

🍆
🥔
🥕
🌽
🌶️
🫑
🥒
🥬
🥦
🧄
🧅
🥜
🫘
🌰
🫚
🫛
🍄‍🟫
🫜
### Advanced: Edit Default Plants
If you want to change the initial plants (for new users), edit `app.js` lines 575-579.

## Technical Details

### Data Structure

**Plant Object:**
```javascript
{
    id: string,
    name: string,
    location: string,
    icon: string (emoji)
}
```

**Watering Log Object:**
```javascript
{
    id: string,
    plantId: string,
    wateredBy: string,
    timestamp: ISO 8601 date string
}
```

### Storage
- Uses browser's `localStorage` for data persistence
- Data survives page refreshes
- Stored locally on each device (not synced between devices)
- Maximum storage: ~5-10MB (more than enough for this app)

### Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Sharing with Flatmates

### Option 1: Local Network (Same WiFi)
1. Install a simple HTTP server (if you have Python):
   ```bash
   cd plant-irrigation-app
   python3 -m http.server 8000
   ```
2. Share your local IP address with flatmates (e.g., `http://192.168.1.100:8000`)

### Option 2: Cloud Hosting (Free)
Upload to any of these free hosting services:
- **GitHub Pages** (recommended)
- **Netlify**
- **Vercel**
- **Cloudflare Pages**

### Option 3: Shared Device
Keep the app on a shared tablet/computer in the kitchen.

## Roadmap

### ✅ V2 - Scheduling & Reminders (COMPLETED!)
- ✅ Watering schedules (every X days)
- ✅ Browser notifications
- ✅ Visual status indicators (needs water, overdue)
- ✅ Add/edit/delete plants
- ✅ Next watering date calculations
- ✅ Enhanced UI with modals

### V3 - Full Features (Coming Next)
- 📸 Plant photos
- 📝 Care instructions and notes
- 🌱 Multiple care types (fertilizing, pruning, repotting)
- 📊 Health tracking and analytics
- ☁️ Cloud sync across devices
- 🌤️ Weather integration
- 👥 User accounts and team features

## Troubleshooting

**Data not saving?**
- Check if browser allows localStorage
- Try a different browser
- Clear browser cache and reload

**App not loading?**
- Ensure all three files are in the same folder
- Check browser console for errors (F12)
- Try opening in incognito/private mode

**Buttons disabled?**
- Make sure you've selected your name from the dropdown

## License

Free to use and modify for personal use.

## Version History

**Current Version:** V2 - Scheduling & Reminders
**Last Updated:** June 2026

### Changelog

**V2 (Current):**
- ✅ Watering schedules with custom frequencies
- ✅ Status indicators (All Good, Water Today, Overdue)
- ✅ Browser notifications for reminders
- ✅ Full plant management (Add/Edit/Delete)
- ✅ Next watering date calculations
- ✅ Enhanced UI with modals and animations

**V1:**
- ✅ Basic watering log
- ✅ User tracking
- ✅ Watering history
- ✅ Simple plant list

**Author:** Built with ❤️ for plant lovers

---

📖 **For detailed V2 features and usage guide, see [V2_FEATURES.md](V2_FEATURES.md)**