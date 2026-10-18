// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://sightline-docs.netlify.app",
  integrations: [
    starlight({
      title: "Sightline docs",
      description: "Specification, design system and agent rules for Sightline.",
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/azharumar/sightline-docs" }],
      sidebar: [
        { label: "Start here", items: [{ slug: "index" }, { slug: "how-this-repo-works" }] },
        { label: "App specification", items: [{ autogenerate: { directory: "spec/app" } }] },
        { label: "Blueprint (business and website)", items: [{ autogenerate: { directory: "spec/blueprint" } }] },
        { label: "Design system", items: [{ autogenerate: { directory: "design" } }] },
        { label: "AI agents", items: [{ autogenerate: { directory: "agents" } }] },
        { label: "Decisions", items: [{ autogenerate: { directory: "decisions" } }] },
      ],
    }),
  ],
});
