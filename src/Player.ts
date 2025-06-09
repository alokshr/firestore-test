export type Player = {
  x: number;
  y: number;
  radius: number;
};

export function drawPlayer(player: Player, isSelf = false) {
  let canvas = document.getElementById("game-view") as HTMLCanvasElement;
  let ctx = canvas.getContext("2d")!;

  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
  ctx.fillStyle = isSelf ? "green" : "black";
  ctx.fill();
  ctx.closePath();
}
