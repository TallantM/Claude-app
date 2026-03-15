import type { Page } from "@playwright/test";

/**
 * Page Object for the Project Detail page (/projects/[id]).
 * Wraps kanban board, task creation dialog, and tab navigation.
 */
export class ProjectDetailPage {
  constructor(private readonly page: Page) {}

  async navigate(projectId: string): Promise<void> {
    await this.page.goto(`/projects/${projectId}`);
    await this.page.waitForSelector('[data-testid="kanban-col-todo"]', { timeout: 10000 });
  }

  async clickBackButton(): Promise<void> {
    await this.page.click('[data-testid="back-to-projects"]');
  }

  async clickAddTask(column: string): Promise<void> {
    const col = this.page.locator(`[data-testid="kanban-col-${column}"]`);
    await col.getByRole("button", { name: /add task/i }).click();
  }

  async fillCreateTaskDialog(title: string): Promise<void> {
    await this.page.fill("#task-title", title);
  }

  async submitCreateTaskDialog(): Promise<void> {
    await this.page.click('button[type="submit"]:has-text("Create Task")');
  }

  async getTaskCardCount(column?: string): Promise<number> {
    if (column) {
      return this.page
        .locator(`[data-testid="kanban-col-${column}"] [data-testid="task-card"]`)
        .count();
    }
    return this.page.locator('[data-testid="task-card"]').count();
  }

  async clickFirstTaskCard(): Promise<void> {
    await this.page.locator('[data-testid="task-card"]').first().click();
  }

  async clickTab(name: string): Promise<void> {
    await this.page.getByRole("tab", { name }).click();
  }

  async isKanbanLoaded(): Promise<boolean> {
    return this.page.locator('[data-testid="kanban-col-todo"]').isVisible();
  }
}
