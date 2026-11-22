# grafMED · novo site (protótipo funcional 2026)

Site em HTML, CSS e JS puros, gerado a partir de `src/`. Segue o **Briefing de Webdesign (set/2026)** e as **mudanças de 10/11/2026**. Quando os dois divergem, valem as mudanças de novembro.

## Como abrir o site no navegador

O site já vem pronto na pasta `site/`. Para só ver o site, **não precisa instalar nada**.

### Passo 1: baixar o projeto

**Sem usar git (mais simples)**
1. Abra https://github.com/Stormbyz/SITETESTE no navegador.
2. Troque o branch para **`claude/funny-euler-taf1gw`** no seletor de branch (canto superior esquerdo, onde está escrito `main` ou o nome do branch).
3. Clique no botão verde **Code** e depois em **Download ZIP**.
4. Extraia o ZIP. No Windows: botão direito no arquivo → **Extrair tudo…**.

**Com git**
```bash
git clone -b claude/funny-euler-taf1gw https://github.com/Stormbyz/SITETESTE.git
```

### Passo 2: abrir

**Opção A: abrir direto, sem instalar nada**

Entre na pasta extraída, depois na pasta `site`, e dê dois cliques em **`index.html`**. O site abre no navegador e dá para navegar por todas as páginas.

Neste modo, alguns navegadores não guardam os itens do orçamento entre uma página e outra. Para testar o orçamento completo, use a opção B.

**Opção B: servidor local (recomendado, funciona 100%)**

Escolha **uma** das formas abaixo.

