'use client';

import { useState, useMemo } from 'react';
import { Search, Users, DollarSign, TrendingUp, Star } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useStore } from '../../context/StoreContext';

export default function Customers() {
  const { customers } = useStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(c => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q));
  }, [customers, search]);

  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgSpend = customers.length > 0 ? totalSpent / customers.length : 0;
  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3).map(c => c.id);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1>Customers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{customers.length} registered customers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Customers', value: customers.length, icon: Users },
          { label: 'Total Revenue', value: `$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign },
          { label: 'Avg. Lifetime Spend', value: `$${avgSpend.toFixed(2)}`, icon: TrendingUp },
        ].map(s => (
          <div key={s.label} className="border border-border rounded-xl p-4 bg-card">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
            <p className="font-semibold text-xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Customer</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Contact</th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Visits</th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Total Spent</th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">Last Visit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(customer => (
              <tr key={customer.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold shrink-0">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium">{customer.name}</p>
                        {topCustomers.includes(customer.id) && (
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Joined {new Date(customer.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-xs text-muted-foreground">{customer.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{customer.phone}</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <Badge variant="secondary">{customer.visitCount}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-semibold">${customer.totalSpent.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground text-xs hidden sm:table-cell">
                  {new Date(customer.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No customers found</p>
          </div>
        )}
      </div>
    </div>
  );
}
