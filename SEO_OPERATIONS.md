# Operação de SEO

## Configuração de produção

Defina no ambiente de hospedagem:

```env
VITE_PUBLIC_SITE_URL=https://cultura.siqueiracampos.pr.gov.br
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GOOGLE_SITE_VERIFICATION=token-fornecido-pelo-search-console
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

Somente o host configurado em `VITE_PUBLIC_SITE_URL` libera rastreamento. Outros domínios recebem
`X-Robots-Tag: noindex, nofollow`, e o `robots.txt` bloqueia todos os robôs.

`FIREBASE_SERVICE_ACCOUNT_JSON` deve ser cadastrada como segredo protegido da hospedagem. Nunca
coloque essa credencial em `.env.local`, em uma variável `VITE_*`, no Git ou em mensagens.

## Publicação e Google

1. Publicar o portal no subdomínio definitivo.
2. Adicionar a propriedade de domínio `siqueiracampos.pr.gov.br` ao Google Search Console.
3. Inserir o token de verificação na variável `VITE_GOOGLE_SITE_VERIFICATION`.
4. Enviar `https://cultura.siqueiracampos.pr.gov.br/sitemap.xml`.
5. Validar uma página de evento no Rich Results Test.
6. Configurar o fluxo GA4 e preencher `VITE_GA_MEASUREMENT_ID`.

O portal registra automaticamente cliques em telefone, e-mail, mapa, PDFs e links de inscrição,
além de envios de solicitação de visita e inscrição.

## Presença local

Reivindicar ou criar perfis separados no Google para:

- Museu Histórico Municipal de Siqueira Campos;
- Biblioteca Municipal;
- Casa da Cultura.

Usar sempre os mesmos nomes, endereço, telefone, horários e URL do portal. Atualizar fotos
trimestralmente e solicitar avaliações reais após visitas e atividades.

## Rotina editorial

Publicar dois conteúdos por mês em `src/lib/stories.ts`:

- primeira quinzena: história de uma peça, ambiente, personagem ou tema do acervo;
- segunda quinzena: guia de visita, roteiro escolar, patrimônio ou programação regional.

Cada conteúdo deve ter título específico, descrição, imagem, texto alternativo, data e pelo menos
um link para visitação, acervo ou agenda.

## Revisão mensal

- Consultar no Search Console páginas e buscas com muitas impressões e poucos cliques.
- Melhorar títulos e descrições dessas páginas sem alterar suas URLs.
- Verificar páginas não indexadas, erros de dados estruturados e Core Web Vitals.
- Registrar contatos, inscrições e solicitações de visita vindos da busca orgânica.
