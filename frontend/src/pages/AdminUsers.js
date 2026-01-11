import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Trash2, Users, Mail, Phone } from 'lucide-react';
import { MobileNav } from '../components/MobileNav';
import { apiClient } from '../utils/auth';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await apiClient.put(`/users/${userId}/approve`);
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      await apiClient.delete(`/users/${deleteUserId}`);
      toast.success('User deleted successfully');
      fetchUsers();
      setDeleteUserId(null);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const pendingUsers = users.filter((u) => !u.is_approved);
  const approvedUsers = users.filter((u) => u.is_approved);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <p className="text-neutral-800">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary pb-28">
      <div className="bg-gradient-to-br from-primary to-accent p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-heading text-white mb-2">User Management</h1>
        <p className="text-white/90">Approve and manage community members</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {pendingUsers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-heading text-neutral-800 mb-4 flex items-center gap-2">
              <Users size={24} className="text-status-warning" />
              Pending Approvals ({pendingUsers.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="pending-users-list">
              {pendingUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-6 shadow-card border-l-4 border-l-status-warning"
                  data-testid={`pending-user-${index}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-status-warning/10 text-status-warning font-bold">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-neutral-800">{user.full_name}</h3>
                        <span className="text-xs bg-status-warning/10 text-status-warning px-2 py-1 rounded-full font-medium">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-neutral-800">
                      <Mail size={14} className="text-primary" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-800">
                      <Phone size={14} className="text-primary" />
                      <span>{user.phone}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(user.id)}
                      data-testid={`approve-user-${index}`}
                      className="flex-1 bg-status-success hover:bg-status-success/90 text-white rounded-full font-medium h-10"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => setDeleteUserId(user.id)}
                      data-testid={`delete-pending-user-${index}`}
                      variant="outline"
                      className="px-3 rounded-full border-accent text-accent hover:bg-accent/5"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-heading text-neutral-800 mb-4 flex items-center gap-2">
            <CheckCircle size={24} className="text-status-success" />
            Approved Members ({approvedUsers.length})
          </h2>
          {approvedUsers.length === 0 ? (
            <p className="text-center py-8 text-neutral-800" data-testid="no-approved-users">
              No approved members yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="approved-users-list">
              {approvedUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white rounded-xl p-4 shadow-card hover:shadow-floating transition-all"
                  data-testid={`approved-user-${index}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-status-success/10 text-status-success font-bold text-sm">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-sm text-neutral-800">{user.full_name}</h3>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteUserId(user.id)}
                      data-testid={`delete-approved-user-${index}`}
                      className="text-accent hover:bg-accent/5 p-1 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-neutral-800">
                    <div className="flex items-center gap-1 truncate">
                      <Mail size={12} className="text-primary flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone size={12} className="text-primary flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-user">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              data-testid="confirm-delete-user"
              className="bg-accent hover:bg-accent/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileNav />
    </div>
  );
};