'use strict'
/*
* assets/js/application.js
*/
const application = (() => {

  const init = () => {
    application.route()
    application.nav()
    if( config.debug ) debug()
  },
  route = ( endpoint ) => {
    if( !endpoint ) endpoint = config.endpoint()
    if( endpoint === '' ) endpoint = config.default
    if( typeof endpoint === 'object' ) endpoint = endpoint.newURL.split( '#' )[1]
    const pointer = endpoint.split( '/' )[2]
    if( pointer !== '' ) endpoint = `${endpoint.split( '/' )[0]}/${endpoint.split( '/' )[1]}`
    try {
      for( let module of config.modules() ) {
        if( module.route === endpoint ){
          if( !module.preventLoad ) application.load( endpoint )
          try{
            ( () => { module.action( pointer ) } )()
          }catch( error ){
            console.error( `application.route ${module}(${pointer}) error : ${error}`)
          }
        }
      }
    }catch(error){
      console.error( `application.route (${endpoint}) error : ${error}` )
      // encountered fatal error with module (endpoint) undefined in config / application undefined in module
      // about 4 % chance this happens (1 in 25 - 30) randomly

      setTimeout(function(){ location.reload() }, 3000);
    }
  },
  load = ( endpoint ) => {
    if( endpoint === application.data.endpoint ) return
    if( !endpoint ) endpoint = config.endpoint

    let pointer = endpoint.split( '/' )[2]
    if( pointer !== '' ) endpoint = `${endpoint.split( '/' )[0]}/${endpoint.split( '/' )[1]}`

    let args = {
      url : `pages/${endpoint}.html`,
      property : 'responseText',
      response : 'page',
      callback : () => {
        UI.mainContent.innerHTML = application.data.response[ args.response ][ args.property ]
      }
    }
    application.data.endpoint = endpoint;
    tool.xhr( args, tool.response )
    window.onhashchange = route
  },
  nav = ( items ) => {
    if( !items ) items = config.modules();
    let nav = []
    for( let item of items ){
      if( item.nav ){
        nav.push( { label : item.label, href : `#${item.route}`} )
      }
    }
    application.data.nav = nav;
    UI.nav( nav )
  },
  debug = () => {
    for( let item of config.debugItems() ) console.log( item )
  }
  const data = {
    endpoint : undefined,
    response : {},
    store: {},
    nav : []
  }
  return {
    init : init,
    route : route,
    load : load,
    nav : nav,
    data : data
  }
})()

