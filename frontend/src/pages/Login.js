import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import axios from 'axios';
import { setToken, setUser } from '../utils/auth';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Login = () => {
  const navigate = useNavigate();
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isAdminLogin ? '/auth/admin-login' : '/auth/login';
      const payload = isAdminLogin
        ? { password: formData.password }
        : { email: formData.email, password: formData.password };

      const response = await axios.post(`${API}${endpoint}`, payload);
      const { access_token, user } = response.data;

      setToken(access_token);
      setUser(user);
      toast.success('Login successful!');

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.is_approved) {
        navigate('/home');
      } else {
        navigate('/pending');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1730680297749-000b7dd4d87e?crop=entropy&cs=srgb&fm=jpg&q=85")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h1 className="text-5xl font-heading mb-4">Jai Shree Ram</h1>
            <p className="text-xl font-body">Geleyara Balaga</p>
            <p className="text-lg mt-4 opacity-90">Community. Unity. Celebration.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-secondary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="md:hidden text-center mb-8">
            <h1 className="text-4xl font-heading text-primary mb-2">Jai Shree Ram</h1>
            <p className="text-lg text-neutral-800">Geleyara Balaga</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-card">
            <h2 className="text-2xl font-heading mb-6 text-center text-neutral-800">
              {isAdminLogin ? 'Admin Login' : 'Welcome Back'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isAdminLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-800">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    data-testid="login-email-input"
                    className="h-12"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-800">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    data-testid="login-password-input"
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-800"
                    data-testid="toggle-password-visibility"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                data-testid="login-submit-button"
                className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-full font-bold text-base shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setIsAdminLogin(!isAdminLogin)}
                data-testid="toggle-admin-login"
                className="w-full flex items-center justify-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
              >
                <Lock size={16} />
                {isAdminLogin ? 'User Login' : 'Login as Admin'}
              </button>

              {!isAdminLogin && (
                <p className="text-center text-sm text-neutral-800">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    data-testid="register-link"
                    className="text-primary font-medium hover:underline"
                  >
                    Register here
                  </Link>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};