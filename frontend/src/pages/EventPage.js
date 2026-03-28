import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Send, User, ShoppingBag, Trash2, Edit2, ChevronDown, ChevronUp, FileText, Loader2 } from 'lucide-react';
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
  const [menuItems, setMenuItems] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Guest order state
  const [guestName, setGuestName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [myOrder, setMyOrder] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  // Organizer confirmation
  const [showOrganizerConfirm, setShowOrganizerConfirm] = useState(false);
  const [organizerEmail, setOrganizerEmail] = useState('');

  useEffect(() => {
    fetchData();
  }, [linkCode]);

  const fetchData = async () => {
    try {
      const [eventRes, ordersRes, menuRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/events/${linkCode}`),
        axios.get(`${API}/events/${linkCode}/orders`),
        axios.get(`${API}/menu-items`),
        axios.get(`${API}/menu-categories`)
      ]);
      setEvent(eventRes.data);
      setOrders(ordersRes.data || []);
      setMenuItems(menuRes.data || []);
      setMenuCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Evento não encontrado');
    } finally {
      setLoading(false);
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
    toast.success(`${item.name_fr} adicionado!`);
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
      toast.error('Por favor, insira seu nome');
      return;
    }
    if (myOrder.length === 0) {
      toast.error('Adicione pelo menos um prato');
      return;
    }

    try {
      if (editingOrderId) {
        await axios.put(`${API}/events/${linkCode}/orders/${editingOrderId}`, {
          guest_name: guestName,
          items: myOrder
        });
        toast.success('Pedido atualizado!');
        setEditingOrderId(null);
      } else {
        await axios.post(`${API}/events/${linkCode}/orders`, {
          guest_name: guestName,
          items: myOrder
        });
        toast.success('Pedido adicionado!');
      }
      setMyOrder([]);
      setGuestName('');
      setIsNameSet(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar pedido');
    }
  };

  const editOrder = (order) => {
    setGuestName(order.guest_name);
    setIsNameSet(true);
    setMyOrder(order.items || []);
    setEditingOrderId(order.id);
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('Remover este pedido?')) return;
    try {
      await axios.delete(`${API}/events/${linkCode}/orders/${orderId}`);
      toast.success('Pedido removido');
      fetchData();
    } catch (error) {
      toast.error('Erro ao remover');
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
    doc.text(`Organizador: ${data.event.organizer_name}`, pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.text(`Convidados esperados: ${data.event.num_guests} | Pedidos recebidos: ${data.total_guests}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    if (type === 'complete') {
      // Complete version - list all guests with their orders
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PEDIDOS POR PESSOA', 14, y);
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
          const line = `   • ${item.quantity}x ${item.name_fr} - €${item.price.toFixed(2)}`;
          doc.text(line, 14, y);
          y += 5;
          if (item.observation) {
            doc.setTextColor(100);
            doc.text(`     Obs: ${item.observation}`, 14, y);
            doc.setTextColor(0);
            y += 5;
          }
        });
        y += 5;
      });
    }

    // Summary section (both versions)
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    y += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(type === 'kitchen' ? 'RESUMO PARA COZINHA' : 'RESUMO TOTAL', 14, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // Sort by quantity
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

    // Observations for kitchen
    if (type === 'kitchen' && data.observations.length > 0) {
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES:', 14, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      data.observations.forEach(obs => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(`• ${obs.guest} - ${obs.item}: ${obs.observation}`, 14, y);
        y += 5;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 290);

    return doc;
  };

  const sendToRestaurant = async () => {
    if (!organizerEmail.trim()) {
      toast.error('Insira seu email para confirmar');
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(`${API}/events/${linkCode}/send?organizer_email=${encodeURIComponent(organizerEmail)}`);
      const data = response.data;

      // Generate PDFs
      const completePDF = generatePDF(data, 'complete');
      const kitchenPDF = generatePDF(data, 'kitchen');

      // Download PDFs
      completePDF.save(`${event.name.replace(/\s+/g, '_')}_Completo.pdf`);
      setTimeout(() => {
        kitchenPDF.save(`${event.name.replace(/\s+/g, '_')}_Cozinha.pdf`);
      }, 500);

      toast.success('Evento enviado! PDFs gerados.');
      setShowOrganizerConfirm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao enviar');
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
          <h1 className="text-2xl text-white mb-4">Evento não encontrado</h1>
          <p className="text-white/50">Verifique o link e tente novamente</p>
        </div>
      </div>
    );
  }

  const isSent = event.status === 'sent';

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
            Organizador: {event.organizer_name} | {event.num_guests} convidados esperados
          </p>
          {isSent && (
            <div className="mt-4 bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded inline-block">
              ✓ Pedidos já enviados ao restaurante
            </div>
          )}
        </motion.div>

        {!isSent && (
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
                  Qual é o seu nome?
                </h2>
                <div className="flex gap-4">
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Digite seu nome..."
                    className="bg-transparent border-white/20 text-white flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && guestName.trim() && setIsNameSet(true)}
                  />
                  <Button 
                    onClick={() => guestName.trim() && setIsNameSet(true)}
                    className="bg-[#d4af37] text-black hover:bg-white"
                  >
                    Continuar
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
                      Olá, <span className="text-[#d4af37]">{guestName}</span>! Escolha seus pratos:
                    </h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => { setIsNameSet(false); setMyOrder([]); setEditingOrderId(null); }}
                      className="border-white/20 text-white/50"
                    >
                      Trocar nome
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
                                        <p className="text-[#d4af37] text-sm">€{item.price?.toFixed(2)}</p>
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
                      Meu Pedido
                    </h2>

                    <div className="space-y-4">
                      {myOrder.map(item => (
                        <div key={item.item_id} className="bg-white/5 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white">{item.name_fr}</p>
                              <p className="text-[#d4af37] text-sm">€{item.price?.toFixed(2)} cada</p>
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
                            placeholder="Observações (ex: sem cebola, ponto da carne...)"
                            className="bg-transparent border-white/20 text-white text-sm"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <p className="text-white">
                        Total: <span className="text-[#d4af37] font-bold">
                          €{myOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                        </span>
                      </p>
                      <Button
                        onClick={submitOrder}
                        className="bg-[#d4af37] text-black hover:bg-white"
                      >
                        {editingOrderId ? 'Atualizar Pedido' : 'Confirmar Pedido'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}

        {/* All Orders */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#121212] border border-white/10 p-6"
        >
          <h2 className="text-white text-lg mb-4">
            Pedidos Confirmados ({orders.length}/{event.num_guests})
          </h2>

          {orders.length === 0 ? (
            <p className="text-white/50 text-center py-8">Nenhum pedido ainda</p>
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
                        • {item.quantity}x {item.name_fr}
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

          {/* Send to Restaurant Button (Only for organizer) */}
          {!isSent && orders.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              {!showOrganizerConfirm ? (
                <Button
                  onClick={() => setShowOrganizerConfirm(true)}
                  className="w-full bg-[#d4af37] text-black hover:bg-white py-6 text-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Pedidos ao Restaurante
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-white/70 text-sm">
                    Apenas o organizador ({event.organizer_name}) pode enviar. 
                    Confirme seu email:
                  </p>
                  <Input
                    type="email"
                    value={organizerEmail}
                    onChange={(e) => setOrganizerEmail(e.target.value)}
                    placeholder="Email do organizador..."
                    className="bg-transparent border-white/20 text-white"
                  />
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowOrganizerConfirm(false)}
                      className="flex-1 border-white/20 text-white/70"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={sendToRestaurant}
                      disabled={sending}
                      className="flex-1 bg-[#d4af37] text-black hover:bg-white"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                      Confirmar e Gerar PDF
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EventPage;
