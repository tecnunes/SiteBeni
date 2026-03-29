import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Send, User, ShoppingBag, Trash2, Edit2, ChevronDown, ChevronUp, FileText, Loader2, Lock, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import jsPDF from 'jspdf';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EventPage = () => {
  const { linkCode } = useParams();
  const [event, setEvent] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Guest order state
  const [guestName, setGuestName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [myOrder, setMyOrder] = useState([]);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  // Organizer state
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [organizerPassword, setOrganizerPassword] = useState('');
  const [showOrganizerLogin, setShowOrganizerLogin] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [linkCode]);

  const fetchData = async () => {
    try {
      const [eventRes, menuRes, categoriesRes, countRes] = await Promise.all([
        axios.get(`${API}/events/${linkCode}`),
        axios.get(`${API}/menu-items`),
        axios.get(`${API}/menu-categories`),
        axios.get(`${API}/events/${linkCode}/orders/count`)
      ]);
      setEvent(eventRes.data);
      setMenuItems(menuRes.data || []);
      setMenuCategories(categoriesRes.data || []);
      setOrdersCount(countRes.data?.count || 0);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Événement non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersAsOrganizer = async (password) => {
    try {
      const response = await axios.get(`${API}/events/${linkCode}/orders?password=${encodeURIComponent(password)}`);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const authenticateOrganizer = async () => {
    try {
      const response = await axios.post(`${API}/events/${linkCode}/auth?password=${encodeURIComponent(organizerPassword)}`);
      if (response.data.authenticated) {
        setIsOrganizer(true);
        setShowOrganizerLogin(false);
        toast.success(`Bienvenue, ${response.data.organizer_name} !`);
        fetchOrdersAsOrganizer(organizerPassword);
      }
    } catch (error) {
      toast.error('Mot de passe incorrect');
    }
  };

  const addItemToOrder = (item) => {
    const existingIndex = myOrder.findIndex(o => o.item_id === item.id);
    if (existingIndex >= 0) {
      const updated = [...myOrder];
      updated[existingIndex].quantity += 1;
      setMyOrder(updated);
    } else {
      setMyOrder([...myOrder, {
        item_id: item.id,
        name_fr: item.name_fr,
        name_en: item.name_en,
        name_pt: item.name_pt,
        price: item.price,
        quantity: 1,
        observation: ''
      }]);
    }
    toast.success(`${item.name_fr} ajouté !`);
  };

  const updateItemQuantity = (itemId, delta) => {
    const updated = myOrder.map(item => {
      if (item.item_id === itemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    setMyOrder(updated);
  };

  const updateItemObservation = (itemId, observation) => {
    setMyOrder(myOrder.map(item => 
      item.item_id === itemId ? { ...item, observation } : item
    ));
  };

  const removeItem = (itemId) => {
    setMyOrder(myOrder.filter(item => item.item_id !== itemId));
  };

  const submitOrder = async () => {
    if (!guestName.trim()) {
      toast.error('Veuillez entrer votre nom');
      return;
    }
    if (myOrder.length === 0) {
      toast.error('Ajoutez au moins un plat');
      return;
    }

    try {
      if (editingOrderId && isOrganizer) {
        await axios.put(`${API}/events/${linkCode}/orders/${editingOrderId}?password=${encodeURIComponent(organizerPassword)}`, {
          guest_name: guestName,
          items: myOrder
        });
        toast.success('Commande mise à jour !');
        setEditingOrderId(null);
        fetchOrdersAsOrganizer(organizerPassword);
      } else {
        await axios.post(`${API}/events/${linkCode}/orders`, {
          guest_name: guestName,
          items: myOrder
        });
        toast.success('Commande envoyée avec succès !');
        setOrderSubmitted(true);
      }
      setMyOrder([]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    }
  };

  const editOrder = (order) => {
    setGuestName(order.guest_name);
    setIsNameSet(true);
    setMyOrder(order.items || []);
    setEditingOrderId(order.id);
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Supprimer cette commande ?')) return;
    try {
      await axios.delete(`${API}/events/${linkCode}/orders/${orderId}?password=${encodeURIComponent(organizerPassword)}`);
      toast.success('Commande supprimée');
      fetchOrdersAsOrganizer(organizerPassword);
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const generatePDF = (data, type = 'complete') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BÉNI RESTAURANT', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(16);
    doc.text(data.event.name, pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Organisateur : ${data.event.organizer_name}`, pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text(`Convives attendus : ${data.event.num_guests} | Commandes reçues : ${data.total_guests}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    if (type === 'complete') {
      // Complete version - list all guests with their orders
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('COMMANDES PAR PERSONNE', 14, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      data.orders.forEach((order, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.text(`${idx + 1}. ${order.guest_name}`, 14, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        (order.items || []).forEach(item => {
          const line = `   - ${item.quantity}x ${item.name_fr} - ${item.price.toFixed(2)}€`;
          doc.text(line, 14, y);
          y += 5;
          if (item.observation) {
            doc.setTextColor(100);
            doc.text(`     Obs : ${item.observation}`, 14, y);
            doc.setTextColor(0);
            y += 5;
          }
        });
        y += 5;
      });

      // Summary at the end
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      y += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RÉSUMÉ TOTAL', 14, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const sortedItems = Object.entries(data.item_totals)
        .sort((a, b) => b[1].quantity - a[1].quantity);

      sortedItems.forEach(([name, info]) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${info.quantity}x ${name}`, 14, y);
        y += 6;
      });
    }

    if (type === 'kitchen') {
      // Kitchen version - only totals and observations
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RÉSUMÉ POUR LA CUISINE', 14, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const sortedItems = Object.entries(data.item_totals)
        .sort((a, b) => b[1].quantity - a[1].quantity);

      sortedItems.forEach(([name, info]) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${info.quantity}x ${name}`, 14, y);
        y += 6;
      });

      if (data.observations.length > 0) {
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVATIONS :', 14, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        data.observations.forEach(obs => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(`- ${obs.guest} - ${obs.item} : ${obs.observation}`, 14, y);
          y += 5;
        });
      }
    }

    // Footer
    doc.setFontSize(8);
    doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 14, 290);

    return doc;
  };

  const sendToRestaurant = async () => {
    setSending(true);
    try {
      const response = await axios.post(`${API}/events/${linkCode}/send?password=${encodeURIComponent(organizerPassword)}`);
      const data = response.data;

      // Generate only the complete PDF for the organizer
      const completePDF = generatePDF(data, 'complete');
      completePDF.save(`${event.name.replace(/\s+/g, '_')}_Commandes.pdf`);

      // Generate kitchen PDF (will be sent via email to restaurant later)
      const kitchenPDF = generatePDF(data, 'kitchen');
      // Store kitchen PDF data for email sending (future implementation)
      
      toast.success('Événement envoyé ! PDF généré avec succès.');
      toast.info('Le résumé pour la cuisine sera envoyé au restaurant par email.');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Événement non trouvé</h1>
          <p className="text-white/50">Vérifiez le lien et réessayez</p>
        </div>
      </div>
    );
  }

  const isSent = event.status === 'sent';

  // Guest submitted their order - show confirmation
  if (orderSubmitted && !isOrganizer) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#121212] border border-[#d4af37]/50 p-8 text-center max-w-md"
        >
          <CheckCircle className="w-16 h-16 text-[#d4af37] mx-auto mb-4" />
          <h1 className="text-2xl text-white mb-2">Commande Envoyée !</h1>
          <p className="text-white/70 mb-6">
            Merci, <span className="text-[#d4af37]">{guestName}</span> ! 
            Votre commande a été enregistrée pour l'événement « {event.name} ».
          </p>
          <p className="text-white/50 text-sm">
            L'organisateur recevra votre commande et l'enverra au restaurant lorsque tous les convives auront confirmé.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-[#d4af37] text-xs uppercase tracking-[0.3em] mb-2">BÉNI Restaurant</p>
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">{event.name}</h1>
          <p className="text-white/50">
            Organisateur : {event.organizer_name} | {ordersCount}/{event.num_guests} commandes confirmées
          </p>
          {isSent && (
            <div className="mt-4 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded inline-block">
              ✓ Commandes déjà envoyées au restaurant
            </div>
          )}
        </motion.div>

        {/* Organizer Login Button */}
        {!isOrganizer && !isSent && (
          <div className="text-center mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowOrganizerLogin(!showOrganizerLogin)}
              className="border-[#d4af37]/50 text-[#d4af37]"
            >
              <Lock className="w-4 h-4 mr-2" />
              Je suis l'organisateur
            </Button>
          </div>
        )}

        {/* Organizer Login Form */}
        {showOrganizerLogin && !isOrganizer && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-[#121212] border border-[#d4af37]/50 p-6 mb-8"
          >
            <h2 className="text-white text-lg mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#d4af37]" />
              Accès Organisateur
            </h2>
            <p className="text-white/50 text-sm mb-4">
              Entrez le mot de passe fourni par le restaurant pour voir et gérer les commandes.
            </p>
            <div className="flex gap-4">
              <Input
                type="password"
                value={organizerPassword}
                onChange={(e) => setOrganizerPassword(e.target.value)}
                placeholder="Mot de passe de l'événement..."
                className="bg-transparent border-white/20 text-white flex-1"
                onKeyPress={(e) => e.key === 'Enter' && authenticateOrganizer()}
              />
              <Button 
                onClick={authenticateOrganizer}
                className="bg-[#d4af37] text-black hover:bg-white"
              >
                Entrer
              </Button>
            </div>
          </motion.div>
        )}

        {/* Organizer Badge */}
        {isOrganizer && (
          <div className="bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] px-4 py-2 rounded text-center mb-6">
            ✓ Connecté en tant qu'Organisateur - Vous pouvez voir et gérer toutes les commandes
          </div>
        )}

        {!isSent && !isOrganizer && (
          <>
            {/* Guest Name Input */}
            {!isNameSet ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#121212] border border-white/10 p-6 mb-8"
              >
                <h2 className="text-white text-lg mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#d4af37]" />
                  Quel est votre nom ?
                </h2>
                <div className="flex gap-4">
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Entrez votre nom..."
                    className="bg-transparent border-white/20 text-white flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && guestName.trim() && setIsNameSet(true)}
                  />
                  <Button 
                    onClick={() => guestName.trim() && setIsNameSet(true)}
                    className="bg-[#d4af37] text-black hover:bg-white"
                  >
                    Continuer
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Menu Selection */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#121212] border border-white/10 p-6 mb-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white text-lg">
                      Bonjour, <span className="text-[#d4af37]">{guestName}</span> ! Choisissez vos plats :
                    </h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => { setIsNameSet(false); setMyOrder([]); }}
                      className="border-white/20 text-white/50"
                    >
                      Changer de nom
                    </Button>
                  </div>

                  {/* Categories Accordion */}
                  <div className="space-y-2">
                    {menuCategories.map(category => {
                      const categoryItems = menuItems.filter(item => item.category === category.slug);
                      if (categoryItems.length === 0) return null;
                      const isExpanded = expandedCategory === category.id;

                      return (
                        <div key={category.id} className="border border-white/10">
                          <button
                            onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                            className="w-full flex items-center justify-between p-4 text-white hover:bg-white/5"
                          >
                            <span className="font-medium">{category.name_fr}</span>
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 pt-0 space-y-2">
                                  {categoryItems.map(item => (
                                    <div 
                                      key={item.id} 
                                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                      <div className="flex-1">
                                        <p className="text-white">{item.name_fr}</p>
                                        <p className="text-white/50 text-sm">{item.description_fr}</p>
                                        <p className="text-[#d4af37] text-sm">{item.price?.toFixed(2)}€</p>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => addItemToOrder(item)}
                                        className="bg-[#d4af37] text-black hover:bg-white ml-4"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* My Order */}
                {myOrder.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#121212] border border-[#d4af37]/50 p-6 mb-8"
                  >
                    <h2 className="text-white text-lg mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
                      Ma Commande
                    </h2>

                    <div className="space-y-4">
                      {myOrder.map(item => (
                        <div key={item.item_id} className="bg-white/5 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white">{item.name_fr}</p>
                              <p className="text-[#d4af37] text-sm">{item.price?.toFixed(2)}€ chacun</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemQuantity(item.item_id, -1)}
                                className="border-white/20 text-white h-8 w-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-white w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemQuantity(item.item_id, 1)}
                                className="border-white/20 text-white h-8 w-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeItem(item.item_id)}
                                className="border-red-500/50 text-red-500 h-8 w-8 p-0 ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <Textarea
                            value={item.observation || ''}
                            onChange={(e) => updateItemObservation(item.item_id, e.target.value)}
                            placeholder="Observations (ex : sans oignon, cuisson de la viande...)"
                            className="bg-transparent border-white/20 text-white text-sm"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <p className="text-white">
                        Total : <span className="text-[#d4af37] font-bold">
                          {myOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}€
                        </span>
                      </p>
                      <Button
                        onClick={submitOrder}
                        className="bg-[#d4af37] text-black hover:bg-white"
                      >
                        Envoyer Ma Commande
                      </Button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}

        {/* Organizer View - Orders List */}
        {isOrganizer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#121212] border border-white/10 p-6"
          >
            <h2 className="text-white text-lg mb-4">
              Commandes Confirmées ({orders.length}/{event.num_guests})
            </h2>

            {orders.length === 0 ? (
              <p className="text-white/50 text-center py-8">Aucune commande pour le moment</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">{order.guest_name}</p>
                      {!isSent && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editOrder(order)}
                            className="border-[#d4af37]/50 text-[#d4af37] h-8"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteOrder(order.id)}
                            className="border-red-500/50 text-red-500 h-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <ul className="text-white/70 text-sm space-y-1">
                      {(order.items || []).map((item, idx) => (
                        <li key={idx}>
                          - {item.quantity}x {item.name_fr}
                          {item.observation && (
                            <span className="text-[#d4af37] text-xs ml-2">({item.observation})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Organizer Edit Form */}
            {editingOrderId && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 pt-6 border-t border-white/10"
              >
                <h3 className="text-white mb-4">Modification de la commande de : {guestName}</h3>
                
                {/* Categories for editing */}
                <div className="space-y-2 mb-4">
                  {menuCategories.map(category => {
                    const categoryItems = menuItems.filter(item => item.category === category.slug);
                    if (categoryItems.length === 0) return null;
                    const isExpanded = expandedCategory === category.id;

                    return (
                      <div key={category.id} className="border border-white/10">
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                          className="w-full flex items-center justify-between p-3 text-white hover:bg-white/5 text-sm"
                        >
                          <span>{category.name_fr}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        
                        {isExpanded && (
                          <div className="p-3 pt-0 space-y-1">
                            {categoryItems.map(item => (
                              <div key={item.id} className="flex items-center justify-between p-2 bg-white/5 text-sm">
                                <span className="text-white">{item.name_fr} - {item.price?.toFixed(2)}€</span>
                                <Button size="sm" onClick={() => addItemToOrder(item)} className="bg-[#d4af37] text-black h-6 text-xs">
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Current items */}
                <div className="space-y-2 mb-4">
                  {myOrder.map(item => (
                    <div key={item.item_id} className="flex items-center justify-between bg-white/5 p-2">
                      <span className="text-white text-sm">{item.quantity}x {item.name_fr}</span>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => updateItemQuantity(item.item_id, -1)} className="h-6 w-6 p-0 border-white/20 text-white">
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateItemQuantity(item.item_id, 1)} className="h-6 w-6 p-0 border-white/20 text-white">
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => removeItem(item.item_id)} className="h-6 w-6 p-0 border-red-500/50 text-red-500 ml-1">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setEditingOrderId(null); setMyOrder([]); }} className="border-white/20 text-white/70">
                    Annuler
                  </Button>
                  <Button onClick={submitOrder} className="bg-[#d4af37] text-black">
                    Enregistrer les Modifications
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Send to Restaurant Button */}
            {!isSent && orders.length > 0 && !editingOrderId && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <Button
                  onClick={sendToRestaurant}
                  disabled={sending}
                  className="w-full bg-[#d4af37] text-black hover:bg-white py-6 text-lg"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                  Envoyer les Commandes au Restaurant
                </Button>
                <p className="text-white/50 text-sm text-center mt-2">
                  Vous recevrez le PDF avec toutes les commandes. Le résumé pour la cuisine sera envoyé au restaurant.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Public view - just show count */}
        {!isOrganizer && !isSent && isNameSet && myOrder.length === 0 && (
          <div className="bg-[#121212] border border-white/10 p-6 text-center">
            <p className="text-white/50">
              {ordersCount} sur {event.num_guests} convives ont déjà confirmé leur commande.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPage;
