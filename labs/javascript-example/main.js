runOnStartup(runtime => {
  runtime.addEventListener("beforeprojectstart", () => {
    runtime.objects.Text.getFirstInstance().text =
      "I hear rain at the bus stop. What could this place become?";
  });
});
