import React  from 'react';
import {  Typography, List, ListItem, Box, Card, CardMedia, CardContent,Button } from '@mui/material';
const CabinetDrawer = () => {
return (<List sx={{ 'width':'380px'}}>
    <ListItem alignItems="center" sx={{ padding: '6px 8px' }}> 
      <Card sx={{ display: 'flex' }}>
         <CardMedia
            component="img"
            height="100"
            image="/W2415.png"
            alt="Product Image"
            style={{ objectFit: 'contain', objectPosition: 'left' ,flexGrow: 1}}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' , 'width':'380px'}}>
          <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography sx={{ fontSize: '15px' }} component="div">
            Wall Double Door 15″ High
            </Typography>
            <Typography  color="text.secondary"  sx={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                Two doors, no shelf
              </Typography>
          </CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
            <Button >
            W2415
            </Button>
            <Button >
            W2715
            </Button>
            <Button >
            W3015
            </Button>
          </Box>
      </Box>
          {/* <Box display="flex" alignItems="center" width = '380px'>
          <CardContent style={{flexGrow: 1,  paddingRight: 80}}>
            <Typography sx={{ fontSize: '15px' }} component="div">
              W2415
            </Typography>
            <Typography  color="text.secondary"  sx={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
              Two doors, no shelf
            </Typography>
            <Box mt={2}>
              <Typography component="div"  sx={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
              24″W x 15″H x 12″D
              </Typography>
            </Box>
          </CardContent>
        </Box> */}
      </Card>
    </ListItem>
    <ListItem alignItems="center" sx={{ padding: '6px 8px' }}> 
    <Card sx={{ display: 'flex' }}>
         <CardMedia
            component="img"
            height="100"
            image="/W0933.png"
            alt="Product Image"
            style={{ objectFit: 'contain', objectPosition: 'left' ,flexGrow: 1}}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' , 'width':'380px'}}>
          <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography sx={{ fontSize: '15px' }} component="div">
            Wall Double Door 15″ High
            </Typography>
            <Typography  color="text.secondary"  sx={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                Two doors, no shelf
              </Typography>
          </CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
            <Button >
            W2415
            </Button>
            <Button >
            W2715
            </Button>
            <Button >
            W3015
            </Button>
          </Box>
      </Box>
      </Card>
    </ListItem>
    <ListItem alignItems="center" sx={{ padding: '6px 8px' }}> 
    <Card sx={{ display: 'flex' }}>
         <CardMedia
            component="img"
            height="100"
            image="/W0939.png"
            alt="Product Image"
            style={{ objectFit: 'contain', objectPosition: 'left' ,flexGrow: 1}}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' , 'width':'380px'}}>
          <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography sx={{ fontSize: '15px' }} component="div">
            Wall Double Door 15″ High
            </Typography>
            <Typography  color="text.secondary"  sx={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                Two doors, no shelf
              </Typography>
          </CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
            <Button >
            W2415
            </Button>
            <Button >
            W2715
            </Button>
            <Button >
            W3015
            </Button>
          </Box>
      </Box>
      </Card>
    </ListItem>
    <ListItem alignItems="center" sx={{ padding: '6px 8px' }}> 
    <Card sx={{ display: 'flex' }}>
         <CardMedia
            component="img"
            height="100"
            image="/WBC3015.png"
            alt="Product Image"
            style={{ objectFit: 'contain', objectPosition: 'left' ,flexGrow: 1}}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', 'width':'380px' }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography sx={{ fontSize: '15px' }} component="div">
            Wall Double Door 15″ High
            </Typography>
            <Typography  color="text.secondary"  sx={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                Two doors, no shelf
              </Typography>
          </CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
            <Button >
            W2415
            </Button>
            <Button >
            W2715
            </Button>
            <Button >
            W3015
            </Button>
          </Box>
      </Box>
      </Card>
    </ListItem>
    <ListItem alignItems="center" sx={{ padding: '6px 8px' }}> 

    
    <Card sx={{ display: 'flex' }}>
         <CardMedia
            component="img"
            height="100"
            image="/WDC2415.png"
            alt="Product Image"
            style={{ objectFit: 'contain', objectPosition: 'left' ,flexGrow: 1}}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', 'width':'380px' }}>
          <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography sx={{ fontSize: '15px' }} component="div">
            Wall Double Door 15″ High
            </Typography>
            <Typography  color="text.secondary"  sx={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                Two doors, no shelf
              </Typography>
          </CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
            <Button >
            W2415
            </Button>
            <Button >
            W2715
            </Button>
            <Button >
            W3015
            </Button>
          </Box>
      </Box>
      </Card>
    </ListItem>
  </List>
  );
}
  export default CabinetDrawer;