/*
* tool
*/
const tool = (function() {
  /* ---------------------------------------------------------------------------
  * make
  tool.make( [ 'div', { id : 'id', class : 'class'}, 'this is a ', [ 'a', { href : 'https://developer.mozilla.org/' }, 'link' ] ] )
  */
  function make( tag, callback ){
    const isArray = ( array ) => Object.prototype.toString.call( array ) === '[object Array]'
    if ( !isArray( tag ) ) return make.call( this, Array.from( arguments ) )
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
    let output, main = UI.main()
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

  const checkObj = function( obj ) {
    if( !obj ) {
      console.warn( 'tool.overview : args.object is undefined' )
      return
    } else if ( !typeof obj === 'object' ) {
      console.warn( 'tool.overview : args.object is not a object' )
      return
    }
  }

  Object.prototype.checkObj = function() {
      tool.checkObj( this )
  }

  /* ---------------------------------------------------------------------------
  * get
  */
  // let arr = [ { id : 1 , text : 'test' }, { id : 2 , text : 'test' } ]
  // let item = tool.get( { data : arr, match : 1 })
  const get = ( args ) => {

    let data = args.data, key;

    args.key ? key = args.key : key = 'id'
    for( let item of data ){
      let match = (pointer) => isNaN( pointer ) ?  item[ key ] : parseInt( item[ key ] )
      if( match( args.match ) === args.match ) return item
    }
  }
  /* let arr = [ { id : 1 , text : 'test' }, { id : 2 , text : 'test' } ]
  let item = arr.get( 1 ) */
  Array.prototype.get = function( args ) {
      if( typeof args !== 'object' ) args = { match : args }
      args[ 'data' ] = this
      get( args )
  }

  const getAll = ( args ) => {
    let data = args.data, key, arr = []
    args.key ? key = args.key : key = 'id'
    for( let item of data ){
      if( args.match.indexOf('>') ){
        if( parseInt( item[ key ] ) > parseInt( args.match.slice(1) ) ) arr.push( item )
      }else if ( args.match.indexOf('<') ) {
        if( parseInt( item[ key ] ) < parseInt( args.match.slice(1) ) ) arr.push( item )
      } else {
        let match = (pointer) => isNaN( pointer ) ?  item[ key ] : parseInt( item[ key ] )
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
  * parse
  */
  const parse = ( args, callback ) => {
    const args = [].slice.call(arguments, 1),i = 0;
    return str.replace(/%s/g, () => args[i++]);
  }
  /* ---------------------------------------------------------------------------
  * test
  */

  const test = ( args, callback ) => {
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
    get : get,
    getAll : getAll,
    parse : parse,
    test : test,
  }
})()
/*
* assets/js/UI.js
*/
const UI = (function(){
  let body = () => document.querySelector( 'body' ),
  header = () => body().querySelector( 'header' ),
  headerNav = () => header().querySelector( 'nav' ),
  main = () => body().querySelector( 'main' ),
  mainNav = () => main().querySelector( 'nav' ),
  mainContent = () => main().querySelector( config.output ),
  /* ---------------------------------------------------------------------------
  * template
  */
  template = ( args, callback ) => {
    const _ = tool;
    let endpoint = config.endpoint;
    if( args.template ){

    }else{

    }
    if( typeof args === 'function' ) callback = args;
    if( callback ) callback()
  },
  /* ---------------------------------------------------------------------------
  * form
  let objInst = new Entity;
  let form = tool.form( { object : objInst } )
  */
  form = ( args, callback ) => {
    const _ = tool;
    let obj = args.object;
    if( !obj ) {
      console.warn( 'tool.form : args.object is undefined')
      return
    }
    let objProps = Object.getOwnPropertyNames( obj ),
    form = _.make( 'form' )
    for( let prop of objProps ){
      // TODO : multifield row alternative
      let formGroup = _.make( 'div', { id : `form_group_${prop}`, class : 'form-group row' } ),
      label = _.make( 'label', { for : prop, class : 'col-sm-2 col-form-label' } ),
      formCol = _.make( 'div', { class : 'col-sm-10 col-input' } ),
      hidden = false,
      inputType;
      prop.indexOf( 'content' ) > 0 ? inputType = 'textarea' : inputType = 'input';
      let input = _.make( inputType, { id : `form_input_${prop}`, class : 'form-control', name : prop } )
      if( inputType === 'textarea' ) input.setAttribute( 'rows', '5' )
      if( prop.indexOf( 'date' ) > 0 ) input.setAttribute( 'class', 'form-control date' )
      if( prop.indexOf( 'email' ) > 0 ) input.setAttribute( 'class', 'form-control email' )
      if( prop.indexOf( 'id' ) > 0 ) {
        input.setAttribute( 'type', 'hidden' )
        hidden = true
      }
      typeof obj.labels() !== 'undefined' ? label.innerHTML = obj.labels()[ prop ] : label.innerHTML = prop;
      formGroup.appendChild( label )
      formGroup.appendChild( formCol )
      hidden ? form.appendChild( input ) : form.appendChild( formGroup )
    }
    let button = _.make( 'button', { class : 'btn btn-primary' } )
    if( typeof args === 'function' ) callback = args;
    if( callback ) callback()
    return form
  }
  /*
  let objInst = new Entity;
  let form = objInst.form()
  */
  Object.prototype.form = function( args, callback ) {
      if( !args ) args = {}
      args[ 'object' ] = this;
      UI.form( args, callback )
  }
  /* ---------------------------------------------------------------------------
  * nav
  */
  let nav = ( args, callback ) => {
    const _ = tool,
    ul = _.make( [ 'ul' ] ),
    items = args;
    for( let item of items ){
      ul.appendChild( _.make( ['li', [ 'a', { href : item.href }, item.label ] ] ) )
      if( item.children ){

      }
    }
    headerNav().appendChild(ul)
    if( typeof args === 'function' ) callback = args;
    if( callback ) callback()
  }
  /* ---------------------------------------------------------------------------
  * overview
  */
  let overview = ( args, callback ) => {
    const _ = tool
    const obj = args.object
    _.checkObj( obj )
    if( args.debug || config.debug ) console.log( obj )
    let objProps = Object.getOwnPropertyNames( obj ),
    overview = _.make( 'table' ),
    overviewHeader = _.make( 'thead' ),
    overviewHeaderRow = _.make( 'tr' ),
    overviewBody = _.make( 'tbody' );
    for( let prop of objProps ){
      if( args.headers ){
        overviewHeaderRow.appendChild( _.make( 'th', args.headers[ prop ] ) )
      } else {
        obj.labels() ? overviewHeaderRow.appendChild( _.make( 'th', obj.labels()[ prop ] ) ) : overviewHeaderRow.appendChild( _.make( 'th',  prop ) )
      }
    }
    if( typeof args === 'function' ) callback = args
    if( callback ) callback()
    return overview
  }
  /*
  let objInst = new Entity;
  let overview = objInst.overview()
  */
  Object.prototype.overview = function( args, callback ) {
      if( typeof args === 'function' ) callback = args
      if( !args ) args = {}
      args[ 'object' ] = this;
      tool.overview( args, callback )

  }
  /* ---------------------------------------------------------------------------
  * view
  */
  let view = ( args, callback ) => {

    if( typeof args === 'function' ) callback = args;
    if( callback ) callback()
  }
  /* ---------------------------------------------------------------------------
  * insert
  */
  let create = ( args, callback ) => {

    if( typeof args === 'function' ) callback = args;
    if( callback ) callback()
  }
  /* ---------------------------------------------------------------------------
  * update
  */
  let edit = ( args, callback ) => {

    if( typeof args === 'function' ) callback = args;
    if( callback ) callback()
  }
  /* ---------------------------------------------------------------------------
  * delete
  */
  let remove = ( args, callback ) => {

    if( typeof args === 'function' ) callback = args;
    if( callback ) callback()
  }
  return {
    header : header,
    headerNav : headerNav,
    main : main,
    mainNav : mainNav,
    mainContent : mainContent,
    template : template,
    form : form,
    nav : nav,
    overview : overview,
    view : view,
    edit : edit,
    remove : remove
  }
})()
