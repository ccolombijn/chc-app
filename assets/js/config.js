'use strict'
/*
* assets/js/config.js
*/
const config = ( () => {
  let modules = () => {
    return [
      { label : 'Get Thing', route : 'thing/get', action :  thing.get, nav : true },
      { label : 'Set Thing', route : 'thing/set', action :  thing.set, nav : true }
    ]
  },
  debugItems = () => [ config, application, UI, config.modules() ],
  endpoint = () => location.hash.slice(1),
  route = window.onhashchange;
  return {
    title : 'Thing Manager',
    subTitle : 'For Some Place',
    modules : modules,
    debug : false,
    debugItems : debugItems,
    output : 'section#page_output',
    default : 'thing/get',
    endpoint : endpoint,
    route : route
  }

})()
