# 1. On part d'une image officielle Node.js (version 20, légère)
FROM node:20-alpine

# 2. On définit le dossier de travail dans le conteneur
WORKDIR /app

# 3. On copie les fichiers de dépendances en premier (pour optimiser le cache Docker)
COPY package*.json ./

# 4. On installe les dépendances
RUN npm install

# 5. On copie tout le reste du code source
COPY . .

# 6. On construit l'application pour la production (génère le dossier 'dist')
RUN npm run build

# 7. On installe un petit serveur web léger pour servir les fichiers statiques
RUN npm install -g serve

# 8. On expose le port 3000 (celui que le serveur va utiliser)
EXPOSE 3000

# 9. La commande qui sera lancée au démarrage du conteneur
CMD ["serve", "-s", "dist", "-l", "3000"]