*Com Python* (no Windows, instale em https://www.python.org/downloads/ marcando **"Add Python to PATH"**; no Mac ele já vem instalado):
1. Abra a pasta `site`.
2. Abra um terminal nessa pasta. No Windows: clique na barra de endereço da pasta, digite `cmd` e aperte Enter. No Mac: botão direito na pasta → **Novo Terminal na Pasta**.
3. Rode o comando:
   ```bash
   python -m http.server 8080
   ```
   No Mac, se `python` não for reconhecido, use `python3`.
4. Abra **http://localhost:8080** no navegador.
5. Para desligar o servidor, volte ao terminal e aperte `Ctrl + C`.

*Com Node.js* (instale em https://nodejs.org, versão LTS):
1. Abra um terminal dentro da pasta `site`.
2. Rode o comando:
   ```bash
   npx serve .
   ```
3. Abra o endereço que aparecer no terminal (normalmente **http://localhost:3000**).

*Com VS Code:*
1. Instale a extensão **Live Server** no VS Code.
2. Abra a pasta `site` no VS Code (**Arquivo → Abrir pasta**).
3. Clique com o botão direito em `index.html` → **Open with Live Server**.

### Se você editar o conteúdo

Textos, produtos, FAQ e contatos ficam em `src/`. Depois de editar, gere o site de novo. Para isso, você precisa ter o Node.js instalado. Abra um terminal na pasta principal do projeto (não na `site`) e rode:
```bash
node src/build.mjs
```
Depois recarregue o navegador. Os arquivos `site/data/banners.js` (banners das páginas), `site/data/destaques.js` (mais vendido da semana) e `site/data/parceiros.js` (parceiros credenciados) podem ser editados direto, sem gerar o site de novo.

### Problemas comuns

| Problema | O que fazer |
|---|---|
| `python` não é reconhecido | Reinstale o Python marcando **Add Python to PATH**, ou use `py -m http.server 8080` |
| PowerShell: "npx.ps1 não pode ser carregado… execução de scripts foi desabilitada" | Rode `npx.cmd serve .` no lugar de `npx serve .`, ou use o Prompt de Comando (`cmd`) em vez do PowerShell |
| Porta 8080 em uso | Use outra porta: `python -m http.server 5500` e abra http://localhost:5500 |
| Página sem estilo / fonte diferente | Confira se abriu a partir da pasta `site`. A fonte vem do Google Fonts e precisa de internet |
| Botões de WhatsApp vão para um número errado | O número ainda é provisório: troque `whatsapp` em `src/config.mjs` e rode `node src/build.mjs` |

## Estrutura

| Pasta / arquivo | O que é |
|---|---|
| `src/products.json` | 34 produtos reais: textos, uso, diferenciais, medidas e especificações extraídos do site atual, mais a linha grafDENTAL do Drive da marca |
| `src/articles.json` | 5 artigos do blog atual, com texto completo |
| `src/data.mjs` | Linhas, FAQ, etapas do ciclo, depoimentos, redirecionamentos 301 |
| `src/config.mjs` | WhatsApp, telefone, e-mail, endereço (dados do site atual), mapa, rastreamento |
| `src/build.mjs` | Templates das páginas, gera `site/` + `sitemap.xml`, `robots.txt`, `_redirects`, `vercel.json` |
| `site/data/banners.js` | **Banners de todas as páginas** (carrossel da Home e um banner por página), editáveis pela equipe |
| `site/data/destaques.js` | **Mais vendido da semana** (rodízio automático por semana) |
| `site/data/parceiros.js` | **Parceiros credenciados** |
| `site/assets/img/` | Logo oficial (colorida e branca), logos de clientes, fotos de produto e de aplicação, indicador antes e depois |

## Direção visual aplicada

- Logo oficial em todas as aplicações (versão branca sobre o laranja).
- Somente Montserrat, variando pesos (300 a 800) e cores, sem espaçamento largo entre letras.
- Cantos pouco arredondados, com bordas finas. Sem travessões nos textos.
- Gradiente laranja da marca com o padrão de hexágonos em linhas finas, mais forte do lado da imagem para não atrapalhar a leitura.
- Todas as fotos de produto **sem fundo e padronizadas** (mesmo enquadramento e margem), em `assets/img/recorte`.
- Cards em formato de etiqueta; no hover aparece "+ Adicionar ao orçamento".

## Interatividade, 3D e animação

- **Banners em camadas 3D**: fotos sem fundo de produtos e aplicações sobrepostas com profundidade, que se movem com o mouse e com a rolagem, com selos informativos flutuantes. Tudo editável em `site/data/banners.js`.
- **Indicador químico Tipo 1 em 3D** (Three.js): uma etiqueta CME desenhada fiel ao produto. Ao puxar a linha, a faixa muda de rosa para marrom; dá para girar, aproximar (botões, roda do mouse ou pinça) e focar no indicador.
- **Rastreabilidade de ponta a ponta**: a seção fica fixa na tela e cada etapa mostra uma cena própria: fotos sem fundo, vídeo real da autoclave e o prontuário do paciente com a parte destacável da etiqueta.
- **Mais vendido da semana**: foto sem fundo em 3D, pontos numerados explicando o produto, troca entre os destaques e giro com a rolagem.
- **Números** em negrito, em faixa de destaque.
- **Conversão de matéria-prima**: animação 3D de bobina, prensa de corte, esteira e kit, com troca de material (velcro, micropore, feltro, espuma, silicone).
- **Projeto sob medida**: configurador 3D (forma, medida, material, indicador e texto). A configuração vai pronta na mensagem do WhatsApp e no formulário.

As cenas 3D usam o Three.js salvo em `site/assets/vendor` e texturas desenhadas no navegador, então funcionam também abrindo o `index.html` direto do disco. Sem suporte a 3D, o navegador mostra uma versão plana equivalente.

## Pendências antes de publicar

1. Confirmar se (11) 94561-0928 é o WhatsApp comercial.
2. Lista de medidas em estoque: hoje são as do site atual. A grafMED envia a lista final.
3. Fotos sem caixa de papelão para Etiqueta de Fracionamento e Etiqueta de Despacho (estão com aviso "foto em produção").
4. Fotos em alta resolução de alguns produtos de rótulos (as atuais vieram pequenas do site).
4. Depoimentos autorizados e lista inicial de parceiros credenciados.
5. Arte final dos selos "Original grafMED".
6. Endereço e mapa do galpão do Jaraguá (`mapEmbed`).
7. Endpoint de formulário (`formEndpoint`). Sem ele, o envio abre o e-mail do visitante.
8. Rótulos das conversões do Google Ads, `tracking.enabled = true` e validação no Tag Assistant.
9. Revisar o mapa 301 (já inclui as páginas, os produtos e os artigos atuais).

## Levando para o Wix (editor novo)

| Aqui | No Wix |
|---|---|
| `banners.js` (banner de cada página) | Coleção CMS "Banners" (página, ordem, imagem, título, texto, botão, link) |
| `destaques.js` (rodízio por semana ISO) | Coleção CMS "Destaques" + código Velo com o mesmo cálculo de semana |
| `parceiros.js` | Coleção CMS "Parceiros" + repetidor |
| Notícias | Blog nativo (categorias Artigos técnicos e Eventos e feiras) |
| Carrinho de orçamento | Velo + `wix-storage` (local) + Coleção "Orçamentos" para gravar o pedido |
| Formulário rápido | Wix Forms com campos sequenciais ou Velo |
| `_redirects` | Gerenciador de redirecionamentos 301 do Wix SEO |
| Tags de rastreamento | Código personalizado (Body-fim em todas as páginas, Head só em /obrigado) |
