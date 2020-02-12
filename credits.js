
const CREDITS =
"WOW\
SO MANY CREDITS\
CRAZY\n\
unbelievable";

let pause = false;

function rollCredits(delta){
  if(!pause){
    pause = true;
  }
  context.font = "30px Comic Sans MS";
  context.fillStyle = "red";
  context.textAlign = "center";
  context.fillText(CREDITS, 0, 0);
}
