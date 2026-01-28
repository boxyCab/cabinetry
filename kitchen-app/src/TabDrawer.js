import React , { useEffect} from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import Typography from '@mui/material/Typography';
import CabinetWall1000 from './CabinetWall1000';
import CabinetBasic1000 from './CabinetBasic1000';
import CabinetCorner1000 from './CabinetCorner1000';
import CabinetWallOthers1000 from './CabinetWallOthers1000';
import CabinetVanity1000 from './CabinetVanity1000';
import CabinetWallGlass1000 from './CabinetWallGlass1000';

const TabDrawer = () => {
const [value, setValue] = React.useState(0);
const [isVisible, setIsVisible] = React.useState(true);

useEffect(() => {
  // 模拟页面加载时触发 onChange 事件，选择特定的 Tab
  const simulatedEvent = {}; // 不需要实际事件对象，只传递索引值即可
  handleChange(simulatedEvent, "0"); // 假设要选中第二个 Tab（索引 1）
  setIsVisible(true);
}, []);
const handleChange = (event, newValue) => {
    setValue(newValue);
    setIsVisible(false);
};
return (
    <Box sx={{ width: '100%', typography: 'body1', minHeight: '665px' }}>
      <TabContext value={value}>
        <Box sx={{ maxWidth: { xs: 320, sm: 480 },  }}>
            <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
            >
                <Tab label="Wall Cabinets"  value="1" />
                <Tab label="Base Cabinets"  value="2" />
                <Tab label="Wall Others"  value="3" />
                <Tab label="Wall Pantry"  value="4" />
                <Tab label="Wall Glass Cabinets"  value="5" />
                <Tab label="Base Vanity"  value="6" />
            </Tabs>
            <TabPanel value="1"><CabinetWall1000 /></TabPanel>
            <TabPanel value="2"><CabinetBasic1000 /></TabPanel>
            <TabPanel value="3"><CabinetCorner1000 /></TabPanel>
            <TabPanel value="4"><CabinetWallOthers1000 /></TabPanel>
            <TabPanel value="5"><CabinetWallGlass1000 /></TabPanel>
            <TabPanel value="6"><CabinetVanity1000 /></TabPanel>
        </Box>
      </TabContext>
      <div id="comment" style={{  justifyContent: 'normal', marginTop: '120px', display: isVisible ? 'block' : 'none'  ,
        width: '80%',    marginLeft: 'auto',
    marginRight: 'auto', minHeight: '500px',
      }}>
       <Typography gutterBottom variant="h6" component="div" align="center">
       Prompt
          </Typography>
          <Typography gutterBottom variant="body2" component="div" align="center">
          After entering both kitchentype and construction, you can click on Recommend Cabinets to generate a recommended design, and then modify it based on this.
          </Typography>
      </div>
    </Box>
  );
}
export default TabDrawer;
