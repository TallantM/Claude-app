# Settings — Unit Test Specification

## Test File
`tests/unit/settings-page.test.tsx`

## Mocks Required
- `next/navigation` → `useRouter`, `useSearchParams`, `usePathname`
- `next-auth/react` → mock `useSession` (Pattern 18)
- `next-themes` → mock `useTheme` (returns `{ theme: "light", setTheme: vi.fn() }`)

## Key Pattern
The settings page reads `session?.user?.name` for initial profile name. Use `useSession` mock.

## Test Scenarios

1. **renders page heading "Settings"**
   - Given: session with user "Test User"
   - Then: "Settings" heading visible

2. **renders Profile, Appearance, and Security tabs**
   - Given: page loaded
   - Then: all three tab triggers are visible

3. **Profile tab is active by default**
   - Given: page loaded
   - Then: profile name input is visible without clicking any tab

4. **profile name input shows user's name from session**
   - Given: session user name is "Test User"
   - Then: `[data-testid="profile-name-input"]` has value "Test User"

5. **email field is disabled**
   - Given: session with email
   - Then: email input is disabled; helper text "Email cannot be changed" visible

6. **Save Changes button is present in Profile tab**
   - Given: Profile tab active
   - Then: "Save Changes" button visible

7. **switching to Appearance tab shows theme picker**
   - Given: page loaded
   - When: "Appearance" tab clicked
   - Then: "Light", "Dark", "System" theme buttons visible

8. **switching to Security tab shows password fields**
   - Given: page loaded
   - When: "Security" tab clicked
   - Then: "Current Password", "New Password", "Confirm New Password" inputs visible

9. **Update Password button is present in Security tab**
   - Given: Security tab active
   - Then: "Update Password" button visible

10. **profile name input is editable**
    - Given: profile name input rendered
    - When: user types a new name
    - Then: input value updates accordingly
