# Reports — Unit Test Specification

## Test File
`tests/unit/reports-page.test.tsx`

## Mocks Required
- `next/navigation` → `useRouter`, `useSearchParams`, `usePathname`
- Chart.js and react-chartjs-2 → must be mocked (canvas not available in jsdom)

## Chart.js Mock
```typescript
vi.mock("react-chartjs-2", () => ({
  Line: () => <canvas data-testid="line-chart" />,
  Bar: () => <canvas data-testid="bar-chart" />,
  Doughnut: () => <canvas data-testid="doughnut-chart" />,
}));
```

## Test Scenarios

1. **renders the page heading "Reports & Analytics"**
   - Given: page rendered
   - Then: "Reports & Analytics" heading visible

2. **renders Sprint Burndown chart card**
   - Given: page rendered
   - Then: "Sprint Burndown" card title visible

3. **renders Team Velocity chart card**
   - Given: page rendered
   - Then: "Team Velocity" card title visible

4. **renders Issue Distribution chart card**
   - Given: page rendered
   - Then: "Issue Distribution" card title visible

5. **renders Task Completion Trend chart card**
   - Given: page rendered
   - Then: "Task Completion Trend" card title visible

6. **renders four Export buttons (one per chart)**
   - Given: page rendered
   - Then: exactly 4 buttons with "Export" text are visible

7. **renders chart canvas elements**
   - Given: page rendered with mocked chart components
   - Then: at least one `canvas` element is in the DOM

8. **renders subtitle text**
   - Given: page rendered
   - Then: "Track your team's performance and project health" description visible
