const thing = ( function() {
  let thingData = [
    { id : 1, name : 'Bike' },
    { id : 2, name : 'Car' },
    { id : 3, name : 'Truck' },
    { id : 4, name : 'Boat' },
    { id : 5, name : 'Airplane' },
    { id : 6, name : 'Spaceship' }
  ],
  privateVar = () => application.data.store.things[0].name
  const publicVar  = 'Hello Things',
  privateFunction = () => {
    console.log( `Thing: ${privateVar()}` )
  },
  publicSetThing = ( thing ) => {
    privateVar = () => thing
    console.log( `thing.publicSetThing(${privateVar()})` )

  },
  publicGetThing = () => {
    privateFunction()
  }
  (() => {
      application.data.store[ 'things' ] = thingData
  })()
  console.log(application.data.store.things)
  /** reveal methods and variables by assigning them to object     properties */
  return {
    set: publicSetThing,
    greeting: publicVar,
    get: publicGetThing,
    data: thingData
  }
})()
