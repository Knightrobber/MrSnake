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
  this.state = {
   x:0,
   y:0,
   count:0,
   ctx:null,
   canvasHeight:null,
   interval:null,
   initialDate:null,
   accelerometerX1:0.1,
   timeX:0,
   intervalX:null,

  }

  }

componentDidMount(){
  canvas = this.refs.canvas
  canvas.width = Dimensions.get('window').width;
  canvas.height = (70/100) * Dimensions.get('window').height;
  
  console.log("canvas width " + canvas.width + " canvas height " + canvas.height);
  console.log("Screen Width and height " + Dimensions.get('window').height + " width" + Dimensions.get('window').width)
  let ctxL = canvas.getContext("2d")
  ctxL.fillStyle = "pink"
  ctxL.fillRect(0,0,canvas.width,canvas.height);
  ctxL.fillStyle = "red"
  ctxL.fillRect(0,0,20,20);
  let co_ordinates = [[0,0]]
  database().ref('/Movement').set({
    Co_ordinates:co_ordinates
  })

  accelerometer.subscribe(({x,y})=>{
    this.setState({
      accelerometerX1:x
    })
    console.log("the value of " + "x  " + x);
  })
  this.setState({
    ctx:ctxL
  },function(){
    setInterval(()=>{this.moveRectGesture()},501);
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
let ax = this.state.accelerometerX1;
let vx = ax * 400;
vx = (vx/(4*10000) + 1/70);
let tx = 5/vx;
if(tx<0)
tx = -tx;
if(tx<380 && vx>0){
this.setState({
  intervalX:setInterval(() => {this.movePosX()},tx),
  intervalTimeX:tx,
  time:tx
})
}
}

movePosX(){
  let x,time;
  if(this.state.x + 5 > Dimensions.get('window').width - 20 )
  x = 0;
  else
  x = this.state.x + 5;

    if(this.state.time >= 350)
    clearInterval(this.state.intervalX);
    else{
    let ctxL = this.state.ctx;
    ctxL.fillStyle='pink'
    ctxL.fillRect(this.state.x,this.state.y,20,20);
    ctxL.fillStyle = 'red';
    ctxL.fillRect(x,this.state.y,20,20);
    this.setState({
      x:x,
      time: this.state.time + this.state.intervalTimeX
    })
    }

    
}

stopLoop(){
clearInterval(this.state.interval);
}

startLoop(){
  /*this.setState({
    ctx:ctxL,
    initialDate:new Date(),
    interval:setInterval(()=>{this.moveRect()},1000),
    tenSecDate:new Date()
  });
  */
 this.refs.count.placeholder = "23"
 this.state.count.value="123"

}
render(){
  return (
    
      <View style= {Styles.container}>
        <TextInput ref="count" placeholder="count" value=""/>
          <Canvas  width={150} height = {300} ref = "canvas"/>
          <Text>HEy</Text>
        <Button onPress={()=>{this.stopLoop()}} title="Stop Loop" color="#009933"/>
        <Button onPress={()=>{this.startLoop()}} title="Start Loop" color="#009933"/>
        
       
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
