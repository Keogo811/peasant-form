# 🛠️ Peasant Form

**L'alternative fun, gratuite et data-driven à Google Forms.**

Peasant Form est une application web permettant de créer des formulaires personnalisés, de les partager via un lien public, et d'analyser les réponses via un tableau de bord de niveau "Data Scientist". 

Le projet a été conçu avec une contrainte de **zéro budget** et une volonté de s'éloigner de l'esthétique "corporate" des GAFAM, en adoptant un design **Néo-brutaliste** (bords noirs, ombres dures, couleurs pop).

---

## 🚀 Fonctionnalités

### Côté Créateur
- **Authentification** : Inscription et connexion sécurisées (via Neon Auth).
- **Création de formulaires** : Titre, description, et upload d'une image d'illustration (compressée automatiquement côté client).
- **Types de questions** : Texte court, texte long, choix unique, choix multiple, note (1-5), date, oui/non.
- **Gestion** : Publication/dépublication, suppression, copie du lien public.
- **7 Thèmes visuels** : Gaming, Noël, Japonais, Pro, Plage, Nerd, Byzantin (chacun avec ses motifs et polices uniques).

### Côté Public
- **Accès sans compte** : N'importe qui peut répondre via un lien unique.
- **Design immersif** : Application des thèmes visuels avec des motifs (Torii japonais, grilles néon, etc.).
- **Résultats publics** : Option pour afficher les résultats agrégés aux visiteurs.

### Dashboard Data Scientist
- **KPI** : Total des réponses, moyenne globale.
- **Statistiques avancées** : Médiane, mode, écart-type pour les questions de notes.
- **Graphiques en SVG pur** : Donuts (camemberts), Barres de progression, Radar Chart (toile d'araignée), Timeline (volume de réponses dans le temps).
- **NLP** : Nuage de mots (Word Cloud) généré à partir des réponses textuelles (filtrage des mots vides).
- **Export** : Téléchargement des données en **CSV** (compatible Excel) et **JSON**.

### Expérience Utilisateur (UX)
- **Internationalisation (i18n)** : Interface entièrement traduite en Français et en Anglais, avec un sélecteur de langue persistant.
- **Panneau de configuration flottant** : Mode sombre/clair, taille de police, couleur d'accentuation.
- **Ambiances saisonnières** : Animations de fond (neige, pluie, pétales, soleil) avec effets de bordure.
- **Musique d'ambiance** : Lecteur audio intégré.

---

## 🛠️ Stack Technique

- **Frontend** : React (Vite) + CSS pur (aucune librairie UI lourde).
- **Backend / Base de données** : Neon (PostgreSQL Serverless) avec l'API Data et Better Auth.
- **Sécurité** : Row-Level Security (RLS) de PostgreSQL.
- **Graphiques** : SVG natif et calculs mathématiques en JavaScript (zéro dépendance comme Chart.js).
- **Déploiement** : Vercel (Frontend) et Render (Conteneur Docker).

---

## ⚙️ Installation en Local

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/Keogo811/peasant-form.git
   cd peasant-form
   ```

2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Créer un fichier `.env` à la racine avec les variables suivantes (à récupérer dans la console Neon) :
   ```env
   VITE_NEON_DATA_API_URL=https://ep-xxxxx.apirest.c-2.eu-west-2.aws.neon.tech/neondb/rest/v1
   VITE_NEON_AUTH_URL=https://ep-xxxxx.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth
   VITE_NEON_JWKS_URL=https://ep-xxxxx.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth/.well-known/jwks.json
   ```

4. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

---

## 🐳 Déploiement avec Docker

Le projet est "dockerisé" pour garantir un environnement identique en local et en production.

1. Construire l'image :
   ```bash
   docker build -t peasant-form .
   ```

2. Lancer le conteneur :
   ```bash
   docker run -p 3000:3000 peasant-form
   ```

L'application sera accessible sur `http://localhost:3000`.

---

## 🧠 Défis Techniques et Solutions (Leçons apprises)

Le développement n'a pas été linéaire. Voici les principaux "combats" menés durant ce projet :

### 1. Le piège de l'UUID vs TEXT avec Neon Auth
- **Problème** : Erreur `operator does not exist: uuid = text` lors des requêtes RLS.
- **Cause** : Neon Auth génère des identifiants (JWT `sub`) sous forme de texte, mais `auth.uid()` renvoie de l'UUID. Le schéma SQL avait une colonne `creator_id` en `UUID`.
- **Solution** : Aligner le schéma en utilisant `auth.uid()` dans les politiques RLS et s'assurer que la colonne `creator_id` est bien de type `UUID`.

### 2. L'injection du JWT (Erreurs 403 persistantes)
- **Problème** : Les requêtes d'insertion étaient rejetées (403 Forbidden) car le SDK ne transmettait pas le token d'authentification.
- **Solution** : Configurer explicitement `getToken` dans le client Neon et utiliser le `BetterAuthReactAdapter`.

### 3. Le déploiement (Erreur "Invalid origin")
- **Problème** : Une fois déployé sur Vercel, l'authentification refusait le domaine de production.
- **Solution** : Ajouter explicitement le domaine Vercel (et le wildcard `*.vercel.app`) dans la configuration "Trusted Domains" de la console Neon.

### 4. Le stockage d'images sans coût
- **Problème** : Le Free Tier de Neon n'est pas fait pour stocker des images lourdes.
- **Solution** : Création d'un script de compression côté client (Canvas HTML5) qui redimensionne l'image à 800px max et la convertit en Base64 (qualité 70%) avant de l'insérer dans la base de données.

### 5. Les graphiques sans librairie
- **Problème** : Les librairies de graphiques (Chart.js, Recharts) sont lourdes et difficiles à styliser en mode sombre.
- **Solution** : Création de composants SVG from scratch (`DonutChart`, `RadarChart`). Utilisation de `conic-gradient` et de calculs trigonométriques purs pour dessiner les données.

### 6. Le Dockerfile introuvable sur Render
- **Problème** : Render ne trouvait pas le `Dockerfile` lors du premier déploiement.
- **Solution** : Le fichier n'avait pas été poussé sur GitHub. Un `git add Dockerfile && git commit && git push` a résolu le problème.

### 7. Les variables d'environnement Vite dans Docker (Build Args)
- **Problème** : Après déploiement sur Render, l'application ne communiquait pas avec Neon (connexion impossible, console vide).
- **Cause** : Vite injecte les variables `VITE_*` **au moment du build** (`npm run build`), pas au démarrage du conteneur. Render ne les fournissait pas à l'étape de construction.
- **Solution** : Déclarer des `ARG` dans le `Dockerfile`, les convertir en `ENV` avant le `npm run build`, et configurer les variables dans l'interface Render (Environment). Un `git push` puis un `Clear build cache & deploy` a résolu le problème.

---

## 🔮 Améliorations Futures

- **Accessibilité** : Tests avec lecteurs d'écran et amélioration des attributs ARIA.
- **Sécurité** : Implémentation d'un "Rate Limiting" pour éviter le spam de réponses.
- **Fonctionnalités** : Système de "Mot de passe oublié" pour les créateurs.

---

## 👤 Auteur

**Keogo** — Étudiant en IA, passionné par le développement web.
- *Projet réalisé dans le cadre dans la recherche d'alternative et de tester ses capacités de réaliser ses idées.*