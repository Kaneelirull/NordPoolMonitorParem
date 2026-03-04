# NordPool Monitor

> Professional electricity price monitoring for Estonia, Finland, Latvia, and Lithuania

A clean, sophisticated web application for tracking real-time Nord Pool electricity prices across Baltic countries. Features intelligent cost calculations, price forecasting, and a beautiful, professional interface.

![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- 🌍 **Multi-Country Support** - Estonia, Finland, Latvia, Lithuania
- 📊 **Real-Time Pricing** - 15-minute segment accuracy  
- 📈 **48-Hour Chart** - 24h historical + 24h forecast
- 🎨 **Professional Design** - Soft neutral banking aesthetic
- 💡 **Smart Recommendations** - Optimal appliance timing
- 🧮 **Cost Calculator** - Real-time usage cost estimates
- 💾 **Country Persistence** - Remembers your selection
- 🔄 **Auto-Refresh** - Updates every 15 minutes
- 📱 **Fully Responsive** - Works on all devices

## 🚀 Quick Start

### ⚡ **IMPORTANT: You MUST use a local server!**

The Elering API blocks direct browser access due to CORS. **Opening `index.html` directly will NOT work.**

### Option 1: Double-Click Launcher (Recommended!)

**Windows:**
1. Extract the archive
2. Double-click `start.bat`
3. Browser opens automatically! ✨

**Mac/Linux:**
1. Extract the archive
2. Run `./start.sh` in terminal
3. Browser opens automatically! ✨

**Requirements:** Node.js must be installed ([Download here](https://nodejs.org))

### Option 2: Manual Server Start

```bash
npm install
npm start
# Visit http://localhost:8765
```

### Option 3: Standalone Executable (Advanced)

Want a single `.exe` file? See **[BUILD.md](BUILD.md)** for instructions on creating standalone executables.

```bash
npm install
npm run build:win  # Creates nordpool-monitor-win.exe
```

The executable runs without Node.js installed!

### Option 3: Direct Browser

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nordpool-monitor.git
cd nordpool-monitor
```

2. Open `index.html` in your browser

**Note:** The app uses a CORS proxy (corsproxy.io) to access the Elering API from browsers. This works immediately without any server setup.

### Option 2: Local Server (Recommended for Development)

1. Clone and install:
```bash
git clone https://github.com/yourusername/nordpool-monitor.git
cd nordpool-monitor
npm install
```

2. Start the server:
```bash
npm start
```

3. Open http://localhost:8080

### Option 3: Development Mode

```bash
npm run dev
```

Auto-opens in your default browser with live reload.

## 🌐 Supported Countries

| Country | Code | Currency | Data Source |
|---------|------|----------|-------------|
| 🇪🇪 Estonia | `ee` | senti (s) | Elering API |
| 🇫🇮 Finland | `fi` | cents (c) | Elering API |
| 🇱🇻 Latvia | `lv` | senti (s) | Elering API |
| 🇱🇹 Lithuania | `lt` | senti (s) | Elering API |

## 📖 Usage

### Switching Countries

Click any country button in the header. Your selection is automatically saved and will persist across browser sessions.

### Understanding the Data

**Current Price Card**
- Shows the price for the current 15-minute segment
- Color-coded: Green (cheap), Yellow (moderate), Red (expensive)
- Displays trend for next segment

**Statistics**
- Today's Min/Avg/Max prices
- Helps you understand daily price range

**48-Hour Chart**
- Black bar = current segment
- Past hours shown in subdued colors
- Future hours emphasized
- Auto-scrolls to keep current segment centered

**Smart Recommendations**
- Cheapest hour today
- Best 2-hour window for appliances
- Tomorrow's price forecast (% change)

**Cost Calculator**
- Real-time cost estimates for common appliances
- Uses actual pricing from current + future segments
- Helps you decide when to run energy-intensive tasks

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Charts**: Chart.js 4.4.0
- **HTTP**: Axios 1.6.0
- **Styling**: Pure CSS (no frameworks)
- **Data**: Elering API (free, no key required)
- **CORS**: corsproxy.io for browser compatibility

## 🔍 Troubleshooting

### "Failed to load electricity prices" Error

**Root cause:** Opening `index.html` directly in browser causes CORS errors.

**Solution:** You MUST use the local server!

1. **Windows:** Double-click `start.bat`
2. **Mac/Linux:** Run `./start.sh`
3. **Manual:** Run `npm start` or `node server.js`

### "Node.js not found" Error

Install Node.js from https://nodejs.org (LTS version recommended)

### Server starts but browser shows "404 Not Found"

Make sure you're accessing `http://localhost:8765` (not `file://...`)

### CORS Issues

**You cannot open index.html directly!** The Elering API requires requests to come from a server, not from `file://` protocol.

Always use:
- `start.bat` (Windows)
- `./start.sh` (Mac/Linux)  
- `npm start`
- Or build the executable

### Port 8765 Already in Use

Another application is using port 8765. Either:
- Close the other application
- Edit `server.js` and change `const PORT = 8765;` to another number

## 📁 Project Structure

```
nordpool-monitor/
├── index.html          # Main HTML file
├── api.js              # API handler with multi-country support
├── renderer.js         # UI logic and chart rendering
├── server.js           # Built-in HTTP server
├── start.bat           # Windows launcher script
├── start.sh            # Mac/Linux launcher script
├── package.json        # npm + build configuration
├── README.md           # This file
├── BUILD.md            # Executable build guide
├── LICENSE             # MIT License
└── .gitignore          # Git ignore rules
```

## 🎮 Usage Modes

### Script Mode (Requires Node.js)
```bash
node server.js    # or npm start
./start.sh        # Mac/Linux
start.bat         # Windows
```
**Pros:** Fast, easy to modify | **Cons:** Requires Node.js

### Executable Mode (Standalone)
```bash
npm run build:win              # Build Windows .exe
./dist/nordpool-monitor-win.exe  # Run (no Node.js needed!)
```
**Pros:** No dependencies | **Cons:** ~50 MB file

See **[BUILD.md](BUILD.md)** for complete instructions.

## 🔧 Configuration

### Auto-Refresh Timing

Edit `renderer.js`:

```javascript
// Refresh at :01, :16, :31, :46 of each hour
const refreshMinutes = [1, 16, 31, 46];
```

### Appliance Power Ratings

Edit `renderer.js`:

```javascript
const DISHWASHER_KW = 1.5;
const BOILER_KW = 2.0;
const WASHER_KW = 0.5;
const HEATPUMP_25_KW = 2.5;
// ...modify as needed
```

### Cache Duration

Edit `api.js`:

```javascript
cacheTimeout: 3600000, // 1 hour (in milliseconds)
```

## 🎨 Design Philosophy

The interface uses a **soft neutral banking aesthetic**:

- Warm neutral backgrounds (#fafaf9)
- Elegant typography (Inter font family)
- Generous whitespace
- Subtle shadows and borders  
- Professional color palette
- Light, airy feel with excellent readability

Designed for professional use and extended viewing sessions.

## 📊 Data Source

This app uses the **Elering API** (Estonian TSO):
- Free and publicly accessible
- No API key required
- 15-minute price resolution
- Covers EE, FI, LV, LT markets
- Historical + forecast data

API Endpoint: `https://dashboard.elering.ee/api/nps/price`

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Nord Pool for the electricity market
- Elering for providing free API access
- Chart.js for beautiful charts
- The open-source community

## 📮 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/nordpool-monitor/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/nordpool-monitor/discussions)
- 📧 **Contact**: your.email@example.com

## 🗺️ Roadmap

- [ ] Additional countries (SE, NO, DK)
- [ ] Export data to CSV
- [ ] Custom appliance profiles
- [ ] Price alerts/notifications
- [ ] Dark mode toggle
- [ ] Historical price analysis
- [ ] API rate limiting handling

## 📸 Screenshots

![Main Interface](screenshots/main.png)
*Clean, professional interface with real-time pricing*

![Multi-Country](screenshots/countries.png)
*Easy country switching with persistent selection*

---

**Made with ❤️ for smarter energy consumption**

Version 4.0.0 | Last Updated: 2025
