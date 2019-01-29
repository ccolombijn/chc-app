'use strict';
/*
* assets/js/main.js
*/
(()=>{
  requirejs([
    'config',
    'application',
    'class/Thing',
    'modules/thing'
  ],() => {
    application.init()
    
  })
})()
