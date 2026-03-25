// src/data/mockData.js
export const mockVideos = [
  // B.Sc Information Technology (Course 1)
  {
    id: 101,
    title: "1. Introduction to LMS",
    description: "Welcome to the E-LEARN platform.",
    url: "https://youtu.be/S39zoHnV-ok?si=Y5F2nOAu0zoEAAvK",
    isLocked: false,
    subject: "Orientation",
    course: "B.Sc Information Technology",
    quiz: {
      question: "What does LMS stand for?",
      options: ["Learning Management System", "Local Media Server", "Legal Main Service", "Large Memory Storage"],
      correctAnswer: "Learning Management System"
    }
  },
  {
    id: 102,
    title: "2. React Fundamentals",
    description: "Learn about Components and State.",
    url: "https://www.youtube.com/embed/Ke90Tje7VS0",
    isLocked: true,
    subject: "Web Development",
    course: "B.Sc Information Technology",
    quiz: {
      question: "What is a React Component?",
      options: ["A function or class that returns HTML", "A database query", "A standard Javascript library", "A CSS file"],
      correctAnswer: "A function or class that returns HTML"
    }
  },

  // Management Marketing (Course 2)
  {
    id: 201,
    title: "Principles of Marketing",
    description: "Introduction to 4Ps of Marketing.",
    url: "https://www.youtube.com/embed/h9mH_Z_Mh8Q",
    isLocked: false,
    subject: "Marketing",
    course: "Management Marketing",
    quiz: {
      question: "What are the 4Ps of Marketing?",
      options: ["Product, Price, Place, Promotion", "People, Power, Purpose, Price", "Plan, Prep, Perform, Profit", "None of these"],
      correctAnswer: "Product, Price, Place, Promotion"
    }
  },

  // Finance Management (Course 3)
  {
    id: 301,
    title: "Intro to Corporate Finance",
    description: "Basics of financial planning and analysis.",
    url: "https://www.youtube.com/embed/W_sqN8S0iU8",
    isLocked: false,
    subject: "Finance",
    course: "Finance Management",
    quiz: {
      question: "What is the primary goal of corporate finance?",
      options: ["Maximize shareholder value", "Maximize employee salary", "Maximize taxes", "Minimize sales"],
      correctAnswer: "Maximize shareholder value"
    }
  },

  // B.Commerce (Course 4)
  {
    id: 401,
    title: "Basic Accounting Concepts",
    description: "Understanding debits and credits.",
    url: "https://www.youtube.com/embed/yYU_S-v07kI",
    isLocked: false,
    subject: "Accounting",
    course: "B.Commerce",
    quiz: {
      question: "Every transaction has how many sides?",
      options: ["Two (Debit & Credit)", "One (Only Debit)", "Three", "Zero"],
      correctAnswer: "Two (Debit & Credit)"
    }
  }
];