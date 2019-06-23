import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'remote-access';
  socket: any = null;
  getImage: boolean = false;
  interval;

  constructor() {        
    this.startTimer();
  }

  ngOnInit() {
    let canvas = <HTMLCanvasElement> document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    let img = new Image();
    let mousePos = { x:0, y:0 };
    let lastPos = mousePos;    
    let isMove = false;
    let _self = this;

    this.socket = io.connect('http://localhost:8001');
    
    this.socket.emit('event1', {
        msg: 'Client to server, can you hear me server?'
    });

    this.socket.on('event2', (data: any) => {
      console.log(data.msg);
      this.socket.emit('event3', {
          msg: 'Yes, its working for me!!'
      });
    });

    this.socket.on('event4', (data: any) => {
        console.log('image');        
        img.src = 'data:image/jpeg;base64,' + data.msg;
        this.getImage = true;
        img.onload = () => { 
          ctx.drawImage(img, 0, 0, img.width, img.height);
          this.image();
         }   
    });

    this.socket.on('end', function() { 
        console.log('client Socket End'); 
    }); 
    
    this.socket.on('error', function(err) { 
        console.log('client Socket Error: '+ JSON.stringify(err)); 
    }); 
    
    this.socket.on('timeout', function() { 
        console.log('client Socket timeout: '); 
    }); 
    
    this.socket.on('drain', function() { 
        console.log('client Socket drain: '); 
    }); 
    
    this.socket.on('lookup', function() { 
        console.log('client Socket lookup: '); 
    });

    canvas.addEventListener("mousedown", function (e) {
      lastPos = getMousePos(canvas, e);
      console.log("mousedown: " + lastPos.x + "," + lastPos.y);
      sendMessage("DOWN" + lastPos.x + "#" + lastPos.y);
      isMove = true;
    }, false);

    canvas.addEventListener("mouseup", function (e) {
      lastPos = getMousePos(canvas, e);
      console.log("mouseup: " + lastPos.x + "," + lastPos.y);
      sendMessage("UP" + lastPos.x + "#" + lastPos.y);
      isMove = false;
    }, false);

    canvas.addEventListener("mousemove", function (e) {
      if (isMove) {
        mousePos = getMousePos(canvas, e);
        console.log("mousemove: " + mousePos.x + "," + mousePos.y);
        sendMessage("MOVE" + mousePos.x + "#" + mousePos.y);
      }
    }, false);

    canvas.addEventListener("mouseout", function (e) {
      if (isMove) {
        mousePos = getMousePos(canvas, e);
        console.log("mouseout: " + lastPos.x + "," + lastPos.y);
        sendMessage("UP" + lastPos.x + "#" + lastPos.y);
      }
    }, false);

    function sendMessage(events) {
      _self.socket.emit('event5', {
        msg: events
      });
    }

    function getMousePos(canvasDom, mouseEvent) {
      let rect = canvasDom.getBoundingClientRect();
      return {
        x: (mouseEvent.clientX - rect.left)/canvasDom.width,
        y: (mouseEvent.clientY - rect.top)/canvasDom.height
      };
    }
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (!this.getImage && this.socket != null) {
        console.log('start again!!');
        this.image();
      }
      this.getImage = false;
    },1000)
  }

  image() {
    //console.log('image');
    this.socket.emit('event5', {
      msg: "IMAGE"
    });
  }

  home(event) {
    console.log('home');
    this.socket.emit('event5', {
      msg: "HOME"
    });
  }

  back(event) {
    console.log('back');
    this.socket.emit('event5', {
      msg: "BACK"
    });
  }

  recentapps(event) {
    console.log('recentapps');
    this.socket.emit('event5', {
      msg: "APP_SWITCH"
    });
  }
}
