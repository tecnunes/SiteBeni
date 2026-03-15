import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const AdminLogin = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Connexion réussie!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.detail || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6" data-testid="admin-login-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/50 text-sm hover:text-[#d4af37] transition-colors mb-8"
          data-testid="back-to-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au site
        </Link>

        {/* Card */}
        <div className="bg-[#121212] border border-white/10 p-8 md:p-12">
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl text-white mb-2">BÉNI</h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
              Administration
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="admin-login-form">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.15em] text-white/70">
                Identifiant
              </Label>
              <Input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin"
                className="h-14 bg-transparent border-white/20 text-white placeholder:text-white/30 focus:border-[#d4af37]"
                data-testid="email-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.15em] text-white/70">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-14 bg-transparent border-white/20 text-white placeholder:text-white/30 focus:border-[#d4af37] pr-12"
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#d4af37] text-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-all duration-300 disabled:opacity-50"
              data-testid="submit-btn"
            >
              {loading ? 'Connexion...' : 'Se Connecter'}
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
};

export default AdminLogin;
