define([], function()
{
   return new function()
   {
       var routes = {};
       var otherwiseCallback = null;

       /**
        * @param {string} route
        * @param {function} callback
        */
       this.define = function(route, callback)
       {
           routes[route] = callback;
       };

       /**
        * @param {function} callback
        */
       this.otherwise = function(callback)
       {
           otherwiseCallback = callback;
       };

       /**
        * @return {void}
        */
       this.run = function()
       {
           var segments = getRoutableSegments();

           if (currentRouteIsHomePage(segments))
           {
               executeRoute(routes["/"], {});
               return;
           }

           var routeKeys = getObjectKeys(routes);

           for(var i = 0; i < routeKeys.length; i++)
           {
               var routeKey = routeKeys[i];
               var route = routes[routeKey];
               var routeParams = null;

               if (routeParams = routeMatches(routeKey, segments))
               {
                   executeRoute(route, routeParams);
                   return;
               }
           }

           if (otherwiseCallback)
                executeRoute(otherwiseCallback, {});
       };

       /**
        * @param {string} route
        * @param {Array} locationSegments
        * @returns {Array|false}
        */
       function routeMatches(route, locationSegments)
       {
           var routeSegments = route.split("/");
           var routeParams = [];

           if (numberOfSegmentsDontMatch(routeSegments, locationSegments))
                return false;

           for(var i = 0; i < locationSegments.length; i++)
           {
               var locationSegment = locationSegments[i];
               var routeSegment = routeSegments[i];

               if (eitherSegmentIsEmpty(locationSegment, routeSegment))
               {
                   return false;
               }
               else if (routeSegmentIsVariablePlaceholder(routeSegment))
               {
                   routeParams[getPlaceholderName(routeSegment)] = locationSegment;
               }
               else if (routeSegmentsDoMatch(locationSegment, routeSegment))
               {
                   return false;
               }
           }

           return routeParams;
       }

       /**
        * @param {Array} segments
        * @returns {boolean}
        */
       function currentRouteIsHomePage(segments)
       {
           return segments.length == 1 && routes["/"];
       }

       /**
        * @param {Array} routeSegments
        * @param {Array} locationSegments
        * @returns {boolean}
        */
       function numberOfSegmentsDontMatch(routeSegments, locationSegments)
       {
           return routeSegments.length > locationSegments.length;
       }

       /**
        * @param {string} locationSegment
        * @param {string} routeSegment
        * @returns {boolean}
        */
       function eitherSegmentIsEmpty(locationSegment, routeSegment)
       {
           return ! locationSegment || ! routeSegment;
       }

       /**
        * @param {string} routeSegment
        * @returns {boolean}
        */
       function routeSegmentIsVariablePlaceholder(routeSegment)
       {
           return routeSegment.indexOf(":") === 0;
       }

       /**
        * @param {string} routeSegment
        * @returns {string}
        */
       function getPlaceholderName(routeSegment)
       {
           return routeSegment.substr(1);
       }

       /**
        * @param {string} locationSegment
        * @param {string} routeSegment
        * @returns {boolean}
        */
       function routeSegmentsDoMatch(locationSegment, routeSegment)
       {
           return locationSegment.toLowerCase() != routeSegment.toLowerCase();
       }

       /**
        * @returns {Array}
        */
       function getRoutableSegments()
       {
           var segments = window.location.pathname.split("/");
           segments.shift();

           return segments;
       }

       /**
        * @param {function} callback
        * @param {object} params
        */
       function executeRoute(callback, params)
       {
           if (typeof callback == "function")
           {
               callback(params);
           }
           else if (typeof callback == "string")
           {
               var parts = callback.split("@");
               var requirePath = parts[0];
               var functionName = parts[1];

               require([requirePath], function(controller)
               {
                  controller[functionName](params);
               });
           }
       }

       /**
        * @param {object} obj
        * @returns {Array}
        */
       function getObjectKeys(obj)
       {
           if (obj !== Object(obj))
               throw new TypeError('Cannot get keys of a non-object.');

           if (Object.keys)
               return Object.keys(obj);

           var keysArray = [];

           for(var prop in obj)
               if(Object.prototype.hasOwnProperty.call(obj, prop))
                   keysArray.push(prop);

           return keysArray;
       }
   }
});