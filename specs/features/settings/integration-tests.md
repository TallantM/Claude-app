# Settings — Integration Test Specification

## Notes
The settings page currently uses simulated save (500ms timeout) with no real API call.
Future: PATCH /api/users/me

## Current Behaviors
1. Profile name change: calls a local setTimeout, no API call yet
2. Password update: button present, no API wired up yet
3. Theme: uses `next-themes` localStorage, no API call

## Future API Scenarios (when wired up)
1. PATCH /api/users/me — updates profile name
2. POST /api/users/me/password — updates password with validation
