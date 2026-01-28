import React  from 'react';
import {  Typography, List, ListItem, Box, Card, CardMedia, CardContent,Button } from '@mui/material';
import { updateCabinet, selectCabinetObject , selectCabinetScale, selectOthers, selectConstruction1} from './store'; 
import { useDispatch, useSelector } from 'react-redux';
import { useCanvas } from './CanvasContext';
const CabinetWallGlass1000 = () => {
  const [data, setData] = React.useState([]);
  const cabinetObject = useSelector(selectCabinetObject);
  const dispatch = useDispatch();
  const { drawCabinetTop , saveAddCabinetPre} = useCanvas();
  const cabinetS = useSelector(selectCabinetScale);
    const canvasOthersObject = useSelector(selectOthers);
    const cabActiveId = canvasOthersObject.canvasActiveId;
    const [buttonActive, setButtonActive] = React.useState(false);
      const construction1 = useSelector(selectConstruction1);

  React.useEffect(() => {
    // Wall Single Glass Door 15″ High
    // Wall Double Glass Door 15″ High
    // Wall Single Glass Door 36″ High
    // Wall Double Glass Door 36″ High
    // Wall Single Glass Door 39″ High
    // Wall Double Glass Door 39″ High
    if (cabActiveId ===1) {
      setButtonActive(true);
    }else {
      setButtonActive(false);
    }
 if (construction1.startsWith('BC1',0)) {
  setData([
    { id: '1', image: '/cabinets/wall/Wall Single Glass Door 15″ High.png', boxname: 'Wall Single Glass Door 15″ High', comments: 'Two Doors No Shelf' , buttonlist1 :['W1215GD','W1515GD',],buttonlist2 :['W1815GD','W2115GD']},
    { id: '2', image: '/cabinets/wall/Wall Double Glass Door 15″ High.png', boxname: 'Wall Double Glass Door 15″ High', comments: 'Two Doors No Shelf' , buttonlist1 :['W2415GD','W2715GD'],buttonlist2 :['W3015GD','W3315GD'], buttonlist3 :['W3615GD']},
    { id: '3', image: '/cabinets/wall/Wall Single Glass Door 36″ High.png', boxname: 'Wall Single Glass Door 36″ High', comments: 'One Door Two Shelves' , buttonlist1 :['W1236GD','W1536GD'],buttonlist2 :['W1836GD','W2136GD']},  
    { id: '4', image: '/cabinets/wall/Wall Double Glass Door 36″ High.png', boxname: 'Wall Double Glass Door 36″ High', comments: 'Two Doors Two Shelves' , buttonlist1 :['W2436GD','W2736GD'],buttonlist2 :['W3036GD','W3336GD'], buttonlist3 :['W3636GD']},
    { id: '5', image: '/cabinets/wall/Wall Single Glass Door 39″ High.png', boxname: 'Wall Single Glass Door 39″ High', comments: 'One Doors No Shelf' , buttonlist1 :['W1239GD','W1539GD'],buttonlist2 :['W1839GD','W2139GD']},
    { id: '6', image: '/cabinets/wall/Wall Double Glass Door 39″ High.png', boxname: 'Wall Double Glass Door 39″ High', comments: 'Two Doors Two Shelves' , buttonlist1 :['W2439GD','W2739GD'],buttonlist2 :['W3039GD','W3339GD'], buttonlist3 :['W3639GD']},
  ]);
    } else {
      setData([]);
    }
    
  }, [cabActiveId]);
      const cabAdd = (cabWidth, name, cabinettype, cabHeight, cabDepth) => {
   
         const cabX= 100;
         const cabY= 100;
         const randomInt = Math.floor(Math.random() * 100) + 1;
         drawCabinetTop("canvas2", {"rotation": 0, "width": Math.round(cabWidth*cabinetS*100)/100, 
          "depth": Math.round(cabDepth*cabinetS*100)/100, "height": Math.round(cabHeight*cabinetS*100)/100, 
          "cabinettype": cabinettype, "color":'#FFFBF0', "x":cabX, "y":cabY, 
          "objectname":name, "scale" : cabinetS, "widthcabinet":cabWidth, "updateFlg": 3, id : randomInt});
       }
     const handleButtonClick = (buttonitem) => {
       console.log("Button clicked: ", buttonitem);
      // 使用 replace() 方法去掉所有的 * 字符
      let cleanedStr = buttonitem.replace(/\*/g, '');
      let cabWidth=0;
      let cabinettype = "W";
      let cabHeight = 0;
            
      let cabDepth = 12;

      cabWidth = cleanedStr.slice(1,3);
      cabHeight = cleanedStr.slice(3,5);
   
      cabAdd(Number(cabWidth), cleanedStr, cabinettype, cabHeight, cabDepth) 
          
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
  export default CabinetWallGlass1000;