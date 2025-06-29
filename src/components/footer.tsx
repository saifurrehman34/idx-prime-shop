import { Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { NewsletterForm } from './newsletter-form';

export function Footer() {
  return (
    <footer className="bg-black text-white mt-16 md:mt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Exclusive</h3>
            <p>Subscribe</p>
            <p className="text-sm">Get 10% off your first order</p>
            <NewsletterForm />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-xl">Support</h4>
            <p className="text-sm leading-relaxed">
              111 Bijoy sarani, Dhaka,  DH 1515, Bangladesh.
            </p>
            <p className="text-sm">exclusive@gmail.com</p>
            <p className="text-sm">+88015-88888-9999</p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-xl">Account</h4>
            <ul className="space-y-2">
              <li><Link href="/user/home" className="text-sm hover:underline">My Account</Link></li>
              <li><Link href="/login" className="text-sm hover:underline">Login / Register</Link></li>
              <li><Link href="#" className="text-sm hover:underline">Cart</Link></li>
              <li><Link href="/user/wishlist" className="text-sm hover:underline">Wishlist</Link></li>
              <li><Link href="#" className="text-sm hover:underline">Shop</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-xl">Quick Link</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm hover:underline">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm hover:underline">Terms Of Use</Link></li>
              <li><Link href="#" className="text-sm hover:underline">FAQ</Link></li>
              <li><Link href="#" className="text-sm hover:underline">Contact</Link></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-xl">Download App</h4>
            <p className="text-xs text-gray-400">Save $3 with App New User Only</p>
            <div className="flex items-center gap-2">
                <div className="w-20 h-20 bg-gray-700"></div>
                <div className="flex flex-col gap-2">
                    <div className="w-28 h-8 bg-gray-700"></div>
                    <div className="w-28 h-8 bg-gray-700"></div>
                </div>
            </div>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook"><Facebook className="h-6 w-6" /></Link>
              <Link href="#" aria-label="Twitter"><Twitter className="h-6 w-6" /></Link>
              <Link href="#" aria-label="Instagram"><Instagram className="h-6 w-6" /></Link>
              <Link href="#" aria-label="Linkedin"><Linkedin className="h-6 w-6" /></Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4">
        <p className="text-gray-500 text-sm">&copy; Copyright, Verdant Market 2025. all rights reserved.</p>
        <p className="text-gray-500 text-xs mt-1">Developed by Saif Ur Rehman, SMIT WMAD-8 RN# 308591</p>
      </div>
    </footer>
  );
}
