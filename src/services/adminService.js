// Admin Dashboard Mock Service Layer
// In Phase 2, these functions will fetch from FastAPI /api/admin/* endpoints

const getAdminAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Initialize system settings in localStorage if they don't exist
const DEFAULT_SETTINGS = {
  knnAutoReview: true,
  similarityCutoff: 0.70,
  rateLimitPerMin: 60,
};

const initSettings = () => {
  if (!localStorage.getItem('admin_system_settings')) {
    localStorage.setItem('admin_system_settings', JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem('admin_audit_logs')) {
    const defaultLogs = [
      {
        id: 1,
        admin_name: "Super Admin",
        action: "INITIALIZE_SYSTEM",
        target_entity: "PlatformSettings",
        details: "System settings initialized to defaults.",
        created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString() // 3 days ago
      },
      {
        id: 2,
        admin_name: "Super Admin",
        action: "TRAINER_PROMOTION",
        target_entity: "User:15",
        details: "Promoted user John Doe to Trainer role.",
        created_at: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
      }
    ];
    localStorage.setItem('admin_audit_logs', JSON.stringify(defaultLogs));
  }
};

initSettings();

export const getObservabilityMetrics = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    totalCost: 142.85,
    avgLatency: 1.24, // in seconds
    totalTokens: {
      prompt: 843210,
      completion: 210450,
      total: 1053660
    },
    // Daily cost for past 7 days
    dailyCostHistory: [
      { date: 'Aug 21', cost: 18.20 },
      { date: 'Aug 22', cost: 21.40 },
      { date: 'Aug 23', cost: 15.65 },
      { date: 'Aug 24', cost: 24.10 },
      { date: 'Aug 25', cost: 22.80 },
      { date: 'Aug 26', cost: 20.30 },
      { date: 'Aug 27', cost: 20.40 }
    ],
    // Tokens for past 7 days
    tokenHistory: [
      { date: 'Aug 21', prompt: 105000, completion: 28000 },
      { date: 'Aug 22', prompt: 121000, completion: 32000 },
      { date: 'Aug 23', prompt: 92000, completion: 21000 },
      { date: 'Aug 24', prompt: 145000, completion: 38000 },
      { date: 'Aug 25', prompt: 132000, completion: 31000 },
      { date: 'Aug 26', prompt: 128000, completion: 30000 },
      { date: 'Aug 27', prompt: 120210, completion: 30450 }
    ],
    // Guardrail stats
    guardrailStats: {
      rejectedByLocal: 342, // checkifjavascriptrelated or difflib
      passedToLLM: 128,
      totalQueries: 470
    },
    // Mock trace trees for inspector
    recentTraces: [
      {
        id: "tr-9821",
        timestamp: new Date().toISOString(),
        student: "Sarah Connor (UID: 102)",
        endpoint: "/api/v1/chatbot/query",
        status: "SUCCESS",
        latency: "1.12s",
        cost: "$0.0034",
        steps: [
          { name: "Input Received", details: "How do I filter an array in JS?" },
          { name: "Local Guardrail Check", details: "Passed. Query is JavaScript-related." },
          { name: "Vector Search / Curriculum Lookup", details: "Matched: Arrays -> Array.prototype.filter (Similarity: 0.92)" },
          { name: "LLM Call (GPT-4o)", details: "Prompt tokens: 420 | Completion tokens: 180" },
          { name: "Output Guardrail", details: "Passed. Code snippet is valid and safe." }
        ]
      },
      {
        id: "tr-9820",
        timestamp: new Date(Date.now() - 60000 * 5).toISOString(),
        student: "Bruce Wayne (UID: 88)",
        endpoint: "/api/v1/chatbot/query",
        status: "GUARDRAIL_REJECTED",
        latency: "0.08s",
        cost: "$0.0000",
        steps: [
          { name: "Input Received", details: "Who is the President of France?" },
          { name: "Local Guardrail Check", details: "REJECTED. Reason: Non-JS query (Confidence Score: 0.12)" },
          { name: "Short-Circuit Response", details: "Refusal sent: 'I can only assist with JavaScript programming questions.'" }
        ]
      },
      {
        id: "tr-9819",
        timestamp: new Date(Date.now() - 60000 * 15).toISOString(),
        student: "Peter Parker (UID: 44)",
        endpoint: "/api/v1/chatbot/query",
        status: "SUCCESS",
        latency: "1.45s",
        cost: "$0.0041",
        steps: [
          { name: "Input Received", details: "What is closure in JavaScript?" },
          { name: "Local Guardrail Check", details: "Passed. Query is JavaScript-related." },
          { name: "Vector Search / Curriculum Lookup", details: "Matched: Scopes -> Closures (Similarity: 0.89)" },
          { name: "LLM Call (GPT-4o)", details: "Prompt tokens: 510 | Completion tokens: 210" },
          { name: "Output Guardrail", details: "Passed. Response contains valid code snippets." }
        ]
      }
    ]
  };
};

