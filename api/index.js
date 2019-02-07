"use strict";

const api = (function(){

  const mysql = require( 'mysql' )
  const express = require( 'express' )
  const app = express()
  const bodyParser = require( 'body-parser' )
  const server = app.listen(8081, function() {
    console.log("API listening at http://%s:%s", server.address().address, server.address().port)
  })
  app.use( bodyParser.json() )
  app.use( function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
  })
  // config
  const config = {
    db : {
      host: '185.87.187.148',
      user: 'robkai1q_molvenodb',
      password: 'mcrajmolveno2019',
      database: 'robkai1q_molvenodb'
    },
    tables : {
      { table : 'reservations', key : 'id' },
      { table : 'tables', key : 'id' },
    }
  }
  const connection = mysql.createConnection( config.db ),

  // init
  for( let table of config.tables ) {
    for ( let action of Object.getOwnPropertyNames( api ) ) api[ action ]( table )
  }
  /* -----------------------------------------------------------------------------
  * api.get
  */
  // api.get( { table : 'tables'[, key : 'id'] } )
  const get = function( args, callback ){
    const table = args.table,
    key = args.key
    if( !key )
    if( key ){
      app.get( `/api/${table}/:${key}`, function( req, res ) {

        let pointer = +req.params[ key ]
        // bad request
        if( pointer.indexOf( '=' ) ){
          res.setHeader('Content-Type', 'application/json')
          res.status(400).end()
          return
        }
        connection.query(`SELECT * FROM ${table} where ${key}=?`, pointer, ( err, rows ) => {
          if (!err) {
            let record = rows[0];
            res.setHeader('Content-Type', 'application/json')
            record ? res.end(JSON.stringify( record ) ) : res.status(404).end()
          } else {
            throw err
          }
        })
      })
    } else {
      app.get(`/api/${table}`, function(req, res) {

        res.setHeader('Content-Type', 'application/json')

        connection.query(`SELECT * FROM ${table}`, ( err, records ) => {
          if (!err) {
            res.end( JSON.stringify(records) )
          } else {
            throw err
          }
        })
      })
    }
    if( callback ) callback()
  }
  /* -----------------------------------------------------------------------------
  * api.put
  */

  const put = function( args, callback ){
    const table = args.table,
    fields = args.fields,
    key = args.key;

    app.put( `/api/${table}/:${key}`, function( req, res ) {

      let pointer = +req.params[ key ]
      // bad request
      if( pointer.indexOf( '=' ) ){
        res.setHeader('Content-Type', 'application/json')
        res.status(400).end()
        return
      }

      let body = req.body
      let query = `UPDATE ${table} SET `
      let query_fields = []
      for( let field in fields ){
        query += `${fields[field]} = ?`
        if( field < fields.length ) query += ','
        query_fields.push( body[ fields[ field ] ])
      }
      query += `WHERE ${key} = ?`
      query_fields.push( pointer )
      connection.query( query, query_fields, ( err, result ) => {
        if (!err) {
          connection.query(`SELECT * FROM ${table} where ${key}=?`, [ pointer ], ( err, rows ) => {
            if (!err) {
              let table = rows[0]
              if (table) {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(table))
              } else {
                res.setHeader('Content-Type', 'application/json')
                res.status(404).end()
              }
            } else {
              throw err
            }
          })
        }else {
          throw err
        }
      })
    })
    if( callback ) callback()
  }

  /* -----------------------------------------------------------------------------
  * api.drop
  */
  const drop = function( args, callback ){
    const table = args.table,
    fields = args.fields,
    key = args.key;
    app.delete(`/api/${table}/:${key}`, function( req, res ) {
      let pointer = +req.params[ key ]

      connection.query( `DELETE FROM ${table} WHERE ${key} = ?`, [id], ( err, result ) => {
          if (!err) {
            res.status(204).end();
          }
          else {
            throw err;
          }
        }
      );
    })
    if( callback ) callback()
  }
  return {
    get : get,
    put : put,
    drop : drop
  }
})()
