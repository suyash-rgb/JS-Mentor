# Anti-Cheat Sidebar & DevTools Detection - Manual Verification Test Suite

This document lists the test cases for manual verification of the anti-cheat proctoring engine changes implemented on the `17-docs` branch.

---

## Setup
1. Launch the JS-Mentor application in development mode (`npm run dev`).
2. Log in as a student and navigate to any hands-on programming challenge (which opens the `ExerciseCompiler` IDE view).

---

## Test Case 1: Initial Sidebar/DevTools Detection (Pre-existing Panel)
### Pre-condition:
The browser Gemini side panel or Developer Tools **must be open** before entering the challenge.

### Steps:
1. Open Chrome DevTools (F12) or the Google Gemini Sidebar.
2. Click to enter the programming challenge.

### Expected Result:
- The challenge workspace is immediately blurred and covered by the **"Workspace Blocked"** warning overlay.
- The task description and Monaco editor are not readable or interactable.
- The console tab displays the message: `[Security Warning]: External panel/DevTools detected. Please close it to proceed.`
- The header close button is still visible and clickable to allow exiting the challenge.

---

## Test Case 2: Opening Sidebar Mid-Challenge (Dynamic Detection)
### Pre-condition:
Enter the challenge with a clean, maximized browser window (no side panels or DevTools open).

### Steps:
1. Start the coding challenge. Verify you can view the description and write code.
2. Open the Gemini Extension Side Panel or dock DevTools to the right or bottom of the screen.

### Expected Result:
- The workspace instantly blurs and displays the **"Workspace Blocked"** overlay.
- A warning count is incremented: the header updates to show `Warning Level: 1` (or increments from previous).
- The Console tab logs: `[Security Warning]: External panel/DevTools detected at [Timestamp]`.

---

## Test Case 3: Closing Sidebar (Dynamic Recovery)
### Pre-condition:
The workspace is currently blocked due to an open sidebar or docked DevTools (Test Case 2 state).

### Steps:
1. Close the Gemini Extension Side Panel or DevTools.

### Expected Result:
- The **"Workspace Blocked"** warning overlay disappears immediately.
- The workspace returns to normal visibility.
- You can resume editing code and reading descriptions.
- The Warning Level remains at its current count (e.g. `1`), but does not increment further.

---

## Test Case 4: Security Threshold Auto-Rejection
### Pre-condition:
The challenge is currently active and warning count is `0`.

### Steps:
1. Open the sidebar. (Warning Level becomes `1`, screen blocks).
2. Close the sidebar. (Screen unblocks).
3. Open the sidebar a second time. (Warning Level becomes `2`, screen blocks).
4. Close the sidebar. (Screen unblocks).
5. Open the sidebar a third time. (Warning Level becomes `3`, screen blocks).
6. Close the sidebar. (Screen unblocks).
7. Open the sidebar a fourth time.

### Expected Result:
- Warning Level exceeds `3`.
- The Console prints: `[System]: Security threshold exceeded. Attempt failed.`
- After a 1.5-second delay, the challenge automatically saves as a failed attempt, closes, and redirects you out of the compiler.

---

## Test Case 5: Standard Zoom and Resizing (No False Positives)
### Pre-condition:
Challenge is open, no sidebars/DevTools active.

### Steps:
1. Zoom the browser in to `150%` and `200%` using `Ctrl +` or `Ctrl + Wheel`.
2. Zoom the browser out to `75%` and `50%`.
3. Manually resize the browser window borders to make it smaller or wider.
4. Snap the browser window to half-screen using Windows Snap Assist (`Win + Left/Right Arrow`).

### Expected Result:
- The workspace **does not** show the blocked overlay.
- Warning count does not increment.
- No security warnings are printed to the console.
