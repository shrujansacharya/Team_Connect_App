import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { MobileNav } from '../components/MobileNav';
import { apiClient } from '../utils/auth';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/savings/analytics');
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <p className="text-neutral-800">Loading...</p>
      </div>
    );
  }

  const stats = [
    {
      icon: Users,
      label: 'Total Members',
      value: analytics?.total_members || 0,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: CheckCircle,
      label: 'Paid This Month',
      value: analytics?.paid_count || 0,
      color: 'text-status-success',
      bgColor: 'bg-status-success/10',
    },
    {
      icon: XCircle,
      label: 'Unpaid This Month',
      value: analytics?.unpaid_count || 0,
      color: 'text-status-pending',
      bgColor: 'bg-status-pending/10',
    },
    {
      icon: DollarSign,
      label: 'Collected This Month',
      value: `₹${analytics?.total_collected_this_month || 0}`,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: TrendingUp,
      label: 'Total This Year',
      value: `₹${analytics?.total_collected_this_year || 0}`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div className="min-h-screen bg-secondary pb-28">
      <div className="bg-gradient-to-br from-primary to-accent p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-heading text-white mb-2">Admin Dashboard</h1>
        <p className="text-white/90">Manage your community effectively</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-heading text-neutral-800 mb-4">
            {analytics?.month_name} Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="admin-stats">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-floating transition-all"
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <stat.icon className={stat.color} size={28} />
                </div>
                <div>
                  <p className="text-sm text-neutral-800">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-800">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-card"
          >
            <h3 className="text-lg font-heading text-neutral-800 mb-4">Payment Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-800">Collection Rate</span>
                  <span className="font-medium text-neutral-800">
                    {analytics?.total_members > 0
                      ? Math.round((analytics.paid_count / analytics.total_members) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all"
                    style={{
                      width: `${
                        analytics?.total_members > 0
                          ? (analytics.paid_count / analytics.total_members) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-white shadow-floating"
          >
            <h3 className="text-lg font-heading mb-2">Quick Actions</h3>
            <p className="text-sm opacity-90 mb-4">
              Manage users, content, and monitor activities
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => (window.location.href = '/admin/users')}
                data-testid="quick-action-users"
                className="bg-white text-primary hover:bg-white/90 rounded-full font-medium"
              >
                Manage Users
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
};