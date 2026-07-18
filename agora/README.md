# Agora — wiki public (agora.byimad.net)

Notes Obsidian publiées en site statique avec [Quartz](https://quartz.jzhao.xyz)
(v4, tag épinglé dans `.github/workflows/agora.yml`).

## Écrire

Ouvrir `agora/content/` comme vault Obsidian et écrire. Un push sur `main`
suffit : la CI construit le site et le pousse sur le VPS.

- Frontmatter utile : `title:`, `date:` (affichée sur la note — la CI ne
  conserve pas les dates de fichiers, sans `date:` c'est la date du build qui
  s'affiche), `tags:`, `draft: true` (note exclue du site publié).
- `private/`, `templates/` et `.obsidian/` ne sont jamais publiés
  (`ignorePatterns` de `quartz.config.ts`).

## Déploiement

`.github/workflows/agora.yml` : clone Quartz au tag épinglé, y copie
`quartz.config.ts`, `quartz.layout.ts`, `styles/custom.scss` et `content/`,
build, puis rsync de `public/` vers `/opt/agora-site` sur le VPS — dossier
servi par l'edge (`proxy/Caddyfile`). Prérequis VPS : voir `DEPLOY.md`.
