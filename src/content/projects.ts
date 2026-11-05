export type ProjectLinkLabel = "site" | "repo" | "v1";

export interface Project {
  /** Key of the project's texts in `messages.projects.items`. */
  key: string;
  code: string;
  tags: string[];
  links: { label: ProjectLinkLabel; href: string }[];
  live?: boolean;
  privateRepo?: boolean;
}

export const PROJECTS: Project[] = [
  {
    key: "nfe",
    code: "projeto_01",
    tags: ["Python", "CustomTkinter", "OpenCV", "Tesseract OCR", "Pandas", "PyInstaller"],
    links: [{ label: "repo", href: "https://github.com/The-Souza/consulta-nfe-cte" }],
  },
  {
    key: "billwise",
    code: "projeto_02",
    live: true,
    tags: ["Next.js 16", "TypeScript", "Prisma 7", "PostgreSQL", "Supabase Auth", "TanStack Query"],
    links: [
      { label: "site", href: "https://billwise-dashboard.vercel.app" },
      { label: "repo", href: "https://github.com/The-Souza/billwise-dashboard" },
      { label: "v1", href: "https://github.com/The-Souza/Account-Management" },
    ],
  },
  {
    key: "souzaTech",
    code: "projeto_03",
    privateRepo: true,
    tags: ["Next.js 16", "Tailwind CSS v4", "shadcn/ui", "Motion", "Zod", "Resend", "Vitest"],
    links: [{ label: "site", href: "https://thesouzatech.com.br" }],
  },
  {
    key: "souzaTransportes",
    code: "projeto_04",
    privateRepo: true,
    tags: ["Next.js 16", "Tailwind CSS v4", "GSAP", "Lenis", "Vitest"],
    links: [{ label: "site", href: "https://thesouzatransportes.com.br" }],
  },
  {
    key: "jsonGenerator",
    code: "lab_01",
    tags: ["C#", ".NET 8"],
    links: [{ label: "repo", href: "https://github.com/The-Souza/Gerador_Arquivo_Json" }],
  },
];
