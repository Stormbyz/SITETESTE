# grafMED · novo site (protótipo funcional 2026)

Site em HTML, CSS e JS puros, gerado a partir de `src/`. Segue o **Briefing de Webdesign (set/2026)** e as **mudanças de 10/11/2026**. Quando os dois divergem, valem as mudanças de novembro.

## Como rodar

```bash
node src/build.mjs
```

```bash
cd site && python3 -m http.server 8080
```

Depois abra http://localhost:8080. Os links são relativos, então o site também abre direto do disco ou de qualquer subpasta.

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
