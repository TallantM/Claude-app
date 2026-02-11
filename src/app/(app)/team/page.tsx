"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Shield,
  Code,
  Eye,
  TestTube,
  FolderKanban,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";

interface TeamUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  image: string | null;
}

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: "Admin", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: Shield },
  project_manager: { label: "Project Manager", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", icon: FolderKanban },
  developer: { label: "Developer", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Code },
  tester: { label: "Tester", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: TestTube },
  viewer: { label: "Viewer", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", icon: Eye },
};

const avatarColors = [
  "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-red-500",
];

export default function TeamPage() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("developer");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((data) => setUsers(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!inviteName || !inviteEmail) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, password: "changeme123" }),
      });
      if (res.ok) {
        setDialogOpen(false);
        setInviteName("");
        setInviteEmail("");
        const refreshed = await fetch("/api/team").then((r) => r.json());
        setUsers(refreshed.data || []);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    developers: users.filter((u) => u.role === "developer").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and roles</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Members", value: stats.total, icon: Users },
          { label: "Admins", value: stats.admins, icon: Shield },
          { label: "Developers", value: stats.developers, icon: Code },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{loading ? "-" : stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No team members yet</p>
            <p className="text-muted-foreground">Invite your first team member to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {users.map((user, idx) => {
            const rc = roleConfig[user.role] || roleConfig.viewer;
            return (
              <Card key={user.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <Avatar className={`h-16 w-16 ${avatarColors[idx % avatarColors.length]}`}>
                    <AvatarFallback className="text-lg font-bold text-white bg-transparent">
                      {user.name ? getInitials(user.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-3 font-semibold">{user.name || "Unknown"}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge className={`mt-2 ${rc.color}`}>{rc.label}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inv-name">Full Name</Label>
              <Input id="inv-name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-email">Email</Label>
              <Input id="inv-email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                  <SelectItem value="tester">Tester</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
