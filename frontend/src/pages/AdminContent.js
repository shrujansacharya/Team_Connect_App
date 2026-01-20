import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  Trophy,
  MessageSquare,
  Calendar,
  Layout,
  Users,
  Settings,
  Briefcase,
  Save,
  Image as ImageIcon
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export const AdminContent = () => {
  const [slogans, setSlogans] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [team, setTeam] = useState([]);
  const [services, setServices] = useState([]);
  const [config, setConfig] = useState({
    logo_url: '',
    hero_image_url: '',
    banner_url: '',
    tagline: '',
    about_title: '',
    about_description: '',
    member_count_override: 0,
    years_experience: 0,
    impact_stats: '',
    contact_email: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [showSloganDialog, setShowSloganDialog] = useState(false);
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);

  // Form states
  const [sloganText, setSloganText] = useState('');
  const [achievementData, setAchievementData] = useState({ title: '', description: '', date: '', image_url: '' });
  const [teamData, setTeamData] = useState({ name: '', role: '', image_url: '' });
  const [serviceData, setServiceData] = useState({ title: '', description: '', icon_name: 'CheckCircle2' });

  const fetchContent = useCallback(async () => {
    try {
      const [slogansRes, achievementsRes, teamRes, servicesRes, configRes] = await Promise.all([
        apiClient.get('/slogans'),
        apiClient.get('/achievements'),
        apiClient.get('/landing/team'),
        apiClient.get('/landing/services'),
        apiClient.get('/landing/config')
      ]);
      setSlogans(slogansRes.data);
      setAchievements(achievementsRes.data);
      setTeam(teamRes.data);
      setServices(servicesRes.data);
      setConfig(prev => ({
        ...prev,
        ...configRes.data
      }));
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleUpdateConfig = async () => {
    setSaving(true);
    try {
      await apiClient.put('/landing/config', config);
      toast.success('Site configuration updated');
    } catch (error) {
      toast.error('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  // Slogan handlers
  const handleCreateSlogan = async () => {
    if (!sloganText.trim()) return toast.error('Enter slogan text');
    try {
      await apiClient.post('/slogans', { text: sloganText, order: slogans.length });
      toast.success('Slogan created');
      setSloganText('');
      setShowSloganDialog(false);
      fetchContent();
    } catch (error) { toast.error('Failed to create slogan'); }
  };

  const handleDeleteSlogan = async (id) => {
    try {
      await apiClient.delete(`/slogans/${id}`);
      toast.success('Slogan deleted');
      fetchContent();
    } catch (error) { toast.error('Failed to delete slogan'); }
  };

  // Achievement handlers
  const handleCreateAchievement = async () => {
    if (!achievementData.title || !achievementData.description) return toast.error('Fill required fields');
    try {
      await apiClient.post('/achievements', { ...achievementData, date: new Date(achievementData.date || Date.now()).toISOString() });
      toast.success('Achievement created');
      setAchievementData({ title: '', description: '', date: '', image_url: '' });
      setShowAchievementDialog(false);
      fetchContent();
    } catch (error) { toast.error('Failed to create achievement'); }
  };

  const handleDeleteAchievement = async (id) => {
    try {
      await apiClient.delete(`/achievements/${id}`);
      fetchContent();
    } catch (error) { toast.error('Error deleting achievement'); }
  };

  // Team handlers
  const handleCreateTeamMember = async () => {
    if (!teamData.name || !teamData.role) return toast.error('Name and Role are required');
    try {
      await apiClient.post('/landing/team', teamData);
      toast.success('Team member added');
      setTeamData({ name: '', role: '', image_url: '' });
      setShowTeamDialog(false);
      fetchContent();
    } catch (error) { toast.error('Failed to add team member'); }
  };

  const handleDeleteTeamMember = async (id) => {
    try {
      await apiClient.delete(`/landing/team/${id}`);
      fetchContent();
    } catch (error) { toast.error('Error deleting team member'); }
  };

  // Service handlers
  const handleCreateService = async () => {
    if (!serviceData.title || !serviceData.description) return toast.error('Title and Description are required');
    try {
      await apiClient.post('/landing/services', serviceData);
      toast.success('Service added');
      setServiceData({ title: '', description: '', icon_name: 'CheckCircle2' });
      setShowServiceDialog(false);
      fetchContent();
    } catch (error) { toast.error('Failed to add service'); }
  };

  const handleDeleteService = async (id) => {
    try {
      await apiClient.delete(`/landing/services/${id}`);
      fetchContent();
    } catch (error) { toast.error('Error deleting service'); }
  };

  if (loading) return <div className="min-h-screen bg-secondary flex items-center justify-center font-sans">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans">
      <div className="bg-gradient-to-br from-orange-600 to-amber-600 p-8 md:p-12 text-white shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Content Management</h1>
        <p className="text-orange-50/90 text-lg">Customize your landing page and app content</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <Tabs defaultValue="general" className="w-full space-y-8">
          <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white flex gap-2">
              <Settings size={18} /> General
            </TabsTrigger>
            <TabsTrigger value="sections" className="rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white flex gap-2">
              <Layout size={18} /> Sections
            </TabsTrigger>
            <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white flex gap-2">
              <Users size={18} /> Team
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white flex gap-2">
              <Trophy size={18} /> Slogans & More
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Logo URL</label>
                  <Input
                    value={config.logo_url || ''}
                    onChange={e => setConfig({ ...config, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Hero Image URL</label>
                  <Input
                    value={config.hero_image_url || ''}
                    onChange={e => setConfig({ ...config, hero_image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Banner URL</label>
                  <Input
                    value={config.banner_url || ''}
                    onChange={e => setConfig({ ...config, banner_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tagline</label>
                  <Input
                    value={config.tagline || ''}
                    onChange={e => setConfig({ ...config, tagline: e.target.value })}
                    placeholder="Premium Tagline"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">About Title</label>
                  <Input
                    value={config.about_title || ''}
                    onChange={e => setConfig({ ...config, about_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Contact Email</label>
                  <Input
                    value={config.contact_email || ''}
                    onChange={e => setConfig({ ...config, contact_email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">About Description</label>
                <Textarea
                  value={config.about_description || ''}
                  onChange={e => setConfig({ ...config, about_description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Stats & Payments</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Member Count Override</label>
                    <Input
                      type="number"
                      value={config.member_count_override || 0}
                      onChange={e => setConfig({ ...config, member_count_override: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Years Active</label>
                    <Input
                      type="number"
                      value={config.years_experience || 0}
                      onChange={e => setConfig({ ...config, years_experience: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Impact Stats</label>
                    <Input
                      value={config.impact_stats || ''}
                      onChange={e => setConfig({ ...config, impact_stats: e.target.value })}
                      placeholder="e.g. 1000+ Students"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">UPI ID</label>
                    <Input
                      value={config.upi_id || ''}
                      onChange={e => setConfig({ ...config, upi_id: e.target.value })}
                      placeholder="example@upi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Merchant Name</label>
                    <Input
                      value={config.merchant_name || ''}
                      onChange={e => setConfig({ ...config, merchant_name: e.target.value })}
                      placeholder="Organization Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Razorpay Key ID</label>
                    <Input
                      value={config.razorpay_key_id || ''}
                      onChange={e => setConfig({ ...config, razorpay_key_id: e.target.value })}
                      placeholder="rzp_test_..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleUpdateConfig}
                  disabled={saving}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 h-12 shadow-lg hover:shadow-orange-200 transition-all font-bold"
                >
                  {saving ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Changes</>}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sections" className="space-y-8">
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Briefcase className="text-orange-600" />
                  <h2 className="text-xl font-bold text-slate-800">Services ({services.length})</h2>
                </div>
                <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full h-10 px-4"><Plus size={16} className="mr-1" /> Add Service</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add New Service</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input placeholder="Service Title" value={serviceData.title} onChange={e => setServiceData({ ...serviceData, title: e.target.value })} />
                      <Textarea placeholder="Service Description" value={serviceData.description} onChange={e => setServiceData({ ...serviceData, description: e.target.value })} rows={3} />
                      <Button onClick={handleCreateService} className="w-full bg-orange-600 text-white rounded-full h-12">Add Service</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service, i) => (
                  <div key={service.id} className="p-4 border border-slate-100 rounded-xl relative group hover:border-orange-200 transition-colors">
                    <h4 className="font-bold text-slate-800">{service.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2">{service.description}</p>
                    <button onClick={() => handleDeleteService(service.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="team" className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <Users className="text-orange-600" />
                  <h2 className="text-xl font-bold text-slate-800">Core Team ({team.length})</h2>
                </div>
                <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full h-10 px-4"><Plus size={16} className="mr-1" /> Add Member</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input placeholder="Full Name" value={teamData.name} onChange={e => setTeamData({ ...teamData, name: e.target.value })} />
                      <Input placeholder="Role (e.g. Founder)" value={teamData.role} onChange={e => setTeamData({ ...teamData, role: e.target.value })} />
                      <Input placeholder="Image URL (optional)" value={teamData.image_url} onChange={e => setTeamData({ ...teamData, image_url: e.target.value })} />
                      <Button onClick={handleCreateTeamMember} className="w-full bg-orange-600 text-white rounded-full h-12">Add Member</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {team.map((member, i) => (
                  <div key={member.id} className="text-center p-4 border border-slate-100 rounded-2xl relative group hover:shadow-md transition-all">
                    <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 mb-3 overflow-hidden border-2 border-slate-50">
                      {member.image_url ? <img src={member.image_url} alt="" className="w-full h-full object-cover" /> : <Users className="w-full h-full p-6 text-slate-300" />}
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{member.name}</h4>
                    <p className="text-xs text-orange-600 font-medium">{member.role}</p>
                    <button onClick={() => handleDeleteTeamMember(member.id)} className="absolute -top-2 -right-2 bg-white shadow-md text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="grid lg:grid-cols-2 gap-8">
            {/* Slogans */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><MessageSquare className="text-orange-600" /> Slogans</h2>
                <Dialog open={showSloganDialog} onOpenChange={setShowSloganDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-orange-600 text-white rounded-full"><Plus size={16} /></Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>New Slogan</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <Textarea value={sloganText} onChange={e => setSloganText(e.target.value)} rows={4} />
                      <Button onClick={handleCreateSlogan} className="w-full bg-orange-600 text-white rounded-full h-12">Create Slogan</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-3">
                {slogans.map(s => (
                  <div key={s.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center group">
                    <p className="text-sm text-slate-700">{s.text}</p>
                    <button onClick={() => handleDeleteSlogan(s.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Trophy className="text-orange-600" /> Achievements</h2>
                <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-orange-600 text-white rounded-full"><Plus size={16} /></Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>New Achievement</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input placeholder="Title" value={achievementData.title} onChange={e => setAchievementData({ ...achievementData, title: e.target.value })} />
                      <Textarea placeholder="Description" value={achievementData.description} onChange={e => setAchievementData({ ...achievementData, description: e.target.value })} rows={3} />
                      <Input type="date" value={achievementData.date} onChange={e => setAchievementData({ ...achievementData, date: e.target.value })} />
                      <Input placeholder="Image URL" value={achievementData.image_url} onChange={e => setAchievementData({ ...achievementData, image_url: e.target.value })} />
                      <Button onClick={handleCreateAchievement} className="w-full bg-orange-600 text-white rounded-full h-12">Create</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid gap-4">
                {achievements.map(a => (
                  <div key={a.id} className="flex gap-4 p-3 border border-slate-100 rounded-xl relative group">
                    {a.image_url && <img src={a.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{a.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{a.description}</p>
                    </div>
                    <button onClick={() => handleDeleteAchievement(a.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
};