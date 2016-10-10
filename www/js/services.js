angular.module('app.services', [])

  .factory('BlankFactory', [function(){

  }])

  .provider('BlankProvider', [function(){

  }]);


(function() {

  angular.module('app.services', [])
    .factory('ServiceVacina', ['$q', ServiceVacina])
    .factory('ServiceGrupo', ['$q', ServiceGrupo])
    .factory('ServiceMeusDados', ['$q', ServiceMeusDados])

    .provider('HeaderProvider', function(){

      this.$get = function(base64){
        return {
          getHeader: function(key, password){
            return {
              'Authorization': 'Basic ' + base64.encode(key+ ':' + password),
              'Accept': 'application/json; charset=utf-8',
              'Content-Type': 'application/json; charset=utf-8'
            }
          }
        };
      };
    })

    .factory('HttpService', function($http) {
      return {
        getPost: function(cep) {
          // $http returns a promise, which has a then function, which also returns a promise.

          return $http.get('http://api.postmon.com.br/v1/cep/'+cep)
            .then(function (response) {
              // In the response, resp.data contains the result. Check the console to see all of the data returned.
              return response;
            }, function(err){
              return err;
            });
        }
      };
    });

  function ServiceVacina($q){
    var _db;
    var _vacinas;

    return {
      initDB: initDB,

      getAllRegistros: getAllRegistros,
    };

    function initDB(registro) {

      // Base de dados local
      _db = new PouchDB('vacinas');

      // Configuração da base remota
      var key = 'trythertsidentebutioding';
      var password = '92eaf60028bda22a4953892b81298aee65c9e527';
      var remote = 'https://'+key+':'+password+'@3d0fdcae-476f-41f8-9ebf-9e9628df9077-bluemix.cloudant.com/vacinas';

      var options = {
        live: true,
        retry: true,
        continuous: true
      };

      _db.replicate.from(remote, _db, options);
    };

    getAllRegistros: function getAllRegistros() {

      if (!_vacinas) {
        return $q.when (_db.allDocs({ include_docs: true}))
          .then(function(docs) {
            _vacinas = docs.rows.map(function(row) {
              return row.doc;
            });

            // Listen for changes on the database.
            _db.changes({ live: true, since: 'now', include_docs: true})
              .on('change', onDatabaseChange);

            return _vacinas;
          });
      } else {
        // Return cached data as a promise
        return $q.when(_vacinas);
      }
    };

    function onDatabaseChange(change) {
      var index = findIndex(_vacinas, change.id);
      var registro = _vacinas[index];

      if (change.deleted) {
        if (registro) {
          _vacinas.splice(index, 1); // delete
        }
      } else {
        if (registro && registro._id === change.id) {
          _vacinas[index] = change.doc; // update
        } else {
          _vacinas.splice(index, 0, change.doc) // insert
        }
      }
    };

    function findIndex(array, id) {
      var low = 0, high = array.length, mid;
      while (low < high) {
        mid = (low + high) >>> 1;
        array[mid]._id < id ? low = mid + 1 : high = mid
      }
      return low;
    };
  }

  function ServiceGrupo($q){
    var _db;
    var _registros;

    return {
      initDB: initDB,

      getAllRegistros: getAllRegistros,
      addRegistro: addRegistro,
      updateRegistro: updateRegistro,
      deleteRegistro: deleteRegistro
    };

    function initDB(registro) {

      // Base local
      _db = new PouchDB('grupo-familiar');

      // Configuração da base remota
      var key = 'itensetwerievedlyssizess';
      var password = 'dacba7d125dd422b03e7abe4dd82b9be438923a6';
      var remote = 'https://'+key+':'+password+'@3d0fdcae-476f-41f8-9ebf-9e9628df9077-bluemix.cloudant.com/grupo-familiar';

      var options = {
        live: true,
        retry: true,
        continuous: true
      };

      _db.sync(remote, options);
    };

    function addRegistro(registro) {
      return $q.when (_db.post(registro));
    };

    function updateRegistro(registro) {
      return $q.when (_db.put(registro));
    };

    function deleteRegistro(registro) {
      return $q.when (_db.remove(registro));
    };

    getAllRegistros: function getAllRegistros(_user) {
      return $q.when (_db.query(function (doc, emit)
      {
        emit(doc.id);
      }, {key: _user, include_docs : true}).then(function(docs) {

        // Each row has a .doc object and we just want to send an
        // array of registro objects back to the calling controller,
        // so let's map the array to contain just the .doc objects.
        _registros = docs.rows.map(function(row) {
          // Dates are not automatically converted from a string.
          row.doc.nascimento = new Date(row.doc.nascimento);

          if(angular.isArray(row.doc.vacinas)) {
            // É necessário converter as datas das doses
            var i=0, j=0, k=0;
            for (i=0;i<row.doc.vacinas.length;i++)
              for (j=0;j<row.doc.vacinas[i].grupos.length;j++)
                for (k=0;k<row.doc.vacinas[i].grupos[j].doses.length;k++) {
                  if (row.doc.vacinas[i].grupos[j].doses[k].dataProgramada)
                    row.doc.vacinas[i].grupos[j].doses[k].dataProgramada = new Date(row.doc.vacinas[i].grupos[j].doses[k].dataProgramada);

                  if (row.doc.vacinas[i].grupos[j].doses[k].dataExecutada)
                    row.doc.vacinas[i].grupos[j].doses[k].dataExecutada  = new Date(row.doc.vacinas[i].grupos[j].doses[k].dataExecutada);
                }
          }

          return row.doc;
        });

        // Listen for changes on the database.
        _db.changes({ live: true, since: 'now', include_docs: true})
          .on('change', onDatabaseChange);

        return _registros;
      }));
    };

    function onDatabaseChange(change) {
      var index = findIndex(_registros, change.id);
      var registro = _registros[index];

      if (change.deleted) {
        if (registro) {
          _registros.splice(index, 1); // delete
        }
      } else {
        if (registro && registro._id === change.id) {
          _registros[index] = change.doc; // update
        } else {
          _registros.splice(index, 0, change.doc) // insert
        }
      }
    };

    function findIndex(array, id) {
      var low = 0, high = array.length, mid;
      while (low < high) {
        mid = (low + high) >>> 1;
        array[mid]._id < id ? low = mid + 1 : high = mid
      }
      return low;
    };
  }


  function ServiceMeusDados($q){
    var _db;
    var _registros;

    return {
      initDB: initDB,

      getAllRegistros: getAllRegistros,
      addRegistro: addRegistro,
      deleteRegistro: updateRegistro,
      deleteRegistro: deleteRegistro
    };

    function initDB(registro) {

      var key = 'ldifforgstiondendstareak';
      var password = '33cde0412f32bf2bc857dcfca703435e39bfc826';
      var remote = 'https://'+key+':'+password+'@3d0fdcae-476f-41f8-9ebf-9e9628df9077-bluemix.cloudant.com/imunizabr';

      var options = {
        live: true,
        retry: true,
        continuous: true
      };

      // Creates the database or opens if it already exists
      _db = new PouchDB('registros');

      //_db.sync(remote, options);
    };

    function addRegistro(registro) {
        return $q.when (_db.post(registro));
    };

    function updateRegistro(registro) {
        return $q.when (_db.put(registro));
    };

    function deleteRegistro(registro) {
        return $q.when (_db.remove(registro));
    };

    getAllRegistros: function getAllRegistros() {

        if (!_registros) {
          return $q.when (
            _db.query(function (doc, emit) {
              emit(doc.id);
            }, {key: '936b4282a56174d65e179eedebe7b764',
              include_docs : true})
            //_db.allDocs({ include_docs: true}))
            .then(function(docs) {

              // Each row has a .doc object and we just want to send an
              // array of registro objects back to the calling controller,
              // so let's map the array to contain just the .doc objects.
              _registros = docs.rows.map(function(row) {
                // Dates are not automatically converted from a string.
                row.doc.nascimento = new Date(row.doc.nascimento);
                return row.doc;
              });

              // Listen for changes on the database.
              _db.changes({ live: true, since: 'now', include_docs: true})
                .on('change', onDatabaseChange);

              return _registros;
            }));
        } else {
          // Return cached data as a promise
          return $q.when(_registros);
        }
    };

    function onDatabaseChange(change) {
        var index = findIndex(_registros, change.id);
        var registro = _registros[index];

        if (change.deleted) {
          if (registro) {
            _registros.splice(index, 1); // delete
          }
        } else {
          if (registro && registro._id === change.id) {
            _registros[index] = change.doc; // update
          } else {
            _registros.splice(index, 0, change.doc) // insert
          }
        }
    };

    function findIndex(array, id) {
        var low = 0, high = array.length, mid;
        while (low < high) {
          mid = (low + high) >>> 1;
          array[mid]._id < id ? low = mid + 1 : high = mid
        }
        return low;
    };
  }

})();

