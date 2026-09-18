import RateItem from './models/RateItem';
import Hospital from './models/Hospital';
import rawRatelistData from '../../data/ratelist.json';

const INITIAL_HOSPITALS = [
  {
    id: 'hosp-1',
    name: 'Max Super Speciality Hospital, Saket, New Delhi',
    address: '1, 2, Press Enclave Marg, Saket Institutional Area, New Delhi-110017',
    isPanel: true,
    type: 'NABH'
  },
  {
    id: 'hosp-2',
    name: 'Fortis Escorts Heart Institute, Okhla, New Delhi',
    address: 'Okhla Road, Sukhdev Vihar, New Delhi-110025',
    isPanel: true,
    type: 'Super Speciality'
  },
  {
    id: 'hosp-3',
    name: 'Apollo Hospitals, Sarita Vihar, Delhi',
    address: 'Delhi-Mathura Road, Sarita Vihar, New Delhi-110076',
    isPanel: true,
    type: 'NABH'
  },
  {
    id: 'hosp-4',
    name: 'BLK-Max Super Speciality Hospital, Pusa Road, New Delhi',
    address: 'Pusa Road, Rajinder Nagar, New Delhi-110005',
    isPanel: true,
    type: 'NABH'
  },
  {
    id: 'hosp-5',
    name: 'Sir Ganga Ram Hospital, Rajinder Nagar, New Delhi',
    address: 'Rajinder Nagar, New Delhi-110060',
    isPanel: true,
    type: 'NABH'
  },
  {
    id: 'hosp-6',
    name: 'Dharamshila Narayana Superspeciality Hospital, Vasundhara Enclave, Delhi',
    address: 'Metro Station, Vasundhara Enclave, Near Ashok Nagar, Delhi-110096',
    isPanel: true,
    type: 'NABH'
  },
  {
    id: 'hosp-7',
    name: 'Venkateshwar Hospital, Dwarka, Sector 18A, New Delhi',
    address: 'Sector 18A, Dwarka, New Delhi-110075',
    isPanel: true,
    type: 'NABH'
  },
  {
    id: 'hosp-8',
    name: 'Manipal Hospital, Dwarka, Sector 6, New Delhi',
    address: 'Sector 6, Dwarka, New Delhi-110075',
    isPanel: true,
    type: 'NABH'
  },
  {
    id: 'hosp-9',
    name: 'Holy Family Hospital, Okhla Road, New Delhi',
    address: 'Okhla Road, New Delhi-110025',
    isPanel: true,
    type: 'NABH'
  },
  {
    id: 'hosp-10',
    name: 'St. Stephen\'s Hospital, Tis Hazari, Delhi',
    address: 'Tis Hazari, Delhi-110054',
    isPanel: true,
    type: 'NABH'
  },
  {
    id: 'other',
    name: '✍️ Enter Other / Non-Empanelled Hospital Manually...',
    address: '',
    isPanel: false,
    type: 'non-NABH'
  }
];

export async function ensureDatabaseSeeded(): Promise<void> {
  try {
    const rateCount = await RateItem.countDocuments();
    if (rateCount === 0) {
      const itemsToInsert = Array.isArray(rawRatelistData)
        ? rawRatelistData
        : (rawRatelistData as any).rateListArray || [];

      console.log(`Seeding ${itemsToInsert.length} CGHS rate items into MongoDB Atlas...`);
      if (itemsToInsert.length > 0) {
        await RateItem.insertMany(itemsToInsert, { ordered: false });
        console.log('Successfully seeded CGHS rate list to MongoDB Atlas!');
      }
    }

    const hospCount = await Hospital.countDocuments();
    if (hospCount === 0) {
      console.log('Seeding empanelled hospitals into MongoDB Atlas...');
      await Hospital.insertMany(INITIAL_HOSPITALS, { ordered: false });
      console.log('Successfully seeded hospitals to MongoDB Atlas!');
    }
  } catch (err) {
    console.warn('Database seeding warning:', (err as Error).message);
  }
}
