myApp.factory('AuthService', ['$q', '$timeout', '$http', function($q, $timeout, $http) {

    //create a user variable
    var user = null

    function isLoggedIn() {
        if (user) {
            return true;
        } else {
            return false;
        }
    }

    function login(email, password) {
        var deferred = $q.defer()

        //send a post request to server
        $http.post('http://localhost:5000/api/login', { email: email, password: password })
            //handle success
            .success(function(data, status) {
                if (status === 200 && data.result) {
                    user = true
                    deferred.resolve()
                } else {
                    user = false;
                    deferred.reject();
                }
            })
            //handle the error
            .error(function(data) {
                user = false;
                deferred.reject();
            });

        //return the promise object
        return deferred.promise
    }

    function register(email, password) {

        // create a new instance of deferred
        var deferred = $q.defer();

        // send a post request to the server
        $http.post('/api/register', { email: email, password: password })
            // handle success
            .success(function(data, status) {
                if (status === 200 && data.result) {
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            })
            // handle error
            .error(function(data) {
                deferred.reject();
            });

        // return promise object
        return deferred.promise;

    }

    function logout() {
        //create a new instance of deferred

        var deferred = $q.defer();

        //send a request to the server
        $http.get('http://localhost:5000/api/logout')
            //handle success
            .success(function(data) {
                user = false
                deferred.resolve()
            })
            //handle error
            .error(function(data) {
                user = false
                deferred.reject()
            })

        //return the promise object
        return deferred.promise
    }

    function getUserStatus() {
        return $http.get('/api/status')
            // handle success
            .success(function(data) {
                if (data.status) {
                    user = true;
                } else {
                    user = false;
                }
            })
            // handle error
            .error(function(data) {
                user = false;
            });
    }

    return ({
        isLoggedIn: isLoggedIn,
        login: login,
        logout: logout,
        getUserStatus: getUserStatus,
        register: register
    });

}]);
