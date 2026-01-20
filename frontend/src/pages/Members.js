import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, Mail, CheckCircle } from 'lucide-react';
import { MobileNav } from '../components/MobileNav';
import { apiClient } from '../utils/auth';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

export const Members = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = members.filter(
        (member) =>
          member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.phone.includes(searchQuery)
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [searchQuery, members]);

  const fetchMembers = async () => {
    try {
      const response = await apiClient.get('/members');
      setMembers(response.data);
      setFilteredMembers(response.data);
    } catch (error) {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-secondary pb-28">
      <div className="bg-gradient-to-br from-primary to-accent p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-heading text-white mb-2">Members Directory</h1>
        <p className="text-white/90">Connect with our community members</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-800" size={20} />
            <Input
              type="text"
              placeholder="Search by name, email, or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="members-search-input"
              className="pl-12 h-12 bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-neutral-800">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12" data-testid="no-members-found">
            <p className="text-neutral-800">No members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="members-list">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-floating transition-all border border-primary/10 relative overflow-hidden group"
                data-testid={`member-card-${index}`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-150 transition-transform" />

                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-white font-bold">
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-800">{member.full_name}</h3>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Active
                      </span>
                      {member.has_paid_current_month ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle size={10} /> Paid
                        </span>
                      ) : (
                        <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-neutral-800">
                    <Mail size={16} className="text-primary" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-800">
                    <Phone size={16} className="text-primary" />
                    <a href={`tel:${member.phone}`} className="hover:text-primary transition-colors">
                      {member.phone}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
};