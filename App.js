/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */




 // arbitration of movement remaining
import React, { Component } from 'react';
import database from '@react-native-firebase/database'
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Image,
  Dimensions,
  Button,
  TextInput,
} from 'react-native';
import Canvas from 'react-native-canvas'
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes
} from "react-native-sensors";
import { map, filter } from "rxjs/operators";



var x;
var canvas
var tempx
setUpdateIntervalForType(SensorTypes.accelerometer, 500); // defaults to 100ms

class App extends Component {

  constructor(){
  super();
  this.moveRect = this.moveRect.bind(this);
  this.sendData = this.sendData.bind(this);
  this.moveRectGesture= this.moveRectGesture.bind(this);
  this.state = {
   start:0,
   pause:0,
   x:0,
   y:0,
   run:'',
   runCount:0,
   pauseCount:0,
   sendDataInterval:null,
   startMotion:null,
   ctx:null,
   canvasHeight:null,
   interval:null,
   initialDate:null,
   accelerometerX:0.1,
   accelerometerY:0.1,
   timeX:0,
   timeXN:0,
   timeY:0,
   timeYN:0,
   intervalX:null,
   intervalXN:null,
   intervalY:null,
   intervalYN:null,
   reset:0

  };

  }

componentDidMount(){
  canvas = this.refs.canvas
  canvas.width = Dimensions.get('window').width;
  canvas.height = (70/100) * Dimensions.get('window').height;
  this.setState({canvasHeight:canvas.height});
  console.log("canvas width " + canvas.width + " canvas height " + canvas.height);
  console.log("Screen Width and height " + Dimensions.get('window').height + " width" + Dimensions.get('window').width)
  let ctxL = canvas.getContext("2d")
  ctxL.fillStyle = "pink"
  ctxL.fillRect(0,0,canvas.width,canvas.height);
  let runs=0;
  database().ref("Runs").once('value',(snap)=>{
    if(snap.val()!=null){
    snap.forEach((subSnap)=>{
      ++runs;
    })
  }
  }).then(()=>{
    this.setState({runCount:runs});
     console.log("yo")
    let tempRun = "RUN" + runs;
    database().ref("Runs/" + tempRun +"/CO-ORDINATES/Extremes/stop").once('value',(snap)=>{
      if(snap.val()==null)
      {
        database().ref("Runs/" + tempRun +"/CO-ORDINATES/co_ordinates").once('value',(snap)=>{
          let arr = snap.val().co_ordinates;
         let prevCo = arr[arr.length -1];
         console.log(prevCo);
         ctxL.fillStyle = "red";
          ctxL.fillRect(prevCo[0],prevCo[1],20,20);
          this.setState({
            x:prevCo[0],
            y:prevCo[1]
          });
          database().ref("Runs/" + tempRun + "/CO-ORDINATES/Extremes/stop").set({
            stop:prevCo
          });
        })
      }

      else
      {
        let stop = snap.val().stop;
        console.log("Stop coordinates in component did mount ");
        ctxL.fillStyle = "red";
        ctxL.fillRect(stop[0],stop[1],20,20);
        this.setState({
          x:stop[0],
          y:stop[1]
        });
      }
    })

  })
  /*
  ctxL.fillStyle = "red"
  ctxL.fillRect(0,0,20,20);
  */
  let co_ordinates = [[0,0]]
  database().ref('/Movement').set({
    Co_ordinates:co_ordinates
  })

  accelerometer.subscribe(({x,y})=>{
    this.setState({
      accelerometerX:x,
      accelerometerY:y
    })
    //console.log("the value of " + "y  " + y);
  })


  
  this.setState({
    ctx:ctxL
  });
  
  
 
  /*this.setState({
    ctx:ctxL,
    initialDate:new Date(),
    interval:setInterval(()=>{this.moveRect()},1000),
    tenSecDate:new Date()
  });
  */
}


moveRect(){
  
  console.log("in moveRect")
  let prevX = this.state.x;
  let ctxL = this.state.ctx;
  ctxL.width =  Dimensions.get('window').width;
  ctxL.height = Dimensions.get('window').height-50;
  let x = this.state.x; let y=this.state.y;
  let newX = this.state.x; let newY = this.state.y;
  let randX,randY;
  
  
  ctxL.clearRect(x,y,50,50);
  randX = Math.floor(Math.random() *3);
  randY = Math.floor(Math.random() * 3);
  if(randX == 0)
  randX = -30;
  else if(randX ==1)
  randX = 0;
  else if(randX == 2)
  randX = 30;
  if(randY == 0)
  randY = -30;
  else if(randY ==1)
  randY = 0;
  else if(randY == 2)
  randY = 30;
  console.log("X " + randX + " Y " + randY);
  console.log("width " + ctxL.width + " height " + ctxL.height)
  if(x + randX + 20 <= ctxL.width || y + randY + 20 <=ctxL.height){
    if(x+randX <0)
    newX = ctxL.width - 20;
    else if(x+randX + 20 <=ctxL.width)
    newX = x + randX;
    if(y+randY <0)
    newY = ctxL.height - 20;
    else if(y + randY + 20 <=ctxL.height)
    newY = y + randY;
  }
  else{
    if(x + randX + 20 > ctxL.width)
    newX = 0;
    if(y + randY + 20 > ctxL.height)
    newY = 0;
  }
  console.log("newX " + newX + " newY " + newY);
  ctxL.fillRect(newX,newY,20,20);
  let co_ordinates = [newX,newY];
  database().ref("/Movement").once('value').then(snap=>{
    let temp = snap.val().Co_ordinates;
    temp.push(co_ordinates);
    console.log(temp);
    database().ref("/Movement").set({
      Co_ordinates:temp
    })
  })
  this.setState({
    x:newX,
    y:newY
  })

let dateTemp= new Date();

if(dateTemp.getTime() - this.state.tenSecDate.getTime() >=5000){
  this.setState({
    tenSecDate:dateTemp
  })
  console.log("5 secs done");
  console.log("moving x = " + this.state.x  + " and y = " + this.state.y + " to database");
}
if(dateTemp.getTime() - this.state.initialDate.getTime() >=15000){
  clearInterval(this.state.interval)
  console.log("completed 60 seconds");
  setTimeout(()=>{                         //binding is not working here, fix!
    this.setState({
      initialDate:new Date(),
      tenSecDate:new Date(),
      interval:setInterval(()=>{this.moveRect()},1000)
    },()=>{console.log("timeout done, states set")})
  },5000)
}

}


moveRectGesture(){
  console.log("in moveRect");
let ax = this.state.accelerometerX;
let ay = this.state.accelerometerY;
let vx = ax * 400; let vy = ay*400;
vx = (vx/(4*10000) + 1/70);
vy = (vy/(4*10000) + 1/70);
let tx = 5/vx;let ty = 5/vy;
if(tx<0)
tx = -tx;
if(ty<0)
ty=-ty;

if(tx<380){
  if(vx<0){
this.setState({
  intervalX:setInterval(() => {this.movePosX()},tx),
  intervalTimeX:tx,
  timeX:tx
})
}
else if(vx>0){
  this.setState({
    intervalXN:setInterval(() => {this.movePosXN()},tx),
    intervalTimeXN:tx,
    timeXN:tx
  })
  
}

}
if(ty<380){
  if(vy>0){
    this.setState({
      intervalY:setInterval(() => {this.movePosY()},ty),
      intervalTimeY:ty,
      timeY:ty
    })
  }
 else if(vy<0)
 {
  this.setState({
    intervalYN:setInterval(() => {this.movePosYN()},ty),
    intervalTimeYN:ty,
    timeYN:ty
  })
 }
}

}

movePosX(){
  let x;
  if(this.state.x + 5 > Dimensions.get('window').width - 20 )
  x = 0;
  else
  x = this.state.x + 5;

    if(this.state.timeX >= 350)
    clearInterval(this.state.intervalX);
    else{
    let ctxL = this.state.ctx;
    ctxL.fillStyle='pink'
    ctxL.fillRect(this.state.x,this.state.y,20,20);
    ctxL.fillStyle = 'red';
    ctxL.fillRect(x,this.state.y,20,20);
    this.setState({
      x:x,
      timeX: this.state.timeX + this.state.intervalTimeX
    })
    }

    
}

movePosXN(){
  let x;
  if(this.state.x - 5 < 0 )
  x = Dimensions.get('window').width-20;
  else
  x = this.state.x - 5;

    if(this.state.timeXN >= 350)
    clearInterval(this.state.intervalXN);
    else{
    let ctxL = this.state.ctx;
    ctxL.fillStyle='pink'
    ctxL.fillRect(this.state.x,this.state.y,20,20);
    ctxL.fillStyle = 'red';
    ctxL.fillRect(x,this.state.y,20,20);
    this.setState({
      x:x,
      timeXN: this.state.timeXN + this.state.intervalTimeXN
    })
    }

    
}

movePosY(){
  let y;
  if(this.state.y + 5 > this.state.canvasHeight - 20)
  y=0;
  else
  y = this.state.y +5;
  
  if(this.state.timeY >= 350)
  clearInterval(this.state.intervalY);
  else{
  let ctxL = this.state.ctx;
  ctxL.fillStyle='pink'
  ctxL.fillRect(this.state.x,this.state.y,20,20);
  ctxL.fillStyle = 'red';
  ctxL.fillRect(this.state.x,y,20,20);
  this.setState({
    y:y,
    timeY: this.state.timeY + this.state.intervalTimeY
  })
  }
  
}

movePosYN(){
  let y;
  if(this.state.y - 5 < 0)
  y=this.state.canvasHeight-20;
  else
  y = this.state.y -5;
  
  if(this.state.timeYN >= 350)
  clearInterval(this.state.intervalYN);
  else{
  let ctxL = this.state.ctx;
  ctxL.fillStyle='pink'
  ctxL.fillRect(this.state.x,this.state.y,20,20);
  ctxL.fillStyle = 'red';
  ctxL.fillRect(this.state.x,y,20,20);
  this.setState({
    y:y,
    timeYN: this.state.timeYN + this.state.intervalTimeYN
  })
  }
  
}

start(){
  

  if(this.state.start != 1){
    console.log("started ");
    this.setState({start:1,reset:0});
database().ref('/Runs').once('value',(snap)=>{
  if(snap.val()==null)
  this.setState({
    run:'RUN1',
    sendDataInterval:setInterval(()=>{this.sendData()},1000),
    startMotion:setInterval(()=>{this.moveRectGesture()},501),
    runCount:1
  })
  else{
    let runs=0;
    runs = this.state.runCount + 1;
    let run = 'RUN' + runs;
    let start = [this.state.x,this.state.y];
    database().ref("Runs/" + run + "/CO-ORDINATES/Extremes/start").set({
      start:start
    }).then(()=>{
      this.setState({
        run:run,
        sendDataInterval:setInterval(()=>{this.sendData()},1000),
        startMotion:setInterval(()=>{this.moveRectGesture()},501),
        runCount:runs
      })
    });

   /*
    database().ref('/Runs').once('value',(snap)=>{
      snap.forEach((subSnap)=>{
        ++runs;
      })
    }).then(()=>{

      runs = runs +1;
      let run = 'RUN' + runs;
      this.setState({
        run:run,
        sendDataInterval:setInterval(()=>{this.sendData()},1000),
        startMotion:setInterval(()=>{this.moveRectGesture()},501),
        runCount:runs
      })
    })
    */

  }

})
}

}

sendData(){
  console.log("in sned data")
  let run = this.state.run;
  database().ref("/Runs/" + run + '/CO-ORDINATES/co_ordinates').once('value',(snap)=>{
    if(snap.val()==null){
      let points = [[this.state.x,this.state.y]];
    database().ref("/Runs/" + run + "/CO-ORDINATES/co_ordinates").set({
      co_ordinates:points
    }).then(()=>{
      console.log("Initial Points set");
    })
  }

    else
    database().ref("/Runs/" + run + "/CO-ORDINATES/co_ordinates").once('value',(snap)=>{
      let temp  = snap.val().co_ordinates;
      let points = [this.state.x,this.state.y];
      temp.push(points);
      database().ref("/Runs/" + run + "/CO-ORDINATES/co_ordinates").set({
        co_ordinates:temp
      }).then(()=>{
        console.log("Iterative points set");
      })
    });

  })
}

stop(){
  if(this.state.start!=0){
    
    let runs = this.state.runCount;
    let run = 'RUN' + runs;
    let stop = [this.state.x,this.state.y];
    if(this.state.pause==0){
      clearInterval(this.state.startMotion);
      clearInterval(this.state.sendDataInterval);
          }
      
    console.log("Stop before sending to database " + stop )
    database().ref("Runs/" + run + "/CO-ORDINATES/Extremes/stop").set({
      stop:stop
    },()=>{console.log("stop after sending to database " + stop)});
    /*
let ctxL = this.state.ctx;
ctxL.fillStyle='pink';
ctxL.fillRect(this.state.x,this.state.y,20,20);
ctxL.fillStyle='red';
ctxL.fillRect(0,0,20,20);
*/
this.setState({
  start:0,
  pause:0
});

  }
}

pause(){
let pauseCount = this.state.pauseCount;
if(this.state.start==1){
let pause = !this.state.pause;
if(pause == 1){
  clearInterval(this.state.startMotion);
clearInterval(this.state.sendDataInterval);
console.log("paused " + this.state.pause)
++pauseCount;
this.setState({
  pause:pause,
  pauseCount:pauseCount
})
}
else if(pause==0){
  this.setState({
    startMotion:setInterval(()=>{this.moveRectGesture()},501),
    sendDataInterval:setInterval(()=>{this.sendData()},1000),
    pause:pause
  })
}
}
}

reset = () =>{
  if(this.state.reset!=1){
this.setState({
  reset:1
});
if(this.state.pause==0){
  clearInterval(this.state.startMotion);
  clearInterval(this.state.sendDataInterval);
      }
let stop = [0,0];
let run = "RUN" + this.state.runCount;
database().ref("Runs/" + run + "/CO-ORDINATES/Extremes/stop").set({
  stop:stop
});
let ctxL = this.state.ctx;

ctxL.fillStyle = "pink";
ctxL.fillRect(this.state.x,this.state.y,20,20);
ctxL.fillStyle = "red";
ctxL.fillRect(0,0,20,20);
this.setState({
  x:0,
  y:0,
  start:0,
  pause:0
});

    }
}


render(){
  return (
    
      <View style= {Styles.container}>
       <View style={{flexDirection:'row', justifyContent:'space-between'}}>
         <View>
         <Text>Run count</Text>
         <Text>{this.state.runCount}</Text>
         </View>
         <View>
         <Text>Pause count</Text>
         <Text>{this.state.pauseCount}</Text>
         </View>
         <View>
         <Text>Paused</Text>
         <Text>{this.state.pause}</Text>
         </View>
       </View>
          <Canvas  width={150} height = {300} ref = "canvas"/>
          
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
        <Button onPress={()=>{this.stop()}} title="Stop" color="#009933"/>
        <Button onPress={()=>{this.start()}} title="Start" color="#009933"/>
        <Button onPress={()=>{this.pause()}} title = "Pause" color="#009933"/>
        <Button onPress={()=>{this.reset()}} title =  "Reset" color="#009933" />
        </View>       
      </View>
    
  );
};
}


const Styles = StyleSheet.create({

container:{
position:'absolute',
top:0,
left:0,
right:0,
bottom:0,
backgroundColor:'green'
},
img :{
  width:40,
  height: 40,
  top:Dimensions.get('window').height - 80,
  left:380

}
});

export default App;
