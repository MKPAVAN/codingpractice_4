const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

let dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Get players

const convertSnakeCaseToCamelCase = (eachPlayer) => {
  return {
    playerId: eachPlayer.player_id,
    playerName: eachPlayer.player_name,
    jerseyNumber: eachPlayer.jersey_number,
    role: eachPlayer.role,
  };
};

app.get("/players/", async (request, response) => {
  const getBooksQuery = `SELECT * FROM cricket_team ORDER BY player_id;`;
  const playersList = await db.all(getBooksQuery);
  const result = playersList.map((eachPlayer) => {
    return convertSnakeCaseToCamelCase(eachPlayer);
  });
  response.send(result);
});

// Add player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const sqlQuery = `
      INSERT INTO cricket_team (player_name, jersey_number, role)
      VALUES ('${playerName}', '${jerseyNumber}', '${role}');`;

  await db.run(sqlQuery);
  response.send("Player Added to Team");
});

// API 3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const sqlQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;

  const dbResponse = await db.get(sqlQuery);
  const arrayDbResponse = [dbResponse];
  const result = arrayDbResponse.map((eachplayer) => {
    return convertSnakeCaseToCamelCase(eachplayer);
  });
  response.send(result[0]);
});

// API 4

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const sqlQuery = `
    UPDATE 
        cricket_team 
    SET 
        player_name = ${playerName},
        jersey_number = ${jerseyNumber},
        role = ${role}
    WHERE 
        player_id = ${playerId}`;
  await db.run(sqlQuery);
  response.send("Player Details Updated");
});

// API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteSqlQuery = `
        DELETE FROM
            cricket_team
        WHERE
            player_id = ${playerId};`;
  await db.run(deleteSqlQuery);
  response.send("Player Removed");
});

module.exports = app;
