import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users as UsersIcon, Wallet, PartyPopper } from 'lucide-react';
import { MobileNav } from '../components/MobileNav';
import { apiClient } from '../utils/auth';
import { toast } from 'sonner';

export const Home = () => {
  const [slogans, setSlogans] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [currentSlogan, setCurrentSlogan] = useState(0);

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    if (slogans.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlogan((prev) => (prev + 1) % slogans.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [slogans]);

  const fetchContent = async () => {
    try {
      const [slogansRes, achievementsRes] = await Promise.all([
        apiClient.get('/slogans'),
        apiClient.get('/achievements'),
      ]);
      setSlogans(slogansRes.data.length > 0 ? slogansRes.data : [{ text: 'Jai Shree Ram Geleyara Balaga - United in Faith, Strong in Community' }]);
      setAchievements(achievementsRes.data.slice(0, 3));
    } catch (error) {
      toast.error('Failed to load content');
    }
  };

  const stats = [
    { icon: UsersIcon, label: 'Members', value: '100+', color: 'text-primary' },
    { icon: Wallet, label: 'Monthly Savings', value: '₹100', color: 'text-status-success' },
    { icon: PartyPopper, label: 'Festivals', value: 'Active', color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen bg-secondary pb-28">
      <div
        className="relative h-64 md:h-80 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1730680297749-000b7dd4d87e?crop=entropy&cs=srgb&fm=jpg&q=85")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/70 flex items-center justify-center">
          <motion.div
            key={currentSlogan}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center text-white px-6"
            data-testid="hero-slogan"
          >
            <h1 className="text-3xl md:text-5xl font-heading mb-4">Jai Shree Ram</h1>
            <p className="text-base md:text-xl font-body max-w-2xl mx-auto">
              {slogans[currentSlogan]?.text}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-floating transition-all"
              data-testid={`stat-card-${stat.label.toLowerCase().replace(' ', '-')}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-${stat.color}/10 flex items-center justify-center`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-800">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-800">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {achievements.length > 0 && (
          <div data-testid="achievements-section">
            <h2 className="text-2xl font-heading text-neutral-800 mb-4">Recent Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-card hover:shadow-floating transition-all"
                  data-testid={`achievement-card-${index}`}
                >
                  {achievement.image_url && (
                    <img
                      src={achievement.image_url}
                      alt={achievement.title}
                      className="w-full h-40 object-cover rounded-xl mb-4"
                    />
                  )}
                  <div className="flex items-start gap-2 mb-2">
                    <TrendingUp size={20} className="text-primary flex-shrink-0 mt-1" />
                    <h3 className="text-lg font-bold text-neutral-800">{achievement.title}</h3>
                  </div>
                  <p className="text-sm text-neutral-800">{achievement.description}</p>
                  <p className="text-xs text-neutral-800 mt-2">
                    {new Date(achievement.date).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-gradient-to-br from-primary to-accent rounded-2xl p-8 text-white shadow-floating" data-testid="donation-cta">
          <h2 className="text-2xl font-heading mb-2">Support Our Community</h2>
          <p className="mb-4 opacity-90">
            Your contributions help us organize festivals and community events
          </p>
          <button className="bg-white text-primary px-6 py-3 rounded-full font-bold hover:bg-white/90 transition-all shadow-lg">
            Learn More
          </button>
        </div>
      </div>

      <MobileNav />
    </div>
  );
};