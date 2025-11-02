# How to Run Admin Tool

## ⚠️ Important: Use Dev Version, Not Built App

The built `.app` file in `dist/` is outdated. Always run the dev version to get latest updates.

## Run Dev Version (Recommended)

```bash
cd admin-tool
npm run start
```

This will:
- ✅ Use the latest code from `index.html` and `renderer/app.js`
- ✅ Show DevTools automatically (for debugging)
- ✅ Hot reload when you make changes

## If You Need to Use the Built App

Only if you want a standalone `.app` file:

```bash
cd admin-tool
npm run dist
```

Then open:
```
admin-tool/dist/mac-arm64/RI&E Admin Tool.app
```

⚠️ **Note**: You need to rebuild every time you make code changes!

## Troubleshooting

**Button doesn't work?**
1. Make sure you're running `npm run start` (dev version)
2. Check DevTools console (should open automatically)
3. Look for JavaScript errors

**Can't see console?**
- Press `Cmd+Option+I` (Mac) or `F12` to open DevTools
- Or the dev version opens it automatically

**Still not working?**
- Make sure all files are saved
- Restart with `npm run start`
- Check console for errors

