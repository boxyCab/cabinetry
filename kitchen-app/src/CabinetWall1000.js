import React  from 'react';
import {  Typography, List, ListItem, Box, Card, CardMedia, CardContent,Button } from '@mui/material';
import { updateCabinet, selectCabinetObject, selectCabinetScale , selectOthers, selectConstruction1, selectKitchenId} from './store'; 
import { useDispatch, useSelector } from 'react-redux';
import { useCanvas } from './CanvasContext';


const CabinetWall1000 = () => {
  const [data, setData] = React.useState([]);
  const cabinetObject = useSelector(selectCabinetObject);
  const dispatch = useDispatch();
  const { drawCabinetTop, saveAddCabinetPre } = useCanvas();
  const cabinetS = useSelector(selectCabinetScale);
  const canvasOthersObject = useSelector(selectOthers);
  const cabActiveId = canvasOthersObject.canvasActiveId;
  const [buttonActive, setButtonActive] = React.useState(false);
  const construction1 = useSelector(selectConstruction1);
  const kitchenId = useSelector(selectKitchenId);  

  React.useEffect(() => {
    // Wall Single Door 36″High
    // Wall Double Door 36''High
    // Wall Single Door 39″High
    // Wall Double Door 39''High
    // Wall Bridge Double Door 30″Wide
    // Wall Bridge Double Door 36''Wide
    // Wall Refrigerator Double Door 21″ High
    // Wall Refrigerator Double Door 33″ High
    if (cabActiveId ===1) {
      setButtonActive(true);
    } else {
      setButtonActive(false);
    }
    if (construction1.startsWith('BC1',0)) {
      setData([
        { id: '1', image: '/cabinets/wall/Wall Single Door 15.png', boxname: 'Wall Single Door 15″ High', comments: 'One Door, No Shelf' , buttonlist1 :['W0915','W1215','W1515'],buttonlist2 :['W1815','W2115']},
        { id: '2', image: '/cabinets/wall/Wall Double Door 15.png', boxname: 'Wall Double Door 15″ High', comments: 'Two doors, no shelf' , buttonlist1 :['W2415','W2715','W3015'],buttonlist2 :['W3315','W3615','W3915']},
        { id: '3', image: '/cabinets/wall/Wall Single Door 30.png', boxname: 'Wall Single Door 30″ High', comments: 'One door, Two Shelves' , buttonlist1 :['W0930','W1230','W1530'],buttonlist2 :['W1830','W2130']},
        { id: '4', image: '/cabinets/wall/Wall Double Door 30.png', boxname: 'Wall Double Door 30″ High', comments: 'Two doors, Two Shelves' , buttonlist1 :['W2430','W2730','W3030'],buttonlist2 :['W3330','W3630','W3930']},
        { id: '5', image: '/cabinets/wall/Wall Single Door 36.png', boxname: 'Wall Single Door 36″ High', comments: 'One door, Two Shelves' , buttonlist1 :['W0936','W1236','W1536'],buttonlist2 :['W1836','W2136']},
        { id: '6', image: '/cabinets/wall/Wall Double Door 36.png', boxname: 'Wall Double Door 36″ High', comments: 'Two doors, Two Shelves' , buttonlist1 :['W2436','W2736','W3036'],buttonlist2 :['W3336','W3636','W3936']},
        { id: '7', image: '/cabinets/wall/Wall Single Door 39.png', boxname: 'Wall Single Door 39″ High', comments: 'One door, Three Shelves' , buttonlist1 :['W0939','W1239','W1539'],buttonlist2 :['W1839','W2139']},
        { id: '8', image: '/cabinets/wall/Wall Double Door 39.png', boxname: 'Wall Double Door 39″ High', comments: 'Two doors, Three Shelves' , buttonlist1 :['W2439','W2739','W3039'],buttonlist2 :['W3339','W3639','W3939']},
        { id: '9', image: '/cabinets/wall/Wall Bridge Double Door 30.png', boxname: 'Wall Bridge Double Door 30″Wide', comments: 'Two Doors No Shelf *One Shelf' , buttonlist1 :['W3012','W3015','W3018'],buttonlist2 :['W3021','W3024*','W3027*']},
        { id: '10', image: '/cabinets/wall/Wall Bridge Double Door 36.png', boxname: 'Bridge Double Door 36″Wide', comments: 'Two Doors No Shelf *One Shelf' , buttonlist1 :['W3612','W3615','W3618'],buttonlist2 :['W3621','W3624*','W3627*']},
        { id: '11', image: '/cabinets/wall/Wall Refrigerator Double Door 21.png', boxname: 'Refrigerator Double Door 21″ High', comments: 'Two doors, no shelf' , buttonlist1 :['W332124','W362124'],buttonlist2 :[]},
        { id: '12', image: '/cabinets/wall/Wall Refrigerator Double Door 33.png', boxname: 'Refrigerator Double Door 33″ High', comments: 'Two doors, One Shelf' , buttonlist1 :['W333324','W363324'],buttonlist2 :[]},
      ]);
    } else {
      setData([
        { id: '1', image: '/cabinets/wall/Wall Single Door 15.png', boxname: 'Wall Single Door 15″ High', comments: 'One Door, No Shelf' , buttonlist1 :['W1515','W1815','W2115'],buttonlist2 :[]},
        { id: '2', image: '/cabinets/wall/Wall Double Door 15.png', boxname: 'Wall Double Door 15″ High', comments: 'Two doors, no shelf' , buttonlist1 :['W2415','W2715','W3015'],buttonlist2 :['W3315','W3615','W4215']},
        { id: '3', image: '/cabinets/wall/Wall Single Door 30.png', boxname: 'Wall Single Door 33″ High', comments: 'One door, Two Shelves' , buttonlist1 :['W0933','W1233','W1533'],buttonlist2 :['W1833','W2133']},
        { id: '4', image: '/cabinets/wall/Wall Double Door 30.png', boxname: 'Wall Double Door 33″ High', comments: 'Two doors, Two Shelves' , buttonlist1 :['W2433','W2733','W3033'],buttonlist2 :['W3333','W3633','W4233']},
        { id: '5', image: '/cabinets/wall/Wall Single Door 39.png', boxname: 'Wall Single Door 39″ High', comments: 'One door, Three Shelves' , buttonlist1 :['W0939','W1239','W1539'],buttonlist2 :['W1839','W2139']},
        { id: '6', image: '/cabinets/wall/Wall Double Door 39.png', boxname: 'Wall Double Door 39″ High', comments: 'Two doors, Three Shelves' , buttonlist1 :['W2439','W2739','W3039'],buttonlist2 :['W3339','W3639','W4239']},
        { id: '7', image: '/cabinets/wall/Wall Single Door 15.png', boxname: 'Wall Bridge Single Door 21″ Wide', comments: 'One door, No Shelve' , buttonlist1 :['W2112','W2118','W2121'],buttonlist2 :['W2124']},
        { id: '8', image: '/cabinets/wall/Wall Double Door 15.png', boxname: 'Wall Bridge Double Door 24″ Wide', comments: 'Two doors, No Shelve' , buttonlist1 :['W2412','W2418','W2421'],buttonlist2 :['W2424']},
        { id: '9', image: '/cabinets/wall/Wall Bridge Double Door 30.png', boxname: 'Wall Bridge Double Door 30″ Wide', comments: 'Two Doors No Shelf ' , buttonlist1 :['W3012','W3018','W3021'],buttonlist2 :['W3024','W3027']},
        { id: '10', image: '/cabinets/wall/Wall Bridge Double Door 36.png', boxname: 'Bridge Double Door 36″Wide', comments: 'Two Doors No Shelf ' , buttonlist1 :['W3612','W3618','W3621'],buttonlist2 :['W3624','W3627']},
        { id: '11', image: '/cabinets/wall/Wall Refrigerator Double Door 21.png', boxname: 'Refrigerator Double Door 21″ High', comments: 'Two doors, no shelf' , buttonlist1 :['W332124','W362124'],buttonlist2 :['W422124']},
        { id: '12', image: '/cabinets/wall/Wall Refrigerator Double Door 33.png', boxname: 'Refrigerator Double Door 33″ High', comments: 'Two doors, One Shelf' , buttonlist1 :['W333324','W363324'],buttonlist2 :[]},
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
    }
  const handleButtonClick = (buttonitem) => {
    console.log("Button clicked: ", buttonitem);
   // 使用 replace() 方法去掉所有的 * 字符
   let cleanedStr = buttonitem.replace(/\*/g, '');
   let cabWidth=0;
   let cabinettype = "W";
   let cabHeight = 0;
         
   let cabDepth = 0;
   let strLen = cleanedStr.length;
   if (strLen ===7) {
    cabDepth = 24;
   } else if (strLen ===5) {
    cabDepth = 12;
   }
   cabWidth = cleanedStr.slice(1,3);
   cabHeight = cleanedStr.slice(3,5);

   cabAdd(Number(cabWidth), cleanedStr, cabinettype, cabHeight, cabDepth) 
  //  saveSubmitData(cabinetObject, kitchenId, "canvas2");
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
              <Typography  color="text.secondary"  sx={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
              {item.comments}
                </Typography>
            </CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', }}>
                {item.buttonlist1.map((buttonitem, index) => (
                  <Button key={index} onClick={() => handleButtonClick(buttonitem)} disabled={!buttonActive}>{buttonitem} </Button>
                ))  }
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', }}>
                {item.buttonlist2.map((buttonitem, index) => (
                  <Button key={index} onClick={() => handleButtonClick(buttonitem)} disabled={!buttonActive}>{buttonitem} </Button>
                ))  }
              </Box>
            </Box>
        </Card>
      </ListItem>
      ))}
  </List>
  );
}
  export default CabinetWall1000;