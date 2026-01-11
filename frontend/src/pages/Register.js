import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/auth/register`, formData);
      toast.success('Registration successful! Waiting for admin approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
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
            'url("https://images.unsplash.com/photo-1582990523136-6be67a5d605b?crop=entropy&cs=srgb&fm=jpg&q=85")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h1 className="text-5xl font-heading mb-4">Join Our Community</h1>
            <p className="text-xl font-body">Jai Shree Ram Geleyara Balaga</p>
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
            <h1 className="text-4xl font-heading text-primary mb-2">Join Us</h1>
            <p className="text-lg text-neutral-800">Geleyara Balaga</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-card">
            <h2 className="text-2xl font-heading mb-6 text-center text-neutral-800">
              Create Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-800">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                  data-testid="register-name-input"
                  className="h-12"
                />
              </div>

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
                  data-testid="register-email-input"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-800">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+91 1234567890"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  data-testid="register-phone-input"
                  className="h-12"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-800">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    data-testid="register-password-input"
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-800"
                    data-testid="toggle-register-password"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                data-testid="register-submit-button"
                className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-full font-bold text-base shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-800">
              Already have an account?{' '}
              <Link
                to="/login"
                data-testid="login-link"
                className="text-primary font-medium hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};