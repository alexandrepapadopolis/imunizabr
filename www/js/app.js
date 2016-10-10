// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives','app.services','angular-md5','ionic.cloud', 'uiGmapgoogle-maps','googlemaps.init','ngCordova','ngMessages','ab-base64'])

  .config(function($ionicCloudProvider) {
    $ionicCloudProvider.init({
      "core": {
        "app_id": "15d97e9e"
      }
    });
  })

  .config(function($ionicConfigProvider) {
    $ionicConfigProvider.views.maxCache(5);
  })

  .run(function($ionicPlatform, $ionicPopup, $ionicModal) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    internet_messsage = 'O uso deste aplicativo requer conexão com a Internet.';

    if (window.cordova) {
      //device

      // Check for network connection
      if(window.Connection) {
        if(navigator.connection.type == Connection.NONE) {
          $ionicPopup.alert({
            title: 'Conexão Internet Ausente',
            content: internet_messsage
          })
            .then(function(result) {
              if(!result) {
                ionic.Platform.exitApp();
              }
            });
        }
      }

      //db = $cordovaSQLite.openDB({ name: "imuniza.db" });


    } else {
      // browser

      // Check for network connection
      if (!window.navigator.onLine) {
        $ionicPopup.alert({
          title: 'Conexão Internet Ausente',
          content: internet_messsage
        })
          .then(function(result) {
            if(!result) {
              ionic.Platform.exitApp();
            }
          });
      }

      //db = window.openDatabase("imuniza.db", '1', 'imuniza', 1024 * 1024 * 100);
    }


    //$cordovaSQLite.execute(db, "DROP TABLE usuario");
    //$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS usuario (id INTEGER PRIMARY KEY AUTOINCREMENT, username text not null, password text, nascimento text not null)");
    //$cordovaSQLite.execute(db, "DROP TABLE pessoa");
    //$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS pessoa (id INTEGER PRIMARY KEY, tipo int not null, nome text not null, nomeMae text, nascimento text, cidade_nascimento text, cep text, endereco text, complemento text, bairro text, cidade text, uf text, ativo int)");
  });
})
