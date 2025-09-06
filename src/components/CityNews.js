'use client';

import { useState, useEffect } from 'react';
import { cities } from './citycoord';

const NEWS_API_KEY = '21f057fbd36349c59d7d742c10bcac54'; // Replace with your key
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
const NEWS_FROM_DATE = oneWeekAgo.toISOString().split('T')[0];

export default function NewsCard({cityName='Dublin'}) {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        // const res = await fetch(
        //   `https://newsapi.org/v2/everything?q=${encodeURIComponent(cityName)}}&from=${NEWS_FROM_DATE}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
        // );
        // if (!res.ok) throw new Error('Failed to fetch news');
        // const data = await res.json();
        const res = await fetch(`/api/news?city=${encodeURIComponent(cityName)}`);
        if (!res.ok) throw new Error('Failed to fetch news');
        const data = await res.json();
        setArticles(data.articles || []);
        setFilteredArticles(data.articles || []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    fetchNews();
  }, [cityName]);

  // Filter articles by headline based on search term (case-insensitive)
  useEffect(() => {
    if (!searchTerm) {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
  }, [searchTerm, articles]);

  if (loading) return <div className="p-4">Loading news...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    
    <section className="mt-6 w-full rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md bg-white/10" style={{fontFamily: '"Playfair Display", serif'}}>
      <h2 className="text-3xl font-bold text-center p-2">
        {cityName} News Highlights
      </h2>

      <input
        type="text"
        placeholder="Search news headlines..."
        className="w-full p-2 mb-4 focus:outline-none rounded text-center"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />


      {/* Fixed height box with scroll */}
      <div className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-600 scrollbar-track-transparent">
        {filteredArticles.length === 0 ? (
          <p>No news matching your search.</p>
        ) : (
          filteredArticles.map((article, idx) => (
            <a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:bg-white/30 rounded p-2 transition"
            >
              <h3 className="font-semibold">{article.title}</h3>
              <p className="text-sm opacity-70">{article.source.name}</p>
              <p className="text-xs opacity-50 text-right">
                {new Date(article.publishedAt).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </a>
          ))
        )}
      </div>
    </section>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';

// const NEWS_API_KEY = '21f057fbd36349c59d7d742c10bcac54'; // Replace with your key
// const NEWS_QUERY = 'Dublin';
// const NEWS_FROM_DATE = '2025-08-01';

// export default function NewsCard() {
//   const [articles, setArticles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     async function fetchNews() {
//       try {
//         setLoading(true);
//         const res = await fetch(
//           `https://newsapi.org/v2/everything?q=${NEWS_QUERY}&from=${NEWS_FROM_DATE}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
//         );
//         if (!res.ok) throw new Error('Failed to fetch news');
//         const data = await res.json();
//         setArticles(data.articles || []);
//       } catch (err) {
//         setError(err.message);
//       }
//       setLoading(false);
//     }
//     fetchNews();
//   }, []);

//   if (loading) return <div className="p-4">Loading news...</div>;
//   if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

//   return (
//     <section className="max-w-md mx-auto p-6 bg-gray-900 text-amber-400 rounded-lg shadow-lg">
//       <h2 className="text-xl font-bold mb-4 border-b border-amber-600 pb-2">
//         Dublin News Highlights
//       </h2>

//       <div className="max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-600 scrollbar-track-gray-800">
//         {articles.length === 0 && <p>No recent news found.</p>}

//         {articles.map((article, idx) => (
//           <a
//             key={idx}
//             href={article.url}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="block hover:bg-amber-900/50 rounded p-2 transition"
//           >
//             <h3 className="font-semibold">{article.title}</h3>
//             <p className="text-sm opacity-70">{article.source.name}</p>
//           </a>
//         ))}
//       </div>
//     </section>
//   );
// }