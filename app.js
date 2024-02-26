const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const path = require('path')
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

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
  response.send(playersList)
})
