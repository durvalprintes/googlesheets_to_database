# Google Sheets API para Postgres

Projeto em Javascript para importação de dados de planilhas do Google Sheets para uma base de dados Postgres

## Pre-requisitos

1. Criar uma conta de serviço no _Google Cloud Plataform_;
1. Criar uma chave de acesso JSON no painel da conta e salvar no diretorio do projeto, a chave privada;
1. Ativar as APIs do Google Drive e Google Sheets na conta de serviço criada;
1. Compartilhar as Sheets do Drive com o email da conta, para viabilizar o acesso aos dados da mesma;

## Instalação

```bash
npm install
```

ou

```bash
yarn install
```

## Execução

- [x] Acesso a múltiplas planilhas, podendo conter diferente colunas com quantitativos, discriminados por um campo único, **data**.
- [x] Para cada planilha, associa-se um valor único, **co_cnes**, que ao ser inserido em uma tabela no banco de dados, será possivel identificar a origem dos registros.
- [x] Coleta-se os dados do dia anterior ao corrente nas planilhas, se existir no Banco, todos os campos (quantitativos) serão atualizados, senão novo registro é criado.
- [x] Valida-se os quantitativos durante o acesso a API , somente é permitido inserir/atualizar valores numéricos de 0 a 999, senão será atribuído o valor 0 ao campo.
- [x] Cria-se um arquivo **log-data.txt**, detalhando os campos que foram "zerados" na validação acima.
- [x] Na ocorrência de excessões, desde o acesso a API e até o fechar da conexão com o Banco, será criado o arquivo **log.txt**, detalhando o erro.
- [x] Envio de e-mail ao final, podendo conter em anexo, o arquivo `.txt` criado durante a execução.

## Algumas bibliotecas JS utilizadas

- Acessa a API: [Google-Spreadsheet](https://www.npmjs.com/package/google-spreadsheet)
- Conexao com o banco Postgres e queries: [PG](https://www.npmjs.com/package/pg) e [SQL](https://www.npmjs.com/package/sql)
- Envio de email e uso de template: [Nodemailer](https://www.npmjs.com/package/nodemailer) e [Nodemailer-Express-Handlebars](https://www.npmjs.com/package/nodemailer-express-handlebars)
