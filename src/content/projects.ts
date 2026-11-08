export type ProjectLinkLabel = "site" | "repo" | "v1";

export interface Project {
  /** Key of the project's texts in `messages.projects.items`. */
  key: string;
  code: string;
  tags: string[];
  links: { label: ProjectLinkLabel; href: string }[];
  live?: boolean;
  privateRepo?: boolean;
  /** Keeps each placeholder image the same on every render. */
  seed: number;
  /** Screenshot in public/images/projects, 16:9; the placeholder art until there is one. */
  image?: string;
  /** BillWise's "v1 · previous version" ghost layer that glitches on reveal. */
  ghost?: boolean;
}

export const PROJECTS: Project[] = [
  {
    key: "nfe",
    code: "projeto_01",
    seed: 11,
    image: "/images/projects/consulta-nfe-cte.png",
    tags: [
      "Python",
      "CustomTkinter",
      "OpenCV",
      "Tesseract OCR",
      "Pandas",
      "PyInstaller",
    ],
    links: [
      { label: "repo", href: "https://github.com/The-Souza/consulta-nfe-cte" },
    ],
  },
  {
    key: "billwise",
    code: "projeto_02",
    seed: 23,
    image: "/images/projects/billwise-dashboard.png",
    ghost: true,
    live: true,
    tags: [
      "Next.js 16",
      "TypeScript",
      "Prisma 7",
      "PostgreSQL",
      "Supabase Auth",
      "TanStack Query",
    ],
    links: [
      { label: "site", href: "https://billwise-dashboard.vercel.app" },
      {
        label: "repo",
        href: "https://github.com/The-Souza/billwise-dashboard",
      },
      { label: "v1", href: "https://github.com/The-Souza/Account-Management" },
    ],
  },
  {
    key: "souzaTech",
    code: "projeto_03",
    seed: 37,
    image: "/images/projects/the-souza-tech.png",
    privateRepo: true,
    tags: [
      "Next.js 16",
      "Tailwind CSS v4",
      "shadcn/ui",
      "Motion",
      "Zod",
      "Resend",
      "Vitest",
    ],
    links: [{ label: "site", href: "https://thesouzatech.com.br" }],
  },
  {
    key: "souzaTransportes",
    code: "projeto_04",
    seed: 41,
    image: "/images/projects/the-souza-transportes.png",
    privateRepo: true,
    tags: ["Next.js 16", "Tailwind CSS v4", "GSAP", "Lenis", "Vitest"],
    links: [{ label: "site", href: "https://thesouzatransportes.com.br" }],
  },
];
