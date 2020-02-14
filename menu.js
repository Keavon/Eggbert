
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
