import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, X, Home, Calendar, UtensilsCrossed, Settings, LogOut, 
  Plus, Trash2, Edit2, Save, Image, Check, XCircle
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Calendar as CalendarComponent } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { admin, logout, token } = useAuth();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Menu form state
  const [menuForm, setMenuForm] = useState({
    week_start: new Date(),
    week_end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    price_full: 28.90,
    price_entree_plat: 24.90,
    price_plat_dessert: 23.90,
    price_plat_only: 17.90,
    dishes: []
  });

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [menuRes, reservationsRes] = await Promise.all([
        axios.get(`${API}/weekly-menu`),
        axios.get(`${API}/reservations`)
      ]);
      
      if (menuRes.data) {
        setWeeklyMenu(menuRes.data);
        setMenuForm({
          ...menuRes.data,
          week_start: new Date(menuRes.data.week_start),
          week_end: new Date(menuRes.data.week_end)
        });
      }
      
      setReservations(reservationsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const addDish = (category) => {
    const newDish = {
      id: `dish-${Date.now()}`,
      name_fr: '',
      name_en: '',
      name_pt: '',
      description_fr: '',
      description_en: '',
      description_pt: '',
      category,
      image_url: ''
    };
    setMenuForm(prev => ({
      ...prev,
      dishes: [...prev.dishes, newDish]
    }));
  };

  const updateDish = (dishId, field, value) => {
    setMenuForm(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => 
        d.id === dishId ? { ...d, [field]: value } : d
      )
    }));
  };

  const removeDish = (dishId) => {
    setMenuForm(prev => ({
      ...prev,
      dishes: prev.dishes.filter(d => d.id !== dishId)
    }));
  };

  const saveMenu = async () => {
    setSaving(true);
    try {
      const payload = {
        week_start: format(menuForm.week_start, 'yyyy-MM-dd'),
        week_end: format(menuForm.week_end, 'yyyy-MM-dd'),
        price_full: menuForm.price_full,
        price_entree_plat: menuForm.price_entree_plat,
        price_plat_dessert: menuForm.price_plat_dessert,
        price_plat_only: menuForm.price_plat_only,
        dishes: menuForm.dishes
      };

      if (weeklyMenu?.id) {
        await axios.put(`${API}/weekly-menu/${weeklyMenu.id}`, payload);
      } else {
        const response = await axios.post(`${API}/weekly-menu`, payload);
        setWeeklyMenu(response.data);
      }
      
      toast.success('Menu enregistré avec succès!');
      fetchData();
    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const updateReservationStatus = async (id, status) => {
    try {
      await axios.put(`${API}/reservations/${id}/status?status=${status}`);
      toast.success('Statut mis à jour');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteReservation = async (id) => {
    if (!window.confirm('Supprimer cette réservation?')) return;
    try {
      await axios.delete(`${API}/reservations/${id}`);
      toast.success('Réservation supprimée');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const sidebarItems = [
    { id: 'menu', icon: UtensilsCrossed, label: t('admin_weekly_menu') },
    { id: 'reservations', icon: Calendar, label: t('admin_reservations') },
  ];

  const dishCategories = [
    { id: 'meat', label: 'Viande', max: 1 },
    { id: 'vegetarian', label: 'Végétarien', max: 1 },
    { id: 'seafood', label: 'Poisson / Fruits de Mer', max: 1 },
    { id: 'dessert', label: 'Dessert', max: 2 }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex" data-testid="admin-dashboard">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#121212] border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="admin-sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link to="/" className="font-display text-2xl text-white">BÉNI</Link>
            <p className="text-xs uppercase tracking-[0.15em] text-[#d4af37] mt-1">Administration</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  activeTab === item.id 
                    ? 'bg-[#d4af37]/10 text-[#d4af37] border-l-2 border-[#d4af37]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                data-testid={`sidebar-${item.id}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-white/10">
            <p className="text-white/50 text-xs mb-3 truncate">{admin?.email}</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5" />
              {t('admin_logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white p-2"
                data-testid="mobile-sidebar-toggle"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="font-display text-xl text-white">
                {activeTab === 'menu' ? t('admin_weekly_menu') : t('admin_reservations')}
              </h1>
            </div>

            <Link
              to="/"
              className="flex items-center gap-2 text-white/50 text-sm hover:text-[#d4af37] transition-colors"
              data-testid="view-site-link"
            >
              <Home className="w-4 h-4" />
              Voir le site
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-white/50">{t('loading')}</p>
            </div>
          ) : activeTab === 'menu' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
              data-testid="menu-editor"
            >
              {/* Date Range & Prices */}
              <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                <h2 className="text-white text-lg font-medium">Paramètres du Menu</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Week Start */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-[0.15em] text-white/70">Début de semaine</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent border-white/20 text-white h-12"
                          data-testid="week-start-picker"
                        >
                          {format(menuForm.week_start, 'PPP', { locale: fr })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#121212] border-white/10">
                        <CalendarComponent
                          mode="single"
                          selected={menuForm.week_start}
                          onSelect={(date) => date && setMenuForm(prev => ({ ...prev, week_start: date }))}
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Week End */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-[0.15em] text-white/70">Fin de semaine</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent border-white/20 text-white h-12"
                          data-testid="week-end-picker"
                        >
                          {format(menuForm.week_end, 'PPP', { locale: fr })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#121212] border-white/10">
                        <CalendarComponent
                          mode="single"
                          selected={menuForm.week_end}
                          onSelect={(date) => date && setMenuForm(prev => ({ ...prev, week_end: date }))}
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-white/70">Entrée+Plat+Dessert (€)</Label>
                    <Input
                      type="number"
                      step="0.10"
                      value={menuForm.price_full}
                      onChange={(e) => setMenuForm(prev => ({ ...prev, price_full: parseFloat(e.target.value) }))}
                      className="bg-transparent border-white/20 text-white"
                      data-testid="price-full-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/70">Entrée+Plat (€)</Label>
                    <Input
                      type="number"
                      step="0.10"
                      value={menuForm.price_entree_plat}
                      onChange={(e) => setMenuForm(prev => ({ ...prev, price_entree_plat: parseFloat(e.target.value) }))}
                      className="bg-transparent border-white/20 text-white"
                      data-testid="price-entree-plat-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/70">Plat+Dessert (€)</Label>
                    <Input
                      type="number"
                      step="0.10"
                      value={menuForm.price_plat_dessert}
                      onChange={(e) => setMenuForm(prev => ({ ...prev, price_plat_dessert: parseFloat(e.target.value) }))}
                      className="bg-transparent border-white/20 text-white"
                      data-testid="price-plat-dessert-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-white/70">Plat Seul (€)</Label>
                    <Input
                      type="number"
                      step="0.10"
                      value={menuForm.price_plat_only}
                      onChange={(e) => setMenuForm(prev => ({ ...prev, price_plat_only: parseFloat(e.target.value) }))}
                      className="bg-transparent border-white/20 text-white"
                      data-testid="price-plat-only-input"
                    />
                  </div>
                </div>
              </div>

              {/* Dishes by Category */}
              {dishCategories.map(category => {
                const categoryDishes = menuForm.dishes.filter(d => d.category === category.id);
                return (
                  <div key={category.id} className="bg-[#121212] border border-white/10 p-6" data-testid={`category-${category.id}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white text-lg font-medium">{category.label}</h3>
                      {categoryDishes.length < category.max && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addDish(category.id)}
                          className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10"
                          data-testid={`add-${category.id}-btn`}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter
                        </Button>
                      )}
                    </div>

                    {categoryDishes.length === 0 ? (
                      <p className="text-white/30 text-sm">Aucun plat ajouté</p>
                    ) : (
                      <div className="space-y-6">
                        {categoryDishes.map(dish => (
                          <div key={dish.id} className="bg-white/5 p-4 space-y-4" data-testid={`dish-${dish.id}`}>
                            <div className="flex justify-end">
                              <button
                                onClick={() => removeDish(dish.id)}
                                className="text-red-400 hover:text-red-300 p-2"
                                data-testid={`delete-dish-${dish.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-white/70">Nom (FR)</Label>
                                <Input
                                  value={dish.name_fr}
                                  onChange={(e) => updateDish(dish.id, 'name_fr', e.target.value)}
                                  className="bg-transparent border-white/20 text-white"
                                  placeholder="Nom en français"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-white/70">Nom (EN)</Label>
                                <Input
                                  value={dish.name_en}
                                  onChange={(e) => updateDish(dish.id, 'name_en', e.target.value)}
                                  className="bg-transparent border-white/20 text-white"
                                  placeholder="Name in English"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-white/70">Nom (PT)</Label>
                                <Input
                                  value={dish.name_pt}
                                  onChange={(e) => updateDish(dish.id, 'name_pt', e.target.value)}
                                  className="bg-transparent border-white/20 text-white"
                                  placeholder="Nome em português"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-white/70">Description (FR)</Label>
                              <Textarea
                                value={dish.description_fr}
                                onChange={(e) => updateDish(dish.id, 'description_fr', e.target.value)}
                                className="bg-transparent border-white/20 text-white resize-none"
                                rows={2}
                                placeholder="Description en français"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-white/70">URL de l'image</Label>
                              <div className="flex gap-2">
                                <Input
                                  value={dish.image_url}
                                  onChange={(e) => updateDish(dish.id, 'image_url', e.target.value)}
                                  className="bg-transparent border-white/20 text-white flex-1"
                                  placeholder="https://..."
                                />
                                {dish.image_url && (
                                  <img 
                                    src={dish.image_url} 
                                    alt="Preview" 
                                    className="w-12 h-12 object-cover"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={saveMenu}
                  disabled={saving}
                  className="bg-[#d4af37] text-black hover:bg-white px-8"
                  data-testid="save-menu-btn"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Enregistrement...' : 'Enregistrer le Menu'}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
              data-testid="reservations-list"
            >
              {reservations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/50">Aucune réservation</p>
                </div>
              ) : (
                reservations.map(reservation => (
                  <div 
                    key={reservation.id}
                    className="bg-[#121212] border border-white/10 p-6"
                    data-testid={`reservation-${reservation.id}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-white font-medium">{reservation.name}</h3>
                          <span className={`px-2 py-1 text-xs uppercase tracking-wider ${
                            reservation.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            reservation.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {reservation.status}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">
                          {reservation.date} à {reservation.time} · {reservation.guests} personnes
                        </p>
                        <p className="text-white/40 text-sm">
                          {reservation.email} · {reservation.phone}
                        </p>
                        {reservation.notes && (
                          <p className="text-white/30 text-sm italic">{reservation.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {reservation.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-500"
                              data-testid={`confirm-${reservation.id}`}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                              className="border-red-500 text-red-500 hover:bg-red-500/10"
                              data-testid={`cancel-${reservation.id}`}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteReservation(reservation.id)}
                          className="border-white/20 text-white/50 hover:text-red-400 hover:border-red-400"
                          data-testid={`delete-${reservation.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
