import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CheckCircle, Calendar, TrendingUp, CreditCard, Smartphone, ShieldCheck, X } from 'lucide-react';
import { MobileNav } from '../components/MobileNav';
import { apiClient, getUser } from '../utils/auth';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

export const Savings = () => {
  const [savingsData, setSavingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);
  const [amount, setAmount] = useState(100);

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const fetchSavingsData = async () => {
    try {
      const [savingsRes, configRes] = await Promise.all([
        apiClient.get('/savings/current'),
        apiClient.get('/landing/config')
      ]);
      setSavingsData(savingsRes.data);
      setSiteConfig(configRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const verifyPaymentOnBackend = async (response) => {
    try {
      setPaying(true);
      await apiClient.post('/savings/verify-payment', {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
      });
      toast.success(`Payment verified! ₹${amount} contributed successfully.`);
      setShowPaymentModal(false);
      fetchSavingsData();
    } catch (error) {
      toast.error('Payment verification failed. If amount was debited, please contact admin.');
    } finally {
      setPaying(false);
    }
  };

  const handleFinalPayment = async () => {
    if (!siteConfig?.razorpay_key_id) {
      toast.error('Payment gateway not configured by Admin');
      return;
    }

    setPaying(true);
    try {
      // 1. Create Order on Backend
      const orderRes = await apiClient.post('/savings/create-order', { amount });
      const order = orderRes.data;

      const user = getUser();

      // 2. Open Razorpay Checkout
      const options = {
        key: siteConfig.razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        name: siteConfig.merchant_name || 'Jai Shree Ram Geleyara Balaga',
        description: `Savings Contribution - ${savingsData?.month_name}`,
        order_id: order.id,
        handler: async (response) => {
          await verifyPaymentOnBackend(response);
        },
        prefill: {
          name: user?.full_name || '',
          email: user?.email || 'user@example.com',
          contact: user?.phone || '9999999999'
        },
        notes: {
          address: 'Community Savings'
        },
        theme: {
          color: '#EA580C' // orange-600
        },
        modal: {
          ondismiss: () => setPaying(false)
        }
      };

      // Specific UPI logic if a method was chosen in our UI
      if (selectedMethod && selectedMethod !== 'razorpay') {
        options.config = {
          display: {
            blocks: {
              upi: {
                name: 'UPI Apps',
                instruments: [
                  {
                    method: 'upi',
                    apps: [selectedMethod] // gpay, phonepe, etc.
                  }
                ]
              }
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: false
            }
          }
        };
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error(response.error);
        toast.error(`Payment Failed: ${response.error.description}. ${response.error.reason}`);
        setPaying(false);
      });

      toast.promise(Promise.resolve(rzp.open()), {
        loading: 'Redirecting to secure gateway...',
        success: 'Gateway opened. Please complete the transaction in your UPI app.',
        error: 'Could not open payment gateway.'
      });

    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to initiate payment. Please try again.');
      setPaying(false);
    }
  };

  const paymentMethods = [
    { id: 'google_pay', name: 'Google Pay', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'phonepe', name: 'PhonePe', icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'paytm', name: 'Paytm App', icon: Smartphone, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { id: 'razorpay', name: 'All UPI Apps', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const amounts = [100, 200, 500];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium font-sans">Syncing savings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-28 font-sans">
      <div className="bg-gradient-to-br from-orange-600 to-amber-600 p-8 md:p-12 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
            <Wallet size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Monthly Savings</h1>
        </div>
        <p className="text-orange-50/90 text-lg max-w-xl">
          Support Geleyara Balaga by contributing your monthly savings. Your support drives community progress.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-orange-100 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                <Calendar size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {savingsData?.month_name} {savingsData?.year}
                </h2>
                <p className="text-slate-500 font-medium uppercase tracking-wider text-xs">Current Billing Cycle</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl px-6 py-4 border border-slate-100 flex items-center gap-6 w-full md:w-auto">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Contribution</p>
                <p className="text-3xl font-black text-slate-900 leading-none">₹{savingsData?.has_paid ? (savingsData.payment?.amount || 100) : '-'}</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="flex flex-col items-start">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Status</p>
                {savingsData?.has_paid ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm text-[10px] uppercase tracking-tighter">
                    <CheckCircle size={14} /> Completed
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-orange-500 font-bold text-sm text-[10px] uppercase tracking-tighter">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Pending
                  </div>
                )}
              </div>
            </div>
          </div>

          {!savingsData?.has_paid && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`h-24 rounded-2xl border-2 font-bold transition-all flex flex-col items-center justify-center gap-1 ${amount === amt
                      ? 'border-orange-500 bg-orange-50 text-orange-600'
                      : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <span className="text-[10px] uppercase tracking-widest opacity-60 font-black">Plan</span>
                    <span className="text-2xl">₹{amt}</span>
                  </button>
                ))}
              </div>

              <Button
                onClick={() => setShowPaymentModal(true)}
                className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
              >
                Continue to Pay ₹{amount}
              </Button>
            </div>
          )}

          {savingsData?.has_paid && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 text-emerald-100 group-hover:scale-110 transition-transform">
                <ShieldCheck size={160} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 text-lg">Contribution Successful</h4>
                    <p className="text-emerald-700/80 text-sm">Verified via {savingsData.payment?.method || 'UPI Link'}.</p>
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-emerald-200/50">
                  <p className="text-emerald-900 font-mono text-sm mb-1">
                    TXN: <span className="font-bold">{savingsData?.payment?.transaction_id?.slice(0, 18)}...</span>
                  </p>
                  <p className="text-emerald-700 text-xs">
                    Completed on {new Date(savingsData?.payment?.payment_date || Date.now()).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-orange-500" /> Community Reach
            </h3>
            <ul className="space-y-4">
              {[
                { t: 'Festival Support', d: 'Fund religious and cultural events.' },
                { t: 'Social Welfare', d: 'Aid members in times of need.' },
                { t: 'Infrastructure', d: 'Improve community facilities.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{item.t}</p>
                    <p className="text-slate-500 text-xs">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full" />
            <div className="relative z-10">
              <ShieldCheck className="text-orange-500 mb-4" size={40} />
              <h3 className="text-lg font-bold mb-2">Secure Payments</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                All contributions are tracked and fully transparent. Your support builds a legacy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Selection Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-3xl border-none">
          <div className="bg-slate-50 p-6 md:p-8 flex flex-col items-center">
            <div className="w-12 h-1 bg-slate-200 rounded-full mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-1">Select Payment</h3>
            <p className="text-slate-500 text-sm mb-8">Amount to pay: <span className="text-slate-900 font-bold">₹{amount}</span></p>

            <div className="grid gap-3 w-full">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedMethod === method.id
                    ? 'border-orange-500 bg-orange-50/50'
                    : 'border-white bg-white hover:border-slate-100 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${method.bg} flex items-center justify-center ${method.color}`}>
                      <method.icon size={24} />
                    </div>
                    <span className="font-bold text-slate-800">{method.name}</span>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white">
                      <CheckCircle size={14} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button
              disabled={!selectedMethod || paying}
              onClick={handleFinalPayment}
              className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl mt-8 font-bold text-lg transition-all"
            >
              {paying ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : `Pay ₹${amount}`}
            </Button>

            <p className="mt-6 text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1">
              <ShieldCheck size={12} /> SSL Secure & Encrypted
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <MobileNav />
    </div>
  );
};