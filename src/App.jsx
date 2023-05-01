import { useEffect, useRef, useState } from 'react'
import sound from './assets/JOD.mp3'
// import arduino from './arduino'
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


  // holds state 1-> focus , 0-> reset basically what user is on
  const [current,changeCurrent]=useState(true);
  
 
  const [webWorker,changeWebWorker]=useState(-1);
  const [timeout,ctimeout]=useState(-1);


  function startTimer(){
    const worker=new Worker('./worker.js');
    changeWebWorker((prev)=>worker);
    worker.onmessage=(event)=>{
     
      const ele = document.querySelector("#kal");
      ele.textContent=`${Math.floor(event.data.val/60)} : ${event.data.sec.toString().padStart(2,'0')}`;
    }

    worker.postMessage({action:'start',val:val});
    // worker.terminate();
      ctimeout(setTimeout(()=>{
        // if sound is not already playing -> play song and stop playing it after 36 secs
          if(soundPlay==false){
            changeSoundPlay(true);
            audioTag.current.volume=0.40;
            audioTag.current.play().then(x=>console.log(`🎉🥳🎉`)).catch((x)=>console.log('error playing song'));

            // audio will stop playing afeter 36 secs
            setTimeout(()=>{
              audio.currentTime=0;
              audio.pause();
              changeSoundPlay(false);
            },36000); 
          }
          worker.terminate();

          changeWebWorker(-1);
          const ele = document.querySelector("#kal");
          ele.textContent=`${Math.floor((current?focusTime:restTime)/60)} : 00`;
          cval(()=>{
              if(current){
                return focusTime;
              }
              else{
                return restTime;
              }
            });
        
           

      },1000*(current?focusTime:restTime)));

  }
// 'val' reset to focusTime or restTime depending on the 'current' which indicate the time we ran i.e is it focus one or rest
// then reset timer state to -1 indicating the interval is cleared and un disable the start btn now
  function resetTime(){
     clearTimeout(timeout);
      ctimeout(-1);
      const ele = document.querySelector("#kal");
      ele.textContent=`${Math.floor((current==1?focusTime:restTime)/60)} : 00`;

      if(webWorker!=-1)
      webWorker.terminate();
      
      changeWebWorker(-1);
  }
  
  
  return (
    <div className={current==1 && webWorker!=-1? 'doro dim':'doro'}>
      <audio src={sound} ref={audioTag}></audio>
      <div className='breakFocusbtns'>
        {/* onClick val state set to focus time and current state changes indicating we are on focus */}
        <button onClick={(e)=>{
          document.querySelector('#kal').textContent=`${Math.floor(focusTime/60)} : 00`;
              changeCurrent(true);
              cval(focusTime);
              if(webWorker!=-1)
              webWorker.terminate();
              clearTimeout(timeout);
      ctimeout(-1);
              changeWebWorker(-1);
              }} className={current?'focusedOn':''} >
          <p>Focus</p>
          {/* handled -ve value , if user puts in negative val -> 0 it, if current==1 i.e user is on focus then we can update val state as the value changes same with below break section's ip */}
          <input type='number' 
                value={Math.floor(focusTime/60)} 
                onChange={(e)=>{
                  if(e.target.value <25)
                  {return;}
                  setFocusTime((e.target.value)*60);
                  cval(((e.target.value)*60));
                  }}></input>
        </button>

        <button onClick={
              (e)=>{
                document.querySelector('#kal').textContent=`${Math.floor(restTime/60)} : 00`;
                cval(restTime);
                changeCurrent(false);
                if(webWorker!=-1)
              webWorker.terminate();
              clearTimeout(timeout);
              ctimeout(-1);
              changeWebWorker(-1);
              }}
              className={current==0?'focusedOn':''}>
          <p>Break</p>
          <input type='number' value={Math.floor(restTime/60)} onChange={(e)=>{if(e.target.value <5){return;}setRestTime((e.target.value)*60); if(current==0){cval(((e.target.value)*60))}}}></input>
        </button>
      </div>
      <div className='timer'>
        <h3 id='kal'>{Math.floor(val/60)} : 00</h3>
       
      </div>

      <div className='startBtns'>
        {/* on Click start the timer and once it start disable that start btn to avoid spam and multiple event registers */}
      <button onClick={()=>{
          startTimer();
        }} disabled={webWorker!=-1}>START</button> 
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
