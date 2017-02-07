var myApp = angular.module('myApp',['ngMaterial','ngAnimate','ngRoute']);


myApp.run(function($http,$rootScope,$location,$route,AuthService) {

    $http.defaults.headers.common['Content-Type'] = 'application/json';

$rootScope.$on('$routeChangeStart',
    function (event, next, current) {
      AuthService.getUserStatus()
      .then(function(){
        if (next.access.restricted && !AuthService.isLoggedIn()){
          $location.path('/login');
          $route.reload();
        }
      });
  });

});

myApp.config(function($routeProvider){
	$routeProvider

	.when('/home',{
		templateUrl:'/static/home.html',
		controller: 'mainController',
		access:{restricted:true}

	})
	.when('/register',{
		templateUrl: '/static/register.html',
		controller:'registerController',
		access: {restricted: false}
	})
	.when('/login',{
		templateUrl: '/static/login.html',
		controller: 'loginController',
		access: {restricted:false}
	})
	.when('/logout',{
		templateUrl: '/static/logout.html',
		controller: 'mainController',
		access:{restricted:true}
	})
	.otherwise({
		redirectTo: '/login'
	})
})
