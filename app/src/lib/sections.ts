export type Section = {
  slug: string;
  name: string;
  kicker: string;
  tags: string[];
};

export const SECTIONS: Section[] = [
  { slug: "tech", name: "Technology", kicker: "Section A", tags: ["webdev", "javascript", "typescript", "react"] },
  { slug: "ai", name: "Artificial Intelligence", kicker: "Section B", tags: ["ai", "machine-learning", "llm", "openai"] },
  { slug: "devops", name: "DevOps & Cloud", kicker: "Section C", tags: ["devops", "kubernetes", "docker", "aws"] },
  { slug: "languages", name: "Languages & Tools", kicker: "Section D", tags: ["python", "rust", "go", "java"] },
  { slug: "opinion", name: "Opinion & Career", kicker: "Section E", tags: ["career", "productivity", "tech-news"] },
  { slug: "security", name: "Security", kicker: "Section F", tags: ["security", "cybersecurity", "privacy"] },
];

export function sectionBySlug(slug: string): Section | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}
