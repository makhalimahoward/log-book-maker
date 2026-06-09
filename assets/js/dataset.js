// =====================================================================
//  LOG BOOK MAKER — Demo Dataset
//  Company: NexaStack Technologies (fictional)
//  Student: Alex Moyo (fictional)
//  Duration: 6 weeks of Industrial Attachment
//  Feel free to clear this and add your own entries.
// =====================================================================

const initialLogs = [

  // ── WEEK 1 ──────────────────────────────────────────────────────────
  {
    id: "demo_001",
    date: "22/09/2025",
    client: "NexaStack Technologies",
    role: "Orientation & Onboarding",
    workDone: "Attended company induction and onboarding session\nReceived IT equipment and set up development environment (VS Code, Node.js, Git)\nCompleted internal HR documentation and signed NDA\nIntroduced to the engineering team and assigned a buddy mentor",
    comments: "Gained a foundational understanding of the company's tech stack and engineering culture. The onboarding process was well-structured and helped ease the transition from academic to professional work.",
    timestamp: 1727000000000,
  },
  {
    id: "demo_002",
    date: "24/09/2025",
    client: "NexaStack Technologies",
    role: "Technical Support",
    workDone: "Shadowed senior developer during a client support call\nDocumented recurring bug patterns in the internal ticketing system\nAssisted in triaging 12 open support tickets\nSet up local instance of the company's main product for testing",
    comments: "Observed how the team communicates technical issues to non-technical clients. Learned the importance of clear, jargon-free communication when explaining software problems.",
    timestamp: 1727172800000,
  },

  // ── WEEK 2 ──────────────────────────────────────────────────────────
  {
    id: "demo_003",
    date: "29/09/2025",
    client: "NexaStack Technologies",
    role: "Frontend Development",
    workDone: "Started first assigned task: redesign the dashboard stats panel using React\nReviewed existing component library and design system docs\nBuilt initial wireframe mockup and got approval from team lead\nWritten unit tests for two existing utility functions",
    comments: "This was my first real hands-on task. I realised how important it is to read existing code thoroughly before writing new code — the team's component patterns are well thought out.",
    timestamp: 1727568000000,
  },
  {
    id: "demo_004",
    date: "02/10/2025",
    client: "NexaStack Technologies",
    role: "Frontend Development",
    workDone: "Completed dashboard stats panel redesign — submitted PR for review\nAddressed 3 code review comments from senior dev\nParticipated in weekly sprint planning meeting\nResearched accessibility (a11y) best practices for the team's component library",
    comments: "Receiving code review feedback was humbling but valuable. I learned that clean, readable code matters as much as working code in a team environment.",
    timestamp: 1727827200000,
  },

  // ── WEEK 3 ──────────────────────────────────────────────────────────
  {
    id: "demo_005",
    date: "06/10/2025",
    client: "KK Retail Group",
    role: "Technical Support",
    workDone: "Assigned to client-facing support rotation for KK Retail Group\nResolved 5 tickets related to report generation failures\nIdentified root cause: timezone mismatch in date filtering logic\nDocumented fix in internal knowledge base",
    comments: "Debugging the timezone issue taught me that software bugs often come from assumptions — the original developer assumed all clients were in the same timezone. Always validate your assumptions.",
    timestamp: 1728172800000,
  },
  {
    id: "demo_006",
    date: "09/10/2025",
    client: "NexaStack Technologies",
    role: "Backend Development",
    workDone: "Joined backend team for a two-day cross-training session\nBuilt a simple REST API endpoint for user activity logs using Express.js\nLearned the team's database migration workflow using Knex.js\nWrote integration tests for the new endpoint",
    comments: "Cross-training on the backend gave me a much better appreciation of how the frontend and backend interact. Understanding both sides makes me a better frontend developer.",
    timestamp: 1728432000000,
  },

  // ── WEEK 4 ──────────────────────────────────────────────────────────
  {
    id: "demo_007",
    date: "13/10/2025",
    client: "NexaStack Technologies",
    role: "Product Management",
    workDone: "Attended product roadmap planning session as a note-taker\nHelped draft user stories for the upcoming Q4 feature release\nConducted a competitive analysis of 3 rival products\nPresented findings to the product team — 15-minute slot",
    comments: "Sitting in on product decisions showed me that software development is driven by business needs and user feedback, not just technical possibilities. This perspective will make me a more well-rounded developer.",
    timestamp: 1728777600000,
  },
  {
    id: "demo_008",
    date: "16/10/2025",
    client: "Soft-IT Consultants",
    role: "Technical Support",
    workDone: "Deployed hotfix to staging environment for Soft-IT Consultants\nCoordinated with QA team to verify fix before production push\nUpdated deployment checklist documentation\nMonitored error logs post-deployment for 2 hours",
    comments: "My first deployment experience. I now understand why teams have strict deployment checklists — one missed step can cause cascading failures in production environments.",
    timestamp: 1729036800000,
  },

  // ── WEEK 5 ──────────────────────────────────────────────────────────
  {
    id: "demo_009",
    date: "20/10/2025",
    client: "NexaStack Technologies",
    role: "Frontend Development",
    workDone: "Took ownership of new feature: CSV export functionality for reports module\nDesigned the data transformation pipeline from API response to downloadable file\nImplemented using vanilla JS Blob API — no external libraries\nWrote comprehensive test cases covering edge cases (empty data, special characters)",
    comments: "Building a complete feature independently was a confidence milestone. I had to make architectural decisions on my own and defend them in the PR review. The team approved the approach with minor suggestions.",
    timestamp: 1729382400000,
  },
  {
    id: "demo_010",
    date: "23/10/2025",
    client: "KK Retail Group",
    role: "Technical Support",
    workDone: "Led a 30-minute training session for KK Retail staff on the new reports module\nCreated a quick-reference PDF guide for end users\nCollected user feedback via a short survey (8 responses)\nLogged feature requests from client feedback into the product backlog",
    comments: "Training end users is a completely different skill from writing code. I had to explain technical concepts simply and patiently. The positive feedback from the client was rewarding.",
    timestamp: 1729641600000,
  },

  // ── WEEK 6 ──────────────────────────────────────────────────────────
  {
    id: "demo_011",
    date: "27/10/2025",
    client: "NexaStack Technologies",
    role: "Frontend Development",
    workDone: "Completed performance audit of the main dashboard using Chrome DevTools Lighthouse\nIdentified 3 key bottlenecks: unoptimised images, render-blocking scripts, unused CSS\nImplemented lazy loading for dashboard images — improved LCP score by 40%\nPresented audit report and improvements to the engineering team",
    comments: "Performance optimisation is an area I had little practical experience with before this. Seeing a measurable improvement in Lighthouse scores from my changes was deeply satisfying.",
    timestamp: 1729987200000,
  },
  {
    id: "demo_012",
    date: "30/10/2025",
    client: "NexaStack Technologies",
    role: "Frontend Development",
    workDone: "Completed 6-week attachment mid-point review with industrial supervisor\nCompiled a personal progress report covering completed tasks and skills acquired\nSet goals for the remaining attachment period with supervisor guidance\nBegan onboarding documentation for the next student intern",
    comments: "The mid-point review was a valuable moment of reflection. I have grown significantly in both technical skill and professional conduct. The remaining weeks will focus on deeper backend exposure and independent project delivery.",
    timestamp: 1730246400000,
  },

];
