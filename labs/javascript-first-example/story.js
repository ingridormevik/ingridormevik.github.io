const story = document.querySelector("#story");
const button = document.querySelector("#future");

function revealStory() {
  story.textContent = "Someone else remembers this place differently.";
}

button.addEventListener("click", revealStory);
