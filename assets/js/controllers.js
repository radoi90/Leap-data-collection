var indexApp = angular.module('indexApp', []);
var displayApp = angular.module('displayApp',[]);

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

    $scope.goToInput = function() {
        if ($scope.gesture1 != null && $scope.gesture2 != null && $scope.control != undefined)
            window.location = "gestures/collect.html?gesture=" + $scope.gesture1.short_name
                                + "&gesture=" + $scope.gesture2.short_name
                                + "&control=" + $scope.control;
    }
});

displayApp.controller('displayCtrl', function ($scope) {
    $scope.gestures = gestures;

    $scope.gesture1 = $scope.gestures[0];
    $scope.gesture2 = $scope.gestures[0];

    var aspect_ration = 16/9;
    var w = document.getElementsByClassName("col-lg-6")[0].firstElementChild.scrollWidth;
    var h = w / aspect_ration;

    $scope.display1 = function() {
        var p = document.getElementById("gesture1display");

        p.innerHTML  =
            "<video controls poster=assets/img/"+$scope.gesture1.short_name +"_snapshot.png>" +
                "<source src=https://github.com/radoi90/Leap-data-collection/blob/master/assets/video/" + $scope.gesture1.short_name +
                ".MP4?raw=true" + " type='video/mp4;codecs=&quot;avc1.42E01E, mp4a.40.2&quot;' />" +
                "</video>";

        var videos = document.getElementsByTagName("video");
        for (var i = 0; i < videos.length; i++)
            videos[i].setAttribute("style", "width:"+ w +"px;height:" + h+"px;");
    }

    $scope.display2 = function() {
        var p = document.getElementById("gesture2display");

        p.innerHTML  =
            "<video controls poster=assets/img/"+$scope.gesture2.short_name +"_snapshot.png>" +
                "<source src=https://github.com/radoi90/Leap-data-collection/blob/master/assets/video/" + $scope.gesture2.short_name +
                ".MP4?raw=true" + " type='video/mp4;codecs=&quot;avc1.42E01E, mp4a.40.2&quot;' />" +
            "</video>";

        var videos = document.getElementsByTagName("video");
        for (var i = 0; i < videos.length; i++)
            videos[i].setAttribute("style", "width:"+ w +"px;height:" + h+"px;");
    }

    $scope.display1();
    $scope.display2();
});