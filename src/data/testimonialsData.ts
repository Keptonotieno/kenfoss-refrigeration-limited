import { TestimonialItem } from '../types';
import avatar1 from '../assets/images/testimonial_african_male_1_1785117764247.jpg';
import avatar2 from '../assets/images/testimonial_african_female_1785117777613.jpg';
import avatar3 from '../assets/images/testimonial_african_male_2_1785117789602.jpg';
import peakAppliancesLogo from '../assets/images/peak_appliances_logo_1785118215127.jpg';

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: '1',
    name: 'Steve Kariuki',
    role: 'Verified Customer',
    company: 'Commercial Refrigeration Client',
    location: 'Nairobi / Kiambu',
    rating: 5,
    comment: 'I’m extremely impressed with the service I received from Kenfoss Refrigeration Limited. My commercial refrigerator stopped cooling unexpectedly, and their technician arrived promptly, diagnosed the issue within minutes, and completed the repair professionally. The pricing was fair, communication was excellent, and the entire process was smooth. I highly recommend Kenfoss to anyone looking for reliable refrigeration repair services.',
    avatar: avatar1,
    verifiedService: 'Commercial Refrigerator Repair',
    date: 'Verified Google Review'
  },
  {
    id: '2',
    name: 'Tally Bobo',
    role: 'Verified Customer',
    company: 'Residential Refrigerator Service',
    location: 'Ruiru, Kiambu County',
    rating: 5,
    comment: 'Outstanding customer service from start to finish. The technician explained the fault clearly, repaired my refrigerator efficiently, and even shared useful maintenance tips to help prevent future problems. It\'s refreshing to work with a company that values professionalism and customer satisfaction. I will definitely recommend Kenfoss Refrigeration Limited to my family and friends.',
    avatar: avatar2,
    verifiedService: 'Refrigerator Repair Service',
    date: 'Verified Google Review'
  },
  {
    id: '3',
    name: 'Ernest Mburu',
    role: 'Verified Customer',
    company: 'Appliance & Cooling Client',
    location: 'Thika Superhighway Region',
    rating: 5,
    comment: 'Kenfoss Refrigeration Limited exceeded my expectations. Their team was punctual, knowledgeable, and highly professional throughout the repair process. The appliance was restored to perfect working condition, and the workmanship was exceptional. If you\'re looking for trusted refrigeration and appliance repair experts, this is the company to call.',
    avatar: avatar3,
    verifiedService: 'Appliance & Cooling Repair',
    date: 'Verified Google Review'
  },
  {
    id: '4',
    name: 'Peak Appliances',
    role: 'Local Guide Level 1',
    company: 'Commercial Cold Room Project',
    location: 'Kenya',
    rating: 5,
    comment: 'We partnered with Kenfoss Refrigeration Limited for the installation of a commercial cold room, and the experience was excellent from consultation through completion. Their engineers demonstrated exceptional technical expertise, delivered the project on schedule, and maintained high standards of workmanship. We look forward to working with them again on future projects.',
    avatar: peakAppliancesLogo,
    verifiedService: 'Commercial Cold Room Installation',
    date: 'Verified Google Review'
  }
];

