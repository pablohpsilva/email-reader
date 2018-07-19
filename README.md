# googleEmailReader
googleEmailReader e um *bitcode* de leitura de emails do provedor Gmail para o [Thrust](https://gitlab.com/thrustjs/thrust-seed).

# Instalacao
Posicionado em um app ThrustJS, no seu terminal:

```bash
thrust install pablohpsilva/google-email-reader
```

# Como usar
```javascript
var googleEmailReader = require('google-email-reader')

googleEmailReader.read(
  'Gmail API Java Quickstart',
  './credentials',
  './credentials/credentials.json'
)

// ou
var scopes = googleEmailReader.scopes
googleEmailReader.read(
  'Gmail API Java Quickstart',
  './credentials',
  './credentials/credentials.json',
  [
    scopes.MAIL_GOOGLE_COM,
    scopes.GMAIL_METADATA
  ]
)
```

# API
```javascript
/**
  * @param {String} applicationName (required) - nome da aplicacao criada no Google Console
  * @param {String} credentialFolderPath (required) - caminho para a pasta "credentials" da sua aplicacao, onde sera salvo o binario StoredCredentials
  * @param {String} credentialJSONPath (required) - caminho para a pasta onde pode-se encontrar o "credentials.json" da sua aplicacao
  * @param {Array[GmailScopes]} applicationScopes (default: [GmailScopes.MAIL_GOOGLE_COM, GmailScopes.GMAIL_METADATA, GmailScopes.GMAIL_MODIFY]) - Quais sao os Scopes que serao usados na leitura dos emails
  * @param {String} applicationUser (default: "me") - Qual o nome do usuario que usaremos para ler a caixa de email
  * @example
  * googleEmailReader('Gmail API Java Quickstart', './credentials', './credentials/credentials.json')
  * @returns {Array[Objects]} - Retorna um array de objetos, sendo estes, informacoes referentes a cada email lido.
  *
  * @example
  * googleEmailReader('Gmail API Java Quickstart', './credentials', './credentials/credentials.json', [googleEmailReader.scopes.MAIL_GOOGLE_COM, googleEmailReader.scopes.GMAIL_METADATA])
  * @returns {Array[Objects]} - Retorna um array de objetos, sendo estes, informacoes referentes a cada email lido.
*/

function read(applicationName, credentialFolderPath, credentialJSONPath [, applicationScopes, applicationUser])
```

