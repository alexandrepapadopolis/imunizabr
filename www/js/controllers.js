angular.module('app.controllers', [])

.controller('ImunizaBRController', ['$scope', '$stateParams','$ionicAuth', '$ionicUser', '$state','$ionicPopup', '$ionicLoading', '$ionicHistory',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
function ($scope, $stateParams, $ionicAuth, $ionicUser, $state, $ionicPopup, $ionicLoading, $ionicHistory) {

  $scope.user = $ionicUser.details;

  $scope.signout = function() {

    $ionicLoading.show({
      template: 'Aguarde...'
    });

    delete $scope;

    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();

    $ionicAuth.logout();
    $ionicLoading.hide();
    $state.go('autenticacao');

  }

}])


.controller('InicialController', ['$scope','$ionicAuth', '$ionicUser', '$state', '$stateParams',
  function ($scope, $ionicAuth, $ionicUser, $state, $stateParams) {

  }])

.controller('AutenticacaoController', ['$scope','$ionicAuth', '$ionicUser', '$state', '$stateParams', '$ionicPopup', '$ionicLoading',
  function ($scope, $ionicAuth, $ionicUser, $state, $stateParams, $ionicPopup, $ionicLoading) {
    $scope.signin = function(form) {
      if(form.$valid) {

        $ionicLoading.show({
          template: 'Aguarde...'
        });

        $ionicAuth.login('basic',$scope.user).then(function(user) {
          $ionicLoading.hide();
          $state.go('inicio.historico');
        }, function(err) {
          console.log(err);
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Erro!!!',
            content: 'Usuário não encontrado. Verifique email e senha.',
            okType: 'button-assertive',
          });
        });
      }
    }
  }])

.controller('RegistroController', ['$scope','$ionicAuth', '$ionicUser', '$state', '$stateParams', '$ionicPopup', '$ionicLoading',
  function ($scope, $ionicAuth, $ionicUser, $state, $stateParams, $ionicPopup, $ionicLoading) {
    $scope.user = {
      'name': '',
      'email': '',
      'password': ''
    }

    $scope.signin = function(form) {
      if(form.$valid) {
        $ionicLoading.show({
          template: 'Aguarde...'
        });
        $ionicAuth.signup($scope.user).then(function(user) {
          user.save(); // save the user to persist the migration changes
          $ionicLoading.hide();

          $state.go('autenticacao');
        }, function(err) {
          console.log(err);
          var mensagem = {
            'required_email': 'Email não informado',
            'required_password': 'Senha não informada',
            'conflict_email': 'Email já registrado',
            'conflict_username': 'Nome de usuário já registrado',
            'invalid_email': 'Email inválido'
          }

          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Erro!!!',
            content: mensagem[err.details[0]],
            okType: 'button-assertive',
          });
        });
      }
    }
  }])

.controller('PostosDeVacinacaoController', ['$scope', 'uiGmapGoogleMapApi', '$ionicLoading', '$cordovaGeolocation', function($scope, uiGmapGoogleMapApi, $ionicLoading, $cordovaGeolocation) {



  $ionicLoading.show({
    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Verificando sua posição!'
  });

  var posOptions = {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0
  };

  $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
    var _lat = position.coords.latitude;
    var _long = position.coords.longitude;

    console.log(_lat);
    console.log(_long);

    // Do stuff with your $scope.
    // Note: Some of the directives require at least something to be defined originally!
    // e.g. $scope.markers = []

    // uiGmapGoogleMapApi is a promise.
    // The "then" callback function provides the google.maps object.
    uiGmapGoogleMapApi.then(function(maps,_lat,_long){

      // Configuration needed to display the road-map with traffic
      // Displaying Ile-de-france (Paris neighbourhood)
      $scope.map = {
        marker: {
          id: 0,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        },
        center: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        zoom: 15,
        options: {
          mapTypeId: google.maps.MapTypeId.ROADMAP, // This is an example of a variable that cannot be placed outside of uiGmapGooogleMapApi without forcing of calling the google.map helper outside of the function
          streetViewControl: false,
          mapTypeControl: true,
          scaleControl: false,
          rotateControl: false,
          zoomControl: true
        },
        showTraficLayer:true,
        events: {
          click: function (map, eventName, originalEventArgs) {
            var e = originalEventArgs[0];
            var click_lat = e.latLng.lat(), click_lon = e.latLng.lng();
            $scope.map.marker = {
              coords: {
                latitude: click_lat,
                longitude: click_lon
              }
            };
            $scope.$apply();
          }
        }
      };


      console.log($scope.map);
      $ionicLoading.hide();
    })
  });
}])

