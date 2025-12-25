import CareerAdvice from "../models/CareerAdvice.js";
import { SkillTest } from "../models/SkillTest.js";
import RecruitmentPlan from "../models/RecruitmentPlan.js";

export const seedCareerAdvice = async () => {
  try {
    const count = await CareerAdvice.count();
    if (count > 0) {
      console.log("✅ Career advice already seeded");
      return;
    }

    const articles = [
      {
        title: "10 Tips for Writing an Effective Resume",
        content: `A well-crafted resume is your ticket to landing your dream job. Here are 10 essential tips to make your resume stand out:

1. **Tailor Your Resume**: Customize your resume for each job application. Highlight relevant skills and experiences that match the job description.

2. **Use Action Verbs**: Start bullet points with strong action verbs like "Achieved", "Developed", "Managed", "Implemented".

3. **Quantify Your Achievements**: Use numbers to show your impact. For example, "Increased sales by 30%" is more impressive than "Increased sales".

4. **Keep It Concise**: Aim for 1-2 pages. Recruiters spend only 6-7 seconds scanning a resume initially.

5. **Include Keywords**: Use keywords from the job description to pass ATS (Applicant Tracking Systems).

6. **Professional Formatting**: Use a clean, professional layout with consistent fonts and spacing.

7. **Proofread**: Check for spelling and grammar errors. Ask a friend to review it.

8. **Include Contact Information**: Make sure your email and phone number are current and professional.

9. **Highlight Relevant Skills**: Place your most relevant skills near the top.

10. **Update Regularly**: Keep your resume updated even when not job hunting.`,
        category: "resume",
        author: "Career Expert",
        is_featured: true,
      },
      {
        title: "How to Ace Your Job Interview",
        content: `Interview preparation is key to success. Follow these strategies:

**Before the Interview:**
- Research the company thoroughly
- Prepare answers to common questions
- Prepare questions to ask the interviewer
- Plan your outfit and route

**During the Interview:**
- Arrive 10-15 minutes early
- Maintain eye contact and positive body language
- Listen carefully and answer concisely
- Show enthusiasm for the role

**After the Interview:**
- Send a thank-you email within 24 hours
- Follow up if you haven't heard back in a week`,
        category: "interview",
        author: "HR Professional",
        is_featured: true,
      },
      {
        title: "Career Growth: Moving from Junior to Senior Developer",
        content: `Transitioning from a junior to senior developer requires:

1. **Technical Mastery**: Deepen your understanding of core technologies
2. **Mentorship**: Help junior developers grow
3. **System Design**: Learn to design scalable systems
4. **Communication**: Improve your ability to explain complex concepts
5. **Leadership**: Take ownership of projects and initiatives`,
        category: "career-growth",
        author: "Tech Lead",
        is_featured: true,
      },
      {
        title: "Networking Tips for Job Seekers",
        content: `Building a professional network is crucial:

- Attend industry events and meetups
- Use LinkedIn effectively
- Join professional associations
- Informational interviews
- Maintain relationships`,
        category: "networking",
        author: "Career Coach",
        is_featured: false,
      },
    ];

    await CareerAdvice.bulkCreate(articles);
    console.log("✅ Career advice seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding career advice:", error);
  }
};

