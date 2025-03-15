# Utilise une image de base pour Node.js
FROM node:18

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Copier tout le reste des fichiers de l'application
COPY . .

# Exposer le port sur lequel ton backend va tourner
EXPOSE 3000

# Lancer l'application
CMD ["npm", "run", "start:prod"]
