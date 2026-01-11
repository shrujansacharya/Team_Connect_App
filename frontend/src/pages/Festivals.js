import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PartyPopper, Plus, Calendar, IndianRupee, TrendingDown } from 'lucide-react';
import { MobileNav } from '../components/MobileNav';
import { apiClient, getUser } from '../utils/auth';
import { toast } from 'sonner';

export const Festivals = () => {
  const [festivals, setFestivals] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchFestivals();
  }, []);

  useEffect(() => {
    if (selectedFestival) {
      fetchExpenses(selectedFestival.id);
    }
  }, [selectedFestival]);

  const fetchFestivals = async () => {
    try {
      const response = await apiClient.get('/festivals');
      setFestivals(response.data);
      if (response.data.length > 0) {
        setSelectedFestival(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load festivals');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (festivalId) => {
    try {
      const response = await apiClient.get(`/festivals/${festivalId}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      toast.error('Failed to load expenses');
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = selectedFestival
    ? selectedFestival.total_budget - totalExpenses
    : 0;

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
        <h1 className="text-3xl md:text-4xl font-heading text-white mb-2">Festivals</h1>
        <p className="text-white/90">Celebrate together, manage efficiently</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {festivals.length === 0 ? (
          <div className="text-center py-12" data-testid="no-festivals">
            <PartyPopper size={48} className="text-neutral-800 mx-auto mb-4" />
            <p className="text-neutral-800 text-lg">No festivals added yet</p>
            {isAdmin && (
              <p className="text-neutral-800 text-sm mt-2">
                Use the admin panel to create festivals
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex gap-3 overflow-x-auto pb-3" data-testid="festival-tabs">
                {festivals.map((festival) => (
                  <button
                    key={festival.id}
                    onClick={() => setSelectedFestival(festival)}
                    data-testid={`festival-tab-${festival.id}`}
                    className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${
                      selectedFestival?.id === festival.id
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-white text-neutral-800 hover:bg-primary/10'
                    }`}
                  >
                    {festival.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedFestival && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-card mb-6"
                  data-testid="festival-details"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-heading text-neutral-800 mb-2">
                        {selectedFestival.name}
                      </h2>
                      <p className="text-neutral-800">{selectedFestival.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-neutral-800">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>
                            {new Date(selectedFestival.start_date).toLocaleDateString()} -{' '}
                            {new Date(selectedFestival.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-secondary rounded-xl p-4">
                      <p className="text-sm text-neutral-800 mb-1">Total Budget</p>
                      <p className="text-2xl font-bold text-neutral-800 flex items-center gap-1">
                        <IndianRupee size={20} />
                        {selectedFestival.total_budget.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-accent/5 rounded-xl p-4">
                      <p className="text-sm text-neutral-800 mb-1">Total Spent</p>
                      <p className="text-2xl font-bold text-accent flex items-center gap-1">
                        <TrendingDown size={20} />
                        {totalExpenses.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-status-success/10 rounded-xl p-4">
                      <p className="text-sm text-neutral-800 mb-1">Remaining</p>
                      <p className="text-2xl font-bold text-status-success flex items-center gap-1">
                        <IndianRupee size={20} />
                        {remainingBudget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-card"
                >
                  <h3 className="text-xl font-heading text-neutral-800 mb-4">Expenses</h3>
                  {expenses.length === 0 ? (
                    <p className="text-center py-8 text-neutral-800" data-testid="no-expenses">
                      No expenses recorded yet
                    </p>
                  ) : (
                    <div className="space-y-3" data-testid="expenses-list">
                      {expenses.map((expense, index) => (
                        <div
                          key={expense.id}
                          data-testid={`expense-item-${index}`}
                          className="bg-secondary rounded-xl p-4 border-l-4 border-l-primary flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-neutral-800">{expense.name}</p>
                            <p className="text-sm text-neutral-800">
                              {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-xl font-bold text-accent flex items-center gap-1">
                            <IndianRupee size={18} />
                            {expense.amount.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </>
        )}
      </div>

      <MobileNav />
    </div>
  );
};