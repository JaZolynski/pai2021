app.controller('ProjectsCtrl', [ '$http', '$scope', 'common', function($http, $scope, common) {
    let ctrl = this

    ctrl.projects = []
    ctrl.project = {}
    ctrl.q = ''
    ctrl.skip = ctrl.limit = 0
    
    const projectDefaults = {
        Name: '',
        Manager: '',
        
    }

    ctrl.edit = function(index) {
        Object.assign(ctrl.project, index >= 0 ? ctrl.projects[index] : projectDefaults)
        let options = { 
            title: index >= 0 ? 'Edytuj dane' : 'Nowe dane ',
            ok: true,
            delete: index >= 0,
            cancel: true,
            data: ctrl.project
        }
        common.dialog('makeProject.html', 'MakeProjectCtrl', options, function(answer) {
            switch(answer) {
                case 'ok':
                    if(index >= 0) {
                        $http.put('/project', ctrl.project).then(
                            function(res) { 
                                ctrl.projects = res.data
                                common.alert.show('Dane zmienione')
                            },
                            function(err) {}
                        )
                    } else {
                        $http.post('/project', ctrl.project).then(
                            function(res) { 
                                ctrl.projects = res.data
                                common.alert.show('Dane dodane')
                            },
                            function(err) {}
                        )
                    }
                    break
                case 'delete':
                    let options = {
                        title: 'Usunąć obiekt?',
                        body: ctrl.projects[index].firstName + ' ' + ctrl.projects[index].lastName,
                        ok: true,
                        cancel: true
                    }
                    common.confirm(options, function(answer) {
                        if(answer == 'ok') {
                            $http.delete('/project?_id=' + ctrl.projects[index]._id).then(
                                function(res) { 
                                    ctrl.projects = res.data 
                                    common.alert.show('Dane usunięte')
                                },
                                function(err) {}
                            )
                        }
                    })
                    break
            }
        })
    }

    
    ctrl.refreshData = function() {
        $http.get('/project?q=' + ctrl.q + '&limit=' + ctrl.limit + '&skip=' + ctrl.skip).then(
            function(res) { ctrl.projects = res.data },
            function(err) {}
        )    
    }

    ctrl.refreshData()

    $scope.$on('refresh', function(event, parameters) {
        if(parameters.collection == 'projects')  {
            ctrl.refreshData()
        }
    })
  
}])