export interface StackCategory {
  /** Key of the category name in `messages.stack.categories`. */
  key: string;
  tags: string[];
  /** Shows the "running on this page" note. */
  runningHere?: boolean;
}

export const STACK_CATEGORIES: StackCategory[] = [
  { key: "frontend", tags: ["Next.js", "React", "TypeScript", "JavaScript", "Tailwind CSS", "shadcn/ui", "Radix UI", "Vite"] },
  { key: "state", tags: ["TanStack Query", "Context API", "React Hook Form", "Zod"] },
  { key: "animation", tags: ["GSAP", "ScrollTrigger", "Lenis", "Motion"], runningHere: true },
  {
    key: "backend",
    tags: ["Server Actions", "Node.js", "Express", "APIs REST", "JWT", "Prisma", "PostgreSQL", "Supabase", "C#", "ASP.NET", "EF Core", "SQL Server", "DB2"],
  },
  { key: "automation", tags: ["Python", "CustomTkinter", "OpenCV", "Tesseract OCR", "Pandas", "openpyxl", "PyInstaller"] },
  { key: "delivery", tags: ["Vitest", "React Testing Library", "MSW", "GitHub Actions", "Git Flow", "Vercel", "Azure DevOps", "pnpm"] },
];
