
document.addEventListener("DOMContentLoaded", menu);

function menu(){
  // console.log("hello");
  document.querySelector("#play").addEventListener("click", startGame);
  document.querySelector("#credits").addEventListener("click", rollCredits);
}

function startGame(){
  document.querySelector(".menu").classList.add("hidden");
  document.querySelector("canvas").classList.remove("hidden");
  setup();
}

function rollCredits(){
  // window.location.href = './credits.html';
  document.querySelector("canvas").classList.add("hidden");
  document.querySelector(".menu").classList.add("hidden");
  document.querySelector(".credits").classList.remove("hidden");
}
