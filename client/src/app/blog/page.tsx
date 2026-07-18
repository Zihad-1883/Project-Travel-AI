import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  snippet: string;
  imageUrl: string;
}

export default function BlogPage() {
  const posts: BlogPost[] = [
    {
      id: "kyoto-hidden-gems",
      title: "Golden Temples & Bamboo Groves: Kyoto's Hidden Paths",
      category: "Cultural Curation",
      date: "July 15, 2026",
      author: "Jane Doe",
      readTime: "5 min read",
      snippet: "Kyoto is a city frozen in beautiful layers of history. Learn when to visit the iconic Golden Pavilion and how to step off-path into quiet bamboo preserves.",
      imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "skiing-zermatt-alps",
      title: "Conquering the Matterhorn: Ski & Spa Guide to Zermatt",
      category: "Adventure Travel",
      date: "June 28, 2026",
      author: "John Smith",
      readTime: "7 min read",
      snippet: "From high-altitude trails to boutique thermal spas, Zermatt offers a winter wonderland experience unlike any other. Learn how to map your passes and chalets.",
      imageUrl: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "sunsets-amalfi-coast",
      title: "Chasing Pastel Sunsets Along the Cliffs of Amalfi",
      category: "Coastal Retreats",
      date: "June 12, 2026",
      author: "Chloe Chen",
      readTime: "4 min read",
      snippet: "The Amalfi Coast is a stunning dreamscape of pastel villages. We review the best paths to side-step massive tour buses and view Positano from a private boat.",
      imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "serengeti-safari-tips",
      title: "Under the African Sky: Mapping Your Wilderness Safari",
      category: "Wilderness Discovery",
      date: "May 20, 2026",
      author: "Jane Doe",
      readTime: "6 min read",
      snippet: "A safari is more than just watching leopards. It is about understanding migration patterns and resting in stargazing tents. Follow our curation guide.",
      imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <main className="min-h-screen bg-neutral-50 py-16 px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-fraunces text-4xl sm:text-5xl font-semibold text-neutral-900 tracking-tight mb-4">
            The Curation Journal
          </h1>
          <p className="font-sans text-lg text-neutral-700 leading-relaxed">
            Tips, guides, and stories written by our expert travel architects to inspire your next tailored itinerary.
          </p>
        </div>

        {/* Featured Post */}
        <div className="relative overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200 mb-16 hover:shadow-lg transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 sm:h-auto overflow-hidden relative">
              <img
                src={posts[0].imageUrl}
                alt={posts[0].title}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute top-4 left-4 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                Featured Article
              </div>
            </div>
            <div className="p-8 sm:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-xs text-neutral-400 mb-4">
                <span>{posts[0].category}</span>
                <span>•</span>
                <span>{posts[0].readTime}</span>
              </div>
              <h2 className="font-fraunces text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
                {posts[0].title}
              </h2>
              <p className="text-sm text-neutral-700 leading-relaxed mb-6">
                {posts[0].snippet}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-medium text-neutral-400">By {posts[0].author}</span>
                <span className="text-sm font-semibold text-primary hover:text-primary-dark cursor-pointer flex items-center gap-1">
                  Read Article →
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Posts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {posts.slice(1).map((post) => (
            <article key={post.id} className="bg-neutral-100 border border-neutral-200 rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="h-48 overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-secondary/10 text-secondary text-xs font-semibold px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-neutral-400">{post.readTime}</span>
                </div>
                <h3 className="font-fraunces text-lg font-semibold text-neutral-900 mb-3 leading-tight">
                  {post.title}
                </h3>
                <p className="text-xs text-neutral-700 mb-4 leading-relaxed line-clamp-3">
                  {post.snippet}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-200">
                  <span className="text-xs font-medium text-neutral-400">{post.date}</span>
                  <span className="text-xs font-semibold text-primary hover:text-primary-dark cursor-pointer">
                    Read →
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Simple Pagination Indicator */}
        <div className="flex items-center justify-center gap-4 pt-8 border-t border-neutral-200">
          <button className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-250 disabled:opacity-55 cursor-not-allowed" disabled>
            Previous
          </button>
          <span className="text-xs font-medium text-neutral-700">
            Page 1 of 1
          </span>
          <button className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-250 disabled:opacity-55 cursor-not-allowed" disabled>
            Next
          </button>
        </div>

      </div>
    </main>
  );
}
