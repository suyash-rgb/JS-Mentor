# Chatbot Component Documentation

## Overview
The JS Mentor AI Chatbot is a floating widget that can be displayed on any page in your application. It allows students to ask JavaScript-related questions without leaving their current learning path.

## Features

✨ **Key Features:**
- **Floating Widget**: Fixed position at bottom-right of screen
- **Toggle Button**: Smooth toggle between open/closed states
- **Minimize/Expand**: Users can minimize the chatbot to the ribbon
- **API Integration**: Uses the same GROK API as the main AI page
- **Image Upload**: Support for uploading images with questions
- **Partial Response**: Shows truncated responses (300 characters max)
- **Read More Button**: Redirects to full AI page for complete responses
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Color Theme**: Matches your website's orange color scheme (rgb(240, 82, 4))

## Component Structure

### Files Created:
1. **`src/components/chatbot/Chatbot.js`** - Main chatbot component
2. **`src/components/chatbot/Chatbot.css`** - Styling

### Modified Files:
1. **`src/App.js`** - Added chatbot integration and toggle button

## Usage

The chatbot is automatically integrated into your app and appears on all pages. Users can:

1. **Click the floating button** (bottom-right) to open the chatbot
2. **Type their question** in the text area
3. **Upload an image** using the image button (optional)
4. **Click Send** to submit their question
5. **View response** with truncated text
6. **Click "Read More"** to visit the full AI page
7. **Minimize** using the minimize button on the ribbon
8. **Close** using the close button on the ribbon

## Design Details

### Colors Used:
- **Primary Orange**: `rgb(240, 82, 4)`
- **Background**: `white`, `#fafafa`
- **Text**: `#333`, `#666`, `#999`
- **Borders**: `#e0e0e0`
- **Error**: `#ffebee` (background), `#c0392b` (text)

### Dimensions:
- **Width**: 380px (desktop), 100% - 40px (mobile)
- **Height**: 600px max
- **Z-index**: 9999 (chatbot), 9998 (toggle button)

### Animations:
- **Slide In**: Smooth entrance animation
- **Hover Effects**: Buttons have scale and color transitions
- **Custom Scrollbar**: Orange-themed scrollbar

## API Integration

The chatbot uses the same API configuration as the main AI page:

```javascript
const apiKey = process.env.REACT_APP_GROK_API_KEY;
const url = process.env.REACT_APP_GROK_API_URL;
const model = process.env.REACT_APP_GROK_MODEL;
```

### API Flow:
1. **JavaScript Check**: First validates if the question is JavaScript-related
2. **If YES**: Sends the question to the API for detailed response
3. **If NO**: Shows a friendly message limiting responses to JavaScript

## Response Truncation

The response is truncated to 300 characters to keep the chatbot compact. Users can:
- Scroll through longer responses in the message area
- Click "Read More" to see the full response on the AI page

## Customization Options

### Change Max Response Length:
In `Chatbot.js`, modify the `maxLength` parameter:
```javascript
truncateResponse(response, 300) // Change 300 to desired length
```

### Change Chatbot Position:
In `App.js`, modify the `bottom` and `right` values:
```css
bottom: 30px;  /* Distance from bottom */
right: 30px;   /* Distance from right */
```

### Change Chatbot Width:
In `Chatbot.css`, modify the `.chatbot-container` width:
```css
width: 380px;  /* Change as needed */
```

## Dependencies

Make sure the following packages are installed:
- `react` (already in your project)
- `react-router-dom` (already in your project)
- `axios` (already in your project)
- `react-markdown` (already in your project)
- `remark-gfm` (already in your project)
- Font Awesome icons (ensure included in `index.html`)

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Mobile Responsiveness

On screens smaller than 480px:
- Chatbot width expands to fill screen (with 20px margins)
- Toggle button shrinks to 50x50px
- All functionality remains the same

## Accessibility

- Keyboard navigation support
- Clear visual feedback on interactions
- Semantic HTML structure
- ARIA-friendly tooltips on buttons

## Future Enhancements

Consider adding:
- Chat history/conversation history
- Search within responses
- Code syntax highlighting with copy button
- Dark mode support
- User preferences storage
- Rating system for responses

## Troubleshooting

### Chatbot not appearing:
- Check that Font Awesome is included in `index.html`
- Verify `Chatbot.js` and `Chatbot.css` are in `src/components/chatbot/`
- Check browser console for errors

### API not working:
- Verify environment variables are set correctly
- Check that API key is valid
- Ensure network connectivity

### Styling issues:
- Clear browser cache (Ctrl+Shift+Delete)
- Check that CSS file is imported
- Verify no conflicting global styles

## Notes

- The chatbot is positioned with `z-index: 9999` so it appears above other elements
- The toggle button has `z-index: 9998` to stay behind the chatbot
- Responsiveness breakpoint is at 480px width
- All animations use CSS transitions for smooth performance
