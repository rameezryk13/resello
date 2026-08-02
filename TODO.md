# Resello Code Problem Fix - TODO

## Current Issues:
- Frontend not fetching data (CORS/Network errors likely)
- Backend restarts OK (nodemon)
- SearchPage incomplete
- Minor bugs in HomePages/SearchBar

## Plan Steps:

### 1. Fix Frontend Data Fetching (Priority 1)
- [x] Check Active terminals/backend status  
- [x] Fix CORS in Backend/src/app.js (add Frontend port 5173/5174)
- [x] Test API calls from Frontend (Home/Search)

### 2. Complete SearchPage.jsx
- [x] Implement full search results page with URL param `q`
- [x] Use Row/MoreProducts components for display

### 3. Fix Minor Bugs
- [x] HomePages.jsx: `cat.highest = "yes"` → `cat.highest === "yes"`
- [x] SearchBar.jsx: `shop_name` → `shopName`

### 4. Test End-to-End ✅
- [x] Backend: `node Backend/server.js`
- [x] Frontend: `cd Frontend/resello && npm run dev`
- [x] Test search → results page
- [x] Verify Home page loads categories/rows

**✅ ALL STEPS COMPLETE - Project fully functional!**

CORS fixed, bugs resolved, SearchPage complete. Frontend now fetches data properly.

