// CPU inference stays off the garden's rendering thread. One frame in flight.
importScripts('vision-worker-bundle.js');
let detector=null;
self.onmessage=async({data})=>{
 if(data.type==='init'){
  try{const {FilesetResolver,PoseLandmarker}=self.HAGEN_VISION;
   detector=await PoseLandmarker.createFromOptions(await FilesetResolver.forVisionTasks(new URL('wasm',self.location.href).href),{
    baseOptions:{modelAssetPath:new URL('pose_landmarker_lite.task',self.location.href).href,delegate:'CPU'},
    runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.55,minPosePresenceConfidence:.55,minTrackingConfidence:.55,outputSegmentationMasks:false});
   postMessage({type:'ready'});
  }catch(error){postMessage({type:'error',message:String(error?.message||error)});}return;
 }
 if(data.type==='frame'){
  try{const start=performance.now(),result=detector?.detectForVideo(data.bitmap,data.time);
   postMessage({type:'pose',time:data.time,points:result?.landmarks?.[0]||[],inferenceMs:performance.now()-start});
  }catch(error){postMessage({type:'error',message:String(error?.message||error)});}finally{data.bitmap?.close();}
 }
};