export const seedSkillTests = async () => {
  try {
    // Get existing tests to avoid duplicates
    const existingTests = await SkillTest.findAll();
    const existingSkillNames = new Set(existingTests.map(t => t.skill_name.toLowerCase()));

    const tests = [
      {
        title: "JavaScript Fundamentals",
        skill_name: "JavaScript",
        description: "Test your knowledge of JavaScript including ES6+, closures, promises, and advanced concepts",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "🟨",
        is_active: true,
      },
      {
        title: "React Development",
        skill_name: "React",
        description: "Test your understanding of React including hooks, components, state management, and best practices",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "⚛️",
        is_active: true,
      },
      {
        title: "Python Programming",
        skill_name: "Python",
        description: "Test your Python skills including data structures, OOP, libraries, and advanced features",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "🐍",
        is_active: true,
      },
      {
        title: "Node.js Backend",
        skill_name: "Node.js",
        description: "Test your Node.js knowledge including Express, async operations, and server-side development",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "🟢",
        is_active: true,
      },
      {
        title: "Java Development",
        skill_name: "Java",
        description: "Test your Java skills including OOP, collections, multithreading, and Spring framework",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "☕",
        is_active: true,
      },
      {
        title: "TypeScript Mastery",
        skill_name: "TypeScript",
        description: "Test your TypeScript expertise including types, interfaces, generics, and advanced patterns",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "🔷",
        is_active: true,
      },
      {
        title: "Angular Framework",
        skill_name: "Angular",
        description: "Test your Angular knowledge including components, services, routing, and RxJS",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "🅰️",
        is_active: true,
      },
      {
        title: "Vue.js Development",
        skill_name: "Vue.js",
        description: "Test your Vue.js skills including composition API, directives, state management, and routing",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "💚",
        is_active: true,
      },
      {
        title: "SQL Database",
        skill_name: "SQL",
        description: "Test your SQL expertise including queries, joins, indexes, stored procedures, and optimization",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "🗄️",
        is_active: true,
      },
      {
        title: "MongoDB NoSQL",
        skill_name: "MongoDB",
        description: "Test your MongoDB knowledge including queries, aggregation, indexing, and schema design",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "🍃",
        is_active: true,
      },
      {
        title: "AWS Cloud",
        skill_name: "AWS",
        description: "Test your AWS expertise including EC2, S3, Lambda, RDS, and cloud architecture patterns",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "☁️",
        is_active: true,
      },
      {
        title: "Docker & Containers",
        skill_name: "Docker",
        description: "Test your Docker knowledge including containers, images, Dockerfile, and orchestration",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "🐳",
        is_active: true,
      },
      {
        title: "Git & Version Control",
        skill_name: "Git",
        description: "Test your Git skills including branching, merging, rebasing, and collaborative workflows",
        duration_minutes: 30,
        questions_per_test: 20,
        passing_score: 70,
        icon: "📦",
        is_active: true,
      },
      {
        title: "HTML & CSS",
        skill_name: "HTML/CSS",
        description: "Test your frontend fundamentals including semantic HTML, CSS Grid, Flexbox, and responsive design",
        duration_minutes: 30,
        questions_per_test: 20,
        passing_score: 70,
        icon: "🎨",
        is_active: true,
      },
      {
        title: "C++ Programming",
        skill_name: "C++",
        description: "Test your C++ skills including memory management, STL, templates, and object-oriented design",
        duration_minutes: 45,
        questions_per_test: 25,
        passing_score: 70,
        icon: "⚙️",
        is_active: true,
      },
    ];

    // Filter out tests that already exist
    const newTests = tests.filter(test => !existingSkillNames.has(test.skill_name.toLowerCase()));
    
    if (newTests.length > 0) {
      await SkillTest.bulkCreate(newTests);
      console.log(`✅ Added ${newTests.length} new skill tests`);
    } else {
      console.log("✅ All skill tests already exist");
    }
  } catch (error) {
    console.error("❌ Error seeding skill tests:", error);
  }
};

export const seedRecruitmentPlans = async () => {
  try {
    const count = await RecruitmentPlan.count();
    if (count > 0) {
      console.log("✅ Recruitment plans already seeded");
      return;
    }

    const plans = [
      {
        name: "Basic",
        price: 999.00,
        currency: "INR",
        duration_months: 1,
        job_postings_limit: 5,
        resume_views_limit: 50,
        featured_jobs: 0,
        priority_support: false,
        analytics_access: false,
        custom_branding: false,
        features: ["5 job postings", "50 resume views", "Basic support", "Standard job listings"],
        is_active: true,
      },
      {
        name: "Professional",
        price: 2999.00,
        currency: "INR",
        duration_months: 1,
        job_postings_limit: 20,
        resume_views_limit: 200,
        featured_jobs: 5,
        priority_support: true,
        analytics_access: true,
        custom_branding: false,
        features: ["20 job postings", "200 resume views", "5 featured jobs", "Priority support", "Analytics dashboard"],
        is_active: true,
      },
      {
        name: "Enterprise",
        price: 9999.00,
        currency: "INR",
        duration_months: 1,
        job_postings_limit: null, // Unlimited
        resume_views_limit: null, // Unlimited
        featured_jobs: null, // Unlimited
        priority_support: true,
        analytics_access: true,
        custom_branding: true,
        features: ["Unlimited job postings", "Unlimited resume views", "Unlimited featured jobs", "Priority support", "Advanced analytics", "Custom branding", "Dedicated account manager"],
        is_active: true,
      },
    ];

    await RecruitmentPlan.bulkCreate(plans);
    console.log("✅ Recruitment plans seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding recruitment plans:", error);
  }
};

