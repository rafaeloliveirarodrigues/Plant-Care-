# 🚀 Quick Start Guide

## Getting Started in 3 Steps

### Step 1: Open the App
The app is now open in your browser! If not, double-click `index.html`

### Step 2: Select Your Name
Click the dropdown at the top and choose your name (or add your actual names by editing the HTML file)

### Step 3: Water a Plant
Click the "💧 Water Plant" button on any plant card. Done! ✅

---

## What You Can Do

### ✅ Track Watering
- Each plant shows when it was last watered and by whom
- Click "Water Plant" to log a new watering event
- Automatic timestamps are added

### ✅ View History
- Scroll down to see the last 10 watering events
- Shows who watered which plant and when
- Displays relative time (e.g., "2 hours ago")

### ✅ Clear History
- Use the "Clear All History" button at the bottom
- Useful for starting fresh or testing

---

## Customizing for Your Kitchen

### Add Your Names
1. Open `index.html` in a text editor
2. Find lines 20-24
3. Replace "Flatmate 1", "Flatmate 2", etc. with actual names:
   ```html
   <option value="Rafael">Rafael</option>
   <option value="Maria">Maria</option>
   <option value="John">John</option>
   ```
4. Save and refresh the browser

### Add/Change Plants
1. Open `app.js` in a text editor
2. Find lines 7-13
3. Modify the plants array:
   ```javascript
   this.plants = [
       { id: '1', name: 'Basil', location: 'Window Sill', icon: '🌿' },
       { id: '2', name: 'Your Plant', location: 'Counter', icon: '🌱' },
       // Add more...
   ];
   ```
4. Save and refresh the browser

### Choose Plant Emojis
Copy and paste any of these: 🌱 🌿 🍃 🌵 🪴 🌴 🥬 🥒 🌶️ 🍅 🌷 🌹 🌺 🌸 🌼 🌻

---

## Sharing with Flatmates

### Same Device
Just bookmark the page or keep it open on a shared tablet in the kitchen!

### Different Devices (Same WiFi)
If you have Python installed:
```bash
cd plant-irrigation-app
python3 -m http.server 8000
```
Then share: `http://YOUR_IP:8000` (find your IP in System Preferences → Network)

### Online Hosting (Free)
Upload to GitHub Pages, Netlify, or Vercel for free cloud hosting!

---

## Tips

💡 **Keep it simple**: V1 is intentionally basic. Use it for a week to see what features you really need.

💡 **Data is local**: Each device stores its own data. For shared data, consider hosting online (V2 feature).

💡 **Mobile friendly**: Works great on phones! Add to home screen for app-like experience.

💡 **No internet needed**: Works completely offline once loaded.

---

## Need Help?

Check the full `README.md` for detailed documentation, troubleshooting, and roadmap.

---

## What's Next?

Once you've used V1 for a while, we can add:
- **V2**: Watering schedules, reminders, notifications
- **V3**: Photos, care instructions, cloud sync

Enjoy your plant care journey! 🌱✨