import { NavLink } from 'react-router-dom';
import { Home, Users, Wallet, PartyPopper, LayoutDashboard, LogOut } from 'lucide-react';
import { getUser, logout } from '../utils/auth';
import { motion } from 'framer-motion';

export const MobileNav = () => {
  const user = getUser();
  const isAdmin = user?.role === 'admin';

  const navItems = isAdmin
    ? [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/content', icon: Home, label: 'Content' },
      ]
    : [
        { to: '/home', icon: Home, label: 'Home' },
        { to: '/members', icon: Users, label: 'Members' },
        { to: '/savings', icon: Wallet, label: 'Savings' },
        { to: '/festivals', icon: PartyPopper, label: 'Festivals' },
      ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-4 right-4 h-16 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl flex justify-around items-center z-50 border border-white/20"
      data-testid="mobile-nav"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          data-testid={`nav-${item.label.toLowerCase()}`}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all ${
              isActive ? 'text-primary' : 'text-neutral-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                size={24}
                strokeWidth={isActive ? 2.5 : 1.5}
                className="transition-all"
              />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
      <button
        onClick={logout}
        data-testid="nav-logout"
        className="flex flex-col items-center justify-center px-4 py-2 rounded-full text-accent transition-all"
      >
        <LogOut size={24} strokeWidth={1.5} />
        <span className="text-xs mt-1 font-medium">Logout</span>
      </button>
    </motion.nav>
  );
};