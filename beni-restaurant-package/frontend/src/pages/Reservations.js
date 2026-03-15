import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Users, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr, enUS, pt } from 'date-fns/locale';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Reservations = () => {
  const { t, language } = useLanguage();
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    time: '',
    guests: 2,
    notes: ''
  });

  const locales = { fr, en: enUS, pt };

  const timeSlots = [
    '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!date || !formData.time || !formData.name || !formData.email || !formData.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/reservations`, {
        ...formData,
        date: format(date, 'yyyy-MM-dd'),
        guests: parseInt(formData.guests)
      });
      
      setSuccess(true);
      toast.success(t('reservations_success'));
    } catch (error) {
      console.error('Reservation error:', error);
      toast.error(t('reservations_error'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] pt-20 flex items-center justify-center" data-testid="reservations-success">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6"
        >
          <div className="w-20 h-20 bg-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-black" />
          </div>
          <h2 className="font-display text-4xl text-white mb-4" data-testid="success-title">
            {t('reservations_success')}
          </h2>
          <p className="text-white/60 mb-2">
            {format(date, 'EEEE d MMMM yyyy', { locale: locales[language] })}
          </p>
          <p className="text-[#d4af37] text-xl mb-8">{formData.time}</p>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Nous vous contacterons pour confirmer votre réservation.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20" data-testid="reservations-page">
      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 md:px-12">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&q=80"
            alt="Restaurant interior"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37] mb-4">
              {t('reservations_subtitle')}
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-white" data-testid="reservations-title">
              {t('reservations_title')}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Reservation Form */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-8"
            data-testid="reservation-form"
          >
            {/* Date & Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] text-white/70">
                  {t('reservations_date')} *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left bg-transparent border-white/20 hover:border-[#d4af37] hover:bg-white/5 text-white h-14"
                      data-testid="date-picker-trigger"
                    >
                      <CalendarIcon className="mr-3 h-4 w-4 text-[#d4af37]" />
                      {date ? (
                        format(date, 'PPP', { locale: locales[language] })
                      ) : (
                        <span className="text-white/50">Choisir une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#121212] border-white/10" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      locale={locales[language]}
                      className="bg-[#121212]"
                      data-testid="date-calendar"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selector */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] text-white/70">
                  {t('reservations_time')} *
                </Label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
                  <select
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full h-14 pl-12 pr-4 bg-transparent border border-white/20 text-white appearance-none cursor-pointer hover:border-[#d4af37] focus:border-[#d4af37] focus:outline-none transition-colors"
                    data-testid="time-select"
                  >
                    <option value="" className="bg-[#121212]">Choisir une heure</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time} className="bg-[#121212]">{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.15em] text-white/70">
                {t('reservations_guests')} *
              </Label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full h-14 pl-12 pr-4 bg-transparent border border-white/20 text-white appearance-none cursor-pointer hover:border-[#d4af37] focus:border-[#d4af37] focus:outline-none transition-colors"
                  data-testid="guests-select"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num} className="bg-[#121212]">
                      {num} {num === 1 ? 'personne' : 'personnes'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] text-white/70">
                  {t('reservations_name')} *
                </Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className="h-14 bg-transparent border-white/20 text-white placeholder:text-white/30 focus:border-[#d4af37]"
                  data-testid="name-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.15em] text-white/70">
                  {t('reservations_email')} *
                </Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jean@example.com"
                  className="h-14 bg-transparent border-white/20 text-white placeholder:text-white/30 focus:border-[#d4af37]"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.15em] text-white/70">
                {t('reservations_phone')} *
              </Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+352 000 000 000"
                className="h-14 bg-transparent border-white/20 text-white placeholder:text-white/30 focus:border-[#d4af37]"
                data-testid="phone-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-[0.15em] text-white/70">
                {t('reservations_notes')}
              </Label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Allergies, occasions spéciales, demandes particulières..."
                rows={4}
                className="bg-transparent border-white/20 text-white placeholder:text-white/30 focus:border-[#d4af37] resize-none"
                data-testid="notes-textarea"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-[#d4af37] text-black text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-all duration-300 disabled:opacity-50"
              data-testid="submit-reservation-btn"
            >
              {loading ? t('loading') : t('reservations_submit')}
            </Button>
          </motion.form>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-6 md:px-12 bg-[#121212]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/50 text-sm leading-relaxed">
            Pour les groupes de plus de 10 personnes ou pour des événements privés, 
            veuillez nous contacter directement par téléphone au{' '}
            <a href="tel:+352661250004" className="text-[#d4af37] hover:underline">
              +352 661 250 004
            </a>{' '}
            ou par email à{' '}
            <a href="mailto:beniluxembourg@gmail.com" className="text-[#d4af37] hover:underline">
              beniluxembourg@gmail.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Reservations;
