import fs from 'fs';
import path from 'path';

export interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  affiliation: string; // City or College
  interests: string[];
  photo: string;
  likedCurrentUser: boolean; // Strictly server-side only!
}

export interface UserState {
  swipedIds: string[];
  likedIds: string[];
  matchedIds: string[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const PROFILES_PATH = path.join(DATA_DIR, 'profiles.json');
const STATE_PATH = path.join(DATA_DIR, 'userState.json');

const SEED_PROFILES: Profile[] = [
  { id: 'p1', name: 'Aarav', age: 21, bio: 'Building side projects & hunting for the best cold brew in town.', affiliation: 'IIT Delhi', interests: ['Tech', 'Coffee', 'Running'], photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80', likedCurrentUser: true },
  { id: 'p2', name: 'Ananya', age: 20, bio: 'Design student. Always down for late-night momos and indie gigs.', affiliation: 'NIFT Mumbai', interests: ['Design', 'Indie Music', 'Photography'], photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80', likedCurrentUser: true },
  { id: 'p3', name: 'Rohan', age: 22, bio: 'Half marathoner, full-time overthinker. Looking for a gym spotter.', affiliation: 'Bengaluru', interests: ['Fitness', 'Hiking', 'Podcasts'], photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80', likedCurrentUser: false },
  { id: 'p4', name: 'Meera', age: 21, bio: 'Reading sci-fi and pretending I understand jazz.', affiliation: 'Ashoka University', interests: ['Books', 'Jazz', 'Cinema'], photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80', likedCurrentUser: true },
  { id: 'p5', name: 'Kabir', age: 23, bio: 'Product designer by day, amateur chef by night.', affiliation: 'Pune', interests: ['Cooking', 'UI/UX', 'Cycling'], photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80', likedCurrentUser: false },
  { id: 'p6', name: 'Diya', age: 20, bio: 'Captaining the college debate team and collecting vintage postcards.', affiliation: 'SRCC, Delhi', interests: ['Debate', 'Travel', 'Art'], photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80', likedCurrentUser: true },
  { id: 'p7', name: 'Vikram', age: 22, bio: 'Guitarist in a garage band. Tell me your top 3 Spotify artists.', affiliation: 'BITS Pilani', interests: ['Guitar', 'Rock', 'Gaming'], photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80', likedCurrentUser: false },
  { id: 'p8', name: 'Tara', age: 21, bio: 'Obsessed with golden hour walks and matcha lattes.', affiliation: 'Chandigarh', interests: ['Matcha', 'Pilates', 'Dogs'], photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80', likedCurrentUser: true },
  { id: 'p9', name: 'Arjun', age: 23, bio: 'Data nerd who loves trekking in Himachal on long weekends.', affiliation: 'Dehradun', interests: ['Trekking', 'Data Science', 'Photography'], photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=80', likedCurrentUser: true },
  { id: 'p10', name: 'Sanya', age: 20, bio: 'Architecture major surviving on espresso and deadline adrenaline.', affiliation: 'SPA Delhi', interests: ['Architecture', 'Sketching', 'Coffee'], photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&q=80', likedCurrentUser: false },
  { id: 'p11', name: 'Dev', age: 22, bio: 'Formula 1 Sundays and street food Saturdays.', affiliation: 'Hyderabad', interests: ['F1', 'Street Food', 'Cricket'], photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80', likedCurrentUser: false },
  { id: 'p12', name: 'Naina', age: 21, bio: 'Film student shooting everything on 35mm.', affiliation: 'FTII Pune', interests: ['Filmmaking', 'Analog', 'Museums'], photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80', likedCurrentUser: true },
  { id: 'p13', name: 'Ishaan', age: 22, bio: 'Open-source contributor & weekend badminton player.', affiliation: 'IIIT Hyderabad', interests: ['Coding', 'Badminton', 'Anime'], photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&q=80', likedCurrentUser: false },
  { id: 'p14', name: 'Riya', age: 20, bio: 'Learning pottery and trying every bakery in Bandra.', affiliation: 'St. Xavier’s Mumbai', interests: ['Pottery', 'Baking', 'Thrifting'], photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80', likedCurrentUser: true },
  { id: 'p15', name: 'Siddharth', age: 24, bio: 'Early-stage startup life. Let’s grab tacos after 7.', affiliation: 'Bengaluru', interests: ['Startups', 'Tacos', 'Tennis'], photo: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&q=80', likedCurrentUser: false },
  { id: 'p16', name: 'Kavya', age: 21, bio: 'Psychology major. I will analyze your Spotify Wrapped.', affiliation: 'Christ University', interests: ['Psychology', 'Music', 'Journaling'], photo: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=600&q=80', likedCurrentUser: true },
  { id: 'p17', name: 'Aditya', age: 22, bio: 'Chess blitz addict and mountain biker.', affiliation: 'IIT Roorkee', interests: ['Chess', 'MTB', 'Physics'], photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&q=80', likedCurrentUser: false },
  { id: 'p18', name: 'Zoya', age: 21, bio: 'Fashion styling, rooftop sunsets, and board game nights.', affiliation: 'New Delhi', interests: ['Fashion', 'Board Games', 'Sunsets'], photo: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=600&q=80', likedCurrentUser: true },
  { id: 'p19', name: 'Pranav', age: 23, bio: 'Building fintech tools and perfecting my pour-over recipe.', affiliation: 'Mumbai', interests: ['Fintech', 'Specialty Coffee', 'Swimming'], photo: 'https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?w=600&q=80', likedCurrentUser: false },
  { id: 'p20', name: 'Aisha', age: 20, bio: 'Classical dancer who also loves techno.', affiliation: 'Chennai', interests: ['Dance', 'Techno', 'Filter Coffee'], photo: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&q=80', likedCurrentUser: false },
  { id: 'p21', name: 'Neel', age: 22, bio: 'Astrophotography enthusiast. Always looking up.', affiliation: 'Manipal', interests: ['Astronomy', 'Camping', 'Cameras'], photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600&q=80', likedCurrentUser: true },
  { id: 'p22', name: 'Simran', age: 21, bio: 'Law student who argues for fun and bakes sourdough to relax.', affiliation: 'NLSIU Bengaluru', interests: ['Law', 'Sourdough', 'True Crime'], photo: 'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=600&q=80', likedCurrentUser: false },
  { id: 'p23', name: 'Karan', age: 23, bio: 'Sound engineer & vinyl collector.', affiliation: 'Kolkata', interests: ['Vinyl', 'Audio', 'Football'], photo: 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=600&q=80', likedCurrentUser: false },
  { id: 'p24', name: 'Maya', age: 20, bio: 'Environmental science major. Plant mom to 14 succulents.', affiliation: 'DU North Campus', interests: ['Plants', 'Sustainability', 'Yoga'], photo: 'https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=600&q=80', likedCurrentUser: true },
  { id: 'p25', name: 'Harsh', age: 22, bio: 'Powerlifting and midnight biryani runs.', affiliation: 'VIT Vellore', interests: ['Powerlifting', 'Food', 'Movies'], photo: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600&q=80', likedCurrentUser: false },
  { id: 'p26', name: 'Ira', age: 21, bio: 'Illustrator doodling on every receipt I get.', affiliation: 'NID Ahmedabad', interests: ['Illustration', 'Zines', 'Tea'], photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80', likedCurrentUser: true },
  { id: 'p27', name: 'Yash', age: 23, bio: 'Bouldering beginner and mechanical keyboard builder.', affiliation: 'Gurugram', interests: ['Bouldering', 'Keyboards', 'Sci-Fi'], photo: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=600&q=80', likedCurrentUser: false },
  { id: 'p28', name: 'Sanika', age: 20, bio: 'Economics major. Let’s debate whether pineapple belongs on pizza.', affiliation: 'Fergusson College', interests: ['Economics', 'Pizza', 'Stand-up'], photo: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=600&q=80', likedCurrentUser: false },
  { id: 'p29', name: 'Manav', age: 22, bio: 'Robotics club lead. Half my room is 3D-printed parts.', affiliation: 'IIT Bombay', interests: ['Robotics', '3D Printing', 'Squash'], photo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=600&q=80', likedCurrentUser: true },
  { id: 'p30', name: 'Pooja', age: 21, bio: 'Journalism student chasing good stories and better chai.', affiliation: 'Symbiosis Pune', interests: ['Writing', 'Chai', 'Documentaries'], photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80', likedCurrentUser: false },
  { id: 'p31', name: 'Ritvik', age: 24, bio: 'Backend engineer who actually enjoys writing SQL.', affiliation: 'Noida', interests: ['Databases', 'Basketball', 'Cooking'], photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80', likedCurrentUser: false },
  { id: 'p32', name: 'Alisha', age: 21, bio: 'Trying to visit every national park in India before 25.', affiliation: 'Jaipur', interests: ['Wildlife', 'Road Trips', 'Photography'], photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80', likedCurrentUser: true },
];

function ensureInitialized() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROFILES_PATH)) {
    fs.writeFileSync(PROFILES_PATH, JSON.stringify(SEED_PROFILES, null, 2));
  }
  if (!fs.existsSync(STATE_PATH)) {
    const initialState: UserState = { swipedIds: [], likedIds: [], matchedIds: [] };
    fs.writeFileSync(STATE_PATH, JSON.stringify(initialState, null, 2));
  }
}

export function getAllProfiles(): Profile[] {
  ensureInitialized();
  return JSON.parse(fs.readFileSync(PROFILES_PATH, 'utf-8'));
}

export function getUserState(): UserState {
  ensureInitialized();
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8'));
}

export function saveUserState(state: UserState): void {
  ensureInitialized();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

export function resetUserState(): UserState {
  const empty: UserState = { swipedIds: [], likedIds: [], matchedIds: [] };
  saveUserState(empty);
  return empty;
}


export function sanitizeProfile(profile: Profile) {
  const { likedCurrentUser, ...publicProfile } = profile;
  return publicProfile;
}