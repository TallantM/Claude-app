# Unit Tests — settings

1. **renders Settings page with Profile, Appearance, Security tabs**
   - Mock `useSession` to return session with `user: { name: "Test User", email: "test@example.com" }`
   - Mock `useTheme`
   - Render `SettingsPage`
   - Assert "Settings" heading visible
   - Assert "Profile", "Appearance", "Security" tab triggers present

2. **Profile tab renders name input with session user's name**
   - Mock session with `name: "Alice"`
   - Assert `[data-testid="profile-name-input"]` is present with value "Alice"

3. **Profile tab renders disabled email input with session email**
   - Mock session with `email: "alice@example.com"`
   - Assert email input has value "alice@example.com" and is disabled

4. **Save Changes button calls save handler**
   - Mock session, render `SettingsPage`
   - Click "Save Changes" button
   - Assert button shows "Save Changes" text (and briefly shows loading state)

5. **Appearance tab renders theme picker with Light, Dark, System options**
   - Click "Appearance" tab trigger
   - Assert buttons with text "Light", "Dark", "System" are visible

6. **clicking a theme button applies active styling**
   - Mock `useTheme` with `theme: "light"`, `setTheme: vi.fn()`
   - Click "Appearance" tab
   - Assert "Light" button has the active border class (`border-primary`)
   - Click "Dark" button
   - Assert `setTheme` called with "dark"

7. **Security tab renders current-password, new-password, confirm fields**
   - Click "Security" tab trigger
   - Assert `#current-password`, `#new-password`, `#confirm-password` inputs present
   - Assert "Update Password" button visible

8. **profile name input is editable**
   - Render `SettingsPage` with session
   - Clear `[data-testid="profile-name-input"]` and type "New Name"
   - Assert input value is "New Name"

9. **Settings page renders with no session gracefully**
   - Mock `useSession` to return `{ data: null }`
   - Assert page renders without crashing
   - Assert "Settings" heading still visible

10. **avatar displays initials from session user name**
    - Mock session with `name: "Carol Dean"`
    - Assert "CD" text visible in avatar fallback
