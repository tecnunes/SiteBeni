import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, X, Home, Calendar, UtensilsCrossed, Settings, LogOut, 
  Plus, Trash2, Save, Image, Check, XCircle, FileText, BookOpen, Users
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Calendar as CalendarComponent } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import ImageUpload from '../../components/ImageUpload';
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
  const [activeTab, setActiveTab] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data states
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [siteContent, setSiteContent] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });

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
      const [menuRes, reservationsRes, menuItemsRes, contentRes, settingsRes, adminsRes] = await Promise.all([
        axios.get(`${API}/weekly-menu`),
        axios.get(`${API}/reservations`),
        axios.get(`${API}/menu-items`),
        axios.get(`${API}/content`),
        axios.get(`${API}/settings`),
        axios.get(`${API}/auth/admins`)
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
      setMenuItems(menuItemsRes.data || []);
      setSiteContent(contentRes.data || {});
      setSiteSettings(settingsRes.data || {});
      setAdmins(adminsRes.data || []);
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

  // Weekly Menu Functions
  const addDish = (category) => {
    const newDish = {
      id: `dish-${Date.now()}`,
      name_fr: '', name_en: '', name_pt: '',
      description_fr: '', description_en: '', description_pt: '',
      category,
      image_url: ''
    };
    setMenuForm(prev => ({ ...prev, dishes: [...prev.dishes, newDish] }));
  };

  const updateDish = (dishId, field, value) => {
    setMenuForm(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === dishId ? { ...d, [field]: value } : d)
    }));
  };

  const removeDish = (dishId) => {
    setMenuForm(prev => ({ ...prev, dishes: prev.dishes.filter(d => d.id !== dishId) }));
  };

  const saveWeeklyMenu = async () => {
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
      
      toast.success('Menu enregistré!');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  // Menu Items (Cardápio) Functions
  const addMenuItem = (category) => {
    const newItem = {
      id: `new-${Date.now()}`,
      category,
      name_fr: '', name_en: '', name_pt: '',
      description_fr: '', description_en: '', description_pt: '',
      price: 0,
      image_url: '',
      is_available: true,
      sort_order: menuItems.filter(i => i.category === category).length,
      isNew: true
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  const updateMenuItem = (itemId, field, value) => {
    setMenuItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ));
  };

  const saveMenuItem = async (item) => {
    setSaving(true);
    try {
      const payload = {
        category: item.category,
        name_fr: item.name_fr,
        name_en: item.name_en,
        name_pt: item.name_pt,
        description_fr: item.description_fr || '',
        description_en: item.description_en || '',
        description_pt: item.description_pt || '',
        price: parseFloat(item.price) || 0,
        image_url: item.image_url || '',
        is_available: item.is_available !== false,
        sort_order: item.sort_order || 0
      };

      if (item.isNew) {
        await axios.post(`${API}/menu-items`, payload);
      } else {
        await axios.put(`${API}/menu-items/${item.id}`, payload);
      }
      
      toast.success('Item sauvegardé!');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const deleteMenuItem = async (itemId, isNew) => {
    if (isNew) {
      setMenuItems(prev => prev.filter(i => i.id !== itemId));
      return;
    }
    if (!window.confirm('Supprimer cet item?')) return;
    try {
      await axios.delete(`${API}/menu-items/${itemId}`);
      toast.success('Item supprimé');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Site Content Functions
  const saveSiteContent = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/content`, siteContent);
      toast.success('Contenu sauvegardé!');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Site Settings Functions
  const saveSiteSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, siteSettings);
      toast.success('Paramètres sauvegardés!');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Reservations Functions
  const updateReservationStatus = async (id, status) => {
    try {
      await axios.put(`${API}/reservations/${id}/status?status=${status}`);
      toast.success('Statut mis à jour');
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const deleteReservation = async (id) => {
    if (!window.confirm('Supprimer cette réservation?')) return;
    try {
      await axios.delete(`${API}/reservations/${id}`);
      toast.success('Réservation supprimée');
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  // Admin Users Functions
  const createAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API}/auth/register`, newAdmin);
      toast.success('Administrateur créé!');
      setNewAdmin({ name: '', email: '', password: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const deleteAdmin = async (adminId) => {
    if (!window.confirm('Supprimer cet administrateur?')) return;
    try {
      await axios.delete(`${API}/auth/admins/${adminId}`);
      toast.success('Administrateur supprimé');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const sidebarItems = [
    { id: 'weekly', icon: UtensilsCrossed, label: 'Menu Semaine' },
    { id: 'cardapio', icon: BookOpen, label: 'Cardápio Completo' },
    { id: 'content', icon: FileText, label: 'Textes du Site' },
    { id: 'images', icon: Image, label: 'Images du Site' },
    { id: 'settings', icon: Settings, label: 'Paramètres' },
    { id: 'reservations', icon: Calendar, label: 'Réservations' },
    { id: 'users', icon: Users, label: 'Utilisateurs' },
  ];

  const dishCategories = [
    { id: 'meat', label: 'Viande', max: 1 },
    { id: 'vegetarian', label: 'Végétarien', max: 1 },
    { id: 'seafood', label: 'Poisson / Fruits de Mer', max: 1 },
    { id: 'dessert', label: 'Dessert', max: 2 }
  ];

  const menuCategories = [
    { id: 'starters', label: 'Entrées' },
    { id: 'mains', label: 'Plats Principaux' },
    { id: 'seafood', label: 'Poissons & Fruits de Mer' },
    { id: 'desserts', label: 'Desserts' },
    { id: 'drinks', label: 'Boissons' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex" data-testid="admin-dashboard">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#121212] border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <Link to="/" className="font-display text-2xl text-white">BÉNI</Link>
            <p className="text-xs uppercase tracking-[0.15em] text-[#d4af37] mt-1">Administration</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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

          <div className="p-4 border-t border-white/10">
            <p className="text-white/50 text-xs mb-3 truncate">{admin?.email}</p>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors">
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-white p-2">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="font-display text-xl text-white">
                {sidebarItems.find(i => i.id === activeTab)?.label}
              </h1>
            </div>
            <Link to="/" className="flex items-center gap-2 text-white/50 text-sm hover:text-[#d4af37] transition-colors">
              <Home className="w-4 h-4" />
              Voir le site
            </Link>
          </div>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12"><p className="text-white/50">Chargement...</p></div>
          ) : (
            <>
              {/* Weekly Menu Tab */}
              {activeTab === 'weekly' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium">Paramètres du Menu</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-[0.15em] text-white/70">Début de semaine</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start bg-transparent border-white/20 text-white h-12">
                              {format(menuForm.week_start, 'PPP', { locale: fr })}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#121212] border-white/10">
                            <CalendarComponent mode="single" selected={menuForm.week_start} onSelect={(date) => date && setMenuForm(prev => ({ ...prev, week_start: date }))} locale={fr} />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-[0.15em] text-white/70">Fin de semaine</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start bg-transparent border-white/20 text-white h-12">
                              {format(menuForm.week_end, 'PPP', { locale: fr })}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#121212] border-white/10">
                            <CalendarComponent mode="single" selected={menuForm.week_end} onSelect={(date) => date && setMenuForm(prev => ({ ...prev, week_end: date }))} locale={fr} />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Entrée+Plat+Dessert (€)</Label>
                        <Input type="number" step="0.10" value={menuForm.price_full} onChange={(e) => setMenuForm(prev => ({ ...prev, price_full: parseFloat(e.target.value) }))} className="bg-transparent border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Entrée+Plat (€)</Label>
                        <Input type="number" step="0.10" value={menuForm.price_entree_plat} onChange={(e) => setMenuForm(prev => ({ ...prev, price_entree_plat: parseFloat(e.target.value) }))} className="bg-transparent border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Plat+Dessert (€)</Label>
                        <Input type="number" step="0.10" value={menuForm.price_plat_dessert} onChange={(e) => setMenuForm(prev => ({ ...prev, price_plat_dessert: parseFloat(e.target.value) }))} className="bg-transparent border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Plat Seul (€)</Label>
                        <Input type="number" step="0.10" value={menuForm.price_plat_only} onChange={(e) => setMenuForm(prev => ({ ...prev, price_plat_only: parseFloat(e.target.value) }))} className="bg-transparent border-white/20 text-white" />
                      </div>
                    </div>
                  </div>

                  {dishCategories.map(category => {
                    const categoryDishes = menuForm.dishes.filter(d => d.category === category.id);
                    return (
                      <div key={category.id} className="bg-[#121212] border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-white text-lg font-medium">{category.label}</h3>
                          {categoryDishes.length < category.max && (
                            <Button variant="outline" size="sm" onClick={() => addDish(category.id)} className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10">
                              <Plus className="w-4 h-4 mr-2" />Ajouter
                            </Button>
                          )}
                        </div>
                        {categoryDishes.length === 0 ? (
                          <p className="text-white/30 text-sm">Aucun plat ajouté</p>
                        ) : (
                          <div className="space-y-6">
                            {categoryDishes.map(dish => (
                              <div key={dish.id} className="bg-white/5 p-4 space-y-4">
                                <div className="flex justify-end">
                                  <button onClick={() => removeDish(dish.id)} className="text-red-400 hover:text-red-300 p-2">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Input value={dish.name_fr} onChange={(e) => updateDish(dish.id, 'name_fr', e.target.value)} className="bg-transparent border-white/20 text-white" placeholder="Nom (FR)" />
                                  <Input value={dish.name_en} onChange={(e) => updateDish(dish.id, 'name_en', e.target.value)} className="bg-transparent border-white/20 text-white" placeholder="Name (EN)" />
                                  <Input value={dish.name_pt} onChange={(e) => updateDish(dish.id, 'name_pt', e.target.value)} className="bg-transparent border-white/20 text-white" placeholder="Nome (PT)" />
                                </div>
                                <Textarea value={dish.description_fr} onChange={(e) => updateDish(dish.id, 'description_fr', e.target.value)} className="bg-transparent border-white/20 text-white resize-none" rows={2} placeholder="Description (FR)" />
                                <ImageUpload value={dish.image_url} onChange={(url) => updateDish(dish.id, 'image_url', url)} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex justify-end">
                    <Button onClick={saveWeeklyMenu} disabled={saving} className="bg-[#d4af37] text-black hover:bg-white px-8">
                      <Save className="w-4 h-4 mr-2" />{saving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Cardápio Completo Tab */}
              {activeTab === 'cardapio' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <Tabs defaultValue="starters" className="w-full">
                    <TabsList className="bg-[#121212] border border-white/10 p-1 mb-6">
                      {menuCategories.map(cat => (
                        <TabsTrigger key={cat.id} value={cat.id} className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-black">
                          {cat.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {menuCategories.map(category => (
                      <TabsContent key={category.id} value={category.id} className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-white text-lg">{category.label}</h3>
                          <Button onClick={() => addMenuItem(category.id)} className="bg-[#d4af37] text-black hover:bg-white">
                            <Plus className="w-4 h-4 mr-2" />Ajouter
                          </Button>
                        </div>

                        {menuItems.filter(item => item.category === category.id).map(item => (
                          <div key={item.id} className="bg-[#121212] border border-white/10 p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <Input value={item.name_fr} onChange={(e) => updateMenuItem(item.id, 'name_fr', e.target.value)} className="bg-transparent border-white/20 text-white" placeholder="Nom (FR)" />
                              <Input value={item.name_en} onChange={(e) => updateMenuItem(item.id, 'name_en', e.target.value)} className="bg-transparent border-white/20 text-white" placeholder="Name (EN)" />
                              <Input value={item.name_pt} onChange={(e) => updateMenuItem(item.id, 'name_pt', e.target.value)} className="bg-transparent border-white/20 text-white" placeholder="Nome (PT)" />
                              <Input type="number" step="0.01" value={item.price} onChange={(e) => updateMenuItem(item.id, 'price', e.target.value)} className="bg-transparent border-white/20 text-white" placeholder="Prix (€)" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Input value={item.description_fr || ''} onChange={(e) => updateMenuItem(item.id, 'description_fr', e.target.value)} className="bg-transparent border-white/20 text-white" placeholder="Description (FR)" />
                              <Input value={item.description_en || ''} onChange={(e) => updateMenuItem(item.id, 'description_en', e.target.value)} className="bg-transparent border-white/20 text-white" placeholder="Description (EN)" />
                              <Input value={item.description_pt || ''} onChange={(e) => updateMenuItem(item.id, 'description_pt', e.target.value)} className="bg-transparent border-white/20 text-white" placeholder="Descrição (PT)" />
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <ImageUpload value={item.image_url || ''} onChange={(url) => updateMenuItem(item.id, 'image_url', url)} />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => deleteMenuItem(item.id, item.isNew)} className="border-red-500 text-red-500 hover:bg-red-500/10">
                                <Trash2 className="w-4 h-4 mr-2" />Supprimer
                              </Button>
                              <Button onClick={() => saveMenuItem(item)} disabled={saving} className="bg-[#d4af37] text-black hover:bg-white">
                                <Save className="w-4 h-4 mr-2" />Sauvegarder
                              </Button>
                            </div>
                          </div>
                        ))}

                        {menuItems.filter(item => item.category === category.id).length === 0 && (
                          <p className="text-white/30 text-center py-8">Aucun item dans cette catégorie</p>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
                </motion.div>
              )}

              {/* Site Content (Texts) Tab */}
              {activeTab === 'content' && siteContent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Section Hero</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Sous-titre (FR)</Label>
                        <Input value={siteContent.hero_subtitle_fr || ''} onChange={(e) => setSiteContent({...siteContent, hero_subtitle_fr: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Subtitle (EN)</Label>
                        <Input value={siteContent.hero_subtitle_en || ''} onChange={(e) => setSiteContent({...siteContent, hero_subtitle_en: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Subtítulo (PT)</Label>
                        <Input value={siteContent.hero_subtitle_pt || ''} onChange={(e) => setSiteContent({...siteContent, hero_subtitle_pt: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Section À Propos</h2>
                    <div className="space-y-2">
                      <Label className="text-xs text-white/70">Nom du Chef</Label>
                      <Input value={siteContent.chef_name || ''} onChange={(e) => setSiteContent({...siteContent, chef_name: e.target.value})} className="bg-transparent border-white/20 text-white" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Titre (FR)</Label>
                        <Input value={siteContent.about_title_fr || ''} onChange={(e) => setSiteContent({...siteContent, about_title_fr: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Title (EN)</Label>
                        <Input value={siteContent.about_title_en || ''} onChange={(e) => setSiteContent({...siteContent, about_title_en: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Título (PT)</Label>
                        <Input value={siteContent.about_title_pt || ''} onChange={(e) => setSiteContent({...siteContent, about_title_pt: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-white/70">Texte (FR)</Label>
                      <Textarea value={siteContent.about_text_fr || ''} onChange={(e) => setSiteContent({...siteContent, about_text_fr: e.target.value})} className="bg-transparent border-white/20 text-white resize-none" rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-white/70">Text (EN)</Label>
                      <Textarea value={siteContent.about_text_en || ''} onChange={(e) => setSiteContent({...siteContent, about_text_en: e.target.value})} className="bg-transparent border-white/20 text-white resize-none" rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-white/70">Texto (PT)</Label>
                      <Textarea value={siteContent.about_text_pt || ''} onChange={(e) => setSiteContent({...siteContent, about_text_pt: e.target.value})} className="bg-transparent border-white/20 text-white resize-none" rows={3} />
                    </div>
                  </div>

                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Citation</h2>
                    <div className="space-y-2">
                      <Label className="text-xs text-white/70">Citation (FR)</Label>
                      <Textarea value={siteContent.about_quote_fr || ''} onChange={(e) => setSiteContent({...siteContent, about_quote_fr: e.target.value})} className="bg-transparent border-white/20 text-white resize-none" rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-white/70">Quote (EN)</Label>
                      <Textarea value={siteContent.about_quote_en || ''} onChange={(e) => setSiteContent({...siteContent, about_quote_en: e.target.value})} className="bg-transparent border-white/20 text-white resize-none" rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-white/70">Citação (PT)</Label>
                      <Textarea value={siteContent.about_quote_pt || ''} onChange={(e) => setSiteContent({...siteContent, about_quote_pt: e.target.value})} className="bg-transparent border-white/20 text-white resize-none" rows={2} />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveSiteContent} disabled={saving} className="bg-[#d4af37] text-black hover:bg-white px-8">
                      <Save className="w-4 h-4 mr-2" />{saving ? 'Enregistrement...' : 'Enregistrer les Textes'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Site Images Tab */}
              {activeTab === 'images' && siteContent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Image Hero (Page d'accueil)</h2>
                    <ImageUpload value={siteContent.hero_image || ''} onChange={(url) => setSiteContent({...siteContent, hero_image: url})} />
                  </div>

                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Image du Chef</h2>
                    <ImageUpload value={siteContent.chef_image || ''} onChange={(url) => setSiteContent({...siteContent, chef_image: url})} />
                  </div>

                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Images Section À Propos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-xs text-white/70 mb-2 block">Image 1</Label>
                        <ImageUpload value={siteContent.about_image_1 || ''} onChange={(url) => setSiteContent({...siteContent, about_image_1: url})} />
                      </div>
                      <div>
                        <Label className="text-xs text-white/70 mb-2 block">Image 2</Label>
                        <ImageUpload value={siteContent.about_image_2 || ''} onChange={(url) => setSiteContent({...siteContent, about_image_2: url})} />
                      </div>
                      <div>
                        <Label className="text-xs text-white/70 mb-2 block">Image 3</Label>
                        <ImageUpload value={siteContent.about_image_3 || ''} onChange={(url) => setSiteContent({...siteContent, about_image_3: url})} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Image Fond Réservations</h2>
                    <ImageUpload value={siteContent.reservation_bg_image || ''} onChange={(url) => setSiteContent({...siteContent, reservation_bg_image: url})} />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveSiteContent} disabled={saving} className="bg-[#d4af37] text-black hover:bg-white px-8">
                      <Save className="w-4 h-4 mr-2" />{saving ? 'Enregistrement...' : 'Enregistrer les Images'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && siteSettings && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Informations Générales</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Nom du Restaurant</Label>
                        <Input value={siteSettings.restaurant_name || ''} onChange={(e) => setSiteSettings({...siteSettings, restaurant_name: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Adresse</Label>
                        <Input value={siteSettings.address || ''} onChange={(e) => setSiteSettings({...siteSettings, address: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Téléphone</Label>
                        <Input value={siteSettings.phone || ''} onChange={(e) => setSiteSettings({...siteSettings, phone: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Email</Label>
                        <Input value={siteSettings.email || ''} onChange={(e) => setSiteSettings({...siteSettings, email: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Slogan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Slogan (FR)</Label>
                        <Input value={siteSettings.tagline_fr || ''} onChange={(e) => setSiteSettings({...siteSettings, tagline_fr: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Tagline (EN)</Label>
                        <Input value={siteSettings.tagline_en || ''} onChange={(e) => setSiteSettings({...siteSettings, tagline_en: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Slogan (PT)</Label>
                        <Input value={siteSettings.tagline_pt || ''} onChange={(e) => setSiteSettings({...siteSettings, tagline_pt: e.target.value})} className="bg-transparent border-white/20 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Horaires</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Horaires (FR)</Label>
                        <Textarea value={siteSettings.hours_fr || ''} onChange={(e) => setSiteSettings({...siteSettings, hours_fr: e.target.value})} className="bg-transparent border-white/20 text-white resize-none" rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Hours (EN)</Label>
                        <Textarea value={siteSettings.hours_en || ''} onChange={(e) => setSiteSettings({...siteSettings, hours_en: e.target.value})} className="bg-transparent border-white/20 text-white resize-none" rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Horários (PT)</Label>
                        <Textarea value={siteSettings.hours_pt || ''} onChange={(e) => setSiteSettings({...siteSettings, hours_pt: e.target.value})} className="bg-transparent border-white/20 text-white resize-none" rows={2} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={saveSiteSettings} disabled={saving} className="bg-[#d4af37] text-black hover:bg-white px-8">
                      <Save className="w-4 h-4 mr-2" />{saving ? 'Enregistrement...' : 'Enregistrer les Paramètres'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Reservations Tab */}
              {activeTab === 'reservations' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {reservations.length === 0 ? (
                    <div className="text-center py-12"><p className="text-white/50">Aucune réservation</p></div>
                  ) : (
                    reservations.map(reservation => (
                      <div key={reservation.id} className="bg-[#121212] border border-white/10 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-white font-medium">{reservation.name}</h3>
                              <span className={`px-2 py-1 text-xs uppercase tracking-wider ${
                                reservation.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                reservation.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>{reservation.status}</span>
                            </div>
                            <p className="text-white/60 text-sm">{reservation.date} à {reservation.time} · {reservation.guests} personnes</p>
                            <p className="text-white/40 text-sm">{reservation.email} · {reservation.phone}</p>
                            {reservation.notes && <p className="text-white/30 text-sm italic">{reservation.notes}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            {reservation.status === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => updateReservationStatus(reservation.id, 'confirmed')} className="bg-green-600 hover:bg-green-500">
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => updateReservationStatus(reservation.id, 'cancelled')} className="border-red-500 text-red-500 hover:bg-red-500/10">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" onClick={() => deleteReservation(reservation.id)} className="border-white/20 text-white/50 hover:text-red-400 hover:border-red-400">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  {/* Create New Admin */}
                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Créer un Administrateur</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Nom</Label>
                        <Input
                          value={newAdmin.name}
                          onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                          className="bg-transparent border-white/20 text-white"
                          placeholder="Nom complet"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Identifiant</Label>
                        <Input
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                          className="bg-transparent border-white/20 text-white"
                          placeholder="Identifiant de connexion"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-white/70">Mot de passe</Label>
                        <Input
                          type="password"
                          value={newAdmin.password}
                          onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                          className="bg-transparent border-white/20 text-white"
                          placeholder="Mot de passe sécurisé"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={createAdmin} disabled={saving} className="bg-[#d4af37] text-black hover:bg-white">
                        <Plus className="w-4 h-4 mr-2" />Créer
                      </Button>
                    </div>
                  </div>

                  {/* List of Admins */}
                  <div className="bg-[#121212] border border-white/10 p-6 space-y-4">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Administrateurs ({admins.length})</h2>
                    {admins.map(adminUser => (
                      <div key={adminUser.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10">
                        <div>
                          <p className="text-white font-medium">{adminUser.name}</p>
                          <p className="text-white/50 text-sm">{adminUser.email}</p>
                          <p className="text-white/30 text-xs">Créé le {new Date(adminUser.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        {adminUser.id !== admin?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAdmin(adminUser.id)}
                            className="border-red-500 text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        {adminUser.id === admin?.id && (
                          <span className="text-xs text-[#d4af37] uppercase tracking-wider">Vous</span>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
