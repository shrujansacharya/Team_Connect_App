import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { logout } from '../utils/auth';

export const Pending = () => {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl p-8 shadow-floating text-center"
        data-testid="pending-approval-screen"
      >
        <div className="mb-6">
          <div className="w-20 h-20 bg-status-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={40} className="text-status-warning" />
          </div>
          <h1 className="text-3xl font-heading text-neutral-800 mb-2">
            Pending Approval
          </h1>
          <p className="text-neutral-800 text-base">
            Your account is awaiting admin approval
          </p>
        </div>

        <div className="bg-status-warning/5 border border-status-warning/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-status-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm text-neutral-800 text-left">
              Your registration has been received. An admin will review and approve your
              account soon. You will be able to access the platform once approved.
            </p>
          </div>
        </div>

        <Button
          onClick={logout}
          data-testid="pending-logout-button"
          className="w-full h-12 bg-accent hover:bg-accent/90 text-white rounded-full font-bold transition-all"
        >
          Logout
        </Button>
      </motion.div>
    </div>
  );
};