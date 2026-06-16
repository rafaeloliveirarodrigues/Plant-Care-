# 🌱 V2 Features Guide - Scheduling & Reminders

## What's New in V2

V2 transforms your simple watering tracker into an intelligent plant care system with scheduling, status indicators, and full plant management.

---

## 🎯 New Features

### 1. **Watering Schedules** 📅
Each plant now has a customizable watering frequency (in days).

**How it works:**
- Set how often each plant needs water (e.g., every 2 days, 7 days, etc.)
- App automatically calculates next watering date
- Visual indicators show plant status at a glance

**Default Frequencies:**
- Basil: Every 2 days
- Mint: Every 2 days
- Tomato: Every 1 day (daily)
- Succulent: Every 7 days (weekly)
- Aloe Vera: Every 10 days

### 2. **Status Indicators** 🚦
Color-coded badges show each plant's watering status:

- **✅ All Good** (Green) - Plant is well-watered
- **📅 Water Tomorrow** (Yellow) - Watering due tomorrow
- **⏰ Water Today** (Yellow) - Watering due today
- **⚠️ Overdue** (Red) - Plant needs water urgently
- **Not watered yet** (Gray) - New plant, never watered

### 3. **Next Watering Info** 📊
Each plant card displays:
- When it was last watered and by whom
- Days until next watering needed
- Or how many days overdue if missed

### 4. **Plant Management** ⚙️
Full CRUD operations for your plants:

**Add Plants:**
1. Click the ⚙️ (settings) button in header
2. Click "+ Add New Plant"
3. Fill in:
   - Plant name
   - Location in kitchen
   - Emoji icon
   - Watering frequency (days)
4. Click "Save Plant"

**Edit Plants:**
1. Open plant management (⚙️ button)
2. Click "Edit" on any plant
3. Modify details
4. Save changes

**Delete Plants:**
1. Open plant management
2. Click "Delete" on any plant
3. Confirm deletion
4. Plant and its history are removed

### 5. **Browser Notifications** 🔔
Get reminded when plants need water!

**Setup:**
1. Click the 🔔 (bell) button in header
2. Allow notifications when prompted
3. You'll receive a test notification
4. App checks hourly for plants needing water

**Notification Types:**
- Plants due today
- Overdue plants
- Multiple plants needing water

**Note:** Notifications work even when browser is closed (if supported by your browser).

### 6. **Enhanced UI/UX** 🎨
- Cleaner, more modern design
- Better mobile responsiveness
- Smooth animations and transitions
- Modal dialogs for plant management
- Improved visual hierarchy

---

## 📱 How to Use V2

### Daily Workflow

1. **Open the app** - Check plant status at a glance
2. **Look for yellow/red badges** - These plants need attention
3. **Select your name** - From the dropdown
4. **Water plants** - Click "💧 Water Plant" button
5. **Done!** - Status updates automatically

### Weekly Maintenance

1. **Review all plants** - Check if schedules are working
2. **Adjust frequencies** - Edit plants if needed
3. **Add new plants** - As your collection grows
4. **Check history** - See watering patterns

### First-Time Setup

1. **Enable notifications** - Click 🔔 button
2. **Customize plant list** - Add/edit/remove plants
3. **Set correct frequencies** - Based on your plants' needs
4. **Update flatmate names** - Edit HTML file (lines 20-24)

---

## 🔧 Customization

### Change Watering Frequencies

**Via UI (Recommended):**
1. Click ⚙️ button
2. Click "Edit" on plant
3. Change "Watering Frequency" value
4. Save

**Via Code:**
Edit `app.js` lines 575-579 for default plants.

### Add More Flatmates

Edit `index.html` lines 20-24:
```html
<option value="Your Name">Your Name</option>
<option value="Flatmate 1">Flatmate 1</option>
<option value="Flatmate 2">Flatmate 2</option>
<option value="Flatmate 3">Flatmate 3</option>
```

### Choose Plant Icons

Popular plant emojis:
- Herbs: 🌿 🍃 🌱
- Vegetables: 🍅 🥬 🥒 🌶️ 🫑
- Succulents: 🌵 🪴
- Flowers: 🌷 🌹 🌺 🌸 🌼 🌻
- Trees: 🌴 🌳 🌲
- Special: 🎋 🎍 🍀 ☘️

---

## 💾 Data Storage

### What's Stored

**Plants Data:**
- Plant ID, name, location, icon
- Watering frequency (days)

