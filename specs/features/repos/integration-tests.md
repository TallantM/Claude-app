# Repos — Integration Test Specification

## API Routes
- `GET /api/repos` — list repositories
- `POST /api/repos` — connect a new repository

## Scenarios

### GET /api/repos
1. Returns array of repos with project associations
2. Returns empty array when no repos connected
3. Requires authentication

### POST /api/repos
1. Creates repo with name, url, provider, optional projectId and defaultBranch
2. Returns 400 for invalid URL
3. Returns 400 for missing required fields
4. Requires authentication
