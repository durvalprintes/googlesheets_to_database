# Google Sheets API para Postgres

Projeto em Javascript para importação de dados de planilhas do Google Sheets do Google Drive para uma base de dados Postgres

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

## Utilização

- [x] Acesso a múltiplas planilhas, podendo conter diferente colunas com quantitativos, discriminados por um campo único, **data**.
- [x] Para cada planilha, associo a um valor único, **co_cnes**, que ao ser inserido em uma tabela no banco de dados, será possivel identificar a origem dos registros.
- [x] Coleta-se os dados das planilhas do dia anterior, se o registro da planilha já existir no Banco, todos os campos (quantitativos) serão atualizados, senão, novo registro é criado.
- [x] Validação durante a leitura dos quantativos, somente é permitido valores numéricos de 0 a 999, senão será atribuído o valor 0 ao campo.
- [x] Cria-se um arquivo **logData.txt**, detalhando os campos que foram "zerados" na validação acima.
- [x] Na ocorrência de excessões, desde o acesso a API e até o fechar da conexão com o Banco, será criado ou inserido no arquivo **log.txt**, o detalhamento do erro.
- [x] Envio de email ao final da execução.

## Algumas bibliotecas JS utilizadas

- Acessa a API: [Google-Spreadsheet](https://www.npmjs.com/package/google-spreadsheet)
- Conexao com o banco Postgres e queries: [PG](https://www.npmjs.com/package/pg) e [SQL](https://www.npmjs.com/package/sql)
- Envio de email e uso de template: [Nodemailer](https://www.npmjs.com/package/nodemailer) e [Nodemailer-Express-Handlebars](https://www.npmjs.com/package/nodemailer-express-handlebars)
