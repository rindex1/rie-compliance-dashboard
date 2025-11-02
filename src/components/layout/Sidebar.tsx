'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  AlertTriangle,
  CheckCircle,
  FileText,
  Settings,
  Users,
  Shield,
  Menu,
  X,
  Building2,
  Calendar,
  BarChart3,
  LogOut
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Risico Inventarisatie',
    href: '/risks',
    icon: AlertTriangle,
    children: [
      { name: 'Nieuwe Beoordeling', href: '/risks/new' },
      { name: 'Lopende Beoordelingen', href: '/risks/ongoing' },
      { name: 'Beoordelingsgeschiedenis', href: '/risks/history' },
    ],
  },
  {
    name: 'Acties',
    href: '/actions',
    icon: CheckCircle,
    children: [
      { name: 'Open Acties', href: '/actions/open' },
      { name: 'Voltooide Acties', href: '/actions/completed' },
      { name: 'Achterstallige Items', href: '/actions/overdue' },
    ],
  },
  {
    name: 'Rapporten',
    href: '/reports',
    icon: FileText,
    children: [
      { name: 'RI&E Genereren', href: '/reports/rie' },
      { name: 'Plan van Aanpak', href: '/reports/action-plan' },
      { name: 'Compliance Rapporten', href: '/reports/compliance' },
      { name: 'Aangepaste Rapporten', href: '/reports/custom' },
    ],
  },
  {
    name: 'Instellingen',
    href: '/settings',
    icon: Settings,
    children: [
      { name: 'Bedrijfsprofiel', href: '/settings/company' },
      { name: 'Gebruikersbeheer', href: '/settings/users' },
      { name: 'Risicocategorieën', href: '/settings/risk-categories' },
      { name: 'Sjablonen', href: '/settings/templates' },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-brand-navy border-r border-brand-gold/20 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-brand-gold/20">
            <Shield className="h-8 w-8 text-brand-gold" />
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-white">RI&E Dashboard</h1>
              <p className="text-sm text-brand-gold/80">Compliance Management</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname === item.href
                      ? 'bg-white text-gray-900'
                      : 'text-white hover:bg-white/10'
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
                {item.children && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                          pathname === child.href
                            ? 'bg-white/10 text-white'
                            : 'text-white/80 hover:bg-white/5'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User info */}
          <div className="px-4 py-4 border-t border-brand-gold/20 space-y-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-brand-gold flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-900">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'Gebruiker'}
                </p>
                <p className="text-xs text-brand-gold/80 truncate">
                  {user?.email || ''}
                </p>
                <p className="text-xs text-white/60 mt-0.5">
                  {user?.role === 'ADMIN' ? 'Beheerder' : 
                   user?.role === 'MANAGER' ? 'Manager' :
                   user?.role === 'EMPLOYEE' ? 'Medewerker' :
                   'Adviseur'}
                </p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
