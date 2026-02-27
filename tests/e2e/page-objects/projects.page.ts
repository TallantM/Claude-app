import type { Page } from "@playwright/test";

/**
 * Page Object for the Projects list page (/projects).
 * Wraps search, filter, create dialog, and project card interactions.
 */
export class ProjectsPage {
  constructor(private readonly page: Page) {}

  async navigateTo(): Promise<void> {
    await this.page.goto("/projects");
    await this.page.waitForLoadState("networkidle");
  }

  async searchProjects(term: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder("Search projects...");
    await searchInput.fill(term);
  }

  async filterByStatus(
    status: "all" | "active" | "archived" | "completed"
  ): Promise<void> {
    // First combobox on the page is the status filter
    const trigger = this.page.locator('[role="combobox"]').first();
    await trigger.click();
    const label = status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1);
    await this.page.getByRole("option", { name: label }).click();
  }

  async clickNewProject(): Promise<void> {
    await this.page.getByRole("button", { name: "New Project" }).click();
  }

  async createProject(name: string, description?: string): Promise<void> {
    if (!(await this.isDialogOpen())) {
      await this.clickNewProject();
    }
    await this.page.locator('[role="dialog"] #name').fill(name);
    if (description) {
      await this.page.locator('[role="dialog"] textarea').fill(description);
    }
    await this.page.getByRole("button", { name: "Create Project" }).click();
    // Wait for dialog to close
    await this.page.waitForSelector('[role="dialog"]', { state: "hidden" });
  }

  async getProjectCardTitles(): Promise<string[]> {
    const cards = this.page.locator(".cursor-pointer h3, .cursor-pointer .text-base");
    const count = await cards.count();
    const titles: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).textContent();
      if (text) titles.push(text.trim());
    }
    return titles;
  }

  async getProjectCardCount(): Promise<number> {
    return this.page.locator(".grid .cursor-pointer").count();
  }

  async clickProjectCard(name: string): Promise<void> {
    await this.page.locator(`.cursor-pointer:has-text("${name}")`).first().click();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.locator('text=No projects found').isVisible();
  }

  async isDialogOpen(): Promise<boolean> {
    return this.page.locator('[role="dialog"]').isVisible();
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.page.locator('h1:has-text("Projects")').isVisible();
  }
}
