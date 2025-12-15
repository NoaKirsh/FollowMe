<p align="center">
  <img src="logo.png" alt="FollowMe Logo" width="300">
</p>

Instagram follower tracking web app for iPhone.

## ✨ Features

- Who follows you that you don't follow back
- Who you follow that doesn't follow you back  
- Mutual followers

## 🚀 Quick Start

### 📥 Get Your Instagram Data

Instagram doesn't provide API access for follower data. This official data export (required by GDPR - General Data Protection Regulation) is the only way to analyze your own followers and following lists without violating Instagram's terms of service.

1. Instagram app → Settings → Security → Download Data
2. Select JSON format
3. Wait for email (4-48 hours)
4. Download and extract ZIP
5. Find these files:
   - `followers_1.json` - List of accounts that follow you
     - Path: `instagram-YOURNAME-DATE/followers_and_following/followers_1.json`
   - `following.json` - List of accounts you follow
     - Path: `instagram-YOURNAME-DATE/followers_and_following/following.json`

### Run the App

From the project's root directory, run:
```bash
npm install
npm start
```

Browser opens automatically at `http://localhost:19006`

### 📱 Use on iPhone

1. Same Wi-Fi as your PC
2. Safari → `http://YOUR-PC-IP:19006`
3. Add to Home Screen for app-like experience

### Analyze

1. Select `followers_1.json`
2. Select `following.json`
3. Click Analyze
4. View results

## 🛠️ Tech Stack

- React Native Web
- Expo SDK 54
- React Navigation

## 🔒 Privacy

- All data stays on your device
- No server uploads
- No tracking

## Verification Tool

Use `verify_instagram_data.html` to check if your files are valid before analyzing.

## Commands

```bash
npm install      # Install dependencies
npm start        # Start web app
npm run native   # Try native mode (may have SDK issues)
```

## ⚠️ Troubleshooting

Files won't upload:
- Hard reload: Ctrl+Shift+R
- Check console (F12) for errors

No results showing:
- Verify files are valid JSON (use verification tool)
- Check that both files are selected

Can't connect on iPhone:
- Must be on same Wi-Fi as PC
- Use Safari (not Chrome)
- Check firewall settings

## License

MIT License

Copyright (c) 2025 Noa Kirsh

## Author

Created by **Noa Kirsh**
