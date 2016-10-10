angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

   .state('inicio', {
    url: '/inicio',
    templateUrl: 'templates/inicio.html',
    abstract:true
  })

  .state('inicio.historico', {
    url: '/historico',
    views: {
      'menuContent': {
        templateUrl: 'templates/historico.html'
      }
    }
  })

  .state('inicial', {
    url: '/inicial',
    templateUrl: 'templates/inicial.html',
    controller: 'InicialController'
  })

  .state('registroDeVacina', {
    url: '/registro-de-vacina',
    templateUrl: 'templates/registroDeVacina.html',
    controller: 'RegistroDeVacinaController'
  })

/*
  .state('meusDados', {
    cache: false,
    url: '/meus-dados',
    templateUrl: 'templates/meusDados.html',
    controller: 'MeusDadosController'
  })
*/

  .state('calendario', {
    url: '/calendario',
    templateUrl: 'templates/calendario.html'
  })

  .state('grupoFamiliar', {
    url: '/grupo-familiar',
    templateUrl: 'templates/grupoFamiliar.html',
    controller: 'GrupoFamiliarController'
  })

  .state('postosDeVacinacao', {
    url: '/postos-de-vacinacao',
    templateUrl: 'templates/postosDeVacinacao.html'
  })

  .state('autenticacao', {
    url: '/autenticacao',
    templateUrl: 'templates/autenticacao.html',
    controller: 'AutenticacaoController'
  })

  .state('registro', {
    url: '/registro',
    templateUrl: 'templates/registro.html',
    controller: 'RegistroController'
  })

  $urlRouterProvider.otherwise('/autenticacao')

});
