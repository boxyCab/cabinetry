import React  from 'react';
import {  Typography, List, ListItem, Box, Card, CardMedia, CardContent,Button } from '@mui/material';
import { updateCabinet, selectCabinetObject, selectCabinetScale , selectOthers, selectConstruction1} from './store'; 
import { useDispatch, useSelector } from 'react-redux';
import { useCanvas } from './CanvasContext';
const CabinetCorner1000 = () => {
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
    // Wall Blind Corner 27″
    // Wall Blind Corner 30″
    // Wall Lazy Susan 24″
    // Wall Diagonal Corner 24″
    // Wall Diagonal Corner Glass Door
    // Sink Base Diagonal Corner 24″
    // Base Blind Corner 39″
    // Base Blind Corner 42″
    // Base Lazy Susan
    if (cabActiveId ===1) {
      setButtonActive(true);
    } else {
      setButtonActive(false);
    }
    if (construction1.startsWith('BC1',0)) {
      setData([
      { id: '1', image: '/cabinets/wall/Wall Blind Corner 27.png', boxname: 'Wall Blind Corner 27″', comments: 'One door 14-1/2″ wide, 12″ opening Hinges on the central stile Cabinet can be flipped for left/right application Filler needs to be ordered separately\n*Two Shelves  **Three Shelves' , buttonlist1 :['WBC2715','WBC2730',],buttonlist2 :['WBC2736*','WBC2739**']},
      { id: '2', image: '/cabinets/wall/Wall Blind Corner 30.png', boxname: 'Wall Blind Corner 30″', comments: 'One door 17-1/2″ wide, 15″ opening Hinges on the central stile Cabinet can be flipped for left/right application Filler needs to be ordered separately\n*Two Shelves **Three Shelves' , buttonlist1 :['WBC3015','WBC3030',],buttonlist2 :['WBC3036*','WBC3039**']},
      { id: '3', image: '/cabinets/wall/Wall Lazy Susan 24.png', boxname: 'Wall Lazy Susan 24″', comments: 'Bi-folding door 10-3/4″ wide each Soft close not available\n*Two Shelves **Three Shelves' , buttonlist1 :['WLS2415','WLS2430',],buttonlist2 :['WLS2436*','WLS2439**',]}, 
      { id: '4', image: '/cabinets/wall/Wall Diagonal Corner 24.png', boxname: 'Wall Diagonal Corner 24″', comments: 'One door 14-3/4″ wide, 13-3/4″ opening Glass door available, glass insert included\n*Two Shelves **Three Shelves' , buttonlist1 :['WDC2415','WDC2430',],buttonlist2 :['WDC2436*','WDC2439**']},
      { id: '5', image: '/cabinets/wall/Wall Diagonal Corner Glass Door.png', boxname: 'Wall Diagonal Corner Glass Door', comments: 'One door 14-3/4″ wide, 13-3/4″ opening\n*Two Shelves **Three Shelves' , buttonlist1 :['WDC2415GD','WDC2430GD',],buttonlist2 :['WDC2436GD*','WDC2439GD**']},
      { id: '6', image: '/cabinets/wall/Wall Microwave 27″ Wide.png', boxname: 'Wall Microwave 27″ Wide', comments: 'Two doors Finished interior and shelf Shelf dimension: 24″ x 16″ x 3/4″' , buttonlist1 :['WMC2730','WMC2736',],buttonlist2 :['WMC2739',]},
      { id: '7', image: '/cabinets/wall/Wall Wine Rack 15″ High.png', boxname: 'Wall Wine Rack 15″ High', comments: 'Finished interior and exterior Can be used in both wall and base application' , buttonlist1 :['WWR3015',],buttonlist2 :[]},

    ]);
    } else {
      setData([
        { id: '1', image: '/cabinets/wall/Wall Blind Corner 27.png', boxname: 'Wall Blind Corner 27″', comments: 'One door 14-1/2″ wide, 12″ opening Hinges on the central stile Cabinet can be flipped for left/right application Filler needs to be ordered separately\n*Two Shelves  **Three Shelves' , buttonlist1 :['WBC2715','WBC2733*',],buttonlist2 :['WBC2739**']},
        { id: '2', image: '/cabinets/wall/Wall Blind Corner 30.png', boxname: 'Wall Blind Corner 30″', comments: 'One door 17-1/2″ wide, 15″ opening Hinges on the central stile Cabinet can be flipped for left/right application Filler needs to be ordered separately\n*Two Shelves **Three Shelves' , buttonlist1 :['WBC3015','WBC3033*',],buttonlist2 :['WBC3039**']},
        // { id: '3', image: '/cabinets/wall/Wall Lazy Susan 24.png', boxname: 'Wall Lazy Susan 24″', comments: 'Bi-folding door 10-3/4″ wide each Soft close not available\n*Two Shelves **Three Shelves' , buttonlist1 :['WLS2415','WLS2430',],buttonlist2 :['WLS2436*','WLS2439**',]}, 
        { id: '4', image: '/cabinets/wall/Wall Diagonal Corner 24.png', boxname: 'Wall Diagonal Corner 24″', comments: 'One door 14-3/4″ wide, 13-3/4″ opening Glass door available, glass insert included\n*Two Shelves **Three Shelves' , buttonlist1 :['WDC2415','WDC2433*',],buttonlist2 :['WDC2439**']},
        { id: '5', image: '/cabinets/wall/Wall Diagonal Corner Glass Door.png', boxname: 'Wall Diagonal Corner Glass Door', comments: 'One door 14-3/4″ wide, 13-3/4″ opening\n*Two Shelves **Three Shelves' , buttonlist1 :['WDC2415GD','WDC2433GD*',],buttonlist2 :['WDC2439GD**']},
        { id: '6', image: '/cabinets/wall/Wall Microwave 27″ Wide.png', boxname: 'Wall Microwave 27″ Wide', comments: 'Two doors Finished interior and shelf Shelf dimension: 24″ x 16″ x 3/4″' , buttonlist1 :['WMC2733','WMC2739',],buttonlist2 :[]},
        { id: '7', image: '/cabinets/wall/Wall Wine Rack 15″ High.png', boxname: 'Wall Wine Rack 15″ High', comments: 'Finished interior and exterior Can be used in both wall and base application' , buttonlist1 :['WWR3015',],buttonlist2 :[]},
  
      ]);
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

          // 更新scale
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
       let cabWidth=cleanedStr.slice(3,5);
       let cabHeight = cleanedStr.slice(5,7);
       let cabDepth = 12;
       let cabinettype = cleanedStr.slice(0,3);
   
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
              <Typography  color="text.secondary"  sx={{ whiteSpace: 'nowrap', fontSize: '13px', whiteSpace: 'pre-line' }}>
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
  export default CabinetCorner1000;