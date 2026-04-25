import React from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Rating,
  Container,
} from "@mui/material";
import "../../pages/Testimonials.css";

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
    name: "Sarah Chen",
    role: "Computer Science Student",
    content:
      "JS Mentor's modular paths made Node.js mastery feel achievable. The donut charts on the dashboard kept me motivated to hit 100%!",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Career Switcher",
    content:
      "I've tried many platforms, but the built-in compiler here is so stable. I love how I can see my UI output and console logs side-by-side.",
    avatar: "https://i.pravatar.cc/150?u=andy",
    rating: 4.5,
  },
  {
    name: "Priya Das",
    role: "Frontend Intern",
    content:
      "The PWA path was exactly what I needed for my internship. Learning about Service Workers through interactive challenges was so much better than just reading docs.",
    avatar: "https://i.pravatar.cc/150?u=nitya",
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
    name: "Sofia Müller",
    role: "Backend Enthusiast",
    content:
      "Implementing my first Node.js server within the JS Mentor environment was a breeze. No local environment setup headaches, just pure learning.",
    avatar: "https://i.pravatar.cc/150?u=sofia",
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
    <Box className="testimonials-hero" sx={{ py: 10, px: { xs: 2, md: 4 }, m: { xs: 1, md: 4 }, borderRadius: '24px' }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" sx={{ 
            fontSize: { xs: '2.5rem', md: '3.5rem' }, 
            fontWeight: 900, 
            mb: 2,
            color: 'white'
          }}>
            Student Success Stories
          </Typography>
          <Box sx={{ 
            width: '80px', 
            height: '4px', 
            backgroundColor: 'white', 
            margin: '0 auto 24px'
          }} />
          <Typography variant="h6" sx={{ 
            color: 'rgba(255,255,255,0.9)', 
            maxWidth: '700px', 
            margin: '0 auto'
          }}>
            See how JS Mentor is helping thousands of developers master the art of coding.
          </Typography>
        </Box>

        {/* Using CSS Grid for a reliable side-by-side layout (3 per row) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '32px', 
          width: '100%',
          justifyItems: 'center'
        }}>
          {testimonials.map((t, index) => (
            <Paper 
              key={index}
              elevation={0} 
              className="testimonial-card" 
              style={{ 
                width: '100%',
                maxWidth: '380px', 
                minHeight: '240px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Avatar
                  src={t.avatar}
                  sx={{ width: 44, height: 44, border: '2px solid rgb(240, 82, 4)' }}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                    {t.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {t.role}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mb: 1.5 }}>
                <Rating
                  value={t.rating}
                  precision={0.5}
                  readOnly
                  size="small"
                />
              </Box>

              <Typography variant="body2" sx={{ 
                fontSize: '0.95rem', 
                fontStyle: 'italic',
                color: '#334155',
                lineHeight: 1.6,
                flexGrow: 1
              }}>
                "{t.content}"
              </Typography>
            </Paper>
          ))}
        </div>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;
