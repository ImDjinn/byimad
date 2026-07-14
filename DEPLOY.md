# byimad.net — architecture autonome

Chaque application est un **stack Docker indépendant**. Un **edge proxy dédié**
est le seul service exposé sur `80/443` : il termine le TLS (Let's Encrypt) et
route chaque domaine vers le conteneur de l'app, sur un réseau Docker partagé
`web`.

```
                       ┌──────────────────────┐
   :80 / :443  ───────▶│  edge  (byimad/proxy)  │  TLS + routage par domaine
                       └─────────┬────────────┘
              réseau Docker « web »
        ┌───────────────┼─────────────────────────┐
        ▼               ▼                          ▼
  byimad-site      moires-web                /srv/parthenon-releases
  (byimad)         (repo Moires)             (volume, rempli par la CI Parthenon)
```

| Adresse | Servi par | Contenu |
|---------|-----------|---------|
| `byimad.net` | `byimad-site` | Landing (liens vers les apps) |
| `parthenon.byimad.net` | `byimad-site` + edge | Page de présentation + `/releases/` |
| `moires.byimad.net`, `themoirai.net` | `moires-web` (repo Moires) | L'app Moires |

Chaque app tourne dans un stack autonome (conteneurs découplés). Le **routing**
reste centralisé ici, dans `proxy/Caddyfile` : ajouter un domaine ou une app
implique d'éditer ce fichier et de redéployer l'edge.

- **byimad** : ce repo. Publie la landing, **la page d'info Parthenon**
  (`parthenon/index.html`) et possède l'edge + le routing de toutes les apps.
- **Moires** : publie l'app (`moires.byimad.net`) depuis son propre stack ; son
  domaine est déclaré dans l'edge ci-contre.
- **Parthenon** : publie ses releases (GitHub + `parthenon.byimad.net/releases/`)
  via sa CI. Sa page vitrine, elle, vit ici (pas dans le repo Parthenon) — c'est
  un couplage assumé : byimad est le propriétaire des pages d'info.

## 1. DNS (une fois)

Chez le registrar de `byimad.net`, enregistrements **A** vers l'IP du VPS,
**proxy désactivé / DNS only** (le proxy orange Cloudflare casse les certificats Caddy) :

```
byimad.net            A  IP_DU_VPS
www.byimad.net        A  IP_DU_VPS
moires.byimad.net     A  IP_DU_VPS
parthenon.byimad.net  A  IP_DU_VPS
```

## 2. Réseau partagé (une fois)

Tous les stacks se joignent au même réseau Docker externe :

```bash
docker network create web
```

## 3. Démarrer l'edge proxy + le portail byimad

```bash
# Cloner byimad sur le VPS
cd ~ && git clone https://github.com/ImDjinn/byimad.git byimad && cd byimad

# Edge proxy (TLS + routage) — un seul service sur 80/443
docker compose -f proxy/docker-compose.yml up -d

# Portail byimad.net + page Parthenon
docker compose up -d
```

## 4. Démarrer Moires

Depuis le repo Moires (voir son `deploy/README.md`) : son Caddy rejoint le
réseau `web` et n'expose plus aucun port — l'edge le route. Il ne sert que
l'app Moires.

## 5. Mettre à jour le portail byimad

```bash
cd ~/byimad && git pull   # contenu monté en volume : effet immédiat
```

## Releases Parthenon

Parthenon est une **app desktop Electron**. Sa CI (repo Parthenon, déclenchée par
un tag `vX.Y.Z`) publie chaque release aux deux endroits :

1. **GitHub Releases** → `<votre-org>/Parthenon-Releases`.
2. **VPS** → `scp` des installeurs + manifestes electron-updater
   (`latest.yml`, `latest-mac.yml`) dans `/opt/parthenon-releases`, servi par
   l'edge sur `parthenon.byimad.net/releases/` (provider `generic`,
   `Parthenon/resources/update-config.json`).

Prévoir `sudo mkdir -p /opt/parthenon-releases` sur le VPS à la première fois.
La page `parthenon.byimad.net` lit `latest.yml` et génère les liens directs.

## 6. CI/CD — chaque repo déploie sa propre partie

Chaque application déploie sur le VPS **depuis sa propre GitHub Action**, sans
toucher aux autres. Les trois workflows existent déjà :

| Repo | Workflow | Déclencheur | Ce qu'il déploie |
|------|----------|-------------|------------------|
| **byimad** | `.github/workflows/deploy.yml` | push `main` | SSH → `git pull` + `up -d` de l'edge et du portail |
| **Moires** | `.github/workflows/deploy.yml` | fin de CI OK sur `main` (ou manuel) | SSH → `git reset --hard` + `up -d --build` de son stack |
| **Parthenon** | `.github/workflows/release.yml` | tag `vX.Y.Z` | `scp` des installeurs puis des manifestes dans `/opt/parthenon-releases` |

### Secrets GitHub

**byimad** et **Parthenon** partagent la convention `VPS_*` ; **Moires** utilise
`DEPLOY_*` (voir son `deploy/README.md`). Générer une clé dédiée par repo
(`ssh-keygen -t ed25519 -f deploy_key -N ""`) et déposer la **privée** dans le
secret, la **publique** dans `~/.ssh/authorized_keys` du VPS.

| Repo | Secrets |
|------|---------|
| byimad | `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PORT` (opt.) |
| Parthenon | `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PORT` (opt.), `AIRLIQUIDE_RELEASE_TOKEN` |
| Moires | `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH` |

### Prérequis VPS (une fois)

Utilisateur de déploiement membre du groupe `docker` (jamais `root` pour la CI) :

```bash
sudo adduser --disabled-password deploy
sudo usermod -aG docker deploy
# clé publique de déploiement → /home/deploy/.ssh/authorized_keys
```

byimad et Moires font un `git pull`/`reset` : leur repo doit déjà être cloné sur
le VPS (voir §3 et §4). Parthenon n'a besoin que d'un accès écriture à
`/opt/parthenon-releases`.
