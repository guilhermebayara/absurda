# Mudança da @bsurda para uma conta Cloudflare própria

Decidido pelo Gui em 20/11/2026: fazer agora, antes de o site ser divulgado ao público. Motivo: o Bastidor (repositório `bastidor`, sistema interno da @bsurda) vai morar em bastidor.festaabsurda.com e precisa estar na mesma conta do domínio. Hoje o domínio está na conta que a @bsurda divide com o site da família, e a regra é que cada projeto tenha a sua conta, dentro do mesmo login. O site da família fica onde está.

Quem faz: o Gui, no painel da Cloudflare e no GitHub. Tokens e senhas só ele digita. Depois, uma sessão de código confere se tudo voltou a funcionar.

## O que existe hoje na conta compartilhada e precisa ir junto

- Zona `festaabsurda.com` e todos os registros de DNS, incluindo os das prévias por branch (`<branch>.festaabsurda.com`).
- Worker `absurda` (site estático), com o build ligado ao GitHub.
- Variáveis e segredos do build na `main` e na homologação: `SHOTGUN_TOKEN`, `SHOTGUN_ORGANIZER_ID`, `SYMPLA_TOKEN`.
- Deploy Hook usado pelo robô da agenda (`.github/workflows/atualiza-agenda.yml`), guardado no GitHub como `CLOUDFLARE_DEPLOY_HOOK`.
- Qualquer outra coisa ligada ao domínio que o painel mostrar (encaminhamento de e-mail, regras, redirecionamentos). Conferir antes de começar.

## Andamento (22/11/2026, feito pela conversa no Chrome, a pedido do Gui)

- Inventário da conta "Gui Bayara": zona `festaabsurda.com` (plano Free, DNSSEC desligado, sem encaminhamento
  de e-mail da Cloudflare). DNS: e-mail do Google Workspace (5 MX, SPF, DKIM `google._domainkey`, DMARC),
  um TXT de verificação, o CNAME `_domainconnect` do Squarespace e os AAAA dos domínios do Worker. O Worker
  `absurda` tem os domínios `festaabsurda.com` e `www.festaabsurda.com`, os dois em "Production and Preview"
  (é isso que dá `<branch>.festaabsurda.com`). Build da `main` com `SHOTGUN_ORGANIZER_ID`, `SHOTGUN_TOKEN` e
  `SYMPLA_TOKEN`; a homologação é a prévia nomeada `design`, com as próprias variáveis.
- Conta "absurda": Worker `absurda` criado e ligado ao repositório, build da `main` passando em
  `absurda.absurda.workers.dev` (guarda "ok"), com `SHOTGUN_ORGANIZER_ID` copiado. Falta o `SHOTGUN_TOKEN`
  (o Gui põe). O Sympla volta depois: os próximos eventos são todos do Shotgun.
- 22/11, 13h58: nameservers trocados no Squarespace (arvind e rita), zona ativa na conta "absurda" em
  menos de um minuto. `festaabsurda.com` e `www` ligados ao Worker novo em "Production and Preview".
  Produção e prévias já saem da conta nova, com a Agenda da Shotgun; o Sympla segue desligado.
- Deploy Hook novo na conta "absurda" (`robo-da-agenda`, branch `main`), já no segredo
  `CLOUDFLARE_DEPLOY_HOOK` do GitHub; o robô rodado à mão pediu o build na conta nova.
- A prévia `design` da conta nova tem o `SHOTGUN_TOKEN` e mostra os próximos eventos.
- Worker `absurda` da conta "Gui Bayara" apagado depois que o Gui conferiu o site (22/11). A zona antiga
  ficou como "movida" e a Cloudflare a remove sozinha. Na conta "Gui Bayara" fica só o site da família.
- Falta só o Sympla, quando houver evento lá: cadastrar `SYMPLA_TOKEN` na produção e na prévia `homologa` (a `design` foi aposentada em 22/11).

## Passo a passo

1. **Inventário.** No painel da conta atual, anotar tudo que está ligado a `festaabsurda.com`: registros de DNS (exportar o arquivo de DNS), domínios personalizados do Worker, encaminhamento de e-mail, regras. Ver também onde o domínio está registrado.
2. **Conta nova.** Criar a conta "absurda" no mesmo login.
3. **Worker na conta nova.** Criar o Worker `absurda` ligado ao repositório `guilhermebayara/absurda`, com o mesmo comando de build da conta atual. Cadastrar de novo as variáveis e os segredos da `main` e da homologação. Conferir que o build passa no endereço `workers.dev` da conta nova.
4. **Domínio.** O registro está no Squarespace e os nameservers apontam para a Cloudflare. O registro não muda; só a zona troca de conta.
   - Antes: no Squarespace, ver se o DNSSEC está ligado. Se estiver, desligar e esperar o prazo que o Squarespace indicar, senão o domínio para de resolver na troca.
   - Adicionar `festaabsurda.com` na conta nova. A zona entra como pendente, porque ainda está ativa na conta antiga.
   - Importar o arquivo de DNS exportado no passo 1 e conferir registro por registro (os das prévias por branch, os de e-mail e os de verificação, se houver).
   - No Squarespace, trocar os nameservers pelos dois que a conta nova indicar. Podem ser iguais ou diferentes dos atuais; vale o que a conta nova mostrar.
   - Esperar a zona nova ficar ativa (costuma levar minutos, pode levar horas). Os certificados são emitidos de novo pela conta nova.
   - Só então remover a zona da conta antiga.
5. **Domínios do site.** Ligar `festaabsurda.com` e as prévias por branch ao Worker da conta nova.
6. **Deploy Hook.** Criar um Deploy Hook novo na conta nova e atualizar o segredo `CLOUDFLARE_DEPLOY_HOOK` no GitHub.
7. **Desligar o antigo.** Só depois de tudo conferido: apagar o Worker `absurda` da conta compartilhada.

## Conferência depois da mudança (sessão de código)

- https://festaabsurda.com abre e a Agenda mostra os próximos eventos do Shotgun e do Sympla.
- A prévia da homologação abre no endereço `<branch>.festaabsurda.com` e também tem a agenda ao vivo.
- Uma branch `tst-` qualquer gera prévia.
- Rodar o robô "Atualiza a agenda" pelo botão do GitHub e ver o build novo sair na conta nova.
- Atualizar o `CLAUDE.md` se algum endereço, nome ou passo mudou.

## Cuidado

- Quando: antes do lançamento do site, depois de fechar o trabalho de conteúdo. Antes de começar, ter à mão os tokens do Shotgun e do Sympla, porque eles precisam ser cadastrados de novo na conta nova (em 20/11 o do Sympla ainda não estava disponível).

- Fazer numa janela sem festa à venda, porque a Agenda leva ao link de ingressos.
- Nada de token, senha ou e-mail real nesta nota, em commit ou em relatório.
