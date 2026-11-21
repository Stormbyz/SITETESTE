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
Depois recarregue o navegador. Os arquivos `site/data/destaques.js` (mais vendido da semana) e `site/data/parceiros.js` (parceiros credenciados) podem ser editados direto, sem gerar de novo.

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
| `src/data.mjs` | Linhas, produtos, FAQ, depoimentos, artigos, redirecionamentos 301 |
| `src/config.mjs` | WhatsApp, e-mail, endereço, mapa, endpoint de formulário, rastreamento |
| `src/mock.mjs` | Mockups vetoriais dos produtos (bobina, fita, rótulo, pulseira), logo e selo |
| `src/build.mjs` | Templates das páginas, gera `site/` + `sitemap.xml`, `robots.txt`, `_redirects`, `vercel.json` |
| `site/data/destaques.js` | **Mais vendido da semana**: lista do rodízio (editável pela equipe) |
| `site/data/parceiros.js` | **Parceiros credenciados** (editável pela equipe) |
| `site/assets/js/app.js` | Interações: orçamento, formulários, simulador, prévias, filtros |
| `site/assets/js/tracking.js` | Google Ads AW-674888037 + GA4 G-3FPHZXN63W (desligado até a publicação) |

## O que o briefing pediu e onde está

- **Menu do topo curto**: Produtos (linhas + Conversão + Projetos) · Notícias (Artigos técnicos, Eventos e feiras) · Contato · Orçamento com contador · **Fale com um especialista** (WhatsApp, com alerta pulsante, fixo no topo e no banner).
- **Menu do rodapé**: Quem somos, Canal Parceiro, Trabalhe conosco, FAQ, Qualidade, Privacidade.
- **Todo botão abre o WhatsApp** com mensagem já preenchida conforme a página ou o produto.
- **Formulário de contato secundário**: Nome → E-mail → Telefone, um campo por vez, sem etapas à vista. Fica atrás do botão de WhatsApp.
- **Layout**: fonte fina (Plus Jakarta Sans 300 + Instrument Serif itálico nos destaques), laranja só em detalhes e chamadas, sem colmeias, fundo claro.
- **Home em ~3 dobras**: hero com simulador do indicador, linhas de produto, destaque da semana, prova social e FAQ.
- **Produtos**: 3 por linha, com respiro. Na página: nome, descrição e botões visíveis; Uso, Características e Diferenciais fechados; só medidas em estoque; chamada para medida personalizada; vapor e PPH com alternância **Impressa / Em branco**; aba **Etiquetas coloridas**.
- **Original grafMED**: chamada curta com selo nas linhas CME e grafDENTAL e nos produtos mais copiados. Não cita concorrentes.
- **Conversão**: fluxo de 4 etapas animado (aprovado), benefícios, cases e materiais (cada material abre o WhatsApp).
- **Projetos**: uma chamada só, com formulário de campo livre e botão de WhatsApp ao lado. Sem fases e sem exemplos.
- **Orçamento**: carrinho sem preço com quantidade, medida e cor; revisão; campos da seção 7.2; envio estruturado por WhatsApp ou e-mail; página **/obrigado.html**.
- **SEO/AEO**: títulos e descrições por página, schema Organization, Product, FAQPage e Article, sitemap, robots e mapa 301.
- **LGPD**: aviso de cookies; o rastreamento só carrega com consentimento.

## Interatividade e mockups

- Simulador de ciclo de esterilização (Home): arrastar muda a cor do indicador e a temperatura e destaca a parte do prontuário.
- Prévia de pulseira (cor + texto) e de rótulo (marca, material, cor). A prévia vai junto na mensagem do WhatsApp.
- Inclinação 3D nos mockups, revelação ao rolar, faixa de logos, contador animado do orçamento.

> Os mockups são **ilustrações vetoriais de placeholder**, não imagens de IA. Na publicação, entram as fotos reais do catálogo (Drive da SPiCOM8), sempre com o produto como elemento dominante.

## Pendências antes de publicar

1. Número oficial do WhatsApp, e-mail, telefone e CNPJ em `src/config.mjs`.
2. Logo oficial (o SVG atual é uma reconstrução) e arte final dos selos.
3. Lista oficial de produtos e **medidas em estoque** (hoje marcadas como "a confirmar").
4. Fotos reais do catálogo, logos de clientes e depoimentos autorizados.
5. Lista inicial de parceiros credenciados.
6. Endereço e mapa do galpão do Jaraguá (`mapEmbed`). O mapa só aparece quando o campo estiver preenchido.
7. Endpoint de formulário (`formEndpoint`). Sem ele, o envio abre o e-mail do visitante.
8. Rótulos das conversões do Google Ads, `tracking.enabled = true` e validação no Tag Assistant.
9. Revisar o mapa 301 com o export de URLs indexadas do site atual.
10. Revisão jurídica do Canal Parceiro e da Política de privacidade.

## Levando para o Wix (editor novo)

| Aqui | No Wix |
|---|---|
| `destaques.js` (rodízio por semana ISO) | Coleção CMS "Destaques" + código Velo com o mesmo cálculo de semana |
| `parceiros.js` | Coleção CMS "Parceiros" + repetidor |
| Notícias | Blog nativo (categorias Artigos técnicos e Eventos e feiras) |
| Carrinho de orçamento | Velo + `wix-storage` (local) + Coleção "Orçamentos" para gravar o pedido |
| Formulário rápido | Wix Forms com campos sequenciais ou Velo |
| `_redirects` | Gerenciador de redirecionamentos 301 do Wix SEO |
| Tags de rastreamento | Código personalizado (Body-fim em todas as páginas, Head só em /obrigado) |
