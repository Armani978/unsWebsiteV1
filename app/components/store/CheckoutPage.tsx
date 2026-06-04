'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, CheckCircle, Minus, Plus, Trash2, CreditCard, Banknote } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useStore } from '../../context/StoreContext';

export default function CheckoutPage() {
  const { cart, cartSubtotal, cartTax, cartTotal, cartCount, updateCartQty, removeFromCart, clearCart, addSale } = useStore();
  const router = useRouter();
  const [step, setStep] = useState<'cart' | 'info' | 'confirm'>('cart');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

  const handlePlaceOrder = () => {
    addSale({
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        sku: i.product.sku,
        price: i.product.price,
        quantity: i.quantity,
      })),
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      paymentMethod,
      timestamp: new Date().toISOString(),
      cashier: 'Online',
      customerName: form.name || 'Online Customer',
    });
    clearCart();
    setStep('confirm');
  };

  if (step === 'confirm') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="mb-2">Order Confirmed!</h2>
        <p className="text-muted-foreground mb-6">
          Thanks {form.name || 'for your order'}! You'll receive a confirmation at {form.email || 'your email'}.
        </p>
        <Button onClick={() => router.push('/store')} className="w-full max-w-xs">
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button asChild variant="outline"><Link href="/store">Back to Shop</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/store" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <h1 className="mb-6">{step === 'cart' ? 'Your Cart' : 'Checkout'}</h1>

      {/* Step tabs */}
      <div className="flex items-center gap-4 mb-8 text-sm">
        {(['cart', 'info'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition-colors ${step === s || (i === 0 && step === 'info') ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'}`}>
              {i + 1}
            </div>
            <span className={step === s ? 'font-medium' : 'text-muted-foreground capitalize'}>{s === 'info' ? 'Information' : 'Cart'}</span>
            {i === 0 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart or Info form */}
        <div className="lg:col-span-2 space-y-4">
          {step === 'cart' && (
            <>
              {cart.map(item => (
                <div key={item.product.id} className="flex gap-4 p-4 border border-border rounded-xl bg-card">
                  <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg border border-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-snug">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.product.sku}</p>
                    <p className="text-sm font-medium mt-1">${item.product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button onClick={() => updateCartQty(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-accent transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-accent transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <Button className="w-full" onClick={() => setStep('info')}>
                Proceed to Checkout
              </Button>
            </>
          )}

          {step === 'info' && (
            <div className="space-y-4">
              <div className="border border-border rounded-xl p-5 bg-card space-y-4">
                <h3>Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 000-0000" className="mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-xl p-5 bg-card space-y-3">
                <h3>Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['card', 'cash'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${paymentMethod === method ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`}
                    >
                      {method === 'card' ? <CreditCard className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                      <span className="text-sm font-medium capitalize">{method === 'card' ? 'Credit/Debit' : 'Cash (Pickup)'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('cart')} className="w-1/3">Back</Button>
                <Button onClick={handlePlaceOrder} className="flex-1" disabled={!form.name || !form.email}>
                  Place Order — ${cartTotal.toFixed(2)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="border border-border rounded-xl p-5 bg-card h-fit space-y-3 sticky top-24">
          <h3>Order Summary</h3>
          <div className="space-y-2 text-sm">
            {cart.map(item => (
              <div key={item.product.id} className="flex justify-between text-muted-foreground">
                <span className="line-clamp-1 flex-1 mr-2">{item.product.name} × {item.quantity}</span>
                <span className="shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({cartCount} items)</span>
              <span>${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>${cartTax.toFixed(2)}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