.controller('RegistroDeVacinaController', ['$scope', 'md5', '$ionicAuth', '$ionicUser', '$ionicModal', '$ionicPlatform', '$q', '$ionicLoading', 'ServiceGrupo', 'ServiceVacina', '$stateParams',
  function($scope, md5, $ionicAuth, $ionicUser, $ionicModal, $ionicPlatform, $q, $ionicLoading, ServiceGrupo, ServiceVacina,$stateParams) {

    var vm = this;

    $scope.dados = {
      id                  : md5.createHash($ionicUser.details.email || '')
    };

    $scope.doc = {};

    // Initialize the database.
    $ionicPlatform.ready(function() {

      if (!$ionicAuth.isAuthenticated()) {
        $state.go('autenticacao');
      } else {
        $ionicLoading.show({
          template: 'Aguarde...'
        });

        ServiceGrupo.initDB();
        ServiceVacina.initDB();

        Date.prototype.addMonths = function (n) {
          return new Date(this.setMonth(this.getMonth() + n));
        }

        Date.prototype.addDays = function (num) {
          var value = this.valueOf();
          value += 86400000 * num;
          return new Date(value);
        }

        Date.prototype.addSeconds = function (num) {
          var value = this.valueOf();
          value += 1000 * num;
          return new Date(value);
        }

        Date.prototype.addMinutes = function (num) {
          var value = this.valueOf();
          value += 60000 * num;
          return new Date(value);
        }

        Date.prototype.addHours = function (num) {
          var value = this.valueOf();
          value += 3600000 * num;
          return new Date(value);
        }

        ServiceGrupo.getAllRegistros($scope.dados.id).then(function(registros) {
          vm.registros = registros;

          ServiceVacina.getAllRegistros().then(function(vacinas) {
            $scope.vacinas = vacinas;
          }, function(err){
            $scope.vacinas = '';
            console.error('ERR', err);
          });

          $ionicLoading.hide();
        }, function(err){
          console.error('ERR', err);
        });
      }
    });


    vm.exibeDoc = function(vacina) {
      $scope.doc = vacina;
    }

    vm.showEditRegistroModal = function(registro) {

      // Initialize the modal view.
      $ionicModal.fromTemplateUrl('add-or-edit-registro.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.registroModal = modal;
        $scope.dados = registro;
        //$scope.dados.id = md5.createHash($ionicUser.details.email || '');
        $scope.action = 'Editar';
        $scope.registroModal.show();
      });
    };

    vm.showEditDoseModal = function(registro) {

      // Initialize the modal view.
      $ionicModal.fromTemplateUrl('add-or-edit-dose.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.doseModal = modal;

        $scope.vacina = registro;

        if(!angular.isArray($scope.dados.vacinas)) {
          // Array de vacinas não existe
          $scope.dados.vacinas = [];
        }

        var existeVacinaNoArray = false;
        for (var i=0;i<$scope.dados.vacinas.length && !existeVacinaNoArray;i++)
          if ($scope.dados.vacinas[i].id_vacina===$scope.vacina._id)
            existeVacinaNoArray = true;

        if (!existeVacinaNoArray) {
          // Se não existe, vamos carregar a partir da base de vacinas
          $scope.dados.vacinas.push(
            {
              id_vacina: registro._id,
              nome: registro.nome,
              grupos: registro.calendario[0].grupo
            }
          );
        }

        $scope.faixaMembro = { value: $scope.dados.grupo};

        $scope.faixaAbertura = $scope.faixaMembro.value;

        $scope.action = 'Editar';
        $scope.doseModal.show();
      });
    };

    /*
     * Tratamento para visualização do calendário
     */

    $scope.togglePerson = function(person) {
      if ($scope.isPersonShown(person)) {
        $scope.shownPerson = null;
      } else {
        $scope.shownPerson = person;
      }
    };

    $scope.isPersonShown = function(person) {
      return $scope.shownPerson === person;
    };


    /*
     * if given group is the selected group, deselect it
     * else, select the given group
     */
    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        // Lógica para que o grupo da pessoa apareca aberto quando o modal for iniciado
        $scope.faixaAbertura = '*';
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
      }
    };

    $scope.isGroupShown = function(group) {
      return ($scope.shownGroup === group || group.nome === $scope.faixaAbertura);
    };

    $scope.exibeVacina = function(_vacina) {
      // Retorna true somente se a vacina tiver dose compatível com o sexo da pessoa selecionada
      if (angular.isArray(_vacina.calendario))
        for (var i=0; i<_vacina.calendario[0].grupo.length; i++)
          for (var j=0; j<_vacina.calendario[0].grupo[i].doses.length; j++)
            if (_vacina.calendario[0].grupo[i].doses[j].sexo===$scope.dados.sexo || _vacina.calendario[0].grupo[i].doses[j].sexo==='Ambos')
              return true;
      return false;
    };

    $scope.exibeGrupo = function(_grupo) {
      // Retorna true somente se o grupo tiver dose compatível com o sexo da pessoa selecionada
      if (typeof _grupo==='object') {
        for (var j=0; j<_grupo.doses.length; j++)
          if ((!$scope.faixaMembro.value || ($scope.faixaMembro.value && $scope.faixaMembro.value===_grupo.nome)) && (_grupo.doses[j].sexo===$scope.dados.sexo || _grupo.doses[j].sexo==='Ambos'))
            return true;
      }
      return false;
    };

    $scope.exibeDose = function(dose) {
      // Retorna true somente se a dose for compatível com o sexo da pessoa selecionada
      if (dose.sexo===$scope.dados.sexo || dose.sexo==='Ambos')
        return true;

      return false;
    };

    $scope.pessoaCalendario = function(pessoa) {
      // Retorna true somente se a pessoa tiver ao menos uma vacina apenas agendada
      if (angular.isArray(pessoa.vacinas))
        for (var i=0; i<pessoa.vacinas.length; i++)
          for (var j=0; j<pessoa.vacinas[i].grupos.length; j++)
            for (var k=1; k<pessoa.vacinas[i].grupos[j].doses.length; k++)
              if (!pessoa.vacinas[i].grupos[j].doses[k - 1].dataExecutada && pessoa.vacinas[i].grupos[j].doses[k - 1].dataProgramada)
                return true;
      return false;
    };

    $scope.avisaDose = function(dose) {
      if (!dose.dataExecutada && dose.dataProgramada)
        return true;
      else
        return false;
    };

    $scope.pessoaCaderneta = function(pessoa) {
      // Retorna true somente se a pessoa tiver ao menos uma vacina apenas agendada
      if (angular.isArray(pessoa.vacinas))
        for (var i=0; i<pessoa.vacinas.length; i++)
          for (var j=0; j<pessoa.vacinas[i].grupos.length; j++)
            for (var k=1; k<pessoa.vacinas[i].grupos[j].doses.length; k++)
              if (pessoa.vacinas[i].grupos[j].doses[k - 1].dataExecutada || pessoa.vacinas[i].grupos[j].doses[k - 1].dataProgramada)
                return true;
      return false;
    };

    $scope.buscaCaderneta = function(item) {
      if (item.dataProgramada || item.dataExecutada) return true;
      return false;
    };

    $scope.buscaCalendario = function(item) {
      if (item.dataProgramada && !item.dataExecutada) return true;
      return false;
    };

    $scope.addMonthsUTC = function(date, count) {
      if (date && count) {
        var m, d = (date = new Date(+date)).getUTCDate()

        date.setUTCMonth(date.getUTCMonth() + count, 1)
        m = date.getUTCMonth()
        date.setUTCDate(d)
        if (date.getUTCMonth() !== m) date.setUTCDate(0)
      }
      return date
    }

    $scope.ajustaProgramacaoDoses = function(_vacinas) {

      for (var i=0; i<_vacinas.length; i++) {
        for (var j=0; j<_vacinas[i].grupos.length; j++) {
          for (var k=1; k<_vacinas[i].grupos[j].doses.length; k++) {
            var anterior = _vacinas[i].grupos[j].doses[k-1];
            var atual    = _vacinas[i].grupos[j].doses[k];
            // Programa a data da dose atual só se ainda não a tiver tomado e se
            // a dose anterior tem data programada ou executada preenchida.
            if (!atual.dataExecutada && (anterior.dataExecutada || anterior.dataProgramada)) {

              // Atribui valor inicial para a data programada da dose atual.
              // Para programar a data da dose atual, a referência será a data
              // em que tomou a dose anterior (se já tiver tomado) ou, caso contrário,
              // a data proggramada para tomá-la.
              if (anterior.dataExecutada)
                atual.dataProgramada = anterior.dataExecutada.toString();
              else
                atual.dataProgramada = anterior.dataProgramada.toString();

              // Para somar corretamente, a quantidade deve ser um inteiro.
              var tempo = parseInt(atual.idade);

              // Unidades de tempo a serem somadas
              var unidade = atual.unidadeIdade;

              if (unidade=='dia' || unidade=='dias') {
                var proxima = (new Date(atual.dataProgramada)).addDays(tempo);
              } else if (unidade=='mês' || unidade=='meses') {
                var proxima = (new Date(atual.dataProgramada)).addMonths(tempo);
              } else if (unidade=='ano' || unidade=='anos') {
                var proxima = (new Date(atual.dataProgramada)).addMonths(tempo*12);
              }

              atual.dataProgramada = proxima;
            }
          }
        }
      }
    }

    $scope.saveRegistro = function(form) {
      if(form.$valid) {
        // Calcula as datas programadas, se necessário
        if(angular.isArray($scope.dados.vacinas)) {
          // É necessário ajustar as datas das próximas doses
          $scope.ajustaProgramacaoDoses($scope.dados.vacinas);
        }

        if ($scope.isAdd) {
          ServiceGrupo.addRegistro($scope.dados);
        } else {
          ServiceGrupo.updateRegistro($scope.dados);
        }
        // Recupera os dados novamente para garantir que as datas estão no formato correto
        ServiceGrupo.getAllRegistros($scope.dados.id).then(function(registros) {
          vm.registros = registros;
        });
        // Fecha os modais
        $scope.closeDoseModal();
        $scope.closeRegistroModal();
      }
    };

    $scope.deleteRegistro = function() {
      ServiceGrupo.deleteRegistro($scope.dados);
      $scope.closeDoseModal();
      $scope.closeRegistroModal();
    };

    $scope.closeRegistroModal = function() {
      if ($scope.registroModal!==undefined)
        $scope.registroModal.remove();
    };


    $scope.closeDoseModal = function() {
      if ($scope.doseModal!==undefined)
        $scope.doseModal.remove();
    };

    $scope.$on('$destroy', function() {
      if ($scope.registroModal!==undefined)
        $scope.registroModal.remove();

      if ($scope.doseModal!==undefined)
        $scope.doseModal.remove();
    });

    return vm;

  }])

