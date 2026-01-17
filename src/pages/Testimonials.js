import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Rating,
  Container,
} from "@mui/material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Testimonials.css";

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
  {
    name: "Marcus Rivera",
    role: "Junior Web Developer",
    content:
      "The AI Mentor is a game-changer. It didn't just give me the answer; it explained the logic behind my ReferenceErrors so I actually learned and improved.",
    avatar: "https://i.pravatar.cc/150?u=parvati",
    rating: 5,
  },
  {
    name: "Sarah Choi",
    role: "Computer Science Student",
    content: "The donut charts on the dashboard kept me motivated to hit 100%!",
    avatar: "https://i.pravatar.cc/150?u=adam",
    rating: 5,
  },
  {
    name: "James Dunn",
    role: "Career Switcher",
    content:
      "I've tried many platforms, but the built-in compiler here is so stable. I love how I can see my UI output and console logs side-by-side.",
    avatar: "https://i.pravatar.cc/150?u=rick",
    rating: 4.5,
  },
];

const Testimonials = () => {
  return (
    <Box className="testimonials-wrapper">
      <Navbar />

      <Box className="testimonials-hero">
        <Typography variant="h2" className="hero-title">
          Student Success Stories
        </Typography>
        <Typography variant="h6" className="hero-subtitle">
          See how JS Mentor is helping thousands of developers master the art of
          coding.
        </Typography>
      </Box>

      <Container maxWidth="lg" className="testimonials-container">
        <Grid container spacing={4}>
          {testimonials.map((t, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper elevation={0} className="testimonial-card">
                <Box className="card-header">
                  <Avatar
                    src={t.avatar}
                    sx={{ width: 60, height: 60, mb: 2 }}
                  />
                  <Rating
                    value={t.rating}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                </Box>
                <Typography variant="body1" className="testimonial-content">
                  "{t.content}"
                </Typography>
                <Box sx={{ mt: "auto", pt: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {t.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t.role}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
      {/* Stats Section */}
      <div className="marpad-bottom">
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">500+</div>
                <div className="stat-label">Active Learners</div>
              </div>

              <div className="stat-card">
                <div className="stat-number">50+</div>
                <div className="stat-label">Courses</div>
              </div>

              <div className="stat-card">
                <div className="stat-number">100%</div>
                <div className="stat-label">Job Placement Support</div>
              </div>

              <div className="stat-card">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Community Members</div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </Box>
  );
};

export default Testimonials;
