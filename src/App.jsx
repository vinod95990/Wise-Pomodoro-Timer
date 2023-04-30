import { useEffect, useRef, useState } from 'react'
import sound from './assets/JOD.mp3'
import './App.css'

function App() {
  const audio=new Audio(sound);
  
  const audioTag=useRef();
 
  const [focusTime, setFocusTime] = useState(1500);
  const [restTime, setRestTime] = useState(300);
  
  // true if the audio is playing and turned off to false when audio stops, to avoid user spam start btn with timer 0 val else th sound will start parallely
  const [soundPlay,changeSoundPlay]=useState(false);
  
  // it holds the value which will decrease with interval and update on the DOM
  // if val == 0, then set it to focusTime or restTime depending on the current state
  let [val,cval]=useState(1500);

  // state for seconds if time 300 sec then this will run 59 to 0 then to 59...
  // time is expired using setTimeout, so this state is more like to just display seconds
  const [sec,csec]=useState(0); 
  // holds state 1-> focus , 0-> reset basically what user is on
  const [current,changeCurrent]=useState(true);
  
  // state to hold the 'setInterval' event which decreases value of 'val' every 1s
  // used to clearInterval because now we have assigned it a state
  const [timer,ctimer]=useState(-1);

  //holds timout event which is triggered to reset values and play audio and we are storing
  // it to clear it if user clicks reset
  const [timeout,ctimeout]=useState(-1);
  
// starts the timer which is basically the val state holds
// we updae timer state with that event as it helps us to clear that interval if reset btn is clicked
// more like moving this interval event on top of the scope and we also clear this interval here
// the timer is used only to disable the start btn on the page once an event is started and is used when user clicks reset btn on the page


  function startTimer(){
    //holds event
     let tmpx=setInterval(()=>{
      //decreasing the val state that holds the seonds that is decreasing
      cval(x=> x-1);

      csec((x)=>{
        if(x==0)
          return 59;
        else
        return x-1;
      });
    },1000);

    
      ctimer(tmpx);
      
     
      ctimeout(setTimeout(()=>{
        console.log('Timeout val',val);
        // if sound is not already playing -> play song and stop playing it after 36 secs
          if(soundPlay==false){
            changeSoundPlay(true);
            audioTag.current.volume=0.40;
            audioTag.current.play().then(x=>console.log(`song plays`)).catch((x)=>console.log('error playing song'));

            // audio will stop playing afeter 36 secs
            setTimeout(()=>{
              audio.currentTime=0;
              audio.pause();
              changeSoundPlay(false);
            },36000); 
          }
     
        clearInterval(tmpx);
        ctimer(-1);
        csec(0);
        cval(()=>{
          if(current){
            return focusTime;
          }
          else{
            return restTime;
          }
        });
        
        

      },1000*(current==1?focusTime:restTime)));

  }
// 'val' reset to focusTime or restTime depending on the 'current' which indicate the time we ran i.e is it focus one or rest
// then reset timer state to -1 indicating the interval is cleared and un disable the start btn now
  function resetTime(){
    if(timer!=-1)
    setTimeout(()=>{
      clearInterval(timer);
      clearTimeout(timeout);
      ctimer(-1);
ctimeout(-1);
      csec(0);
      cval(()=>{
        if(current){
          return focusTime;
        }
        else{
          return restTime;
        }
        
      });
    },0);

    ctimer(-1);
  }

  console.log('out-val',val);
  
  return (
    <div className={current==1 && timer!=-1? 'doro dim':'doro'}>
      <audio src={sound} ref={audioTag}></audio>
      <div className='breakFocusbtns'>
        {/* onClick val state set to focus time and current state changes indicating we are on focus */}
        <button onClick={()=>{cval(focusTime);changeCurrent(true);resetTime()}} className={current==1?'focusedOn':''} >
          <p>Focus</p>
          {/* handled -ve value , if user puts in negative val -> 0 it, if current==1 i.e user is on focus then we can update val state as the value changes same with below break section's ip */}
          <input type='number' value={Math.floor(focusTime/60)} onChange={(e)=>{if(e.target.value <25){return;}setFocusTime((e.target.value)*60); if(current==1){cval(((e.target.value)*60))}}}></input>
        </button>

        <button onClick={()=>{cval(restTime);changeCurrent(false)}} className={current==0?'focusedOn':''}>
          <p>Break</p>
          <input type='number' value={Math.floor(restTime/60)} onChange={(e)=>{if(e.target.value <0){return;}setRestTime((e.target.value)*60); if(current==0){cval(((e.target.value)*60))}}}></input>
        </button>
      </div>
      <div className='timer'>
        <h3>{Math.floor(val/60)} : {sec.toString().padStart(2,'0')}</h3>
       
      </div>

      <div className='startBtns'>
        {/* on Click start the timer and once it start disable that start btn to avoid spam and multiple event registers */}
      <button onClick={()=>{
          startTimer();
        }} disabled={timer==-1 ? false:true}>START</button> 
    {/* on Click call resetTime func'*/}
      <button onClick={(e)=>{
         

          resetTime();
        }}>RESET</button> 
      </div>

      {soundPlay && <div className='cancelSound'>
        <button className='blob' onClick={()=>{
          audioTag.current.currentTime=0;
          
          audioTag.current.pause();
          
          changeSoundPlay(false);
        }}>X</button>
      </div>}
    </div>
  )
}

export default App
