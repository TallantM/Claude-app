"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  AlertCircle,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Flame,
  ChevronDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  getStatusColor,
  getPriorityColor,
  getInitials,
  formatDate,
} from "@/lib/utils";
import { taskSchema, type TaskInput } from "@/lib/validations";
import {
  TaskStatus,
  type ProjectSummary,
  type TaskWithRelations,
  type SprintWithTasks,
  type KanbanColumn,
} from "@/types";

interface ProjectDetail extends ProjectSummary {
  description: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface ProjectData {
  project: ProjectDetail;
  tasks: TaskWithRelations[];
  sprints: SprintWithTasks[];
}

const columnConfig: { id: TaskStatus; title: string }[] = [
  { id: TaskStatus.TODO, title: "To Do" },
  { id: TaskStatus.IN_PROGRESS, title: "In Progress" },
  { id: TaskStatus.IN_REVIEW, title: "In Review" },
  { id: TaskStatus.DONE, title: "Done" },
];

function getPriorityIcon(priority: string) {
  switch (priority) {
    case "low":
      return <SignalLow className="h-4 w-4" />;
    case "medium":
      return <SignalMedium className="h-4 w-4" />;
    case "high":
      return <SignalHigh className="h-4 w-4" />;
    case "critical":
      return <Flame className="h-4 w-4" />;
    default:
      return <SignalMedium className="h-4 w-4" />;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="h-5 w-96 bg-muted animate-pulse rounded" />
      <div className="h-10 w-72 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-96 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onTaskClick,
}: {
  task: TaskWithRelations;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onTaskClick: (task: TaskWithRelations) => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow mb-2"
      onClick={() => onTaskClick(task)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium leading-tight flex-1">
            {task.title}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Move to</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columnConfig.map((col) => (
                <DropdownMenuItem
                  key={col.id}
                  disabled={task.status === col.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(task.id, col.id);
                  }}
                >
                  {col.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={getPriorityColor(task.priority)}>
            {getPriorityIcon(task.priority)}
          </span>
          {task.storyPoints != null && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {task.storyPoints} SP
            </Badge>
          )}
          {task.type && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {task.type}
            </Badge>
          )}
        </div>

        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.labels.map(({ label }) => (
              <span
                key={label.id}
                className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: label.color + "20",
                  color: label.color,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {task.assignee && (
          <div className="flex items-center gap-1.5 mt-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={task.assignee.image ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {getInitials(task.assignee.name ?? "U")}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {task.assignee.name}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<string>("todo");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      type: "task",
      storyPoints: undefined,
      dueDate: "",
      assigneeId: "",
      sprintId: "",
    },
  });

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      fetchProject();
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleCreateTask = async (formData: TaskInput) => {
    try {
      setSubmitting(true);
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: newTaskStatus }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      setNewTaskDialogOpen(false);
      reset();
      fetchProject();
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskClick = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const openNewTaskDialog = (status: string) => {
    setNewTaskStatus(status);
    setValue("status", status as TaskInput["status"]);
    setNewTaskDialogOpen(true);
  };

  if (loading) return <LoadingSkeleton />;

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive text-lg font-medium">Error loading project</p>
          <p className="text-muted-foreground mt-1">{error ?? "Project not found"}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/projects")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const { project, tasks, sprints } = data;

  const columns: KanbanColumn[] = columnConfig.map((col) => ({
    id: col.id,
    title: col.title,
    tasks: tasks.filter((t) => t.status === col.id),
  }));

  const backlogTasks = tasks.filter((t) => !t.sprintId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/projects")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <Badge variant="outline">{project.key}</Badge>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="sprints">Sprints</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Board Tab */}
        <TabsContent value="board">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {column.tasks.length}
                    </Badge>
                  </div>
                </div>
                <div className="flex-1 space-y-0 min-h-[200px] p-2 rounded-lg bg-muted/50">
                  {column.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onTaskClick={handleTaskClick}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground text-sm h-8 mt-1"
                    onClick={() => openNewTaskDialog(column.id)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add task
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Backlog Tab */}
        <TabsContent value="backlog">
          <div className="mt-4">
            {backlogTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border rounded-lg border-dashed">
                <p className="text-muted-foreground">No backlog items</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tasks not assigned to a sprint will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {backlogTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => handleTaskClick(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className={getPriorityColor(task.priority)}>
                          {getPriorityIcon(task.priority)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">
                            {task.title}
                          </h4>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace("_", " ")}
                        </Badge>
                        {task.storyPoints != null && (
                          <Badge variant="outline" className="text-xs">
                            {task.storyPoints} SP
                          </Badge>
                        )}
                        {task.assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={task.assignee.image ?? undefined}
                            />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(task.assignee.name ?? "U")}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Sprints Tab */}
        <TabsContent value="sprints">
          <div className="mt-4 space-y-4">
            {sprints.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border rounded-lg border-dashed">
                <p className="text-muted-foreground">No sprints yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a sprint to organize your work into iterations.
                </p>
              </div>
            ) : (
              sprints.map((sprint) => (
                <Card key={sprint.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {sprint.name}
                        </CardTitle>
                        {sprint.goal && (
                          <CardDescription>{sprint.goal}</CardDescription>
                        )}
                      </div>
                      <Badge className={getStatusColor(sprint.status)}>
                        {sprint.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{sprint.tasks.length} tasks</span>
                      {sprint.startDate && (
                        <span>Start: {formatDate(sprint.startDate)}</span>
                      )}
                      {sprint.endDate && (
                        <span>End: {formatDate(sprint.endDate)}</span>
                      )}
                    </div>
                    {sprint.tasks.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {sprint.tasks.slice(0, 5).map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:bg-muted/50 rounded px-2 -mx-2"
                            onClick={() => handleTaskClick(task)}
                          >
                            <span className={getPriorityColor(task.priority)}>
                              {getPriorityIcon(task.priority)}
                            </span>
                            <span className="flex-1 truncate">{task.title}</span>
                            <Badge
                              className={`text-xs ${getStatusColor(task.status)}`}
                            >
                              {task.status.replace("_", " ")}
                            </Badge>
                          </div>
                        ))}
                        {sprint.tasks.length > 5 && (
                          <p className="text-xs text-muted-foreground pl-2">
                            +{sprint.tasks.length - 5} more tasks
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Project Settings</CardTitle>
              <CardDescription>
                Manage your project configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input defaultValue={project.name} />
              </div>
              <div className="space-y-2">
                <Label>Project Key</Label>
                <Input defaultValue={project.key} disabled />
                <p className="text-xs text-muted-foreground">
                  Project keys cannot be changed after creation.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea defaultValue={project.description ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue={project.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Detail Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTask.title}</DialogTitle>
                <DialogDescription>Task details and editing</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(selectedTask.status)}>
                    {selectedTask.status.replace("_", " ")}
                  </Badge>
                  <Badge
                    className={getPriorityColor(selectedTask.priority)}
                    variant="outline"
                  >
                    {selectedTask.priority}
                  </Badge>
                  {selectedTask.type && (
                    <Badge variant="secondary">{selectedTask.type}</Badge>
                  )}
                  {selectedTask.storyPoints != null && (
                    <Badge variant="outline">
                      {selectedTask.storyPoints} Story Points
                    </Badge>
                  )}
                </div>

                {selectedTask.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <p className="text-sm mt-1">{selectedTask.description}</p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Status
                    </Label>
                    <Select
                      defaultValue={selectedTask.status}
                      onValueChange={(value) =>
                        handleStatusChange(selectedTask.id, value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {columnConfig.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Assignee
                    </Label>
                    {selectedTask.assignee ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={selectedTask.assignee.image ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(selectedTask.assignee.name ?? "U")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{selectedTask.assignee.name}</span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground mt-1">Unassigned</p>
                    )}
                  </div>
                  {selectedTask.dueDate && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Due Date
                      </Label>
                      <p className="mt-1">{formatDate(selectedTask.dueDate)}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Created
                    </Label>
                    <p className="mt-1">{formatDate(selectedTask.createdAt)}</p>
                  </div>
                </div>

                {selectedTask.labels && selectedTask.labels.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Labels
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTask.labels.map(({ label }) => (
                        <span
                          key={label.id}
                          className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: label.color + "20",
                            color: label.color,
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Task Dialog */}
      <Dialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to the{" "}
              {columnConfig.find((c) => c.id === newTaskStatus)?.title ?? ""}{" "}
              column.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleCreateTask)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                placeholder="Task title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Describe the task..."
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  defaultValue="medium"
                  onValueChange={(value) =>
                    setValue("priority", value as TaskInput["priority"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  defaultValue="task"
                  onValueChange={(value) =>
                    setValue("type", value as TaskInput["type"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-sp">Story Points</Label>
                <Input
                  id="task-sp"
                  type="number"
                  min={0}
                  max={100}
                  {...register("storyPoints", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-due">Due Date</Label>
                <Input
                  id="task-due"
                  type="date"
                  {...register("dueDate")}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNewTaskDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
