export type ProjectLinkLabel = "site" | "repo" | "v1";

export interface ProjectImage {
  src: string;
  width: number;
  height: number;
}

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
  /** Screenshot in public/images/projects, with its real size (it shows whole, in its own shape). */
  image: ProjectImage;
  /** Shown in the window bar above the screenshot, like an address. */
  address: string;
  /** BillWise's "v1 · previous version" ghost layer that glitches on reveal. */
  ghost?: boolean;
  /** "status" when the closing line is where the project stands, not a measured result. */
  outcome?: "result" | "status";
}

export const PROJECTS: Project[] = [
  {
    key: "nfe",
    code: "projeto_01",
    seed: 11,
    image: { src: "/images/projects/consulta-nfe-cte.png", width: 1919, height: 1049 },
    address: "consulta-nfe-cte.exe",
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
    image: { src: "/images/projects/billwise-dashboard.png", width: 1920, height: 1080 },
    address: "billwise-dashboard.vercel.app",
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
    image: { src: "/images/projects/the-souza-tech.png", width: 1907, height: 1078 },
    address: "thesouzatech.com.br",
    privateRepo: true,
    outcome: "status",
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
    image: { src: "/images/projects/the-souza-transportes.png", width: 1907, height: 1078 },
    address: "thesouzatransportes.com.br",
    privateRepo: true,
    outcome: "status",
    tags: ["Next.js 16", "Tailwind CSS v4", "GSAP", "Lenis", "Vitest"],
    links: [{ label: "site", href: "https://thesouzatransportes.com.br" }],
  },
];
