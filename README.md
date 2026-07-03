# Meu Blog (GitHub Pages)

Um blog minimalista, estilo "paste", com duas interfaces:

- **`editor.html`** — onde você escreve e publica (só você acessa, protegido pelo seu token).
- **`index.html`** / **`post.html`** — a versão pública, que qualquer visitante vê.

Não há servidor nem banco de dados: cada post é um arquivo `.md` na pasta `posts/`,
e a publicação acontece via chamada direta à API do GitHub, do seu navegador.

## 1. Subir o projeto

1. Crie um repositório novo (público) no GitHub.
2. Suba todos estes arquivos para a raiz dele (`index.html`, `post.html`, `editor.html`,
   `config.js`, `github.js`, `style.css`, `.nojekyll`, pasta `posts/`).
3. Em **Settings → Pages**, escolha "Deploy from a branch", branch `main`, pasta `/root`.
4. Aguarde alguns minutos — o site fica em `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`.

## 2. Configurar

Abra `config.js` e preencha:

```js
const BLOG_CONFIG = {
  owner: "SEU-USUARIO",
  repo: "SEU-REPOSITORIO",
  branch: "main",
  postsPath: "posts"
};
```

## 3. Criar seu token do GitHub

1. Vá em **github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. Clique em "Generate new token".
3. Em "Repository access", escolha **apenas este repositório**.
4. Em "Permissions", dê acesso de **leitura e escrita em "Contents"**.
5. Copie o token gerado (começa com `github_pat_...` ou `ghp_...`).

Você vai colar esse token na tela `editor.html` toda vez que for publicar
(ou marcar "lembrar neste navegador" pra não digitar de novo).

⚠️ **Importante:** esse token fica salvo no `localStorage` do seu navegador se você marcar
"lembrar". Só use isso em um navegador/computador que só você usa. Não compartilhe o token
com ninguém — quem tiver acesso a ele pode escrever no seu repositório.

## 4. Publicar um post

1. Acesse `editor.html` no site publicado.
2. Cole seu token.
3. Escreva o título e o texto (em Markdown).
4. Clique em **Publicar**.

O editor cria um arquivo `posts/seu-titulo.md` no repositório via API do GitHub.
O GitHub Pages detecta o novo commit e republica o site automaticamente
(geralmente leva de 30 segundos a poucos minutos).

## 5. Editar um post existente

Abra o post publicado e clique em **Editar** no topo — isso leva você de volta ao
editor com o conteúdo já carregado. Ao salvar, o mesmo arquivo é atualizado (não cria um novo).

## Limitações a ter em mente

- A API pública do GitHub tem limite de **60 requisições/hora sem token** e
  **5.000/hora com token** — mais que suficiente para uso pessoal, mas evite recarregar
  a lista de posts compulsivamente.
- Não há comentários, busca ou analytics — é propositalmente simples. Dá pra adicionar
  depois (ex: comentários via [giscus](https://giscus.app), que também é estático).
- Como o repositório é público, o **conteúdo dos posts é público** assim que publicado
  (mesmo antes do GitHub Pages atualizar, já é visível pela API/no histórico do Git).
