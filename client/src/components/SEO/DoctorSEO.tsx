import React from 'react';
import SEOHead from './SEOHead';

interface DoctorSEOProps {
  specialty?: string;
  condition?: string;
  location?: string;
  doctor?: {
    id?: number;
    name?: string;
    specialty?: string;
    hospitalName?: string;
    location?: string;
    about?: string;
    image?: string;
  };
  isSearchPage?: boolean;
  isDetailPage?: boolean;
}

const DoctorSEO: React.FC<DoctorSEOProps> = ({
  specialty,
  condition,
  location,
  doctor,
  isSearchPage = false,
  isDetailPage = false
}) => {
  // Build SEO title based on available info
  let title = '';
  let description = '';
  let keywords: string[] = [];
  let ogType = 'website';
  let canonicalUrl = '';
  let structuredData = {};

  if (isDetailPage && doctor) {
    // Doctor profile page SEO
    title = `${doctor.name} - ${doctor.specialty} in ${doctor.location} | Book Appointment Online`;
    description = `Book an appointment with ${doctor.name}, ${doctor.specialty} at ${doctor.hospitalName}. View profile, education, experience, and book online consultation.`;
    keywords = [
      doctor.name || '',
      doctor.specialty || '',
      'doctor',
      'appointment',
      'consultation',
      'medical specialist',
      doctor.location || '',
      'online doctor',
      'book doctor appointment',
      'healthcare professional'
    ].filter(Boolean);
    canonicalUrl = `/doctors/${doctor.id}`;
    ogType = 'profile';

    // Schema.org structured data for doctor profile
    structuredData = {
      "@context": "https://schema.org",
      "@type": "Physician",
      "name": doctor.name,
      "description": doctor.about,
      "medicalSpecialty": doctor.specialty,
      "workLocation": {
        "@type": "Hospital",
        "name": doctor.hospitalName,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": doctor.location
        }
      },
      "image": doctor.image,
      "url": `https://pillnow.com/doctors/${doctor.id}`
    };
  } else if (isSearchPage) {
    // Doctor search page SEO
    const locationText = location ? `in ${location}` : '';
    const conditionText = condition ? `for ${condition}` : '';
    const specialtyText = specialty && specialty !== 'all' ? specialty : 'Top Doctors';

    title = `${specialtyText} ${locationText} ${conditionText} | Find & Book Appointments`;
    title = title.trim();
    
    description = `Find and book appointments with the best ${specialtyText.toLowerCase()} ${locationText.toLowerCase()} ${conditionText.toLowerCase()}. View profiles, patient reviews, and book instant online consultations or in-person visits.`;
    description = description.trim().replace(/\s+/g, ' ');
    
    keywords = [
      specialty || 'doctors',
      condition || '',
      location || '',
      'medical consultation',
      'online doctor',
      'book appointment',
      'specialist doctor',
      'healthcare',
      'medical professional',
      'doctor near me',
      'doctor consultation',
      'specialist near me'
    ].filter(Boolean);

    // Build canonical URL
    let searchParams = [];
    if (specialty && specialty !== 'all') searchParams.push(`specialty=${encodeURIComponent(specialty)}`);
    if (condition) searchParams.push(`condition=${encodeURIComponent(condition)}`);
    if (location && location !== 'all') searchParams.push(`location=${encodeURIComponent(location)}`);
    
    canonicalUrl = `/doctors${searchParams.length > 0 ? `?${searchParams.join('&')}` : ''}`;

    // Schema.org structured data for search page
    structuredData = {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "about": {
        "@type": "MedicalSpecialty",
        "name": specialty || "General Medicine"
      },
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `How to find the best ${specialty || 'doctors'} ${locationText}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `You can find the best ${specialty || 'doctors'} ${locationText} on PillNow by checking their qualifications, experience, and patient reviews. Book video consultations or in-person appointments easily.`
            }
          },
          {
            "@type": "Question",
            "name": `What are the common symptoms that need a ${specialty || 'doctor'}'s attention?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Common symptoms that require a ${specialty || 'doctor'}'s consultation include persistent pain, fever, unusual changes in bodily functions, and chronic conditions. Consult a specialist for proper diagnosis and treatment.`
            }
          }
        ]
      }
    };
  } else {
    // Default SEO for doctor section
    title = "Find Doctors & Book Appointments Online | Consult Top Specialists";
    description = "Find the best doctors near you, book appointments online, and get instant video consultations. Consult with top specialists for all your healthcare needs.";
    keywords = [
      'find doctor',
      'book doctor appointment',
      'online doctor consultation',
      'specialist doctor',
      'medical consultation',
      'top doctors',
      'health specialist',
      'video consultation',
      'doctor near me'
    ];
    canonicalUrl = "/doctors";

    // Schema.org structured data for doctor landing page
    structuredData = {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "name": "Find and Book Doctor Appointments Online",
      "description": description,
      "mainContentOfPage": {
        "@type": "WebPageElement",
        "isPartOf": {
          "@id": "https://pillnow.com/doctors"
        }
      }
    };
  }

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      canonicalUrl={canonicalUrl}
      ogType={ogType as 'website' | 'article' | 'product'}
      structuredData={structuredData}
    />
  );
};

export default DoctorSEO;