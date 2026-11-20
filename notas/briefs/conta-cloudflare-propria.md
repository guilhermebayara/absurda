# Mudança da @bsurda para uma conta Cloudflare própria

Decidido pelo Gui em 20/11/2026: fazer agora, antes de o site ser divulgado ao público. Motivo: o Bastidor (repositório `bastidor`, sistema interno da @bsurda) vai morar em bastidor.festaabsurda.com e precisa estar na mesma conta do domínio. Hoje o domínio está na conta que a @bsurda divide com o site da família, e a regra é que cada projeto tenha a sua conta, dentro do mesmo login. O site da família fica onde está.

Quem faz: o Gui, no painel da Cloudflare e no GitHub. Tokens e senhas só ele digita. Depois, uma sessão de código confere se tudo voltou a funcionar.

## O que existe hoje na conta compartilhada e precisa ir junto

- Zona `festaabsurda.com` e todos os registros de DNS, incluindo os das prévias por branch (`<branch>.festaabsurda.com`).
- Worker `absurda` (site estático), com o build ligado ao GitHub.
- Variáveis e segredos do build na `main` e na homologação: `SHOTGUN_TOKEN`, `SHOTGUN_ORGANIZER_ID`, `SYMPLA_TOKEN`.
- Deploy Hook usado pelo robô da agenda (`.github/workflows/atualiza-agenda.yml`), guardado no GitHub como `CLOUDFLARE_DEPLOY_HOOK`.
- Qualquer outra coisa ligada ao domínio que o painel mostrar (encaminhamento de e-mail, regras, redirecionamentos). Conferir antes de começar.

## Passo a passo

1. **Inventário.** No painel da conta atual, anotar tudo que está ligado a `festaabsurda.com`: registros de DNS (exportar o arquivo de DNS), domínios personalizados do Worker, encaminhamento de e-mail, regras. Ver também onde o domínio está registrado.
2. **Conta nova.** Criar a conta "absurda" no mesmo login.
3. **Worker na conta nova.** Criar o Worker `absurda` ligado ao repositório `guilhermebayara/absurda`, com o mesmo comando de build da conta atual. Cadastrar de novo as variáveis e os segredos da `main` e da homologação. Conferir que o build passa no endereço `workers.dev` da conta nova.
4. **Domínio.**
   - Se o domínio estiver registrado na própria Cloudflare: usar a mudança de registro entre contas (as duas contas confirmam; o DNSSEC precisa estar desligado; o registro fica travado para transferência por 30 dias depois). A configuração da zona não vai junto: os registros de DNS são refeitos na conta nova.
   - Se estiver em outro registrador: adicionar `festaabsurda.com` na conta nova, importar o arquivo de DNS exportado, conferir os registros e trocar os nameservers no registrador pelos que a conta nova indicar. Depois que a zona nova ficar ativa, remover a zona da conta antiga.
   - Os certificados são emitidos de novo pela conta nova; pode levar alguns minutos.
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

- Fazer numa janela sem festa à venda, porque a Agenda leva ao link de ingressos.
- Nada de token, senha ou e-mail real nesta nota, em commit ou em relatório.
