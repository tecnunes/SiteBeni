import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, X, Home, Calendar, UtensilsCrossed, Settings, LogOut, 
  Plus, Trash2, Save, Image, Check, XCircle, FileText, BookOpen, Users, Images,
  GripVertical, Edit2, FolderPlus, PartyPopper, Copy, ExternalLink
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
const SITE_URL = process.env.REACT_APP_BACKEND_URL?.replace('/api', '') || window.location.origin;

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
  const [menuCategories, setMenuCategories] = useState([]);
  const [siteContent, setSiteContent] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [events, setEvents] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [newCategory, setNewCategory] = useState({ slug: '', name_fr: '', name_en: '', name_pt: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', num_guests: 10, organizer_name: '', organizer_email: '', organizer_whatsapp: '', organizer_password: '' });

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
      const [menuRes, reservationsRes, menuItemsRes, categoriesRes, contentRes, settingsRes, adminsRes, galleryRes, eventsRes] = await Promise.all([
        axios.get(`${API}/weekly-menu`),
        axios.get(`${API}/reservations`),
        axios.get(`${API}/menu-items`),
        axios.get(`${API}/menu-categories`),
        axios.get(`${API}/content`),
        axios.get(`${API}/settings`),
        axios.get(`${API}/auth/admins`),
        axios.get(`${API}/gallery`),
        axios.get(`${API}/events`)
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
      setMenuCategories(categoriesRes.data || []);
      setSiteContent(contentRes.data || {});
      setSiteSettings(settingsRes.data || {});
      setAdmins(adminsRes.data || []);
      setGalleryImages(galleryRes.data || []);
      setEvents(eventsRes.data || []);
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

  // Gallery Functions
  const addGalleryImage = (category) => {
    const newImage = {
      id: `new-${Date.now()}`,
      url: '',
      category,
      alt_fr: '',
      alt_en: '',
      alt_pt: '',
      sort_order: galleryImages.filter(i => i.category === category).length,
      isNew: true
    };
    setGalleryImages(prev => [...prev, newImage]);
  };

  const updateGalleryImage = (imageId, field, value) => {
    setGalleryImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, [field]: value } : img
    ));
  };

  const saveGalleryImage = async (image) => {
    if (!image.url) {
      toast.error('Veuillez ajouter une image');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        url: image.url,
        category: image.category,
        alt_fr: image.alt_fr || '',
        alt_en: image.alt_en || '',
        alt_pt: image.alt_pt || '',
        sort_order: image.sort_order || 0
      };

      if (image.isNew) {
        await axios.post(`${API}/gallery`, payload);
      } else {
        await axios.put(`${API}/gallery/${image.id}`, payload);
      }
      
      toast.success('Image sauvegardée!');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const deleteGalleryImage = async (imageId, isNew) => {
    if (isNew) {
      setGalleryImages(prev => prev.filter(i => i.id !== imageId));
      return;
    }
    if (!window.confirm('Supprimer cette image?')) return;
    try {
      await axios.delete(`${API}/gallery/${imageId}`);
      toast.success('Image supprimée');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Menu Categories Functions
  const createCategory = async () => {
    if (!newCategory.slug || !newCategory.name_fr) {
      toast.error('Veuillez remplir le slug et le nom français');
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API}/menu-categories`, {
        ...newCategory,
        sort_order: menuCategories.length
      });
      toast.success('Catégorie créée!');
      setNewCategory({ slug: '', name_fr: '', name_en: '', name_pt: '' });
      setShowCategoryForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = async (category) => {
    setSaving(true);
    try {
      await axios.put(`${API}/menu-categories/${category.id}`, {
        slug: category.slug,
        name_fr: category.name_fr,
        name_en: category.name_en,
        name_pt: category.name_pt,
        sort_order: category.sort_order,
        is_active: category.is_active
      });
      toast.success('Catégorie mise à jour!');
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Supprimer cette catégorie? Les items de cette catégorie doivent être supprimés ou déplacés avant.')) return;
    try {
      await axios.delete(`${API}/menu-categories/${categoryId}`);
      toast.success('Catégorie supprimée');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const moveCategoryUp = async (index) => {
    if (index === 0) return;
    const newCategories = [...menuCategories];
    [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
    const updates = newCategories.map((cat, i) => ({ id: cat.id, sort_order: i }));
    try {
      await axios.put(`${API}/menu-categories/reorder`, updates);
      fetchData();
    } catch (error) {
      toast.error('Erreur lors du réordonnancement');
    }
  };

  const moveCategoryDown = async (index) => {
    if (index === menuCategories.length - 1) return;
    const newCategories = [...menuCategories];
    [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    const updates = newCategories.map((cat, i) => ({ id: cat.id, sort_order: i }));
    try {
      await axios.put(`${API}/menu-categories/reorder`, updates);
      fetchData();
    } catch (error) {
      toast.error('Erreur lors du réordonnancement');
    }
  };

  // Event functions
  const createEvent = async () => {
    if (!newEvent.name || !newEvent.organizer_name || !newEvent.organizer_email || !newEvent.organizer_password) {
      toast.error('Veuillez remplir tous les champs obligatoires (incluant le mot de passe)');
      return;
    }
    setSaving(true);
    try {
      const response = await axios.post(`${API}/events`, newEvent);
      toast.success('Événement créé!');
      
      // Show password info
      toast.info(`Mot de passe pour l'organisateur: ${newEvent.organizer_password}`, { duration: 10000 });
      
      setNewEvent({ name: '', num_guests: 10, organizer_name: '', organizer_email: '', organizer_whatsapp: '', organizer_password: '' });
      setShowEventForm(false);
      fetchData();
      
      // Copy link to clipboard
      const link = `${SITE_URL}/evento/${response.data.link_code}`;
      navigator.clipboard.writeText(link);
      toast.success('Lien copié dans le presse-papiers!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm('Supprimer cet événement et tous ses pedidos?')) return;
    try {
      await axios.delete(`${API}/events/${eventId}`);
      toast.success('Événement supprimé');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const copyEventLink = (linkCode) => {
    const link = `${SITE_URL}/evento/${linkCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Lien copié!');
  };

  const sidebarItems = [
    { id: 'weekly', icon: UtensilsCrossed, label: 'Menu Semaine' },
    { id: 'cardapio', icon: BookOpen, label: 'Cardápio Completo' },
    { id: 'categories', icon: FolderPlus, label: 'Catégories Menu' },
    { id: 'events', icon: PartyPopper, label: 'Événements' },
    { id: 'gallery', icon: Images, label: 'Galerie' },
    { id: 'content', icon: FileText, label: 'Textes du Site' },
    { id: 'images', icon: Image, label: 'Images du Site' },
    { id: 'settings', icon: Settings, label: 'Paramètres' },
    { id: 'reservations', icon: Calendar, label: 'Réservations' },
    { id: 'users', icon: Users, label: 'Utilisateurs' },
  ];

  const dishCategories = [
    { id: 'meat', label: 'Viande' },
    { id: 'vegetarian', label: 'Végétarien' },
    { id: 'seafood', label: 'Poisson / Fruits de Mer' },
    { id: 'dessert', label: 'Dessert' }
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
                          <Button variant="outline" size="sm" onClick={() => addDish(category.id)} className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10">
                            <Plus className="w-4 h-4 mr-2" />Ajouter
                          </Button>
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
                  {menuCategories.length === 0 ? (
                    <p className="text-white/50 text-center py-8">Nenhuma categoria criada. Vá para "Catégories Menu" para criar.</p>
                  ) : (
                    <Tabs defaultValue={menuCategories[0]?.slug} className="w-full">
                      <TabsList className="bg-[#121212] border border-white/10 p-1 mb-6 flex-wrap">
                        {menuCategories.map(cat => (
                          <TabsTrigger key={cat.id} value={cat.slug} className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-black">
                            {cat.name_fr}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {menuCategories.map(category => (
                        <TabsContent key={category.id} value={category.slug} className="space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-white text-sm font-medium">{category.name_fr}</h3>
                            <Button size="sm" onClick={() => addMenuItem(category.slug)} className="bg-[#d4af37] text-black hover:bg-white h-7 text-xs">
                              <Plus className="w-3 h-3 mr-1" />Ajouter
                            </Button>
                          </div>

                          {menuItems.filter(item => item.category === category.slug).map(item => (
                            <div key={item.id} className="bg-[#121212] border border-white/10 p-3 space-y-2">
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                <Input value={item.name_fr} onChange={(e) => updateMenuItem(item.id, 'name_fr', e.target.value)} className="bg-transparent border-white/20 text-white text-sm h-8" placeholder="Nom (FR)" />
                                <Input value={item.name_en} onChange={(e) => updateMenuItem(item.id, 'name_en', e.target.value)} className="bg-transparent border-white/20 text-white text-sm h-8" placeholder="Name (EN)" />
                                <Input value={item.name_pt} onChange={(e) => updateMenuItem(item.id, 'name_pt', e.target.value)} className="bg-transparent border-white/20 text-white text-sm h-8" placeholder="Nome (PT)" />
                                <Input type="number" step="0.01" value={item.price} onChange={(e) => updateMenuItem(item.id, 'price', e.target.value)} className="bg-transparent border-white/20 text-white text-sm h-8" placeholder="Prix €" />
                                <select
                                  value={item.category}
                                  onChange={(e) => updateMenuItem(item.id, 'category', e.target.value)}
                                  className="bg-transparent border border-white/20 text-white text-sm h-8 rounded-md px-2"
                                >
                                  {menuCategories.map(cat => (
                                    <option key={cat.slug} value={cat.slug} className="bg-[#121212]">{cat.name_fr}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Input value={item.description_fr || ''} onChange={(e) => updateMenuItem(item.id, 'description_fr', e.target.value)} className="bg-transparent border-white/20 text-white text-xs h-7" placeholder="Description (FR)" />
                                <Input value={item.description_en || ''} onChange={(e) => updateMenuItem(item.id, 'description_en', e.target.value)} className="bg-transparent border-white/20 text-white text-xs h-7" placeholder="Description (EN)" />
                                <Input value={item.description_pt || ''} onChange={(e) => updateMenuItem(item.id, 'description_pt', e.target.value)} className="bg-transparent border-white/20 text-white text-xs h-7" placeholder="Descrição (PT)" />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <Input value={item.image_url || ''} onChange={(e) => updateMenuItem(item.id, 'image_url', e.target.value)} className="bg-transparent border-white/20 text-white text-xs h-7" placeholder="URL da imagem (opcional)" />
                                </div>
                                <Button size="sm" variant="outline" onClick={() => deleteMenuItem(item.id, item.isNew)} className="border-red-500/50 text-red-500 h-7 w-7 p-0">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                                <Button size="sm" onClick={() => saveMenuItem(item)} disabled={saving} className="bg-[#d4af37] text-black hover:bg-white h-7 text-xs px-3">
                                  <Save className="w-3 h-3 mr-1" />Salvar
                                </Button>
                              </div>
                            </div>
                          ))}

                          {menuItems.filter(item => item.category === category.slug).length === 0 && (
                            <p className="text-white/30 text-center py-4 text-sm">Aucun item dans cette catégorie</p>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
                </motion.div>
              )}

              {/* Categories Management Tab */}
              {activeTab === 'categories' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  {/* Add Category Form */}
                  <div className="bg-[#121212] border border-white/10 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-white text-lg font-medium">Catégories du Menu</h2>
                      <Button onClick={() => setShowCategoryForm(!showCategoryForm)} className="bg-[#d4af37] text-black hover:bg-white">
                        <Plus className="w-4 h-4 mr-2" />Nouvelle Catégorie
                      </Button>
                    </div>

                    {showCategoryForm && (
                      <div className="bg-white/5 p-4 space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-white/70">Slug (identifiant unique)</Label>
                            <Input 
                              value={newCategory.slug} 
                              onChange={(e) => setNewCategory({...newCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                              className="bg-transparent border-white/20 text-white" 
                              placeholder="ex: viandes" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-white/70">Nom (FR)</Label>
                            <Input 
                              value={newCategory.name_fr} 
                              onChange={(e) => setNewCategory({...newCategory, name_fr: e.target.value})} 
                              className="bg-transparent border-white/20 text-white" 
                              placeholder="Viandes" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-white/70">Name (EN)</Label>
                            <Input 
                              value={newCategory.name_en} 
                              onChange={(e) => setNewCategory({...newCategory, name_en: e.target.value})} 
                              className="bg-transparent border-white/20 text-white" 
                              placeholder="Meats" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-white/70">Nome (PT)</Label>
                            <Input 
                              value={newCategory.name_pt} 
                              onChange={(e) => setNewCategory({...newCategory, name_pt: e.target.value})} 
                              className="bg-transparent border-white/20 text-white" 
                              placeholder="Carnes" 
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowCategoryForm(false)} className="border-white/20 text-white/70">
                            Annuler
                          </Button>
                          <Button onClick={createCategory} disabled={saving} className="bg-[#d4af37] text-black hover:bg-white">
                            <Save className="w-4 h-4 mr-2" />Créer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Categories List */}
                  <div className="bg-[#121212] border border-white/10 p-6">
                    <h3 className="text-white text-lg font-medium mb-4">Ordre des Catégories (drag pour réordonner)</h3>
                    <div className="space-y-2">
                      {menuCategories.map((category, index) => (
                        <div key={category.id} className="bg-white/5 border border-white/10 p-4 flex items-center gap-4">
                          <div className="flex flex-col gap-1">
                            <button 
                              onClick={() => moveCategoryUp(index)} 
                              disabled={index === 0}
                              className="text-white/50 hover:text-white disabled:opacity-30"
                            >
                              ▲
                            </button>
                            <button 
                              onClick={() => moveCategoryDown(index)} 
                              disabled={index === menuCategories.length - 1}
                              className="text-white/50 hover:text-white disabled:opacity-30"
                            >
                              ▼
                            </button>
                          </div>
                          
                          {editingCategory?.id === category.id ? (
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                              <Input 
                                value={editingCategory.name_fr} 
                                onChange={(e) => setEditingCategory({...editingCategory, name_fr: e.target.value})} 
                                className="bg-transparent border-white/20 text-white text-sm" 
                                placeholder="Nom (FR)" 
                              />
                              <Input 
                                value={editingCategory.name_en} 
                                onChange={(e) => setEditingCategory({...editingCategory, name_en: e.target.value})} 
                                className="bg-transparent border-white/20 text-white text-sm" 
                                placeholder="Name (EN)" 
                              />
                              <Input 
                                value={editingCategory.name_pt} 
                                onChange={(e) => setEditingCategory({...editingCategory, name_pt: e.target.value})} 
                                className="bg-transparent border-white/20 text-white text-sm" 
                                placeholder="Nome (PT)" 
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => updateCategory(editingCategory)} className="bg-[#d4af37] text-black">
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)} className="border-white/20 text-white/70">
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <p className="text-white font-medium">{category.name_fr}</p>
                                <p className="text-white/50 text-sm">EN: {category.name_en} | PT: {category.name_pt}</p>
                                <p className="text-white/30 text-xs">slug: {category.slug}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setEditingCategory({...category})} className="border-[#d4af37] text-[#d4af37]">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteCategory(category.id)} className="border-red-500 text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    {menuCategories.length === 0 && (
                      <p className="text-white/30 text-center py-8">Aucune catégorie créée</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Events Tab */}
              {activeTab === 'events' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  {/* Create Event Form */}
                  <div className="bg-[#121212] border border-white/10 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-white text-lg font-medium">Événements (Reserva de Pratos em Grupo)</h2>
                      <Button onClick={() => setShowEventForm(!showEventForm)} className="bg-[#d4af37] text-black hover:bg-white">
                        <Plus className="w-4 h-4 mr-2" />Nouvel Événement
                      </Button>
                    </div>

                    {showEventForm && (
                      <div className="bg-white/5 p-6 space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-white/70">Nom de l'événement *</Label>
                            <Input 
                              value={newEvent.name} 
                              onChange={(e) => setNewEvent({...newEvent, name: e.target.value})} 
                              className="bg-transparent border-white/20 text-white" 
                              placeholder="Ex: Anniversaire Juliana" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-white/70">Nombre de convives</Label>
                            <Input 
                              type="number"
                              value={newEvent.num_guests} 
                              onChange={(e) => setNewEvent({...newEvent, num_guests: parseInt(e.target.value) || 10})} 
                              className="bg-transparent border-white/20 text-white" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-white/70">Nom de l'organisateur *</Label>
                            <Input 
                              value={newEvent.organizer_name} 
                              onChange={(e) => setNewEvent({...newEvent, organizer_name: e.target.value})} 
                              className="bg-transparent border-white/20 text-white" 
                              placeholder="Juliana Silva" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-white/70">Email de l'organisateur *</Label>
                            <Input 
                              type="email"
                              value={newEvent.organizer_email} 
                              onChange={(e) => setNewEvent({...newEvent, organizer_email: e.target.value})} 
                              className="bg-transparent border-white/20 text-white" 
                              placeholder="juliana@email.com" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-white/70">WhatsApp (optionnel)</Label>
                            <Input 
                              value={newEvent.organizer_whatsapp} 
                              onChange={(e) => setNewEvent({...newEvent, organizer_whatsapp: e.target.value})} 
                              className="bg-transparent border-white/20 text-white" 
                              placeholder="+352 123 456 789" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-white/70">Mot de passe pour l'organisateur *</Label>
                            <Input 
                              type="text"
                              value={newEvent.organizer_password} 
                              onChange={(e) => setNewEvent({...newEvent, organizer_password: e.target.value})} 
                              className="bg-transparent border-white/20 text-white" 
                              placeholder="Créer un mot de passe" 
                            />
                            <p className="text-white/40 text-xs">Ce mot de passe sera donné à l'organisateur pour voir et gérer les commandes</p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setShowEventForm(false)} className="border-white/20 text-white/70">
                            Annuler
                          </Button>
                          <Button onClick={createEvent} disabled={saving} className="bg-[#d4af37] text-black hover:bg-white">
                            <Save className="w-4 h-4 mr-2" />Créer et Copier le Lien
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Events List */}
                  <div className="bg-[#121212] border border-white/10 p-6">
                    <h3 className="text-white text-lg font-medium mb-4">Événements Actifs</h3>
                    
                    {events.length === 0 ? (
                      <p className="text-white/30 text-center py-8">Aucun événement créé</p>
                    ) : (
                      <div className="space-y-4">
                        {events.map(event => (
                          <div key={event.id} className="bg-white/5 border border-white/10 p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-white font-medium text-lg">{event.name}</h4>
                                <p className="text-white/50 text-sm">
                                  Organisateur: {event.organizer_name} ({event.organizer_email})
                                </p>
                                <p className="text-white/50 text-sm">
                                  Convives attendus: {event.num_guests}
                                </p>
                                {event.organizer_password && (
                                  <p className="text-[#d4af37] text-sm">
                                    🔑 Mot de passe: <code className="bg-black/30 px-2 py-0.5 rounded">{event.organizer_password}</code>
                                  </p>
                                )}
                                <div className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                                  event.status === 'sent' ? 'bg-green-500/20 text-green-400' : 
                                  event.status === 'closed' ? 'bg-yellow-500/20 text-yellow-400' : 
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                  {event.status === 'sent' ? '✓ Envoyé' : 
                                   event.status === 'closed' ? 'Fermé' : 
                                   'Ouvert'}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => copyEventLink(event.link_code)}
                                  className="border-[#d4af37] text-[#d4af37]"
                                >
                                  <Copy className="w-4 h-4 mr-1" />Copier Lien
                                </Button>
                                <a 
                                  href={`/evento/${event.link_code}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <Button size="sm" variant="outline" className="border-white/20 text-white/70">
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </a>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => deleteEvent(event.id)}
                                  className="border-red-500 text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="bg-black/30 p-2 rounded flex items-center gap-2">
                              <code className="text-[#d4af37] text-sm flex-1 truncate">
                                {SITE_URL}/evento/{event.link_code}
                              </code>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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

                  <div className="bg-[#121212] border border-white/10 p-6 space-y-6">
                    <h2 className="text-white text-lg font-medium border-b border-white/10 pb-4">Images de Fond des Pages</h2>
                    <p className="text-white/50 text-sm mb-4">Optionnel - Si aucune image n'est définie, la page gardera son style par défaut</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-xs text-white/70 mb-2 block">Accueil (Home)</Label>
                        <ImageUpload value={siteContent.bg_home || ''} onChange={(url) => setSiteContent({...siteContent, bg_home: url})} />
                      </div>
                      <div>
                        <Label className="text-xs text-white/70 mb-2 block">Notre Histoire (About)</Label>
                        <ImageUpload value={siteContent.bg_about || ''} onChange={(url) => setSiteContent({...siteContent, bg_about: url})} />
                      </div>
                      <div>
                        <Label className="text-xs text-white/70 mb-2 block">Menu (Carte)</Label>
                        <ImageUpload value={siteContent.bg_menu || ''} onChange={(url) => setSiteContent({...siteContent, bg_menu: url})} />
                      </div>
                      <div>
                        <Label className="text-xs text-white/70 mb-2 block">Galerie</Label>
                        <ImageUpload value={siteContent.bg_gallery || ''} onChange={(url) => setSiteContent({...siteContent, bg_gallery: url})} />
                      </div>
                      <div>
                        <Label className="text-xs text-white/70 mb-2 block">Réservations</Label>
                        <ImageUpload value={siteContent.bg_reservations || ''} onChange={(url) => setSiteContent({...siteContent, bg_reservations: url})} />
                      </div>
                    </div>
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

              {/* Gallery Tab */}
              {activeTab === 'gallery' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <Tabs defaultValue="ambiance" className="w-full">
                    <TabsList className="bg-[#121212] border border-white/10 p-1 mb-6">
                      <TabsTrigger value="ambiance" className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-black">Ambiance</TabsTrigger>
                      <TabsTrigger value="dishes" className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-black">Plats</TabsTrigger>
                      <TabsTrigger value="team" className="data-[state=active]:bg-[#d4af37] data-[state=active]:text-black">Équipe</TabsTrigger>
                    </TabsList>

                    {['ambiance', 'dishes', 'team'].map(category => (
                      <TabsContent key={category} value={category} className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-white text-lg capitalize">{category === 'ambiance' ? 'Ambiance' : category === 'dishes' ? 'Plats' : 'Équipe'}</h3>
                          <Button onClick={() => addGalleryImage(category)} className="bg-[#d4af37] text-black hover:bg-white">
                            <Plus className="w-4 h-4 mr-2" />Ajouter
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {galleryImages.filter(img => img.category === category).map(image => (
                            <div key={image.id} className="bg-[#121212] border border-white/10 p-4 space-y-4" data-testid={`gallery-item-${image.id}`}>
                              <ImageUpload value={image.url || ''} onChange={(url) => updateGalleryImage(image.id, 'url', url)} />
                              <div className="grid grid-cols-3 gap-2">
                                <Input 
                                  value={image.alt_fr || ''} 
                                  onChange={(e) => updateGalleryImage(image.id, 'alt_fr', e.target.value)} 
                                  className="bg-transparent border-white/20 text-white text-xs" 
                                  placeholder="Alt (FR)" 
                                />
                                <Input 
                                  value={image.alt_en || ''} 
                                  onChange={(e) => updateGalleryImage(image.id, 'alt_en', e.target.value)} 
                                  className="bg-transparent border-white/20 text-white text-xs" 
                                  placeholder="Alt (EN)" 
                                />
                                <Input 
                                  value={image.alt_pt || ''} 
                                  onChange={(e) => updateGalleryImage(image.id, 'alt_pt', e.target.value)} 
                                  className="bg-transparent border-white/20 text-white text-xs" 
                                  placeholder="Alt (PT)" 
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => deleteGalleryImage(image.id, image.isNew)} className="border-red-500 text-red-500 hover:bg-red-500/10">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" onClick={() => saveGalleryImage(image)} disabled={saving} className="bg-[#d4af37] text-black hover:bg-white">
                                  <Save className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {galleryImages.filter(img => img.category === category).length === 0 && (
                          <p className="text-white/30 text-center py-8">Aucune image dans cette catégorie</p>
                        )}
                      </TabsContent>
                    ))}
                  </Tabs>
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
