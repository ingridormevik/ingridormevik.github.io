const futureText = "In 2040, this stop plays memories left by strangers.";
const story = document.querySelector("#story");
const button = document.querySelector("#future");

button.addEventListener("click", () => {
  story.textContent = futureText;
});
