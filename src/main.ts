// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  push,
  ref,
  remove,
  set,
} from "firebase/database";
import { drawPlayer, type Player } from "./Player";
import { lerp } from "./utils";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmb2kZD78KtFFJHgMk2Gi-XJBL1IQEDus",
  authDomain: "player-b6d49.firebaseapp.com",
  databaseURL: "https://player-b6d49-default-rtdb.firebaseio.com",
  projectId: "player-b6d49",
  storageBucket: "player-b6d49.firebasestorage.app",
  messagingSenderId: "971160369335",
  appId: "1:971160369335:web:eaf98a801b7f7460f5b532",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

var initApp = function () {
  const canvas = document.getElementById("game-view")! as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;

  var canvasWidth = canvas.width;
  var canvasHeight = canvas.height;

  var storedPlayers: Map<string, Player> = new Map();
  var newStoredPlayers: Map<string, Player> = new Map();
  var myPlayer: Player = {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    radius: 10,
  };

  const playersRef = ref(db, "players");
  const myPlayerRef = push(playersRef);
  storedPlayers.set(myPlayerRef.key, myPlayer);
  newStoredPlayers.set(myPlayerRef.key, myPlayer);
  set(myPlayerRef, myPlayer);

  var keyUp = false;
  var keyDown = false;
  var keyLeft = false;
  var keyRight = false;

  let hasMoved = false;

  const frameRate = 30;
  const timeStep = 1 / frameRate;

  onChildAdded(playersRef, (data) => {
    storedPlayers = new Map(newStoredPlayers);
    if (data.key) newStoredPlayers.set(data.key, data.val());
  });
  onChildChanged(playersRef, (data) => {
    storedPlayers = new Map(newStoredPlayers);
    if (data.key) newStoredPlayers.set(data.key, data.val());
  });
  onChildRemoved(playersRef, (data) => {
    if (data.key) newStoredPlayers.delete(data.key);
    storedPlayers = new Map(newStoredPlayers);
  });
  set(myPlayerRef, myPlayer);

  // Creates/updates a player in the database
  var updatePlayer = function (player: Player) {
    player.x += (keyRight ? 1 : 0) - (keyLeft ? 1 : 0);
    player.y += (keyDown ? 1 : 0) - (keyUp ? 1 : 0);
  };

  // Displays all stored players on the canvas
  var displayPlayers = function () {
    for (let key of storedPlayers.keys()) {
      let oldPlayer = storedPlayers.get(key)!;
      let newPlayer = newStoredPlayers.get(key)!;

      oldPlayer.x = lerp(oldPlayer.x, newPlayer.x, timeStep);
      oldPlayer.y = lerp(oldPlayer.y, newPlayer.y, timeStep);

      if (key == myPlayerRef.key) {
        drawPlayer(myPlayer, true);
      } else {
        drawPlayer(oldPlayer, false);
      }
    }
  };

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "w") keyUp = true;
    if (event.key.toLowerCase() === "s") keyDown = true;
    if (event.key.toLowerCase() === "a") keyLeft = true;
    if (event.key.toLowerCase() === "d") keyRight = true;
  });

  window.addEventListener("keyup", (event) => {
    if (event.key.toLowerCase() === "w") keyUp = false;
    if (event.key.toLowerCase() === "s") keyDown = false;
    if (event.key.toLowerCase() === "a") keyLeft = false;
    if (event.key.toLowerCase() === "d") keyRight = false;
  });

  let start: DOMHighResTimeStamp | undefined;

  function animate(timestamp: DOMHighResTimeStamp) {
    if (start === undefined) {
      start = timestamp;
    }

    const elapsed = timestamp - start;

    hasMoved = hasMoved || keyUp || keyDown || keyLeft || keyRight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    updatePlayer(myPlayer);

    // Send updates to the database about our player only if we have moved and after a certain amount of time
    if (hasMoved && elapsed > timeStep) {
      set(myPlayerRef, myPlayer);
      start = undefined;
      hasMoved = false;
    }

    displayPlayers();
    requestAnimationFrame(animate);
  }

  window.onbeforeunload = () => {
    remove(myPlayerRef);
  };

  requestAnimationFrame(animate);
};

window.addEventListener("DOMContentLoaded", initApp);
window.addEventListener("resize", () => {
  const canvas = document.getElementById("game-view")! as HTMLCanvasElement;

  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
});
