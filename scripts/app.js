angular.module('Home', []);

angular.module('BasicHttpAuthExample', [
    'Home',
    'ngRoute',
    'ngAnimate'
])

.controller('HeaderController', ['$scope', '$location', '$anchorScroll', 'helpers',
    function ($scope, $location, $anchorScroll, helpers) {
        $scope.goToPage = function (scrollLocation) {
            $location.hash(scrollLocation);
            helpers.goToPage(scrollLocation);
        }
}])

.directive('loading', ['$http', '$rootScope', '$timeout', function ($http, $rootScope, $timeout)
{
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };
            scope.$watch(scope.isLoading, function (v) {
                if (v) {
                    $rootScope.loaderHide = false;
                }
                else {
                    $timeout(function () {
                        $rootScope.loaderHide = true;
                    }, 1000);
                }
            });
        }
    }
}])

.run(['$rootScope', '$location', '$http', '$timeout', 'helpers', function ($rootScope, $location, $http, $timeout, helpers) {

    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        var path = $location.path();
        if (path !== '' && path !== '/') {
            event.preventDefault();
        }
        if ($location.hash()) {
            $timeout(function () {
                helpers.goToPage($location.hash());
            }, 100);
        }
        else
            $rootScope.pageActiveClass = 'home';
    });
}])

.factory('helpers', function ($location, $anchorScroll, $rootScope) {

    var services = {};
    services.goToPage = function (scrollLocation) {
        
        $rootScope.pageActiveClass = scrollLocation;
        var elm = document.getElementById(scrollLocation);
        var currentY = currentYPosition();
        var newY = elm.offsetTop;
        var distance = newY > currentY ? newY - currentY : currentY - newY;
        var speed = Math.round(distance / 100);
        if (speed >= 20) speed = 20;
        var step = Math.round(distance / 25);
        var leapY = newY > currentY ? currentY + step : currentY - step;
        var timer = 0;
        if (newY > currentY) {
            for (var i = currentY; i < newY; i += step) {
                setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
                leapY += step; if (leapY > newY) leapY = newY; timer++;
            } return;
        }
        for (var i = currentY; i > newY; i -= step) {
            setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
            leapY -= step; if (leapY < newY) leapY = newY; timer++;
        }

        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
                return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }
    }

    return services;
})

.directive('ngMouseWheel', function ($location, $timeout, helpers) {
    var mouseWheelService = function (scope, element, attrs) {
        element.bind("DOMMouseScroll mousewheel onmousewheel", function (event) {
            // cross-browser wheel delta
            var event = window.event || event; // old IE support
            var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
            var activeElement = angular.element(document.getElementsByClassName('activePage'));
            var activeElementId = activeElement.attr('id');

            if (delta > 0) { //Mouse wheel up
                if (document.getElementById(activeElementId).previousSibling) {
                    var prevElement = document.getElementById(activeElementId).previousSibling.previousSibling;
                    var prevElementId = prevElement.id;
                    helpers.goToPage(prevElementId);
                    $timeout(function () {
                        $location.hash(prevElementId);
                    }, 100);
                }
            }
            else if (delta < 0) { //Mouse wheel down
                if (document.getElementById(activeElementId).nextSibling) {
                    var nextElement = document.getElementById(activeElementId).nextSibling.nextSibling;
                    var nextElementId = nextElement.id;
                    helpers.goToPage(nextElementId);
                    $timeout(function () {
                        $location.hash(nextElementId);
                    }, 100);
                }
            }
        });
    }

    return mouseWheelService;
})

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            cache: false,
            controller: 'HomeController',
            templateUrl: 'modules/home/views/home.html'
        })
        .otherwise({
            redirecTo: '/home'
        });
}])