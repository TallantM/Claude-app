# Settings — E2E Workflow Specification

## Test File
`tests/e2e/settings.spec.ts`

## Auth
All tests use `storageState: ".auth/user.json"` (authenticated user).

## Workflows

1. **loads the settings page with heading and tabs**
   - Navigate to `/settings`
   - Assert: `h1` with "Settings" is visible
   - Assert: Profile, Appearance, Security tab triggers visible

2. **Profile tab is active by default showing name and email fields**
   - Navigate to `/settings`
   - Assert: profile name input is visible
   - Assert: email input is visible and disabled

3. **switching to Appearance tab shows theme picker**
   - Navigate to `/settings`
   - Click "Appearance" tab
   - Assert: Light, Dark, System theme buttons are visible

4. **switching to Security tab shows password fields**
   - Navigate to `/settings`
   - Click "Security" tab
   - Assert: Current Password, New Password, Confirm New Password fields visible
   - Assert: "Update Password" button visible

5. **Save Changes button triggers save action in Profile tab**
   - Navigate to `/settings`
   - Assert: "Save Changes" button is visible and clickable

6. **selecting a theme option updates active state**
   - Navigate to `/settings`
   - Click "Appearance" tab
   - Click "Dark" theme button
   - Assert: "Dark" button has active/selected styling
