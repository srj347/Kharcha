import type { CategoryTint } from './types';

export interface DefaultCategory {
  name: string;
  icon: string; // SF Symbol name
  tint: CategoryTint;
  description: string;
  keywords: string;
}

// Seeded once, in the first migration. Descriptions and keywords are sent to
// the on-device AI model as hints, so they name Indian merchants on purpose.
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: 'Food',
    icon: 'fork.knife',
    tint: 'green',
    description: 'restaurants, food delivery, snacks, tea and coffee',
    keywords: 'swiggy,zomato,restaurant,cafe,chai,coffee,lunch,dinner,breakfast,pizza,dominos,mcdonalds,kfc,starbucks,biryani',
  },
  {
    name: 'Groceries',
    icon: 'cart',
    tint: 'amber',
    description: 'supermarkets, quick commerce, vegetables, milk and household supplies',
    keywords: 'blinkit,zepto,bigbasket,instamart,dmart,jiomart,grocery,vegetables,milk,fruits,kirana',
  },
  {
    name: 'Travel',
    icon: 'car',
    tint: 'blue',
    description: 'cabs, autos, metro, fuel, trains, flights, parking and tolls',
    keywords: 'uber,ola,rapido,metro,auto,cab,petrol,diesel,fuel,irctc,train,flight,indigo,parking,toll,fastag,bus',
  },
  {
    name: 'Shopping',
    icon: 'bag',
    tint: 'purple',
    description: 'clothes, shoes, electronics and online shopping',
    keywords: 'amazon,flipkart,myntra,ajio,meesho,nykaa,clothes,shoes,croma',
  },
  {
    name: 'Bills',
    icon: 'doc.text',
    tint: 'slate',
    description: 'phone, internet, electricity, rent, subscriptions and recharges',
    keywords: 'airtel,jio,vi,electricity,wifi,broadband,rent,netflix,spotify,prime,hotstar,recharge,gas,water,emi',
  },
  {
    name: 'Fun',
    icon: 'ticket',
    tint: 'rose',
    description: 'movies, events, outings, parties and games',
    keywords: 'movie,pvr,inox,bookmyshow,concert,party,game,outing',
  },
  {
    name: 'Health',
    icon: 'cross.case',
    tint: 'teal',
    description: 'doctor, medicine, pharmacy, tests and gym',
    keywords: 'pharmacy,medicine,doctor,hospital,apollo,pharmeasy,1mg,gym,cult,lab',
  },
  {
    name: 'Other',
    icon: 'square.grid.2x2',
    tint: 'orange',
    description: 'anything that fits no other category, for example a gift or a donation',
    keywords: '',
  },
];
