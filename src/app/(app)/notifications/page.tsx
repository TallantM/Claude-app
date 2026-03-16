"use client";

import { useState } from "react";
import {
  Bell,
  CheckSquare,
  MessageSquare,
  Zap,
  Bug,
  XCircle,
  CheckCheck,
  Inbox,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatRelativeTime } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";
import { Pagination } from "@/components/ui/pagination";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = {
  task_assigned: CheckSquare,
  comment_added: MessageSquare,
  sprint_started: Zap,
  issue_created: Bug,
  pipeline_failed: XCircle,
};

export default function NotificationsPage() {
  const {
    data: notifications,
    pagination,
    loading,
    setPage,
    setPageSize,
  } = usePagination<Notification>({
    url: "/api/notifications",
  });

  // Local optimistic state for read/deleted status
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [allCleared, setAllCleared] = useState(false);

  const visibleNotifications = allCleared
    ? []
    : notifications.filter((n) => !deletedIds.has(n.id));

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setReadIds((prev) => new Set(prev).add(id));
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    setDeletedIds((prev) => new Set(prev).add(id));
  };

  const clearAll = async () => {
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearAll: true }),
    });
    setAllCleared(true);
  };

  const isRead = (n: Notification) => n.read || readIds.has(n.id);
  const unreadCount = visibleNotifications.filter((n) => !isRead(n)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
            </Button>
          )}
          {visibleNotifications.length > 0 && (
            <Button variant="outline" onClick={clearAll}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Inbox className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No notifications</p>
            <p className="text-muted-foreground">You&apos;re all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {visibleNotifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Bell;
            return (
              <div
                key={notification.id}
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                  !isRead(notification) && "border-l-4 border-l-primary bg-primary/5"
                )}
                onClick={() => {
                  if (!isRead(notification)) markAsRead(notification.id);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isRead(notification)) markAsRead(notification.id);
                }}
              >
                <div className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  notification.type === "pipeline_failed"
                    ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                    : "bg-primary/10 text-primary"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !isRead(notification) && "font-semibold")}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {notification.message}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => deleteNotification(notification.id, e)}
                    aria-label="Delete notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
