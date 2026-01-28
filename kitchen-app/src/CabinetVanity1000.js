import React  from 'react';
import {  Typography, List, ListItem, Box, Card, CardMedia, CardContent,Button } from '@mui/material';
import { updateCabinet, selectCabinetObject , selectCabinetScale, selectOthers, selectConstruction1} from './store'; 
import { useDispatch, useSelector } from 'react-redux';
import { useCanvas } from './CanvasContext';

const CabinetVanity1000 = () => {
  const [data, setData] = React.useState([]);
  const cabinetObject = useSelector(selectCabinetObject);
  const dispatch = useDispatch();
  const { drawCabinetTop, saveAddCabinetPre } = useCanvas();
  const cabinetS = useSelector(selectCabinetScale);
    const canvasOthersObject = useSelector(selectOthers);
    const cabActiveId = canvasOthersObject.canvasActiveId;
    const [buttonActive, setButtonActive] = React.useState(false);
      const construction1 = useSelector(selectConstruction1);
  React.useEffect(() => {
    // Drawer Vanity
    // Base Vanity VBS(24-36)
    // Base Vanity VB36DL
    // Base Vanity VB36DR
    // Base Vanity VB(48/60)DS
    // Base Vanity VB60DC
    // Knee Drawer
    if (cabActiveId ===0) {
      setButtonActive(true);
    }else {
      setButtonActive(false);
    }
    if (construction1.startsWith('BC1',0)) {
      setData([
        { id: '1', image: '/cabinets/base/Drawer Vanity.png', boxname: 'Drawer Vanity', comments: 'Three drawers Small drawer front 6-1/4″ high Large drawer front 11-3/8″ high' , buttonlist1 :['VDB12','VDB15','VDB18'],buttonlist2 :['VDB21',]},
        { id: '2', image: '/cabinets/base/Base Vanity VBS(24-36).png', boxname: 'Base Vanity VBS(24-36)', comments: 'Two doors One false drawer front' , buttonlist1 :['VSB24','VSB30','VSB33'],buttonlist2 :['VSB36']},
        { id: '3', image: '/cabinets/base/Base Vanity VB36DL.png', boxname: 'Base Vanity VB36DL', comments: 'Two doors One false drawer front Two drawers 12″ wide' , buttonlist1 :['VB36DL'],buttonlist2 :[]},  
        { id: '4', image: '/cabinets/base/Base Vanity VB36DR.png', boxname: 'Base Vanity VB36DR', comments: 'Two doors One false drawer front Two drawers 12″ wide' , buttonlist1 :['VB36DR'],buttonlist2 :[]},
        { id: '5', image: '/cabinets/base/Base Vanity VB(48 60)DS.png', boxname: 'Base Vanity VB(48/60)DS', comments: 'One false drawer front Two doors Six drawers 12″ wide' , buttonlist1 :['VB48DS','VB60DS'],buttonlist2 :[]},
        { id: '6', image: '/cabinets/base/Base Vanity VB60DC.png', boxname: 'Base Vanity VB60DC', comments: 'Two false drawer fronts Four doors Three drawers 12″ wide' , buttonlist1 :['VB60DC'],buttonlist2 :[]},
        //{ id: '7', image: '/cabinets/base/Knee Drawer.png', boxname: 'Knee Drawer', comments: 'One drawer Drawer front 6-1/4″ height' , buttonlist1 :['KD27','KD30','KD36'],buttonlist2 :[]},
  ]);
    } else {
      setData([
        { id: '1', image: '/cabinets/base/Drawer Vanity.png', boxname: 'Drawer Vanity', comments: 'Three drawers  Small drawer front 6-1/2″ high  Large drawer front 11-1/2″ high' , buttonlist1 :['VDB12','VDB15','VDB18'],buttonlist2 :['VDB21',]},
        { id: '2', image: '/cabinets/base/Base Vanity VBS(24-36).png', boxname: 'Base Vanity VBS(24-36)', comments: 'Two doors One false drawer front' , buttonlist1 :['VSB24','VSB30','VSB33'],buttonlist2 :['VSB36']},
        { id: '3', image: '/cabinets/base/Base Vanity VB36DL.png', boxname: 'Base Vanity VB36DL', comments: 'Two doors One false drawer front Two drawers 12″ wide' , buttonlist1 :['VB36DL'],buttonlist2 :[]},  
        { id: '4', image: '/cabinets/base/Base Vanity VB36DR.png', boxname: 'Base Vanity VB36DR', comments: 'Two doors One false drawer front Two drawers 12″ wide' , buttonlist1 :['VB36DR'],buttonlist2 :[]},
        { id: '5', image: '/cabinets/base/Base Vanity VB(48 60)DS.png', boxname: 'Base Vanity VB(48/60)DS', comments: 'One false drawer front Two doors Six drawers 12″ wide' , buttonlist1 :['VB48DS','VB60DS'],buttonlist2 :[]},
        { id: '6', image: '/cabinets/base/Base Vanity VB60DC.png', boxname: 'Base Vanity VB60DC', comments: 'Two false drawer fronts Four doors Three drawers 12″ wide' , buttonlist1 :['VB60DC'],buttonlist2 :[]},
        //{ id: '7', image: '/cabinets/base/Knee Drawer.png', boxname: 'Knee Drawer', comments: 'One drawer Drawer front 6-1/4″ height' , buttonlist1 :['KD27','KD30','KD36'],buttonlist2 :[]},
  ]);
    }
    
  }, [cabActiveId]);
    const cabAdd = (cabWidth, name, cabinettype) => {
      const cabHeight = 34.5;
      const cabDepth = 21;
      const cabX= 100;
      const cabY= 100;
      const randomInt = Math.floor(Math.random() * 100) + 1;
      drawCabinetTop("canvas1", {"rotation": 0, "width": Math.round(cabWidth*cabinetS*100)/100, 
        "depth": Math.round(cabDepth*cabinetS*100)/100, "height": Math.round(cabHeight*cabinetS*100)/100, 
        "cabinettype": cabinettype, "color":'#FFFBF0', 
        "x":cabX, "y":cabY, "objectname":name, "scale" : cabinetS, "widthcabinet":cabWidth, "updateFlg": 3, id : randomInt});
      // // 更新scale
      // const updatedCabinetFlag = {
      //       ...cabinetObject,
      //       updateFlag: 1
      //     };
      // dispatch(updateCabinet(updatedCabinetFlag)); // 这里使用更新后的状态
    }
  const handleButtonClick = (buttonitem) => {
    console.log("Button clicked: ", buttonitem);
    // 使用 replace() 方法去掉所有的 * 字符
    let cleanedStr = buttonitem.replace(/\*/g, '');
    let cabWidth=0;
    let cabinettype = "";
    if (cleanedStr.startsWith("VDB", 0)) {
      cabWidth = cleanedStr.slice(3);
      cabinettype = "VDB";
    } else if (cleanedStr.startsWith("VSB", 0)) {
      cabWidth = cleanedStr.slice(3);
      cabinettype = "VSB";
    }else if (cleanedStr.startsWith("VB", 0)) {
      cabWidth = cleanedStr.slice(2,4);
      cabinettype = "VB";
    } else {
      cabWidth = cleanedStr.slice(1);
      cabinettype = "B";
    }
    cabAdd(cabWidth, cleanedStr, cabinettype)
    
    
  };
return (<List sx={{ 'width':'420px'}}>
 {data.map((item) => (
        <ListItem alignItems="center" sx={{ padding: '6px 8px' }}> 
        <Card sx={{ display: 'flex' }}>
        <CardMedia
    component="img"
    image={item.image}
    alt="Product Image"
    sx={{
      objectFit: 'contain',
      objectPosition: 'center 5px',
      flex: '1 1 auto',
      height: 'auto',
      maxHeight: '100%',
      width: '150px', // 固定宽度
      flexShrink: 0, // 防止宽度被压缩
    }}
  />
            <Box sx={{ display: 'flex', flexDirection: 'column' , 'width':'420px'}}>
            <CardContent sx={{ flex: '1 0 auto' }}>
            <Typography sx={{ fontSize: '15px' }} component="div">
           {item.boxname}
              </Typography>
              <Typography  color="text.secondary"  sx={{ whiteSpace: 'pre-line', fontSize: '13px' }}>
              {item.comments}
                </Typography>
            </CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', }}>
                {item.buttonlist1.map((buttonitem, index) => (
                  <Button key={index} onClick={() => handleButtonClick(buttonitem)} disabled={!buttonActive}>{buttonitem}</Button>
                ))  }
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', }}>
                {item.buttonlist2.map((buttonitem, index) => (
                  <Button key={index} onClick={() => handleButtonClick(buttonitem)} disabled={!buttonActive}>{buttonitem}</Button>
                ))  }
              </Box>
                {item.buttonlist3 != null ?
                (<Box sx={{ display: 'flex', alignItems: 'center', }}>
                    {item.buttonlist3.map((buttonitem, index) => (
                     <Button key={index} onClick={() => handleButtonClick(buttonitem)} disabled={!buttonActive}>{buttonitem}</Button>
                    ))  }
                  </Box>): null }
              </Box>
        </Card>
      </ListItem>
      ))}
  </List>
  );
}
  export default CabinetVanity1000;