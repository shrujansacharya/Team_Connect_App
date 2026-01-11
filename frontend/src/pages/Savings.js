import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { MobileNav } from '../components/MobileNav';
import { apiClient } from '../utils/auth';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';

export const Savings = () => {
  const [savingsData, setSavingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const fetchSavingsData = async () => {
    try {
      const response = await apiClient.get('/savings/current');
      setSavingsData(response.data);
    } catch (error) {
      toast.error('Failed to load savings data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      const response = await apiClient.post('/savings/pay');
      toast.success('Payment successful! Thank you for your contribution.');
      fetchSavingsData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

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
        <h1 className="text-3xl md:text-4xl font-heading text-white mb-2">Monthly Savings</h1>
        <p className="text-white/90">Contribute ₹100 every month to support our community</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-floating mb-6"
          data-testid="current-month-card"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar size={32} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-heading text-neutral-800">
                {savingsData?.month_name} {savingsData?.year}
              </h2>
              <p className="text-neutral-800">Current Month</p>
            </div>
          </div>

          <div className="bg-secondary rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-neutral-800 font-medium">Monthly Contribution</span>
              <span className="text-3xl font-bold text-primary">₹100</span>
            </div>
            <div className="flex items-center gap-2">
              {savingsData?.has_paid ? (
                <>
                  <CheckCircle size={20} className="text-status-success" />
                  <span className="text-status-success font-medium">Payment Completed</span>
                </>
              ) : (
                <>
                  <Wallet size={20} className="text-status-pending" />
                  <span className="text-status-pending font-medium">Payment Pending</span>
                </>
              )}
            </div>
          </div>

          {savingsData?.has_paid ? (
            <div
              className="bg-status-success/10 border border-status-success/20 rounded-xl p-4"
              data-testid="payment-success-message"
            >
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-status-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-status-success mb-1">Thank you for your contribution!</p>
                  <p className="text-sm text-neutral-800">
                    Transaction ID:{' '}
                    <span className="font-mono font-medium">
                      {savingsData?.payment?.transaction_id}
                    </span>
                  </p>
                  <p className="text-xs text-neutral-800 mt-1">
                    Paid on: {new Date(savingsData?.payment?.payment_date).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={handlePayment}
              disabled={paying}
              data-testid="pay-savings-button"
              className="w-full h-14 bg-primary hover:bg-primary-hover text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {paying ? 'Processing...' : 'Pay ₹100 Now'}
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-card"
        >
          <h3 className="text-xl font-heading text-neutral-800 mb-4">Why Contribute?</h3>
          <div className="space-y-3">
            {[
              'Support community festivals and celebrations',
              'Help organize religious and cultural events',
              'Maintain community infrastructure',
              'Build a stronger, united community',
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <TrendingUp size={20} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-neutral-800">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
};