.controller('GrupoFamiliarController', ['$scope', 'md5', '$ionicAuth', '$ionicUser', '$ionicModal', '$ionicPlatform', '$q', 'ServiceGrupo', '$stateParams',
  function($scope, md5, $ionicAuth, $ionicUser, $ionicModal, $ionicPlatform, $q, ServiceGrupo) {
    var vm = this;
    $scope.isAdd = true;

    $scope.dados = {
      id                  : md5.createHash($ionicUser.details.email || '')
    };

    // Initialize the database.
    $ionicPlatform.ready(function() {
      ServiceGrupo.initDB();

      ServiceGrupo.getAllRegistros($scope.dados.id).then(function(registros) {
        vm.registros = registros;
      });
    });


    // Initialize the modal view.
    $ionicModal.fromTemplateUrl('add-or-edit-registro.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    vm.showAddRegistroModal = function() {
      $scope.dados = {
        id                  : md5.createHash($ionicUser.details.email || '')
      };
      $scope.action = 'Incluir';
      $scope.isAdd = true;
      $scope.modal.show();
    };

    vm.showEditRegistroModal = function(registro) {
      $scope.dados = registro;
      $scope.dados.id = md5.createHash($ionicUser.details.email || '');
      $scope.action = 'Editar';
      $scope.isAdd = false;
      $scope.modal.show();
    };

    $scope.getAge = function(birthDay) {
      // Define anos, meses e dias de idade a partir da data de nascimento
      var now = new Date();
      var today = new Date(now.getYear(),now.getMonth(),now.getDate());

      var yearNow = now.getYear();
      var monthNow = now.getMonth();
      var dateNow = now.getDate();

      var dob = new Date(birthDay);

      var yearDob = dob.getYear();
      var monthDob = dob.getMonth();
      var dateDob = dob.getDate();
      var age = {};
      var ageString = "";
      var yearString = "";
      var monthString = "";
      var dayString = "";


      yearAge = yearNow - yearDob;

      if (monthNow >= monthDob)
        var monthAge = monthNow - monthDob;
      else {
        yearAge--;
        var monthAge = 12 + monthNow -monthDob;
      }

      if (dateNow >= dateDob)
        var dateAge = dateNow - dateDob;
      else {
        monthAge--;
        var dateAge = 31 + dateNow - dateDob;

        if (monthAge < 0) {
          monthAge = 11;
          yearAge--;
        }
      }

      $scope.dados.idade = {
        anos: yearAge,
        meses: monthAge,
        dias: dateAge
      };

      // Define o grupo a partir da idade
      var grupo = "Crianças";
      if      ( yearAge >= 60 )  grupo = "Idosos";
      else if ( yearAge >= 20 )  grupo = "Adultos";
      else if ( yearAge >= 10 )  grupo = "Adolescentes";

      $scope.dados.grupo = grupo;
    }

    $scope.saveRegistro = function(form) {
      if(form.$valid) {
        $scope.getAge($scope.dados.nascimento.getTime());
        if ($scope.isAdd) {
          ServiceGrupo.addRegistro($scope.dados);
        } else {
          ServiceGrupo.updateRegistro($scope.dados);
        }
        ServiceGrupo.getAllRegistros($scope.dados.id).then(function(registros) {
          vm.registros = registros;
        });
        $scope.modal.hide();
      }
    };

    $scope.deleteRegistro = function() {
      ServiceGrupo.deleteRegistro($scope.dados);
      $scope.modal.hide();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
      $scope.modal.remove();
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    return vm;

  }])

/*
 .controller('MeusDadosController', ['$scope', '$ionicPopup', '$state', '$stateParams', 'HttpService', '$ionicLoading', '$cordovaSQLite',
 function ($scope, $ionicPopup, $state, $stateParams, HttpService, $ionicLoading, $cordovaSQLite) {

 var query = '';
 $scope.dados = {
 id                  : 0,
 tipo                : 0,
 nome                : '',
 nascimento          : '',
 mae                 : '',
 cidade_nascimento   : '',
 cep                 : '',
 endereco            : '',
 complemento         : '',
 bairro              : '',
 cidade              : '',
 uf                  : '',
 ativo               : 1
 };

 query = 'select id, tipo, nome, nomeMae, nascimento, cidade_nascimento, cep, endereco, complemento, bairro, cidade, uf, ativo ' +
 '  from pessoa ' +
 ' where tipo = ?';
 $cordovaSQLite.execute(db,query,[0]).then(function(result) {
 if(result.rows.length > 0){
 $scope.dados = {
 id                  : result.rows[0].id,
 tipo                : result.rows[0].tipo,
 nome                : result.rows[0].nome,
 nascimento          : result.rows[0].nascimento,
 mae                 : result.rows[0].nomeMae,
 cidade_nascimento   : result.rows[0].cidade_nascimento,
 cep                 : result.rows[0].cep,
 endereco            : result.rows[0].endereco,
 complemento         : result.rows[0].complemento,
 bairro              : result.rows[0].bairro,
 cidade              : result.rows[0].cidade,
 uf                  : result.rows[0].uf,
 ativo               : result.rows[0].ativo
 };
 }
 }, function(error){
 console.log(error);
 });

 $scope.grava = function(form) {
 if(form.$valid) {

 if ($scope.dados.id==0) {
 $scope.dados.id = 1;
 query = 'insert into pessoa (id , tipo, nome, nomeMae, nascimento, cidade_nascimento, cep, endereco, complemento, bairro, cidade, uf, ativo) values (?,?,?,?,?,?,?,?,?,?,?,?,?)';
 } else {
 query = 'update pessoa ' +
 '  set id = ?,' +
 '      tipo = ?,' +
 '      nome = ?,' +
 '      nomeMae = ?,' +
 '      nascimento = ?,' +
 '      cidade_nascimento = ?,' +
 '      cep = ?,' +
 '      endereco = ?,' +
 '      complemento = ?,' +
 '      bairro = ?,' +
 '      cidade = ?,' +
 '      uf = ?,' +
 '      ativo = ? ' +
 'where tipo = 0';
 }
 $cordovaSQLite.execute(db,query,
 [ $scope.dados.id ,
 $scope.dados.tipo,
 $scope.dados.nome,
 $scope.dados.mae,
 $scope.dados.nascimento,
 $scope.dados.cidade_nascimento,
 $scope.dados.cep,
 $scope.dados.endereco,
 $scope.dados.complemento,
 $scope.dados.bairro,
 $scope.dados.cidade,
 $scope.dados.uf,
 $scope.dados.ativo])
 .then(function(result) {

 $ionicPopup.alert({
 title: 'Sucesso!!!',
 content: 'Seus dados foram gravados com sucesso.',
 okType: 'button-balanced',
 });

 $state.go('inicio.historico');

 }, function(error){
 console.log(error);
 $ionicPopup.alert({
 title: 'Erro!!!',
 content: 'Não foi possível gravar seus dados. Tente novamente.',
 okType: 'button-assertive',
 });
 });
 }
 };

 $scope.buscaCEP = function(cep) {
 $scope.resultCEP = "";

 if (cep.length!=8 || isNaN(cep)) {
 $scope.resultCEP = "CEP Inválido!";
 } else {


 $ionicLoading.show({
 template: 'Aguarde...'
 });

 HttpService.getPost(cep)
 .then(function(response) {
 if (response.status=='404') {
 $scope.dados.endereco = '';
 $scope.dados.bairro = '';
 $scope.dados.cidade = '';
 $scope.dados.uf = '';
 $scope.resultCEP = 'CEP não encontrado!';
 } else {
 if (response.data.endereco) {
 $scope.dados.endereco = response.data.endereco;
 } else {
 $scope.dados.endereco = response.data.logradouro;
 }
 $scope.dados.bairro = response.data.bairro;
 $scope.dados.cidade = response.data.cidade;
 $scope.dados.uf = response.data.estado;
 }
 }, function(err){
 console.error('ERR', err);
 });

 $ionicLoading.hide();
 }
 }

 }])


 .controller('MeusDadosController', ['$scope', '$ionicPlatform', '$q', 'ServiceMeusDados',
  function ($scope, $ionicPlatform, $q, ServiceMeusDados) {
    var vm = this;
    $scope.isAdd = true;

    // Initialize the database.
    $ionicPlatform.ready(function() {
      ServiceMeusDados.initDB();

      ServiceMeusDados.getAllRegistros().then(function(registros) {
        vm.registros = registros;
      });
    });


    // Initialize the modal view.
    // $ionicModal.fromTemplateUrl('add-or-edit-registro.html', {
    //   scope: $scope,
    //   animation: 'slide-in-up'
    // }).then(function(modal) {
    //   $scope.modal = modal;
    // });

    vm.showAddRegistroModal = function() {
      $scope.registro = {};
      $scope.action = 'Incluir';
      $scope.isAdd = true;
      $scope.modal.show();
    };

    vm.showEditRegistroModal = function(registro) {
      $scope.registro = registro;
      $scope.action = 'Editar';
      $scope.isAdd = false;
      $scope.modal.show();
    };

    $scope.saveRegistro = function(form) {
      if(form.$valid) {
        if ($scope.isAdd) {
          ServiceMeusDados.addRegistro($scope.dados);
        } else {
          ServiceMeusDados.updateRegistro($scope.dados);
        }
      }
      $scope.modal.hide();
    };

    $scope.deleteRegistro = function() {
      ServiceMeusDados.deleteRegistro($scope.dados);
      $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    return vm;
  }
]);
*/
