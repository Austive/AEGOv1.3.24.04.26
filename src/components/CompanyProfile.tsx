import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Shield, Star, Users, Clock, CheckCircle2 } from 'lucide-react';

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          setCompany(userDoc.data());
        }

        // Fetch profile data
        const profileQuery = query(collection(db, 'company_profiles'), where('companyId', '==', id));
        const profileSnapshot = await getDocs(profileQuery);
        if (!profileSnapshot.empty) {
          setProfile(profileSnapshot.docs[0].data());
        }

        // Fetch reviews
        const reviewsQuery = query(collection(db, 'reviews'), where('companyId', '==', id));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        setReviews(reviewsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (error) {
        console.error("Error fetching company profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen pt-24 flex items-center justify-center"><div className="w-8 h-8 border-4 border-zinc-300 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!company) {
    return <div className="min-h-screen pt-24 flex items-center justify-center text-zinc-400">Company not found.</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-zinc-950 p-8 border-b border-zinc-800 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-zinc-300">
            <Shield className="w-12 h-12 text-zinc-300" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
              {company.displayName}
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </h1>
            <p className="text-zinc-400 mt-2 flex items-center justify-center md:justify-start gap-4">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-zinc-300 fill-zinc-300" /> {profile?.rating || 'New'} ({profile?.reviewCount || 0} reviews)</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {profile?.teamSize || 0} Personnel</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {profile?.responseTime || '--'} min response</span>
            </p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="md:col-span-1 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-zinc-800 pb-2">Services</h3>
              <ul className="space-y-2">
                {profile?.services?.map((service: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-zinc-300">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    {service}
                  </li>
                )) || <li className="text-zinc-500">No services listed.</li>}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-zinc-800 pb-2">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {profile?.specializations?.map((spec: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-full border border-zinc-700">
                    {spec}
                  </span>
                )) || <span className="text-zinc-500">None listed.</span>}
              </div>
            </div>
          </div>

          {/* Right Column: Reviews */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold text-white mb-6 border-b border-zinc-800 pb-2">Client Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-zinc-500">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-zinc-300 fill-zinc-300' : 'text-zinc-700'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-500">
                        {review.createdAt?.toDate().toLocaleDateString() || 'Recent'}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
