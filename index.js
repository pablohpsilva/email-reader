var IOException = Java.type('java.io.IOException')
var InputStream = Java.type('java.io.InputStream')
// var File = Java.type('java.io.File')
var FileInputStream = Java.type('java.io.FileInputStream')
var InputStreamReader = Java.type('java.io.InputStreamReader')
var GeneralSecurityException = Java.type('java.security.GeneralSecurityException')
var Arrays = Java.type('java.util.Arrays')
var List = Java.type('java.util.List')

var Credential = Java.type('com.google.api.client.auth.oauth2.Credential')
var AuthorizationCodeInstalledApp = Java.type('com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp')
var LocalServerReceiver = Java.type('com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver')
var GoogleAuthorizationCodeFlow = Java.type('com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow')
var GoogleClientSecrets = Java.type('com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets')
var GoogleNetHttpTransport = Java.type('com.google.api.client.googleapis.javanet.GoogleNetHttpTransport')
var NetHttpTransport = Java.type('com.google.api.client.http.javanet.NetHttpTransport')
var JsonFactory = Java.type('com.google.api.client.json.JsonFactory')
var JacksonFactory = Java.type('com.google.api.client.json.jackson2.JacksonFactory')
var FileDataStoreFactory = Java.type('com.google.api.client.util.store.FileDataStoreFactory')
var Gmail = Java.type('com.google.api.services.gmail.Gmail')
var GmailScopes = Java.type('com.google.api.services.gmail.GmailScopes')
var Label = Java.type('com.google.api.services.gmail.model.Label')
var ListMessagesResponse = Java.type('com.google.api.services.gmail.model.ListMessagesResponse')
var Message = Java.type('com.google.api.services.gmail.model.Message')

var JSON_FACTORY = JacksonFactory.getDefaultInstance();
// TODO: mudar isso
var APPLICATION_NAME = "Gmail API Java Quickstart";
// TODO: mudar isso
var CREDENTIALS_FOLDER = "./credentials"; // Directory to store user credentials.
// TODO: mudar isso
var CLIENT_SECRET_DIR = "credentials.json"
/**
 * Global instance of the scopes required by this quickstart.
 * If modifying these scopes, delete your previously saved credentials/ folder.
 */
var SCOPES = [
  GmailScopes.MAIL_GOOGLE_COM,
  GmailScopes.GMAIL_METADATA,
  GmailScopes.GMAIL_MODIFY
]

// private static final String CLIENT_SECRET_DIR  = "credentials2.json";

/**
 * Creates an authorized Credential object.
 * @param HTTP_TRANSPORT The network HTTP Transport.
 * @return An authorized Credential object.
 * @throws IOException If there is no client_secret.
 */
function getCredentials () {
  var inputFile = new FileInputStream(new File(CREDENTIALS_FOLDER + '/' + CLIENT_SECRET_DIR))
  var clientSecrets = GoogleClientSecrets.load(
    JSON_FACTORY,
    new InputStreamReader(inputFile)
  )

  var flow = new GoogleAuthorizationCodeFlow
    .Builder(new NetHttpTransport(), JSON_FACTORY, clientSecrets, SCOPES)
    .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(CREDENTIALS_FOLDER)))
    .setAccessType("offline")
    .build()

  return new AuthorizationCodeInstalledApp(flow, new LocalServerReceiver())
    .authorize("user")
}


function read() {
  try {
    var HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport()
    var service = new Gmail
      .Builder(HTTP_TRANSPORT, JSON_FACTORY, getCredentials())
      .setApplicationName(APPLICATION_NAME)
      .build()

    // Print the labels in the user's account.
    var user = "me"
    var listResponse = service
      .users()
      .messages()
      .list(user)
      .execute()

    var labels = listResponse.getMessages()

    if (labels.isEmpty()) {
      show('email-reader message')
      show("No labels found.")
    } else {
      show('email-reader message')
      show("Labels:")

      labels.forEach(function (label) {
        var message = service
          .users()
          .messages()
          .get(user, label.getId())
          .execute()
        show("Message snippet: " + message.getSnippet())
      })
    }
  } catch (e) {
    show('email-reader error')
    show(e)
  }
}

read()
