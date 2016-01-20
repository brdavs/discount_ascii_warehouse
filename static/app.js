'use strict';

angular.module('asApp', [])

/* ----------------------------------------------------------------------------
 *  Services
 * --------------------------------------------------------------------------*/
.service('api', ['$http', function($http){

    // A function to fix broken response from api
    var fix_response = function(data, headers) {
        // Jsonify the resource fixing it in one eloquent one-liner.
        var out = angular.fromJson('[' + data.slice(0, -1).replace(/(\n)+/g,",") + ']');
        // Map any misformatted data to out
        return out.map(function(item) {
            // Map price in cents to a normal USD price with 2 decimals
            item.price = (item.price/100).toFixed(2);
            // Map date string to date object
            item.date = new Date(item.date);
            return item
        });
    }
    // Return 2 services that take params as params
    return {
        products: function(params) {
            return $http.get('/api/products', {
                transformResponse: fix_response,
                params: params
            })
        },
        ads: function(params) { return $http.get('/ad', {params: params}); }
    }
}])



/* ----------------------------------------------------------------------------
 *  Filters
 * --------------------------------------------------------------------------*/
.filter('fuzzyDate', function() {
    return function(then) {
        var now = new Date();
        var diff = now - then;
        var m = 60000;
        var h = 60*m;
        var d = 24*h;
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
        // 1 week or older (normal US civilian date is shown)
        if( diff/d > 6 )
            return months[then.getMonth()] + ' ' + then.getDate() + ', ' + then.getFullYear();
        // Between 1 and 6 days
        if( diff/h > 24 )
            return Math.floor(diff/d) + ' day' + (Math.floor(diff/d)>1 ? 's' : '') + ' ago';
        // between 1 hour an 23 hours
        if( diff/m > 60 )
            return Math.floor(diff/h) + ' hour' + (Math.floor(diff/h)>1 ? 's' : '') + ' ago';
        // between 1 minute and 59 minutes
        if( diff/m <= 60 )
            return Math.floor(diff/m) + ' minute' + (Math.floor(diff/m)>1 ? 's' : '') + ' ago';
        // Less than 1 minute ago
        return 'a minute or less ago';
    }
})

/* ----------------------------------------------------------------------------
 *  Directives
 * --------------------------------------------------------------------------*/
.directive('scroll', ['$window', 'api', function ($window, api) {

    // Figure out weather bootom has been reached [bool]
    // If bottom_approach_px > 0, than return return true that many pixels before
    var bottom_reached = function(bottom_approach_px) {
        var scroll = document.documentElement.scrollTop || document.body.scrollTop;
        var height = document.body.offsetHeight;
        var visible = document.documentElement.clientHeight;
        return height - bottom_approach_px <= scroll + visible;
    }
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll resize", function() {
            var should_add_products = bottom_reached(scope.bottom_approach_px);
            if(should_add_products && scope.loading==false) {
                scope.loading = true;
                if(scope.prefetched.length < scope.prefetch_count)
                    scope.fetch();
                // Add 1 prefetched batch to products and delete it from prefetched array
                scope.shift_to_products();
            }
        });
    }

}])


.directive('adload', ['$q', 'api', function($q, api) {
    /*
    I would never deploy something like this in real life, as it's a recursive
    and potentialy broken solution to a broken problem.
    I decided not to implement the serverside algorithm, because that was too
    obvious and easy. This algorithm assumes I can not read serverside code.
    */
    var load = function(scope, element, attrs) {
        var i = attrs.adload;
        var r = scope.r();
        // A new ad is loaded, it's random is added to the resolution of the promise
        // For inclusion in the template
        var new_ad = api.ads({r: r}).then(function(res) { res.random=r; res.i=i; return res; });
        // When all ads (until this moment) have loaded
        $q.all(scope.ads).then(function(ads) {

            // And the new ad has been loaded as well
            new_ad.then(function(ad) {
                // get a set of ads that this new one has to be distinct from
                var avoidable = scope.ads.slice(i-scope.ad_distinct, i).map(function(item) {
                    return item.data;
                })
                // If the new ad's data is not in the above set
                if(avoidable.indexOf(ad.data) == -1) {
                    // Just ad it to the set
                    scope.ads[i] = ad;
                } else {
                    // If the ad's data is found in the set, erase any already loaded ads
                    // after this one (to avoid future collisions whit something that has
                    // already been legitly loaded)
                    scope.ads.splice(i+1, scope.ads.length-1);
                    // And run this function again (recursively) until the newly loaded ad
                    // is different from avoidable batch
                    load(scope, element, attrs);
                }
            });
        });
        
    };
    return function(scope, element, attrs) {
        return load(scope, element, attrs);
    };
}])


/* ----------------------------------------------------------------------------
 *  Controllers
 * --------------------------------------------------------------------------*/
.controller('mainCtrl', ['$scope', 'api', function($scope, api) {

    // Vars
    $scope.batch_size =  20;                                                    // How many items in a batch
    $scope.prefetch_count =  3;                                                 // How many sets of items to prefetch
    $scope.bottom_approach_px = 200;                                            // How many pixels to the bottom before next set of batches is loaded
    $scope.loading = true;                                                      // Loading button visibility
    $scope.params = { limit: $scope.batch_size, skip: 0, sort: 'id' };          // Parameters to get the batch
    $scope.ad_frequency = 20;                                                   // Show ad every n store items
    $scope.ad_distinct = 1;                                                     // Distinct ads before a repeated ad is allowed

    // Placeholders
    $scope.products = [];                                                       // Displayed items
    $scope.prefetched = [];                                                     // Placeholder for prefetched store items
    $scope.ads = [];                                                            // Placeholder for ads
    
    // Helpers
    var r = $scope.r = function() { return Math.floor(Math.random()*1000) };    // Random generator
    var l = $scope.l = function(x) {console.log(x);}                            // Just for testing purposes

    // Fetch n batches
    $scope.fetch = function() {
        var n = $scope.prefetch_count;
        while(n>0) {
            var item = api.products({
                limit: $scope.params.limit,
                skip: $scope.params.skip,
                sort: $scope.params.sort
            });
            $scope.prefetched[$scope.prefetched.length] = item;
            $scope.params.skip += $scope.batch_size;
            n--;
        }
    }
    // Shift a batch to products
    $scope.shift_to_products = function() {
        return $scope.prefetched[0].then(function(res) {
            $scope.products = $scope.products.concat(res.data);
            $scope.prefetched.shift();
            $scope.loading = false;
        });
    }
    // Get first batch of products and run prefetch for the first time
    $scope.init = function(sorter) {
        $scope.params = { limit: $scope.batch_size, skip: 0, sort: sorter };
        $scope.products = [];
        $scope.prefetched = [];
        $scope.fetch();
        $scope.shift_to_products();
    }
    // Init
    $scope.init('id');
}]);
