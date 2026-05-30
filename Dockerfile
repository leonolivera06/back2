# Usa a imagem oficial do Node
FROM node:18-alpine

# Cria e define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de dependências e instala
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta que a aplicação vai rodar
EXPOSE 5000

# Comando para iniciar a API
CMD ["npm", "start"] 
# (Se o seu package.json usar "node server.js", mude para CMD ["node", "server.js"])