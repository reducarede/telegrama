// Funções utilitárias compartilhadas pelas 3 páginas do blog.

function slugify(text) {
  return text
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(str) {
  return decodeURIComponent(escape(atob(str)));
}

// Monta o conteúdo do arquivo .md com frontmatter simples
function buildMarkdownFile({ title, date, body }) {
  return `---\ntitle: ${title.replace(/\n/g, ' ')}\ndate: ${date}\n---\n\n${body}`;
}

// Extrai { title, date, body } de um arquivo .md com frontmatter
function parseMarkdownFile(raw) {
  const match = raw.match(/^---\s*\ntitle:\s*(.*)\ndate:\s*(.*)\n---\s*\n([\s\S]*)$/);
  if (!match) {
    return { title: '(sem título)', date: null, body: raw };
  }
  return { title: match[1].trim(), date: match[2].trim(), body: match[3].trim() };
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function estimateReadingTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return { words, minutes };
}

function apiHeaders(token) {
  const h = { Accept: 'application/vnd.github+json' };
  if (token) h.Authorization = `token ${token}`;
  return h;
}

// Lista os arquivos .md na pasta de posts do repositório
async function fetchPostsList(cfg) {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.postsPath}?ref=${cfg.branch}`;
  const res = await fetch(url, { headers: apiHeaders() });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Erro ao listar posts (${res.status})`);
  const items = await res.json();
  return items.filter(i => i.type === 'file' && i.name.endsWith('.md'));
}

// Busca o conteúdo bruto (raw) de um arquivo pelo download_url
async function fetchRaw(downloadUrl) {
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error(`Erro ao buscar arquivo (${res.status})`);
  return res.text();
}

// Cria ou atualiza um arquivo de post via API do GitHub (precisa de token)
async function putPostFile(cfg, token, path, content, message, sha) {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
  const body = {
    message,
    content: utf8ToBase64(content),
    branch: cfg.branch
  };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao publicar (${res.status})`);
  }
  return res.json();
}

// Busca metadados (sha) de um arquivo existente, se houver
async function getFileMeta(cfg, path, token) {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`;
  const res = await fetch(url, { headers: apiHeaders(token) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Erro ao verificar arquivo (${res.status})`);
  return res.json();
}

// Exclui um arquivo de post via API do GitHub (precisa de token e do sha atual)
async function deletePostFile(cfg, token, path, sha, message) {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha, branch: cfg.branch })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao excluir (${res.status})`);
  }
  return res.json();
}
