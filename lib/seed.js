// Seed data for the demo. The logged-in user is always `me`.
// `likesMe: true` profiles get a pre-seeded like towards `me`, so a match
// happens the moment the user likes them back. That flag NEVER leaves the server.

const photo = (gender, n) => `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;

const RAW = [
  ['Aanya', 21, 'women', 44, 'Mumbai', 'St. Xavier\'s College', 'Chai over coffee, always. Will judge your playlist kindly.', ['Music', 'Chai', 'Poetry'], true],
  ['Kabir', 23, 'men', 32, 'Bengaluru', 'IISc', 'Building robots by day, losing at chess by night.', ['Robotics', 'Chess', 'Running'], false],
  ['Ishita', 22, 'women', 65, 'Delhi', 'Lady Shri Ram College', 'Debate team captain. Yes, I will argue about pineapple pizza.', ['Debate', 'Books', 'Pizza'], false],
  ['Rohan', 24, 'men', 75, 'Pune', 'COEP', 'Weekend trekker. Ask me about Sahyadri sunrises.', ['Trekking', 'Photography', 'Chai'], true],
  ['Meera', 20, 'women', 17, 'Chennai', 'IIT Madras', 'Carnatic music + competitive coding. Weird combo, I know.', ['Music', 'Coding', 'Filter coffee'], false],
  ['Arjun', 22, 'men', 11, 'Hyderabad', 'BITS Hyderabad', 'Biryani connoisseur. Will travel 20km for the right one.', ['Food', 'Cricket', 'Gaming'], false],
  ['Saanvi', 23, 'women', 26, 'Bengaluru', 'Christ University', 'Plant mom of 14. Their names are all fruits.', ['Plants', 'Baking', 'Indie films'], true],
  ['Vihaan', 21, 'men', 52, 'Delhi', 'IIT Delhi', 'Startup brain, sitcom heart. Currently rewatching The Office.', ['Startups', 'Sitcoms', 'Football'], false],
  ['Diya', 22, 'women', 90, 'Kolkata', 'Jadavpur University', 'Film club regular. Ray > everyone, fight me.', ['Cinema', 'Poetry', 'Street food'], false],
  ['Aditya', 25, 'men', 41, 'Mumbai', 'IIT Bombay', 'Marine drive walks and bad puns. Mostly bad puns.', ['Puns', 'Running', 'Jazz'], true],
  ['Tara', 21, 'women', 33, 'Goa', 'Goa University', 'Surfing badly but enthusiastically.', ['Surfing', 'Beaches', 'Music'], false],
  ['Reyansh', 22, 'men', 22, 'Ahmedabad', 'NID', 'Designer. I notice fonts on restaurant menus.', ['Design', 'Typography', 'Sketching'], false],
  ['Kavya', 24, 'women', 79, 'Jaipur', 'MNIT Jaipur', 'Will plan the whole trip itinerary. You just show up.', ['Travel', 'Heritage walks', 'Photography'], true],
  ['Dev', 23, 'men', 64, 'Chandigarh', 'Panjab University', 'Gym, gurbani, and a dangerous amount of parathas.', ['Fitness', 'Food', 'Music'], false],
  ['Anika', 20, 'women', 57, 'Manipal', 'Manipal Institute of Technology', 'Med student. I will remind you to drink water.', ['Medicine', 'Dance', 'K-dramas'], false],
  ['Ayaan', 21, 'men', 86, 'Bengaluru', 'PES University', 'Open-source contributor. My GitHub streak is my personality.', ['Coding', 'Open source', 'Coffee'], false],
  ['Riya', 22, 'women', 8, 'Pune', 'Symbiosis', 'Stand-up comedy open mics every Thursday. Come heckle.', ['Comedy', 'Theatre', 'Chai'], true],
  ['Ishaan', 24, 'men', 3, 'Delhi', 'SRCC', 'Finance bro in recovery. Now into pottery.', ['Pottery', 'Investing', 'Podcasts'], false],
  ['Myra', 23, 'women', 50, 'Hyderabad', 'ISB', 'Badminton at 6am. Yes, voluntarily.', ['Badminton', 'Startups', 'Books'], false],
  ['Krish', 20, 'men', 18, 'Vellore', 'VIT Vellore', 'Guitarist in a band nobody has heard of (yet).', ['Guitar', 'Music', 'Gaming'], false],
  ['Zara', 22, 'women', 21, 'Mumbai', 'NMIMS', 'Bookstagram enthusiast. Currently reading three books at once.', ['Books', 'Coffee', 'Art'], true],
  ['Advait', 23, 'men', 45, 'Kochi', 'CUSAT', 'Backwaters, boat races and beef fry. Kerala pride.', ['Rowing', 'Food', 'Football'], false],
  ['Nisha', 24, 'women', 72, 'Indore', 'IIM Indore', 'Poha for breakfast is a non-negotiable.', ['Food', 'Yoga', 'Travel'], false],
  ['Yash', 22, 'men', 29, 'Nagpur', 'VNIT', 'Astronomy club. I can point out Orion, that\'s about it.', ['Astronomy', 'Physics', 'Trekking'], false],
  ['Pari', 21, 'women', 36, 'Lucknow', 'Lucknow University', 'Tehzeeb and tunday kebabs. Shayari on request.', ['Poetry', 'Food', 'Urdu'], false],
  ['Neel', 25, 'men', 60, 'Bengaluru', 'IIM Bangalore', 'Marathon runner. Ask me about my knees (don\'t).', ['Running', 'Books', 'Coffee'], true],
  ['Aditi', 23, 'women', 88, 'Delhi', 'JNU', 'Sociology nerd. Long conversations at Ganga Dhaba.', ['Politics', 'Books', 'Chai'], false],
  ['Kian', 22, 'men', 67, 'Mysuru', 'NIE Mysuru', 'Photographer. I will make you stop for golden hour.', ['Photography', 'Cycling', 'Travel'], false],
  ['Sara', 20, 'women', 12, 'Dehradun', 'Doon University', 'Mountains > beaches. Maggi at 2000m tastes better.', ['Trekking', 'Dogs', 'Music'], false],
  ['Aarav', 23, 'men', 8, 'Gurugram', 'Ashoka University', 'Philosophy major who still can\'t decide what to order.', ['Philosophy', 'Football', 'Cooking'], true],
  ['Inaya', 22, 'women', 3, 'Srinagar', 'NIT Srinagar', 'Kahwa, snow and long letters. Old-fashioned, proudly.', ['Writing', 'Skiing', 'Tea'], false],
  ['Vivaan', 21, 'men', 90, 'Surat', 'SVNIT', 'Weekend DJ. Garba season is my Super Bowl.', ['DJing', 'Dance', 'Food'], false],
];

export const ME = 'me';

export function createSeedDb() {
  const profiles = RAW.map(([name, age, gender, n, city, college, bio, interests, likesMe], i) => ({
    id: `p${String(i + 1).padStart(2, '0')}`,
    name,
    age,
    photo: photo(gender, n),
    bio,
    city,
    college,
    interests,
    likesMe,
  }));

  const seededAt = new Date('2026-01-01T00:00:00.000Z').toISOString();
  const swipes = profiles
    .filter((p) => p.likesMe)
    .map((p) => ({ from: p.id, to: ME, action: 'like', at: seededAt }));

  return {
    version: 1,
    me: { id: ME, name: 'You', interests: ['Music', 'Chai', 'Books', 'Trekking', 'Food'] },
    // `likesMe` was only used to build the seeded swipes; strip it from stored profiles.
    profiles: profiles.map(({ likesMe, ...p }) => p),
    swipes,
    matches: [],
  };
}
