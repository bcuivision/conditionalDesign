let video;
let poseNet;
let pose;
let skeleton;
var w = window.innerWidth;
var h = window.innerHeight;  

let colors = [];
let i = 0;
let handClosed = false;
let completed = false;

function setup() {
  
  createCanvas(640 ,480);
  video=createCapture(VIDEO);

  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
  
  colors = [[237,68,12], [89,255,172], [84,172,255],[55,62,74],[241,233,100],[171,76,167]];
  changeColor = false;
  i = 0;

  img = loadImage('ring.png');
}


function gotPoses(poses) {
  // console.log(poses); 
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}


function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  
  translate(640, 0);
  scale(-1,1);
  image(video,0,0, 640, 480);

  document.getElementById("clapNum").innerText = i;
 
  if (pose) {
    let eyeR=pose.rightEye;
    let eyeL=pose.leftEye;
    let earR=pose.rightEar;
    let earL=pose.leftEar;
    let nose=pose.nose;
    let shoulderR=pose.rightShoulder;
    let shoulderL=pose.leftShoulder;
    let elbowR=pose.rightElbow;
    let elbowL=pose.leftElbow;
    let wristR=pose.rightWrist;
    let wristL=pose.leftWrist;
    let hipR=pose.rightHip;
    let hipL=pose.leftHip;
    let kneeR=pose.rightKnee;
    let kneeL=pose.leftKnee;
    let ankleR=pose.rightAnkle;
    let ankleL=pose.leftAnkle;
    
    let d=dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);

    noStroke();

    //calculate hand position
    var c = 50;

    var rSlope = -1* (wristR.y-elbowR.y)/(wristR.x - elbowR.x);
    var deltaX = sqrt(sq(c)/(1+sq(rSlope)));
    var deltaY = rSlope * deltaX;

    var lSlope = -1* (wristL.y-elbowL.y)/(wristL.x - elbowL.x);
    var dX = sqrt(sq(c)/(1+sq(lSlope)));
    var dY = lSlope * dX;

    fill(0,0,0);

    var handL =
    {
      "x":0,
      "y":0
    };

    var handR =
    {
      "x":0,
      "y":0
    };


    if(rSlope<0)
    {
      if(wristR.y<elbowR.y)
      {
        handR.x = wristR.x-deltaX;
        handR.y = wristR.y+deltaY;
        // ellipse(wristR.x-deltaX,wristR.y+deltaY,20,20);
      }
      else
      {
        handR.x = wristR.x+deltaX;
        handR.y = wristR.y-deltaY;
        // ellipse(wristR.x+deltaX,wristR.y-deltaY,20,20);
      }

      if(wristL.x>elbowL.x)
      {
        handL.x = wristL.x+dX;
        handL.y = wristL.y-dY;
        // ellipse(wristL.x+dX,wristL.y-dY,20,20);
      }
      else
      {
        handL.x = wristL.x-dX;
        handL.y = wristL.y+dY;
        // ellipse(wristL.x-dX,wristL.y+dY,20,20);
      }

    }
    else
    {
      if(wristR.y<elbowR.y)
      {
        handR.x = wristR.x+deltaX;
        handR.y = wristR.y-deltaY;
        // ellipse(wristR.x+deltaX,wristR.y-deltaY,20,20);
      }
      else
      {
        handR.x = wristR.x-deltaX;
        handR.y = wristR.y+deltaY;
        // ellipse(wristR.x-deltaX,wristR.y+deltaY,20,20);
      }

      if(wristL.x>elbowL.x)
      {
        handL.x = wristL.x+dX;
        handL.y = wristL.y-dY;
        // ellipse(wristL.x+dX,wristL.y-dY,20,20);
      }
      else
      {
        handL.x = wristL.x-dX;
        handL.y = wristL.y+dY;
        // ellipse(wristL.x-dX,wristL.y+dY,20,20);
      }
    }

    let handDist = dist(handR.x, handR.y, handL.x, handL.y);
    let diameter1 = handDist*0.85;
    let diameter2 = dist(hipL.x, hipL.y, handL.x, handL.y)*0.85;
    let diameter3 = dist(hipR.x, hipR.y, handR.x, handR.y)*0.85;

    var center = (handL.y + handR.y)/2;
    let a = 255* (1- center/480 + 0.1);

    let currentState = false;
    
    //if hands clapped
    if(handDist<80)
    {
      diameter2 = diameter1;
      diameter3 = diameter1;

      if(i>0)
      {
        //change instruction
        var instruction = document.getElementById("instruction");
        instruction.innerText = "Clap";

        filter(INVERT);
      }

      currentState = true;
    }
    else
    {
      image(img, handR.x-40, handR.y-40,80,80);
      image(img, handL.x-40, handL.y-40,80,80);

      if(i == 0)
      {
        filter(INVERT);
      }
    }

    if(handClosed != currentState)
    {
      if(currentState)
      {
        i = i+1;
      }

      handClosed = currentState;
    }
    
    if(i > 0)
    {
      document.getElementById("navBar").style.backgroundColor = "rgba("+colors[i%6][0]+","+colors[i%6][1]+","+colors[i%6][2]+","+a+")";

      document.getElementById("clapNum").style.color = "rgba("+colors[i%6][0]+","+colors[i%6][1]+","+colors[i%6][2]+","+a+")";

      document.getElementById("clapProgress").value = i;

      fill(colors[i%6][0],colors[i%6][1], colors[i%6][2],a);

      ellipse((handR.x+handL.x)/2,(handR.y+handL.y)/2,diameter1,diameter1);

      //circle between left hip and left wrist
      ellipse((hipL.x+handL.x)/2,(hipL.y+handL.y)/2,diameter2,diameter2);
      

      //circle between right hip and right wrist
      ellipse((hipR.x+handR.x)/2,(hipR.y+handR.y)/2,diameter3,diameter3);

      
      // //circle between right ear and right shoulder
      // let diameter4 = dist(earR.x, earR.y, shoulderR.x, shoulderR.y)*0.85;
      // ellipse((earR.x+shoulderR.x)/2,(earR.y+shoulderR.y)/2,diameter4,diameter4);
      
      // //circle between left ear and left shoulder
      // let diameter5 = dist(earL.x, earL.y, shoulderL.x, shoulderL.y)*0.85;
      // ellipse((earL.x+shoulderL.x)/2,(earL.y+shoulderL.y)/2,diameter5,diameter5);
    }

    if(i==10 && !completed)
    {

      var canvasUrl = document.getElementById('defaultCanvas0').toDataURL();
      var createEl = document.createElement('a');
      createEl.href = canvasUrl;
      createEl.download = "magic";
      createEl.click();
      createEl.remove();

      alert("Congrats you've completed Magic 101!");
      completed = true;
      location.reload();
    }
  
    // Display Pose Points
  //   for (let i = 0; i < pose.keypoints.length; i++) {
  //     let x = pose.keypoints[i].position.x;
  //     let y = pose.keypoints[i].position.y;
  //     fill(255,255,255);
  //     ellipse(x,y,10,10);
  //   }
    
  //   // Display Skeleton
  //   for (let i = 0; i < skeleton.length; i++) {
  //     let a = skeleton[i][0];
  //     let b = skeleton[i][1];
  //     strokeWeight(2);
  //     stroke(255);
  //     line(a.position.x, a.position.y,b.position.x,b.position.y);      
  //   }
  }
}



window.addEventListener('load', (event) => {

  console.log('page is fully loaded');

  let canvas = document.getElementById("defaultCanvas0");
  canvas.style.width = "100vw";
  canvas.style.height = "75vw";


});
