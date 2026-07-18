---
title: Guide d'écriture
date: 2026-07-18
tags:
  - meta
---

Tout ce qui est utilisable dans les notes, avec un exemple de chaque. Cette note sert aussi de test visuel du thème.

## Liens

Les wikilinks Obsidian fonctionnent : [[index|retour à l'accueil]]. Survoler un lien interne affiche un aperçu de la note.

## Code

```python
def moyenne(valeurs: list[float]) -> float:
    """Somme sur effectif — rien de plus."""
    return sum(valeurs) / len(valeurs)
```

```sql
SELECT annee, SUM(montant) AS total
FROM ventes
GROUP BY annee
ORDER BY annee DESC;
```

## Callouts

> [!tip] Astuce
> Les callouts Obsidian sont rendus tels quels.

> [!warning] Attention
> Celui-ci aussi, et ils sont pliables en ajoutant `-` après le type.

## Le reste

Les tableaux, les listes de tâches et le $\LaTeX$ inline ($e^{i\pi} + 1 = 0$) passent aussi :

| Syntaxe        | Support |
| -------------- | ------- |
| GFM (tableaux) | oui     |
| Maths (KaTeX)  | oui     |

- [x] écrire la première note
- [ ] écrire la suivante

> [!note] Dates
> La date affichée sur une note vient du frontmatter `date:`. Sans elle, c'est la date du build qui s'affiche — voir `agora/README.md`.
