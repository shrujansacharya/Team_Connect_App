import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Trophy, MessageSquare, Calendar } from 'lucide-react';
import { MobileNav } from '../components/MobileNav';
import { apiClient } from '../utils/auth';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

export const AdminContent = () => {
  const [slogans, setSlogans] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSloganDialog, setShowSloganDialog] = useState(false);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [sloganText, setSloganText] = useState('');
  const [achievementData, setAchievementData] = useState({
    title: '',
    description: '',
    date: '',
    image_url: '',
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [slogansRes, achievementsRes] = await Promise.all([
        apiClient.get('/slogans'),
        apiClient.get('/achievements'),
      ]);
      setSlogans(slogansRes.data);
      setAchievements(achievementsRes.data);
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlogan = async () => {
    if (!sloganText.trim()) {
      toast.error('Please enter slogan text');
      return;
    }
    try {
      await apiClient.post('/slogans', {
        text: sloganText,
        order: slogans.length,
      });
      toast.success('Slogan created successfully');
      setSloganText('');
      setShowSloganDialog(false);
      fetchContent();
    } catch (error) {
      toast.error('Failed to create slogan');
    }
  };

  const handleDeleteSlogan = async (id) => {
    try {
      await apiClient.delete(`/slogans/${id}`);
      toast.success('Slogan deleted successfully');
      fetchContent();
    } catch (error) {
      toast.error('Failed to delete slogan');
    }
  };

  const handleCreateAchievement = async () => {
    if (!achievementData.title || !achievementData.description || !achievementData.date) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await apiClient.post('/achievements', {
        ...achievementData,
        date: new Date(achievementData.date).toISOString(),
      });
      toast.success('Achievement created successfully');
      setAchievementData({ title: '', description: '', date: '', image_url: '' });
      setShowAchievementDialog(false);
      fetchContent();
    } catch (error) {
      toast.error('Failed to create achievement');
    }
  };

  const handleDeleteAchievement = async (id) => {
    try {
      await apiClient.delete(`/achievements/${id}`);
      toast.success('Achievement deleted successfully');
      fetchContent();
    } catch (error) {
      toast.error('Failed to delete achievement');
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
        <h1 className="text-3xl md:text-4xl font-heading text-white mb-2">Content Management</h1>
        <p className="text-white/90">Manage home page slogans and achievements</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading text-neutral-800 flex items-center gap-2">
              <MessageSquare size={24} className="text-primary" />
              Slogans ({slogans.length})
            </h2>
            <Dialog open={showSloganDialog} onOpenChange={setShowSloganDialog}>
              <DialogTrigger asChild>
                <Button
                  data-testid="add-slogan-button"
                  className="bg-primary hover:bg-primary-hover text-white rounded-full font-medium h-10 px-4"
                >
                  <Plus size={16} className="mr-1" />
                  Add Slogan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Slogan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea
                    placeholder="Enter slogan text..."
                    value={sloganText}
                    onChange={(e) => setSloganText(e.target.value)}
                    data-testid="slogan-text-input"
                    rows={4}
                  />
                  <Button
                    onClick={handleCreateSlogan}
                    data-testid="create-slogan-button"
                    className="w-full bg-primary hover:bg-primary-hover text-white rounded-full font-medium h-12"
                  >
                    Create Slogan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {slogans.length === 0 ? (
            <p className="text-center py-8 text-neutral-800" data-testid="no-slogans">No slogans added yet</p>
          ) : (
            <div className="grid grid-cols-1 gap-3" data-testid="slogans-list">
              {slogans.map((slogan, index) => (
                <motion.div
                  key={slogan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow-card flex justify-between items-center"
                  data-testid={`slogan-item-${index}`}
                >
                  <p className="text-neutral-800 flex-1">{slogan.text}</p>
                  <button
                    onClick={() => handleDeleteSlogan(slogan.id)}
                    data-testid={`delete-slogan-${index}`}
                    className="text-accent hover:bg-accent/5 p-2 rounded transition-colors ml-4"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading text-neutral-800 flex items-center gap-2">
              <Trophy size={24} className="text-primary" />
              Achievements ({achievements.length})
            </h2>
            <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
              <DialogTrigger asChild>
                <Button
                  data-testid="add-achievement-button"
                  className="bg-primary hover:bg-primary-hover text-white rounded-full font-medium h-10 px-4"
                >
                  <Plus size={16} className="mr-1" />
                  Add Achievement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Achievement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-800">Title</label>
                    <Input
                      placeholder="Achievement title"
                      value={achievementData.title}
                      onChange={(e) =>
                        setAchievementData({ ...achievementData, title: e.target.value })
                      }
                      data-testid="achievement-title-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-800">Description</label>
                    <Textarea
                      placeholder="Achievement description"
                      value={achievementData.description}
                      onChange={(e) =>
                        setAchievementData({ ...achievementData, description: e.target.value })
                      }
                      data-testid="achievement-description-input"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-800">Date</label>
                    <Input
                      type="date"
                      value={achievementData.date}
                      onChange={(e) =>
                        setAchievementData({ ...achievementData, date: e.target.value })
                      }
                      data-testid="achievement-date-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-800">
                      Image URL (optional)
                    </label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={achievementData.image_url}
                      onChange={(e) =>
                        setAchievementData({ ...achievementData, image_url: e.target.value })
                      }
                      data-testid="achievement-image-input"
                    />
                  </div>
                  <Button
                    onClick={handleCreateAchievement}
                    data-testid="create-achievement-button"
                    className="w-full bg-primary hover:bg-primary-hover text-white rounded-full font-medium h-12"
                  >
                    Create Achievement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {achievements.length === 0 ? (
            <p className="text-center py-8 text-neutral-800" data-testid="no-achievements">No achievements added yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="achievements-list">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 shadow-card"
                  data-testid={`achievement-item-${index}`}
                >
                  {achievement.image_url && (
                    <img
                      src={achievement.image_url}
                      alt={achievement.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-neutral-800 mb-1">{achievement.title}</h3>
                      <p className="text-sm text-neutral-800 mb-2">{achievement.description}</p>
                      <div className="flex items-center gap-1 text-xs text-neutral-800">
                        <Calendar size={12} />
                        <span>{new Date(achievement.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAchievement(achievement.id)}
                      data-testid={`delete-achievement-${index}`}
                      className="text-accent hover:bg-accent/5 p-2 rounded transition-colors ml-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
};