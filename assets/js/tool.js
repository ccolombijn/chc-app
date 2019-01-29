'use strict'
/*
* assets/js/tool.js
*/
const tool = (function() {
  /* ---------------------------------------------------------------------------
  * make
  tool.make( [ 'div', { id : 'id', class : 'class'}, 'content ', [ 'a', { href : 'https://developer.mozilla.org/' }, 'link' ] ] )
  */
  function make( tag, callback ){
    let isArray = ( array ) => Object.prototype.toString.call( array ) === '[object Array]'
    if ( !isArray( tag ) ) return make.call( this, Array.prototype.slice.call( arguments ) )
    let name = tag[0],
        attributes = tag[1],
        element = document.createElement( name ),
        start = 1

    if ( typeof attributes === 'object' && attributes !== null && !isArray( attributes ) ) {
      for ( let attribute in attributes ) element[ attribute ] = attributes[ attribute]
      start = 2
    }
    for ( let index = start; index < tag.length; index++ ) {
      if( isArray( tag[ index ] ) ){
        element.appendChild( tool.make( tag[ index ] ) )
      } else {
        element.appendChild( document.createTextNode( tag[ index ] ) )
      }
    }
    if( callback ) callback()
    return element
  }
  /* ---------------------------------------------------------------------------
  * insert
  tool.insert( 'content' )
  */
  function insert( content, callback ){
    let output, main = UI.main;
    content.output ? output = content.output : output = config.output;
    if( !typeof output === 'object'  ) output = main.querySelector( output )
    if ( typeof content === 'object'  ) {
      if( content.html ){
        if( content.append ) {
          output.appendChild( tool.make( content.tag, { id : content.id }, content.html ) )
        }else {
            output.innerHTML = content.html
        }
      } else {
        output.innerHTML = ''
        output.appendChild( content )
      }
    } else {
      output.innerHTML = content
    }
    if( callback ) callback()
    return output
  }
  // UI.mainContent.insert( tool.make( 'div', 'content' ) )
  Object.prototype.insert = function( content, callback ) {
      if ( !typeof content === 'object'  ) content = { html : content }
      content[ 'output' ] = `#${this.id}`;
      tool.insert( content, callback )
  }
  /* ---------------------------------------------------------------------------
  * response
  tool.make( 'button', 'button' ).addEventListener( 'click', (event) => tool.response(event) )
  */
  function response( event, property, response, target, targetProperty, callback ){
    let eventTarget = event.target;
    targetProperty ? target[ targetProperty ] = eventTarget[ property ] : target = eventTarget[ property ]
    if( !application.data.response[ response ] ) application.data.response[ response ] = {}
    application.data.response[ response ][ property ] = eventTarget[ property ]
    if( callback ) callback()
    return application.data.response
  }

  /* ---------------------------------------------------------------------------
  * xhr

  */
  function xhr( args, callback ){
    let xhr = new XMLHttpRequest()
    if( !args ) args = {}
    if( !args.type ) args[ 'type' ] = 'GET'
    if( !args.status ) args[ 'status' ] = 200
    if( !callback ) callback = tool.response;
    xhr.addEventListener( 'load',  ( event ) => {
      if ( xhr.readyState === 4 && xhr.status === args.status ) {
        callback( event, args.property, args.response, args.target, args.targetProperty, args.callback )
      }
    })
    xhr.open( args.type, args.url, true )
    xhr.send( args.data )
  }
  // 'test.json'.xhr()
  String.prototype.xhr = function(args, callback) {
      if( !args ) args = {}
      args[ 'url' ] = this;
      tool.xhr( args, callback )
  }
  /* ---------------------------------------------------------------------------
  * fetchXhr


  let args = {
    // xhr args
    type : 'GET',
    url : 'test.json',
    status : 200,
    // callback args
    response : 'application.data.response.test',
    property : 'responseText',
    target : document.querySelector( '#response' ),
    target_property : 'innerText',
    callback : () => {
      let response = JSON.parse( application.data.response.test.responseText )
      console.log( response.glossary.title )
    }
  }
  tool.xhr( args , tool.response )
  tool.fetchXhr( args ).then( tool.response )
  */
  function fetchXhr( args ) {
    if( !args ) args = {}
    if( !args.type ) args[ 'type' ] = 'GET'
    if( !args.status ) args[ 'status' ] = 200
    return new Promise( ( resolve, reject ) => {
      let xhr = new XMLHttpRequest()
      xhr.open( args.type, args.url )
      xhr.onload = ( event ) => xhr.status === args.status ? resolve( event ) : reject( Error( event ) )
      xhr.send( args.data )
    })
  }


  const formData = ( form ) => {
    let data = {},
    formData = new FormData( form )
    for( let item of formData.entries() ) data[ item[0] ] = item[1]
    return data
  }
  /*
  let form = document.getElementById('form');
  form.addEventListener( 'submit', (event) =>{
    let formData = form.formData()
  })

  */
  Object.prototype.formData = function() {
      tool.formData( this )
  }

  /* ---------------------------------------------------------------------------
  * get
  */
  // let arr = [ { id : 1 , text : 'test' }, { id : 2 , text : 'test' } ]
  // let item = tool.get( { data : arr, val : 1 })
  const get = ( args ) => {

    let data = args.data, key;
    args.key ? key = args.key : key = 'id'
    for( let item of data ){
      let match = (pointer) => isNaN( pointer ) ?  item[ key ] : item[ key ]/1
      if( match( args.val ) === args.val ) return item
    }
  }
  /* let arr = [ { id : 1 , text : 'test' }, { id : 2 , text : 'test' } ]
  let item = arr.get( 1 ) */
  Array.prototype.get = function( args ) {
      if( typeof args !== 'object' ) args = { match : args }
      args[ 'data' ] = this
      tool.get( args )
  }

  const getAll = ( args ) => {
    let data = args.data, key, arr = []
    args.key ? key = args.key : key = 'id'
    for( let item of data ){
      if( args.match.indexOf('>') ){
        if( item[ key ]/1 > args.match.slice(1)/1 ) arr.push( item )
      }else if ( args.match.indexOf('<') ) {
        if( item[ key ]/1 < args.match.slice(1)/1 ) arr.push( item )
      } else {
        let match = (pointer) => isNaN( pointer ) ?  item[ key ] : item[ key ]/1
        if( match( args.match ) === args.match ) arr.push( item )
      }
    }
    arr = new Set( arr )
    return arr
  }

  Array.prototype.getAll = function( args ) {
      if( typeof args !== 'object' ) args = { match : args }
      args[ 'data' ] = this
      tool.getAll( args )
  }
  /* ---------------------------------------------------------------------------
  * test
  */

  const test = ( args, callback ) =>{
    console.log( args )
    if (callback) callback()
  }
  String.prototype.test = function( callback ) {
    tool.test( this, callback )
  }

  /* ---------------------------------------------------------------------------
  *
  */
  return {
    make : make,
    insert : insert,
    response : response,
    xhr : xhr,
    fetchXhr : fetchXhr,
    formData : formData,
    test : test,
  }
})()
const _ = tool
'test'.test()
