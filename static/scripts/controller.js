var myApp = angular.module('myApp');

myApp.config(function($httpProvider) {
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};

});

myApp.controller('registerController',function($scope,$location,AuthService){
    $scope.register = function () {

      // initial values
      $scope.error = false;
      $scope.disabled = true;

      // call register from service
      AuthService.register($scope.registerForm.email,
                           $scope.registerForm.password)
        // handle success
        .then(function () {
          $location.path('/login');
          $scope.disabled = false;
          $scope.registerForm = {};
        })
        // handle error
        .catch(function () {
          $scope.error = true;
          $scope.errorMessage = "Something went wrong!";
          $scope.disabled = false;
          $scope.registerForm = {};
        });

    };
})

myApp.controller('loginController', function($scope, $location, AuthService) {
    $scope.login = function() {

        $scope.error = false;
        $scope.disabled = true;

        AuthService.login($scope.loginForm.email, $scope.loginForm.password)
            //handle success
            .then(function() {
                $location.path('/home');
                $scope.disabled = false;
                $scope.loginForm = {};
            })

        //handle error
        .catch(function() {
            $scope.error = true;
            $scope.errorMessage = "Invalid username or password";
            $scope.disabled = false;
            $scope.loginForm = {};

        });
    };

    $scope.errorFunc = function() {

        alert = $mdDialog.alert()
            .title('Attention')
            .content('invalid email and password')
            .ok('Close')

        $mdDialog
            .show(alert)
            .finally(function() {
                alert = undefined;
            })


    }
});



myApp.controller('mainController', function($scope, $mdSidenav, $mdDialog, $http, AuthService, $location) {


    $scope.formfields = [];
    $scope.asd = {}

    $scope.editing = false

    $http.get('http://localhost:5000/api/form')
        .success(function(response) {

            console.log(response);
            $scope.formfields = response.objects
            console.log($scope.formfields)



        })








    $http.get('http://localhost:5000/api/status')
        .then(function(response) {

            $scope.data = response.data;
        })


    $scope.logout = function() {

        //call logout from service
        AuthService.logout()
            .then(function() {
                $location.path('/login')
            })
    }




    $scope.fields = [
        'text',
        'password',
        'telephone',
        'select',
        'radio',
        'textarea',
        'checkbox',
        'button'

    ]





    $scope.states = "";





    $scope.show = function() {
        $scope.showeditdelete = true
    }

    $scope.close = function() {
        $scope.showeditdelete = false;
    }

    $scope.search = function() {
        $scope.showfilter = true;
    }

    $scope.closeSearch = function() {
        $scope.showfilter = false;
        //$scope.formfieldsearch = "";
    }

    $scope.addfield = function(add) {

        console.log(add.field_name)
        if (add.field_name) {
            $http.post('http://localhost:5000/api/form', { field_name: add.field_name, help_text: add.help_text, label_name: add.label_name, options: add.options })
                //$http.post('http://localhost:5000/api/form', )
                .then(function(response) {

                    console.log(response);
                    $scope.formfields.push(response.data);
                })

        } else {
            (function() {
                alert = $mdDialog.alert()
                    .title('Attention')
                    .content('Please enter atleast a field name')
                    .ok('Close')

                $mdDialog
                    .show(alert)
                    .finally(function() {
                        alert = undefined;
                    })

            })()
        }




        $scope.resetFields();
        $scope.help = false;
        //$scope.editing = true;
        $scope.deleting = true;
        $mdSidenav('left').close();


    }







    $scope.resetFields = function() {
        $scope.add = {};
        $scope.editing = false
        $scope.help = false
        $scope.sidebaropen()
    }


    $scope.counter = 1
    $scope.options = function() {
        if (!$scope.add.options) $scope.add.options = [];
        $scope.add.options.push({
            //id: $scope.counter++

        })


    }

    $scope.radio = function() {
        if (!$scope.add.options) $scope.add.options = [];
        $scope.add.options.push({
            //id: $scope.counter++
        })
    }






    $scope.sidebaropen = function() {
        $mdSidenav('left').open()

    }

    $scope.closesidebar = function() {
        $mdSidenav('left').close();

    }

    $scope.editfields = function(field) {

        $scope.editing = true
        $scope.add = field
        console.log($scope.editing)
        $scope.sidebaropen();
        console.log(field)


    }



    $scope.editsave = function(field) {
        console.log(field);
        $http.put('http://localhost:5000/api/form/' + field.id, field).success(function(response) {
            console.log('Updated!')
            console.log(response);
        })
        $scope.editing = false
        $scope.add = {}
        $scope.closesidebar();

    }

    $scope.deletefields = function(event, field) {

        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete ' + field.field_name + ' field?')
            .ok('Yes')
            .cancel('No')
            .targetEvent(event)
        $mdDialog.show(confirm).then(function() {
            // var index = $scope.selectedfields.indexOf(selectedfield)
            //             $scope.selectedfields.splice(index,1);
            var index = $scope.formfields.indexOf(field);
            $http.delete('http://localhost:5000/api/form/' + field.id).success(function(response) {
                $scope.formfields.splice(index, 1);
            })
        }, function() {

        })



    }







})
