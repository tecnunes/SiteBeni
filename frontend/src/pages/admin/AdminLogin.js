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
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        if (!formData.name) {
          toast.error('Veuillez entrer votre nom');
          setLoading(false);
          return;
        }
        await register(formData.email, formData.password, formData.name);
        toast.success('Compte créé avec succès!');
      } else {
        await login(formData.email, formData.password);
        toast.success('Connexion réussie!');
      }
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.detail || 'Erreur d\'authentification');
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
              {isRegister ? t('admin_register') : t('admin_login')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="admin-login-form">
            {isRegister && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] text-white/70">
                  {t('admin_name')}
                </Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  className="h-14 bg-transparent border-white/20 text-white placeholder:text-white/30 focus:border-[#d4af37]"
                  data-testid="name-input"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.15em] text-white/70">
                {t('admin_email')}
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@beni.lu"
                className="h-14 bg-transparent border-white/20 text-white placeholder:text-white/30 focus:border-[#d4af37]"
                data-testid="email-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.15em] text-white/70">
                {t('admin_password')}
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
              {loading ? t('loading') : (isRegister ? t('admin_register') : t('admin_signin'))}
            </Button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-white/50 text-sm hover:text-[#d4af37] transition-colors"
              data-testid="toggle-auth-mode"
            >
              {isRegister ? 'Déjà un compte? Se connecter' : 'Pas de compte? S\'inscrire'}
            </button>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default AdminLogin;