export const getTrainerSupervision = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    pendingReviewCount: 14,
    meanTimeToEvaluate: 4.8, // in hours
    autoGradeStats: {
      autoGraded: 1120, // AUTO_REVIEWED via KNN
      manualGraded: 345, // manually GRADED by trainers
      total: 1465
    },
    activeTrainers: [
      { id: 1, name: "Trainer Alex", evaluationsCompleted: 142, mtte: "2.4h", slaStatus: "EXCELLENT", accuracyRating: "98.5%" },
      { id: 2, name: "Trainer Sarah", evaluationsCompleted: 110, mtte: "4.1h", slaStatus: "GOOD", accuracyRating: "96.2%" },
      { id: 3, name: "Trainer Mike", evaluationsCompleted: 93, mtte: "7.9h", slaStatus: "AT_RISK", accuracyRating: "92.0%" }
    ]
  };
};

export const getStudentRisk = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    atRiskStudents: [
      {
        id: 1,
        name: "Tony Stark",
        email: "tony@stark.com",
        riskScore: "HIGH",
        reasons: "High compiler runs (24 runs) on 'closures-scope' without pass; note reading time < 10% on theory notes.",
        failedAttempts: 8,
        notesProgress: "8%"
      },
      {
        id: 2,
        name: "Clark Kent",
        email: "clark@dailyplanet.com",
        riskScore: "MEDIUM",
        reasons: "Multiple window blurs (12 times) during exercise compiler sessions; failed 3 assessment submissions.",
        failedAttempts: 5,
        notesProgress: "42%"
      },
      {
        id: 3,
        name: "Barry Allen",
        email: "barry@ccpd.gov",
        riskScore: "LOW",
        reasons: "Fast completion times on exercises, but low note reading completion. (Unnatural speed ratio)",
        failedAttempts: 2,
        notesProgress: "15%"
      }
    ],
    curriculumBottlenecks: [
      { id: "path-1-ex-3", path: "Fundamentals", topic: "Variables & Scopes", exercise: "Closure Variables Scopes", failureRate: "72%", doubtsCount: 41 },
      { id: "path-2-ex-5", path: "JS Core", topic: "Asynchronous", exercise: "Promises and Async/Await", failureRate: "58%", doubtsCount: 29 },
      { id: "path-2-ex-2", path: "JS Core", topic: "Object Oriented", exercise: "Prototype Inheritance Chain", failureRate: "45%", doubtsCount: 22 }
    ]
  };
};

export const getPlatformIssues = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return platform tickets from localStorage or default ones
  let tickets = localStorage.getItem('admin_tickets');
  if (!tickets) {
    const defaultTickets = [
      { id: "TCK-101", student: "Bruce Banner", issueType: "Compiler Error", description: "Monaco editor crashes when writing async functions.", status: "OPEN", createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: "TCK-102", student: "Selina Kyle", issueType: "Billing Issue", description: "Payment completed via Razorpay but account still shows standard.", status: "OPEN", createdAt: new Date(Date.now() - 3600000 * 8).toISOString() },
      { id: "TCK-103", student: "Steve Rogers", issueType: "UI Broken", description: "Navbar overlapping content on mobile Safari viewports.", status: "RESOLVED", createdAt: new Date(Date.now() - 3600000 * 24).toISOString() }
    ];
    localStorage.setItem('admin_tickets', JSON.stringify(defaultTickets));
    tickets = JSON.stringify(defaultTickets);
  }
  return JSON.parse(tickets);
};

export const updateTicketStatus = async (ticketId, status) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  let tickets = JSON.parse(localStorage.getItem('admin_tickets') || '[]');
  tickets = tickets.map(t => t.id === ticketId ? { ...t, status } : t);
  localStorage.setItem('admin_tickets', JSON.stringify(tickets));

  // Log action
  const auditLogs = JSON.parse(localStorage.getItem('admin_audit_logs') || '[]');
  auditLogs.unshift({
    id: auditLogs.length + 1,
    admin_name: "Super Admin",
    action: "UPDATE_TICKET_STATUS",
    target_entity: `Ticket:${ticketId}`,
    details: `Updated ticket status to ${status}.`,
    created_at: new Date().toISOString()
  });
  localStorage.setItem('admin_audit_logs', JSON.stringify(auditLogs));

  return tickets;
};

export const getSystemSettings = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return JSON.parse(localStorage.getItem('admin_system_settings') || '{}');
};

export const updateSystemSettings = async (settings) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const currentSettings = JSON.parse(localStorage.getItem('admin_system_settings') || '{}');
  const updatedSettings = { ...currentSettings, ...settings };
  localStorage.setItem('admin_system_settings', JSON.stringify(updatedSettings));

  // Log changes
  const auditLogs = JSON.parse(localStorage.getItem('admin_audit_logs') || '[]');
  const details = Object.entries(settings)
    .map(([key, val]) => `${key} changed from ${currentSettings[key]} to ${val}`)
    .join(', ');

  auditLogs.unshift({
    id: auditLogs.length + 1,
    admin_name: "Super Admin",
    action: "TOGGLE_SETTINGS",
    target_entity: "PlatformSettings",
    details: details || "Settings updated.",
    created_at: new Date().toISOString()
  });
  localStorage.setItem('admin_audit_logs', JSON.stringify(auditLogs));

  return updatedSettings;
};

export const getAuditLogs = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(localStorage.getItem('admin_audit_logs') || '[]');
};
