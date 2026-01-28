// src/KitchenDesigner.js
import React, { useEffect, useRef, useState } from 'react';
import fabric from '../utils/fabricConfig';
import { autocompleteClasses, Button } from '@mui/material';
import { Minimize } from '@mui/icons-material';
const DrawWall = () => {
  const [data, setData] = React.useState([]);
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [appliances, setAppliances] = useState([]);
  const [walls, setWalls] = useState([]);
  const [cabinets, setCabinets] = useState([]);
  const [textAs, setTextAs] = useState([]);
  const [wall1 , setwall1] = useState([]);
  const [wall2 , setwall2] = useState([]);
  const [wall3 , setwall3] = useState([]);

  useEffect(() => {
    setData([
      { id:'1',kitchen_id:'k1',object_type:'wall',x:'50',y:'50',width:'600',height:'20',rotation:'0',color:'gray',data:'{}'},
      { id:'2',kitchen_id:'k1',object_type:'wall',x:'50',y:'50',width:'20',height:'500',rotation:'0',color:'gray',data:'{}',      },  
      { id:'3',kitchen_id:'k1',object_type:'wall',x:'649',y:'50',width:'20',height:'500',rotation:'0',color:'gray',data:'{}',      },
      { id:'4',kitchen_id:'k1',object_type:'window',x:'749',y:'50',width:'20',height:'500',rotation:'0',color:'white',data:'{}',      },
      { id:'5',kitchen_id:'k1',object_type:'door',x:'749',y:'50',width:'20',height:'500',rotation:'0',color:'white',data:'{}',      },
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

    // Initial walls and appliances
    const wall1 = new fabric.Rect({ left: 50, top: 50, width: 700, height: 20, fill: 'gray', selectable: false });
    const wall2 = new fabric.Rect({ left: 50, top: 50, width: 20, height: 500, fill: 'gray', selectable: false });
    const wall3 = new fabric.Rect({ left: 749, top: 50, width: 20, height: 500, fill: 'gray', selectable: false });
    wall1.typeB = 'Horizontal' ;
    wall2.typeB = 'Vertical' ;
    wall3.typeB = 'Vertical' ;
    wall1.ID = 'W1' ;
    wall2.ID = 'W2' ;
    wall3.ID = 'W3' ;
    setwall1(wall1);
    setwall2(wall2);
    setwall3(wall3);
    setWalls([...walls, wall1]);
    setWalls([...walls, wall2]);
    setWalls([...walls, wall3]);
    // 当选中矩形时自动显示控制点
    canvas.add(wall1, wall2, wall3);
    if (wall1.typeB === 'Horizontal') {
      wall1.setControlsVisibility({
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
      wall1.setControlsVisibility({
        mt: true, // 上中
        mb: true, // 下中
        ml: false, // 左中
        mr: false, // 右中
        tl: false, // 左上
        tr: false, // 右上
        bl: false, // 左下
        br: false  // 右下
      });
    }
    
    if (wall2.typeB === 'Horizontal') {
      wall2.setControlsVisibility({
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
      wall2.setControlsVisibility({
        mt: true, // 上中
        mb: true, // 下中
        ml: false, // 左中
        mr: false, // 右中
        tl: false, // 左上
        tr: false, // 右上
        bl: false, // 左下
        br: false  // 右下
      });
    }
    if (wall3.typeB === 'Horizontal') {
      wall3.setControlsVisibility({
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
      wall3.setControlsVisibility({
        mt: true, // 上中
        mb: true, // 下中
        ml: false, // 左中
        mr: false, // 右中
        tl: false, // 左上
        tr: false, // 右上
        bl: false, // 左下
        br: false  // 右下
      });
    }
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
      const obj = e.target;
      if (obj.type === 'appliance') {
        // 更新appliances状态
        const newAppliances = appliances.map(appliance => {
          if (appliance.id === obj.id) {
            return { ...appliance, width: obj.width, height: obj.height };
         }
        })
      } else if (obj.type === 'wall') {
        // 更新walls状态
        const newWalls = walls.map(wall => {
          if (wall.id === obj.id) {
            return { ...wall, width: obj.width, height: obj.height };
         }
        })
      }
    })   
    canvas.on('object:moving', function (e) {
      console.log('moving');
    const obj = e.target;
    if (obj.type === 'appliance') {
      const newAppliances = appliances.map(appliance => {
        if (appliance.id === obj.id) {
          return { ...appliance, left: obj.left, top: obj.top };
        }
        return appliance;
      });
      setAppliances(newAppliances);
    } else if (obj.type === 'wall') {
      const newWalls = walls.map(wall => {
        if (wall.id === obj.id) {
          return { ...wall, left: obj.left, top: obj.top };
        }
        return wall;
      });
      setWalls(newWalls);
    } else if (obj.type === 'text') {
      const newTextAs = textAs.map(textA => {
        if (textA.id === obj.id) {
          return { ...textA, left: obj.left, top: obj.top };
        }
        return textA;
      });
      setTextAs(newTextAs);
    }
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

    // // 当appliances数组改变时，更新canvas中的对象
    // appliances.forEach(appliance => {
    //     const existingObj = canvas.getObjects().find(obj => obj.id === appliance.id);
    //     if (existingObj) {
    //       existingObj.set({ left: appliance.left, top: appliance.top });
    //       canvas.renderAll();
    //     }
    //   });
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

  const addDimensioning = () => {
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

  const recommendCabinets = () => {
    const cabinetSizes = [{ width: 100, height: 50 }, { width: 150, height: 50 }];
    let availableSpace = getAvailableSpace(appliances);

    const newCabinets = [];
    cabinetSizes.forEach(size => {
      while (availableSpace.width >= size.width && availableSpace.height >= size.height) {
        const cabinet = new fabric.Rect({
          left: availableSpace.left,
          top: availableSpace.top,
          width: size.width,
          height: size.height,
          fill: 'green',
          type: 'cabinet',
          selectable: false,
        });
        canvas.add(cabinet);
        newCabinets.push({ left: availableSpace.left, top: availableSpace.top, width: size.width, height: size.height });
        
        // Update available space
        availableSpace.left += size.width;
        availableSpace.width -= size.width;
      }
    });

    setCabinets(newCabinets);
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
  const addTextsize = () => {
    const id = Date.now();
    const textA = new fabric.IText('Your Text Here', {
        left: 200,
        top: 200,
        width: 50,
        height: 50,
        fill: 'black',
        fontSize: 16,
        id: id,
        type: 'text',
        hasControls: true,
        selectable: true,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: true,
      });
      
      textA.on('selected', () => console.log('Appliance selected:', id));
      textA.on('deselected', () => console.log('Appliance deselected:', id));
        
    canvas.add(textA);
    setTextAs([...textAs, { id, left: textA.left, top: textA.top, width: 50, height: 50 }]);
  };
  const changeWallSize = () => {
    wall1.set('selectable', true);
    wall1.set({
      hasRotatingPoint: true // 启用旋转控制点
    });
    wall2.set('selectable', true);
    wall2.set({
      hasRotatingPoint: true // 启用旋转控制点
    });
    wall3.set('selectable', true);
    wall3.set({
      hasRotatingPoint: true // 启用旋转控制点
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

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Button variant="contained" sx={{ backgroundColor: '#bfa368' ,marginRight: 1 }} onClick={changeWallSize}>
        Change Wall 
      </Button>
      <Button variant="contained" sx={{ backgroundColor: '#bfa368',marginRight: 1 }} onClick={addAppliance}>
        Add Appliance
      </Button>
      <Button variant="contained" sx={{ backgroundColor: '#bfa368' ,marginRight: 1 }} onClick={addTextsize}>
      Add Notes
      </Button>
      <Button variant="contained" sx={{ backgroundColor: '#bfa368' ,marginRight: 1 }} onClick={addTextsize}>
      Save
      </Button>
      <canvas ref={canvasRef} id="canvas" />
    </div>
  );
};

export default DrawWall;
