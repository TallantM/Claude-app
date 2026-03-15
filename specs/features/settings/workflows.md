# Workflows — settings

1. **settings page loads with three tabs visible**
   - Use stored auth state
   - Navigate to `/settings`
   - Wait for `h1` (Pattern 12 — no data-testid on this page)
   - Assert "Settings" h1 visible
   - Assert "Profile", "Appearance", "Security" tab text visible

2. **Profile tab: name input is present and pre-filled from session**
   - Navigate to `/settings`, wait for `h1`
   - Assert `[data-testid="profile-name-input"]` is visible
   - Assert input value is not empty (pre-filled from session)

3. **Appearance tab: theme picker renders Light, Dark, System buttons**
   - Navigate to `/settings`, wait for `h1`
   - Click "Appearance" tab
   - Assert buttons "Light", "Dark", "System" are visible
   - Click "Dark" — assert the button gains active border styling

4. **Security tab: password fields render**
   - Navigate to `/settings`, wait for `h1`
   - Click "Security" tab
   - Assert "Current Password", "New Password", "Confirm New Password" labels visible
   - Assert "Update Password" button visible
