# Local sensor dependencies

- **MediaPipe Tasks Vision 1.1.1**, Apache-2.0, Google. Original npm package:
  https://registry.npmjs.org/@mediapipe/tasks-vision/-/tasks-vision-1.1.1.tgz
  [Official Web pose documentation](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/web_js).
  The bundled named exports are exposed on `self.HAGEN_VISION` for a classic
  worker; the supplied WASM files are unmodified.
- **MediaPipe Pose Landmarker Lite, float16, version 1**, Google:
  https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task
- **vosk-browser 0.0.8**, Apache-2.0, Christian Corey and contributors:
  https://registry.npmjs.org/vosk-browser/-/vosk-browser-0.0.8.tgz
  [Library source and usage](https://github.com/ccoreilly/vosk-browser).
  The bundled JavaScript and its embedded notices are unmodified.
- **vosk-model-small-en-us-0.15**, Apache-2.0, Alpha Cephei:
  https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
  [Official model list and license](https://alphacephei.com/vosk/models).
  Model files are unmodified and repackaged as a standard USTAR gzip archive
  with directory entries for the browser's local model loader.
- Standard Bluetooth Heart Rate service via
  [Web Bluetooth](https://developer.chrome.com/docs/capabilities/bluetooth).

The Apache-2.0 license is included as `APACHE-2.0.txt`. Original library notices
remain embedded in their JavaScript. Asset hashes and sizes are in `manifest.json`.
`source/fetch_embodied_assets.py` reproduces the model and package preparation.
