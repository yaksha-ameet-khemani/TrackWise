export const CLIENTS = [
  "Cognizant",
  "KPMG",
  "UST",
  "IIHT",
  "B2C",
  "Infosys",
  "Wipro",
  "Other",
  "Test Clinet",
];

export const SKILLS = [
  "HTML/CSS/JS",
  "React",
  "Angular",
  "TypeScript",
  "Python",
  "Python (Pandas)",
  "PySpark",
  "ML/AI",
  "Java",
  "Spring Boot",
  "JUnit",
  "C#",
  "Selenium",
  "REST Assured",
  "Docker",
  "DevOps",
  "MERN",
  "Other",
];

export const STATUSES = [
  "Under Review by client",
  "Approved by client",
  "Closed program",
  "Pending",
  "Rejected",
];

export const TYPES = ["MFA", "SF", "MCQ"] as const;

export const MILESTONES = [
  "Mock",
  "Actual",
  "Re-attempt",
  "Actual (Milestone-2)",
  "Re-attempt (Milestone-2)",
  "Assignment",
  "Assessment",
];

export const GRADINGS = ["AutoGraded", "Manual"] as const;

export const SKILL_ASSIST_OPTS = ["Yes (Cognizant resource)", "Yes", "No"];

export const LEARNING_PATH_OPTS = ["Yes (Cognizant resource)", "Yes", "No"];

export const STORAGE_KEY = "csp_v2";

export const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  "Approved by client": {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-400",
  },
  "Under Review by client": {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-400",
  },
  "Closed program": {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-400",
  },
  Pending: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-400",
  },
  Rejected: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-400",
  },
};
