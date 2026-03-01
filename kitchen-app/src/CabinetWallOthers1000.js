import React  from 'react';
import {  Typography, List, ListItem, Box, Card, CardMedia, CardContent,Button } from '@mui/material';
import { updateCabinet, selectCabinetObject, selectCabinetScale , selectOthers, selectConstruction1} from './store'; 
import { useDispatch, useSelector } from 'react-redux';
import { useCanvas } from './CanvasContext';
const CabinetWallOthers1000 = () => {
  const [data, setData] = React.useState([]);
  const cabinetObject = useSelector(selectCabinetObject);
  const dispatch = useDispatch();
  const { drawCabinetTop,  saveAddCabinetPre} = useCanvas();
  const cabinetS = useSelector(selectCabinetScale);
    const canvasOthersObject = useSelector(selectOthers);
    const cabActiveId = canvasOthersObject.canvasActiveId;
    const [buttonActive, setButtonActive] = React.useState(false);
      const construction1 = useSelector(selectConstruction1);
  React.useEffect(() => {
    // Wall Microwave 27″ Wide
    // Wall Wine Rack 15″ High
    // Wall Pantry Single Door 18″ Wide
    // Wall Pantry Double Door 24″ Wide
    // Wall Pantry Double Door 30″ Wide
    // Wall Pantry Double Door 36″ Wide
    // Single Oven Pantry 93″
    // Single Oven Pantry 105″
    // Double Oven Pantry 93″
    // Double Oven Pantry 105″
    if (cabActiveId ===0) {
      setButtonActive(true);
    }else {
      setButtonActive(false);
    }
    if (construction1.startsWith('BC1',0)) {
      setData([
        { id: '3', image: '/cabinets/wall/Wall Pantry Single Door 18″ Wide.png', boxname: 'Wall Pantry Single Door 18″ Wide', comments: 'Two doors Four shelves \n*Five shelves Toe kick box is separated \n**Six shelves Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['WP1884','WP1893*',],buttonlist2 :['WP18105**']},  
        { id: '4', image: '/cabinets/wall/Wall Pantry Double Door 24″ Wide.png', boxname: 'Wall Pantry Double Door 24″ Wide', comments: 'Four doors Five shelves Toe kick box is separated \n *Six shelves Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['WP2484','WP2493',],buttonlist2 :['WP24105*']},
        { id: '5', image: '/cabinets/wall/Wall Pantry Double Door 30″ Wide.png', boxname: 'Wall Pantry Double Door 30″ Wide', comments: 'Four doors Four shelves *Five shelves Toe kick box is separated \n **Six shelves Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['WP3084','WP3093*',],buttonlist2 :['WP30105**']},
        { id: '6', image: '/cabinets/wall/Wall Pantry Double Door 36″ Wide.png', boxname: 'Wall Pantry Double Door 36″ Wide', comments: 'Four doors Four shelves *Five shelves Toe kick box is separated\n **Six shelves Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['WP3684','WP3693*',],buttonlist2 :['WP36105**']},
        { id: '7', image: '/cabinets/wall/Single Oven Pantry 93.png', boxname: 'Single Oven Pantry 93″', comments: 'Opening 28-1/2″ x 25-1/2″ One shelf  One small drawer Two big drawers Filler needs to be ordered separately Toe kick box is separated' , buttonlist1 :['SOP3193'],buttonlist2 :[]},
        { id: '8', image: '/cabinets/wall/Single Oven Pantry 105.png', boxname: 'Single Oven Pantry 105″', comments: 'Opening 28-1/2″ x 25-1/2″ Two shelves One small drawer Two big drawers Filler needs to be ordered separately Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['SOP31105',],buttonlist2 :[]},
        { id: '9', image: '/cabinets/wall/Double Oven Pantry 93.png', boxname: 'Double Oven Pantry 93″', comments: 'Opening 28-1/2″ x 25-1/2″ One shelf  One small drawer Two big drawers Filler needs to be ordered separately Toe kick box is separated' , buttonlist1 :['SOP3193',],buttonlist2 :[]},
        { id: '10', image: '/cabinets/wall/Double Oven Pantry 105.png', boxname: 'Double Oven Pantry 105″', comments: 'Opening 28-1/2″ x 25-1/2″ Two shelves One small drawer Two big drawers Filler needs to be ordered separately Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['SOP31105'],buttonlist2 :[]},
      ]);
    } else {
      setData([
        { id: '1', image: '/cabinets/wall/Wall Pantry Single Door 18″ Wide.png', boxname: 'Wall Pantry Single Door 15″ Wide', comments: 'Two doors Five shelves Toe kick box is separated \n*Six shelves Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['WP1593','WP15105*',],buttonlist2 :[]},  
        // { id: '2', image: '/cabinets/wall/Wall Pantry Double Door 24″ Wide.png', boxname: 'Wall Pantry Double Door 24″ Wide', comments: 'Four doors Five shelves Toe kick box is separated \n *Six shelves Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['WP2484','WP2493',],buttonlist2 :['WP24105*']},
        { id: '3', image: '/cabinets/wall/Wall Pantry Single Door 18″ Wide.png', boxname: 'Wall Pantry Single Door 18″ Wide', comments: 'Four doors Five shelves Toe kick box is separated \n*Six shelves Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['WP1893','WP18105*',],buttonlist2 :[]},  
        { id: '4', image: '/cabinets/wall/Wall Pantry Double Door 24″ Wide.png', boxname: 'Wall Pantry Double Door 24″ Wide', comments: 'Four doors Five shelves Toe kick box is separated \n *Six shelves Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['WP2493','WP24105*',],buttonlist2 :[]},
        { id: '5', image: '/cabinets/wall/Wall Pantry Double Door 30″ Wide.png', boxname: 'Wall Pantry Double Door 30″ Wide', comments: 'Four doors Five shelves Toe kick box is separated \n *Six shelves Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['WP3093','WP30105*',],buttonlist2 :[]},
        { id: '6', image: '/cabinets/wall/Wall Pantry Double Door 36″ Wide.png', boxname: 'Wall Pantry Double Door 36″ Wide', comments: 'Four doors Five shelves Toe kick box is separated\n *Six shelves Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['WP3693','WP36105*',],buttonlist2 :[]},
        { id: '7', image: '/cabinets/wall/Single Oven Pantry 93.png', boxname: 'Single Oven Pantry 93″', comments: ' Opening 28-9/16″W x 31-1/2″H One shelf  One small drawer and two big drawers  Filler needs to be ordered separately ' , buttonlist1 :['SOP3093', 'SOP30105'],buttonlist2 :[]},
        { id: '8', image: '/cabinets/wall/Combo Oven Pantry 93 High.png', boxname: 'Single Oven Pantry 105″', comments: 'Opening 28-9/16″W x 43-5/16″ or 49-15/16″H One shelves One small drawer Two big drawers Filler needs to be ordered separately' , buttonlist1 :['COP3093','COP30105',],buttonlist2 :[]},
        { id: '9', image: '/cabinets/wall/Double Oven Pantry 93.png', boxname: 'Double Oven Pantry 93″', comments: ' Opening 28-9/16″ x 54-15/16″ One shelf  One small drawer Two big drawers Filler needs to be ordered separately ' , buttonlist1 :['DOP3093','DOP30105'],buttonlist2 :[]},
        { id: '10', image: '/cabinets/wall/Pantry Open Cabinet 93.png', boxname: 'Pantry Open Cabinet 93″ Height', comments: 'Five shelves' , buttonlist1 :['POC1293','POC1593','POC1893'],buttonlist2 :['POC2193','POC2493','POC2793'],buttonlist3 :['POC3093','POC3393','POC3693'],buttonlist4 :['POC3993','POC4293']},
        { id: '11', image: '/cabinets/wall/Pantry Open Cabinet 105.png', boxname: 'Pantry Open Cabinet 105″ Height', comments: 'Six shelves' , buttonlist1 :['POC12105','POC15105','POC18105'],buttonlist2 :['POC21105','POC24105','POC27105'],buttonlist3 :['POC30105','POC33105','POC36105'],buttonlist4 :['POC39105','POC42105']},
        // { id: '12', image: '/cabinets/wall/Double Oven Pantry 105.png', boxname: 'Double Oven Pantry 105″', comments: 'Opening 28-1/2″ x 25-1/2″ Two shelves One small drawer Two big drawers Filler needs to be ordered separately Box is separated into TOP/BOTTOM two portions' , buttonlist1 :['SOP31105'],buttonlist2 :[]},
      ]);
    }
    
  }, [cabActiveId]);
  const cabAdd = (cabWidth, name, cabinettype, cabHeight, cabDepth) => {
      const cabX= 100;
      const cabY= 100;
      const randomInt = Math.floor(Math.random() * 100) + 1;
      drawCabinetTop("canvas1", {"rotation": 0, "width": Math.round(cabWidth*cabinetS*100)/100, 
        "depth": Math.round(cabDepth*cabinetS*100)/100, "height": Math.round(cabHeight*cabinetS*100)/100, 
        "cabinettype": cabinettype, "color":'#FFFBF0', "x":cabX, "y":cabY, 
        "objectname":name, "scale" : cabinetS, "widthcabinet":cabWidth, "updateFlg": 3, id : randomInt});
    }
  const handleButtonClick = (buttonitem) => {
    console.log("Button clicked: ", buttonitem);
    // 使用 replace() 方法去掉所有的 * 字符
    let cleanedStr = buttonitem.replace(/\*/g, '');
    let cabWidth=0;
    let cabinettype = "";
    let cabHeight = 0;
    let cabDepth = 24;
    if (cleanedStr.startsWith("SOP", 0)) {
      cabWidth = cleanedStr.slice(3,5);
      cabHeight = cleanedStr.slice(5);
      cabinettype = "SOP";
    } else if (cleanedStr.startsWith("COP", 0)) {
      cabWidth = cleanedStr.slice(3,5);
      cabHeight = cleanedStr.slice(5);
      cabinettype = "COP";
    } else if (cleanedStr.startsWith("DOP", 0)) {
      cabWidth = cleanedStr.slice(3,5);
      cabHeight = cleanedStr.slice(5);
      cabinettype = "DOP";
    } else if (cleanedStr.startsWith("WP", 0)) {
      cabWidth = cleanedStr.slice(2,4);
      cabHeight = cleanedStr.slice(4);
      cabinettype = "WP";
    } else if (cleanedStr.startsWith("POC", 0)) {
      cabWidth = cleanedStr.slice(3,5);
      cabHeight = cleanedStr.slice(5);
      cabinettype = "POC";
    } 
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
  export default CabinetWallOthers1000;