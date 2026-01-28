// src/KitchenDesigner.js
import React, {  useRef, useState } from 'react';
import * as fabric from 'fabric';
import {  Button } from '@mui/material';
import { LineWeight } from '@mui/icons-material';

const CabinetDesign = () => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [appliances, setAppliances] = useState([]);
  const [walls, setWalls] = useState([]);
  const [doors, setDoors] = useState([]);
  const [windows, setWindows] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [datas, setDatas] = React.useState([]);

  React.useEffect(() => {
    setDatas([
      //  { id:'1',kitchen_id:'k1',object_type:'wall',x:100,y:70,width:600,height:20,rotation:0,color:'gray',data:'{}'},
      //  { id:'2',kitchen_id:'k1',object_type:'wall',x:101,y:70,width:500,height:20,rotation:90,color:'gray',data:'{}'},  
      //  { id:'3',kitchen_id:'k1',object_type:'wall',x:701,y:70,width:500,height:20,rotation:90,color:'gray',data:'{}'},
      // { id:'4',kitchen_id:'k1',object_type:'window',x:101,y:120,width:100,height:20,rotation:90,color:'white',data:'{}'},
      // { id:'5',kitchen_id:'k1',object_type:'window',x:701,y:170,width:100,height:20,rotation:90,color:'lightgray',data:'{}'},
      { id:'1',kitchen_id:'k1',object_type:'wall',x:130,y:450,width:412,height:20,rotation:0,color:'gray',data:'{}'},
      { id:'2',kitchen_id:'k1',object_type:'wall',x:544,y:350,width:120,height:20,rotation:90,color:'gray',data:'{}'},  
       { id:'3',kitchen_id:'k1',object_type:'wall',x:150,y:350,width:120,height:20,rotation:90,color:'gray',data:'{}'},
       { id:'4',kitchen_id:'k1',object_type:'wall',x:524,y:350,width:100,height:20,rotation:0,color:'gray',data:'{}'},
       { id:'5',kitchen_id:'k1',object_type:'wall',x:130,y:350,width:100,height:20,rotation:195,color:'gray',data:'{}'},
       { id:'6',kitchen_id:'k1',object_type:'appliance',x:303,y:381,width:72,height:69,rotation:0,color:'#E2E1FF',data:'{}'},
       { id:'7',kitchen_id:'k1',object_type:'appliance',x:156,y:381,width:72,height:69,rotation:0,color:'#E2E1FF',data:'{}'},

 
    ]);

    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: 'white',
      width: 1000,
      height: 800,
      selectionBorderColor: '#808080', // 灰色的hex值
      selectionColor: 'rgba(128, 128, 128, 0.3)', // 可选：设置带有透明度的灰色选择区域颜色
    });
    setCanvas(canvas);
    fabricRef.current = canvas;

     // 设置 Canvas 大小为父容器的 100%
     const resizeCanvas = () => {
      const parent = canvasRef.current.parentNode;
      if (parent) {
        canvas.setWidth(parent.clientWidth);
        canvas.setHeight(parent.clientHeight);
        canvas.renderAll();
      }
    };
    // 初始化时调整 Canvas 尺寸
    resizeCanvas();

    // 监听窗口大小变化事件
    window.addEventListener('resize', resizeCanvas);

    canvas.on('object:added', function (e) {
      const obj = e.target;
      if (obj.type === 'appliance') {
        // 添加到appliances状态
        setAppliances([...appliances, obj]);
      } else if (obj.type === 'wall') {
        // 添加到wall状态
        setWalls([...walls, obj]);
      }
    }) 
    canvas.on('object:modified', function (e) {
      console.log('modified type : ' +e.target.object_type);
      console.log('modified ID : ' +e.target.id);
      const obj = e.target;
      if (obj.object_type === 'appliance') {
        // 更新appliances状态
        const newAppliances = appliances.map(appliance => {
          if (appliance.id === obj.id) {
            return { ...appliance, width: obj.width, height: obj.height };
         }
        })
      } else if (obj.object_type === 'wall') {
        console.log('wall modified');
        // 更新walls状态
        const newWalls = walls.map(wall => {
          if (wall.id === obj.id) {
            console.log('modified: ' + obj.id);
            console.log('Rectangle position (left, top):', obj.left, obj.top);
            console.log('Rectangle dimensions (width, height):', obj.width, obj.height);
            console.log('Rectangle angle:', obj.angle);
            return { ...wall, width: obj.width, height: obj.height };
         }
        })
      }
    })   
    canvas.on('object:moving', function (e) {
      console.log('moving type : ' +e.target.object_type);
    const obj = e.target;
    // if (obj.object_type === 'appliance') {
    //   const newAppliances = appliances.map(appliance => {
    //     if (appliance.id === obj.id) {
    //       return { ...appliance, left: obj.left, top: obj.top };
    //     }
    //     return appliance;
    //   });
    //   setAppliances(newAppliances);
    // } else if (obj.object_type === 'wall') {
    //   const newWalls = walls.map(wall => {
    //     if (wall.id === obj.id) {
    //       console.log('moving: ' + obj.id);
    //       return { ...wall, left: obj.left, top: obj.top };
    //     }
    //     return wall;
    //   });
    //   setWalls(newWalls);
    // } 
  });
    const handleKeyDown = (event) => {
        if (event.key === 'Delete' || event.key === 'Backspace') {
          deleteSelectedObject();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      const deleteSelectedObject = () => {
        if (!canvas || !canvas.getActiveObject()) return; // 如果canvas不存在或没有活动对象，则不执行删除
      
        const activeObject = canvas.getActiveObject();
        // 从canvas中移除对象
        canvas.remove(activeObject);
        if (activeObject.type === 'appliance') {
          // 更新appliances状态，移除对应项
          const updatedAppliances = appliances.filter(appliance => appliance.id !== activeObject.id);
          setAppliances(updatedAppliances);
        } else if (activeObject.type === 'wall') {
          // 更新wall状态，移除对应项
          const updatedWalls = walls.filter(wall => wall.id !== activeObject.id);
          setWalls(updatedWalls);
        }
        canvas.renderAll();
      };
    //重新渲染整个canvas
    canvas.renderAll();
    //canvas.calcOffset();

    // 清除之前的画布内容
    return () => {
      canvas.dispose();
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const addAppliance = () => {
    const id = Date.now();
    const appliance = new fabric.Rect({
        left: 200,
        top: 200,
        width: 100,
        height: 100,
        fill: '#ffffcc',
        stroke: 'lightgray', // 浅灰色边框
        strokeWidth: 1, // 边框宽度
        id: id,
        type: 'appliance',
        hasControls: true,
        selectable: true,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: true,
      });
      
      appliance.on('selected', () => console.log('Appliance selected:', id));
      appliance.on('deselected', () => console.log('Appliance deselected:', id));
        
    canvas.add(appliance);
    setAppliances([...appliances, { id, left: appliance.left, top: appliance.top, width: 50, height: 50 }]);
  };
  const getAvailableSpace = (appliances) => {
    // This is a simplified example. A more complex calculation may be required
    // depending on the actual kitchen layout and appliance positions.
    let availableLeft = 50;
    let availableTop = 50;
    let availableWidth = 700;
    let availableHeight = 500;

    appliances.forEach(appliance => {
      if (appliance.left < availableLeft + availableWidth) {
        availableWidth = appliance.left - availableLeft;
      }
      if (appliance.top < availableTop + availableHeight) {
        availableHeight = appliance.top - availableTop;
      }
    });

    return { left: availableLeft, top: availableTop, width: availableWidth, height: availableHeight };
  };
  const changeWallSize = () => {
    walls.forEach(wall => {
      wall.set('selectable', true);
      wall.set({
        hasRotatingPoint: true // 启用旋转控制点
      });
    });
  };

  // 获取墙体的信息
  const getAvailableWalls = (walls) => {
    let wallnum = walls.size;
    walls.forEach(wall => {
    });
    return { wallnum: wallnum, wallinfo:[] };
  };
  // 增加一面墙体的
  const addWall = () => {
    let wallnum = walls.size;
    walls.forEach(wall => {
    });
    return { wallnum: wallnum, wallinfo:[] };
  };

  const addComments = () => {
    datas.forEach(item => {
      if (parseFloat(item.rotation)===0) {
      // 创建一条水平标注线，放在矩形的上方
      const line = new fabric.Line([item.x, item.y - 10, item.x + item.width, item.y - 10], {
        stroke: 'black',
        strokeWidth: 1,
        selectable: false
      });
      // 在矩形上方添加标注线
      canvas.add(line);
      // 创建左端的竖线
      const leftVerticalLine = new fabric.Line([item.x, item.y - 15, item.x, item.y - 5], {
        stroke: 'black',
        strokeWidth: 1,
        selectable: false
      });
      // 创建右端的竖线
      const rightVerticalLine = new fabric.Line([item.x + item.width, item.y - 15, item.x + item.width, item.y - 5], {
        stroke: 'black',
        strokeWidth: 1,
        selectable: false
      });
      // 添加竖线到画布上
      canvas.add(leftVerticalLine);
      canvas.add(rightVerticalLine);
      // 创建一个文本对象，放置在标注线的中间，显示矩形的宽度
      const text = new fabric.Text('宽度: ' + item.width + '\'\'', {
        left: item.x + item.width / 2,  // 文本居中
        top: item.y - 30,  // 将文本放置在线的上方
        fontSize: 16,
        fill: 'black',
        originX: 'center',  // 设置文本居中对齐
        selectable: false
      });
      // 在画布上添加文本
      canvas.add(text);
    } else if (parseFloat(item.rotation)===90) {

      // 需要判断标注应该写在左边还是右边？？
      // 创建一条垂直标注线，放在矩形的左边
      const line = new fabric.Line([item.x - 30, item.y, item.x - 30, item.y + item.width], {
        stroke: 'black',
        strokeWidth: 1,
        selectable: false
      });
      // 在矩形左边添加标注线
      canvas.add(line);
      // 创建上端的水平线
      const topHorizontalLine = new fabric.Line([item.x - 35, item.y, item.x - 25, item.y], {
        stroke: 'black',
        strokeWidth: 1,
        selectable: false
      });

      // 创建下端的水平线
      const bottomHorizontalLine = new fabric.Line([item.x - 35, item.y + item.width, item.x - 25, item.y + item.width], {
        stroke: 'black',
        strokeWidth: 1,
        selectable: false
      });

      // 添加水平线到画布上
      canvas.add(topHorizontalLine);
      canvas.add(bottomHorizontalLine);

      // 创建竖着的文字 "宽度"
      const word = "宽度:"+ item.width + '\'\'';
      const startX = item.x - 50;  // 控制文字的X轴位置（相对于标注线的左侧）
      let startY = item.y + item.width / 2 - 20;  // 控制文字的Y轴起点（垂直居中）
      // 遍历每个字符，并将其作为独立的文本对象
      for (let i = 0; i < word.length; i++) {
        const char = new fabric.Text(word[i], {
          left: startX,
          top: startY + (i * 20),  // 每个字符垂直间隔 20px
          fontSize: 16,
          fill: 'black',
          originX: 'center',
          originY: 'center',
          selectable: false
        });
        // 添加每个字符到画布上
        canvas.add(char);
      }
    }
    })
  };
// 增加一面墙体的
const drawwall = () => {
// Initial walls and appliances
console.log("drawwall" + datas.length);
datas.forEach(item => {
  if (item.object_type === 'wall') {
    console.log("object_type====" + item.object_type);
    console.log("object_item====" + item.x+ "," + item.y+"," + item.width+"," + item.height  +item.color);
    const wall = new fabric.Rect({ left: parseFloat(item.x),  // 将字符串转换为数字
      top: parseFloat(item.y),    // 将字符串转换为数字
      width: parseFloat(item.width),  // 将字符串转换为数字
      height: parseFloat(item.height), // 将字符串转换为数字
      fill: item.color,  // 确保这是一个有效的颜色值
      selectable: true  // 确保矩形可选择
       });
    wall.id = item.id;
    wall.object_type = item.object_type;
// Enable rotation controls for the 'wall' object
wall.set({
  hasRotatingPoint: true,   // Enable rotation control
  lockRotation: false,      // Allow free rotation (default behavior)
  rotatingPointOffset: 20,  // Distance from the object where the rotation handle appears
  angle: 0                  // Initial angle (optional)
});

// Make the object selectable and interactive (if not already)
wall.set({
  selectable: true,
  evented: true             // Allow mouse events (default behavior)
});
    // Define the custom rotation center (left + 10, top + 10)
    // const rotationCenterX =  parseFloat(item.x) + 100;
    // const rotationCenterY = parseFloat(item.y) + 100;

    // Move the object so that the custom point becomes the origin
    
    // Move the object back to its original position after rotation
    if (parseFloat(item.rotation)>180) {
      // 设置旋转中心为左上角
    wall.set({  originX: 'left',  originY: 'center'});
    wall.rotate(parseFloat(item.rotation));
      wall.set({
        left: parseFloat(item.x+15) ,  // Re-adjust to move back
        center: parseFloat(item.y+10) ,   // Re-adjust to move back
        originX: 'left',
        originY: 'center'
      });
    } else {
      // 设置旋转中心为左上角
    wall.set({  originX: 'left',  originY: 'top'});
    wall.rotate(parseFloat(item.rotation));
      wall.set({
        left: parseFloat(item.x) ,  // Re-adjust to move back
        top: parseFloat(item.y) ,   // Re-adjust to move back
        originX: 'left',
        originY: 'top'
      });
    }
    

    // // 设置旋转中心为左上角
    // wall.set({  originX: 'left',  originY: 'top',
    //   left: parseFloat(item.x) + 10, // Move the origin to (left + 10)
    //   top: parseFloat(item.y) + 10,   // Move the origin to (top + 10)
    //   });
    // // Adjust the object's position to account for the offset (left + 10, top + 10)
    // const newLeft = wall.left + 100;
    // const newTop = wall.top + 100;

    // // Set the position using the new origin (left + 10, top + 10)
    // wall.setPositionByOrigin({ x: newLeft, y: newTop }, 'left', 'top');
    // 旋转对象 90 度
    // wall.rotate(parseFloat(item.rotation));
    // // 手动调整对象的位置，确保它围绕左上角旋转
    // wall.set({  originX: 'left',  originY: 'top',
    //   left: parseFloat(item.x) , // 
    //   top: parseFloat(item.y) ,   //
    //   });
    // 更新对象的坐标
    wall.setCoords();
    canvas.add(wall);
    setWalls([...walls, wall]);
    if (parseFloat(item.rotation) < 90) {
      console.log("rotation < 90" + item.rotation );
      wall.setControlsVisibility({
        mt: false, // 上中
        mb: false, // 下中
        ml: true, // 左中
        mr: true, // 右中
        tl: false, // 左上
        tr: false, // 右上
        bl: false, // 左下
        br: false  // 右下
      });
    } else {
      wall.setControlsVisibility({
        mt: false, // 上中
        mb: false, // 下中
        ml: true, // 左中
        mr: true, // 右中
        tl: false, // 左上
        tr: false, // 右上
        bl: false, // 左下
        br: false  // 右下
      });
    }
  }else if (item.object_type === 'appliance') {
    const appliance = new fabric.Rect({ left: parseFloat(item.x),  // 将字符串转换为数字
      top: parseFloat(item.y),    // 将字符串转换为数字
      width: parseFloat(item.width),  // 将字符串转换为数字
      height: parseFloat(item.height), // 将字符串转换为数字
      fill: item.color,  // 确保这是一个有效的颜色值
      selectable: true  // 确保矩形不可选择
       });
    setAppliances([...appliances, appliance]);
    canvas.add(appliance);
  } else if (item.object_type === 'door') {
    const door = new fabric.Rect({ left: parseFloat(item.x),  // 将字符串转换为数字
      top: parseFloat(item.y),    // 将字符串转换为数字
      width: parseFloat(item.width),  // 将字符串转换为数字
      height: parseFloat(item.height), // 将字符串转换为数字
      fill: item.color,  // 确保这是一个有效的颜色值
      selectable: true  // 确保矩形不可选择
       });
    door.id = item.id;
    setDoors([...doors, door]);
    canvas.add(door);
  } else if (item.object_type === 'window') {
    const window = new fabric.Rect({ left: parseFloat(item.x),  // 将字符串转换为数字
      top: parseFloat(item.y),    // 将字符串转换为数字
      width: parseFloat(item.width),  // 将字符串转换为数字
      height: parseFloat(item.height), // 将字符串转换为数字
      fill: item.color,  // 确保这是一个有效的颜色值
      selectable: true  // 确保矩形不可选择
       });

      // 创建一条水平标注线，放在矩形的上方
      const LineH = new fabric.Line([item.x, item.y + 10, item.x + item.width, item.y + 10], {
        stroke: 'black',
        strokeWidth: 2,
        selectable: false
      });
      // 创建一个组，将矩形和线条组合起来
      const groupH = new fabric.Group([window, LineH], {
        left: item.x,
        top: item.y,
        selectable: true
      });
      // 添加水平线到画布上
       // 设置旋转中心为左上角
       groupH.set({  originX: 'left',  originY: 'top'});
       groupH.rotate(parseFloat(item.rotation));
       // 手动调整对象的位置，确保它围绕左上角旋转
       groupH.set({
         left: parseFloat(item.x),
         top: parseFloat(item.y)
       });
       // 更新对象的坐标
       groupH.setCoords();
      canvas.add(groupH);
      setWindows([...windows, groupH]);
  } else if (item.object_type === 'appliance') {
    const appliance = new fabric.Rect({ left: parseFloat(item.x),  // 将字符串转换为数字
      top: parseFloat(item.y),    // 将字符串转换为数字
      width: parseFloat(item.width),  // 将字符串转换为数字
      height: parseFloat(item.height), // 将字符串转换为数字
      fill: item.color,  // 确保这是一个有效的颜色值
      selectable: true  // 确保矩形不可选择
       });
       appliance.id = item.id;
    setDoors([...appliances, appliance]);
    canvas.add(appliance);
  }
  //重新渲染整个canvas
  canvas.renderAll();
})
};
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Button variant="contained" sx={{ backgroundColor: '#bfa368' ,marginRight: 1 }} onClick={changeWallSize}>
        Change Wall 
      </Button>
      <Button variant="contained" sx={{ backgroundColor: '#bfa368',marginRight: 1 }} onClick={addAppliance}>
        Add Appliance
      </Button>
      <Button variant="contained" sx={{ backgroundColor: '#bfa368' ,marginRight: 1 }} onClick={addWall}>
      Add a Wall
      </Button>
      <Button variant="contained" sx={{ backgroundColor: '#bfa368' ,marginRight: 1 }} onClick={drawwall}>
      Drawwall
      </Button>
      <Button variant="contained" sx={{ backgroundColor: '#bfa368' ,marginRight: 1 }} onClick={addComments}>
      Add Comments
      </Button>
      <canvas ref={canvasRef} id="canvas" />
    </div>
  );
};

export default CabinetDesign;
