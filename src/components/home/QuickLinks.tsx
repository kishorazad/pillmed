import React from 'react';
import { Link } from 'wouter';

interface QuickLink {
  id: number;
  name: string;
  icon: string;
  color: string;
  link: string;
}

const quickLinks: QuickLink[] = [
  {
    id: 1,
    name: 'Medicines',
    icon: '💊',
    color: 'bg-teal-100 text-teal-700',
    link: '/products'
  },
  {
    id: 2,
    name: 'Lab Tests',
    icon: '🔬',
    color: 'bg-blue-100 text-blue-700',
    link: '/lab-tests'
  },
  {
    id: 3,
    name: 'Doctors',
    icon: '🩺',
    color: 'bg-purple-100 text-purple-700',
    link: '/doctors'
  },
  {
    id: 4,
    name: 'Health Articles',
    icon: '📚',
    color: 'bg-amber-100 text-amber-700',
    link: '/articles'
  },
  {
    id: 5,
    name: 'Orders',
    icon: '🛒',
    color: 'bg-green-100 text-green-700',
    link: '/profile?tab=orders'
  }
];

const QuickLinks: React.FC = () => {
  return (
    <div className="flex overflow-x-auto gap-3 pb-2 my-4 hide-scrollbar">
      {quickLinks.map((link) => (
        <Link key={link.id} href={link.link}>
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 cursor-pointer">
            <div className={`w-12 h-12 rounded-full ${link.color} flex items-center justify-center mb-1 text-xl`}>
              <span role="img" aria-label={link.name}>{link.icon}</span>
            </div>
            <span className="text-xs font-medium text-center">{link.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuickLinks;