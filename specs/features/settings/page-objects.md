# Page Objects — settings

## SettingsPage

**URL**: `/settings`
**File**: `tests/e2e/page-objects/settings.page.ts`
**Class**: `SettingsPage`

### Elements

| Element | Selector | Notes |
|---------|----------|-------|
| Page heading | `h1:has-text("Settings")` | Confirm page |
| Profile tab | `[role="tab"]:has-text("Profile")` | |
| Appearance tab | `[role="tab"]:has-text("Appearance")` | |
| Security tab | `[role="tab"]:has-text("Security")` | |
| Profile name input | `[data-testid="profile-name-input"]` | Editable name field |
| Email input | `input#email` (disabled) | Read-only email |
| Save changes button | `button:has-text("Save Changes")` | In Profile tab |
| Light theme button | `button:has-text("Light")` | In Appearance tab |
| Dark theme button | `button:has-text("Dark")` | In Appearance tab |
| System theme button | `button:has-text("System")` | In Appearance tab |
| Current password | `#current-password` | In Security tab |
| New password | `#new-password` | In Security tab |
| Confirm password | `#confirm-password` | In Security tab |
| Update password btn | `button:has-text("Update Password")` | In Security tab |

### Notes on navigate()

This page has no `data-testid` elements. Use `h1` for the load wait (Pattern 12).

### Methods

- `navigate(): Promise<void>` — goto `/settings`, wait for `h1` with timeout 10000ms (Pattern 12)
- `clickTab(name: 'Profile' | 'Appearance' | 'Security'): Promise<void>` — click tab trigger
- `getProfileNameValue(): Promise<string>` — get value of `[data-testid="profile-name-input"]`
- `setProfileName(name: string): Promise<void>` — clear and type into profile name input
- `clickSaveChanges(): Promise<void>` — click Save Changes button
- `clickTheme(theme: 'Light' | 'Dark' | 'System'): Promise<void>` — click theme button in Appearance tab
