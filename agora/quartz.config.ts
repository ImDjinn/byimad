import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Configuration Quartz d'Agora (agora.byimad.net).
 *
 * Ce fichier n'est pas buildé sur place : la CI (.github/workflows/agora.yml)
 * le copie dans un checkout de Quartz au tag épinglé, avec quartz.layout.ts,
 * styles/custom.scss et content/.
 *
 * Palette alignée sur la landing byimad (index.html) : mêmes fonds, bordures
 * et gris ; accent ambre — Moires est indigo, Parthenon turquoise.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Agora",
    pageTitleSuffix: " — byimad",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "fr-FR",
    baseUrl: "agora.byimad.net",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Inter",
        body: "Inter",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#f6f8fa",
          lightgray: "#d0d7de",
          gray: "#57606a",
          darkgray: "#1f2328",
          dark: "#1f2328",
          secondary: "#9a6700",
          tertiary: "#bf8700",
          highlight: "rgba(154, 103, 0, 0.08)",
          textHighlight: "#f7c94855",
        },
        darkMode: {
          light: "#0b0e14",
          lightgray: "#2d333b",
          gray: "#8b949e",
          darkgray: "#e6edf3",
          dark: "#f0f6fc",
          secondary: "#f7c948",
          tertiary: "#fadf82",
          highlight: "rgba(247, 201, 72, 0.08)",
          textHighlight: "#f7c94833",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        // "git" est inutile en CI (le contenu est copié hors repo) : les dates
        // fiables viennent du frontmatter `date:` — voir agora/README.md.
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
