'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Receipt, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useStore } from '../../context/StoreContext';

export default function SalesHistory() {
  const { sales } = useStore();
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('30');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const days = parseInt(period);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const q = search.toLowerCase();
    return sales.filter(s => {
      const inPeriod = new Date(s.timestamp) >= cutoff;
      const matchSearch = !q || s.id.toLowerCase().includes(q) || (s.customerName || '').toLowerCase().includes(q) || s.cashier.toLowerCase().includes(q);
      return inPeriod && matchSearch;
    });
  }, [sales, search, period]);

  const totalRevenue = filtered.reduce((s, t) => s + t.total, 0);
  const totalOrders = filtered.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const cardSales = filtered.filter(s => s.paymentMethod === 'card').length;

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1>Sales History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All transactions · sorted by newest first</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign },
          { label: 'Transactions', value: totalOrders, icon: Receipt },
          { label: 'Avg. Order', value: `$${avgOrder.toFixed(2)}`, icon: TrendingUp },
          { label: 'Card Payments', value: `${cardSales}/${totalOrders}`, icon: ShoppingCart },
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

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by ID, customer, cashier..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Today</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium w-8"></th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Transaction</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden sm:table-cell">Customer</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium hidden md:table-cell">Cashier</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Payment</th>
              <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(sale => (
              <React.Fragment key={sale.id}>
                <tr
                  className="hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => toggle(sale.id)}
                >
                  <td className="px-4 py-3">
                    {expanded.has(sale.id)
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    }
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-medium">{sale.id}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(sale.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">{sale.customerName || 'Walk-in'}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{sale.cashier}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs capitalize">{sale.paymentMethod}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">${sale.total.toFixed(2)}</td>
                </tr>
                {expanded.has(sale.id) && (
                  <tr key={`${sale.id}-exp`} className="bg-muted/10">
                    <td colSpan={6} className="px-8 py-3">
                      <div className="space-y-1.5 text-xs">
                        {sale.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{item.productName} <span className="font-mono">×{item.quantity}</span></span>
                            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between border-t border-border pt-1.5 mt-1.5">
                          <span className="text-muted-foreground">Subtotal / Tax / Total</span>
                          <span className="font-medium">${sale.subtotal.toFixed(2)} + ${sale.tax.toFixed(2)} = ${sale.total.toFixed(2)}</span>
                        </div>
                        {sale.paymentMethod === 'cash' && sale.cashGiven && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Cash / Change</span>
                            <span className="text-green-600 font-medium">${sale.cashGiven?.toFixed(2)} / ${sale.change?.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
