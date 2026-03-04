# Building NordPool Monitor Executable

This guide explains how to create standalone executables that can run without Node.js installed.

## Quick Start (No Build Required)

### Windows
1. Double-click `start.bat`
2. Browser opens automatically!

### Mac/Linux
1. Run `./start.sh` in terminal
2. Browser opens automatically!

**Requirements:** Node.js must be installed (https://nodejs.org)

---

## Building Standalone Executables

Want to create a single `.exe` file that works without Node.js? Follow these steps:

### Prerequisites

1. Install Node.js (https://nodejs.org)
2. Install dependencies:
   ```bash
   npm install
   ```

### Build Commands

#### Windows Executable (.exe)
```bash
npm run build:win
```
Creates: `dist/nordpool-monitor-win.exe` (~50 MB)

#### macOS Executable
```bash
npm run build:mac
```
Creates: `dist/nordpool-monitor-macos` (~50 MB)

#### Linux Executable
```bash
npm run build:linux
```
Creates: `dist/nordpool-monitor-linux` (~50 MB)

#### Build All Platforms
```bash
npm run build:all
```
Creates executables for Windows, Mac, and Linux

### Using the Executable

**IMPORTANT:** The executable must be in the same folder as the HTML/JS files!

**Correct folder structure:**
```
my-nordpool-app/
├── nordpool-monitor-win.exe   ← The executable
├── index.html                 ← Required!
├── api.js                     ← Required!
└── renderer.js                ← Required!
```

**Windows:**
1. Double-click `nordpool-monitor-win.exe`
2. Browser opens automatically to http://localhost:8765
3. Press Ctrl+C in the console window to stop

**Mac/Linux:**
1. Run `./nordpool-monitor-macos` (or `./nordpool-monitor-linux`)
2. Browser opens automatically
3. Press Ctrl+C to stop

### Distribution

The executable is **NOT fully standalone** - it needs the HTML/JS files:

**To distribute:**
1. Create a folder with:
   - ✅ `nordpool-monitor-win.exe` (or mac/linux version)
   - ✅ `index.html` (REQUIRED)
   - ✅ `api.js` (REQUIRED)
   - ✅ `renderer.js` (REQUIRED)
   - ✅ `README.md` (optional, for users)
2. Zip the entire folder
3. Users extract and run the executable!

**Why not fully standalone?**
- HTML/CSS/JS files are served dynamically
- This allows easy updates without rebuilding
- Keeps executable size smaller (~50 MB vs ~55 MB)

**Alternative:** Use the script launchers (`start.bat`/`start.sh`) which work the same way but require Node.js.

---

## Technical Details

### How It Works

1. **server.js** - Built-in HTTP server (port 8765)
2. **pkg** - Packages Node.js + server.js into single executable
3. **Assets** - HTML/JS files are bundled with the executable
4. **Auto-open** - Uses system commands to open default browser

### File Structure

```
nordpool-monitor/
├── server.js           # HTTP server + browser launcher
├── index.html          # Web interface
├── api.js              # API handler
├── renderer.js         # UI logic
├── start.bat           # Windows launcher (requires Node.js)
├── start.sh            # Unix launcher (requires Node.js)
├── package.json        # Build configuration
└── dist/               # Built executables (after build)
    ├── nordpool-monitor-win.exe
    ├── nordpool-monitor-macos
    └── nordpool-monitor-linux
```

### Port Configuration

Default port: **8765**

To change the port, edit `server.js`:
```javascript
const PORT = 8765; // Change this number
```

Then rebuild the executable.

### Troubleshooting

**"Port already in use" error:**
- Another app is using port 8765
- Kill the other process or change the port in server.js

**Executable doesn't start:**
- Windows: Check antivirus/firewall settings
- Mac: Right-click → Open (first time only)
- Linux: Ensure executable permission: `chmod +x nordpool-monitor-linux`

**Browser doesn't open:**
- Manually visit http://localhost:8765
- The server is still running even if browser doesn't auto-open

**Build fails:**
- Ensure Node.js 14+ is installed
- Run `npm install` first
- Check internet connection (pkg downloads Node.js binaries)

---

## Development vs Production

### Development (with Node.js)
```bash
npm start
# or
node server.js
# or
./start.sh  (Mac/Linux)
start.bat   (Windows)
```

**Pros:**
- Fast startup
- Easy to modify code
- Smaller file size

**Cons:**
- Requires Node.js installed

### Production (standalone executable)
```bash
npm run build:win  # or :mac, :linux, :all
./dist/nordpool-monitor-win.exe
```

**Pros:**
- No dependencies
- Easy distribution
- Professional deployment

**Cons:**
- Larger file size (~50 MB)
- Slower to rebuild after changes

---

## Release Checklist

Creating a release for users:

- [ ] Test on target platform
- [ ] Build executable: `npm run build:win` (or mac/linux)
- [ ] Test the executable
- [ ] Create release folder with:
  - [ ] Executable file
  - [ ] `README.md` (user instructions)
  - [ ] `LICENSE`
- [ ] Create ZIP archive
- [ ] Test ZIP extraction and execution
- [ ] Upload to GitHub Releases or distribution platform

---

## Advanced: Custom Branding

### Custom Icon (Windows)

1. Install `rcedit`:
   ```bash
   npm install -g rcedit
   ```

2. Create icon file: `icon.ico`

3. Apply icon:
   ```bash
   rcedit dist/nordpool-monitor-win.exe --set-icon icon.ico
   ```

### Custom App Name

Edit `package.json`:
```json
{
  "name": "my-custom-name",
  "bin": {
    "my-custom-name": "server.js"
  }
}
```

Rebuild to get `my-custom-name.exe`

---

## FAQ

**Q: Can I use this commercially?**  
A: Yes, MIT license allows commercial use.

**Q: Does the executable phone home?**  
A: No, it only connects to Elering API for price data.

**Q: Can I modify the code?**  
A: Yes! Edit the source files and rebuild.

**Q: Why is the .exe so large?**  
A: It includes the entire Node.js runtime for standalone operation.

**Q: Can I make it smaller?**  
A: Not significantly - the Node.js runtime is required. Consider distributing the script version instead (requires users to have Node.js).

---

For questions or issues, visit: https://github.com/yourusername/nordpool-monitor/issues