**Watering Logs:**
- Timestamp, user, plant ID

**Storage Location:**
- Browser's localStorage
- Separate keys for plants and logs
- Survives page refreshes
- Not synced between devices (yet - coming in V3!)

### Data Migration from V1

V2 automatically:
- Keeps all your V1 watering history
- Adds default watering frequencies to existing plants
- Preserves all timestamps and user data

### Backup Your Data

**Export (Manual):**
1. Open browser console (F12)
2. Type: `localStorage.getItem('plantIrrigationPlants')`
3. Copy the output
4. Save to a text file

**Import (Manual):**
1. Open browser console
2. Type: `localStorage.setItem('plantIrrigationPlants', 'YOUR_BACKUP_DATA')`
3. Refresh page

---

## 🔔 Notification Details

### Browser Support
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & iOS 16.4+)
- ⚠️ May require HTTPS for some browsers

### Notification Timing
- Checks every hour for plants needing water
- Initial check 5 seconds after page load
- Only sends if notifications are enabled
- Groups multiple plants in one notification

### Troubleshooting Notifications

**Not receiving notifications?**
1. Check if bell icon is highlighted (active)
2. Verify browser notification permissions
3. Check system notification settings
4. Try disabling and re-enabling
5. Ensure browser is allowed to run in background

**Too many notifications?**
- Adjust watering frequencies
- Water plants on time
- Disable notifications temporarily (click 🔔)

---

## 🎯 Tips & Best Practices

### Watering Schedules

**Start Conservative:**
- Begin with longer intervals
- Observe your plants
- Adjust based on actual needs

**Consider Factors:**
- Season (summer vs winter)
- Room temperature
- Humidity levels
- Plant size and pot size

**Common Frequencies:**
- Herbs (Basil, Mint): 1-2 days
- Tomatoes: 1 day (daily)
- Succulents: 7-14 days
- Aloe Vera: 10-14 days
- Most houseplants: 3-7 days

### Team Coordination

**Morning Check:**
- One person checks app each morning
- Waters any yellow/red status plants
- Marks completion

**Shared Responsibility:**
- Rotate who checks daily
- Use history to see who's watering most
- Communicate about plant health

**Vacation Planning:**
- Check all plants before leaving
- Adjust schedules if needed
- Ask someone to check app while away

---

## 🐛 Known Limitations

1. **No Cloud Sync** - Each device has separate data (V3 feature)
2. **No Photo Upload** - Coming in V3
3. **Single Care Type** - Only tracks watering (V3 adds fertilizing, etc.)
4. **No Weather Integration** - Manual schedule adjustments needed
5. **Basic Statistics** - Advanced analytics coming in V3

---

## 🚀 Coming in V3

- 📸 Plant photos
- 📝 Care instructions and notes
- 🌤️ Weather-based watering adjustments
- ☁️ Cloud sync across devices
- 📊 Advanced analytics and insights
- 🌱 Multiple care types (fertilizing, pruning, etc.)
- 👥 User accounts and sharing
- 📱 Progressive Web App (install on home screen)

---

## 📞 Support

### Common Issues

**Plants not showing?**
- Check browser console for errors
- Clear localStorage and refresh
- Try different browser

**Schedules not calculating?**
- Ensure watering frequency is set
- Check that plant was watered at least once
- Verify browser date/time is correct

**Modals not opening?**
- Check for JavaScript errors
- Ensure all files are in same directory
- Try hard refresh (Ctrl+Shift+R)

### Getting Help

1. Check browser console (F12) for errors
2. Verify all files are present and unmodified
3. Try in incognito/private mode
4. Test in different browser

---

## 📊 Version Comparison

| Feature | V1 | V2 | V3 (Planned) |
|---------|----|----|--------------|
| Basic watering log | ✅ | ✅ | ✅ |
| Watering schedules | ❌ | ✅ | ✅ |
| Status indicators | ❌ | ✅ | ✅ |
| Notifications | ❌ | ✅ | ✅ |
| Plant management | ❌ | ✅ | ✅ |
| Photos | ❌ | ❌ | ✅ |
| Cloud sync | ❌ | ❌ | ✅ |
| Care instructions | ❌ | ❌ | ✅ |
| Analytics | ❌ | ❌ | ✅ |

---

## 🎉 Enjoy V2!

Your plant care routine just got smarter. No more forgotten waterings, no more guessing when plants need attention. Let the app do the thinking while you enjoy your thriving kitchen garden! 🌱✨