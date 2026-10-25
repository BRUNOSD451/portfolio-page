# Portfólio público · Bruno

Página em React, TypeScript e Vite. Usa preto, grafite e laranja, com layout responsivo, fonte Manrope hospedada localmente e conteúdo vindo das APIs existentes. O `portfolioFrontEnd` continua sendo o aplicativo de gestão.

## Executar

Requer Node.js 22.19+ (o workspace utiliza Node 24).

1. Inicie o Node em `../portfolioBackEnd`: `npm run dev`.
2. Inicie a IA em `../portfolioAi`: `uvicorn main:app --reload --host 127.0.0.1 --port 8000`, usando o ambiente virtual e o `.env` já configurados nesse projeto.
3. Nesta pasta, execute `npm install` e `npm run dev`.
4. Abra **http://127.0.0.1:5173**.

Em desenvolvimento, o Vite encaminha `/api` para `http://127.0.0.1:3000` e `/ai/chat` para `http://127.0.0.1:8000`. Não é necessário alterar o CORS ou copiar chaves para o frontend. `.env.example` documenta os destinos opcionais. Reinicie o Vite depois de mudar o ambiente.

## Conteúdo e integrações

- **Apresentação:** `GET /user/get`, selecionando exclusivamente o proprietário de ID 1. Nome, descrição, currículo e contatos vêm desse cadastro. Contagens refletem projetos e tecnologias recebidos. Os textos editoriais ficam em `src/components/Hero.tsx`; a página não exibe a foto do perfil.
- **Tecnologias:** `GET /technologies/get`. Faixa horizontal com imagens e nomes cadastrados.
- **Projetos:** `GET /projects/get` e `GET /projects/get/:id`. Busca por nome/descrição, filtro por tecnologia, seis projetos por vez e galeria com imagens e vídeos ordenados por `ordem` e ID. A listagem é combinada com os detalhes porque a API atual os retorna separadamente; no máximo quatro detalhes são consultados simultaneamente. Uma falha isolada preserva os outros projetos.
- **Assistente:** `POST /chat` com `{ "message": "..." }`, lendo `{ "answer": "..." }`. Inclui perguntas sugeridas, indicador de consulta, cancelamento local, recuperação de erros e bloqueio de envios simultâneos. Respostas são exibidas como texto, sem interpretar HTML. O histórico visual existe apenas na memória da aba. A API atual responde a cada pergunta individualmente: não recebe o histórico. Cancelar no navegador não garante que o processamento do modelo pare no servidor.
- **Contato:** e-mail e telefone do cadastro, com links e cópia do e-mail. Links de currículo e mídia aceitam apenas HTTP(S). A página não inventa redes sociais nem modifica registros.

Atualize os dados no app e recarregue a página para vê-los. Projetos sem mídias recebem uma capa tipográfica; falhas de imagem têm uma apresentação alternativa. Nenhum dado de demonstração é usado na aplicação.

## Organização

```text
src/
  main.tsx                  Inicia o React e carrega os estilos
  App.tsx                   Busca os dados e monta as seções da página
  components/               Hero, Header, tecnologias, chat, contatos e UI
    projects/               Lista de projetos, cards, filtro e modal da galeria
  services/                 Chamadas das APIs de perfil, tecnologias, projetos e chat
    config.ts               Endereços das APIs
    http.ts                 Requisições com timeout e tratamento de erros
  hooks/                    Carregamento de dados e animações ao rolar
  styles/                   CSS por seção, estilos globais e responsividade
  utils/                    Formatação e validação de URLs
  types.ts                  Tipos dos dados usados na página
```

Para entender a página, comece por `src/App.tsx`: ele mostra a ordem das seções e suas consultas. Para alterar o visual ou comportamento de uma seção, abra seu componente em `components/` e o CSS correspondente em `styles/` (por exemplo, `Chat.tsx` e `chat.css`). As chamadas ao backend ficam em `services/`; os componentes recebem os dados por propriedades ou chamam esses serviços nas interações.

`styles/styles.css` reúne os arquivos CSS na ordem de aplicação, mantendo `responsive.css` por último. As animações ficam em `motion.css`, carregado depois em `main.tsx`. Não é preciso criar novas camadas ou pastas para cada seção.

## Verificar

```sh
npm run typecheck
npm run lint
npm run build
```

`npm run preview` serve o build na porta 4173, incluindo os mesmos proxies locais. Confira carregamento das seções, filtros, galeria, chat e layout mobile. O TypeScript verifica imports e parâmetros sem uso. A configuração antiga do Playwright foi removida porque esta cópia não contém a suíte de testes.

As imagens das tecnologias vêm das URLs cadastradas na API. A pasta local `assets/technology-icons/` guarda materiais de preparação e backups de upload; não é usada pelo Vite e está fora do versionamento.

## Hospedagem

`npm run build` gera `dist/`. A hospedagem estática não executa os proxies de desenvolvimento. Antes de gerar o build para publicação, configure `VITE_API_URL` e `VITE_AI_API_URL` com as URLs HTTPS dos serviços; inclua a origem exata do site em `CORS_ORIGINS` nos dois backends. Alternativamente, configure o servidor da hospedagem para encaminhar as rotas `/api/...` e `/ai/chat` aos serviços privados. Não coloque chaves OpenRouter, credenciais de banco ou Cloudinary em variáveis `VITE_*`.

As rotas de escrita e gestão do conhecimento exigem sessão administrativa. A página continua usando somente leituras públicas e chat, sem login nem token administrativo. O chat possui limites de frequência e cota diária. Consulte [a configuração de segurança](../portfolioBackEnd/SEGURANCA.md) antes de publicar.

Referências de desenvolvimento: [React](https://react.dev/learn) e [Vite](https://vite.dev/guide/).
