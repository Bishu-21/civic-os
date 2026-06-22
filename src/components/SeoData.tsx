"use client";

import { OrganizationJsonLd, FAQJsonLd } from 'next-seo';

export default function SeoData() {
  return (
    <>
      <OrganizationJsonLd
        type="Organization"
        logo="/favicon.ico"
        url="https://civic-os-five.vercel.app"
        legalName="Delhi CM Grievance Dashboard"
        name="Delhi CM Grievance Dashboard"
        address={{
          streetAddress: 'Delhi Secretariat, I.P. Estate',
          addressLocality: 'New Delhi',
          addressRegion: 'Delhi',
          postalCode: '110002',
          addressCountry: 'IN',
        }}
        contactPoint={[
          {
            telephone: '+91-11-23397447',
            contactType: 'customer service',
          },
        ]}
      />
      <FAQJsonLd
        questions={[
          {
            question: 'What is the Delhi CM Grievance Dashboard?',
            answer: 'The Delhi CM Grievance Dashboard is an AI-powered public infrastructure platform for the Government of NCT Delhi that allows citizens to report civic issues and track resolutions in real-time.',
          },
          {
            question: 'How can I report a civic issue?',
            answer: 'You can report an issue by logging into the Delhi CM Grievance Dashboard and using the AI Quick-Report tool to describe the problem.',
          },
          {
            question: 'Which departments are covered?',
            answer: 'The platform covers major municipal departments including Sanitation, Electrical, Roads, Public Health, Water supply, and Horticulture.',
          },
        ]}
      />
    </>
  );
}
