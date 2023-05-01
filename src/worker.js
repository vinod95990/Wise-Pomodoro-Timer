let interval = null;
onmessage = (event) => {
  if (event.data.action == "start") {
    let val = event.data.val;
    let sec = 0;
    interval = setInterval(() => {
      val -= 1;
      sec = sec - 1 < 0 ? 59 : sec - 1;
      postMessage({ val, sec });
    }, 1000);
  } else {
    clearInterval(interval);
    interval = null;
  }
};
