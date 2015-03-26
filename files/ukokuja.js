angular.module('ukokuja', [])
    .directive('compile', ['$compile', function ($compile) {
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function(value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            );
        };
    }])
    .controller('TodoController', ['$scope', '$timeout', '$location', function($scope, $timeout, $location) {
        $scope.posts = [];
        $scope.bestPosts = [];
        $scope.tags = [];
        $scope.bestTags = [];
        $scope.tagList = [];
        $scope.simplepost = {};
        $scope.keys = [];
        $scope.postRef  =  new Firebase("https://ukokuja.firebaseio.com/blog/posts");
        $scope.postRef.orderByChild("visitas").once("value", function(snapshot) {
            $timeout(function(){

                angular.forEach(snapshot.val(), function(value, key){
                    for(var i = 0; i< value.tags.length; i++){
                        if($scope.bestTags.indexOf(value.tags[i]) < 0){
                            $scope.bestTags.push(value.tags[i]);

                        }

                    }
                    value.key = key;
                    $scope.bestPosts.push(value);
                    $scope.keys = $scope.keys.concat(key);
                });
                for(var i = 0; i<$scope.bestTags.length; i++){
                    var a = $scope.bestTags.toString().match($scope.bestTags[i]).length;
                    var b  = {"name" : $scope.bestTags[i], "times" : a};
                    if($scope.tagList.indexOf(b)<0){
                        $scope.tagList.push(b);
                    }

                }

            }, 100);
        });
        $scope.getPic = function(url){
            return url ? url : "files/user.png"
        }
        $scope.getTags = function(tags){
            var aux = tags[0];
            for(var i = 1; i<tags.length; i++){
                aux = aux + " / " + tags[i];
            }
            return aux;
        }
        $scope.changeLocation = function(url) {
          window.location = url;
          window.location.reload();
        };
        $scope.getRand = function(ind){
            var a = Math.floor(Math.random() * $scope.keys.length);
            while(a == ind){
                a = Math.floor(Math.random() * $scope.keys.length);
            }
            return $scope.keys[a];

        }
        if(!isNaN($location.search().post)) {
            $scope.postRef.child($location.search().post).once("value", function(snapshot) {

                    if(snapshot.val()){
                        $timeout(function(){
                        $scope.simplepost = snapshot.val();
                        $scope.simplepost.key = snapshot.key();
                        if(!$scope.simplepost.visitas){
                            $scope.simplepost.visitas  = 1;
                        }else{
                            $scope.simplepost.visitas++;
                        }
                        $scope.postRef.child($location.search().post).update({
                            "visitas" : $scope.simplepost.visitas
                        })
                        $scope.includes = "files/post.html";
                        }, 500);

                        //$scope.simplepost.description
                    }else{
                        $scope.includes = "files/404.html";
                    }
            });


        }else{
            if($location.search().post){
                $scope.includes = "files/404.html";
            }else{
                $scope.includes = "files/posts.html";
                $scope.postRef.limitToLast(5).once("value", function(snapshot) {
                    $timeout(function(){
                        angular.forEach(snapshot.val(), function(value, key){
                            $scope.tags = $scope.tags.concat(value.tags);
                            value.key = key;
                            $scope.posts.push(value);
                        });
                    $scope.posts.sort(function(a, b){return b.key - a.key});
                    }, 100);
                });
            }
        }

    }]);

