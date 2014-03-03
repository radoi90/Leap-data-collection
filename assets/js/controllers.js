var indexApp = angular.module('indexApp', []);

gestures = [];

for (var i=1;i<=10;i++)
{
    lGesture = {};
    lGesture["short_name"]  = 'gesture' + i + "L";
    lGesture["link"]        = 'gestures/collect.html?gesture=' + lGesture["short_name"];
    lGesture["nice_name"]   = 'Gesture ' + i +"L";

    rGesture = {};
    rGesture["short_name"]  = 'gesture' + i + "R";
    rGesture["link"]        = 'gestures/collect.html?gesture=' + rGesture["short_name"];
    rGesture["nice_name"]   = 'Gesture ' + i +"R";

    gestures.push(lGesture);
    gestures.push(rGesture);
}

indexApp.controller('indexCtrl', function ($scope) {
    $scope.gestures = gestures;
    $scope.gesture1 = $scope.gestures[0];
    $scope.gesture2 = $scope.gestures[0];
});