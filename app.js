const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const path = require('path')
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
app.use(express.json())

const initializingDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializingDBAndServer()

const convertDBObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
        SELECT 
        *
        FROM 
        cricket_team
        ORDER BY 
        player_id
    `
  const playersList = await db.all(getPlayersQuery)
  response.send(
    playersList.map(eachPlayer => {
      return convertDBObjectToResponseObject(eachPlayer)
    }),
  )
})

app.post('/players/', async (request, response) => {
  const bodyDetails = request.body
  const {playerName, jerseyNumber, role} = bodyDetails
  const postPlayerDetailsQuery = `
    INSERT INTO 
    cricket_team(player_name, jersey_number, role)
    VALUES(?, ?, ?);
  `
  const dbResponse = await db.run(postPlayerDetailsQuery, [
    playerName,
    jerseyNumber,
    role,
  ])
  reponse.send('Player Added to Team')
})

app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT 
    * 
    FROM 
    cricket_team
    WHERE 
    player_id = ?
  `
  const dbResponse = await db.get(getPlayerQuery, [playerId])
  response.send(
    dbResponse.map(player => convertDBObjectToResponseObject(player)),
  )
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const bodyDetails = request.body
  const {playerName, jerseyNumber, role} = bodyDetails
  const updateQuery = `
    UPDATE 
    cricket_team
    SET 
    player_name = ${playerName},
    jersey_number = ${jerseyNumber},
    role = ${role}
    WHERE 
    player_id = ${playerId}
  `
  const dbResponse = await db.run(updateQuery)
  response.send('Player Details Updated')
})

app.delete('players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    DELETE FROM 
    cricket_team
    WHERE 
    player_id = ${playerId}
  `
  const dbResponse = await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
