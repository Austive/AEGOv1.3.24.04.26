import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, MapPin, Shield, CheckCircle2, AlertCircle, Loader2, CreditCard, Calendar, Clock } from 'lucide-react';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db, loginWithGoogle } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const SERVICES = [
  { id: 'close', name: 'Close Protection', price: 1200, icon: '🛡️', desc: 'Personal bodyguard' },
  { id: 'event', name: 'Event Security', price: 800, icon: '🎪', desc: 'Crowd control' },
  { id: 'asset', name: 'Asset Protection', price: 600, icon: '🏠', desc: 'Static guarding' },
];

function PayfastForm({ bookingId, amount, onPreparePayment, onPaymentSimulated }: { bookingId: string, amount: number, onPreparePayment: () => Promise<void>, onPaymentSimulated: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // In production, an ITN webhook from Payfast verifies the payment directly with our database.
    // For this demonstration, we optimistically verify and transition the booking before sending to testing sandbox
    try {
      await onPreparePayment();
      
      if (formRef.current) {
         formRef.current.submit();
      }
      
      // Auto-advance the UI gracefully since we open Payfast in a new tab due to Iframe limitations
      setTimeout(() => {
         onPaymentSimulated();
      }, 1500);

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const returnUrl = `${window.location.origin}/dashboard`;
  const cancelUrl = window.location.href;

  return (
    <form 
      ref={formRef}
      target="_blank"
      action={import.meta.env.VITE_PAYFAST_ENVIRONMENT === 'live' ? "https://www.payfast.co.za/eng/process" : "https://sandbox.payfast.co.za/eng/process"} 
      method="POST" 
      onSubmit={handleSubmit} 
      className="mt-4 space-y-4 text-center"
    >
      <input type="hidden" name="merchant_id" value={import.meta.env.VITE_PAYFAST_MERCHANT_ID || "10000100"} />
      <input type="hidden" name="merchant_key" value={import.meta.env.VITE_PAYFAST_MERCHANT_KEY || "46f0cd694581a"} />
      <input type="hidden" name="amount" value={amount.toFixed(2)} />
      <input type="hidden" name="item_name" value={`Aego Security Booking #${bookingId.slice(0, 8)}`} />
      <input type="hidden" name="return_url" value={returnUrl} />
      <input type="hidden" name="cancel_url" value={cancelUrl} />

      <p className="text-zinc-400 text-sm mb-4">You will be redirected to Payfast to complete your payment securely.</p>
      
      <button 
        type="submit"
        disabled={isProcessing}
        className="w-full py-3.5 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin text-zinc-500" /> : <CreditCard className="w-5 h-5" />}
        {isProcessing ? 'Redirecting to Payfast...' : `Pay R${amount.toFixed(2)}`}
      </button>
      
      {/* Fallback button to skip UI jumping for testing purposes */}
      <button
        type="button"
        onClick={async () => {
           setIsProcessing(true);
           await onPreparePayment();
           onPaymentSimulated();
        }}
        className="text-xs text-zinc-500 hover:text-zinc-300 underline mt-4 block mx-auto"
      >
         (Demo) Simulate Payment Completion
      </button>
    </form>
  );
}

export default function BookingForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(user ? 1 : 0);
  const [formData, setFormData] = useState({
    serviceType: '',
    location: '',
    date: '',
    duration: 4,
    details: ''
  });
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<any>({});
  
  // Simulated states for the flow
  const [isMatching, setIsMatching] = useState(false);
  const [matchedCompany, setMatchedCompany] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);

  const selectedService = SERVICES.find(s => s.id === formData.serviceType);
  const totalPrice = selectedService ? selectedService.price * formData.duration : 0;

  // Simulate getting user location
  useEffect(() => {
    if (navigator.geolocation && !formData.location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({ ...prev, location: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)} (Durban Area)` }));
        },
        () => {
          setFormData(prev => ({ ...prev, location: 'Durban, South Africa' }));
        }
      );
    }
  }, [formData.location]);

  useEffect(() => {
    if (user && step === 0) setStep(1);
  }, [user, step]);

  const validateField = (name: string, value: any) => {
    let msg = '';
    if (name === 'serviceType' && !value) msg = 'Please select a service type.';
    if (name === 'location' && !value.trim()) msg = 'Location is required.';
    if (name === 'date' && !value) msg = 'Date and time are required.';
    if (name === 'duration' && (value < 1 || isNaN(value))) msg = 'Duration must be at least 1 hour.';
    
    setFieldErrors((prev: any) => ({ ...prev, [name]: msg }));
    return msg;
  };

  const handleNext = () => {
    if (step === 1) {
      const err = validateField('serviceType', formData.serviceType);
      if (err) return;
    }
    if (step === 2) {
      const locErr = validateField('location', formData.location);
      const dateErr = validateField('date', formData.date);
      const durErr = validateField('duration', formData.duration);
      if (locErr || dateErr || durErr) return;
    }
    setError('');
    setStep(step + 1);
  };

  const onPreparePayment = async () => {
    if (!bookingId || !user) return;
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'pending', // Now it's pending for the company to formally accept
        updatedAt: serverTimestamp()
      });
      
      // Notify Admin
      await addDoc(collection(db, 'notifications'), {
        userId: 'admin',
        type: 'payment',
        title: 'Payment Processing',
        message: `Client initiated payment for booking at ${formData.location}.`,
        read: false,
        createdAt: serverTimestamp(),
      });
      
      // Notify Client
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        type: 'payment',
        title: 'Booking Payment',
        message: `Your payment process has started. Once cleared, a provider will be deployed.`,
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      throw new Error('Failed to prepare booking status.');
    }
  };

  const handleMatch = async () => {
    if (!user) {
      setError('You must be logged in to request security.');
      return;
    }
    setIsMatching(true);
    setStep(3); // Matching step

    try {
      // 1. Create the booking in 'matching' state
      const docRef = await addDoc(collection(db, 'bookings'), {
        clientId: user.uid,
        serviceType: formData.serviceType,
        location: formData.location,
        date: formData.date,
        duration: Number(formData.duration),
        details: formData.details,
        status: 'matching',
        price: totalPrice,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setBookingId(docRef.id);

      // Simulate matching engine delay
      setTimeout(() => {
        // Pseudo logic: if details contains "fail", trigger the "Provider Not Available" flow
        if (formData.details.toLowerCase().includes('fail')) {
          setIsMatching(false);
          setStep(6); // Provider unavailable step
        } else {
          // Simulate finding a provider
          setMatchedCompany({ name: 'Aego Elite Partners', rating: 4.9, distance: '2.1km' });
          setIsMatching(false);
          setStep(4); // Confirm & Pay step
        }
      }, 3000);

    } catch (err) {
      console.error(err);
      setError('Failed to process request. Please try again.');
      setIsMatching(false);
      setStep(2);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 shrink-0">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white tracking-tight">
            <Shield className="w-5 h-5 text-zinc-300" />
            Request Security
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-500">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {step === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
              <Shield className="w-16 h-16 text-zinc-300 mx-auto" />
              <div>
                <h3 className="text-2xl font-bold mb-2 text-white">Sign In Required</h3>
                <p className="text-zinc-400 max-w-sm mx-auto">Please login or create a quick account to track your security request and communicate with the provider.</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Select Service Type</h3>
              {SERVICES.map(service => (
                <button
                  key={service.id}
                  onClick={() => {
                    setFormData({ ...formData, serviceType: service.id });
                    validateField('serviceType', service.id);
                  }}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    formData.serviceType === service.id 
                      ? 'bg-zinc-800/50 border-white text-white' 
                      : fieldErrors.serviceType
                      ? 'bg-red-500/10 border-red-500'
                      : 'bg-black border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium flex items-center gap-2">
                       <span>{service.icon}</span> {service.name}
                    </span>
                    <span className="text-zinc-300 font-medium tracking-wide">R{service.price}/hr</span>
                  </div>
                  <p className="text-sm text-zinc-400 pl-7">{service.desc}</p>
                </button>
              ))}
              {fieldErrors.serviceType && <p className="text-red-500 text-sm mt-2">{fieldErrors.serviceType}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-medium mb-4">Location & Time</h3>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Location (Geofenced)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      validateField('location', e.target.value);
                    }}
                    className={`w-full bg-black border ${fieldErrors.location ? 'border-red-500' : 'border-zinc-800'} rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-white transition-colors`}
                    placeholder="Enter address or use GPS"
                  />
                  {fieldErrors.location && <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Date & Time</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input 
                      type="datetime-local" 
                      value={formData.date}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value });
                        validateField('date', e.target.value);
                      }}
                      className={`w-full bg-black border ${fieldErrors.date ? 'border-red-500' : 'border-zinc-800'} rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm`}
                    />
                    {fieldErrors.date && <p className="text-red-500 text-xs mt-1">{fieldErrors.date}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1.5">Duration (Hours)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input 
                      type="number" 
                      min="1"
                      value={formData.duration}
                      onChange={(e) => {
                        setFormData({ ...formData, duration: Number(e.target.value) });
                        validateField('duration', Number(e.target.value));
                      }}
                      className={`w-full bg-black border ${fieldErrors.duration ? 'border-red-500' : 'border-zinc-800'} rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-white transition-colors`}
                    />
                    {fieldErrors.duration && <p className="text-red-500 text-xs mt-1">{fieldErrors.duration}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Additional Details (Confidential)</label>
                <textarea 
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors h-24 resize-none"
                  placeholder="Describe any specific threats, or type 'fail' to test the no-provider flow..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-zinc-800 rounded-full"></div>
                <div className="w-24 h-24 border-4 border-white border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                <Shield className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Matching Engine Running</h3>
                <p className="text-zinc-400 text-sm max-w-xs mx-auto">
                  Scanning for PSIRA-verified providers within your proximity...
                </p>
              </div>
            </div>
          )}

          {step === 4 && matchedCompany && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-xl font-bold">Provider Found!</h3>
              </div>
              
              <div className="bg-black border border-zinc-800 rounded-xl p-4 transition-all">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-white">{matchedCompany.name}</span>
                  <span className="text-sm bg-zinc-900 border border-zinc-700 text-zinc-300 px-2 py-1 rounded-md">★ {matchedCompany.rating}</span>
                </div>
                <p className="text-sm text-zinc-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {matchedCompany.distance} away</p>
              </div>

              <div className="bg-black border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">{selectedService?.name} ({formData.duration} hrs)</span>
                  <span className="text-zinc-200">R{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Service Fee</span>
                  <span className="text-zinc-200">R{(totalPrice * 0.05).toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-zinc-800 flex justify-between font-medium">
                  <span className="text-zinc-300">Total</span>
                  <span className="text-white tracking-wide">R{(totalPrice * 1.05).toFixed(2)}</span>
                </div>
              </div>

              {bookingId ? (
                <PayfastForm 
                  bookingId={bookingId} 
                  amount={(totalPrice * 1.05)}
                  onPreparePayment={onPreparePayment}
                  onPaymentSimulated={() => setStep(5)}
                />
              ) : (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-white mx-auto" />
                  <p className="text-sm text-zinc-400 mt-2">Preparing secure payment gateway...</p>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-2 border border-green-500/20">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">Booking Confirmed</h3>
                <p className="text-zinc-400 text-sm max-w-sm">Your payment has been successfully processed and your provider is being deployed.</p>
              </div>
              
              <div className="w-full bg-black border border-zinc-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3">
                  <span className="text-zinc-500 text-sm">Booking ID</span>
                  <span className="text-zinc-200 font-mono text-sm tracking-wider">#{bookingId?.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-800/50 pb-3">
                  <span className="text-zinc-500 text-sm">Provider Phase</span>
                  <span className="text-blue-400 flex items-center gap-1.5 text-sm">
                    <Shield className="w-3.5 h-3.5" /> Deployed
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm">Est. Arrival Time</span>
                  <span className="text-white font-medium text-sm">~ 15 Minutes</span>
                </div>
              </div>
              
              <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-6 justify-center">
                <AlertCircle className="w-3.5 h-3.5" /> Emergency SOS is active on arrival.
              </p>
            </div>
          )}

          {step === 6 && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-2 border border-zinc-800">
                <AlertCircle className="w-10 h-10 text-zinc-500" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">No Provider Available</h3>
                <p className="text-zinc-400 text-sm max-w-sm mx-auto">We couldn't find a PSIRA-verified provider matching your criteria in this proximity at this exact time.</p>
              </div>
              
              <div className="w-full bg-black border border-zinc-800 rounded-xl p-5 text-left space-y-3">
                 <p className="text-sm font-medium text-white mb-2">Suggested Alternatives:</p>
                 <ul className="text-sm text-zinc-400 space-y-2 list-disc pl-5">
                   <li>Adjust the requested time or duration</li>
                   <li>Select a different service tier</li>
                   <li>Expand your location area slightly</li>
                 </ul>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-black shrink-0">
          {step === 0 && (
            <button 
              onClick={loginWithGoogle}
              className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Sign In with Google
            </button>
          )}
          {step === 1 && (
            <button 
              onClick={handleNext}
              className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg transition-colors"
            >
              Continue
            </button>
          )}
          {step === 2 && (
            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleMatch}
                className="flex-1 py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Find Provider
              </button>
            </div>
          )}
          {step === 5 && (
            <button 
              onClick={() => {
                onClose();
                window.location.href = '/dashboard';
              }}
              className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg transition-colors shadow-lg"
            >
              Finish & Rate Service (Dashboard)
            </button>
          )}
          {step === 6 && (
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-3.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Change Details
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
