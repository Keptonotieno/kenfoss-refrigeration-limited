import { BlogPost } from '../types';
import avatar1 from '../assets/images/testimonial_african_male_1_1785117764247.jpg';
import avatar2 from '../assets/images/testimonial_african_female_1785117777613.jpg';
import avatar3 from '../assets/images/testimonial_african_male_2_1785117789602.jpg';
import coldRoomImg from '../assets/images/service_cold_room_1785117713918.jpg';
import hvacImg from '../assets/images/service_hvac_1785117727139.jpg';
import maintImg from '../assets/images/service_maintenance_1785117752181.jpg';
import fridgeRepairImg from '../assets/images/service_refrigerator_repair_1785117702454.jpg';

export const BLOG_DATA: BlogPost[] = [
  {
    id: '1',
    title: '5 Signs Your Commercial Cold Room is Losing Energy in Nairobi Heat',
    slug: '5-signs-cold-room-losing-energy-kenya',
    category: 'Energy Saving',
    excerpt: 'Rising electricity tariffs in Kenya mean an inefficient cold room can bleed thousands of shillings monthly. Here are 5 critical warnings every facility manager must check.',
    content: `
      Commercial refrigeration accounts for up to 60% of total electrical energy consumption in hotels, food processing plants, and supermarkets across Kenya. In ambient temperatures reaching 30°C in Nairobi, Mombasa, or Kisumu, slight equipment degradation quickly inflates power bills.

      ### 1. Persistent Frost Formation on Evaporator Coils
      When ice accumulates on evaporator fins, heat transfer efficiency plummets by up to 40%. This is usually caused by failing defrost heaters, faulty defrost timers, or worn door gaskets allowing warm humid air inside.

      ### 2. Compressor Running Continuously Without Cycling Off
      A healthy refrigeration compressor should cycle off when the digital thermostat reaches its setpoint. Continuous operation indicates gas leakage, worn valve plates, or inadequate PUF panel insulation.

      ### 3. Worn or Cracked Magnetic Door Gaskets
      Check your cold room door seals. A tiny 2mm gap along a cold room door frame can leak over KSh 25,000 worth of cooled air every month.

      ### 4. High Condenser Discharge Pressure & Dust Build-up
      Kenyan dusty roads and industrial environments coat condenser coils in dirt. Regular chemical coil washing reduces head pressure and lowers power draw by up to 18%.

      ### 5. Fluctuating Internal Storage Temperatures
      If internal temperatures bounce between +2°C and +11°C, your thermostatic expansion valve (TEV) or electronic expansion controller requires calibration before food spoilage occurs.

      Need a professional energy audit for your commercial cold room? Contact Kenfoss Refrigeration today for a certified thermographic audit!
    `,
    author: {
      name: 'Eng. Kelvin Njuguna',
      role: 'Lead Refrigeration Systems Specialist',
      avatar: avatar1
    },
    date: '15 July 2026',
    readTime: '5 min read',
    image: coldRoomImg,
    tags: ['Cold Rooms', 'Energy Saving', 'Kenya Power', 'Commercial Maintenance']
  },
  {
    id: '2',
    title: 'R22 Refrigerant Phase-Out in Kenya: What Business Owners Must Know',
    slug: 'r22-refrigerant-phaseout-kenya-guide',
    category: 'Refrigeration',
    excerpt: 'Under the Montreal Protocol and NEMA guidelines, hydrochlorofluorocarbons (HCFCs) like R22 are being phased out in Kenya. Learn how to retrofit your cooling systems safely.',
    content: `
      As Kenya strengthens environmental protection laws under NEMA and EPRA guidelines, imported R22 gas prices have skyrocketed, and pure R22 will soon be completely restricted. Business owners running older air conditioners and chillers must understand their options.

      ### Should You Retrofit or Replace?
      - **Drop-in Replacements:** Gases like R407C or R422D can be retrofitted into existing systems with minor polyolester (POE) oil adjustments.
      - **Complete Inverter Upgrade:** Modern R32 and R410A inverter systems use up to 45% less power than legacy R22 fixed-speed units, providing an ROI in less than 18 months.

      Kenfoss offers seamless refrigerant recovery and eco-friendly gas conversions compliant with National Environment Management Authority standards.
    `,
    author: {
      name: 'Eng. Patrick Omondi',
      role: 'HVAC & Environmental Compliance Lead',
      avatar: avatar3
    },
    date: '02 June 2026',
    readTime: '7 min read',
    image: hvacImg,
    tags: ['NEMA', 'Eco-Refrigerants', 'R22 Retrofit', 'HVAC Kenya']
  },
  {
    id: '3',
    title: 'How Preventive Maintenance (AMC) Prevents Spoilage in Supermarkets',
    slug: 'preventive-maintenance-supermarkets-kenya',
    category: 'Maintenance',
    excerpt: 'A single night compressor failure can ruin millions in meat, dairy, and fresh produce. Discover how quarterly AMC audits protect supermarket bottom lines.',
    content: `
      Supermarkets across Nairobi and Kiambu depend heavily on un-interrupted cold storage. Our quarterly preventive maintenance contracts ensure that electrical contactors, digital controllers, and refrigerant pressure levels are thoroughly tested before breakdowns happen.
    `,
    author: {
      name: 'Eng. Kelvin Njuguna',
      role: 'Lead Refrigeration Systems Specialist',
      avatar: avatar1
    },
    date: '20 May 2026',
    readTime: '4 min read',
    image: maintImg,
    tags: ['Supermarkets', 'Preventive Maintenance', 'Food Safety']
  },
  {
    id: '4',
    title: 'How to Prevent Double Door Fridge Freezing & Ice Build-up',
    slug: 'prevent-double-door-fridge-freezing-kenya',
    category: 'Maintenance',
    excerpt: 'Is your home or restaurant double-door refrigerator creating a thick glacier behind the freezer drawers? Here is a step-by-step diagnostic breakdown from our field technicians.',
    content: `
      Ice buildup in frost-free refrigerators (Samsung Inverter, LG Linear, Bosch NoFrost) is one of the most common service calls we receive in Nairobi homes and restaurants.

      ### Common Causes:
      1. **Blocked Defrost Drain Hole:** Meltwater cannot drain into the rear evaporation pan, freezing into solid ice blocks.
      2. **Burnt Defrost Heater or Thermo-fuse:** Prevents the automated 8-hour heating cycle.
      3. **Faulty Defrost Sensor / Bimetal Thermostat:** Fails to signal the PCB controller to initiate defrosting.
      4. **Damaged Magnetic Door Seal:** Warm air continuously bleeds inside, condensing into frost.

      If your fridge is icing up or stopped cooling at the bottom compartment, call Kenfoss for on-site same-day diagnostic service!
    `,
    author: {
      name: 'Mercy Chebet',
      role: 'Senior Appliance Technical Specialist',
      avatar: avatar2
    },
    date: '20 May 2026',
    readTime: '4 min read',
    image: fridgeRepairImg,
    tags: ['Appliance Repair', 'Samsung Fridge', 'LG Fridge', 'Home Advice']
  }
];

export const BLOG_POSTS_DATA = BLOG_DATA;
