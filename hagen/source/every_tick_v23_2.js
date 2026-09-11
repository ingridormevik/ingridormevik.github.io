// HAGEN V23.2. Paste ONLY this code into Every tick.
// Import hagen-engine-v23-2.js into Project Bar > Files. Use worker OFF.
const boot = globalThis.HAGEN_BOOT_232 ||= { state: "idle" };
boot.runtime = runtime;
if (boot.state === "idle") {
  boot.state = "loading";
  boot.fail = error => {
    if (boot.state === "error") return;
    boot.state = "error";
    boot.error = String(error?.message || error);
    console.error("HAGEN V23.2:", error);
    globalThis.HAGEN?.dispose?.();
    if (typeof document === "undefined") return;
    const notice = document.createElement("div");
    notice.setAttribute("role", "alert");
    notice.style.cssText = "position:fixed;inset:20px;z-index:2147483647;background:#08111c;color:#fff;padding:24px;font:18px/1.5 sans-serif;overflow:auto";
    notice.textContent = "HAGEN could not start. Import hagen-engine-v23-2.js into Project Bar > Files, keep Use worker OFF, then restart Preview. " + boot.error;
    document.body.appendChild(notice);
  };
  (async () => {
    if (typeof document === "undefined") throw new Error("Set Use worker to OFF.");
    if (!runtime.assets?.loadScripts) throw new Error("Construct AssetManager is unavailable.");
    await runtime.assets.loadScripts("hagen-engine-v23-2.js");
    if (typeof globalThis.HAGEN_ENGINE_232?.start !== "function") throw new Error("The engine file is missing or has the wrong version.");
    globalThis.HAGEN_ENGINE_232.start(boot.runtime);
    boot.state = "ready";
  })().catch(boot.fail);
} else if (boot.state === "ready") {
  try { globalThis.HAGEN.tick(runtime); } catch (error) { boot.fail(error); }
}
