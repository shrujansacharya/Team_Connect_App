import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle2,
    Users,
    Trophy,
    Calendar,
    Target,
    Menu,
    X,
    ChevronRight,
    Sparkles,
    Heart
} from 'lucide-react';
import { apiClient } from '../utils/auth';
import { Button } from '../components/ui/button';

export const LandingPage = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [config, setConfig] = useState(null);
    const [team, setTeam] = useState([]);
    const [services, setServices] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [slogans, setSlogans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configRes, teamRes, servicesRes, achievementsRes, slogansRes] = await Promise.all([
                    apiClient.get('/landing/config'),
                    apiClient.get('/landing/team'),
                    apiClient.get('/landing/services'),
                    apiClient.get('/achievements'),
                    apiClient.get('/slogans')
                ]);
                setConfig(configRes.data);
                setTeam(teamRes.data);
                setServices(servicesRes.data);
                setAchievements(achievementsRes.data.slice(0, 3)); // Top 3
                setSlogans(slogansRes.data);
            } catch (err) {
                console.error('Failed to fetch landing page data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.1 } }
    };

    if (loading) {
        return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-100">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-orange-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            {config?.logo_url ? (
                                <img src={config.logo_url} alt="Logo" className="h-10 w-10 object-contain" />
                            ) : (
                                <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white font-bold">
                                    JS
                                </div>
                            )}
                            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                Jai Shree Ram
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#about" className="text-slate-600 hover:text-orange-600 transition-colors font-medium">About</a>
                            <a href="#achievements" className="text-slate-600 hover:text-orange-600 transition-colors font-medium">Achievements</a>
                            <a href="#team" className="text-slate-600 hover:text-orange-600 transition-colors font-medium">Team</a>
                            <Button onClick={() => navigate('/login')} className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6">
                                Login
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 p-2">
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden bg-white border-b border-orange-100 overflow-hidden"
                        >
                            <div className="px-4 py-4 space-y-4">
                                <a href="#about" className="block text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>About</a>
                                <a href="#achievements" className="block text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Achievements</a>
                                <a href="#team" className="block text-slate-600 font-medium" onClick={() => setIsMenuOpen(false)}>Team</a>
                                <Button onClick={() => navigate('/login')} className="w-full bg-orange-600 text-white">
                                    Login
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {config?.hero_image_url ? (
                    <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${config.hero_image_url})` }}>
                        <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]"></div>
                    </div>
                ) : (
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100/50 via-white to-white"></div>
                )}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className="space-y-8 flex flex-col items-center"
                    >
                        {/* Prominent Logo in Hero */}
                        <div className="mb-8">
                            {config?.logo_url ? (
                                <img
                                    src={config.logo_url}
                                    alt="Organization Logo"
                                    className="h-32 md:h-48 w-auto object-contain drop-shadow-2xl"
                                />
                            ) : (
                                <div className="h-32 w-32 md:h-40 md:w-40 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl shadow-2xl flex items-center justify-center text-white text-6xl font-bold italic rotate-3">
                                    JS
                                </div>
                            )}
                        </div>

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-sm font-medium">
                            <Sparkles size={16} />
                            <span>United in Faith & Community</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mx-auto max-w-4xl">
                            Jai Shree Ram <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                                Geleyara Balaga
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            {config?.tagline || slogans[0]?.text || "Empowering our community through collective action, cultural heritage, and shared growth."}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button onClick={() => navigate('/login')} className="h-12 px-8 text-lg rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-orange-500/25 transition-all">
                                Get Started
                                <ArrowRight size={18} className="ml-2" />
                            </Button>
                            <Button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })} variant="outline" className="h-12 px-8 text-lg rounded-full border-slate-200 text-slate-700 hover:bg-slate-50">
                                Learn More
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Members', value: config?.member_count_override || '100+', icon: Users },
                            { label: 'Years Active', value: config?.years_experience || '5+', icon: Calendar },
                            { label: 'Impact', value: config?.impact_stats || 'High', icon: Heart },
                            { label: 'Goals', value: 'Unified', icon: Target },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center"
                            >
                                <div className="mx-auto w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-orange-600 mb-4">
                                    <stat.icon size={24} />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About & Services */}
            <section id="about" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 font-heading">
                                {config?.about_title || "About Our Community"}
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                {config?.about_description || "We are a dedicated group of individuals committed to fostering unity, preserving our cultural heritage, and making a positive impact in society through collective action and service."}
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6">
                                {services.length > 0 ? services.map((service, i) => {
                                    const IconComponent = {
                                        Users, Trophy, Calendar, Target, Heart, Sparkles, CheckCircle2, Briefcase
                                    }[service.icon_name] || CheckCircle2;
                                    return (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                                                <IconComponent size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{service.title}</h4>
                                                <p className="text-slate-500 text-sm mt-1">{service.description}</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">Community Support</h4>
                                                <p className="text-slate-500 text-sm mt-1">Helping each other grow.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">Cultural Events</h4>
                                                <p className="text-slate-500 text-sm mt-1">Celebrating our heritage.</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>

                        <div className="relative">
                            <div className="aspect-square rounded-3xl bg-slate-100 overflow-hidden shadow-2xl relative z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1561582239-cf8222955f19?q=80&w=1000&auto=format&fit=crop"
                                    alt="Community"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -z-10"></div>
                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Achievements */}
            <section id="achievements" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-heading">Our Achievements</h2>
                        <p className="text-slate-600">Recognizing the milestones that define our journey and commitment.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {achievements.map((achievement, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className="h-48 bg-slate-200 overflow-hidden relative">
                                    {achievement.image_url ? (
                                        <img src={achievement.image_url} alt={achievement.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <Trophy size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                                        {new Date(achievement.date).getFullYear()}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">{achievement.title}</h3>
                                    <p className="text-slate-600 text-sm line-clamp-3">{achievement.description}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-orange-600 text-sm font-medium">
                                        Read Story <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section id="team" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-heading">Meet The Team</h2>
                        <p className="text-slate-600">The dedicated individuals driving our mission forward.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {team.map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center group"
                            >
                                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 ring-4 ring-slate-50 group-hover:ring-orange-100 transition-all">
                                    {member.image_url ? (
                                        <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <Users size={32} />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                                <p className="text-sm text-orange-600 font-medium">{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded flex items-center justify-center font-bold">
                                    JS
                                </div>
                                <span className="font-bold text-xl">Jai Shree Ram</span>
                            </div>
                            <p className="text-slate-400 max-w-xs">
                                Building a stronger community through unified efforts and shared values.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6">Quick Links</h4>
                            <ul className="space-y-4">
                                <li><a href="#about" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#achievements" className="text-slate-400 hover:text-white transition-colors">Achievements</a></li>
                                <li><a href="#team" className="text-slate-400 hover:text-white transition-colors">Our Team</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="text-slate-400 hover:text-white transition-colors">Login</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6">Contact</h4>
                            <ul className="space-y-4 text-slate-400">
                                <li>{config?.contact_email || "contact@example.com"}</li>
                                <li>Bangalore, Karnataka</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                        © {new Date().getFullYear()} Jai Shree Ram Geleyara Balaga. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};
