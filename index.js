var IOException = Java.type('java.io.IOException')
var InputStream = Java.type('java.io.InputStream')
var File = Java.type('java.io.File')
var FileInputStream = Java.type('java.io.FileInputStream')
var InputStreamReader = Java.type('java.io.InputStreamReader')
var GeneralSecurityException = Java.type('java.security.GeneralSecurityException')
var Arrays = Java.type('java.util.Arrays')
var List = Java.type('java.util.List')
var Stream = Java.type('java.util.stream.Stream')

var Credential = Java.type('com.google.api.client.auth.oauth2.Credential')
var AuthorizationCodeInstalledApp = Java.type('com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp')
var LocalServerReceiver = Java.type('com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver')
var GoogleAuthorizationCodeFlowBuilder = Java.type('com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow.Builder')
var GoogleClientSecrets = Java.type('com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets')
var GoogleNetHttpTransport = Java.type('com.google.api.client.googleapis.javanet.GoogleNetHttpTransport')
var NetHttpTransport = Java.type('com.google.api.client.http.javanet.NetHttpTransport')
var JsonFactory = Java.type('com.google.api.client.json.JsonFactory')
var JacksonFactory = Java.type('com.google.api.client.json.jackson2.JacksonFactory')
var FileDataStoreFactory = Java.type('com.google.api.client.util.store.FileDataStoreFactory')
var Base64 = Java.type('com.google.api.client.repackaged.org.apache.commons.codec.binary.Base64')
var GmailBuilder = Java.type('com.google.api.services.gmail.Gmail.Builder')
var GmailScopes = Java.type('com.google.api.services.gmail.GmailScopes')
var Label = Java.type('com.google.api.services.gmail.model.Label')
var ListMessagesResponse = Java.type('com.google.api.services.gmail.model.ListMessagesResponse')
var Message = Java.type('com.google.api.services.gmail.model.Message')
var MessagePart = Java.type('com.google.api.services.gmail.model.MessagePart')
var MessagePartBody = Java.type('com.google.api.services.gmail.model.MessagePartBody')
var MessagePartHeader = Java.type('com.google.api.services.gmail.model.MessagePartHeader')

var JSON_FACTORY = JacksonFactory.getDefaultInstance();

function getEmailSubject (message) {
  var assunto = message
    .getPayload()
    .getHeaders()
    .stream()
    .filter(function(p) {
      return p.getName().equals("Subject")
    })
  return assunto.reduce(function(acc, curr) {
    return acc.concat(curr.getValue())
  }, [])
}

function getEmailBody (message) {
  return message.getSnippet()
}

function getEmailAttachments (service, userId, messageId) {
  var message = service
    .users()
    .messages()
    .get(userId, messageId)
    .execute()

  var parts = message
    .getPayload()
    .getParts()

  var result = []
  // parts.reduce is not a function
  parts.forEach(function (part) {
    if (part.getFilename() != null && part.getFilename().length() > 0) {
      var attachPart = service
        .users()
        .messages()
        .attachments()
        .get(userId, messageId, attId)
        .execute()

      result.push({
        fileName: part.getFilename(),
        body: part.getBody(),
        attachmentId: part.getBody().getAttachmentId(),
        attachment: Base64.decodeBase64(attachPart.getData())
      })
    }
  })

  return result
}

/**
 * Cria um objeto do tipo Credential autorizado.
 * @param {String} credentialFolderPath - caminho para a pasta "credentials" da sua aplicacao, onde sera salvo o binario StoredCredentials
 * @param {String} credentialJSONPath - caminho para a pasta onde pode-se encontrar o "credentials.json" da sua aplicacao
 * @param {Array[GmailScopes]} scopes - Quais sao os Scopes que serao usados na leitura dos emails
 * @return An authorized Credential object.
 */
function getCredentials (credentialFolderPath, credentialJSONPath, scopes) {
  var inputFile = new FileInputStream(new File(credentialJSONPath))
  show('getCrendentials: inputFile')
  var clientSecrets = GoogleClientSecrets.load(
    JSON_FACTORY,
    new InputStreamReader(inputFile)
  )
  show('getCrendentials: clientSecrets')

  var flow = new GoogleAuthorizationCodeFlowBuilder(new NetHttpTransport(), JSON_FACTORY, clientSecrets, scopes)
    .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(credentialFolderPath)))
    .setAccessType("offline")
    .build()
  show('getCrendentials: flow')

  var result = new AuthorizationCodeInstalledApp(flow, new LocalServerReceiver())
    .authorize("user")

  show('getCrendentials: result')

  return result
}

/**
  * @param {String} applicationName - nome da aplicacao criada no Google Console
  * @param {String} credentialFolderPath - caminho para a pasta "credentials" da sua aplicacao, onde sera salvo o binario StoredCredentials
  * @param {String} credentialJSONPath - caminho para a pasta onde pode-se encontrar o "credentials.json" da sua aplicacao
  * @param {Array[GmailScopes]} applicationScopes - Quais sao os Scopes que serao usados na leitura dos emails
  * @param {String} applicationUser - Qual o nome do usuario que usaremos para ler a caixa de email
  * @example
  * googleEmailReader('Gmail API Java Quickstart', './credentials', './credentials/credentials.json')
  * @returns {Array[Objects]} - Retorna um array de objetos, sendo estes, informacoes referentes a cada email lido.
  *
  * @example
  * googleEmailReader('Gmail API Java Quickstart', './credentials', './credentials/credentials.json', [googleEmailReader.scopes.MAIL_GOOGLE_COM, googleEmailReader.scopes.GMAIL_METADATA])
  * @returns {Array[Objects]} - Retorna um array de objetos, sendo estes, informacoes referentes a cada email lido.
*/
function read (applicationName, credentialFolderPath, credentialJSONPath, applicationScopes, applicationUser) {
  var scopes = applicationScopes || [
    GmailScopes.MAIL_GOOGLE_COM,
    GmailScopes.GMAIL_METADATA,
    GmailScopes.GMAIL_MODIFY
  ]

  try {
    var HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport()
    var service = new GmailBuilder(HTTP_TRANSPORT, JSON_FACTORY, getCredentials(credentialFolderPath, credentialJSONPath, scopes))
      .setApplicationName(applicationName)
      .build()

    show('read:service')

    // Print the labels in the user's account.
    var user = applicationUser || "me"
    var listResponse = service
      .users()
      .messages()
      .list(user)
      .execute()

    show('read:listResponse')

    var labels = listResponse.getMessages()

    show('read:labels')

    if (labels.isEmpty()) {
      show('email-reader message')
      show("No labels/messages found.")
      return
    }

    show('read:email-reader message')
    show("read:Labels:")

    var result = []
    // labels.reduce is not a function
    labels.forEach(function (label) {
      var message = service
        .users()
        .messages()
        .get(user, label.getId())
        .execute()
      var messageObj = {
        subject: getEmailSubject(message),
        body: getEmailSubject(message)
        // attachments: getEmailAttachments(service, user, message.getId()),
      }

      result.push(messageObj)
    })

    show('read:result')

    return result
  } catch (e) {
    show('email-reader error')
    show(e)
  }
}

// read("Gmail API Java Quickstart", "./credentials", "./credentials/credentials.json")

exports = {
  read: read,
  scopes: GmailScopes
}
