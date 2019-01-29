'use strict'
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
    let endpoint = config.endpoint
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
      tool.form( args, callback )
  }
  /* ---------------------------------------------------------------------------
  * nav
  */
  let nav = ( args, callback ) => {
    if( typeof args === 'function' ) callback = args;
    if( callback ) callback()
  }
  /* ---------------------------------------------------------------------------
  * overview
  */
  let overview = ( args, callback ) => {
    const _ = tool;
    let obj = args.object;
    if( !obj ) {
      console.warn( 'tool.overview : args.object is undefined' )
      return
    }
    if( args.debug || config.debug ) console.log( obj )
    let objProps = Object.getOwnPropertyNames( obj ),
    overview = _.make( 'table' ),
    overviewHeader = _.make( 'thead' ),
    overviewHeaderRow = _.make( 'tr' ),
    overviewBody = _.make( 'tbody' )
    for( let prop of objProps ){
      if( args.headers ){
        overviewHeaderRow.appendChild( _.make( 'th', args.headers[ prop ] ) )
      } else {
        typeof obj.labels() !== 'undefined' ? overviewHeaderRow.appendChild( _.make( 'th', obj.labels()[ prop ] ) ) : overviewHeaderRow.appendChild( _.make( 'th',  prop ) )
      }
    }
    if( typeof args === 'function' ) callback = args;
    if( callback ) callback()
    return overview
  }
  /*
  let objInst = new Entity;
  let overview = objInst.overview()
  */
  Object.prototype.overview = function( args, callback ) {
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
