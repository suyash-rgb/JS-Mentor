# Chatbot Setup Guide

## Quick Setup (Already Done ✅)

### 1. Files Created:
✅ `/src/components/chatbot/Chatbot.js` - Main component with API integration
✅ `/src/components/chatbot/Chatbot.css` - Complete styling with responsive design

### 2. Files Modified:
✅ `/src/App.js` - Added chatbot state management and toggle button

### 3. What Was Added:

#### In App.js:
- State hook for managing chatbot open/close
- Floating toggle button (bottom-right corner)
- Chatbot component mount
- Inline styles for the toggle button with animations

#### In Chatbot.js:
- Full API integration matching your existing Ai.js page
- JavaScript-only question validation
- Image upload functionality
- Response truncation (300 chars)
- Minimize/Close buttons
- "Read More" button that redirects to `/ai` page
- All markdown formatting for responses

#### In Chatbot.css:
- Modern UI design matching your orange theme
- Animations and transitions
- Mobile responsive layout
- Custom scrollbar styling
- Hover effects and interactions

## How to Use

### For Users:
1. Click the **orange chat bubble** button (bottom-right)
2. Type their JavaScript question
3. Optionally upload an image
4. Click the **send button** (paper plane icon)
5. View the response (truncated)
6. Click **"Read More"** to see full response on AI page

### For Developers:

#### Display on Specific Pages:
The chatbot is globally available on all pages. To disable it on specific pages:

```javascript
// In that page component, you can disable it by not rendering the toggle
// But currently it's always available
```

#### Customize Response Length:
Edit `Chatbot.js` line ~70:
```javascript
truncateResponse(response, 300) // Change 300 to your desired length
```

#### Change Toggle Button Position:
Edit `App.js` styles:
```css
bottom: 30px;  /* Adjust vertical position */
right: 30px;   /* Adjust horizontal position */
```

#### Style Customization:
All styles are in `Chatbot.css`. Main color is `rgb(240, 82, 4)` - search and replace to change theme.

## Testing

### What to Test:
1. ✅ Toggle button appears on all pages
2. ✅ Chatbot opens/closes smoothly
3. ✅ Can type questions
4. ✅ API responds correctly
5. ✅ Responses are truncated
6. ✅ "Read More" redirects to `/ai`
7. ✅ Minimize button works
8. ✅ Close button works
9. ✅ Image upload button works
10. ✅ Mobile responsive (test at 480px)

## Environment Variables

Ensure these are in your `.env` file:
```
REACT_APP_GROK_API_KEY=your_api_key
REACT_APP_GROK_API_URL=your_api_url
REACT_APP_GROK_MODEL=your_model_name
```

These are already used by your existing Ai.js page, so they should be configured.

## Common Issues & Solutions

### Issue: Chatbot doesn't appear
**Solution**: 
- Check that `App.js` imports the Chatbot component
- Verify Font Awesome is loaded (needed for icons)
- Check browser console for errors

### Issue: API not responding
**Solution**:
- Check environment variables are set
- Verify API credentials are correct
- Check network tab in DevTools

### Issue: Styling looks wrong
**Solution**:
- Clear browser cache
- Verify `Chatbot.css` is in the correct folder
- Check for conflicting CSS in global styles

### Issue: Toggle button positioned wrong
**Solution**:
- Edit the `bottom` and `right` values in `App.js`
- Adjust for your layout

## Mobile Testing

The chatbot is fully responsive:
- On mobile, chatbot takes full width (with 20px margins)
- Toggle button is slightly smaller (50x50px)
- All interactions work smoothly
- Keyboard handling for input

## Next Steps

1. ✅ Component is ready to use
2. 🔄 Test on different pages and devices
3. 🎨 Customize colors/styles if needed
4. 📝 Gather user feedback
5. 🚀 Deploy to production

## Files Summary

```
JS-Mentor/
├── src/
│   ├── components/
│   │   ├── chatbot/
│   │   │   ├── Chatbot.js          ← NEW
│   │   │   └── Chatbot.css         ← NEW
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   └── Card.js
│   ├── App.js                       ← MODIFIED
│   ├── pages/
│   │   ├── Ai.js                   ← Reference for API
│   │   └── ...
│   └── ...
├── CHATBOT_DOCUMENTATION.md        ← NEW (detailed docs)
└── ...
```

## Support

All the code is properly documented with comments. Refer to:
- `CHATBOT_DOCUMENTATION.md` for detailed information
- `Chatbot.js` comments for code logic
- `Chatbot.css` comments for styling sections

Happy coding! 🚀
