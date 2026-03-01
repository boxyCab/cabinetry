import React from 'react';
import { Typography, List, ListItem, Box, Card, CardMedia, CardContent, Button } from '@mui/material';
import { useCanvas } from './CanvasContext';
import { updateCabinet, selectCabinetObject, selectOthers, selectConstruction1, selectKitchenId } from './store';
import { useDispatch, useSelector } from 'react-redux';
import { selectCabinetScale } from './store'; // 导入 selector
const CabinetBasic1000 = () => {
  const [data, setData] = React.useState([]);
  const { drawCabinetTop, saveAddCabinetPre } = useCanvas();
  const cabinetS = useSelector(selectCabinetScale);
  const cabinetObject = useSelector(selectCabinetObject);
  const dispatch = useDispatch();
  const canvasOthersObject = useSelector(selectOthers);
  const cabActiveId = canvasOthersObject.canvasActiveId;
  const [buttonActive, setButtonActive] = React.useState(false);
  const construction1 = useSelector(selectConstruction1);


  React.useEffect(() => {
    console.log('basic100 cabActiveId:', cabActiveId)
    // Base Single Door
    // Base Double Door
    // Base Three Drawer
    // Base Two Drawer
    // Sink Base
    // Farm Sink Base
    // Spice Rack
    // Trash Bin Cabinet
    if (cabActiveId === 0) {
      setButtonActive(true);
    } else {
      setButtonActive(false);
    }
    if (construction1.startsWith('BC1', 0)) {
      setData([
        { id: '1', image: '/cabinets/base/Base Single Door.png', boxname: 'Base Single Door', comments: 'One door One drawer One shelf\n *One full height door, no drawer', buttonlist1: ['B09*', 'B12', 'B15'], buttonlist2: ['B18', 'B21'] },
        { id: '2', image: '/cabinets/base/Base Double Door.png', boxname: 'Base Double Door', comments: 'Two doors One drawer One shelf', buttonlist1: ['B24', 'B27', 'B30'], buttonlist2: ['B33', 'B36', 'B39'] },
        { id: '3', image: '/cabinets/base/Base Three Drawer.png', boxname: 'Base Three Drawer', comments: 'Three drawers Small drawer front 6-1/4″high Large drawer front 11-3/8″ high', buttonlist1: ['3DB12', '3DB15', '3DB18',], buttonlist2: ['3DB21', '3DB24', '3DB27',], buttonlist3: ['3DB30', '3DB33', '3DB36'] },
        { id: '4', image: '/cabinets/base/Base Two Drawer.png', boxname: 'Base Two Drawer', comments: 'Two drawers Drawer front 14-5/8″ high', buttonlist1: ['2DB24', '2DB27', '2DB30'], buttonlist2: ['2DB33', '2DB36'] },
        { id: '5', image: '/cabinets/base/Sink Base.png', boxname: 'Sink Base', comments: 'Two doors,  One false drawer front', buttonlist1: ['SB24', 'SB30', 'SB33'], buttonlist2: ['SB36', 'SB42'] },
        { id: '6', image: '/cabinets/base/Farm Sink Base.png', boxname: 'Farm Sink Base', comments: 'Two doors', buttonlist1: ['FSB33', 'FSB36',], buttonlist2: [] },
        { id: '7', image: '/cabinets/base/Spice Rack.png', boxname: 'Spice Rack', comments: 'Three levels of spice racks Fits items up to 9″ tall', buttonlist1: ['BSR09', 'BSR12',], buttonlist2: [] },
        { id: '8', image: '/cabinets/base/Trash Bin Cabinet.png', boxname: 'Trash Bin Cabinet', comments: 'One drawer One trash bin for TB15 Double trash bin for TB18', buttonlist1: ['TB15', 'TB18',], buttonlist2: [] },
        { id: '9', image: '/cabinets/wall/Sink Base Diagonal Corner 24.png', boxname: 'Sink Base Diagonal Corner 24″', comments: 'One door One false drawer front', buttonlist1: ['SBD36', 'SBD42',], buttonlist2: [] },
        { id: '10', image: '/cabinets/wall/Base Blind Corner 39.png', boxname: 'Base Blind Corner 39″', comments: 'One full height door 14-1/2″ wide, 12″opening Hinges on the central stile Filler needs to be ordered separately One shelf', buttonlist1: ['BBC39',], buttonlist2: [] },
        { id: '11', image: '/cabinets/wall/Base Blind Corner 42.png', boxname: 'Base Blind Corner 42', comments: 'One full height door 17-1/2″ wide, 15″ opening Hinges on the central stile Filler needs to be ordered separately One shel', buttonlist1: ['BBC42',], buttonlist2: [] },
        { id: '12', image: '/cabinets/wall/Base Lazy Susan.png', boxname: 'Base Lazy Susan', comments: 'Full height bi-folding door Two wooden susan included Wooden susan 26-1/4″ diameter Soft close not available', buttonlist1: ['BLS33', 'BLS36',], buttonlist2: [] },
        { id: '13', image: '/cabinets/base/Base Filler.png', boxname: 'Base Filler”', comments: 'Solid wood  ', buttonlist1: ['BF3', 'BF6',], buttonlist2: [] },
        { id: '14', image: '/cabinets/base/Skin Panel 24.png', boxname: 'Skin Panel', comments: ' One side finished   1/4“ thickness', buttonlist1: ['SP2436', 'SP2796', 'SP4896'], buttonlist2: [] },
        { id: '15', image: '/cabinets/base/Refrigerator Return Panel.png', boxname: 'Refrigerator Return Panel', comments: '1-1/2“ finished filler 1/2” thickness plywood panel, finished outside', buttonlist1: ['RRP2796', 'RRP27108'], buttonlist2: [] },
        ]);
    } else {
      setData([
        { id: '1', image: '/cabinets/base/Base Single Door.png', boxname: 'Base Single Door', comments: 'One door One drawer One shelf\n *One full height door, no drawer', buttonlist1: ['B09*', 'B12', 'B15'], buttonlist2: ['B18', 'B21'] },
        { id: '2', image: '/cabinets/base/Base Double Door.png', boxname: 'Base Double Door', comments: 'Two doors One drawer One shelf', buttonlist1: ['B24', 'B27', 'B30'], buttonlist2: ['B33', 'B36', 'B42'] },
        { id: '3', image: '/cabinets/base/Base Three Drawer.png', boxname: 'Base Three Drawer', comments: 'Three drawers Small drawer front 6-1/4″high Large drawer front 11-3/8″ high', buttonlist1: ['3DB12', '3DB15', '3DB18',], buttonlist2: ['3DB21', '3DB24', '3DB27',], buttonlist3: ['3DB30', '3DB33', '3DB36'] },
        { id: '4', image: '/cabinets/base/Base Two Drawer.png', boxname: 'Base Two Drawer', comments: 'Two drawers Drawer front 14-5/8″ high', buttonlist1: ['2DB27', '2DB30', '2DB33'], buttonlist2: ['2DB36'] },
        { id: '5', image: '/cabinets/base/Base Single Door 12.png', boxname: 'Base Single Door 12″ Depth', comments: 'One door No drawer Two shelves ', buttonlist1: ['B1212', 'B1512', 'B1812'], buttonlist2: ['B2112'] },
        { id: '6', image: '/cabinets/base/Base Double Door 12.png', boxname: 'Base Double Door 12″ Depth', comments: 'Two doors No drawer Two shelves ', buttonlist1: ['B2412', 'B2712', 'B3012'], buttonlist2: ['B3312', 'B3612'] },
        { id: '7', image: '/cabinets/base/Sink Base.png', boxname: 'Sink Base', comments: 'Two doors,  One false drawer front', buttonlist1: ['SB24', 'SB30', 'SB33'], buttonlist2: ['SB36', 'SB42'] },
        { id: '8', image: '/cabinets/base/Farm Sink Base.png', boxname: 'Farm Sink Base', comments: 'Two doors', buttonlist1: ['FSB33', 'FSB36', 'FSB39'], buttonlist2: [] },
        { id: '9', image: '/cabinets/base/Spice Rack.png', boxname: 'Spice Rack', comments: 'Three levels of spice racks Fits items up to 9″ tall', buttonlist1: ['BSR09', 'BSR12',], buttonlist2: [] },
        { id: '10', image: '/cabinets/base/Trash Bin Cabinet.png', boxname: 'Trash Bin Cabinet', comments: 'One drawer  Double trash bins', buttonlist1: ['TB15', 'TB18',], buttonlist2: [] },
        { id: '11', image: '/cabinets/wall/Sink Base Diagonal Corner 24.png', boxname: 'Sink Base Diagonal Corner 24″', comments: 'One false drawer front', buttonlist1: ['SBD36', 'SBD42',], buttonlist2: [] },
        { id: '12', image: '/cabinets/wall/Base Blind Corner 39.png', boxname: 'Base Blind Corner 39″', comments: 'One full height door 14-7/8″ wide, 14-1/4″opening Hinges on the central stile Filler needs to be ordered separately One shelf', buttonlist1: ['BBC39',], buttonlist2: [] },
        { id: '13', image: '/cabinets/wall/Base Blind Corner 42.png', boxname: 'Base Blind Corner 42', comments: ' One full height door 17-7/8″ wide, 17-1/4″ opening Hinges on the central stile Filler needs to be ordered separately One shel', buttonlist1: ['BBC42',], buttonlist2: [] },
        { id: '14', image: '/cabinets/wall/Base Lazy Susan.png', boxname: 'Base Lazy Susan', comments: 'Full height bi-folding door Two wooden susan included Wooden susan 26-1/4″ diameter Soft close not available', buttonlist1: ['BLS33', 'BLS36',], buttonlist2: [] },
        { id: '15', image: '/cabinets/base/Base Open Cabinet.png', boxname: 'Base Open Cabinet', comments: 'One shelf', buttonlist1: ['BOC09', 'BOC12', 'BOC15'], buttonlist2: ['BOC18', 'BOC21', 'BOC24'], buttonlist3: ['BOC27', 'BOC30', 'BOC33'], buttonlist4: ['BOC36', 'BOC39', 'BOC42'] },
        { id: '16', image: '/cabinets/base/Base Filler.png', boxname: 'Base Filler”', comments: 'Solid wood  ', buttonlist1: ['BF3', 'BF6',], buttonlist2: [] },
        { id: '17', image: '/cabinets/base/Base Finish Panel.png', boxname: 'Base Finish Panel', comments: 'Finished on all sides   3/4“ thickness plywood', buttonlist1: ['PNB36','PNB96', 'PNB108'], buttonlist2: [] },
        { id: '18', image: '/cabinets/base/Island Finish Panel.png', boxname: 'Island Finish Panel', comments: 'Finished on all sides   3/4“ thickness plywood', buttonlist1: ['PNI24','PNI36', 'PNI48'], buttonlist2: ['PNI96'] },
        
      ]);
    }

  }, [cabActiveId]);

  const cabAdd = (cabWidth, name, cabinettype, cabinetDepth, cabHeight) => {
    // const cabHeight = 34.5;
    const cabDepth = cabinetDepth;
    const cabX = 100;
    const cabY = 100;
    const randomInt = Math.floor(Math.random() * 100) + 1;
    drawCabinetTop("canvas1", {
      "rotation": 0, "width": Math.round(cabWidth * cabinetS * 100) / 100,
      "depth": Math.round(cabDepth * cabinetS * 100) / 100, "height": Math.round(cabHeight * cabinetS * 100) / 100,
      "cabinettype": cabinettype, "color": '#FFFBF0', "x": cabX, "y": cabY,
      "objectname": name, "scale": cabinetS, "widthcabinet": cabWidth, "heightcabinet": cabHeight,"depthcabinet": cabDepth,"updateFlg": 3, id: randomInt
    });
    // saveSubmitData(cabinetObject, kitchenId, "canvas1");

    // // 更新scale
    // const updatedCabinetFlag = {
    //       ...cabinetObject,
    //       updateFlag: 1,
    //       canvasId : 1, // 更新canvasId为1
    //     };
    // dispatch(updateCabinet(updatedCabinetFlag)); // 这里使用更新后的状态
  }
  const handleButtonClick = (buttonitem) => {
    console.log("Button clicked: ", buttonitem);

    // 使用 replace() 方法去掉所有的 * 字符
    let cleanedStr = buttonitem.replace(/\*/g, '');
    let cabWidth = 0;
    let cabinettype = "";
    let cabinetDepth = 24;
    let cabHeight = 34.5;
    if (cleanedStr.startsWith("BSR", 0)) {
      cabWidth = cleanedStr.slice(3);
      cabinettype = "BSR";
    } else if (cleanedStr.startsWith("FSB", 0)) {
      cabWidth = cleanedStr.slice(3);
      cabinettype = "FSB";
    } else if (cleanedStr.startsWith("SBD", 0)) {
      cabWidth = cleanedStr.slice(3);
      cabinettype = "SBD";
    } else if (cleanedStr.startsWith("2DB", 0)) {
      cabWidth = cleanedStr.slice(3);
      cabinettype = "2DB";
    } else if (cleanedStr.startsWith("3DB", 0)) {
      cabWidth = cleanedStr.slice(3);
      cabinettype = "3DB";
    } else if (cleanedStr.startsWith("BBC", 0)) {
      cabWidth = Number(cleanedStr.slice(3)) + 3;

      cabinettype = "BBC";
    } else if (cleanedStr.startsWith("BLS", 0)) {
      cabWidth = cleanedStr.slice(3);
      cabinettype = "BLS";
    } else if (cleanedStr.startsWith("TB", 0)) {
      cabWidth = cleanedStr.slice(2);
      cabinettype = "TB";
    } else if (cleanedStr.startsWith("SB", 0)) {
      cabWidth = cleanedStr.slice(2);
      cabinettype = "SB";
    } else if (cleanedStr.startsWith("BOC", 0)) {
      cabWidth = cleanedStr.slice(3);
      cabinettype = "BOC";
    } else if (cleanedStr.startsWith("BF", 0)) {
      cabWidth = cleanedStr.slice(2,3);
      cabinettype = "FILLER";
    } else if (cleanedStr.startsWith("PNB", 0)) {
      cabHeight = cleanedStr.slice(3);
      cabWidth = 0.75;
      cabinettype = "PNB";
    } else if (cleanedStr.startsWith("PNI", 0)) {
      cabHeight = cleanedStr.slice(3);
      cabWidth = 0.75;
      cabinettype = "PNI";
    } else if (cleanedStr.startsWith("SP", 0)) {
      cabinetDepth = cleanedStr.slice(2,4);
      cabHeight = cleanedStr.slice(4);
      cabWidth = 0.25;
      cabinettype = "SP";
    } else if (cleanedStr.startsWith("RRP", 0)) {
      cabinetDepth = cleanedStr.slice(3,5);
      cabHeight = cleanedStr.slice(5);
      cabWidth = 1.5;
      cabinettype = "RRP";
    } 
    else {
      cabWidth = cleanedStr.slice(1, 3);
      cabinettype = "B";
      if (cleanedStr.length === 5) {
        cabinetDepth = cleanedStr.slice(3, 5);
      }
    }
    cabAdd(cabWidth, cleanedStr, cabinettype, cabinetDepth, cabHeight);

    // saveSubmitData(cabinetObject, kitchenId, "canvas1");

    // const cabInfo= {"rotation": 0, "width": , "depth": , "height": , "cabinettype": "B", "fill":'#FFFBF0', "x":100, "y":100, "objectname":buttonitem};
    // drawCabinetTop("canvas1", cabInfo);  
  };

  return (<List sx={{ 'width': '420px' }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '420px', flexGrow: 1 }}>
            <CardContent sx={{ flex: '1 0 auto' }}>
              <Typography sx={{ fontSize: '15px' }} component="div">
                {item.boxname}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ whiteSpace: 'nowrap', fontSize: '13px', whiteSpace: 'pre-line' }}
              >
                {item.comments}
              </Typography>
            </CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {item.buttonlist1.map((buttonitem, index) => (
                <Button key={index} onClick={() => handleButtonClick(buttonitem)} disabled={!buttonActive}>{buttonitem}</Button>
              ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {item.buttonlist2.map((buttonitem, index) => (
                <Button key={index} onClick={() => handleButtonClick(buttonitem)} disabled={!buttonActive}>{buttonitem}</Button>
              ))}
            </Box>
            {item.buttonlist3 != null ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {item.buttonlist3.map((buttonitem, index) => (
                  <Button key={index} onClick={() => handleButtonClick(buttonitem)} disabled={!buttonActive}>{buttonitem}</Button>
                ))}
              </Box>
            ) : null}
            {item.buttonlist4 != null ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {item.buttonlist4.map((buttonitem, index) => (
                  <Button key={index} onClick={() => handleButtonClick(buttonitem)} disabled={!buttonActive}>{buttonitem}</Button>
                ))}
              </Box>
            ) : null}
          </Box>
        </Card>

      </ListItem>
    ))}
  </List>
  );
}
export default CabinetBasic1000;