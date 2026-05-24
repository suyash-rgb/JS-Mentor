import React from "react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Junior Web Developer",
    content:
      "The AI Mentor is a game-changer. It didn't just give me the answer; it explained the logic behind my ReferenceErrors so I actually learned.",
    avatar: "https://i.pravatar.cc/150?u=alex",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Career Switcher",
    content:
      "I've tried many platforms, but the built-in compiler here is so stable. I love how I can see my UI output and console logs side-by-side.",
    avatar: "https://i.pravatar.cc/150?u=andy",
    rating: 5,
  },
  {
    name: "Marcus Thorne",
    role: "Self-Taught Developer",
    content:
      "I used to get stuck on asynchronous JS for hours. The AI assistant helped me visualize the Event Loop in a way that finally clicked.",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "UI Designer",
    content:
      "As a designer moving into dev, the clean UI of JS Mentor was refreshing. It’s intuitive, fast, and the progress tracking is genuinely rewarding.",
    avatar: "https://i.pravatar.cc/150?u=pete",
    rating: 4,
  },
  {
    name: "Kevin Park",
    role: "Bootcamp Graduate",
    content:
      "The Domain Specialized AI is brilliant. It stays focused on JavaScript, which kept me from going down rabbit holes that weren't relevant to my task.",
    avatar: "https://i.pravatar.cc/150?u=mannie",
    rating: 5,
  },
  {
    name: "David Okafor",
    role: "High School Student",
    content:
      "I'm learning JS for a school project, and this is the only site that explains things without using words that are too complicated. The analogies are great!",
    avatar: "https://i.pravatar.cc/150?u=harrison",
    rating: 4.5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="bg-white py-16 sm:py-24 px-6 sm:px-8 lg:px-12 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Student Success Stories
          </h2>
          
          {/* Accent Line */}
          <div className="w-16 h-1 bg-amber-500 mx-auto mb-6 rounded-full" />
          
          <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl font-normal leading-relaxed">
            See how JS Mentor is helping thousands of developers master the art of coding and land engineering roles.
          </p>
        </div>

        {/* Pure Tailwind Responsive Grid Layer */}
        {/* 1 column on mobile, 2 columns on tablets/desktops, 3 columns on large screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
          {testimonials.map((t, index) => (
            <div 
              key={index}
              className="w-full bg-slate-50 border border-slate-200/60 p-6 sm:p-8 rounded-2xl flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-100 hover:border-slate-300"
            >
              <div>
                {/* Header User Detail Row */}
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow-sm ring-4 ring-amber-50"
                  />
                  <div>
                    <h3 className="text-slate-900 font-bold text-base sm:text-lg leading-snug">
                      {t.name}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium">
                      {t.role}
                    </p>
                  </div>
                </div>

                {/* Star Ratings Row using Clean SVG Icons */}
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => {
                    const isFilled = i < Math.floor(t.rating);
                    const isHalf = !isFilled && i < t.rating;
                    return (
                      <svg 
                        key={i}
                        className={`w-4 h-4 ${isFilled || isHalf ? 'text-amber-500' : 'text-slate-300'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    );
                  })}
                </div>

                {/* Review Copy Text */}
                <p className="text-slate-700 text-sm sm:text-base font-normal leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;