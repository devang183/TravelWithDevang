/**
 * City Stories - People & Food Experiences
 *
 * Inspired by Anthony Bourdain's Parts Unknown
 * Each city contains stories about:
 * - People met along the way
 * - Food experiences and flavors
 * - Spontaneous moments and hidden discoveries
 *
 * PHOTO STORAGE:
 * Photos are stored in S3: https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/[cityname]/stories/
 * Example: https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/abdel-cover.jpg
 */

export const cityStories = {
  rabat: {
    cityName: 'Rabat',
    country: 'Morocco',
    stories: [
      // PEOPLE STORIES
      {
        id: 'abdel-last-three-days',
        type: 'people',
        featured: true,
        name: 'Abdelilah (Abdel) Moussafi',
        role: 'Energy Efficiency Engineer & Humanitarian',
        days: '5 Days',
        coverPhoto: 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/abdel-cover.jpg',
        photos: [
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/abdel-cover.jpg',
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/abdel-football.jpeg',
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/abdel-photography.jpeg',
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/abdel-aidersanslimite.jpeg',
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/abdel-shawarma.jpg',
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/abdel-pita-bread.jpg'
        ],
        story: `I met Abdel on my third day in Rabat, at a small fast food joint, Snack Chabab, opposite to Terminus Tramway Hay Karima in Salé. Over mint tea, harira, and Khoubz Msemmen, Abdel insisted on showing me his city and the rest is right in front of you...`,

        quote: '"This is not just tourism, my friend. This is Rabat." - Abdel',

        location: {
          lat: 34.0209,
          lng: -6.8416,
          places: [
            { name: 'Medina of Rabat', coords: [34.0209, -6.8416] },
            { name: 'Hassan Tower', coords: [34.0209, -6.8243] },
            { name: 'Kasbah of the Udayas', coords: [34.0315, -6.8365] }
          ]
        },

        sharedMeals: [
          { dish: 'Harira and Khoubz Msemmen', restaurant: 'Snack Chabab in Hay Karima, Salé' },
          { dish: 'Escargot, Chickpeas with escargot water + a spread of powdered red chilly', restaurant: 'Street side stall' },
          { dish: 'Konafa (Knafeh)', restaurant: 'Street side stall' },
          { dish: 'Foul with olive oil, Syrian pita bread, and Hummus', restaurant: 'Yamal Acham, Agdal' }
        ],

        // Professional background
        professionalDetails: {
          title: 'Energy Efficiency Engineer',
          expertise: [
            'Energy Auditing & Consumption Analysis',
            'Energy Renovation Project Design',
            'Thermal Insulation & Heating Systems',
            'Sustainable Building Rehabilitation',
            'Renewable Energy Integration'
          ],
          certifications: [
            {
              name: 'Réno Copro - Réhabilitation Énergétique',
              issuer: 'MOOC Bâtiment Durable (ASDER, ALEC Lyon)',
              date: 'January 6, 2025',
              certificateId: '3dc43e314cf248d494a8bdd88004e2e0'
            }
          ],
          humanitarian: [
            {
              organization: 'Association Aider Sans Limite',
              role: 'Volunteer',
              activities: [
                'Organized humanitarian caravan to address water scarcity in rural villages',
                'Led well-digging projects in two villages',
                'Community engagement through football and cultural activities',
                'Built connections with local communities'
              ],
              impact: 'Brought sustainable water solutions and hope to villages in need',
              quote: 'Le bénévolat, ce n\'est pas juste donner de son temps. C\'est guérir son âme au contact de ceux qui font la vraie force de notre pays.'
            },
            {
              organization: 'Al Haouz Reconstruction Mission',
              date: 'December 13, 2025',
              activities: [
                'Well drilling and water access projects',
                'School and Kouttab renovation',
                'Two nights living with local communities',
                'Witnessed extraordinary hospitality and resilience'
              ],
              partners: ['Association Aider Sans Limite', 'Kiwi Collecte', 'Hanns Seidel Stiftung Maroc'],
              reflection: 'We came to give help, but we received a lesson in humanity. People who have little, yet give everything.'
            }
          ]
        },

        playlist: 'https://open.spotify.com/playlist/37i9dQZEVXbJU9eQpX8gPT?si=641ae837609e4075',

        tags: ['guide', 'friendship', 'local-perspective', 'culture', 'humanitarian', 'engineer'],

        date: '2025-05-21',
      },

      {
        id: 'sarah-first-day',
        type: 'people',
        featured: false,
        name: 'Maria',
        role: 'First day with her',
        days: 'Day 1',
        coverPhoto: 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/maria-cover.jpg', // TODO: Upload your photo to S3
        photos: [
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/maria-walking.jpg',
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/maria-market.jpg'
        ],
        story: `[YOUR STORY HERE]

On my very first morning in Rabat, still jet-lagged and disoriented, I met Sarah...

Write about:
- First impressions
- What she showed you
- How she helped you get oriented
- A moment of kindness
- What you learned from her`,

        quote: '"Welcome to Morocco. You\'re going to love it here." - Sarah',

        location: {
          lat: 34.0209,
          lng: -6.8416,
          places: [
            { name: 'Avenue Mohammed V', coords: [34.0209, -6.8416] },
            { name: 'Central Market', coords: [34.0195, -6.8328] }
          ]
        },

        sharedMeals: [
          { dish: 'Breakfast pastries', restaurant: 'Corner bakery' }
        ],

        playlist: null,

        tags: ['first-day', 'kindness', 'orientation'],

        date: '2025-05-19', // TODO: Add actual date
      },

      // FOOD STORIES
      {
        id: 'tagine-discovery',
        type: 'food',
        featured: true,
        dish: 'Lamb Tagine with Apricots',
        restaurant: 'Dar Naji', // TODO: Add actual restaurant name
        chef: null, // Optional
        coverPhoto: 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/tagine-cover.jpg', // TODO: Upload your photo to S3
        photos: [
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/tagine-steam.jpg',
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/tagine-inside.jpg',
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/restaurant-interior.jpg'
        ],
        story: `[YOUR STORY HERE]

The steam rising from the conical lid, the sweet smell of apricots mixing with cumin and coriander...

Write about:
- The setting where you ate this
- First bite - what did it taste like?
- The atmosphere, the people around
- Why this meal mattered
- Would you go back?`,

        quote: '"Food tastes better when shared with friends." - abdel (if he was there)',

        taste: 'Tender lamb that falls off the bone, sweet apricots balancing savory spices, warmth that goes beyond heat',

        location: {
          lat: 34.0209,
          lng: -6.8416,
          address: 'Old Medina, Rabat' // TODO: Add actual address
        },

        cost: '80 MAD (~$8 USD)', // TODO: Add actual cost

        sharedWith: 'abdel', // or 'Alone' or 'Sarah'

        wouldReturn: true,

        recipe: null, // Optional: If you got the recipe

        tags: ['tagine', 'moroccan', 'lamb', 'traditional', 'unforgettable'],

        date: '2024-03-16', // TODO: Add actual date
      },

      {
        id: 'mint-tea-ritual',
        type: 'food',
        featured: false,
        dish: 'Moroccan Mint Tea',
        restaurant: 'Street café near medina',
        chef: null,
        coverPhoto: 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/mint-tea-cover.jpg', // TODO: Upload your photo to S3
        photos: [
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/tea-pouring.jpg',
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/tea-glasses.jpg'
        ],
        story: `[YOUR STORY HERE]

Not a meal, but a ritual. The way abdel poured the tea from height, the sound of it hitting the glass...

Write about:
- The ritual of tea in Morocco
- What made it special
- Conversations over tea
- The sweetness, the mint
- What tea meant to your trip`,

        quote: '"Moroccan tea is liquid hospitality." - Local saying',

        taste: 'Sweet, refreshing mint, served scalding hot in small glasses',

        location: {
          lat: 34.0209,
          lng: -6.8416,
          address: 'Corner café, Medina'
        },

        cost: '10 MAD (~$1 USD)',

        sharedWith: 'abdel and countless locals',

        wouldReturn: true,

        tags: ['tea', 'ritual', 'hospitality', 'tradition', 'mint'],

        date: '2024-03-11',
      },

      {
        id: 'harira-soup',
        type: 'food',
        featured: false,
        dish: 'Harira Soup',
        restaurant: 'Small family restaurant',
        chef: null,
        coverPhoto: 'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/harira-cover.jpg', // TODO: Upload your photo to S3
        photos: [
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/harira-bowl.jpg',
          'https://cityphotoscity.s3.eu-west-1.amazonaws.com/images/rabat/stories/harira-bread.jpg'
        ],
        story: `[YOUR STORY HERE]

A thick, hearty soup traditionally eaten to break fast during Ramadan. Even though it wasn't Ramadan, I needed this...

Write about:
- When and why you tried it
- The texture, the spices
- What it reminded you of
- The comfort factor
- Context of the meal`,

        quote: null,

        taste: 'Thick and hearty, tomato-based with lentils, chickpeas, lamb, and a squeeze of lemon',

        location: {
          lat: 34.0209,
          lng: -6.8416,
          address: 'Family restaurant, Rabat'
        },

        cost: '30 MAD (~$3 USD)',

        sharedWith: 'Alone',

        wouldReturn: true,

        tags: ['soup', 'comfort-food', 'traditional', 'ramadan'],

        date: '2024-03-13',
      }
    ]
  },

  // TEMPLATE FOR OTHER CITIES
  // Copy and modify this structure for each city
  dublin: {
    cityName: 'Dublin',
    country: 'Ireland',
    stories: [
      // Add Dublin stories here following the same structure
    ]
  },

  london: {
    cityName: 'London',
    country: 'United Kingdom',
    stories: [
      // Add London stories here
    ]
  },

  // Add more cities as needed...
};

// Helper function to get stories by city
export function getStoriesByCity(cityId) {
  return cityStories[cityId.toLowerCase()] || { stories: [] };
}

// Helper function to get featured stories
export function getFeaturedStories(cityId) {
  const cityData = getStoriesByCity(cityId);
  return cityData.stories?.filter(story => story.featured) || [];
}

// Helper function to filter by type
export function getStoriesByType(cityId, type) {
  const cityData = getStoriesByCity(cityId);
  return cityData.stories?.filter(story => story.type === type) || [];
}
