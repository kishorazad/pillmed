import React from 'react';
import SEO from './SEO';

/**
 * Specialized SEO component for the Communication page
 * Implements communication-specific metadata and structured data
 */
const CommunicationSEO: React.FC = () => {
  // Create communication-specific keywords based on most common search terms
  const keywords = [
    'healthcare communication',
    'doctor chat',
    'medical video call',
    'healthcare tasks',
    'secure medical messaging',
    'virtual consultation',
    'online doctor appointment',
    'telehealth',
    'healthcare reminders',
    'medication schedule',
    'health task management',
    'doctor video chat',
    'medical appointments',
    'follow-up reminders',
    'secure patient communication'
  ];

  // Create communication page description with special focus on key services
  const description = 'Communicate securely with doctors and healthcare providers. Send messages, have video consultations, and manage your healthcare tasks in one place. PillNow offers secure, encrypted communication for all your healthcare needs.';

  // Create structured data for the Organization and WebApplication
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PillNow Communication Center',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1284',
      bestRating: '5',
      worstRating: '1'
    }
  };

  return (
    <SEO
      title="Secure Healthcare Communication | Chat, Video & Tasks | PillNow"
      description={description}
      keywords={keywords}
      structuredData={structuredData}
    />
  );
};

export default CommunicationSEO;