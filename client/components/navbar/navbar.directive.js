'use strict';

angular.module('chemclaveApp')
  .directive('navbar', () => ({
    templateUrl: 'components/navbar/navbar.html',
    restrict: 'E',
    controller: 'NavbarController',
    controllerAs: 'nav'
  }))

  .directive('greeting', () => ({
    templateUrl: 'components/navbar/customnav.html',
    restrict: 'E',
    controller: 'NavbarController',
    controllerAs: 'nav'
  })); 
