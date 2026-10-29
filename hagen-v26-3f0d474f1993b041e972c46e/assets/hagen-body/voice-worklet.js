// Only live PCM is transferred to the local recognizer. Never connected audibly.
class HagenVoiceCapture extends AudioWorkletProcessor{
 constructor(){super();this.buffer=new Float32Array(4096);this.at=0;this.pending=0;
  this.port.onmessage=({data})=>{if(data==='ack')this.pending=Math.max(0,this.pending-1);};}
 process(inputs,outputs){
  for(const output of outputs)for(const channel of output)channel.fill(0);
  const input=inputs[0]?.[0];if(!input)return true;
  for(let i=0;i<input.length;i++){this.buffer[this.at++]=input[i];if(this.at===4096){
   // A slow decoder drops live audio instead of building an unbounded queue.
   if(this.pending<5){const buffer=this.buffer;this.port.postMessage(buffer,[buffer.buffer]);this.pending++;this.buffer=new Float32Array(4096);}this.at=0;
  }}return true;
 }
}
registerProcessor('hagen-voice-capture',HagenVoiceCapture);
