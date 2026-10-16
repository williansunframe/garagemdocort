# Garagem do Corte — Site

Site institucional da **Garagem do Corte** (Barba & Cabelo), em Cachoeirinha/RS.
HTML, CSS e JavaScript puros, sem build. Inclui um poste de barbeiro com asas em 3D (Three.js).

## Estrutura

```
index.html      Página principal
404.html        Página de erro
css/style.css   Estilos (cores no topo, em :root)
js/main.js      Links, menu mobile, animações (CONFIG no topo)
js/pole3d.js    Logo 3D
img/            Fotos da galeria e favicon
vercel.json     Cabeçalhos de segurança e cache para a Vercel
.htaccess       Cabeçalhos de segurança para hospedagem Apache
_headers        Cabeçalhos de segurança para Netlify / Cloudflare Pages
```

## Publicar

### GitHub
1. Crie um repositório novo em https://github.com/new (pode ser privado).
2. Clique em **"uploading an existing file"** e arraste **todo o conteúdo** desta pasta
   (inclusive `.gitignore`, `.vercelignore` e `vercel.json`).
3. Clique em **Commit changes**.

> Arquivos que começam com ponto podem ficar ocultos no Windows. No Explorador,
> ative **Exibir > Mostrar > Itens ocultos** para vê-los e arrastá-los.

### Vercel
1. Entre em https://vercel.com com a conta do GitHub.
2. **Add New > Project**, escolha o repositório e clique em **Deploy**
   (Framework Preset: **Other**, sem comando de build, Output Directory vazio).
3. A cada alteração enviada ao GitHub, a Vercel publica a nova versão sozinha.
4. Domínio próprio: **Project > Settings > Domains**.

## Editar

| O quê | Onde |
|---|---|
| WhatsApp geral e dos cursos | `js/main.js` (CONFIG) **e** links `wa.me` no `index.html` |
| Link de agendamento | `js/main.js` (CONFIG) **e** links no `index.html` |
| Preços e serviços | `index.html`, seção `#servicos` |
| Cursos | `index.html`, seção `#cursos` |
| Horários | `index.html`, seção `#local` |
| Fotos | `img/galeria-1.jpg` … `galeria-6.jpg` (mesmo nome) |
| Cores | `css/style.css`, bloco `:root` |

## Segurança

- **Content-Security-Policy** restritiva: só scripts próprios + Three.js (cdnjs, com **SRI**),
  fontes do Google e o mapa do Google em iframe com `sandbox`.
- Sem formulários, login, cookies ou coleta de dados.
- `X-Frame-Options: DENY` + `frame-ancestors 'none'` (anti-clickjacking).
- HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP e CORP.
- Links externos com `rel="noopener noreferrer"`.
- Nenhum segredo/chave no código (o `.gitignore` bloqueia arquivos `.env`).
