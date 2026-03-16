# Settings — Page Object Specification

## Route
`/settings`

## Page Object Class
`SettingsPage` in `tests/e2e/page-objects/settings.page.ts`

## Selectors

| Element | Selector |
|---|---|
| Page heading | `h1:has-text("Settings")` |
| Profile tab trigger | `button[role="tab"]:has-text("Profile")` |
| Appearance tab trigger | `button[role="tab"]:has-text("Appearance")` |
| Security tab trigger | `button[role="tab"]:has-text("Security")` |
| Profile name input | `[data-testid="profile-name-input"]` |
| Email input (disabled) | `#email` |
| Save Changes button | `button:has-text("Save Changes")` |
| Current password input | `#current-password` |
| New password input | `#new-password` |
| Confirm password input | `#confirm-password` |
| Update Password button | `button:has-text("Update Password")` |
| Theme Light button | `button:has-text("Light")` |
| Theme Dark button | `button:has-text("Dark")` |
| Theme System button | `button:has-text("System")` |

## Actions

### `navigate()`
- `goto("/settings")`
- `waitForSelector('h1', { timeout: 10000 })`

### `clickTab(tab: "profile" | "appearance" | "security")`
- Clicks the appropriate tab trigger

### `updateProfileName(name)`
- Clears and fills `[data-testid="profile-name-input"]`
- Clicks "Save Changes"
