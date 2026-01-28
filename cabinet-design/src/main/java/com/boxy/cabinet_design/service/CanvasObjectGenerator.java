package com.boxy.cabinet_design.service;

import com.boxy.cabinet_design.common.Constants;
import com.boxy.cabinet_design.controller.KitchenObjController;
import com.boxy.cabinet_design.dto.*;
import com.boxy.cabinet_design.entity.Appliance;
import com.boxy.cabinet_design.entity.Cabinet;
import com.boxy.cabinet_design.entity.CabinetProduct;
import com.boxy.cabinet_design.entity.Cabinetsrule;
import com.boxy.cabinet_design.entity.Canvasobject;
import com.boxy.cabinet_design.entity.Door;
import com.boxy.cabinet_design.entity.Island;
import com.boxy.cabinet_design.entity.Kitchen;
import com.boxy.cabinet_design.entity.ObjectsComponent;
import com.boxy.cabinet_design.entity.ObjectsWindowDoor;
import com.boxy.cabinet_design.entity.PeninisulaConnection;
import com.boxy.cabinet_design.entity.Wall;
import com.boxy.cabinet_design.entity.WallConnection;
import com.boxy.cabinet_design.entity.Window;
import com.boxy.cabinet_design.repository.*;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional // 适用于整个服务类中的所有方法
public class CanvasObjectGenerator {

    private final CabinetProductsRepository cabinetProductsRepository;
    private static final Logger logger = LoggerFactory.getLogger(CanvasObjectGenerator.class);
    private final KitchenRepository kitchenRepository;
    private final WallRepository wallRepository;
    private final WindowRepository windowRepository;
    private final DoorRepository doorRepository;
    private final IslandRepository islandRepository;
    private final ApplianceRepository applianceRepository;
    private final WallConnectionRepository wallConnectionRepository;
    private final CanvasobjectRepository canvasobjectRepository;
    private final CabinetRepository cabinetRepository;
    private final PeninisulaConnectionRepository peninisulaConnectionRepository;
    private final float positionConstX = Constants.commons.POSITION_CONST_U_X;
    private final float positionConstY = Constants.commons.POSITION_CONST_U_Y;
    private final float positionIslandX = positionConstX + Constants.commons.POSITION_ISLAND_X;
    private final float positionIslandY = positionConstY + Constants.commons.POSITION_ISLAND_Y;
    private final float wallDepthConst = Constants.commons.WALL_DEPTH_DEFAULT;
    private final float wallAdjustment = Constants.commons.WALL_ADJUSTMENT_ROTATION;
    private final float wallAdjustment2 = 2f;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private float scale = 1f;
    private final float applianceHightConst = 34.5f;
    private final float sbFavoriteWidth = 30f;
    private Integer typeflag = 0;
    List<Canvasobject> canvasWallListC = new ArrayList<>();
    List<Canvasobject> canvasIslandListC = new ArrayList<>();

    public CanvasObjectGenerator(KitchenRepository kitchenRepository,
                                 WallRepository wallRepository, WindowRepository windowRepository, DoorRepository doorRepository,
                                 IslandRepository islandRepository, ApplianceRepository applianceRepository, WallConnectionRepository wallConnectionRepository, CanvasobjectRepository canvasobjectRepository, 
                                 CabinetRepository cabinetRepository, NamedParameterJdbcTemplate namedParameterJdbcTemplate,
                                 PeninisulaConnectionRepository peninisulaConnectionRepository, CabinetProductsRepository cabinetProductsRepository) {
        this.kitchenRepository = kitchenRepository;
        this.wallRepository = wallRepository;
        this.windowRepository = windowRepository;
        this.doorRepository = doorRepository;
        this.islandRepository = islandRepository;
        this.applianceRepository = applianceRepository;
        this.wallConnectionRepository = wallConnectionRepository;
        this.canvasobjectRepository = canvasobjectRepository;
        this.cabinetRepository = cabinetRepository;
        this.namedParameterJdbcTemplate = namedParameterJdbcTemplate;
        this.peninisulaConnectionRepository = peninisulaConnectionRepository;
        this.cabinetProductsRepository = cabinetProductsRepository;
    }
    private void addToCanvasObjectList(List<Canvasobject> targetList, List<Canvasobject> sourceList) {
        if (sourceList != null) {
            targetList.addAll(sourceList);
        }
    }


    public List<Canvasobject>   createKitchenConstruction(Kitchen kitchenInfo,List<Wall> wallInfoList, Island island, List<Window> windowList, List<Door> doorList) {
        logger.info("createKitchenConstruction kitchenInfo:", kitchenInfo.getId());
        List<Canvasobject> canvasobjectAllList = new ArrayList<>();
        // createWall
//        System.out.println("createWall");
        canvasWallListC = createWall(kitchenInfo, wallInfoList, island);
        addToCanvasObjectList(canvasobjectAllList, canvasWallListC);

//        System.out.println("createIsland");
        // createIsland
        canvasIslandListC = createIsland(kitchenInfo, island, wallInfoList, canvasWallListC);
        addToCanvasObjectList(canvasobjectAllList, canvasIslandListC);
        // createWindow
        List<Canvasobject> canvasWindowList = createWindow(kitchenInfo, windowList);
        addToCanvasObjectList(canvasobjectAllList, canvasWindowList);
        // createDoor
        List<Canvasobject> canvasDoorList = createDoor(kitchenInfo, doorList);
        addToCanvasObjectList(canvasobjectAllList, canvasDoorList);

        List<Canvasobject> savedCanvasObjects = canvasobjectRepository.saveAll(canvasobjectAllList);
        return savedCanvasObjects;
    }

    public List<Canvasobject>   createCabinetCanvasObject(Kitchen kitchenInfo,List<Wall> wallInfoList, Island island, List<Window> windowList, List<Door> doorList, List<Appliance> applianceList,
                                                             List<Cabinetsrule> cabinetsruleList, List<Canvasobject> canvasWallList, List<Canvasobject> canvasIslandList, List<CabinetProduct> cabinetproductsList) {
        logger.info("createCabinetCanvasObject kitchenInfo:", kitchenInfo.getId());
        List<Canvasobject> canvasobjectAllList = new ArrayList<>();
        // createCabinet
        List<Canvasobject> canvasCabinetList = createCabinet(kitchenInfo, wallInfoList, island, windowList, doorList, applianceList, cabinetsruleList);
        addToCanvasObjectList(canvasobjectAllList, canvasCabinetList);
        // createAppliance
//        List<Canvasobject> canvasApplianceList = createAppliance(kitchenInfo, applianceList);
//        addToCanvasObjectList(canvasobjectAllList, canvasApplianceList);
        // createCabinet
        List<Canvasobject> canvasUpperCabinetList = createCabinetUpper(kitchenInfo, wallInfoList,  windowList, doorList, applianceList, cabinetsruleList,cabinetproductsList);
        addToCanvasObjectList(canvasobjectAllList, canvasUpperCabinetList);
        // createAppliance
        List<Canvasobject> canvasUpperApplianceList = createApplianceUpper(kitchenInfo, applianceList, windowList);
        addToCanvasObjectList(canvasobjectAllList, canvasUpperApplianceList);

        List<Canvasobject> savedCanvasObjects = canvasobjectRepository.saveAll(canvasobjectAllList);
        return savedCanvasObjects;

    }

    //只有basecabinet，目前未使用
    public List<CanvasobjectDto>   createKitchenCanvasObject(Kitchen kitchenInfo,List<Wall> wallInfoList, Island island, List<Window> windowList, List<Door> doorList, List<Appliance> applianceList,
                                          List<Cabinetsrule> cabinetsruleList) {
        logger.info("createKitchenCanvasObject kitchenInfo:", kitchenInfo.getId());
        List<Canvasobject> canvasobjectAllList = new ArrayList<>();
        List<Canvasobject> canvasWallList = new ArrayList<>();
        List<Canvasobject> canvasIslandList = new ArrayList<>();

        List<Canvasobject> canvasDoorConstruction = createKitchenConstruction( kitchenInfo, wallInfoList,  island,  windowList,  doorList);
        addToCanvasObjectList(canvasobjectAllList, canvasDoorConstruction);
        // createCabinet
        List<Canvasobject> canvasCabinetList = createCabinet(kitchenInfo, wallInfoList, island, windowList, doorList, applianceList, cabinetsruleList);
        addToCanvasObjectList(canvasobjectAllList, canvasCabinetList);
//        // createAppliance
//        List<Canvasobject> canvasApplianceList = createAppliance(kitchenInfo, applianceList);
//        addToCanvasObjectList(canvasobjectAllList, canvasApplianceList);


        List<Canvasobject> savedCanvasObjects = canvasobjectRepository.saveAll(canvasobjectAllList);
        // 将实体对象转换为 DTO
        List<CanvasobjectDto> canvasObjectDTOs = savedCanvasObjects.stream()
                .map(canvasObject -> new CanvasobjectDto(
                        canvasObject.getId(),
                        canvasObject.getObjectType(),
                        canvasObject.getX(),
                        canvasObject.getY(),
                        canvasObject.getWidth(),
                        canvasObject.getHeight(),
                        canvasObject.getRotation(),
                        canvasObject.getColor(),
                        canvasObject.getData(),
                        canvasObject.getCreatedAt(),
                        canvasObject.getUpdatedAt(),
                        canvasObject.getRelatedId(),
                        canvasObject.getObjectname(),
                        kitchenInfo.getId(),  // 使用传递的 kitchenId
                        canvasObject.getScale(),
                        canvasObject.getKitchen(),
                        canvasObject.getCabinettype(),
                        canvasObject.getDepth(),
                        canvasObject.getWallid(), 0,
                        canvasObject.getRelatedId2(),
                        canvasObject.getWidthcabinet()
                ))
                .collect(Collectors.toList());

        return canvasObjectDTOs;
    }

    //只有Uppercabinet，目前未使用
    public List<CanvasobjectDto>   createKitchenUpperCanvasObject(Kitchen kitchenInfo, List<Wall> wallInfoList, List<Window> windowList, List<Door> doorList, List<Appliance> applianceList,
                                                                  List<Cabinetsrule> cabinetsruleList, List<CabinetProduct> cabinetproductsList) {
        logger.info("createKitchenUpperCanvasObject kitchenInfo:", kitchenInfo.getId());
        List<Canvasobject> canvasobjectAllList = new ArrayList<>();
        List<Canvasobject> canvasWallList = new ArrayList<>();
        List<Canvasobject> canvasIslandList = new ArrayList<>();

        List<Canvasobject> canvasDoorConstruction = createKitchenConstruction( kitchenInfo, wallInfoList,  null,  windowList,  doorList);
        addToCanvasObjectList(canvasobjectAllList, canvasDoorConstruction);

        // createCabinet
        List<Canvasobject> canvasCabinetList = createCabinetUpper(kitchenInfo, wallInfoList,  windowList, doorList, applianceList, cabinetsruleList,cabinetproductsList);
        addToCanvasObjectList(canvasobjectAllList, canvasCabinetList);

        // createAppliance
        List<Canvasobject> canvasApplianceList = createApplianceUpper(kitchenInfo, applianceList, windowList);
        addToCanvasObjectList(canvasobjectAllList, canvasApplianceList);
        List<Canvasobject> savedCanvasObjects = canvasobjectRepository.saveAll(canvasobjectAllList);
        // 将实体对象转换为 DTO
        List<CanvasobjectDto> canvasObjectDTOs = savedCanvasObjects.stream()
                .map(canvasObject -> new CanvasobjectDto(
                        canvasObject.getId(),
                        canvasObject.getObjectType(),
                        canvasObject.getX(),
                        canvasObject.getY(),
                        canvasObject.getWidth(),
                        canvasObject.getHeight(),
                        canvasObject.getRotation(),
                        canvasObject.getColor(),
                        canvasObject.getData(),
                        canvasObject.getCreatedAt(),
                        canvasObject.getUpdatedAt(),
                        canvasObject.getRelatedId(),
                        canvasObject.getObjectname(),
                        kitchenInfo.getId(),  // 使用传递的 kitchenId
                        canvasObject.getScale(),
                        canvasObject.getKitchen(),
                        canvasObject.getCabinettype(),
                        canvasObject.getDepth(),
                        canvasObject.getWallid(), 0,
                        canvasObject.getRelatedId2(),
                        canvasObject.getWidthcabinet()
                ))
                .collect(Collectors.toList());

        return canvasObjectDTOs;
    }


    public List<Canvasobject> createWall(Kitchen kitchenInfo, List<Wall> wallInfoList, Island island) {
        logger.info("createWall kitchenInfo:", kitchenInfo.getId());
        List<Canvasobject> canvasobjectList = new ArrayList<Canvasobject>();
        if (wallInfoList == null) {return null;}
        String shapeType = kitchenInfo.getShapeType();
        int maxWallIndex = -1; // 记录最大宽度的索引
        float maxWallWidth = Float.MIN_VALUE; // 初始化为最小可能值

        for (int i = 0; i < wallInfoList.size(); i++) {
            float wallWidth = wallInfoList.get(i).getWidth();
            // 根据最长宽度和画布宽度比例，确定绘图比例
            if (wallWidth ==0.0) continue;
            // 考虑到如果有半岛的情况，需要考虑所以下面加上24
            float scale1 = Float.parseFloat(String.format("%.1f", Math.floor(1050.0f / (wallWidth+24) * 10) / 10));
        	if (i == 0 || scale > scale1) {
                scale = scale1;
            }
        }
        
        if (scale > 10 ) {
        	scale = 10;
        }
        
        for (int i = 0; i < wallInfoList.size(); i++) {
            Wall wall = wallInfoList.get(i);
            if (wall.getWidth() == 0) continue;
            Canvasobject canvasObject = new Canvasobject();
            float positionX =0f;
            float positionY =0f;
            float rotation = 0f;
            float width = 0f;
            float heightTmp = 0f;
            float height = 0f;
            String wallObjectName = "wall" ;

            // 设置旋转角度，根据索引判断
            if (shapeType.equals("U"))  {
                if (i == 1 ) { //Wall1
                   rotation = 0f;
                   float wall0Width = scale * wallInfoList.get(0).getWidth();
                   float wall2Width = scale * wallInfoList.get(2).getWidth();
                   if (wall0Width > wall2Width) {
                	   positionY = scale * wallInfoList.get(0).getWidth() + 200;
                   } else {
                	   positionY = scale * wallInfoList.get(2).getWidth() + 200;
                   }
               
                   positionX = positionConstX;// 设置 x 坐标
//                   positionY = scale * wallInfoList.get(0).getWidth() + 200;
                   width =  wall.getWidth() * scale + wallDepthConst *2;  // 两处衔接
                   height = wallDepthConst;
                } else if(i == 0) { //Wall2
                    rotation = 90f; // 设置旋转角度为 90
                    float wall0Width = scale * wallInfoList.get(0).getWidth();
                    float wall2Width = scale * wallInfoList.get(2).getWidth();
                    if (wall0Width > wall2Width) {
                 	   positionY = 200;
                    } else {
                 	   positionY = scale * (wallInfoList.get(2).getWidth() - wallInfoList.get(0).getWidth()) + 200;
                    }
                    positionX = positionConstX  ;
//                    positionY = positionConstY - wall.getWidth() * scale;
                    width = wall.getWidth() * scale;
                    height = wallDepthConst;

//                    positionX = positionConstX + wallHeightConst + wallAdjustment;// 设置 x 坐标
//                    positionY = positionConstY - wall.getWidth() * scale + wallAdjustment;// 设置 y 坐标
//                    width = wall.getWidth() * scale;
                } else { // Wall3
                    rotation = 270f;
//                    positionX = positionConstX + maxWallWidth * scale + wallHeightConst *2 + wallAdjustment;// 设置 x 坐标
//                    positionY = positionConstY - wall.getWidth() * scale + wallAdjustment;// 设置 y 坐标
//                    width = wall.getWidth() * scale;
                    float wall0Width = scale * wallInfoList.get(0).getWidth();
                    float wall2Width = scale * wallInfoList.get(2).getWidth();
                    if (wall2Width > wall0Width) {
                 	   positionY = 200;
                    } else {
                 	   positionY = scale * (wallInfoList.get(0).getWidth() - wallInfoList.get(2).getWidth()) + 200;
                    }
                    // 不使用前台rotation，直接定位x，y
                    positionX = positionConstX + wallInfoList.get(1).getWidth() * scale + wallDepthConst ;
//                    positionY = positionConstY - wall.getWidth() * scale;
                    width = wall.getWidth() * scale;
                    height = wallDepthConst;
                }

            } else if (shapeType.equals("O"))  {
                if (i == 1 ) {
                    rotation = 0f;
                    float wall0Width = scale * wallInfoList.get(0).getWidth();
                    float wall2Width = scale * wallInfoList.get(2).getWidth();
                    if (wall0Width > wall2Width) {
                 	   positionY = scale * wallInfoList.get(0).getWidth() + 200;
                    } else {
                 	   positionY = scale * wallInfoList.get(2).getWidth() + 200;
                    }
                    positionX = positionConstX;// 设置 x 坐标
//                    positionY = positionConstY;// 设置 y 坐标
                    width = wallInfoList.get(1).getWidth() * scale + wallDepthConst *2;
                    height = wallDepthConst;
                } else if(i == 0) {
                    rotation = 90f; // 设置旋转角度为 90
                    float wall0Width = scale * wallInfoList.get(0).getWidth();
                    float wall2Width = scale * wallInfoList.get(2).getWidth();
                    if (wall0Width > wall2Width) {
                  	   positionY = 200;
                     } else {
                  	   positionY = scale * (wallInfoList.get(0).getWidth() - wallInfoList.get(2).getWidth()) + 200;
                     }
                    positionX = positionConstX  ;
//                    positionY = positionConstY - wall.getWidth() * scale;
                    width = wall.getWidth() * scale;
                    height = wallDepthConst;
                } else if(i == 2) {
                    rotation = 270f;
                    float wall0Width = scale * wallInfoList.get(0).getWidth();
                    float wall2Width = scale * wallInfoList.get(2).getWidth();
                    if (wall2Width > wall0Width) {
                  	   positionY = 200;
                     } else {
                  	   positionY = scale * (wallInfoList.get(2).getWidth() - wallInfoList.get(0).getWidth()) + 200;
                     }
                    positionX = positionConstX + wallInfoList.get(1).getWidth() * scale + wallDepthConst ;
//                    positionY = positionConstY - wall.getWidth() * scale;
                    width = wall.getWidth() * scale;
                    height = wallDepthConst;
                } else {
                    rotation = 180f;
                    height = wallDepthConst;
                    float wall0Width = scale * wallInfoList.get(0).getWidth();
                    float wall2Width = scale * wallInfoList.get(2).getWidth();
                    float wall0P = 0;
                    float wall2P = 0;
                    if (wall2Width > wall0Width) {
                    	wall2P = 200;
                    	wall0P = scale * (wallInfoList.get(2).getWidth() - wallInfoList.get(0).getWidth()) + 200;
                     } else {
                    	wall0P =  200;
                    	wall2P = scale * (wallInfoList.get(0).getWidth() - wallInfoList.get(2).getWidth()) + 200;
                     }
                    
                    // 需要确定第四面墙是靠左，还是靠右，或者和哪面前连接
                    if (wall.getOtherWallId1() ==1 && wall.getOtherWallId3()==1) {
                        positionX = positionConstX;// 设置 x 坐标
//                        positionY = positionConstY - wallInfoList.get(0).getWidth() * scale  - wallDepthConst;// 设置 y 坐标
                        positionY = 200;
                        width = wall.getWidth() * scale + wallDepthConst *2;
                    } else if (wall.getOtherWallId1() ==1 ) {
                        // 挨着wall2
                        wallObjectName = "keeptoone";
                        positionX = positionConstX;
//                        positionY = positionConstY - wallInfoList.get(0).getWidth() * scale  - wallDepthConst;//
                        positionY = wall0P;
                        width = wall.getWidth() * scale + wallDepthConst;

                    } else {
                        wallObjectName = "keeptothree";
                        // 挨着wall3
                        positionX = positionConstX + (wallInfoList.get(1).getWidth()- wall.getWidth() )* scale  + wallDepthConst ;
//                        positionY = positionConstY - wallInfoList.get(2).getWidth() * scale-  wallDepthConst ;  //
                        positionY = wall2P;
                        width = wall.getWidth() * scale + wallDepthConst ;
                    }
                }
            } else if (shapeType.equals("L"))  {
                if (i == 1 ) {
                    rotation = 0f;
                    positionX = positionConstX;// 设置 x 坐标
                    
                    positionY = scale * wallInfoList.get(0).getWidth() + 200;
                    width = wall.getWidth() * scale + wallDepthConst;
                    height = wallDepthConst;
                } else {
                    rotation = 90f; // 设置旋转角度为 90
                    height = wallDepthConst;
                    width = wall.getWidth() * scale;
                    if (i == 0 ) {
                        positionX = positionConstX  ;// 设置 x 坐标

                    } else {
                        positionX = positionConstX + wallInfoList.get(1).getWidth() * scale + wallDepthConst  ;// 设置 x 坐标
                    }
                    
                    //
                    float wall0WidthY = scale * wallInfoList.get(0).getWidth();
                    positionY = 200;                  
                    
                }
            } else if (shapeType.equals("II"))  {
                rotation = 0f;
                height = wallDepthConst;
                positionX = positionConstX;// 设置 x 坐标
                width = wall.getWidth() * scale;
                // 是否有island
            	if (island.getWidth() > 0 ) {
            		float positionY_tmp = Constants.commons.POSITION_CONST_U_Y_SHAPEI;
            		float positionY_tmp_adjust = 65 * scale;
            		if (positionY_tmp_adjust > Constants.commons.POSITION_CONST_U_Y_SHAPEI) {
            			positionY_tmp_adjust = 600;
            		}
            		if ("island".equals(island.getIslandKind())) {
						if (i == 0 ) {
							positionY = positionY_tmp + positionY_tmp_adjust;// 设置 y 坐标
						} else {
							rotation = 180f;
							positionY = positionY_tmp - positionY_tmp_adjust;// 设置 y 坐标
						}
            		} else {
            			// peninsula
            			positionX = positionConstX +  Constants.commons.LOWER_CABINET_DEFAULT_DEPTH * scale;
            			if (i == 0 ) {
            				positionY = positionY_tmp + scale * island.getWidth() + 80;// 设置 y 坐标
            			} else {
            				rotation = 180f;
            				positionY = positionY_tmp - scale * island.getWidth() + 80;// 设置 y 坐标
            			}
            		}
            	} else {
            		if (i == 0 ) {
            			positionY = Constants.commons.POSITION_CONST_U_Y_SHAPEI + 65 * scale;// 设置 y 坐标
            		} else {
            			rotation = 180f;
            			positionY = Constants.commons.POSITION_CONST_U_Y_SHAPEI - 65 * scale;// 设置 y 坐标
            		}
            		 
            	}
            } else {
            	// I ==shapeType
                height = wallDepthConst;
                // 定制的wall的数量不确定，rotation需要从前端读取
                rotation = 0f;
                if (island.getWidth() > 0) {
                	positionY = island.getWidth() * scale +  100;// 设置 y 坐标
//                	positionY = Constants.commons.POSITION_CONST_U_Y_SHAPEI;
                } else {
                	positionY = Constants.commons.POSITION_CONST_U_Y_SHAPEI;
                }
                
//                positionX = positionConstX;// 设置 x 坐标
                if ("peninsula".equals(island.getIslandKind())) {
                	positionX = positionConstX +  Constants.commons.LOWER_CABINET_DEFAULT_DEPTH * scale;
                } else {
                	positionX = positionConstX ;// 设置 x 坐标
                	
                }

                
                width = wall.getWidth() * scale;
            }
            wallObjectName = wallObjectName + wall.getWidth();
            canvasObject.setKitchen(kitchenInfo); // 设置关联的 Kitchen 对象
            canvasObject.setWallid(wall.getId());
            canvasObject.setObjectType(Constants.commons.OBJECT_NAME_WALL); // 设置对象类型，例如 "墙"
            canvasObject.setX(positionX); // 设置 x 坐标
            canvasObject.setY(positionY); // 设置 y 坐标
            canvasObject.setWidth(width); // 设置宽度
            canvasObject.setHeight(height); // 设置高度
            canvasObject.setDepth(wallDepthConst);
            canvasObject.setScale(scale);
            canvasObject.setRotation(rotation); // 设置旋转角度
            canvasObject.setColor(Constants.commons.OBJECT_COLOR_GRAY); // 设置颜色
            canvasObject.setObjectname(wallObjectName);
            canvasObject.setData(wall.toString()); // 设置其他相关数据
            canvasObject.setCreatedAt(Instant.now());
            canvasObject.setUpdatedAt(Instant.now());
            canvasObject.setWidthcabinet(wall.getWidth());
            canvasobjectList.add(canvasObject);
        }

        return canvasobjectList;
    }

    public List<Canvasobject> createIsland(Kitchen kitchenInfo, Island islandInfo, List<Wall> wallInfoList, List<Canvasobject> canvasWallList) {
        logger.info("createIsland kitchenInfo:", kitchenInfo.getId());
        ArrayList<Canvasobject> canvasobjectList = new ArrayList<Canvasobject>();
        if (islandInfo == null) {return null;}
        if (islandInfo.getWidth() == 0) {return null;}
        float x = 0.0f;
        float y = 0.0f;
        float maxWallWidth = 0.0f;
        float positionMaxWall = 0.0f;
        float positionWallY = 0.0f;
        float rotationIsland = 0.0f;
        String wallObjectName = "island" ;
        float width = scale*islandInfo.getWidth();
        float height = Constants.commons.ISLAND_HEIGHT_DEFAULT;
        // 判断厨房类型
        if ("I".equals(kitchenInfo.getShapeType())) {
        	maxWallWidth = wallInfoList.get(0).getWidth();
            positionMaxWall = canvasWallList.get(0).getX();
            positionWallY =  canvasWallList.get(0).getY();
        } else if ("II".equals(kitchenInfo.getShapeType())) {
        	maxWallWidth = Math.max(wallInfoList.get(0).getWidth(), wallInfoList.get(1).getWidth());
            positionMaxWall = canvasWallList.get(0).getX();
            positionWallY =  canvasWallList.get(0).getY();
        } else if ("L".equals(kitchenInfo.getShapeType())) {
        	maxWallWidth = wallInfoList.get(1).getWidth();
            positionMaxWall = canvasWallList.get(1).getX();
            positionWallY =  canvasWallList.get(1).getY();
        } else if ("U".equals(kitchenInfo.getShapeType())) {
        	maxWallWidth = wallInfoList.get(1).getWidth();
            positionMaxWall = canvasWallList.get(1).getX();
            positionWallY =  canvasWallList.get(1).getY();
        }
        String islandType = islandInfo.getIslandKind();
    	if (islandType.equals(Constants.commons.ISLAND_TYPE_ISLAND)) {
    		if ("H".equals(islandInfo.getHorverType())) {
    			// 设置X，Y
    			rotationIsland = 180f;
                x = (maxWallWidth - islandInfo.getWidth()) * scale /2 + positionMaxWall ;
                y = positionWallY - 64 * scale;
    		} else {
    			// 设置X，Y
    			rotationIsland = 270f;
    			
                x = (maxWallWidth) * scale /2 + positionMaxWall;
    			// 查看island的length, 调整X的位置
                if (islandInfo.getLength() == 24) {
                	if (!islandInfo.getIsOverhang()) {
                		x = x + 12 *scale;
                	}                	
                } else if (islandInfo.getLength() == 36) {
                	x = x + 18 *scale;                	
                } else if (islandInfo.getLength() == 48) {
                	// 不需要调整
                	x = x + 24 *scale;
                } else if (islandInfo.getLength() == 60) {
                	x = x +30 *scale;
                	
                } else  {
                	// 不需要调整
                }
                // 44: 24 depth,20 space
                y = positionWallY - 44 * scale;
//                width = Constants.commons.ISLAND_HEIGHT_DEFAULT;
//                height = scale*islandInfo.getWidth();
            }
            
//            } else if (islandInfo.getIslandKind().equals(Constants.commons.ISLAND_TYPE_OVERHANG)) {
//                // 设置X，Y
//                x =  (maxWallWidth - islandInfo.getWidth()) * scale /2 + positionMaxWall;;
//                y = positionWallY - 80 * scale;
//                islandType = Constants.commons.ISLAND_TYPE_OVERHANG;
        } else if (islandType.equals(Constants.commons.ISLAND_TYPE_PENINISULA)) {
        	// 判断岛台的length， 
        	float islandAjustment = 0f;
        	
//        	if (islandInfo.getLength() == 36 && (islandInfo.getIsOverhang() == false) ) {
//        		islandAjustment = scale * 12f;
//        	} else if (islandInfo.getLength() == 48 && (islandInfo.getIsOverhang() == false)) {
//        		islandAjustment = scale * 24f;
//        	} else if (islandInfo.getLength() == 48 && (islandInfo.getIsOverhang() == true)) {
//        		islandAjustment = scale * 12f;
//        	} else if (islandInfo.getLength() == 60 ) {
//        		islandAjustment = scale * 24f;
//        	}
        	
        	// 根据厨房类型判断 
			if ("I".equals(kitchenInfo.getShapeType())) {
				rotationIsland = 90f;
				 // 设置X，Y
                x = canvasWallListC.get(0).getX() ;
                y = canvasWallListC.get(0).getY() - islandInfo.getWidth()*scale + islandAjustment;
//                width = Constants.commons.ISLAND_HEIGHT_DEFAULT;
//                height = scale*islandInfo.getWidth();
				
			} else if ("II".equals(kitchenInfo.getShapeType())) {
//				 width = Constants.commons.ISLAND_HEIGHT_DEFAULT;
//	             height = scale*islandInfo.getWidth();
				 if (islandInfo.getPeninsulaisadjacentto().equals("one")) {
					 rotationIsland = 90f;
					// 设置X，Y
					 x = canvasWallListC.get(0).getX() ;
		             y = canvasWallListC.get(0).getY() - islandInfo.getWidth() * scale + islandAjustment;  
				 } else if (islandInfo.getPeninsulaisadjacentto().equals("two")) {
					 rotationIsland = 270f;
					// 设置X，Y
	                x = canvasWallListC.get(1).getX() + canvasWallListC.get(1).getWidth()- islandAjustment;
	                y = canvasWallListC.get(1).getY() + islandInfo.getWidth() * scale + 20f;
				 }
				 
			} else if ("L".equals(kitchenInfo.getShapeType()) || "U".equals(kitchenInfo.getShapeType())) {
				 if (islandInfo.getPeninsulaisadjacentto().equals("one")) {
					 rotationIsland = 180f;
		                // 设置X，Y
		                x = canvasWallListC.get(0).getX()  + 20f;
		                y = canvasWallListC.get(0).getY() + islandAjustment;
		                
		            } else if (islandInfo.getPeninsulaisadjacentto().equals("two")) {
		            	rotationIsland = 270f;
//		            	width = Constants.commons.ISLAND_HEIGHT_DEFAULT;
//			            height = scale*islandInfo.getWidth();
		            	 // 设置X，Y
		                x = canvasWallListC.get(1).getX() + canvasWallListC.get(1).getWidth() - islandAjustment;
		                y = canvasWallListC.get(1).getY();
		            	
		            } else if (islandInfo.getPeninsulaisadjacentto().equals("three")) {
		            	rotationIsland = 180f;
		                // 设置X，Y
		                x = canvasWallListC.get(2).getX() - islandInfo.getWidth() * scale;
		                y = canvasWallListC.get(2).getY() + islandAjustment;
		            }
			} 
           
        }
        
        
        Canvasobject canvasObject = new Canvasobject();
        
        canvasObject.setKitchen(kitchenInfo); // 设置关联的 Kitchen 对象
        canvasObject.setObjectType(islandType); // 设置对象类型，例如 "墙"
        canvasObject.setX(x); // 设置 x 坐标
        canvasObject.setY(y); // 设置 y 坐标
        canvasObject.setWidth(width); // 设置宽度
        canvasObject.setHeight(height); // 设置高度
        canvasObject.setScale(scale);
        canvasObject.setRotation(rotationIsland); // 设置旋转角度   默认island水平放置
        canvasObject.setColor(Constants.commons.OBJECT_COLOR_GRAY); // 设置颜色
        wallObjectName = wallObjectName + islandInfo.getWidth();
        canvasObject.setObjectname(wallObjectName);
        canvasObject.setData(islandInfo.toString()); // 设置其他相关数据
        canvasObject.setCreatedAt(Instant.now());
        canvasObject.setUpdatedAt(Instant.now());
        canvasObject.setRelatedId(islandInfo.getId());
        canvasObject.setWallid(islandInfo.getId());
        canvasObject.setWidthcabinet(islandInfo.getWidth());
        canvasobjectList.add(canvasObject);
        return canvasobjectList;
    }

    public List<Canvasobject> createWindow(Kitchen kitchenInfo, List<Window> windowList) {
        logger.info("createWindow kitchenInfo:", kitchenInfo.getId());
        List<Canvasobject> canvasobjectList = new ArrayList<Canvasobject>();
        List<Cabinet> cabinetObjectList = new ArrayList<Cabinet>();
        if (windowList == null) {return null;}
        for (int i = 0; i < windowList.size(); i++) {
            Window window = windowList.get(i);
            if (window.getWidth() == 0) continue;
            Canvasobject canvasObject = new Canvasobject();
            float positionX =0f;
            float positionY =0f;
            float rotation = 0f;
            float width = 0;
            float depth = 0;
            Wall wall = window.getWall();
            float paddwidth = 20f;
            if ("I".equals(kitchenInfo.getShapeType()) || "II".equals(kitchenInfo.getShapeType())) {
                paddwidth = 0f;
            }
            for(int j=0; j < canvasWallListC.size(); j++) {
                if (Objects.equals(canvasWallListC.get(j).getWallid(), wall.getId())) {
                    rotation = canvasWallListC.get(j).getRotation();
                    width = window.getWidth() * scale;
                    if (canvasWallListC.get(j).getRotation() == 0 || canvasWallListC.get(j).getRotation() == 180) {
                        if (canvasWallListC.get(j).getRotation() == 0) {
                            positionX = canvasWallListC.get(j).getX() + window.getStartposition() * scale + paddwidth;
                        } else {
                            positionX = canvasWallListC.get(j).getX() + (wall.getWidth() - window.getStartposition()) * scale +paddwidth ;
//                            if ("close".equals(canvasWallListC.get(j).getObjectname())) {
//                                positionX = canvasWallListC.get(j).getX()  +  (canvasWallListC.get(j).getWidth()-scale *window.getStartposition()) - scale *window.getWidth() + paddwidth ;
//                            } else if ("keeptoone".equals(canvasWallListC.get(j).getObjectname())) {
//                                //
//                                positionX = canvasWallListC.get(j).getX()  +  (canvasWallListC.get(j).getWidth()-scale *window.getStartposition())- scale *window.getWidth()  + paddwidth ;
//                            } else if ("keeptothree".equals(canvasWallListC.get(j).getObjectname())) {
//                                //
//                                positionX = canvasWallListC.get(j).getX()  +  (canvasWallListC.get(j).getWidth()-scale *window.getStartposition())- scale *window.getWidth()  ;
//                            }
                        }
                        positionY = canvasWallListC.get(j).getY();

                        depth = canvasWallListC.get(j).getDepth();
                    } else if (canvasWallListC.get(j).getRotation() == 90 || canvasWallListC.get(j).getRotation() == 270) {
                        depth = wallDepthConst;
                       
                        if (j == 0) {
                            positionX = canvasWallListC.get(j).getX();
                            positionY = canvasWallListC.get(j).getY() + scale * window.getStartposition();
                        } else if (j == 2) {
                            positionX = canvasWallListC.get(j).getX() ;
                            positionY = canvasWallListC.get(j).getY() + scale * (wall.getWidth()-window.getStartposition());
                        }
                    } else {
                        // others
                    }
                    break;
                }
            }
            
           Cabinet cabinetWindow = new Cabinet(window.getHeight(),0f,window.getWindowName(),
            		window.getWidth(),kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.OBJECT_TYPE_WINDOW,
                    Constants.commons.CANBINET_TYPE_UPPER, window.getStartposition(),(int)depth, wall.getAngle(),"","");
            cabinetObjectList.add(cabinetWindow);
            cabinetRepository.save(cabinetWindow);
            
            canvasObject.setKitchen(kitchenInfo); // 设置关联的 Kitchen 对象
            canvasObject.setWallid(wall.getId());
            canvasObject.setObjectType(Constants.commons.OBJECT_TYPE_WINDOW); // 设置对象类型，例如 "墙"
            canvasObject.setX(positionX); // 设置 x 坐标
            canvasObject.setY(positionY); // 设置 y 坐标
            canvasObject.setWidth(width); // 设置宽度
            canvasObject.setDepth(depth);
            canvasObject.setScale(scale);
            canvasObject.setDepth(Constants.commons.WINDOW_DEPTH_DEFAULT); // 设置深度
            canvasObject.setHeight(window.getHeight()* scale);
            canvasObject.setRotation(rotation); // 设置旋转角度
            canvasObject.setColor(Constants.commons.OBJECT_COLOR_WHITE); // 设置颜色
            canvasObject.setData(window.toString()); // 设置其他相关数据
            canvasObject.setCreatedAt(Instant.now());
            canvasObject.setUpdatedAt(Instant.now());
            canvasObject.setWidthcabinet(window.getWidth());
            canvasobjectList.add(canvasObject);
        }
        
        //
//        cabinetObjectList
        return canvasobjectList;
    }

    public List<Canvasobject> createDoor(Kitchen kitchenInfo, List<Door> doorList) {
        logger.info("createDoor createIsland:", kitchenInfo.getId());
        List<Canvasobject> canvasobjectList = new ArrayList<Canvasobject>();
        if (doorList == null) {return null;}
        for (int i = 0; i < doorList.size(); i++) {
            Door door = doorList.get(i);
            if (door.getWidth() == 0) continue;
            Canvasobject canvasObject = new Canvasobject();
            float positionX =0f;
            float positionY =0f;
            float rotation = 0f;
            float width = door.getWidth() * scale;
            Wall wall = door.getWall();
            float depth = 0f;
            float paddwidth = 20f;
            if ("I".equals(kitchenInfo.getShapeType()) || "II".equals(kitchenInfo.getShapeType())) {
                paddwidth = 0f;
            }
            for(int j=0; j < canvasWallListC.size(); j++) {
                if (Objects.equals(canvasWallListC.get(j).getWallid(), wall.getId())) {
                	
                    depth = canvasWallListC.get(j).getDepth();
                    rotation = canvasWallListC.get(j).getRotation();
                    if (canvasWallListC.get(j).getRotation() == 0 || canvasWallListC.get(j).getRotation() == 180) {
                        if (canvasWallListC.get(j).getRotation() == 0) {
                            positionX = canvasWallListC.get(j).getX() + door.getStartposition() * scale + paddwidth;
                        } else {
                            positionX = canvasWallListC.get(j).getX() + (wall.getWidth() - door.getStartposition()) * scale +paddwidth;
//                            if ("close".equals(canvasWallListC.get(j).getObjectname())) {
//                                positionX = canvasWallListC.get(j).getX() +  (canvasWallListC.get(j).getWidth()-scale *door.getStartposition()) - scale *door.getWidth()+ paddwidth ;
//
//                            } else if ("keeptoone".equals(canvasWallListC.get(j).getObjectname())) {
//                                //
//                                positionX = canvasWallListC.get(j).getX() +  (canvasWallListC.get(j).getWidth()-scale *door.getStartposition())- scale *door.getWidth() + paddwidth ;
//
//                            } else if ("keeptothree".equals(canvasWallListC.get(j).getObjectname())) {
//                                //
//                                positionX = canvasWallListC.get(j).getX() +  (canvasWallListC.get(j).getWidth()-scale *door.getStartposition()) - scale *door.getWidth();
//
//                            }
                        }
                        positionY = canvasWallListC.get(j).getY();
                        depth = canvasWallListC.get(j).getDepth();
                    } else if (canvasWallListC.get(j).getRotation() == 90 || canvasWallListC.get(j).getRotation() == 270) {
                        if (j == 0) {
                            positionX = canvasWallListC.get(j).getX() ;
                            positionY = canvasWallListC.get(j).getY() + scale * door.getStartposition();
                        } else if (j == 2) {
                            positionX = canvasWallListC.get(j).getX();
                            positionY = canvasWallListC.get(j).getY() + scale * (wall.getWidth()-door.getStartposition() );
                        }
                        depth = canvasWallListC.get(j).getDepth();
                    } else {
                        // others
                    }
                    break;
                }
            }
            Cabinet cabinetDoor = new Cabinet(door.getHeight(),0f,door.getDoorName(),
            		door.getWidth(),kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.OBJECT_TYPE_DOOR,
                    Constants.commons.CANBINET_TYPE_LOWER, door.getStartposition(),0, wall.getAngle(),"","");
            cabinetRepository.save(cabinetDoor);
            
            canvasObject.setKitchen(kitchenInfo); // 设置关联的 Kitchen 对象
            canvasObject.setWallid(wall.getId());
            canvasObject.setObjectType(Constants.commons.OBJECT_TYPE_DOOR); // 设置对象类型，例如 "墙"
            canvasObject.setX(positionX); // 设置 x 坐标
            canvasObject.setY(positionY); // 设置 y 坐标
            canvasObject.setWidth(width); // 设置宽度
            canvasObject.setWidth(width); // 设置宽度
            canvasObject.setDepth(depth);
            canvasObject.setDepth(Constants.commons.DOOR_DEPTH_DEFAULT); // 设置高度
            canvasObject.setHeight(door.getHeight()* scale);
            canvasObject.setRotation(rotation); // 设置旋转角度
            canvasObject.setColor(Constants.commons.OBJECT_COLOR_WHITE); // 设置颜色
            canvasObject.setData(door.toString()); // 设置其他相关数据
            canvasObject.setCreatedAt(Instant.now());
            canvasObject.setUpdatedAt(Instant.now());
            canvasObject.setWidthcabinet(door.getWidth());
            canvasobjectList.add(canvasObject);
        }
        return canvasobjectList;
    }
    public List<Canvasobject> createAppliance(Kitchen kitchenInfo, List<Appliance> applianceList) {
        logger.info("createAppliance kitchenInfo:", kitchenInfo.getId());
        List<Canvasobject> canvasobjectList = new ArrayList<Canvasobject>();
        if (applianceList == null) {return null;}
        // Refrigerator
        // Diswasher
        // Range
        for (int i = 0; i < applianceList.size(); i++) {
            Appliance appliance = applianceList.get(i);

            if (appliance.getWidth() == 0) continue;
            if (Constants.commons.APPLIANCES_NAME_HOOD.equals(appliance.getAppliancekind())) continue;
            
            float positionX =0f;
            float positionY =0f;
            float positionWallX =0f;
            float positionWallY =0f;
            float rotation = 0f;
            float width = 0f;
            float position = 0f;
            float height = 0f;
            Integer wallid =0;
            String applianceText = null;
            
            int wallNumber = 100;
            String wallIslandFlg = "";
            float paddwidth = 20f;
            if ("I".equals(kitchenInfo.getShapeType()) || "II".equals(kitchenInfo.getShapeType())) {
                paddwidth = 0f;
            }
            String objectType ;

            if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(appliance.getAppliancekind())) {
                applianceText = Constants.commons.APPLIANCES_NAME_REFRIGERATOR_ABBR+ (int)appliance.getWidth().floatValue();
                objectType = "high";
            } else if (Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(appliance.getAppliancekind())) {
                applianceText = Constants.commons.APPLIANCES_NAME_DISHWASHER_ABBR+ (int)appliance.getWidth().floatValue();
                objectType = "lower";
            } else if (Constants.commons.APPLIANCES_NAME_RANGE.equals(appliance.getAppliancekind())){
                applianceText = Constants.commons.APPLIANCES_NAME_RANGE_ABBR+ (int)appliance.getWidth().floatValue();
                objectType = "lower";
            } else {
            	applianceText = Constants.commons.APPLIANCES_NAME_HOOD_ABBR+ (int)appliance.getWidth().floatValue();
            	objectType = "upper";
            }
            Canvasobject canvasObject = new Canvasobject();

            Wall wall = appliance.getWall();
            Island island = appliance.getIsland();
            String islandHorverType = null;
            if(wall != null) {
                for(int j=0; j < canvasWallListC.size(); j++) {
                    if (Objects.equals(canvasWallListC.get(j).getWallid(), wall.getId())) {                    	
                        wallNumber = j  ;
                        rotation =canvasWallListC.get(j).getRotation();
                        positionWallX = canvasWallListC.get(j).getX();
                        positionWallY = canvasWallListC.get(j).getY();
                        wallid = wall.getId();
                        wallIslandFlg = "wall";
                        break;
                    }
                }
            } else {
                for(int j=0; j < canvasIslandListC.size(); j++) {
                    if (Objects.equals(canvasIslandListC.get(j).getRelatedId(), island.getId())) {                    	
                    	wallNumber = j  ;
                        positionWallX = canvasIslandListC.get(j).getX();
                        positionWallY = canvasIslandListC.get(j).getY();
                        wallid = island.getId();
                        wallIslandFlg = "island";
                        objectType="islandiner";
                        islandHorverType = island.getHorverType();
                        if ("H".equals(islandHorverType)) {
                        	rotation = 180;
                        } else {
                        	rotation = 270;
                        }
                        break;
                    }
                }
            }
            width = scale * appliance.getWidth();
            height = scale * appliance.getHeight();
//            if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(appliance.getAppliancekind())) {
//                String constr = kitchenInfo.getConstruction1().substring(0, 3);
//                if ("BC1".equals(constr)) { // 1000series
//                    position = appliance.getPosition() + Constants.commons.CANBINET_WIDTH_RRP;
//                } else {
//                    position = appliance.getPosition() + Constants.commons.CANBINET_WIDTH_PNB;
//                }
//
//            } else {
//                position = appliance.getPosition();
//            }
            position = appliance.getPosition();
            if (rotation == 0  ) {
            	if ("wall".equals(wallIslandFlg)) {
            		positionX = positionWallX + scale * position + paddwidth;
            		positionY = positionWallY - scale*Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
            	} else {
	    			positionX = positionWallX + scale * position;
	        		positionY = positionWallY - scale*Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
               	}
            } else if (rotation == 180 ) {
            	if ("wall".equals(wallIslandFlg)) {
            		positionX = positionWallX +  (canvasWallListC.get(wallNumber).getWidth()-scale *position) ;
                    positionY = positionWallY + 20f;
                    if ("close".equals(canvasWallListC.get(wallNumber).getObjectname())) {
                        positionX = positionWallX +  (canvasWallListC.get(wallNumber).getWidth()-scale *position) + paddwidth ;
                        positionY = positionWallY  + 20f;
                    } else if ("keeptoone".equals(canvasWallListC.get(wallNumber).getObjectname())) {
                        //
                        positionX = positionWallX +  (canvasWallListC.get(wallNumber).getWidth()-scale *position) + paddwidth ;
                        positionY = positionWallY +  20f;
                    } else if ("keeptothree".equals(canvasWallListC.get(wallNumber).getObjectname())) {
                        //
                        positionX = positionWallX +  (canvasWallListC.get(wallNumber).getWidth()-scale *position) ;
                        positionY = positionWallY +  20f;
                    }
            	} else {
                    positionX = positionWallX + canvasIslandListC.get(wallNumber).getWidth()-scale *position;
                    positionY = positionWallY ;
            	}           	
                
            } else if (rotation == 90 || rotation == 270 ) {
            	if ("wall".equals(wallIslandFlg)) {
            		if (wallNumber == 0) {
                        positionX = positionWallX+paddwidth ;
                        positionY = positionWallY + scale * position;

                    } else if (wallNumber == 2) {
                        positionX = positionWallX - scale * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
                        positionY = positionWallY + scale * (wall.getWidth()- position );
                    }
            	} else {
            		if (rotation == 90) {
            			positionX = positionWallX + scale * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
                        positionY = positionWallY +  scale * (island.getWidth()- position );
            		} else {
            			positionY = positionWallY - scale * position;
                        positionX = positionWallX - scale *  Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
            		}
            		
                }
            }
           
            

            canvasObject.setKitchen(kitchenInfo); // 设置关联的 Kitchen 对象
            canvasObject.setObjectname(applianceText);
            canvasObject.setCabinettype(appliance.getAppliancekind());
            canvasObject.setObjectType(objectType); // 设置对象类型，例如 "墙"
            canvasObject.setWallid(wallid);
            canvasObject.setScale(scale);
            canvasObject.setX(positionX); // 设置 x 坐标
            canvasObject.setY(positionY); // 设置 y 坐标
            canvasObject.setWidth(width); // 设置宽度
            canvasObject.setDepth(scale * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH); // 设置高度
            canvasObject.setHeight(height);
            canvasObject.setRotation(rotation); // 设置旋转角度
            canvasObject.setColor(Constants.commons.OBJECT_COLOR_APPLIANCE); // 设置颜色
            canvasObject.setData(appliance.toString()); // 设置其他相关数据
            canvasObject.setCreatedAt(Instant.now());
            canvasObject.setUpdatedAt(Instant.now());
            canvasObject.setRelatedId(appliance.getId());
            canvasObject.setWidthcabinet(appliance.getWidth());
            canvasobjectList.add(canvasObject);
        }
        return canvasobjectList;
    }
    public List<Canvasobject> createApplianceFromCab(Kitchen kitchenInfo, Cabinet applianceCab) {
        logger.info("createAppliance kitchenInfo:", kitchenInfo.getId());
        List<Canvasobject> canvasobjectList = new ArrayList<Canvasobject>();
        if (applianceCab == null) {return null;}


            if (applianceCab.getWidth() == 0) return null;
            if (Constants.commons.APPLIANCES_NAME_HOOD.equals(applianceCab.getName())) return null;
            
            float positionX =0f;
            float positionY =0f;
            float positionWallX =0f;
            float positionWallY =0f;
            float rotation = 0f;
            float width = 0f;
            float position = 0f;
            float height = 0f;
            Integer wallId =0;
            String applianceText = null;
            
            int wallNumber = 100;
            String wallIslandFlg = "";
            float paddwidth = 20f;
            if ("I".equals(kitchenInfo.getShapeType()) || "II".equals(kitchenInfo.getShapeType())) {
                paddwidth = 0f;
            }
            String objectType ;

            if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(applianceCab.getName())) {
                applianceText = Constants.commons.APPLIANCES_NAME_REFRIGERATOR_ABBR+ (int)applianceCab.getWidth().floatValue();
                objectType = "high";
            } else if (Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(applianceCab.getName())) {
                applianceText = Constants.commons.APPLIANCES_NAME_DISHWASHER_ABBR+ (int)applianceCab.getWidth().floatValue();
                objectType = "lower";
            } else if (Constants.commons.APPLIANCES_NAME_RANGE.equals(applianceCab.getName())){
                applianceText = Constants.commons.APPLIANCES_NAME_RANGE_ABBR+ (int)applianceCab.getWidth().floatValue();
                objectType = "lower";
            } else {
            	applianceText = Constants.commons.APPLIANCES_NAME_HOOD_ABBR+ (int)applianceCab.getWidth().floatValue();
            	objectType = "upper";
            }
            Canvasobject canvasObject = new Canvasobject();

            wallId = applianceCab.getWallid();
//            Island island = appliance.getIsland();
            String islandHorverType = null;
            for(int j=0; j < canvasWallListC.size(); j++) {
                if (Objects.equals(canvasWallListC.get(j).getWallid(), wallId)) {
                	
                    wallNumber = j  ;
                    rotation =canvasWallListC.get(j).getRotation();
                    positionWallX = canvasWallListC.get(j).getX();
                    positionWallY = canvasWallListC.get(j).getY();
                    wallIslandFlg = "wall";
                    break;
                }
            }
            if (wallNumber == 100) {
            	for(int j=0; j < canvasIslandListC.size(); j++) {
                    if (Objects.equals(canvasIslandListC.get(j).getRelatedId(), wallId)) {                    	
                    	wallNumber = j  ;
                        positionWallX = canvasIslandListC.get(j).getX();
                        positionWallY = canvasIslandListC.get(j).getY();
                        wallIslandFlg = "island";
                        objectType="islandiner";
                        rotation = canvasIslandListC.get(j).getRotation();
//                        islandHorverType = island.getHorverType();
//                        if ("H".equals(islandHorverType)) {
//                        	rotation = 180;
//                        } else {
//                        	rotation = 270;
//                        }
                        break;
                    }
                }
            }
                

            width = scale * applianceCab.getWidth();
            height = scale * applianceCab.getHeight();
            position = applianceCab.getStartposition();
            if (rotation == 0  ) {
            	if ("wall".equals(wallIslandFlg)) {
            		positionX = positionWallX + scale * position + paddwidth;
            		positionY = positionWallY - scale*Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
            	} else {
	    			positionX = positionWallX + scale * position;
	        		positionY = positionWallY - scale*Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
               	}
            } else if (rotation == 180 ) {
            	if ("wall".equals(wallIslandFlg)) {
            		positionX = positionWallX +  (canvasWallListC.get(wallNumber).getWidth()-scale *position) ;
                    positionY = positionWallY + 20f;
                    if ("close".equals(canvasWallListC.get(wallNumber).getObjectname())) {
                        positionX = positionWallX +  (canvasWallListC.get(wallNumber).getWidth()-scale *position) + paddwidth ;
                        positionY = positionWallY  + 20f;
                    } else if ("keeptoone".equals(canvasWallListC.get(wallNumber).getObjectname())) {
                        //
                        positionX = positionWallX +  (canvasWallListC.get(wallNumber).getWidth()-scale *position) + paddwidth ;
                        positionY = positionWallY +  20f;
                    } else if ("keeptothree".equals(canvasWallListC.get(wallNumber).getObjectname())) {
                        //
                        positionX = positionWallX +  (canvasWallListC.get(wallNumber).getWidth()-scale *position) ;
                        positionY = positionWallY +  20f;
                    }
            	} else {
                    positionX = positionWallX + canvasIslandListC.get(wallNumber).getWidth()-scale *position;
                    positionY = positionWallY ;
            	}           	
                
            } else if (rotation == 90 || rotation == 270 ) {
            	if ("wall".equals(wallIslandFlg)) {
            		if (wallNumber == 0) {
                        positionX = positionWallX+paddwidth ;
                        positionY = positionWallY + scale * position;

                    } else if (wallNumber == 2) {
                        positionX = positionWallX - scale * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
                        positionY = positionWallY + canvasWallListC.get(wallNumber).getWidth()- scale * (position );
                    }
            	} else {
            		if (rotation == 90) {
            			positionX = positionWallX ;
                        positionY = positionWallY +  + scale * (position );
            		} else {
            			positionY = positionWallY - scale * position;
                        positionX = positionWallX - scale *  Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
            		}
            		
                }
            }
           
            

            canvasObject.setKitchen(kitchenInfo); // 设置关联的 Kitchen 对象
            canvasObject.setObjectname(applianceText);
            canvasObject.setCabinettype(applianceCab.getName());
            canvasObject.setObjectType(objectType); // 设置对象类型，例如 "墙"
            canvasObject.setWallid(wallId);
            canvasObject.setScale(scale);
            canvasObject.setX(positionX); // 设置 x 坐标
            canvasObject.setY(positionY); // 设置 y 坐标
            canvasObject.setWidth(width); // 设置宽度
            canvasObject.setDepth(scale * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH); // 设置高度
            canvasObject.setHeight(height);
            canvasObject.setRotation(rotation); // 设置旋转角度
            canvasObject.setColor(Constants.commons.OBJECT_COLOR_APPLIANCE); // 设置颜色
            canvasObject.setData(applianceCab.toString()); // 设置其他相关数据
            canvasObject.setCreatedAt(Instant.now());
            canvasObject.setUpdatedAt(Instant.now());
            canvasObject.setRelatedId(applianceCab.getId());
            canvasObject.setWidthcabinet(applianceCab.getWidth());
            canvasobjectList.add(canvasObject);
        
        return canvasobjectList;
    }

    public List<Canvasobject> createApplianceUpper(Kitchen kitchenInfo, List<Appliance> applianceList, List<Window> windowList) {
        logger.info("createApplianceUpper kitchenInfo:", kitchenInfo.getId());
        List<Canvasobject> canvasobjectList = new ArrayList<Canvasobject>();
        if (applianceList == null) {return null;}
        
        // Refrigerator
        // Diswasher
        
        // Range
        for (int i = 0; i < applianceList.size(); i++) {
            Appliance appliance = applianceList.get(i);
            Island island = appliance.getIsland();
            Integer wallid =0;
            String wallIslandFlg = "";
            if (appliance.getWidth() == 0) continue;
            float positionX =0f;
            float positionY =0f;
            float positionWallX =0f;
            float positionWallY =0f;
            float rotation = 0f;
            float width = 0f;
            float position = 0f;
            float depth = 0f;
            float height = Constants.commons.APPLIANCES_BASE_HEIGHT;
            String applianceText = null;
            String objectType = null;
            int wallNumber = 100;
            float paddwidth = 20f;
                        
            if ("I".equals(kitchenInfo.getShapeType()) || "II".equals(kitchenInfo.getShapeType())) {
                paddwidth = 0f;
            }
//            if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(appliance.getAppliancekind())) {
//                applianceText = Constants.commons.APPLIANCES_NAME_REFRIGERATOR_ABBR+ (int)appliance.getWidth().floatValue();;
//            } else
            if (Constants.commons.APPLIANCES_NAME_HOOD.equals(appliance.getAppliancekind())) {
                applianceText = Constants.commons.APPLIANCES_NAME_HOOD_ABBR+ (int)appliance.getWidth().floatValue();;
//                objectType = Constants.commons.APPLIANCES_NAME_HOOD;
                objectType = "upper";
             // 检查appliance的位置，如果和window位置冲突，就不生成了。
                boolean hasIntersection = false;
                for (int w = 0; w < windowList.size(); w++) {
                	if (windowList.get(w).getWall().getId() == appliance.getWall().getId()) {
                		float windowPos = windowList.get(w).getStartposition();
                		float windowWidth = windowList.get(w).getWidth();
                		float appliancePos = appliance.getPosition();
                		float applianceWidth  = appliance.getWidth();
                		// 检查两个区间是否有交集
                		hasIntersection = !(windowPos + windowWidth <= appliancePos || appliancePos + applianceWidth <= windowPos);

                		if (hasIntersection) {
                		    // 存在交集的处理逻辑
                			break;
                		} else {
                		    // 不存在交集的处理逻辑
                		}
                	}
                }
                if (hasIntersection) {
                	continue;
                }
            } else {
                continue;
            }
            Canvasobject canvasObject = new Canvasobject();

            Wall wall = appliance.getWall();
            if(wall != null) {
                for(int j=0; j < canvasWallListC.size(); j++) {
                    if (Objects.equals(canvasWallListC.get(j).getWallid(), wall.getId())) {
                    	
                        wallNumber = j  ;
                        positionWallX = canvasWallListC.get(j).getX();
                        positionWallY = canvasWallListC.get(j).getY();
                        rotation = canvasWallListC.get(j).getRotation();
                        wallIslandFlg = "wall";
                        break;
                    }
                }
            } else {
                for(int j=0; j < canvasIslandListC.size(); j++) {
                    if (Objects.equals(canvasIslandListC.get(j).getRelatedId(), island.getId())) {                    	
                    	wallNumber = j  ;
                        positionWallX = canvasIslandListC.get(j).getX();
                        positionWallY = canvasIslandListC.get(j).getY();
                        wallid = island.getId();
                        wallIslandFlg = "island";
                        break;
                    }
                }
            }
            width = scale * appliance.getWidth();
            if (Constants.commons.APPLIANCES_NAME_HOOD.equals(appliance.getAppliancekind())) {
                position = appliance.getPosition();
                depth = scale * Constants.commons.UPPER_HOOD_DEFAULT_DEPTH;
            }
            if (rotation == 0  ) {
            	if ("wall".equals(wallIslandFlg)) {
            		positionX = positionWallX + scale * position + paddwidth;
            		positionY = positionWallY - scale*Constants.commons.UPPER_CABINET_DEFAULT_WIDTH;
            	} else {
            		positionX = positionWallX + scale * position;
            		positionY = positionWallY ;
            	}
            }else if (rotation == 180) {
            	if ("wall".equals(wallIslandFlg)) {
                    positionX = positionWallX + canvasWallListC.get(wallNumber).getWidth()-scale *position +  paddwidth;
                    positionY = positionWallY + 20f;
                    //positionY = positionWallY - scale*Constants.commons.UPPER_CABINET_DEFAULT_WIDTH;
                    if ("close".equals(canvasWallListC.get(wallNumber).getObjectname())) {
	                    positionX = positionWallX +  (canvasWallListC.get(wallNumber).getWidth()-scale *position) + paddwidth ;
	                    positionY = positionWallY  + 20f;
	                } else if ("keeptoone".equals(canvasWallListC.get(wallNumber).getObjectname())) {
	                    //
	                    positionX = positionWallX +  (canvasWallListC.get(wallNumber).getWidth()-scale *position)+ paddwidth ;
	                    positionY = positionWallY +  20f;
	                } else if ("keeptothree".equals(canvasWallListC.get(wallNumber).getObjectname())) {
	                    //
	                    positionX = positionWallX +  (canvasWallListC.get(wallNumber).getWidth()-scale *position) ;
	                    positionY = positionWallY +  20f;
	                }
                } else {
                    // positionX = positionWallX + scale * (wall.getWidth()-position) ;
                    // positionY = positionWallY ;
                	positionX = positionWallX + canvasIslandListC.get(wallNumber).getWidth()-scale *position + scale *appliance.getWidth()- scale *appliance.getWidth();
                    positionY = positionWallY - scale*Constants.commons.UPPER_CABINET_DEFAULT_WIDTH;
                }
            } else if (rotation == 90 || rotation == 270) {
                if (wallNumber == 0) {
                    positionX = positionWallX +paddwidth;
                    positionY = positionWallY + scale * position;

                } else if (wallNumber == 2) {
                    positionX = positionWallX - scale * Constants.commons.UPPER_CABINET_DEFAULT_WIDTH;
                    positionY = positionWallY + scale * (wall.getWidth()-position);
                }
                else {
                    // nothing
                }
            }

            canvasObject.setKitchen(kitchenInfo); // 设置关联的 Kitchen 对象
            canvasObject.setObjectname(applianceText);
            canvasObject.setObjectType(objectType); // 设置对象类型，例如 "墙"
            canvasObject.setCabinettype(appliance.getAppliancekind());
            canvasObject.setWallid(wall.getId());
            canvasObject.setX(positionX); // 设置 x 坐标
            canvasObject.setY(positionY); // 设置 y 坐标
            canvasObject.setWidth(width); // 设置宽度
            canvasObject.setDepth(depth); // 设置深度
            canvasObject.setScale(scale);
            canvasObject.setHeight(height); // 设置高度
            canvasObject.setRotation(rotation); // 设置旋转角度
            canvasObject.setColor(Constants.commons.OBJECT_COLOR_APPLIANCE); // 设置颜色
            canvasObject.setData(appliance.toString()); // 设置其他相关数据
            canvasObject.setCreatedAt(Instant.now());
            canvasObject.setUpdatedAt(Instant.now());
            canvasObject.setRelatedId(appliance.getId());
            canvasObject.setWidthcabinet(appliance.getWidth());
            canvasobjectList.add(canvasObject);
        }
        return canvasobjectList;
    }

    public List<Canvasobject> createCabinet(Kitchen kitchenInfo, List<Wall> wallInfoList, Island island, List<Window> windowList, List<Door> doorList, List<Appliance> applianceList,List<Cabinetsrule> cabinetsruleList) {
        logger.info("createCabinet kitchenInfo:", kitchenInfo.getId());
        List<Canvasobject> canvasobjectList = new ArrayList<Canvasobject>();
        if (cabinetsruleList == null) {return null;}
        ArrayList<List<Cabinet>> cabinetObject = designCabinetLower(kitchenInfo, wallInfoList, island, windowList, doorList, applianceList, cabinetsruleList);
        for (int i = 0; i < cabinetObject.size(); i++) {
            List<Cabinet> cabinetList = cabinetObject.get(i);
            for (int j = 0; j < cabinetList.size(); j++) {
                Cabinet cabinet = (Cabinet)cabinetList.get(j);
                Integer relatedid2 = 0;                
                // 取得releatedID2
                if ("BLS".equals(cabinet.getCabinettype()) ||
                        "BBCL".equals(cabinet.getCabinettype()) ||
                        "BBCR".equals(cabinet.getCabinettype()) ||
                        "WBCL".equals(cabinet.getCabinettype()) ||
                        "WBCR".equals(cabinet.getCabinettype()) ||
                        "WDC".equals(cabinet.getCabinettype())) {
//                    Float startPosition = cabinet.getStartposition();
                    for (int l = 0; l < cabinetObject.size(); l++) {
                        List cabinetListCorner = cabinetObject.get(l);
                        for (int m = 0; m < cabinetListCorner.size(); m++) {
                            Cabinet cabinetCorner = (Cabinet) cabinetListCorner.get(m);
                            if (cabinet.getCornerKey().equals(cabinetCorner.getCornerKey()) && cabinet.getId() != cabinetCorner.getId())
                            {
                            	relatedid2 = cabinetCorner.getId();
                                break;
                            }
                        }
                        if (relatedid2!=0) break;
                    }
                }
                Canvasobject canvasObject = createCabinetObject(cabinet, relatedid2, kitchenInfo, canvasWallListC, canvasIslandListC, scale);
                if (canvasObject != null) {
                	canvasobjectList.add(canvasObject);
                }
                
            }
        }
        return canvasobjectList;
    }
    
    public Canvasobject createCabinetObject(Cabinet cabinet, Integer relatedid2, Kitchen kitchenInfo, List<Canvasobject> canvasWallList, List<Canvasobject> canvasIslandListC, float scaleC) {
        logger.info("createCabinetObject cabinetId:", cabinet.getId());
        if (cabinet == null) {return null;}
        if (cabinet.getWidth() == 0 && !Constants.commons.CANBINET_TYPE_SP.equals(cabinet.getCabinettype())) return null;
        if (Constants.commons.CANBINET_TYPE_SP.equals(cabinet.getCabinettype()) && cabinet.getWidth() == 0) {
        	cabinet.setWidth(Constants.commons.CANBINET_WIDTH_SPPAD);
        }
        if (Constants.commons.OBJECT_TYPE_APPLIANCE.equals(cabinet.getCabinettype()) ) {
        	List<Canvasobject> canvasApplianceList = createApplianceFromCab(kitchenInfo, cabinet);
        	if (canvasApplianceList != null) {
        		return canvasApplianceList.get(0);
        	}                	
        }
        if (Constants.commons.OBJECT_TYPE_WINDOW.equals(cabinet.getCabinettype())  ||
                Constants.commons.OBJECT_TYPE_DOOR.equals(cabinet.getCabinettype())) return null;
        float positionX =0f;
        float positionY =0f;
        float positionWallX =0f;
        float positionWallY =0f;
        float rotation = 0f;
        float width = 0f;
        float height = 0f;
        float depth =scaleC * cabinet.getDepth();
        String wallObjectName = null;
        int wallNumber = 100;
        float paddwidth = 20f;
        Canvasobject canvasObject = new Canvasobject();
        if ("I".equals(kitchenInfo.getShapeType()) || "II".equals(kitchenInfo.getShapeType())) {
            paddwidth = 0f;
        }
        if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_LOWER) ||
                cabinet.getType().equals(Constants.commons.CANBINET_TYPE_UPPER ) ||
                cabinet.getType().equals(Constants.commons.CANBINET_TYPE_HIGH )) {
            for(int k=0; k < canvasWallList.size(); k++) {
            	if (Objects.equals(cabinet.getWallid(), canvasWallList.get(k).getWallid())) {
                    wallNumber = k  ;
                    rotation = canvasWallList.get(k).getRotation();
                    positionWallX = canvasWallList.get(k).getX();
                    positionWallY = canvasWallList.get(k).getY();
                    wallObjectName = canvasWallList.get(k).getObjectname();
                    break;
                }
            }
        } else {
            for(int k=0; k < canvasIslandListC.size(); k++) {                  		
                if (Objects.equals(cabinet.getWallid(), canvasIslandListC.get(k).getRelatedId())) {
                	wallNumber = k  ;
                	rotation = cabinet.getRotation();
                	positionWallX = canvasIslandListC.get(k).getX();
                    positionWallY = canvasIslandListC.get(k).getY();
                	if (rotation == 0) {
                		positionWallX = canvasIslandListC.get(k).getX() + canvasIslandListC.get(k).getWidth();
                	}
                    
                    break;
                } else {

                }
            }
        }
        if (positionWallX == 0 || positionWallY == 0) {
            //  发生了错误！！！
        }
        //rotation = 0;
        width = scaleC * cabinet.getWidth();
        if (rotation == 0 ) {
            if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_LOWER) ) {
                positionX = positionWallX + scaleC * cabinet.getStartposition() +paddwidth;
                positionY = positionWallY - scaleC * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
                height = scaleC * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
                depth = scaleC * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
            } else if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_UPPER) ) {
                positionX = positionWallX + scaleC * cabinet.getStartposition() +paddwidth;
                positionY = positionWallY - scaleC * Constants.commons.UPPER_CABINET_DEFAULT_WIDTH;
                height = scaleC * Constants.commons.UPPER_CABINET_DEFAULT_HEIGHT;
                depth = scaleC * Constants.commons.UPPER_CABINET_DEFAULT_DEPTH;
            } else if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_HIGH) ) {
                positionX = positionWallX + scaleC * cabinet.getStartposition() +paddwidth;
                positionY = positionWallY - scaleC * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
                depth = scaleC * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
                height = scaleC * cabinet.getHeight();
            }
            else if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_ISLAND_INER) ) {
                positionX = positionWallX + scaleC * cabinet.getStartposition() ;
                positionY = positionWallY - scaleC * cabinet.getDepth();
                height = scaleC * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
                depth = scaleC * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
            } else if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_ISLAND_OUTER) ) {
            	positionX = positionWallX - scaleC * (cabinet.getStartposition() + cabinet.getWidth()) ;
                positionY = positionWallY - scaleC * cabinet.getDepth();
                height = scaleC * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
                depth = scaleC * cabinet.getDepth();
//                        positionX = positionWallX + scale * cabinet.getStartposition() ;
//
//                        if (island.getLength() == 48f && island.getIslandKind().equals(Constants.commons.ISLAND_TYPE_OVERHANG)) {
//                            height = scale * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
//                            positionY = positionWallY - scale * Constants.commons.ISLAND_OVERHANGE_DEFAULT_DEPTH;
//                            depth = scale *Constants.commons.ISLAND_OVERHANGE_DEFAULT_DEPTH;
//                        } else if (island.getLength() == 36f || island.getLength() == 60f) {
//                            height = scale * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
//                            positionY = positionWallY - scale * Constants.commons.ISLAND_OVERHANGE_DEFAULT_DEPTH;
//                            depth = scale *Constants.commons.ISLAND_OVERHANGE_DEFAULT_DEPTH;
//                        }else {
//                            height = scale * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
//                            positionY = positionWallY - scale * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
//                            depth = scale * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
//                        }
            } else {
                // no
            }
        } else if ( rotation == 180) {
            if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_LOWER) ) {
                if ("close".equals(wallObjectName)) {
                    //
                    positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) + 20f ;
                    positionY = positionWallY +  20f;
                } else if ("keeptoone".equals(wallObjectName)) {
                    //
                    positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) + 20f ;
                    positionY = positionWallY +  20f;
                } else if ("keeptothree".equals(wallObjectName)) {
                    //
                    positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition());
                    positionY = positionWallY +  20f;
                } else {
                	positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition());
                    positionY = positionWallY +  20f;
                }
                height = scaleC * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
                depth = scaleC * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
            } else if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_UPPER) ) {
                if ("close".equals(wallObjectName)) {
                    //
                    positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) + 20f ;
                    positionY = positionWallY  + 20f;
                } else if ("keeptoone".equals(wallObjectName)) {
                    //
                    positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) + 20f ;
                    positionY = positionWallY +  20f;
                } else if ("keeptothree".equals(wallObjectName)) {
                    //
                    positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) ;
                    positionY = positionWallY +  20f;
                } else {
                	positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) ;
                    positionY = positionWallY +  20f;
                }

                height = scale * Constants.commons.UPPER_CABINET_DEFAULT_HEIGHT;
                depth = scale * Constants.commons.UPPER_CABINET_DEFAULT_DEPTH;
            } else if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_HIGH) ) {
                if ("close".equals(wallObjectName)) {
                    //
                    positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) + 20f ;
                    positionY = positionWallY +  20f;
                } else if ("keeptoone".equals(wallObjectName)) {
                    //
                    positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) + 20f ;
                    positionY = positionWallY + 20f;
                } else if ("keeptothree".equals(wallObjectName)) {
                    //
                    positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) ;
                    positionY = positionWallY  + 20f;
                } else {
                	positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) ;
                    positionY = positionWallY  + 20f;
                }
                depth = scaleC * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
                height = scaleC * cabinet.getHeight();
            } else if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_ISLAND_OUTER) ) {
                positionX = positionWallX + scaleC * cabinet.getStartposition() ;
                height = scaleC * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
                depth = scaleC * cabinet.getDepth();
                positionY = positionWallY - depth;
            } else if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_ISLAND_INER) ) {
                positionX = positionWallX +  canvasIslandListC.get(wallNumber).getWidth() - scaleC * (cabinet.getStartposition() );
                height = scaleC * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
                depth = scaleC * cabinet.getDepth();
                positionY = positionWallY ;
            }else {
                        // no
            }
        } else if (rotation == 90 || rotation == 270) {
            if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_LOWER)  || cabinet.getType().equals(Constants.commons.CANBINET_TYPE_HIGH)) {
            	if (wallNumber == 0) {
                    positionX = positionWallX +20f ;
                    positionY = positionWallY + scaleC * cabinet.getStartposition();

                } else if (wallNumber == 2) {
//                        	if ("BLS".equals(cabinet.getCabinettype())) {
//                        		positionX = positionWallX - scale * cabinet.getWidth();
//                        	} else {
//                        		positionX = positionWallX - scale * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
//                        	}                            
//                            positionY = positionWallY +  (canvasWallListC.get(wallNumber).getWidth()-scale *cabinet.getStartposition())- width;
                	positionX = positionWallX - scaleC * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
                    positionY = positionWallY +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition());
                }
            	height = scaleC * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
                depth = scaleC * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
            } else if (cabinet.getType().equals(Constants.commons.CANBINET_TYPE_UPPER)) {
            	if (wallNumber == 0) {
                    positionX = positionWallX +20f ;
                    positionY = positionWallY + scaleC * cabinet.getStartposition();

                } else if (wallNumber == 2) {
                    positionX = positionWallX - scaleC * Constants.commons.UPPER_CABINET_DEFAULT_DEPTH;
//                            positionY = positionWallY +  (canvasWallListC.get(wallNumber).getWidth()-scale *cabinet.getStartposition())- width;
                    positionY = positionWallY +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition());
                }
            	height = scaleC * Constants.commons.UPPER_CABINET_DEFAULT_HEIGHT;
                depth = scaleC * Constants.commons.UPPER_CABINET_DEFAULT_DEPTH;
            } else if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_HIGH) ) {
            	if (wallNumber == 0) {
                    positionX = positionWallX +20f ;
                    positionY = positionWallY + scaleC * cabinet.getStartposition();

                } else if (wallNumber == 2) {
                    positionX = positionWallX - scaleC * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
//                            positionY = positionWallY +  (canvasWallListC.get(wallNumber).getWidth()-scale *cabinet.getStartposition())- width;
                    positionY = positionWallY +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition());
                }
            	height = scaleC * cabinet.getHeight();
            	depth = scaleC * Constants.commons.LOWER_CABINET_DEFAULT_WIDTH;
            } else if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_ISLAND_INER) ) {
            	if (rotation == 90 ) {
            		// I peninsula
            		positionX = positionWallX ;
                    positionY = positionWallY +  scaleC *cabinet.getStartposition();
                    height = scaleC * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
                    depth = scaleC * cabinet.getDepth();
            	} else {
            		positionY = positionWallY - scaleC * cabinet.getStartposition();
            		height = scaleC * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
                    depth = scaleC * cabinet.getDepth();
                    positionX = positionWallX - depth;
            	}
                
             } else if(cabinet.getType().equals(Constants.commons.CANBINET_TYPE_ISLAND_OUTER) ) {
            	 if (rotation == 90 ) {
            		 positionY = positionWallY - scaleC * (cabinet.getStartposition() + cabinet.getWidth());
                     height = scaleC * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
                     depth = scaleC * cabinet.getDepth();
                     positionX = positionWallX ;
             	} else {
             		// I peninsula
             		positionX = positionWallX -  scaleC * cabinet.getDepth();
                    positionY = positionWallY +  scaleC *cabinet.getStartposition();
                    height = scaleC * Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
                    depth = scaleC * cabinet.getDepth();
             	}                        
            }
        }

        canvasObject.setKitchen(kitchenInfo); // 设置关联的 Kitchen 对象
        canvasObject.setObjectname(cabinet.getName());
        canvasObject.setObjectType(cabinet.getType()); // 设置对象类型，例如 "墙"
        canvasObject.setWallid(cabinet.getWallid());
        // 取得releatedID2
        if ("BLS".equals(cabinet.getCabinettype()) ||
                "BBCL".equals(cabinet.getCabinettype()) ||
                "BBCR".equals(cabinet.getCabinettype()) ||
                "WBC".equals(cabinet.getCabinettype()) ||
                "WDC".equals(cabinet.getCabinettype())) {
//                    Float startPosition = cabinet.getStartposition();
        	canvasObject.setRelatedId2(relatedid2);
        }
        canvasObject.setX(positionX); // 设置 x 坐标
        canvasObject.setY(positionY); // 设置 y 坐标
        canvasObject.setWidth(width); // 设置宽度
        canvasObject.setHeight(height); // 设置高度
        canvasObject.setRotation(rotation); // 设置旋转角度
        canvasObject.setColor(Constants.commons.OBJECT_COLOR_CABINET); // 设置颜色
        canvasObject.setData(cabinet.toString()); // 设置其他相关数据
        canvasObject.setCreatedAt(Instant.now());
        canvasObject.setUpdatedAt(Instant.now());
        canvasObject.setRelatedId(cabinet.getId());
//        canvasObject.setRelatedId2(relatedid2);
        canvasObject.setScale(scaleC);
        canvasObject.setCabinettype(cabinet.getCabinettype());
        canvasObject.setDepth(depth);
        canvasObject.setWidthcabinet(cabinet.getWidth());
        return canvasObject;
    }

    public List<Canvasobject> createCabinetUpper(Kitchen kitchenInfo, List<Wall> wallInfoList, List<Window> windowList, List<Door> doorList,  List<Appliance> applianceList,List<Cabinetsrule> cabinetsruleList,List<CabinetProduct> cabinetprodectsList) {
        logger.info("createCabinetUpper kitchenInfo:", kitchenInfo.getId());
        List<Canvasobject> canvasobjectList = new ArrayList<Canvasobject>();
        if (cabinetsruleList == null) {return null;}
        ArrayList<List<Cabinet>> cabinetObject = designCabinetUpper(kitchenInfo, wallInfoList,  windowList, doorList,  applianceList, cabinetsruleList, cabinetprodectsList);

        for (int i = 0; i < cabinetObject.size(); i++) {
            List cabinetList = cabinetObject.get(i);
            for (int j = 0; j < cabinetList.size(); j++) {
                Cabinet cabinet = (Cabinet)cabinetList.get(j);
                if (cabinet.getWidth() == 0 && !Constants.commons.CANBINET_TYPE_SP.equals(cabinet.getCabinettype())) continue;
                if (Constants.commons.CANBINET_TYPE_SP.equals(cabinet.getCabinettype()) && cabinet.getWidth() == 0) {
                	cabinet.setWidth(Constants.commons.CANBINET_WIDTH_SPPAD);
                }
                Integer relatedid2 = 0;                
             // 取得releatedID2
                if ("WBCL".equals(cabinet.getCabinettype()) ||
                		"WBCR".equals(cabinet.getCabinettype()) ||
                        "WDC".equals(cabinet.getCabinettype())||
                        "WLS".equals(cabinet.getCabinettype())) {
//                    Float startPosition = cabinet.getStartposition();
                    for (int l = 0; l < cabinetObject.size(); l++) {
                        List cabinetListCorner = cabinetObject.get(l);
                        for (int m = 0; m < cabinetListCorner.size(); m++) {
                            Cabinet cabinetCorner = (Cabinet) cabinetListCorner.get(m);
                            if (cabinet.getCornerKey().equals(cabinetCorner.getCornerKey()) && cabinet.getId() != cabinetCorner.getId())
                            {
                                relatedid2 = cabinetCorner.getId();
                                break;
                            }
                        }
                        if (relatedid2!=0) break;
                    }
                }
                Canvasobject canvasObjectUpper = createCabinetObjectUpper(cabinet, relatedid2, kitchenInfo, canvasWallListC, scale);
                if (canvasObjectUpper !=null ) {
                	canvasobjectList.add(canvasObjectUpper);
                }
                
            }
        }

        return canvasobjectList;
    }
    
    public Canvasobject createCabinetObjectUpper(Cabinet cabinet, Integer relatedid2, Kitchen kitchenInfo, List<Canvasobject> canvasWallList, float scaleC) {
        logger.info("createCabinetObjectUpper cabinet:", cabinet.getId());
        if (cabinet.getWidth() == 0 && !Constants.commons.CANBINET_TYPE_SP.equals(cabinet.getCabinettype())) return null;
        // BLSD，BBCD，
        if ("WBCD".equals(cabinet.getCabinettype())||
                "WDCD".equals(cabinet.getCabinettype())||
                "WLSD".equals(cabinet.getCabinettype())) {
            //需要找到canvasObject
        	 return null;
        }
        
        
        if (Constants.commons.OBJECT_TYPE_APPLIANCE.equals(cabinet.getCabinettype())  ||
                Constants.commons.OBJECT_TYPE_WINDOW.equals(cabinet.getCabinettype()) ||
                Constants.commons.OBJECT_TYPE_DOOR.equals(cabinet.getCabinettype())
        )  return null;
        float positionX =0f;
        float positionY =0f;
        float positionWallX =0f;
        float positionWallY =0f;
        float rotation = 0f;
        float width = 0f;
        float height = 0f;
        String wallObjectName = null;
        float paddwidth = 20f;
        if ("I".equals(kitchenInfo.getShapeType()) || "II".equals(kitchenInfo.getShapeType())) {
            paddwidth = 0f;
        }
        float depth = Constants.commons.UPPER_CABINET_DEFAULT_DEPTH * scaleC;
        if (cabinet.getDepth() !=0 ) {
        	depth = cabinet.getDepth()* scaleC;
        }
        Integer wallNumber = 100;
        String applianceText = null;
        Canvasobject canvasObject = new Canvasobject();
        for(int k=0; k < canvasWallList.size(); k++) {
            if (Objects.equals(cabinet.getWallid(), canvasWallList.get(k).getWallid())) {
                wallNumber = k  ;
                rotation = canvasWallList.get(k).getRotation();
                positionWallX = canvasWallList.get(k).getX();
                positionWallY = canvasWallList.get(k).getY();
                wallObjectName = canvasWallList.get(k).getObjectname();
                break;
            }
        }
        //}
        if (positionWallX == 0 || positionWallY == 0) {
            //  发生了错误！！！
        }
//                rotation = 0;
        width = scaleC * cabinet.getWidth();
        height = scaleC * cabinet.getHeight();
      //rotation = 0;
        width = scaleC * cabinet.getWidth();
        if (rotation == 0 ) {
            positionX = positionWallX + scaleC * cabinet.getStartposition() +paddwidth;
            positionY = positionWallY - depth;
        } else if ( rotation == 180) {
            if ("close".equals(wallObjectName)) {
                positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) + 20f ;
                positionY = positionWallY  + 20f;
            } else if ("keeptoone".equals(wallObjectName)) {
                //
                positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) + 20f ;
                positionY = positionWallY +  20f;
            } else if ("keeptothree".equals(wallObjectName)) {
                //
                positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) ;
                positionY = positionWallY +  20f;
            } else {
            	positionX = positionWallX +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition()) ;
                positionY = positionWallY +  20f;
            }
        } else if (rotation == 90 || rotation == 270) {
            if (wallNumber == 0) {
                positionX = positionWallX +20f ;
                positionY = positionWallY + scaleC * cabinet.getStartposition();

            } else if (wallNumber == 2) {
                positionX = positionWallX - depth;
                positionY = positionWallY +  (canvasWallList.get(wallNumber).getWidth()-scaleC *cabinet.getStartposition());
            }
        }

        if ("WBCR".equals(cabinet.getCabinettype()) ||
                "WBCL".equals(cabinet.getCabinettype()) ||
                "WDC".equals(cabinet.getCabinettype())||
                "WLS".equals(cabinet.getCabinettype())) {
//                    Float startPosition = cabinet.getStartposition();
        	canvasObject.setRelatedId2(relatedid2);
        }
        canvasObject.setWallid(cabinet.getWallid());
        canvasObject.setKitchen(kitchenInfo); // 设置关联的 Kitchen 对象
        canvasObject.setObjectname(cabinet.getName());
        canvasObject.setObjectType(Constants.commons.CANBINET_TYPE_UPPER); // 设置对象类型，例如 "墙"
        canvasObject.setX(positionX); // 设置 x 坐标
        canvasObject.setY(positionY); // 设置 y 坐标
        canvasObject.setWidth(width); // 设置宽度
        canvasObject.setHeight(height); // 设置高度
        canvasObject.setRotation(rotation); // 设置旋转角度
        canvasObject.setColor(Constants.commons.OBJECT_COLOR_CABINET); // 设置颜色
        canvasObject.setData(cabinet.toString()); // 设置其他相关数据
        canvasObject.setCreatedAt(Instant.now());
        canvasObject.setUpdatedAt(Instant.now());
        canvasObject.setRelatedId(cabinet.getId());
        canvasObject.setScale(scaleC);
//        canvasObject.setRelatedId2(relatedid2);
        canvasObject.setCabinettype(cabinet.getCabinettype());
        canvasObject.setDepth(depth);
        canvasObject.setWidthcabinet(cabinet.getWidth());
        return canvasObject;
    }

    public ArrayList<List<Cabinet>> designCabinetLower(Kitchen kitchenInfo,List<Wall> wallInfoList, Island island, List<Window> windowList, List<Door> doorList, List<Appliance> applianceList,
                                 List<Cabinetsrule> cabinetsruleList) {
        logger.info("designCabinetLower kitchenInfo:", kitchenInfo.getId());
        ArrayList<List<Cabinet>> multipleCabinetList = new ArrayList<>();
        if (kitchenInfo == null || wallInfoList == null) {return null;}
        int cabinetSBFlag = 0;
        
        // 根据电器位置，窗户，门位置，得到可摆放柜子的宽度位置
        for (int i = 0; i < wallInfoList.size(); i++) {
            Wall wall = wallInfoList.get(i);
            int pantryRequired = 0;
            int sinkBasePosition = 9;  // 9：init 0：front 1：back
            if (wall.getWidth() == 0) continue;
            List<Cabinet> cabinetobjectList = new ArrayList<>();
            List<Appliance> applianceTmpList = new ArrayList<>();
            List<Door> doorTmpList = new ArrayList<>();
            List<Window> windowTmpList = new ArrayList<>();
            String cabinetTbdName = "tbd";
//            Integer sbArrangeFlg = 0;
            if (wall.getIsLowerCabinetPlaced()) {
                // 确定电器位置
                applianceTmpList = applianceList.stream()
                        .filter(appliance -> wall.equals(appliance.getWall()) && appliance.getWidth() > 0)
                        .sorted(Comparator.comparing(Appliance::getPosition))
                        .collect(Collectors.toList());
                doorTmpList = doorList.stream()
                        .filter(door -> wall.equals(door.getWall()) && door.getWidth() > 0)
                        .collect(Collectors.toList());
                windowTmpList = windowList.stream()
                        .filter(window -> wall.equals(window.getWall()) && window.getWidth() > 0)
                        .collect(Collectors.toList());
                        // 获取洗碗机对象
                Appliance dishwasher = applianceTmpList.stream()
                .filter(appliance -> Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(appliance.getAppliancekind()))
                .findFirst()
                .orElse(null);
                if (wall.getPantryRequired() == null || !wall.getPantryRequired()) {
                	pantryRequired=0;
                } else {
                	pantryRequired=1;
                }
                
                // 找到距离洗碗机最近且宽度最大的窗户
                Window nearestLargestWindow = null;
                if (dishwasher != null) {
                    float dishwasherPosition = dishwasher.getPosition();
                    float minDistance = Float.MAX_VALUE;
                    float maxWidth = 0;
                    
                    for (Window window : windowTmpList) {
                        float distance = Math.abs(window.getStartposition() - dishwasherPosition);
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestLargestWindow = window;
                            maxWidth = window.getWidth();
                        } else if (distance == minDistance && window.getWidth() > maxWidth) {
                            nearestLargestWindow = window;
                            maxWidth = window.getWidth();
                        }
                    }
                    if (nearestLargestWindow != null) {
                        // 找到距离洗碗机最近且宽度最大的窗户
                        float windowPosition = nearestLargestWindow.getStartposition();
                        if (windowPosition > dishwasher.getPosition()) {

                        	float minAppDistance = Float.MAX_VALUE;
                            Appliance nearestApplianceAfterDishwasher = null;
                            for (Appliance appliance : applianceTmpList) {
                                // 跳过洗碗机自身
                                if (Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(appliance.getAppliancekind())) {
                                    continue;
                                }
                                // 只考虑位置比洗碗机大的电器
                                if (appliance.getPosition() > dishwasherPosition) {
                                    float distance = appliance.getPosition() - dishwasherPosition;
                                    if (distance < minAppDistance) {
                                        minAppDistance = distance;
                                        nearestApplianceAfterDishwasher = appliance;
                                    }
                                }
                            } 
                        	float minDoorDoorDistance = Float.MAX_VALUE;
                            Door nearestDoorAfterDishwasher = null;
                            for (Door doorW : doorTmpList) {
                                // 只考虑位置比洗碗机大的电器
                                if (doorW.getStartposition() > dishwasherPosition) {
                                    float distance = doorW.getStartposition() - dishwasherPosition;
                                    if (distance < minAppDistance) {
                                        minAppDistance = distance;
                                        nearestDoorAfterDishwasher = doorW;
                                    }
                                }
                            } 
                        	// 取得最小的位置值
                            float minPositionAfterDishwasher = Float.MAX_VALUE;
                            if (nearestDoorAfterDishwasher != null) {
                                minPositionAfterDishwasher = nearestDoorAfterDishwasher.getStartposition();
                            }
                            if (nearestApplianceAfterDishwasher != null) {
                                if (nearestApplianceAfterDishwasher.getPosition() < minPositionAfterDishwasher) {
                                    minPositionAfterDishwasher = nearestApplianceAfterDishwasher.getPosition();
                                }
                            }
                            if (minPositionAfterDishwasher == Float.MAX_VALUE )  {
                                float widthCheck = wall.getWidth() - dishwasher.getPosition() - dishwasher.getWidth();
                                if (widthCheck >  sbFavoriteWidth) {
                                    sinkBasePosition = 1;  // 9：init 0：front 1：back
                                }
                            } else {
                                if (minPositionAfterDishwasher - dishwasher.getPosition() - dishwasher.getWidth() > sbFavoriteWidth) {
                                    sinkBasePosition = 1;  // 9：init 0：front 1：back
                                }
                            }

                        } else {
                        	float minAppDistance = Float.MAX_VALUE;
                            Appliance nearestApplianceAfterDishwasher = null;
                            for (Appliance appliance : applianceTmpList) {
                                // 跳过洗碗机自身
                                if (Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(appliance.getAppliancekind())) {
                                    continue;
                                }
                                // 只考虑位置比洗碗机大的电器
                                if (appliance.getPosition() < dishwasherPosition) {
                                    float distance = appliance.getPosition() - dishwasherPosition;
                                    if (distance < minAppDistance) {
                                        minAppDistance = distance;
                                        nearestApplianceAfterDishwasher = appliance;
                                    }
                                }
                            } 
                        	float minDoorDoorDistance = Float.MAX_VALUE;
                            Door nearestDoorAfterDishwasher = null;
                            for (Door doorW : doorTmpList) {
                                // 只考虑位置比洗碗机大的电器
                                if (doorW.getStartposition() < dishwasherPosition) {
                                    float distance = doorW.getStartposition() - dishwasherPosition;
                                    if (distance < minAppDistance) {
                                        minAppDistance = distance;
                                        nearestDoorAfterDishwasher = doorW;
                                    }
                                }
                            } 
                        	// 取得最大的位置值
                            float maxPositionAfterDishwasher = Float.MAX_VALUE;
                            if (nearestDoorAfterDishwasher != null) {
                                maxPositionAfterDishwasher = nearestDoorAfterDishwasher.getStartposition() - nearestDoorAfterDishwasher.getWidth();
                            }
                            if (nearestApplianceAfterDishwasher != null) {
                                if (nearestApplianceAfterDishwasher.getPosition() -nearestApplianceAfterDishwasher.getWidth() > maxPositionAfterDishwasher) {
                                    maxPositionAfterDishwasher = nearestApplianceAfterDishwasher.getPosition()-nearestApplianceAfterDishwasher.getWidth();
                                }
                            }
                            if (maxPositionAfterDishwasher == Float.MAX_VALUE )  {
                                if (dishwasher.getPosition() >  sbFavoriteWidth) {
                                    sinkBasePosition = 0;  // 9：init 0：front 1：back
                                }
                            } else
                            if (maxPositionAfterDishwasher - dishwasher.getPosition()  > sbFavoriteWidth) {
                                sinkBasePosition = 0;  // 9：init 0：front 1：back
                            }
                        }
                        
                        
                        float windowWidth = nearestLargestWindow.getWidth();
                        // 计算洗碗机和窗户之间的距离
                        float distance = Math.abs(windowPosition - dishwasher.getPosition());

                    } else {
                        // SB的位置根据Dishwasher决定
                        nearestLargestWindow = null;
                    }
                } else {
                	// 这面墙没有dishwasher
                	
                }
                
                float initPosition = 0;
                float applianceWidth = 0;
                float appliancePosition = 0;
                float appliancePositionPNB = 0;
                float highCabinetHeight = 0;
                String leftObject = null;
                List<Appliance> refAppliance = applianceTmpList.stream()
            		    .filter(ref -> 
            		        "Refrigerator".endsWith(ref.getName()))
            		    .collect(Collectors.toList());
                float refObjectPosition = 0f;
                float refObjectWidth = 0f;
                if (!refAppliance.isEmpty()) {
                	refObjectPosition = refAppliance.get(0).getPosition();
                	refObjectWidth = refAppliance.get(0).getWidth();
                } else {
                	refObjectPosition=0f;
                	refObjectWidth = 0f;
                }
                // 如果是L/U 同时rotation等于0，270的时候
                if ("L".equals(kitchenInfo.getShapeType()) || "U".equals(kitchenInfo.getShapeType())) {
                	if (wall.getAngle() == 0 || wall.getAngle() == 270) {
                    	leftObject = "wall";
                	} else {
                		if (wall.getLeftCorner()) {
                			leftObject = "endisland";
                		} else {
                			leftObject = "endwall";
                		}
                		
                	}

                } else {
                	if (wall.getLeftCorner()) {
            			leftObject = "endisland";
            		} else {
            			leftObject = "endwall";
            		}
                }
                String rightObjectWall = null;
                // 如果是L同时rotation等于90 或者 U 同时rotation等于0的时候
                if ("L".equals(kitchenInfo.getShapeType()) &&wall.getAngle() == 90 || 
                		"U".equals(kitchenInfo.getShapeType()) &&wall.getAngle() == 90 ||
                		"U".equals(kitchenInfo.getShapeType()) &&wall.getAngle() == 0) {
                    	rightObjectWall = "wall";
                	
                } else {
                	if (wall.getRightCorner()) {
            			rightObjectWall = "endisland";
            		} else {
            			rightObjectWall = "endwall";
            		}
                }
                Integer refPosition = 0; // 初期化0，冰箱在右边1，冰箱在左边2
                String constr = kitchenInfo.getConstruction2().substring(0, 3);  // lower使用construction2
                if (kitchenInfo.getCeilingHeight() >= 105) {
                    highCabinetHeight = 105;
                } else if (kitchenInfo.getCeilingHeight() >= 93) {
                    highCabinetHeight = 93;
                } else  {
                    if (kitchenInfo.getCeilingHeight() >= 84 && "BC1".equals(constr)) {
                        highCabinetHeight = 84;
                    } else {
                        //
                        highCabinetHeight = kitchenInfo.getCeilingHeight();
                    }
                }
             // WP的最大宽度相对36来判断。
                List<Window> filteredWindowsS =  Optional.ofNullable(windowTmpList)
                	    .orElse(Collections.emptyList())
                	    .stream()
            		    .filter(window -> {
            		    	double startPos = Optional.ofNullable(window.getStartposition()).orElse(0f);
             		        double width = Optional.ofNullable(window.getWidth()).orElse(0f);
             		        double endPositionW = startPos + width;
            		        // 判断窗口区间 [startPos, endPositionW] 是否与 [0, 36] 重叠
            		        return startPos <= 36 && endPositionW >= 0;     
            		    })
            		    .collect(Collectors.toList());
               List<Window> filteredWindowsE =  Optional.ofNullable(windowTmpList)
            		    .orElse(Collections.emptyList())
            		    .stream()
           		    .filter(window -> {
           		    	double startPos = Optional.ofNullable(window.getStartposition()).orElse(0f);
         		        double width = Optional.ofNullable(window.getWidth()).orElse(0f);
         		        double endPositionW = startPos + width;
           		        boolean intersectsWithEnd = endPositionW >= (wall.getWidth() - 36) && startPos <= wall.getWidth();
           		        return  intersectsWithEnd;
           		    })
           		    .collect(Collectors.toList());
               
               final double refEnd = refObjectPosition + refObjectWidth;
               final double refRangeEnd = refEnd + 36;
               
               List<Window> filteredWindowsR = Optional.ofNullable(windowTmpList)
            		    .orElse(Collections.emptyList()) // 如果为 null 就返回空列表
            		    .stream()
            		    .filter(window -> {
            		    	double startPos = Optional.ofNullable(window.getStartposition()).orElse(0f);
            		        double width = Optional.ofNullable(window.getWidth()).orElse(0f);
            		        double endPositionW = startPos + width;
            		        // 判断窗口区间 [startPos, endPositionW] 是否与 [refEnd, refRangeEnd] 重叠
            		        return startPos <= refRangeEnd && endPositionW >= refEnd;
            		    })
            		    .collect(Collectors.toList());
               
               final double refRangeStart = Math.max(0, refObjectPosition - 36);
               final double refRangeEndS = refObjectPosition;
               
               List<Window> filteredWindowsRS = Optional.ofNullable(windowTmpList)
            		    .orElse(Collections.emptyList()) // 如果为 null 就返回空列表
            		    .stream()
            		    .filter(window -> {
            		    	double startPos = Optional.ofNullable(window.getStartposition()).orElse(0f);
            		        double width = Optional.ofNullable(window.getWidth()).orElse(0f);
            		        double endPositionW = startPos + width;
            		        // 判断窗口区间 [startPos, endPositionW] 是否与 [refEnd, refRangeEnd] 重叠
            		        return startPos <= refRangeEndS && endPositionW >= refRangeStart;
            		    })
            		    .collect(Collectors.toList());
               
               boolean windowsCheckS = true;
               boolean windowsCheckE = true;
               boolean windowsCheckR = true;
               boolean windowsCheckRS = true;
               if (filteredWindowsR.isEmpty() ) windowsCheckR= false; // 没有交叉
               if (filteredWindowsS.isEmpty() ) windowsCheckS= false; // 没有交叉
               if (filteredWindowsE.isEmpty() ) windowsCheckE= false; // 没有交叉
               if (filteredWindowsRS.isEmpty() ) windowsCheckRS= false; // 没有交叉
               float hoodStartPosition =0;
               float hoodWidth = 0;
                for (Appliance appliance : applianceTmpList) {

                	if (Constants.commons.APPLIANCES_NAME_HOOD.equals(appliance.getAppliancekind()) ) {
                		//在upper里面处理，这里跳过
                		hoodStartPosition = appliance.getPosition();
                		hoodWidth = appliance.getWidth();
                        continue;
                    }
                    if (Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(appliance.getAppliancekind()) ) {
                        // if (sinkBasePosition == 9 || sinkBasePosition == 0) {
                            cabinetSBFlag = 1;
                        // } else {
                        //     cabinetSBFlag = 3;
                        // }
                    } else if (cabinetSBFlag == 1) { // Dishwasher 左侧位置不够，未安排sb
                        cabinetSBFlag = 3; // 第一处space安排sb
                    } else if (cabinetSBFlag == 3){
                        cabinetSBFlag = 0; // 不需要安排SB
                    }
                    if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(appliance.getAppliancekind())) {
                        refPosition = 1; // 放处理冰箱左边的space，所以暂时设置为1
                        String leftRef = "";
                        // REFRIGERATOR两侧需要背板
                        if ("BC1".equals(constr)) { // 1000series
                            typeflag = 1000;
                            appliancePosition = appliance.getPosition()  ;
                            if (appliancePosition < Constants.commons.CANBINET_WIDTH_RRP) {
                            	appliancePositionPNB = 0;
                            	appliancePosition = Constants.commons.CANBINET_WIDTH_RRP;
                            	leftRef = leftObject;
                            } else {
                            	appliancePositionPNB = appliance.getPosition() - Constants.commons.CANBINET_WIDTH_RRP;
                            }
                            
                            //appliance.setPosition(appliancePosition);
                            applianceWidth = appliance.getWidth() + Constants.commons.CANBINET_WIDTH_RRP  ;

                            Cabinet cabinetRefL = new Cabinet(highCabinetHeight,0f,Constants.commons.CANBINET_NAME_RRP,
                                    Constants.commons.CANBINET_WIDTH_RRP, kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.CANBINET_TYPE_RRP,
                                    Constants.commons.CANBINET_TYPE_HIGH, appliancePositionPNB,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, wall.getAngle(),leftRef,"appliance");
                            Cabinet cabinetRefR = new Cabinet(highCabinetHeight,0f,Constants.commons.CANBINET_NAME_RRP,
                                    Constants.commons.CANBINET_WIDTH_RRP,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.CANBINET_TYPE_RRP,
                                    Constants.commons.CANBINET_TYPE_HIGH, appliancePosition + appliance.getWidth() , Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, wall.getAngle(),"appliance","");
                            cabinetobjectList.add(cabinetRefL);
                            cabinetobjectList.add(cabinetRefR);
                        } else { // 2000，3000series
                            typeflag = 2000;
                            appliancePosition = appliance.getPosition()  ;
                            if (appliancePosition < Constants.commons.CANBINET_WIDTH_PNB) {
                            	appliancePositionPNB = 0;
                            	appliancePosition = Constants.commons.CANBINET_WIDTH_PNB;
                            	leftRef = leftObject;
                            } else {
                            	appliancePositionPNB = appliance.getPosition() - Constants.commons.CANBINET_WIDTH_PNB;
                            }
                            applianceWidth = appliance.getWidth() + Constants.commons.CANBINET_WIDTH_PNB  ;
                            Cabinet cabinetRefL = new Cabinet(highCabinetHeight,0f, Constants.commons.CANBINET_NAME_PNB,
                                    Constants.commons.CANBINET_WIDTH_PNB,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.CANBINET_TYPE_PNB,
                                    Constants.commons.CANBINET_TYPE_HIGH, appliancePositionPNB,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, wall.getAngle(),leftRef,"appliance");
                            Cabinet cabinetRefR = new Cabinet(highCabinetHeight,0f,Constants.commons.CANBINET_NAME_PNB,
                                    Constants.commons.CANBINET_WIDTH_PNB,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.CANBINET_TYPE_PNB,
                                    Constants.commons.CANBINET_TYPE_HIGH, appliancePosition + appliance.getWidth() ,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, wall.getAngle(),"appliance","");
                            cabinetobjectList.add(cabinetRefL);
                            cabinetobjectList.add(cabinetRefR);
                        }
                    } else if (Constants.commons.APPLIANCES_NAME_RANGE.equals(appliance.getAppliancekind())) {
                    	appliancePosition = appliance.getPosition();
                        applianceWidth = appliance.getWidth();
                        appliancePositionPNB = appliance.getPosition();
                        
                    } else {
                       
                        appliancePosition = appliance.getPosition();
                        applianceWidth = appliance.getWidth();
                        appliancePositionPNB = appliance.getPosition();
                    }
                    
                    // 0~ appliance之前的space                    
                    float endPosition = appliancePositionPNB - initPosition;
                       if (endPosition > 0) {
                           float finalInitPosition = initPosition;
                           float finalEndPosition = appliancePositionPNB;
                           List<Door> doorsInRange = doorTmpList.stream()
                                   .filter(door -> door.getStartposition() != null && door.getStartposition() >= finalInitPosition && door.getStartposition() <= finalEndPosition)
                                   .collect(Collectors.toList());
                           if (!doorsInRange.isEmpty()){
                               for (Door door : doorsInRange) {
                                   // 门隔开了电器，SB需要紧挨着DISHWASHER
                                   if (cabinetSBFlag == 3 && door.getStartposition()-initPosition > sbFavoriteWidth) {
                                       cabinetSBFlag = 2;
                                       cabinetTbdName = Constants.commons.CANBINET_TBD_SBBACK;
                                   } else {
                                       cabinetTbdName = Constants.commons.CANBINET_TBD;
                                   }
                                   if (door.getStartposition()-initPosition - Constants.commons.POSITION_DOOR_GAP >= Constants.commons.CABINET_MIN_WIDTH) {
                                        // 门和前一次电器的space
                                       float spaceWidth = door.getStartposition()-initPosition-Constants.commons.POSITION_DOOR_GAP;
                                        // wall的rotation为90，L型 最大， U型270最大，
                                       float padCheck = 0f;
                                	   if ("wall".equals(leftObject)) {
                                		   padCheck = Constants.commons.WP_WIDTH_PAD_MIN;
                                	   }
                                        if ((pantryRequired==1 && initPosition == 0 && !wall.getLeftCorner() && 
                                        	filteredWindowsS.isEmpty() && 
                                        	spaceWidth >= padCheck + Constants.commons.WP_WIDTH_MIN) ) {
                                            // 距离可以放下WP
                                        	// 是否和HOOD交叉
                                        	float tmpw = door.getStartposition()-initPosition-Constants.commons.POSITION_DOOR_GAP;
                                        	float tmpp = initPosition;
                                        	boolean flg = !(tmpp + tmpw <= hoodStartPosition || hoodStartPosition + hoodWidth <= tmpp);
                                        	if (flg) {
                                        		Cabinet cabinetDoorTbd = new Cabinet(highCabinetHeight,0f,Constants.commons.CANBINET_TBD,
                                                        door.getStartposition()-initPosition-Constants.commons.POSITION_DOOR_GAP,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.CANBINET_TBDWPS,
                                                        Constants.commons.CANBINET_TYPE_LOWER, initPosition,0, leftObject, "door", wall.getAngle());
                                        		cabinetobjectList.add(cabinetDoorTbd);
                                        	} else {
                                        		Cabinet cabinetDoorTbd = new Cabinet(highCabinetHeight,0f,Constants.commons.CANBINET_TBDWPS,
                                                        door.getStartposition()-initPosition-Constants.commons.POSITION_DOOR_GAP,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.CANBINET_TBDWPS,
                                                        Constants.commons.CANBINET_TYPE_LOWER, initPosition,0, leftObject, "door", wall.getAngle());
                                        		cabinetobjectList.add(cabinetDoorTbd);
                                        	}
                                            
                                            pantryRequired = 2;  // 放置完毕
                                        } else if (pantryRequired == 1 && refPosition == 2 && 
                                            	filteredWindowsR.isEmpty() && 
                                        		spaceWidth >=  Constants.commons.WP_WIDTH_MIN) {
                                        	// 挨着冰箱放置
                                        	float tmpw = door.getStartposition()-initPosition-Constants.commons.POSITION_DOOR_GAP;
                                        	float tmpp = initPosition;
                                        	boolean flg = !(tmpp + tmpw <= hoodStartPosition || hoodStartPosition + hoodWidth <= tmpp);
                                        	if (flg) {
                                        	
                                        		Cabinet cabinetDoorTbd = new Cabinet(highCabinetHeight,0f,Constants.commons.CANBINET_TBD,
                                                    door.getStartposition()-initPosition-Constants.commons.POSITION_DOOR_GAP,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.CANBINET_TBDWPR,
                                                    Constants.commons.CANBINET_TYPE_LOWER, initPosition,0, leftObject, "door", wall.getAngle());
                                        		cabinetobjectList.add(cabinetDoorTbd);
                                        	} else {
                                        		Cabinet cabinetDoorTbd = new Cabinet(highCabinetHeight,0f,Constants.commons.CANBINET_TBDWPR,
                                                        door.getStartposition()-initPosition-Constants.commons.POSITION_DOOR_GAP,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.CANBINET_TBDWPR,
                                                        Constants.commons.CANBINET_TYPE_LOWER, initPosition,0, leftObject, "door", wall.getAngle());
                                        		cabinetobjectList.add(cabinetDoorTbd);
                                        	}
                                            pantryRequired = 2;
                                        	
//                                        } else if (pantryRequired == 1 && !wall.getRightCorner() &&  spaceWidth+initPosition == wall.getWidth() && spaceWidth >=  Constants.commons.WP_WIDTH_PAD_MIN + Constants.commons.WP_WIDTH_MIN) {
//                                        	Cabinet cabinetDoorTbd = new Cabinet(highCabinetHeight,0f,Constants.commons.CANBINET_TBDWPS,
//                                                    door.getStartposition()-initPosition-Constants.commons.POSITION_DOOR_GAP,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.CANBINET_TBDWPS,
//                                                    Constants.commons.CANBINET_TYPE_LOWER, initPosition,0, leftObject, "door", wall.getAngle());
//                                            cabinetobjectList.add(cabinetDoorTbd);
//                                            pantryRequired = 2;
                                        } else {
                                        
                                        
                                           Cabinet cabinetDoorTbd = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f,cabinetTbdName,
                                                   door.getStartposition()-initPosition-Constants.commons.POSITION_DOOR_GAP,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                                                   Constants.commons.CANBINET_TYPE_LOWER, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, leftObject, "door", wall.getAngle());
                                           cabinetobjectList.add(cabinetDoorTbd);
                                        }
                                   } else {
                                       // 墙和门之间放不下一个柜子，所以什么都不做
                                   }
//                                   Cabinet cabinetDoor = new Cabinet(door.getHeight(),0f,Constants.commons.OBJECT_TYPE_DOOR,
//                                           door.getWidth(),kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.OBJECT_TYPE_DOOR,
//                                           Constants.commons.CANBINET_TYPE_LOWER, door.getStartposition(),0, wall.getAngle(),"","");
//                                   cabinetobjectList.add(cabinetDoor);
                                   initPosition =  door.getStartposition() + door.getWidth() +Constants.commons.POSITION_DOOR_GAP;
                                   leftObject = "door";
                               }
                               if (appliancePositionPNB -initPosition  >= Constants.commons.CABINET_MIN_WIDTH  ) {
                            	   // 检查是否需要pantry
                                   if (cabinetSBFlag == 1 && endPosition-initPosition > sbFavoriteWidth && sinkBasePosition != 1) {
                                       cabinetTbdName = Constants.commons.CANBINET_TBD_SBFRONT;
                                       cabinetSBFlag = 2;
                                   } else {
                                       cabinetTbdName = Constants.commons.CANBINET_TBD;
                                   }
                                   // 右侧是appliance
                                   String rightAppliance ;
                                   if (Constants.commons.APPLIANCES_NAME_RANGE.equals(appliance.getAppliancekind())) {
                                	   rightAppliance = Constants.commons.APPLIANCES_NAME_RANGE;
                                   } else if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(appliance.getAppliancekind())) {
                                	   rightAppliance = Constants.commons.APPLIANCES_NAME_REFRIGERATOR;
                                   } else {
                                	   rightAppliance = "appliance";
                                   }
                                   Cabinet cabinetDoorTbd = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f,cabinetTbdName,
                                           appliancePositionPNB-initPosition,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                                           Constants.commons.CANBINET_TYPE_LOWER, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH,"door",rightAppliance, wall.getAngle());
                                   cabinetobjectList.add(cabinetDoorTbd);
                               }
                           } else {
                               // 没有门
                        	// 右侧是appliance
                               String rightAppliance ;
                               if (Constants.commons.APPLIANCES_NAME_RANGE.equals(appliance.getAppliancekind())) {
                            	   rightAppliance = Constants.commons.APPLIANCES_NAME_RANGE;
                               } else if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(appliance.getAppliancekind())) {
                            	   rightAppliance = Constants.commons.APPLIANCES_NAME_REFRIGERATOR;
                               } else {
                            	   rightAppliance = "appliance";
                               }
                               if (endPosition  >= Constants.commons.CABINET_MIN_WIDTH  ) {
                                   float cabinetTbdHeight = Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
                                   if (cabinetSBFlag == 3 && endPosition > sbFavoriteWidth) {
                                       cabinetSBFlag = 2;
                                       cabinetTbdName = Constants.commons.CANBINET_TBD_SBBACK;
                                   } else if (cabinetSBFlag == 1 && endPosition > sbFavoriteWidth && sinkBasePosition != 1) {
                                       cabinetTbdName = Constants.commons.CANBINET_TBD_SBFRONT;
                                       cabinetSBFlag = 2;
                                   } else {
                                	
                                	   float padCheck = 0f;
	                           	    	float padCabinetWidth = 0f;
	                           	    	if ("BC1".equals(constr)) {
	                           	        	padCabinetWidth=  Constants.commons.CANBINET_WIDTH_SP;
	                           	        } else {
	                           	        	padCabinetWidth =  Constants.commons.CANBINET_WIDTH_PNB;
	                           	        }
                                	   if ("wall".equals(leftObject)) {
                                		   padCheck = Constants.commons.WP_WIDTH_PAD_MIN;
                                	   } else if ("endwall".equals(leftObject)) {
                                		   if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(rightAppliance)) {
                                			   padCheck = padCabinetWidth;
                                		   } else {
                                			   padCheck = padCabinetWidth *2;
                                		   }
                                		   
                                	   }
                                	   if ((pantryRequired==1 && initPosition == 0 && !wall.getLeftCorner() && 
                                           	filteredWindowsS.isEmpty() && 
                                			   finalEndPosition-initPosition >= padCheck + Constants.commons.WP_WIDTH_MIN) ) {
                                           // 距离可以放下WP
                                		    float tmpw = endPosition;
	                                       	float tmpp = initPosition;
	                                       	boolean flg = !(tmpp + tmpw <= hoodStartPosition || hoodStartPosition + hoodWidth <= tmpp);
	                                       	if (flg) {
	                                       		cabinetTbdName = Constants.commons.CANBINET_TBD;

	                                       	} else {
	                                       		cabinetTbdName = Constants.commons.CANBINET_TBDWPS;
	                                			cabinetTbdHeight = highCabinetHeight;
	                                			pantryRequired = 2;
	                                       	}
                                       } else if (pantryRequired == 1 && refPosition == 2 && 
                                           	filteredWindowsR.isEmpty() && 
                                    		   finalEndPosition-initPosition >=  Constants.commons.WP_WIDTH_MIN) {
                                       	// 挨着冰箱放置
                                    	   float tmpw = endPosition;
	                                       	float tmpp = initPosition;
	                                       	boolean flg = !(tmpp + tmpw <= hoodStartPosition || hoodStartPosition + hoodWidth <= tmpp);
	                                       	if (flg) {
	                                       		cabinetTbdName = Constants.commons.CANBINET_TBD;

	                                       	} else {
	                                    	   cabinetTbdName = Constants.commons.CANBINET_TBDWPR;
	                                		   cabinetTbdHeight = highCabinetHeight;
	                                           pantryRequired = 2;
	                                       	}
                                       	
                                       } else {
                                    //    if ((finalEndPosition-initPosition >= 15 + Constants.commons.WP_WIDTH_MIN) && wall.getIsUpperCabinetPlaced()) {
                                    //        // 可以方式WP高柜
                                    //        cabinetTbdName = Constants.commons.CANBINET_TBDWPS;
                                    //        cabinetTbdHeight = highCabinetHeight;

                                    //    } else {
                                           cabinetTbdName = Constants.commons.CANBINET_TBD;
                                        }

                                   }
                                   
                                   
                                   Cabinet cabinetTBD = new Cabinet(cabinetTbdHeight,0f,cabinetTbdName,
                                           endPosition,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                                           Constants.commons.CANBINET_TYPE_LOWER, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH,leftObject,rightAppliance, wall.getAngle());

                                   cabinetobjectList.add(cabinetTBD);
                               } else {
                                   if (endPosition>6) {
                                       // 电器位置安排有错误,返回请调整电器位置 暂时案BF  // 右侧是appliance
//                                	   String rightAppliance ;
//                                       if (Constants.commons.APPLIANCES_NAME_RANGE.equals(appliance.getAppliancekind())) {
//                                    	   rightAppliance = Constants.commons.APPLIANCES_NAME_RANGE;
//                                       } else if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(appliance.getAppliancekind())) {
//                                    	   rightAppliance = Constants.commons.APPLIANCES_NAME_REFRIGERATOR;
//                                       } else {
//                                    	   rightAppliance = "appliance";
//                                       }
                                	   if ("wall".equals(leftObject) || "appliance".equals(leftObject) || Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(leftObject) ||
                                			   Constants.commons.APPLIANCES_NAME_RANGE.equals(leftObject)) {
                                		   Cabinet cabinetTBD = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f,Constants.commons.CANBINET_TBD,
                                                   endPosition,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.CANBINET_TBD,
                                                   Constants.commons.CANBINET_TYPE_LOWER, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH,leftObject, rightAppliance, wall.getAngle());
                                    	   cabinetobjectList.add(cabinetTBD); 
                                	   }
                                		   
                                	   
                                   } else {
                                       if (initPosition ==0 && refPosition ==1 ) {
                                           // 需要判断 1 靠墙 2 靠冰箱 这样的话，放置WF
                                    	   // 同时判断是否靠近coner
                                    	   if ("wall".equals(leftObject)) {
                                    		   if (endPosition>3 ) {
                                                   Cabinet cabinetTBD = new Cabinet(highCabinetHeight,0f,"WF06",
                                                           endPosition,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),"WF",
                                                           Constants.commons.CANBINET_TYPE_HIGH, initPosition, Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, wall.getAngle(),"","");
                                                   cabinetobjectList.add(cabinetTBD);
                                               } else {
                                                   Cabinet cabinetTBD = new Cabinet(highCabinetHeight,0f,"WF03",
                                                           endPosition,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),"WF",
                                                           Constants.commons.CANBINET_TYPE_HIGH, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, wall.getAngle(),"","");
                                                   cabinetobjectList.add(cabinetTBD);
                                               }
                                    	   } else {
                                    		   // 左侧开放的，同时有冰箱版，所以不需要WF填充
                                    		   
                                    	   }
                                          

                                       } else {
                                    	// 右侧是appliance
//                                    	   String rightAppliance ;
//                                           if (Constants.commons.APPLIANCES_NAME_RANGE.equals(appliance.getAppliancekind())) {
//                                        	   rightAppliance = Constants.commons.APPLIANCES_NAME_RANGE;
//                                           } else if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(appliance.getAppliancekind())) {
//                                        	   rightAppliance = Constants.commons.APPLIANCES_NAME_REFRIGERATOR;
//                                           } else {
//                                        	   rightAppliance = "appliance";
//                                           }
                                    	   if ("wall".equals(leftObject) || "appliance".equals(leftObject) || Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(leftObject) ||
                                    			   Constants.commons.APPLIANCES_NAME_RANGE.equals(leftObject)) {
                                    		   Cabinet cabinetTBD = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f,Constants.commons.CANBINET_TBD,
                                                       endPosition,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.CANBINET_TBD,
                                                       Constants.commons.CANBINET_TYPE_LOWER, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH,leftObject, rightAppliance, wall.getAngle());
                                        	   cabinetobjectList.add(cabinetTBD);
                                    	   }
                                    	   
                                       }
                                   }
                               }

                           }
                       }
                    Cabinet cabinetAppliance = new Cabinet(appliance.getHeight(),0f,appliance.getAppliancekind(),
                            appliance.getWidth(),kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.OBJECT_TYPE_APPLIANCE,
                            Constants.commons.CANBINET_TYPE_LOWER, appliancePosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, wall.getAngle(),"","");
                    cabinetobjectList.add(cabinetAppliance);
                    initPosition = appliancePosition + applianceWidth;
                    // 之后的cabinet左侧是appliance
                    if (Constants.commons.APPLIANCES_NAME_RANGE.equals(appliance.getAppliancekind())) {
                    	leftObject = Constants.commons.APPLIANCES_NAME_RANGE;
                    } else if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(appliance.getAppliancekind())) {
                    	leftObject = Constants.commons.APPLIANCES_NAME_REFRIGERATOR;
                    } else {
                    	leftObject = "appliance";
                    }
//                    leftObject = "appliance";
                    if (refPosition == 1) { //上一次的电器为ref，所以这次的space是冰箱右侧
                        refPosition = 2;
                    }
                }
                // 如果没有appliance直接到这里，initPosition=0；
                float endPosition = wall.getWidth() - initPosition;
                if (endPosition > 0) {
                    float finalInitPosition = initPosition;
                    float finalEndPosition = wall.getWidth();
                    List<Door> doorsInRange = doorTmpList.stream()
                            .filter(door -> door.getStartposition() != null && door.getStartposition() >= finalInitPosition && door.getStartposition() <= finalEndPosition)
                            .collect(Collectors.toList());
                    if (!doorsInRange.isEmpty()){
                        for (Door door : doorsInRange) {
                            if (cabinetSBFlag == 3 && door.getStartposition()-initPosition > sbFavoriteWidth) {
                                cabinetTbdName = Constants.commons.CANBINET_TBD;
                            } else if (cabinetSBFlag == 1 && door.getStartposition()-initPosition > sbFavoriteWidth) {
                                cabinetTbdName = Constants.commons.CANBINET_TBD_SBBACK;
                                cabinetSBFlag = 2;
                            } else {
                                cabinetTbdName = Constants.commons.CANBINET_TBD;
                            }
                            
                            // 冰箱后 挨着
                            if (door.getStartposition()- initPosition-Constants.commons.POSITION_DOOR_GAP > 0) {
                            	Cabinet cabinetDoorTbd = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f,cabinetTbdName,
                                        door.getStartposition()- initPosition-Constants.commons.POSITION_DOOR_GAP,0,kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                                        Constants.commons.CANBINET_TYPE_LOWER, initPosition, Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, leftObject, "door", wall.getAngle());
                                cabinetobjectList.add(cabinetDoorTbd);
//                                Cabinet cabinetDoor = new Cabinet(door.getHeight(),0f,Constants.commons.OBJECT_TYPE_DOOR,
//                                        door.getWidth(),kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),Constants.commons.OBJECT_TYPE_DOOR,
//                                        Constants.commons.CANBINET_TYPE_LOWER, door.getStartposition(),0, wall.getAngle(),"","");
//                                cabinetobjectList.add(cabinetDoor);
                                initPosition =  door.getStartposition() + door.getWidth()+Constants.commons.POSITION_DOOR_GAP;
                                leftObject = "door";
                                endPosition = wall.getWidth() - initPosition;
                            } else {
                            	initPosition =  door.getStartposition() + door.getWidth();
                            	leftObject = "door";
                                endPosition = wall.getWidth() - initPosition;
                            }                        
                            
                        }
                        if (initPosition< finalEndPosition) {
                            // 这段代码应该和没有门部分一样
                        	CabinetResult cabinetDoorTbdR = designCabinetNextTOWall(kitchenInfo, wall, endPosition,cabinetSBFlag, finalEndPosition, initPosition,  refPosition, 
                        			highCabinetHeight,leftObject, rightObjectWall, pantryRequired,  windowsCheckS, windowsCheckR, windowsCheckE, hoodStartPosition,  hoodWidth);
                            if (cabinetDoorTbdR != null) {
                            	
                            	cabinetobjectList.add(cabinetDoorTbdR.getCabinet());
                            	cabinetSBFlag = cabinetDoorTbdR.getCabinetSBFlag();
                            }
                            
                        }
                    } else {
                    	CabinetResult cabinetDoorTbdR = designCabinetNextTOWall(kitchenInfo,  wall,  endPosition,  cabinetSBFlag,  finalEndPosition, initPosition,  refPosition, 
                    			highCabinetHeight,leftObject, rightObjectWall, pantryRequired, windowsCheckS, windowsCheckR, windowsCheckE, hoodStartPosition,  hoodWidth);
                        if (cabinetDoorTbdR != null) {
                        	cabinetobjectList.add(cabinetDoorTbdR.getCabinet());
                        	cabinetSBFlag = cabinetDoorTbdR.getCabinetSBFlag();
                        }
                        
                    }
                }

            }
            multipleCabinetList.add(cabinetobjectList);
        }

        // island's cabinet
        String islandType = "";

        List<Cabinet> cabinetIslandList = new ArrayList<>();
        if (island!=null && island.getWidth()!= 0) {
        	islandType = Constants.commons.CANBINET_TYPE_ISLAND_INER ;
        	int rotationIsland = 0;
            if ("island".equals(island.getIslandKind())) {
            	if ("H".equals(island.getHorverType())) {
                	rotationIsland = 180;
                } else {
                	rotationIsland = 270;
                }
            } else {

            	if ("I".equals(kitchenInfo.getShapeType())) {
    				rotationIsland = 90;
    			} else if ("II".equals(kitchenInfo.getShapeType())) {
    				 if (island.getPeninsulaisadjacentto().equals("one")) {
    					 rotationIsland = 90;
    				 } else if (island.getPeninsulaisadjacentto().equals("two")) {
    					 rotationIsland = 270;        					
    				 }        				 
    			} else if ("L".equals(kitchenInfo.getShapeType()) || "U".equals(kitchenInfo.getShapeType())) {
    				if (island.getPeninsulaisadjacentto().equals("one")) {
    					 rotationIsland = 180;       		                
		            } else if (island.getPeninsulaisadjacentto().equals("two")) {
		            	rotationIsland = 270;   		            	
		            } else if (island.getPeninsulaisadjacentto().equals("three")) {
		            	rotationIsland = 180;
		            }
    			} 
            }
            if (island.getLength() >= 24 ) {
            	//
                List<Appliance> applianceIslandTmpList = new ArrayList<>();
                applianceIslandTmpList = applianceList.stream()
                        .filter(appliance -> island.equals(appliance.getIsland()))
                        .sorted(Comparator.comparing(Appliance::getPosition))
                        .collect(Collectors.toList());
                float initPosition = 0;
                String leftIsland = "";
                String rightIsland = "";
                String cabinetTbdName = Constants.commons.CANBINET_TBD;
                for (Appliance appliance : applianceIslandTmpList) {

                    float endPosition = appliance.getPosition() - initPosition;
                    if (Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(appliance.getAppliancekind()) && (cabinetSBFlag == 0)) {
                        cabinetSBFlag = 1;
                    } else if (cabinetSBFlag == 1) { // Dishwasher 左侧位置不够，为安排sb
                        cabinetSBFlag = 3; // 第一处space安排sb
                    } else {
                        // none
                    }
                    if (endPosition > 0) {
                        float finalInitPosition = initPosition;
                        if (cabinetSBFlag == 3 && endPosition > sbFavoriteWidth) {
                            cabinetSBFlag = 2;
                            cabinetTbdName =  Constants.commons.CANBINET_TBD_SBBACK;
                        } else if (cabinetSBFlag == 1 && endPosition > sbFavoriteWidth) {
                            cabinetTbdName = Constants.commons.CANBINET_TBD_SBFRONT;
                            cabinetSBFlag = 2;
                        } else {
                            cabinetTbdName = Constants.commons.CANBINET_TBD;
                        }

                        Cabinet cabinetTBD = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT, 0f, cabinetTbdName,
                                endPosition, kitchenInfo.getCeilingHeight(), kitchenInfo.getId(), island.getId(), cabinetTbdName,
                                islandType, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, rotationIsland,leftIsland, Constants.commons.OBJECT_TYPE_APPLIANCE);
                        cabinetIslandList.add(cabinetTBD);
                        leftIsland = "";
                    }
                    //
                    Cabinet cabinetAppliance = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT, 0f, appliance.getAppliancekind(),
                            appliance.getWidth(), kitchenInfo.getCeilingHeight(), kitchenInfo.getId(), island.getId(), Constants.commons.OBJECT_TYPE_APPLIANCE,
                            islandType, appliance.getPosition(),Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, rotationIsland,"","");
                    cabinetIslandList.add(cabinetAppliance);
                    initPosition = appliance.getPosition() + appliance.getWidth();
                    leftIsland= "appliance";
                }

                float endPosition = island.getWidth() - initPosition;
                if (endPosition > 0) {
                    float finalInitPosition = initPosition;
                    if (cabinetSBFlag == 3 && endPosition > sbFavoriteWidth) {
                        cabinetSBFlag = 2;
                        cabinetTbdName =  Constants.commons.CANBINET_TBD_SBBACK;
                    } else if (cabinetSBFlag == 1 && endPosition > sbFavoriteWidth) {
                        cabinetTbdName =  Constants.commons.CANBINET_TBD_SBBACK;
                        cabinetSBFlag = 2;
                    } else {
                        cabinetTbdName = Constants.commons.CANBINET_TBD;
                    }        
                    Cabinet cabinetTBD = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT, 0f, cabinetTbdName,
                            endPosition, kitchenInfo.getCeilingHeight(), kitchenInfo.getId(), island.getId(), cabinetTbdName,
                            islandType, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, rotationIsland,leftIsland,rightIsland);
                    cabinetIslandList.add(cabinetTBD);
                }

                // 暂时想定appliance在iner侧
                // 判断是否需要outer cabinet

                boolean outsideNeed = false;
                Integer islandCabinetDepth = 24;
                if (island.getIsOverhang()) {
                    if (island.getLength() >= 60 ) {
                        outsideNeed = true;
                        islandCabinetDepth = 24;
                    } else if (island.getLength() >= 48 ) {
                        outsideNeed = true;
                        islandCabinetDepth = 12;
                    } else if (island.getLength() >= 36 ) {
                    	outsideNeed = false;
                    	islandCabinetDepth = 0;
                    } else if (island.getLength() >= 24 ) {
                    	outsideNeed = false;
                    	islandCabinetDepth = 0;
                  } else if  (island.getLength() >= 12 ) {
                	  outsideNeed = false;
                  		islandCabinetDepth = 0;
                  }
                } else {
                	if (island.getLength() >= 60 ) {
                        outsideNeed = true;
                        islandCabinetDepth = 24;
                    } else if (island.getLength() >= 48 ) {
                        outsideNeed = true;
                        islandCabinetDepth = 24;
                    } else if (island.getLength() >= 36 ) {
                    	outsideNeed = true;
                        islandCabinetDepth = 12;
                    } else if (island.getLength() >= 24 ) {
                    	outsideNeed = false;
                    	islandCabinetDepth = 0;
                  }
                }
                int rotationIslandOut = 180;
                if ("island".equals(island.getIslandKind())) {
                	if (outsideNeed) {
                    	if ("H".equals(island.getHorverType())) {
                    		rotationIslandOut = 0;
                    	} else {
                    		rotationIslandOut = 90;
                    	}
    	            	Cabinet cabinetTBD = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT, 0f, Constants.commons.CANBINET_ISLANDOUTTBD,
    	                        (float)island.getWidth(), kitchenInfo.getCeilingHeight(), kitchenInfo.getId(), island.getId(), Constants.commons.CANBINET_ISLANDOUTTBD,
    	                        Constants.commons.CANBINET_TYPE_ISLAND_OUTER, 0f, islandCabinetDepth, rotationIslandOut,"","");
    	                cabinetIslandList.add(cabinetTBD);
    	                
                    }
                } else {
                	// 半岛的时候
                	if (outsideNeed) {
    	        		if ("I".equals(kitchenInfo.getShapeType()) || "II".equals(kitchenInfo.getShapeType())) {
    	        			if ("one".equals(island.getPeninsulaisadjacentto())) {
    	        				rotationIslandOut = 270;
    	            		} else if ("two".equals(island.getPeninsulaisadjacentto())) {
    	            			rotationIslandOut = 90;
    	            		} 
    	        		} else if ("U".equals(kitchenInfo.getShapeType())  ) {
    	        			rotationIslandOut = 0;
    	        		} else if ("L".equals(kitchenInfo.getShapeType())) {
    	        			if ("one".equals(island.getPeninsulaisadjacentto())) {
    	        				rotationIslandOut = 0;
    	            		} else if ("two".equals(island.getPeninsulaisadjacentto())) {
    	            			rotationIslandOut = 90;
    	            		} 
    	        		}
    	        		Cabinet cabinetTBD = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT, 0f, Constants.commons.CANBINET_ISLANDOUTTBD,
    	                        (float)island.getWidth(), kitchenInfo.getCeilingHeight(), kitchenInfo.getId(), island.getId(), Constants.commons.CANBINET_ISLANDOUTTBD,
    	                        Constants.commons.CANBINET_TYPE_ISLAND_OUTER, 0f, islandCabinetDepth, rotationIslandOut,"","");
    	                cabinetIslandList.add(cabinetTBD);
                    }
                }
            } else if (island.getLength() >= 12 ) {
            	// 
            	Cabinet cabinetTBD = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT, 0f, Constants.commons.CANBINET_TBD,
                        (float)island.getWidth(), kitchenInfo.getCeilingHeight(), kitchenInfo.getId(), island.getId(), Constants.commons.CANBINET_TBD,
                        Constants.commons.CANBINET_TYPE_ISLAND_INER, 0f, 12, rotationIsland,"","");
                cabinetIslandList.add(cabinetTBD);
            }
            
            
            multipleCabinetList.add(cabinetIslandList);
        }
        // Lower rule List
        // 过滤 type = "Lower" 的对象
        List<Cabinetsrule> lowerCabinetsRule = cabinetsruleList.stream()
                .filter(cabinetRule -> "lower".equalsIgnoreCase(cabinetRule.getType()))
                .collect(Collectors.toList());
        // 过滤 construction = cabinet的construction 的对象
        String construction = "";
        if (kitchenInfo.getConstruction2() != null && kitchenInfo.getConstruction2().length() >= 3) {
            construction = kitchenInfo.getConstruction2().substring(0, 3);
        } else if (kitchenInfo.getConstruction2() != null) {
            construction = kitchenInfo.getConstruction2();
        }
        String constructionT = construction;
        // Distinguish between two categories: framed and frameless.
        if (!"BC1".equals(construction)) {
        	constructionT = "BC2";
        }
        // Make construction final for use in lambda
        final String finalConstruction = constructionT;
        // 过滤 construction = cabinet的construction 的对象
        List<Cabinetsrule> filteredCabinetsRule = lowerCabinetsRule.stream()
                .filter(cabinetRule -> {
                    if (cabinetRule.getConstruction() == null) {
                        return false;
                    }
                    String ruleConstruction = cabinetRule.getConstruction().length() >= 3 ? 
                            cabinetRule.getConstruction().substring(0, 3) : cabinetRule.getConstruction();
                    return ruleConstruction.equalsIgnoreCase(finalConstruction);
                })
                .sorted(Comparator.comparing(Cabinetsrule::getSpaceWidth, Comparator.reverseOrder()))
                .collect(Collectors.toList());
        // 过滤 construction = cabinet的construction 的对象
        String constructionIsland = "";
        if (kitchenInfo.getConstruction3() != null && kitchenInfo.getConstruction3().length() >= 3) {
        	constructionIsland = kitchenInfo.getConstruction3().substring(0, 3);
        } else if (kitchenInfo.getConstruction3() != null) {
        	constructionIsland = kitchenInfo.getConstruction3();
        }
        String constructionIslandT = constructionIsland;
        // Distinguish between two categories: framed and frameless.
        if (!"BC1".equals(constructionIsland)) {
        	constructionIslandT = "BC2";
        }
        final String finalConstructionI = constructionIslandT;
        List<Cabinetsrule> filteredCabinetsRuleIsland = lowerCabinetsRule.stream()
                .filter(cabinetRule -> {
                    if (cabinetRule.getConstruction() == null) {
                        return false;
                    }
                    String ruleConstruction = cabinetRule.getConstruction().length() >= 3 ? 
                            cabinetRule.getConstruction().substring(0, 3) : cabinetRule.getConstruction();
                    return ruleConstruction.equalsIgnoreCase(finalConstructionI);
                })
                .sorted(Comparator.comparing(Cabinetsrule::getSpaceWidth, Comparator.reverseOrder()))
                .collect(Collectors.toList());

        //检查是否有需要衔接的柜子
        //wallid，adjacentwallid
        ArrayList<List<Cabinet>> multipleCabinetConList = designCabinetConnect( kitchenInfo, wallInfoList,  multipleCabinetList, "lower");
        
        // 如果有peninsula时候，需要衔接的柜子
        ArrayList<List<Cabinet>> multipleCabinetConListPeninsula = designCabinetConnectPeninsula( kitchenInfo,wallInfoList,  multipleCabinetConList, island);
        
        // 确定Range位置，判断是否放置BSR
        ArrayList<List<Cabinet>> multipleCabinetBSR =ajustingBSR(multipleCabinetConListPeninsula);
        
        // 拆分宽度，选择合适的柜子
        ArrayList<List<Cabinet>> newMultipleCabinetList = multipleCabinetBSR.stream()
                .map(list -> list.stream()
                        .flatMap(cabinet -> {
                            if (Constants.commons.CANBINET_TBD_SBFRONT.equals(cabinet.getCabinettype()) && cabinet.getWidth() > 0) {
//                                return getCabinetSB(Constants.commons.CANBINET_TBD_SBFRONT, cabinet, filteredCabinetsRule).stream();
                                if (Constants.commons.CANBINET_TYPE_ISLAND_INER.equals(cabinet.getType()) ||
                                		Constants.commons.CANBINET_TYPE_ISLAND_OUTER.equals(cabinet.getType())) {
                                	List<Cabinet> generated = getCabinetSB(Constants.commons.CANBINET_TBD_SBFRONT, cabinet, filteredCabinetsRuleIsland);
                                    return generated == null ? Stream.empty() : generated.stream();
                                } else {
                                	List<Cabinet> generated = getCabinetSB(Constants.commons.CANBINET_TBD_SBFRONT, cabinet, filteredCabinetsRule);
                                    return generated == null ? Stream.empty() : generated.stream();
                                }                            	
                            }  else if ( Constants.commons.CANBINET_TBD_SBBACK.equals(cabinet.getCabinettype()) && cabinet.getWidth() > 0) {
//                                return getCabinetSB( Constants.commons.CANBINET_TBD_SBBACK, cabinet, filteredCabinetsRule).stream();
                            	 if (Constants.commons.CANBINET_TYPE_ISLAND_INER.equals(cabinet.getType()) ||
                                 		Constants.commons.CANBINET_TYPE_ISLAND_OUTER.equals(cabinet.getType())) {
                                 	List<Cabinet> generated = getCabinetSB(Constants.commons.CANBINET_TBD_SBBACK, cabinet, filteredCabinetsRuleIsland);
                                     return generated == null ? Stream.empty() : generated.stream();
                                 } else {
                                 	List<Cabinet> generated = getCabinetSB(Constants.commons.CANBINET_TBD_SBBACK, cabinet, filteredCabinetsRule);
                                     return generated == null ? Stream.empty() : generated.stream();
                                 }                            	
                            } else if ( Constants.commons.CANBINET_TBDWPS.equals(cabinet.getCabinettype()) && cabinet.getWidth() > 0) {
//                                return getCabinetWP( Constants.commons.CANBINET_TBDWPS, cabinet, filteredCabinetsRule).stream();
                                List<Cabinet> generated =getCabinetWP( Constants.commons.CANBINET_TBDWPS, cabinet, filteredCabinetsRule, windowList, doorList, applianceList);
                                return generated == null ? Stream.empty() : generated.stream();
                            } else if ( Constants.commons.CANBINET_TBDWPE.equals(cabinet.getCabinettype()) && cabinet.getWidth() > 0) {
//                                return getCabinetWP( Constants.commons.CANBINET_TBDWPE, cabinet, filteredCabinetsRule).stream();
                                List<Cabinet> generated = getCabinetWP( Constants.commons.CANBINET_TBDWPE, cabinet, filteredCabinetsRule,  windowList, doorList, applianceList);
                                return generated == null ? Stream.empty() : generated.stream();
                            } else if ( Constants.commons.CANBINET_TBDWPR.equals(cabinet.getCabinettype()) && cabinet.getWidth() > 0) {
//                                return getCabinetWP( Constants.commons.CANBINET_TBDWPR, cabinet, filteredCabinetsRule).stream();
                                List<Cabinet> generated = getCabinetWP( Constants.commons.CANBINET_TBDWPR, cabinet, filteredCabinetsRule,  windowList, doorList, applianceList);
                                return generated == null ? Stream.empty() : generated.stream();
                            }
                            else if (Constants.commons.CANBINET_TBD.equals(cabinet.getCabinettype()) && cabinet.getWidth() > 0) {
//                                return getCabinetFromRuleLower(cabinet, filteredCabinetsRule).stream();
                            	if (Constants.commons.CANBINET_TYPE_ISLAND_INER.equals(cabinet.getType()) ||
                                		Constants.commons.CANBINET_TYPE_ISLAND_OUTER.equals(cabinet.getType())) {
                                    List<Cabinet> generated = getCabinetFromRuleLower(cabinet, filteredCabinetsRuleIsland);
                                    return generated == null ? Stream.empty() : generated.stream();
                                } else {
                                	List<Cabinet> generated = getCabinetFromRuleLower(cabinet, filteredCabinetsRule);
                                    return generated == null ? Stream.empty() : generated.stream();
                                }      
                                
                            } else {
                                return Stream.of(cabinet);
                            }
                        })
                        .collect(Collectors.toList()))
                .collect(Collectors.toCollection(ArrayList::new));
        
        
        // 如果发现两个BF3连续则合并为一个BF6；
        ArrayList<List<Cabinet>> newMultipleCabinetListBF3 = adjustCabinetBF3(newMultipleCabinetList, "lower");
        
        // 检查开放的墙最开始/结尾的柜子是否为bf/wf，如果是的话就删除
        ArrayList<List<Cabinet>> newMultipleCabinetListBF = adjustCabinetBFWF(newMultipleCabinetListBF3, "lower", kitchenInfo, wallInfoList, island, 
        		filteredCabinetsRule, finalConstruction);
        
        
        multipleCabinetList.clear();
        multipleCabinetList.addAll(newMultipleCabinetListBF);
        
        for (List<Cabinet> cabinetList : multipleCabinetList) {
            // 遍历内层列表（每个Cabinet）
            for (Cabinet cabinet : cabinetList) {
                // 如果Cabinet已经存在（有id），可以进行更新
                // 如果是新Cabinet，可以直接保存
                // 设置construction
            	if (Constants.commons.CANBINET_TYPE_ISLAND_INER.equals(cabinet.getType()) ||
            			Constants.commons.CANBINET_TYPE_ISLAND_OUTER.equals(cabinet.getType())) {
            		cabinet.setConstruction(kitchenInfo.getConstruction3());
            	} else {
            		cabinet.setConstruction(kitchenInfo.getConstruction2());
            	}
                
                if (Constants.commons.CANBINET_TYPE_SP.equals(cabinet.getCabinettype()) && cabinet.getWidth() == 0) {
                	cabinet.setWidth(Constants.commons.CANBINET_WIDTH_SPPAD);
                }
                if (cabinet.getWidth() < 24f && ("B".equals(cabinet.getCabinettype()) || "W".equals(cabinet.getCabinettype()))) {
                	float wallWidth = 0;
                	if ("lower".equals(cabinet.getType()) || "upper".equals(cabinet.getType()) || "high".equals(cabinet.getType())) {
                		Wall wall = wallInfoList.stream()
                			    .filter(item -> item.getId() != null && 
                			    		item.getId().equals(cabinet.getWallid()))
                			    .findFirst()
                			    .orElse(null);
                		wallWidth =  wall.getWidth();
                	} else if ("islandiner".equals(cabinet.getType()) || "islandouter".equals(cabinet.getType())  
                			|| "peninsulainer".equals(cabinet.getType())) {              		
                		wallWidth =  island.getWidth();
                	}
            		
            		if (wallWidth > 0 ) {
            			if (cabinet.getStartposition() < wallWidth/2) {
	            			cabinet.setName(cabinet.getName() + "R");
	            		} else {
	            			cabinet.setName(cabinet.getName() + "L");
	            		}
            		}	            		
            	}
                cabinetRepository.save(cabinet);
            }
        }
        // 确定Cabinet，保存DB
        return multipleCabinetList;
    }
    
    /**
     * Helper method to process a single cabinet and add it to the new list.
     */
    private List<Cabinet> processAndAddCabinet(List<Cabinet> cabinetList, Optional<Cabinet> minOptional, Optional<Cabinet> maxOptional, float padWidth, String baseType,
    		List<Cabinet> leftCabinets, List<Cabinet> rightCabinets, List<Wall> wallInfoList, float islandFinalWidth, Integer islandFinalFlg, String padName) {
        
    	List<Cabinet>  cabinetNewList = new ArrayList();    	
        for (int i = 0; i < cabinetList.size() ; i++) {
        	Cabinet cabinetT = cabinetList.get(i);
        	String cabinetType = cabinetT.getCabinettype();
        	Integer wallId = cabinetT.getWallid();
        	Optional<Wall> wallT = wallInfoList.stream()
                    .filter(w -> w.getId() == wallId)
                    .findFirst();
        	Wall foundWall = wallT.orElse(null); // 未找到时返回 null

        	boolean firstFlg = false;          	
        	if (cabinetType != null && ("BF".equals(cabinetType) || "WF".equals(cabinetType)  || "FILLER".equals(cabinetType))) {
    			if (cabinetT.getCornerKey() == null || "".equals(cabinetT.getCornerKey())) {
    				if (cabinetT.getAdjustotherwall() ) { // 靠墙位置有调整
    					if ("wall".equals(cabinetT.getRightobject()) || "wall".equals(cabinetT.getLeftobject()) ||  "corner".equals(cabinetT.getLeftobject()) || "corner".equals(cabinetT.getRightobject()) ||  "highcabinet".equals(cabinetT.getLeftobject()) || "highcabinet".equals(cabinetT.getRightobject())) {
    						if (cabinetT.getStartposition()+cabinetT.getWidth() == foundWall.getWidth()) {
    							// 确实靠墙
    							if ("highcabinet".equals(cabinetT.getLeftobject()) && !"wall".equals(cabinetT.getRightobject()) && !"corner".equals(cabinetT.getRightobject()) ){
    								//不需要
    							} else {
    								cabinetNewList.add(cabinetT);
    							}
    								
    							
    						} else if (cabinetT.getStartposition() == 0) {
    							cabinetNewList.add(cabinetT);
    						} else {
    							if ("wall".equals(cabinetT.getRightobject()) ||  "corner".equals(cabinetT.getRightobject())) {
    								Cabinet newCabinet = new Cabinet(cabinetT);
    	    	                    newCabinet.setWidth(padWidth);
    	    	                    newCabinet.setCabinettype(baseType);
    	    	                    newCabinet.setName(padName);
    	    	                    newCabinet.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth());
    	    	                    cabinetNewList.add(newCabinet); 
    	    	                    cabinetNewList.add(cabinetT);   	                    
    	    	                    
    								
    							} else if ( "wall".equals(cabinetT.getLeftobject()) ||  "corner".equals(cabinetT.getLeftobject())){
    								Cabinet newCabinet = new Cabinet(cabinetT);
    	    	                    newCabinet.setWidth(padWidth);
    	    	                    newCabinet.setCabinettype(baseType);
    	    	                    newCabinet.setName(padName);
    	    	                    newCabinet.setStartposition(cabinetT.getStartposition() - padWidth);
    	    	                    cabinetNewList.add(newCabinet);   
    	    	                    cabinetNewList.add(cabinetT);
    							} else {
    								cabinetNewList.add(cabinetT);
    							}
    						}
    							
    						
    					} else if ("door".equals(cabinetT.getRightobject()) || "window".equals(cabinetT.getRightobject())) {
    						Cabinet newCabinet = new Cabinet(cabinetT);
    	                    newCabinet.setWidth(padWidth);
    	                    newCabinet.setCabinettype(baseType);
    	                    newCabinet.setName(padName);
    	                    newCabinet.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth());
    	                    cabinetNewList.add(newCabinet); 
    	                    cabinetNewList.add(cabinetT);
    					} else if ("door".equals(cabinetT.getLeftobject()) || "window".equals(cabinetT.getLeftobject())) {
    						Cabinet newCabinet = new Cabinet(cabinetT);
    	                    newCabinet.setWidth(padWidth);
    	                    newCabinet.setCabinettype(baseType);
    	                    newCabinet.setName(padName);
    	                    newCabinet.setStartposition(cabinetT.getStartposition() - padWidth);
    	                    cabinetNewList.add(newCabinet);   
    	                    cabinetNewList.add(cabinetT);
    					} else {
    						cabinetNewList.add(cabinetT);
    					}
						
					} else {
							if (cabinetT.getStartposition() == minOptional.map(Cabinet::getStartposition).orElse((float) -1)  ) {   
								if (minOptional.map(Cabinet::getLeftobject)
							               .map(leftobject -> "islandiner".equals(leftobject) || "islandouter".equals(leftobject)) 
							               .orElse(false)) {
								Cabinet newCabinet = new Cabinet(cabinetT);
								if ("islandiner".equals(cabinetT.getLeftobject()) ) {
									if (islandFinalFlg == 2 ) {
										Cabinet newCabinetC = new Cabinet(cabinetT);
										newCabinetC.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth() - islandFinalWidth);
										newCabinetC.setWidth(islandFinalWidth);    										
						                cabinetNewList.add(newCabinetC);
						                
										newCabinet.setWidth(padWidth);
					                    newCabinet.setCabinettype(baseType);
					                    newCabinet.setName(padName);
//					                    newCabinet.setStartposition(cabinetT.getStartposition()  + islandFinalWidth );
					                    newCabinet.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth() - islandFinalWidth - padWidth );
				                        cabinetNewList.add(newCabinet);
				                       
									} else {
	                    
					                    Cabinet newCabinetI = new Cabinet(cabinetT);
					                    newCabinetI.setWidth(padWidth);
					                    newCabinetI.setCabinettype(baseType);
					                    newCabinetI.setName(padName);
					                    newCabinetI.setStartposition(cabinetT.getStartposition() - padWidth);
				                        cabinetNewList.add(newCabinetI); 
				                        cabinetNewList.add(cabinetT);
				                        
					                    
									}
								} else {
									if (islandFinalFlg == 2 ) {
										newCabinet.setWidth(padWidth);
					                    newCabinet.setCabinettype(baseType);
					                    newCabinet.setName(padName);
					                    newCabinet.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth()- padWidth );
				                        cabinetNewList.add(newCabinet);
									} else {
//										Cabinet newCabinetC = new Cabinet(cabinetT);
//										newCabinetC.setWidth(islandFinalWidth);    
//										newCabinetC.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth() - islandFinalWidth);
//										cabinetNewList.add(newCabinetC);
//						                
//										newCabinet.setWidth(padWidth);
//					                    newCabinet.setCabinettype(baseType);
//					                    newCabinet.setName(padName);
//					                    newCabinet.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth() - islandFinalWidth - padWidth );
//					                    cabinetNewList.add(newCabinet);
										Cabinet newCabinetI = new Cabinet(cabinetT);
										newCabinetI.setWidth(padWidth);
										newCabinetI.setCabinettype(baseType);
										newCabinetI.setName(padName);
										newCabinetI.setStartposition(cabinetT.getStartposition()- padWidth);
				                        cabinetNewList.add(newCabinetI); 
				                        cabinetNewList.add(cabinetT);
									}
									
								}
//									Cabinet newCabinet = new Cabinet(cabinetT);
//				                    newCabinet.setWidth(padWidth);
//				                    newCabinet.setCabinettype(baseType);
//				                    newCabinet.setName(padName);
////			                        newCabinet.setStartposition(cabinetT.getStartposition() - padWidth );
//				                    newCabinet.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth()- padWidth );
//			                        cabinetNewList.add(newCabinet);
////			                        cabinetNewList.add(cabinetT);
								} else if (minOptional.map(Cabinet::getLeftobject)
							               .map(leftobject -> "islandinerWaterfall".equals(leftobject) || "islandouterWaterfall".equals(leftobject))
							               .orElse(false)) {
			                        cabinetNewList.add(cabinetT);
								} else if (minOptional.map(Cabinet::getLeftobject)
							               .map(leftobject -> "islandinerFiller".equals(leftobject) || "islandouterFiller".equals(leftobject))
							               .orElse(false)) {
									// add panel 
			    					Cabinet newCabinet = new Cabinet(cabinetT);
			                        newCabinet.setWidth(padWidth);
			                        newCabinet.setCabinettype(baseType);
			                        newCabinet.setName(padName);
			                        newCabinet.setStartposition(cabinetT.getStartposition() - padWidth);
			                        cabinetNewList.add(newCabinet); 	
			                        cabinetNewList.add(cabinetT);
								}  else if (minOptional.map(Cabinet::getLeftobject)
								               .map(leftobject -> "wall".equals(leftobject) ||  "highcabinet".equals(leftobject) ||  "corner".equals(leftobject))
								               .orElse(false)) {
									//
									if (cabinetT.getStartposition()+cabinetT.getWidth() == foundWall.getWidth()) {
		    							// 确实靠墙
		    							if ("highcabinet".equals(cabinetT.getLeftobject()) && !"wall".equals(cabinetT.getRightobject()) && !"corner".equals(cabinetT.getRightobject()) ){
		    								//不需要
		    							} else {
		    								cabinetNewList.add(cabinetT);
		    							} 	
		    						} else {
		    							  cabinetNewList.add(cabinetT);
		    						}									
				                      
								} else {
									if ("appliance".equals(cabinetT.getRightobject()) ) {
										Cabinet applianceCabinet = cabinetList.get(i+1); 
										if (applianceCabinet != null && "Dishwasher".equals(   applianceCabinet.getName())) {
											// 去掉Filler， 同时需要修改为DWP
											if ("SP".equals(baseType)) {
												Cabinet newCabinet = new Cabinet(cabinetT);
							                    newCabinet.setWidth(3f);
							                    newCabinet.setCabinettype(baseType);
							                    newCabinet.setName("DWP");
						                        newCabinet.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth() - 3f);
						                        cabinetNewList.add(newCabinet);
											}
											
										} else if (applianceCabinet != null && "Range".equals(   applianceCabinet.getName())) {
											// 去掉Filler， 同时不需要修改为PNB
										} else if (applianceCabinet != null && "HOOD".equals(   applianceCabinet.getName())) {
											// 去掉Filler， 同时不需要修改为PNB
										} else {
											// 去掉Filler， 同时不需要修改为PNB
										}
										
									} else {
										Cabinet newCabinet = new Cabinet(cabinetT);
					                    newCabinet.setWidth(padWidth);
					                    newCabinet.setCabinettype(baseType);
					                    newCabinet.setName(padName);
				                        newCabinet.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth() - padWidth);
				                        cabinetNewList.add(newCabinet);
									}
									
								}
	        				} else if (cabinetT.getStartposition() == maxOptional.map(Cabinet::getStartposition).orElse((float) -1) ) {
	        					if (maxOptional.map(Cabinet::getRightobject)
							               .map(rightobject -> "islandiner".equals(rightobject) || "islandouter".equals(rightobject) ) 
							               .orElse(false)) {
	        						Cabinet newCabinet = new Cabinet(cabinetT);
									//1:islandiner 2:islandouter
									if ("islandiner".equals(cabinetT.getRightobject())  ) {
										if (islandFinalFlg == 2 ) {
											Cabinet newCabinetC = new Cabinet(cabinetT);
											newCabinetC.setWidth(islandFinalWidth);    
							                cabinetNewList.add(newCabinetC);
							                
											newCabinet.setWidth(padWidth);
						                    newCabinet.setCabinettype(baseType);
						                    newCabinet.setName(padName);
						                    newCabinet.setStartposition(cabinetT.getStartposition()  + islandFinalWidth );
					                        cabinetNewList.add(newCabinet);
					                       
										} else {
//											newCabinet.setWidth(padWidth);
//						                    newCabinet.setCabinettype(baseType);
//						                    newCabinet.setName(padName);
//						                    cabinetNewList.add(newCabinet);
						                    
						                    
						                    Cabinet newCabinetI = new Cabinet(cabinetT);
						                    newCabinetI.setWidth(padWidth);
						                    newCabinetI.setCabinettype(baseType);
						                    newCabinetI.setName(padName);
						                    newCabinetI.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth());
					                        cabinetNewList.add(newCabinetI); 
					                        cabinetNewList.add(cabinetT);
										}
									} else {
										if (islandFinalFlg == 2 ) {
											newCabinet.setWidth(padWidth);
						                    newCabinet.setCabinettype(baseType);
						                    newCabinet.setName(padName);
//						                        newCabinet.setStartposition(cabinetT.getStartposition()  + cabinetT.getWidth() );
					                        cabinetNewList.add(newCabinet);
//						                        cabinetNewList.add(cabinetT);
										} else {
//											Cabinet newCabinetC = new Cabinet(cabinetT);
//											newCabinetC.setWidth(islandFinalWidth);    
//							                cabinetNewList.add(newCabinetC);
//							                
//											newCabinet.setWidth(padWidth);
//						                    newCabinet.setCabinettype(baseType);
//						                    newCabinet.setName(padName);
//						                    newCabinet.setStartposition(cabinetT.getStartposition()  + islandFinalWidth );
//						                    cabinetNewList.add(newCabinet);
											Cabinet newCabinetI = new Cabinet(cabinetT);
											newCabinetI.setWidth(padWidth);
											newCabinetI.setCabinettype(baseType);
											newCabinetI.setName(padName);
											newCabinetI.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth());
					                        cabinetNewList.add(newCabinetI); 
					                        cabinetNewList.add(cabinetT);
										}
										
									}
									
	        						
//				                    newCabinet.setWidth(padWidth);
//				                    newCabinet.setCabinettype(baseType);
//				                    newCabinet.setName(padName);
////			                        newCabinet.setStartposition(cabinetT.getStartposition()  + cabinetT.getWidth() );
//			                        cabinetNewList.add(newCabinet);
////			                        cabinetNewList.add(cabinetT);
	        					} else if (maxOptional.map(Cabinet::getRightobject)
							               .map(rightobject -> "islandinerWaterfall".equals(rightobject) || "islandouterWaterfall".equals(rightobject))
							               .orElse(false)) {
			                        cabinetNewList.add(cabinetT);
	        					} else if (maxOptional.map(Cabinet::getRightobject)
							               .map(rightobject -> "islandinerFiller".equals(rightobject) || "islandouterFiller".equals(rightobject))
							               .orElse(false)) {
									// add panel 
	        						Cabinet newCabinet = new Cabinet(cabinetT);
	        	                    newCabinet.setWidth(padWidth);
	        	                    newCabinet.setCabinettype(baseType);
	        	                    newCabinet.setName(padName);
	        	                    newCabinet.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth());
	        	                    cabinetNewList.add(newCabinet);    
			                        cabinetNewList.add(cabinetT);
	        					}  else if (maxOptional.map(Cabinet::getRightobject)
							               .map(rightobject -> "wall".equals(rightobject) || "highcabinet".equals(rightobject) || "corner".equals(rightobject))
							               .orElse(false)) {
	        						if (cabinetT.getStartposition()+cabinetT.getWidth() == foundWall.getWidth()) {
		    							// 确实靠墙
		    							if ("highcabinet".equals(cabinetT.getLeftobject()) && !"wall".equals(cabinetT.getRightobject()) && !"corner".equals(cabinetT.getRightobject()) ){
		    								//不需要
		    							} else {
		    								cabinetNewList.add(cabinetT);
		    							} 	
		    						} else {
		    							  cabinetNewList.add(cabinetT);
		    						}	
//			                        cabinetNewList.add(cabinetT);
								} else {
									if ("appliance".equals(cabinetT.getLeftobject()) ) {
										Cabinet applianceCabinet = cabinetList.get(i-1); 
										if (applianceCabinet != null && "Dishwasher".equals(   applianceCabinet.getName())) {
											if ("SP".equals(baseType)) {
												Cabinet newCabinet = new Cabinet(cabinetT);
							                    newCabinet.setWidth(3f);
							                    newCabinet.setCabinettype(baseType);
							                    newCabinet.setName("DWP");
						                        cabinetNewList.add(newCabinet);
											}
											
										} else if (applianceCabinet != null && "Range".equals(   applianceCabinet.getName())) {
											
										} else if (applianceCabinet != null && "HOOD".equals(   applianceCabinet.getName())) {
											
										} else {
											
										}
										
									} else {
			        					Cabinet newCabinet = new Cabinet(cabinetT);
					                    newCabinet.setWidth(padWidth);
					                    newCabinet.setCabinettype(baseType);
					                    newCabinet.setName(padName);
				                        cabinetNewList.add(newCabinet);
									}
								}
	        				} else {
	        					cabinetNewList.add(cabinetT);
	        				}
					}            				
    			} else {
    				cabinetNewList.add(cabinetT);
    			}
    		} else if (cabinetType != null && Arrays.asList("B", "SB", "TB", "WP","W").contains(cabinetType)) {
//    			if (cabinetT.getStartposition() == minOptional.map(Cabinet::getStartposition).orElse((float) -1) ) {  
    			// 如果左边是window 或者door
    			if (leftCabinets != null && leftCabinets.contains(cabinetT) || cabinetT.getStartposition() == minOptional.map(Cabinet::getStartposition).orElse((float) -1) && 
    					!"corner".equals(cabinetT.getLeftobject()) && !"highcabinet".equals(cabinetT.getLeftobject())  && !"wall".equals(cabinetT.getLeftobject())) {	
    				if (minOptional.map(Cabinet::getLeftobject)
				               .map(leftobject -> "islandinerWaterfall".equals(leftobject) || "islandouterWaterfall".equals(leftobject))
				               .orElse(false)) {
    				
    				} else {
    					// add panel 
    					Cabinet newCabinet = new Cabinet(cabinetT);
                        newCabinet.setWidth(padWidth);
                        newCabinet.setCabinettype(baseType);
                        newCabinet.setName(padName);
                        newCabinet.setStartposition(cabinetT.getStartposition() - padWidth);
                        cabinetNewList.add(newCabinet); 	
    				}
    						
				} 
    			if (rightCabinets != null && rightCabinets.contains(cabinetT) || cabinetT.getStartposition() == maxOptional.map(Cabinet::getStartposition).orElse((float) -1)  && 
    					!"corner".equals(cabinetT.getRightobject()) && !"highcabinet".equals(cabinetT.getRightobject()) && !"wall".equals(cabinetT.getRightobject())) {
    				if (maxOptional.map(Cabinet::getRightobject)
				               .map(rightobject -> "islandinerWaterfall".equals(rightobject) || "islandouterWaterfall".equals(rightobject))
				               .orElse(false)) {
    				} else {
    					// add panel 
    					Cabinet newCabinet = new Cabinet(cabinetT);
                        newCabinet.setWidth(padWidth);
                        newCabinet.setCabinettype(baseType);
                        newCabinet.setName(padName);
                        newCabinet.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth());
                        cabinetNewList.add(newCabinet);      
        			
    				}
    				
    				        
				} 
    			cabinetNewList.add(cabinetT);  
    		} else if (cabinetType != null && Arrays.asList("BBCR", "BBCRD","WDC", "WDCD", "WBCR", "WBCRD", "BLS", "BLSD", "WLS", "WLSD","BBCL","BBCLD", "WBCL",  "WBCLD").contains(cabinetType)) {
    			if (cabinetT.getStartposition() == minOptional.map(Cabinet::getStartposition).orElse((float) -1) && 
    					cabinetT.getStartposition() == maxOptional.map(Cabinet::getStartposition).orElse((float) -1)  ) {
			    	if (!"endisland".equals(cabinetT.getLeftobject()) && !"wall".equals(cabinetT.getLeftobject())) {
			    		// add panel 
						Cabinet newCabinet = new Cabinet(cabinetT);
	                    newCabinet.setWidth(padWidth);
	                    newCabinet.setCabinettype(baseType);
	                    newCabinet.setName(padName);
	                    newCabinet.setStartposition(cabinetT.getStartposition() - padWidth);
	                    cabinetNewList.add(newCabinet); 		
			    	}
    			} else if (leftCabinets != null && leftCabinets.contains(cabinetT) ) {	
    				// add panel 
					Cabinet newCabinet = new Cabinet(cabinetT);
                    newCabinet.setWidth(padWidth);
                    newCabinet.setCabinettype(baseType);
                    newCabinet.setName(padName);
                    newCabinet.setStartposition(cabinetT.getStartposition() - padWidth);
                    cabinetNewList.add(newCabinet); 			
				} 
    			
    			if (rightCabinets != null && rightCabinets.contains(cabinetT)) {
    				// add panel 
    				Cabinet newCabinet = new Cabinet(cabinetT);
                    newCabinet.setWidth(padWidth);
                    newCabinet.setCabinettype(baseType);
                    newCabinet.setName(padName);
                    newCabinet.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth());
                    cabinetNewList.add(newCabinet);         
    			}
    			
    			cabinetNewList.add(cabinetT); 
    		} else {
    			cabinetNewList.add(cabinetT);
    		}
        }      
        return cabinetNewList;
      
    }
    
    public ArrayList<List<Cabinet>> adjustCabinetBF3(ArrayList<List<Cabinet>> multipleCabinetList, String typeFlg ) {
        
    	ArrayList<List<Cabinet>> multipleCabinetListRet = new ArrayList();
        
    	for (List<Cabinet> cabinetList : multipleCabinetList) {
    		List<Cabinet> cabinetNewList = new ArrayList<>();

            if (cabinetList == null || cabinetList.isEmpty()) {
                multipleCabinetListRet.add(new ArrayList<>());
                continue;
            }
            String fillerNameO = "";
            String fillerNameN = "";
            if ("upper".equals(typeFlg)) {
            	fillerNameO = "WF03";
	       	 	fillerNameN = "WF06";
       	 	} else {
	       	 	fillerNameO = "BF3";
	        	fillerNameN = "BF6";
       	 	}
            
            final String fileNameFO = fillerNameO;
            final String fileNameFN = fillerNameN;		
            
            if ("lower".equals(cabinetList.get(0).getType()) || "upper".equals(cabinetList.get(0).getType())|| "high".equals(cabinetList.get(0).getType())) {
            	if ("lower".equals(typeFlg)) {
            		List<Cabinet> sortedCabinets = cabinetList.stream()
                		    .filter(cabinet -> typeFlg.equalsIgnoreCase(cabinet.getType()) 
                		                    || "high".equalsIgnoreCase(cabinet.getType()))
                		    .sorted(Comparator.comparingDouble(Cabinet::getStartposition)) // 升序排序
                		    .collect(Collectors.toList());
            		List<Cabinet> cabinetBF6List = setCabinetBF6(sortedCabinets, fileNameFO, fileNameFN );
                    cabinetNewList.addAll(cabinetBF6List);
            	} else {
            		List<Cabinet> sortedCabinets = cabinetList.stream()
                		    .filter(cabinet -> typeFlg.equalsIgnoreCase(cabinet.getType())  || "high".equalsIgnoreCase(cabinet.getType()))
                		    .sorted(Comparator.comparingDouble(Cabinet::getStartposition)) // 升序排序
                		    .collect(Collectors.toList());
            		List<Cabinet> cabinetBF6List = setCabinetBF6(sortedCabinets, fileNameFO, fileNameFN );
                    cabinetNewList.addAll(cabinetBF6List);
            	}
            	
            } else if  ("islandiner".equals(cabinetList.get(0).getType()) || "islandouter".equals(cabinetList.get(0).getType()) || "peninsulainer".equals(cabinetList.get(0).getType())) {
            	List<Cabinet> sortedCabinets = cabinetList.stream()
            		    .filter(cabinet -> "islandiner".equalsIgnoreCase(cabinet.getType()) || "peninsulainer".equals(cabinet.getType())) 
            		    .sorted(Comparator.comparingDouble(Cabinet::getStartposition)) // 升序排序
            		    .collect(Collectors.toList());            	 
            	List<Cabinet> cabinetBF6List = setCabinetBF6(sortedCabinets, fileNameFO, fileNameFN );
                cabinetNewList.addAll(cabinetBF6List);
                
                List<Cabinet> sortedCabinetsOuter = cabinetList.stream()
            		    .filter(cabinet -> "islandouter".equalsIgnoreCase(cabinet.getType()))
            		    .sorted(Comparator.comparingDouble(Cabinet::getStartposition)) // 升序排序
            		    .collect(Collectors.toList());
            	 
            	 
            	List<Cabinet> cabinetBF6ListOuter = setCabinetBF6(sortedCabinetsOuter, fileNameFO, fileNameFN );
                cabinetNewList.addAll(cabinetBF6ListOuter);
                
            } else {
            	cabinetNewList.addAll(cabinetList);
            } 
            // cabinetNewList
            multipleCabinetListRet.add(cabinetNewList);              
        }
    	
    	return multipleCabinetListRet;
    }

	public List<Cabinet> delCabinetFiller(List<Cabinet> sortedCabinets, List<Cabinet> smallestTwo, List<Cabinet> largestTwo, boolean secondAlignedSmall, boolean secondAlignedLarge) {
    	List<Cabinet> cabinetNewList = new ArrayList<>();
    	// 小柜子条件集合
        Set<String> bfSet = Set.of("BF3", "BF6");
        Set<String> wfSet = Set.of("WF03", "WF06");
        Set<String> spPnbSet = Set.of("SP", "PNB");
        Set<String> spPnwSet = Set.of("SP", "PNW");
        List<Cabinet> middle;
    	// 是否连续secondAlignedSmall==true  secondAlignedLarge==ture
    	if (secondAlignedSmall && secondAlignedLarge) {
    		String small0 = smallestTwo.get(0).getName().toUpperCase();
            String small1 = smallestTwo.get(1).getName().toUpperCase();
         // 判断小柜子是否满足条件
            boolean smallCondition = secondAlignedSmall && 
            						((bfSet.contains(small0) && spPnbSet.contains(small1)) ||
                                     (wfSet.contains(small0) && spPnwSet.contains(small1))) &&
            						!"wall".equals(smallestTwo.get(0).getLeftobject());
            String large0 = largestTwo.get(0).getName().toUpperCase();
            String large1 = largestTwo.get(1).getName().toUpperCase();
         // 判断大柜子是否满足条件（前提是 secondAlignedLarge 为 true）
            boolean largeCondition = secondAlignedLarge && 
                                     ((bfSet.contains(large1) && spPnbSet.contains(large0)) ||
                                      (wfSet.contains(large1) && spPnwSet.contains(large0)))&&
             						!"wall".equals(smallestTwo.get(1).getRightobject());
            
            if (smallCondition && largeCondition) {
                // 跳过最小的1个，保留 size-1 个（去掉最大的1个）
                middle = sortedCabinets.stream()
                        .skip(1)
                        .limit(sortedCabinets.size() - 2) 
                        .collect(Collectors.toList());
                cabinetNewList.addAll(middle);
            } else if (smallCondition) {
                // 跳过最小的1个，保留剩余全部
                middle = sortedCabinets.stream()
                        .skip(1)
                        .collect(Collectors.toList());
                cabinetNewList.addAll(middle);
            } else if (largeCondition) {
                // 跳过最小的1个，保留剩余全部
                middle = sortedCabinets.stream()
                		.limit(Math.max(0, sortedCabinets.size() - 1))
                        .collect(Collectors.toList());
                cabinetNewList.addAll(middle);
            } else {
            	cabinetNewList.addAll(sortedCabinets);
            }
            
    	} else if (secondAlignedSmall) {
    		String small0 = smallestTwo.get(0).getName().toUpperCase();
            String small1 = smallestTwo.get(1).getName().toUpperCase();
         // 判断小柜子是否满足条件
            boolean smallCondition = secondAlignedSmall && 
            						((bfSet.contains(small0) && spPnbSet.contains(small1)) ||
                                     (wfSet.contains(small0) && spPnwSet.contains(small1)))&&
            						!"wall".equals(smallestTwo.get(0).getLeftobject());
            if (smallCondition) {
                // 跳过最小的1个，保留剩余全部
                middle = sortedCabinets.stream()
                        .skip(1)
                        .collect(Collectors.toList());
                cabinetNewList.addAll(middle);
            } else {
            	cabinetNewList.addAll(sortedCabinets);
            }
    	} else if (secondAlignedLarge) {
    		String large0 = largestTwo.get(0).getName().toUpperCase();
            String large1 = largestTwo.get(1).getName().toUpperCase();
         // 判断大柜子是否满足条件（前提是 secondAlignedLarge 为 true）
            boolean largeCondition = secondAlignedLarge && 
                                     ((bfSet.contains(large1) && spPnbSet.contains(large0)) ||
                                      (wfSet.contains(large1) && spPnwSet.contains(large0)))&&
              						!"wall".equals(smallestTwo.get(1).getRightobject());
            if (largeCondition) {
                // 跳过最小的1个，保留剩余全部
                middle = sortedCabinets.stream()
                		.limit(Math.max(0, sortedCabinets.size() - 1))
                        .collect(Collectors.toList());
                cabinetNewList.addAll(middle);
            } else {
            	cabinetNewList.addAll(sortedCabinets);
            }
    	} else {
    		cabinetNewList.addAll(sortedCabinets);
    	}       
        
     return cabinetNewList;

    }

	public List<Cabinet> setCabinetBF6(List<Cabinet> sortedCabinets, String fileNameFO, String fileNameFN ) {
		
		List<Cabinet> cabinetNewList = new ArrayList<>();
		boolean secondAlignedSmall = false;
		boolean secondAlignedLarge = false;
		
		if (sortedCabinets.size() < 2)  {
			return sortedCabinets;
		} else if (sortedCabinets.size() < 4) {
			List<Cabinet> smallestTwo = sortedCabinets.stream()
				    .limit(2)   // 取前两个
				    .collect(Collectors.toList());
			boolean bothBF3Small = smallestTwo.size() == 2 &&
				    smallestTwo.stream().allMatch(c -> fileNameFO.equalsIgnoreCase(c.getName()));	
		    Cabinet firstS = smallestTwo.get(0);
		    Cabinet secondS = smallestTwo.get(1);
			    secondAlignedSmall = Float.compare(
			    		secondS.getStartposition(),
			    		firstS.getStartposition() + firstS.getWidth()
		    ) == 0;   // 最小两个cabinet连续

			if (secondAlignedSmall ) {
				List<Cabinet> cabinetNewListT = new ArrayList<>();
				if (bothBF3Small && firstS.getType().equals(secondS.getType())) {
					// 合并
			    	Cabinet cabinetS1 = smallestTwo.get(0);
			    	Cabinet cabinetS2 = smallestTwo.get(1);
			    	Cabinet newCabinetS = new Cabinet(cabinetS1);
			    	newCabinetS.setWidth(cabinetS1.getWidth()+cabinetS2.getWidth());
			    	newCabinetS.setName(fileNameFN);
			    	newCabinetS.setRightobject(cabinetS2.getRightobject());
			    	cabinetNewListT.add(newCabinetS); 
			    	
			        List<Cabinet> middle = sortedCabinets.stream()
			    	    .skip(2) // 跳过最小的两个
			    	    .collect(Collectors.toList());
			        cabinetNewListT.addAll(middle);
				} else {
					cabinetNewListT.addAll(sortedCabinets); 
				}
		    	
		    	cabinetNewList = delCabinetFiller( cabinetNewListT, smallestTwo, null, secondAlignedSmall, false);
			} else {
				List<Cabinet> cabinetNewListT = new ArrayList<>();
				List<Cabinet> largestTwo = sortedCabinets.stream()
					    .skip(Math.max(0, sortedCabinets.size() - 2)) // 跳过前面，保留最后两个
					    .collect(Collectors.toList());
				boolean bothBF3Large = largestTwo.size() == 2 &&
						largestTwo.stream().allMatch(c -> fileNameFO.equalsIgnoreCase(c.getName()));			
				    Cabinet firstL = largestTwo.get(0);
				    Cabinet secondL = largestTwo.get(1);
			
				    secondAlignedLarge = Float.compare(
				    		secondL.getStartposition(),
				        firstL.getStartposition() + firstL.getWidth()
				    ) == 0;
				if ( secondAlignedLarge ) {
					if (bothBF3Large&&firstL.getType().equals(secondL.getType())) {
						List<Cabinet> middle = sortedCabinets.stream()
								        	    .limit(Math.max(0, sortedCabinets.size() - 2)) // 保留 size-4 个（去掉最大的两个）
								        	    .collect(Collectors.toList());
				    	cabinetNewListT.addAll(middle);
				        	
				    	Cabinet cabinetL1 = largestTwo.get(0);
				    	Cabinet cabinetL2 = largestTwo.get(1);
				    	Cabinet newCabinetL = new Cabinet(cabinetL1);
				    	newCabinetL.setWidth(cabinetL1.getWidth()+cabinetL2.getWidth());
				    	newCabinetL.setName(fileNameFN);
				    	newCabinetL.setRightobject(cabinetL2.getRightobject());
				    	cabinetNewListT.add(newCabinetL); 
					} else {
						cabinetNewListT.addAll(sortedCabinets); 
					}
			    	cabinetNewList = delCabinetFiller( cabinetNewListT, null, largestTwo, false, secondAlignedLarge);	
			    } else {
			    	cabinetNewList.addAll(sortedCabinets);
			    }
			}
			
		} else {
			List<Cabinet> cabinetNewListT = new ArrayList<>();
			List<Cabinet> smallestTwo = sortedCabinets.stream()
				    .limit(2)   // 取前两个
				    .collect(Collectors.toList());
			boolean bothBF3Small = smallestTwo.size() == 2 &&
				    smallestTwo.stream().allMatch(c -> fileNameFO.equalsIgnoreCase(c.getName()));	
			
			List<Cabinet> largestTwo = sortedCabinets.stream()
				    .skip(Math.max(0, sortedCabinets.size() - 2)) // 跳过前面，保留最后两个
				    .collect(Collectors.toList());
		    Cabinet firstS = smallestTwo.get(0);
		    Cabinet secondS = smallestTwo.get(1);
	
		    secondAlignedSmall = Float.compare(
		    		secondS.getStartposition(),
		        firstS.getStartposition() + firstS.getWidth()
		    ) == 0;   // 最小两个cabinet连续

			
			boolean bothBF3Large = largestTwo.size() == 2 &&
					largestTwo.stream().allMatch(c -> fileNameFO.equalsIgnoreCase(c.getName()));			
			Cabinet firstL = largestTwo.get(0);
		    Cabinet secondL = largestTwo.get(1);
	
		    secondAlignedLarge = Float.compare(
		    		secondL.getStartposition(),
		    		firstL.getStartposition() + firstL.getWidth()
		    ) == 0;

		    if ( bothBF3Small && bothBF3Large) {
		    	if (secondAlignedSmall && secondAlignedLarge && 
			    		firstS.getType().equals(secondS.getType()) && firstL.getType().equals(secondL.getType())) {
		    		// 合并
			    	Cabinet cabinetS1 = smallestTwo.get(0);
			    	Cabinet cabinetS2 = smallestTwo.get(1);
			    	Cabinet newCabinetS = new Cabinet(cabinetS1);
			    	newCabinetS.setWidth(cabinetS1.getWidth()+cabinetS2.getWidth());
			    	newCabinetS.setName(fileNameFN);
			    	newCabinetS.setRightobject(cabinetS2.getRightobject());
			    	cabinetNewListT.add(newCabinetS); 
			    	
			        List<Cabinet> middle = sortedCabinets.stream()
			    	    .skip(2) // 跳过最小的两个
			    	    .limit(Math.max(0, sortedCabinets.size() - 4)) // 保留 size-4 个（去掉最大的两个）
			    	    .collect(Collectors.toList());
			        cabinetNewListT.addAll(middle);
			    	
			    	Cabinet cabinetL1 = largestTwo.get(0);
			    	Cabinet cabinetL2 = largestTwo.get(1);
			    	Cabinet newCabinetL = new Cabinet(cabinetL1);
			    	newCabinetL.setWidth(cabinetL1.getWidth()+cabinetL2.getWidth());
			    	newCabinetL.setName(fileNameFN);
			    	newCabinetL.setRightobject(cabinetL2.getRightobject());
			    	cabinetNewListT.add(newCabinetL); 
		    	} else {
		    		cabinetNewListT.addAll(sortedCabinets); 
		    	}
		    	
		    	cabinetNewList = delCabinetFiller( cabinetNewListT, smallestTwo, largestTwo, secondAlignedSmall, secondAlignedLarge);
		    	
		    } else if (bothBF3Small ) {
		    	if (secondAlignedSmall && 
			    		firstS.getType().equals(secondS.getType()) ) {
		    		// 合并
			    	Cabinet cabinetS1 = smallestTwo.get(0);
			    	Cabinet cabinetS2 = smallestTwo.get(1);
			    	Cabinet newCabinetS = new Cabinet(cabinetS1);
			    	newCabinetS.setWidth(cabinetS1.getWidth()+cabinetS2.getWidth());
			    	newCabinetS.setName(fileNameFN);
			    	newCabinetS.setRightobject(cabinetS2.getRightobject());
			    	cabinetNewListT.add(newCabinetS); 
			    	
			        List<Cabinet> middle = sortedCabinets.stream()
			    	    .skip(2) // 跳过最小的两个
			//    	    .limit(Math.max(0, sortedCabinets.size() - 4)) // 保留 size-4 个（去掉最大的两个）
			    	    .collect(Collectors.toList());
			        cabinetNewListT.addAll(middle);
		    	} else {
		    		cabinetNewListT.addAll(sortedCabinets);
		    	}
		    	
		        cabinetNewList = delCabinetFiller( cabinetNewListT, smallestTwo, null, secondAlignedSmall, false);
		    } else if (bothBF3Large ) {
		    	if (secondAlignedLarge&& firstL.getType().equals(secondL.getType())) {
		    		List<Cabinet> middle = sortedCabinets.stream()
		    				//        	    .skip(2) // 跳过最小的两个
		    				        	    .limit(Math.max(0, sortedCabinets.size() - 2)) // 保留 size-4 个（去掉最大的两个）
		    				        	    .collect(Collectors.toList());
		    				    	cabinetNewListT.addAll(middle);
		    				        	
		    				    	Cabinet cabinetL1 = largestTwo.get(0);
		    				    	Cabinet cabinetL2 = largestTwo.get(1);
		    				    	Cabinet newCabinetL = new Cabinet(cabinetL1);
		    				    	newCabinetL.setWidth(cabinetL1.getWidth()+cabinetL2.getWidth());
		    				    	newCabinetL.setName(fileNameFN);
		    				    	newCabinetL.setRightobject(cabinetL2.getRightobject());
		    				    	cabinetNewListT.add(newCabinetL); 
		    	} else {
		    		cabinetNewListT.addAll(sortedCabinets);
		    	}
		    	
		    	// 如果最小的bf/wf挨着 sp/pnb，则不需要保留 ， 最大同理
		    	cabinetNewList = delCabinetFiller( cabinetNewListT, null, largestTwo, false, secondAlignedLarge);	
		        	
		    } else {
		    	cabinetNewList.addAll(sortedCabinets);
		    }
		}
	    return cabinetNewList;
	}
	
    public ArrayList<List<Cabinet>> adjustCabinetBFWF(ArrayList<List<Cabinet>> multipleCabinetList, String typeFlg ,Kitchen kitchenInfo, 
    		List<Wall> wallInfoList , Island island, List<Cabinetsrule> filteredCabinetsRule, String finalConstruction) {
        
    	ArrayList<List<Cabinet>> multipleCabinetListRet = new ArrayList();
    	String cabinetAdjust ;
    	String cabinetAdjustW ;
    	String cabinetAdjustName ;
    	String cabinetAdjustNameW ;
    	float padCabinetWidth = 0f;
    	String constr ;
    	if ("lower".equals(typeFlg )) {
    		 constr = kitchenInfo.getConstruction2().substring(0, 3);
    	} else {
    		constr = kitchenInfo.getConstruction1().substring(0, 3);
    	}
    		
    	
        if ("BC1".equals(constr)) { // 1000series
        	padCabinetWidth=  Constants.commons.CANBINET_WIDTH_SP;
        	cabinetAdjustName = Constants.commons.CANBINET_NAME_SP2436;
        	cabinetAdjustNameW  = Constants.commons.CANBINET_NAME_SP1239;
        	cabinetAdjust  = Constants.commons.CANBINET_TYPE_SP;
        	cabinetAdjustW  = Constants.commons.CANBINET_TYPE_SP;
        	
        } else {
        	cabinetAdjust =  Constants.commons.CANBINET_TYPE_PNB;
        	padCabinetWidth =  Constants.commons.CANBINET_WIDTH_PNB;
        	cabinetAdjustW  = Constants.commons.CANBINET_TYPE_PNW;
        	cabinetAdjustName = Constants.commons.CANBINET_NAME_PNB36;
        	cabinetAdjustNameW  = Constants.commons.CANBINET_NAME_PNW48;
        }
        String kitchenShape = kitchenInfo.getShapeType();
        
    	for (List<Cabinet> cabinetList : multipleCabinetList) {
    		List<Cabinet> cabinetNewList = new ArrayList<>();

            if (cabinetList == null || cabinetList.isEmpty()) {
                multipleCabinetListRet.add(new ArrayList<>());
                continue;
            }
            
            if ("lower".equals(cabinetList.get(0).getType()) || "upper".equals(cabinetList.get(0).getType())|| "high".equals(cabinetList.get(0).getType())) {
            	
                if ("lower".equals(typeFlg)) {
                	Optional<Cabinet> minOptional = cabinetList.stream()
                    		.filter(cabinet ->  typeFlg.equalsIgnoreCase(cabinet.getType()) || "high".equalsIgnoreCase(cabinet.getType()))
                            .min((c1, c2) -> Float.compare(c1.getStartposition(), c2.getStartposition()));

                    Optional<Cabinet> maxOptional = cabinetList.stream()
                    		.filter(cabinet -> ( typeFlg.equalsIgnoreCase(cabinet.getType())|| "high".equalsIgnoreCase(cabinet.getType())) && 
                    				(!(Constants.commons.CANBINET_TYPE_SP.equals(cabinet.getCabinettype()) && cabinet.getStartposition()  == 0)))
                            .max((c1, c2) -> Float.compare(c1.getStartposition(), c2.getStartposition()));
                    
                    List<Cabinet> leftCabinets = cabinetList.stream()
                    	    .filter(cabinet -> 
                    	        (typeFlg.equalsIgnoreCase(cabinet.getType()) 
                    	         || "high".equalsIgnoreCase(cabinet.getType()))
                    	        && Arrays.asList( "window", "door")
                    	                 .contains(cabinet.getLeftobject()))
                    	    .toList();
                    List<Cabinet> rightCabinets = cabinetList.stream()
                    	    .filter(cabinet -> 
                    	        (typeFlg.equalsIgnoreCase(cabinet.getType()) 
                    	         || "high".equalsIgnoreCase(cabinet.getType()))
                    	        && Arrays.asList( "window", "door")
                    	                 .contains(cabinet.getRightobject()))
                    	    .toList();
                    
                	List<Cabinet> newCabinetList = processAndAddCabinet(cabinetList, minOptional, maxOptional, padCabinetWidth, cabinetAdjust, leftCabinets, rightCabinets, wallInfoList, 0f,0, cabinetAdjustName);
                    multipleCabinetListRet.add(newCabinetList);
                } else {
                	Optional<Cabinet> minOptional = cabinetList.stream()
                    		.filter(cabinet ->  typeFlg.equalsIgnoreCase(cabinet.getType()) )
                            .min((c1, c2) -> Float.compare(c1.getStartposition(), c2.getStartposition()));

                    Optional<Cabinet> maxOptional = cabinetList.stream()
                    		.filter(cabinet ->  typeFlg.equalsIgnoreCase(cabinet.getType()))
                            .max((c1, c2) -> Float.compare(c1.getStartposition(), c2.getStartposition()));
                    List<Cabinet> leftCabinets = cabinetList.stream()
                    	    .filter(cabinet -> 
                    	        (typeFlg.equalsIgnoreCase(cabinet.getType()) )
                    	        && Arrays.asList( "window", "door")
                    	                 .contains(cabinet.getLeftobject()))
                    	    .toList();
                    List<Cabinet> rightCabinets = cabinetList.stream()
                    	    .filter(cabinet -> 
                    	    (typeFlg.equalsIgnoreCase(cabinet.getType()) )
                    	        && Arrays.asList( "window", "door")
                    	                 .contains(cabinet.getRightobject()))
                    	    .toList();
                	List<Cabinet> newCabinetList = processAndAddCabinet(cabinetList, minOptional, maxOptional, padCabinetWidth, cabinetAdjustW, leftCabinets, rightCabinets, wallInfoList, 0f,0, cabinetAdjustNameW);
                    multipleCabinetListRet.add(newCabinetList);
                }
                
            } else if ("islandiner".equals(cabinetList.get(0).getType()) || "islandouter".equals(cabinetList.get(0).getType())|| "peninsulainer".equals(cabinetList.get(0).getType())) {
            	
            	List<Cabinet> islandFilterCabinetList = new ArrayList(); 
            	Integer peninisulaFlag = 0;
            	
            	if (Constants.commons.ISLAND_TYPE_ISLAND.equals(island.getIslandKind() )) {
            		
            		
            		List<Cabinet> sortedCabinetWithFillers = cabinetList.stream()
            				.filter(cabinet -> "islandiner".equalsIgnoreCase(cabinet.getType()))
            				.sorted(Comparator.comparing(Cabinet::getStartposition))
                		    .collect(Collectors.toList());            	
                	
                		if (!sortedCabinetWithFillers.isEmpty()) {
                    		if (sortedCabinetWithFillers.size() == 1 ) {
                    			islandFilterCabinetList.addAll(cabinetList);
                    		} else if (sortedCabinetWithFillers.size() == 2 ) {
                    			if (Constants.commons.CANBINET_NAME_FILLER.equals(sortedCabinetWithFillers.get(0).getCabinettype())) {
                    				//　除去CANBINET_NAME_FILLER
                    				islandFilterCabinetList.add(sortedCabinetWithFillers.get(1));
                    			} else if  (Constants.commons.CANBINET_NAME_FILLER.equals(sortedCabinetWithFillers.get(1).getCabinettype())) {
                    				//　除去CANBINET_NAME_FILLER
                    				islandFilterCabinetList.add(sortedCabinetWithFillers.get(0));
                    			} else {
                    				islandFilterCabinetList.addAll(cabinetList);
                    			}
                    		} else  {
                    			List<Cabinet> cabinetWithNoFillers =  new ArrayList<>();                    			
                    			cabinetWithNoFillers = sortedCabinetWithFillers.stream()
                    				    // 1. 跳过第一个元素 (索引为 0)
                    				    .skip(1) 
                    				    // 2. 限制数量为 (总大小 - 2)。
                    				    //    - 总大小 - 1 是跳过第一个元素后剩下的数量。
                    				    //    - 再减去 1，就是不包含最后一个元素。
                    				    .limit(sortedCabinetWithFillers.size() - 2)
                    				    // 3. 将结果收集到一个新的列表中
                    				    .collect(Collectors.toList());
                    			if (!Constants.commons.CANBINET_NAME_FILLER.equals(sortedCabinetWithFillers.get(0).getCabinettype())) {
                    				//　除去CANBINET_NAME_FILLER
                    				cabinetWithNoFillers.add(sortedCabinetWithFillers.get(0));
                    			} 
                    			if  (!Constants.commons.CANBINET_NAME_FILLER.equals(sortedCabinetWithFillers.get(sortedCabinetWithFillers.size() - 1).getCabinettype())) {
                    				//　除去CANBINET_NAME_FILLER
                    				cabinetWithNoFillers.add(sortedCabinetWithFillers.get(sortedCabinetWithFillers.size() - 1));
                    			} 
                    			islandFilterCabinetList.addAll(cabinetWithNoFillers);
                    		}
                    	}else {
                    		islandFilterCabinetList.addAll(cabinetList);
                    	}
            	} else if (Constants.commons.ISLAND_TYPE_PENINISULA.equals(island.getIslandKind() )) {
            		List<Cabinet> sortedCabinetWithFillers = cabinetList.stream()
            				.filter(cabinet -> "islandiner".equalsIgnoreCase(cabinet.getType()))
            				.sorted(Comparator.comparing(Cabinet::getStartposition))
                		    .collect(Collectors.toList()); 
            		
            		if (!sortedCabinetWithFillers.isEmpty()) {
                		if (sortedCabinetWithFillers.size() == 1 ) {
                			islandFilterCabinetList.addAll(cabinetList);
                			peninisulaFlag = sortedCabinetWithFillers.get(0).getPeninsulainercorner() != null ? sortedCabinetWithFillers.get(0).getPeninsulainercorner() : 0;
                		} else if (sortedCabinetWithFillers.size() == 2 ) {
                			if (sortedCabinetWithFillers.get(0).getPeninsulainercorner() !=null && sortedCabinetWithFillers.get(0).getPeninsulainercorner() !=0) {
                				peninisulaFlag = sortedCabinetWithFillers.get(0).getPeninsulainercorner() != null ? sortedCabinetWithFillers.get(0).getPeninsulainercorner() : 0;
                			} else {
                				peninisulaFlag = sortedCabinetWithFillers.get(1).getPeninsulainercorner() != null ? sortedCabinetWithFillers.get(1).getPeninsulainercorner() : 0;
                			}
                			if (Constants.commons.CANBINET_NAME_FILLER.equals(sortedCabinetWithFillers.get(0).getCabinettype())
                					&& sortedCabinetWithFillers.get(0).getPeninsulainercorner() !=null &&
                					sortedCabinetWithFillers.get(0).getPeninsulainercorner() !=0) {
                				
                				//　除去CANBINET_NAME_FILLER
                				islandFilterCabinetList.add(sortedCabinetWithFillers.get(1));
                			} else if  (Constants.commons.CANBINET_NAME_FILLER.equals(sortedCabinetWithFillers.get(1).getCabinettype())
                					&& sortedCabinetWithFillers.get(1).getPeninsulainercorner() !=null &&
                					sortedCabinetWithFillers.get(1).getPeninsulainercorner()!=0) {
                				
                				//　除去CANBINET_NAME_FILLER
                				islandFilterCabinetList.add(sortedCabinetWithFillers.get(0));
                			} else {
                				islandFilterCabinetList.addAll(cabinetList);
                			}
                		} else  {
                			List<Cabinet> cabinetWithNoFillers =  new ArrayList<>();                    			
                			cabinetWithNoFillers = sortedCabinetWithFillers.stream()
                				    // 1. 跳过第一个元素 (索引为 0)
                				    .skip(1) 
                				    // 2. 限制数量为 (总大小 - 2)。
                				    //    - 总大小 - 1 是跳过第一个元素后剩下的数量。
                				    //    - 再减去 1，就是不包含最后一个元素。
                				    .limit(sortedCabinetWithFillers.size() - 2)
                				    // 3. 将结果收集到一个新的列表中
                				    .collect(Collectors.toList());
                			if (sortedCabinetWithFillers.get(0).getPeninsulainercorner() !=null && sortedCabinetWithFillers.get(0).getPeninsulainercorner() !=0) {
                				peninisulaFlag = sortedCabinetWithFillers.get(0).getPeninsulainercorner() != null ? sortedCabinetWithFillers.get(0).getPeninsulainercorner() : 0;
                			} else {
                				peninisulaFlag = sortedCabinetWithFillers.get(sortedCabinetWithFillers.size() - 1).getPeninsulainercorner() != null ? sortedCabinetWithFillers.get(sortedCabinetWithFillers.size() - 1).getPeninsulainercorner() : 0;
                			}
                			if (!Constants.commons.CANBINET_NAME_FILLER.equals(sortedCabinetWithFillers.get(0).getCabinettype())) {
                				//　除去CANBINET_NAME_FILLER
                				cabinetWithNoFillers.add(sortedCabinetWithFillers.get(0));
                			} else {
                				if (sortedCabinetWithFillers.get(0).getPeninsulainercorner()!=null &&
                						sortedCabinetWithFillers.get(0).getPeninsulainercorner()!=0) {
                					
                					cabinetWithNoFillers.add(sortedCabinetWithFillers.get(0));
                				}
                			}
                			if  (!Constants.commons.CANBINET_NAME_FILLER.equals(sortedCabinetWithFillers.get(sortedCabinetWithFillers.size() - 1).getCabinettype())
                					) {
                				//　除去CANBINET_NAME_FILLER
                				cabinetWithNoFillers.add(sortedCabinetWithFillers.get(sortedCabinetWithFillers.size() - 1));
                			} else {
                				if (sortedCabinetWithFillers.get(sortedCabinetWithFillers.size() - 1).getPeninsulainercorner() !=null &&
                						sortedCabinetWithFillers.get(sortedCabinetWithFillers.size() - 1).getPeninsulainercorner()!=0) {
                					
                					cabinetWithNoFillers.add(sortedCabinetWithFillers.get(sortedCabinetWithFillers.size() - 1));
                				}
                			}
                			islandFilterCabinetList.addAll(cabinetWithNoFillers);
                		}
                	} else {
                		islandFilterCabinetList.addAll(cabinetList);
                	}
            	} else {
            		islandFilterCabinetList.addAll(cabinetList);
            	}
            	            	
            	List<Cabinet> cabinetIslandiner = islandFilterCabinetList.stream()
                        .filter(cabinet -> "islandiner".equalsIgnoreCase(cabinet.getType())|| "peninsulainer".equals(cabinet.getType()))
                        .sorted(Comparator.comparingDouble(Cabinet::getStartposition))
                        .collect(Collectors.toList());
            	boolean applianceFlg = false;
            	List<Cabinet> applianceIslandiner = cabinetIslandiner.stream()
                .filter(cabinet -> "appliance".equalsIgnoreCase(cabinet.getCabinettype()))
                .collect(Collectors.toList());
            	
            	
            	// 使用Stream的min方法，通过比较器比较startpoint
                Optional<Cabinet> minOptional1 = cabinetIslandiner.stream()
                        .min((c1, c2) -> Float.compare(c1.getStartposition(), c2.getStartposition()));
                // 使用Stream的max方法，通过比较器比较startpoint
                Optional<Cabinet> maxOptional1 = cabinetIslandiner.stream()
                        .max((c1, c2) -> Float.compare(c1.getStartposition(), c2.getStartposition()));          
               
                Cabinet cabinetOut = cabinetList.stream()
                	    .filter(cabinet -> 
                	        cabinet.getCabinettype() != null &&
                	        Constants.commons.CANBINET_ISLANDOUTTBD.equals(cabinet.getCabinettype())
                	    )
                	    .findFirst()
                	    .orElse(null);
                
                List<Cabinet> cabinetIslandouter = getCabinetFromRuleIsland(island.getIslandKind() , cabinetOut, filteredCabinetsRule, 
                		cabinetIslandiner, finalConstruction, Constants.commons.CABINET_MIN_WIDTH, peninisulaFlag);
                
                if (minOptional1.isPresent() && maxOptional1.isPresent()) {
                	
                	 if (applianceFlg) {
//                		minOptional1.ifPresent(cabinet -> cabinet.setLeftobject("islandinerFiller"));
//                     	maxOptional1.ifPresent(cabinet -> cabinet.setRightobject("islandinerFiller"));
                     } else {
                    	 if (island.getIsWaterfall()) {
                     		minOptional1.ifPresent(cabinet -> cabinet.setLeftobject("islandinerWaterfall"));
                         	maxOptional1.ifPresent(cabinet -> cabinet.setRightobject("islandinerWaterfall"));
                     	} else {
                     		minOptional1.ifPresent(cabinet -> cabinet.setLeftobject("islandiner"));
                         	maxOptional1.ifPresent(cabinet -> cabinet.setRightobject("islandiner"));
                     	}
                     }
                	
                	//1: islandiner
                	 List<Cabinet> newCabinetList = processAndAddCabinet(cabinetIslandiner, minOptional1, maxOptional1, padCabinetWidth, cabinetAdjust, null, null, wallInfoList, 0, 1, cabinetAdjustName);
                     multipleCabinetListRet.add(newCabinetList);
                }
                if (cabinetIslandouter != null ) {
                	Optional<Cabinet> minOptional2 = cabinetIslandouter.stream()
                            .min((c1, c2) -> Float.compare(c1.getStartposition(), c2.getStartposition()));
                     // 使用Stream的max方法，通过比较器比较startpoint
                    Optional<Cabinet> maxOptional2 = cabinetIslandouter.stream()
                            .max((c1, c2) -> Float.compare(c1.getStartposition(), c2.getStartposition()));
                  
                   if (minOptional2.isPresent() && maxOptional2.isPresent()) {
                	   if (applianceFlg) {
                		   minOptional2.ifPresent(cabinet -> cabinet.setLeftobject("islandouterFiller"));
                		   maxOptional2.ifPresent(cabinet -> cabinet.setRightobject("islandouterFiller"));
                        } else {
    	            	   if (island.getIsWaterfall()) {
    	            		   minOptional2.ifPresent(cabinet -> cabinet.setLeftobject("islandouterWaterfall"));
    	                	   maxOptional2.ifPresent(cabinet -> cabinet.setRightobject("islandouterWaterfall"));
    	            	   } else {
    	            		   minOptional2.ifPresent(cabinet -> cabinet.setLeftobject("islandouter"));
    	                	   maxOptional2.ifPresent(cabinet -> cabinet.setRightobject("islandouter"));
    	            	   }
                        }
                	 //2: islandouter
    	               List<Cabinet> newCabinetList = processAndAddCabinet(cabinetIslandouter, minOptional2, maxOptional2, padCabinetWidth, cabinetAdjust, null, null, wallInfoList, 0, 1, cabinetAdjustName);
    	               multipleCabinetListRet.add(newCabinetList);
                   }	
                }
                
            } else {
            	multipleCabinetListRet.add(cabinetList);
            }     
        }
    	
    	return multipleCabinetListRet;
    }

    
    public ArrayList<List<Cabinet>> ajustingBSR(ArrayList<List<Cabinet>> multipleCabinetList) {
        
    	ArrayList<List<Cabinet>> multipleCabinetListRet = new ArrayList();
    	Cabinet prev = null;
    	Cabinet next = null;
    	Cabinet rangeCabinet = null;
    	for (List<Cabinet> cabinetList : multipleCabinetList) {

            if (cabinetList == null || cabinetList.isEmpty()) {
                continue;
            }
            Boolean rangeFlg = false;
           
            for (int i = 0; i < cabinetList.size(); i++) {
                Cabinet current = cabinetList.get(i);
                if ("Range".equalsIgnoreCase(current.getName())) {
                	rangeCabinet = current;
                    break; // 找到第一个 Range 就停
                }
            }
            if (rangeCabinet != null) {
            	double rangeStart = rangeCabinet.getStartposition(); // 假设返回数值类型
            	Cabinet leftNeighbor = null;   // startposition < rangeStart，且差值最小
                Cabinet rightNeighbor = null;  // startposition > rangeStart，且差值最小
                double minLeftDiff = Double.POSITIVE_INFINITY;
                double minRightDiff = Double.POSITIVE_INFINITY;

                for (Cabinet c : cabinetList) {
                    if (c == rangeCabinet) continue; // 排除自己

                    double diff = c.getStartposition() - rangeStart;
                    if (diff > 0) { // 在右侧
                        if (diff < minRightDiff) {
                            minRightDiff = diff;
                            rightNeighbor = c;
                        }
                    } else if (diff < 0) { // 在左侧
                        double abs = -diff;
                        if (abs < minLeftDiff) {
                            minLeftDiff = abs;
                            leftNeighbor = c;
                        }
                    }
                    // diff == 0（与 rangeStart 相同）当前忽略，如需特殊处理可在这里加逻辑
                }

                prev = leftNeighbor;
                next = rightNeighbor;
                break;
            }
            
    	}
            
        // 找到prev/Next 更新    
    	Cabinet gCabinet = null;
    	Boolean prevFlag = false;
		if (prev !=null && prev.getWidth() >= 9f && "tbd".equals(prev.getCabinettype())) {
			// 如果中间隔着门则不行
			if (prev.getStartposition() + prev.getWidth() == rangeCabinet.getStartposition()) {
				gCabinet = prev;
				prevFlag = true;
			}
		
		} else if (next !=null && next.getWidth() >= 9f && "tbd".equals(next.getCabinettype())) {
			if (rangeCabinet.getStartposition() + rangeCabinet.getWidth() == next.getStartposition()) {
				gCabinet = next;
			}			
		} else if (prev !=null && prev.getWidth() >= 25.5f && (Constants.commons.CANBINET_TBDWPS.equals(prev.getCabinettype()) || Constants.commons.CANBINET_TBDWPR.equals(prev.getCabinettype()))) {
			// 如果中间隔着门则不行
			if (prev.getStartposition() + prev.getWidth() == rangeCabinet.getStartposition()) {
				gCabinet = prev;
				prevFlag = true;
			}
		} else if (next !=null && next.getWidth() >= 25.5f && Constants.commons.CANBINET_TBDWPE.equals(next.getCabinettype())) {
			// 如果中间隔着门则不行
			if (rangeCabinet.getStartposition() + rangeCabinet.getWidth() == next.getStartposition()) {
				gCabinet = next;
			}		
		} else {
			// 没有合适
		} 
		if (gCabinet == null ) {
			return multipleCabinetList;
		} else 
		// 更新BSR
    	for (List<Cabinet> cabinetList : multipleCabinetList) {
    		List<Cabinet> cabinetNewList = new ArrayList<>();
    		
            if (cabinetList == null || cabinetList.isEmpty()) {
                multipleCabinetListRet.add(new ArrayList<>());
                continue;
            }    
            // 判断TBD里面挨着Range的cabinet，宽度如果是>12, 放置BSR12，小于12大于9放置BSR09
            for (int i =0; i< cabinetList.size(); i++) {
            	Cabinet cabinetT = cabinetList.get(i);
                if (gCabinet !=null && Objects.equals(gCabinet.getWallid(), cabinetT.getWallid()) && 
                		Objects.equals(gCabinet.getWidth(), cabinetT.getWidth()) && 
                		Objects.equals(gCabinet.getStartposition(), cabinetT.getStartposition())) {
                	float length = 0f;   
                	String BSRName = null; 
                	if (cabinetT.getWidth() >=12) {
            			length= 12f;
            			BSRName = "BSR12";
            		} else if (cabinetT.getWidth() >=9) {
            			length= 9f;
            			BSRName = "BSR09";
            		} else {
            			//
            			length= 0f;
            		}
                	if (length == 0f) {
            			cabinetNewList.add(cabinetT);      
            		} else {
            			Cabinet newCabinet1 = new Cabinet(cabinetT);
                		newCabinet1.setWidth(length);
                		newCabinet1.setCabinettype("BSR");
                		newCabinet1.setType(Constants.commons.CANBINET_TYPE_LOWER);
                		newCabinet1.setName(BSRName);
                		newCabinet1.setHeight(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT);
                		if (prevFlag) {
                			newCabinet1.setStartposition(cabinetT.getStartposition() + cabinetT.getWidth()-length);
                			newCabinet1.setLeftobject("");
                		} else {
                			newCabinet1.setRightobject("");
                		}
                		cabinetNewList.add(newCabinet1); 
                		
                		Cabinet newCabinet2 = new Cabinet(cabinetT);
                		newCabinet2.setWidth(cabinetT.getWidth()-length);
                		if (!prevFlag) {
                			newCabinet2.setStartposition(cabinetT.getStartposition() + length);
                			newCabinet2.setLeftobject("");
                		} else {
                			newCabinet2.setRightobject("");
                		}
                        cabinetNewList.add(newCabinet2);      
            		}

                } else {
                	cabinetNewList.add(cabinetT);      
                }
            }
            multipleCabinetListRet.add(cabinetNewList);
    	}            
    	
    	return multipleCabinetListRet;
    }
    
    public class CabinetResult {
        private Cabinet cabinet;
        private Integer cabinetSBFlag;

        public CabinetResult(Cabinet cabinet, Integer cabinetSBFlag) {
            this.cabinet = cabinet;
            this.cabinetSBFlag = cabinetSBFlag;
        }

        public Cabinet getCabinet() {
            return cabinet;
        }

        public Integer getCabinetSBFlag() {
            return cabinetSBFlag;
        }
    }
  
    
    public CabinetResult designCabinetNextTOWall(Kitchen kitchenInfo, Wall wall, float endPosition, Integer cabinetSBFlag, float finalEndPosition,float initPosition, Integer refPosition, 
    		float highCabinetHeight, String leftObject, String rightObject,  int pantryRequired,  boolean  windowsCheckS, 
    		boolean windowsCheckR, boolean windowsCheckE , float hoodStartPosition, float hoodWidth) {
        //List<Cabinet> cabinetobjectList = new ArrayList<>();
        logger.info("designCabinetNextTOWall kitchenInfo:", kitchenInfo.getId());
        String cabinetTbdName = Constants.commons.CANBINET_TBD;
        float cabinetTbdHeight = Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
        String cabinetTbdType = Constants.commons.CANBINET_TYPE_LOWER;
        if (endPosition  >= Constants.commons.CABINET_MIN_WIDTH  ) {
            if (cabinetSBFlag == 3 && endPosition > sbFavoriteWidth) {
                cabinetTbdName = Constants.commons.CANBINET_TBD;
            } else if (cabinetSBFlag == 1 && endPosition > sbFavoriteWidth) {
                cabinetTbdName =  Constants.commons.CANBINET_TBD_SBBACK;
                cabinetSBFlag = 2;
            } else {
            	float tmpw = endPosition;
               	float tmpp = initPosition;
               	boolean flg = !(tmpp + tmpw <= hoodStartPosition || hoodStartPosition + hoodWidth <= tmpp);
               	float padCheck = 0f;
         	   if ("wall".equals(leftObject) || "wall".equals(rightObject)) {
         		   padCheck = Constants.commons.WP_WIDTH_PAD_MIN;
         	   }
            	if (pantryRequired == 1 && (finalEndPosition-initPosition >= padCheck + Constants.commons.WP_WIDTH_MIN)) {
                	if (initPosition == 0 && 
                			!windowsCheckS && !wall.getLeftCorner()) {
                		if (!flg) {
                			cabinetTbdName = Constants.commons.CANBINET_TBDWPS;
                    		cabinetTbdHeight = highCabinetHeight;
                    		cabinetTbdType = Constants.commons.CANBINET_TYPE_HIGH;
                		} else {
                			cabinetTbdName = Constants.commons.CANBINET_TBD;
                		}
                		
                	} else {
                		if (refPosition == 2 && 
                				!windowsCheckR ) {
                			if (!flg) {
	                			cabinetTbdName = Constants.commons.CANBINET_TBDWPR;
	                			cabinetTbdHeight = highCabinetHeight;
	                			cabinetTbdType = Constants.commons.CANBINET_TYPE_HIGH;
                			} else {
                    			cabinetTbdName = Constants.commons.CANBINET_TBD;
                    		}
                    		
                		} else if (!wall.getRightCorner()&& 
                				!windowsCheckE) {
                			if (!flg) {
	                			cabinetTbdName = Constants.commons.CANBINET_TBDWPE;
	                			cabinetTbdHeight = highCabinetHeight;
	                			cabinetTbdType = Constants.commons.CANBINET_TYPE_HIGH;
                			} else {
                    			cabinetTbdName = Constants.commons.CANBINET_TBD;
                    		}
                		} else {
                			cabinetTbdName = Constants.commons.CANBINET_TBD;
                			
                		}
                		
                	}
                    pantryRequired = 2;
                	
                // if ((finalEndPosition-initPosition >= 15 + Constants.commons.WP_WIDTH_MIN) && wall.getIsUpperCabinetPlaced()) {
                //     // 可以方式WP高柜 
                //     cabinetTbdName = Constants.commons.CANBINET_TBDWPE;
                //     cabinetTbdHeight = highCabinetHeight;
                 } else {
                    cabinetTbdName = Constants.commons.CANBINET_TBD;
                 }
            }
            Cabinet cabinetTBD = new Cabinet(cabinetTbdHeight,0f,cabinetTbdName,
                    endPosition,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                    cabinetTbdType, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, leftObject,rightObject, wall.getAngle());
            return new CabinetResult(cabinetTBD, cabinetSBFlag);
//            cabinetobjectList.add(cabinetTBD);
        } else {
            // 不足一个柜子宽度
            if (endPosition>6 && "wall".equals(rightObject)) {
                // 电器位置安排有错误,返回请调整电器位置TODO
            	Cabinet cabinetTBD = new Cabinet(cabinetTbdHeight,0f,cabinetTbdName,
                        endPosition,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                        cabinetTbdType, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, leftObject,rightObject, wall.getAngle());
                return new CabinetResult(cabinetTBD, cabinetSBFlag);
            } else {
                if (refPosition ==1 ) {
                    // 最靠右电器为冰箱这样的话，放置WF
                	if ("wall".equals(rightObject)) {
                		if (endPosition>3 ) {
                            Cabinet cabinetTBD = new Cabinet(highCabinetHeight,0f,"WF06",
                                    endPosition,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),"WF",
                                    Constants.commons.CANBINET_TYPE_HIGH, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, wall.getAngle(),"","");
                            return new CabinetResult(cabinetTBD, cabinetSBFlag);
                        } else {
                            Cabinet cabinetTBD = new Cabinet(highCabinetHeight,0f,"WF03",
                                    endPosition,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),"WF",
                                    Constants.commons.CANBINET_TYPE_HIGH, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, wall.getAngle(),"","");
                            return new CabinetResult(cabinetTBD, cabinetSBFlag);
                        }
                	}                 

                } else {
                	if ("wall".equals(rightObject) ) {
                		Cabinet cabinetTBD = new Cabinet(cabinetTbdHeight,0f,cabinetTbdName,
                                endPosition,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                                cabinetTbdType, initPosition,Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, leftObject,rightObject, wall.getAngle());
                        return new CabinetResult(cabinetTBD, cabinetSBFlag);
                	} else {
                		// 右侧开放同时宽度小于9， 放不下任何柜子
                	}
                	
                }
            }
        }
        return null;
    }

    public ArrayList<List<Cabinet>> designCabinetConnectPeninsula(Kitchen kitchenInfo,List<Wall> wallInfoList, ArrayList<List<Cabinet>> multipleCabinetList, Island island) {
        logger.info("designCabinetConnectPeninsula kitchenInfo:", kitchenInfo.getId());
        ArrayList<List<Cabinet>> wallCabinetNewList = new ArrayList<>(multipleCabinetList);
        // 取得衔接的所在墙
        List<PeninisulaConnection> connectPeninisula = null;
        
        connectPeninisula = peninisulaConnectionRepository.findByKitchenIdAndIsLowerCabinetConnected(kitchenInfo.getId(), true);
       
        		
        // 判断墙两边的宽度
        // Assuming connectWall is a list of WallConnection objects
        for (PeninisulaConnection conPeninisula : connectPeninisula) {
            // Get the current wallid and the adjacent wall id
            int wallid = conPeninisula.getWall().getId();
            int adjacentJIslandid = conPeninisula.getAdjacentPeninisulaId().getId();
            Cabinet mixStartPositionCabinet1 = null;
            Cabinet mixStartPositionCabinet2 = null;
            // 根据厨房类型
            if ("I".equals(kitchenInfo.getShapeType())) {
            	mixStartPositionCabinet1 = getMaxPositionCabpeninsula(wallCabinetNewList, adjacentJIslandid);
            	mixStartPositionCabinet1.setPeninsulainercorner(1);
            	mixStartPositionCabinet2 = getMinPositionCab(wallCabinetNewList, wallid);
            } else if ("II".equals(kitchenInfo.getShapeType())) {
            	if ("one".equals(island.getPeninsulaisadjacentto())) {
            		mixStartPositionCabinet1 = getMaxPositionCabpeninsula(wallCabinetNewList, adjacentJIslandid);
            		mixStartPositionCabinet1.setPeninsulainercorner(1);
                	mixStartPositionCabinet2 = getMinPositionCab(wallCabinetNewList, wallid);
            	} else if ("two".equals(island.getPeninsulaisadjacentto())) {
            		mixStartPositionCabinet1 = getMaxPositionCabpeninsula(wallCabinetNewList, adjacentJIslandid);
            		mixStartPositionCabinet1.setPeninsulainercorner(1);
                	mixStartPositionCabinet2 = getMinPositionCab(wallCabinetNewList, wallid);
            	}
            } else if ("L".equals(kitchenInfo.getShapeType())) {
            	if ("one".equals(island.getPeninsulaisadjacentto())) {
            		mixStartPositionCabinet1 = getMaxPositionCabpeninsula(wallCabinetNewList, adjacentJIslandid);
            		mixStartPositionCabinet1.setPeninsulainercorner(1);
                	mixStartPositionCabinet2 = getMinPositionCab(wallCabinetNewList, wallid);
            	} else if ("two".equals(island.getPeninsulaisadjacentto())) {
            		mixStartPositionCabinet1 = getMaxPositionCab(wallCabinetNewList, wallid, conPeninisula.getWall().getWidth());
            		mixStartPositionCabinet2 = getMinPositionCabpeninsula(wallCabinetNewList, adjacentJIslandid);
            		mixStartPositionCabinet2.setPeninsulainercorner(2);
            	}
            } else if ("U".equals(kitchenInfo.getShapeType())) {
            	if ("one".equals(island.getPeninsulaisadjacentto())) {
            		mixStartPositionCabinet1 = getMaxPositionCabpeninsula(wallCabinetNewList, adjacentJIslandid);
            		mixStartPositionCabinet1.setPeninsulainercorner(1);
                	mixStartPositionCabinet2 = getMinPositionCab(wallCabinetNewList, wallid);
            	} else if ("three".equals(island.getPeninsulaisadjacentto())) {
            		mixStartPositionCabinet1 = getMaxPositionCab(wallCabinetNewList, wallid, conPeninisula.getWall().getWidth());
            		mixStartPositionCabinet2 = getMinPositionCabpeninsula(wallCabinetNewList, adjacentJIslandid);
            		mixStartPositionCabinet2.setPeninsulainercorner(2);
            	}
            	
            }
            // Initialize variables to store the desired cabinets
            if (mixStartPositionCabinet1 == null && mixStartPositionCabinet2 == null) {
            	//
            } else {
            	 String cornerCab = getCornerCab(wallCabinetNewList, mixStartPositionCabinet1, mixStartPositionCabinet2, "lower");
                 wallCabinetNewList = regenerateCornerCab(wallCabinetNewList, mixStartPositionCabinet1, mixStartPositionCabinet2, cornerCab, "lower");
            }
           
        }
        return wallCabinetNewList;

    }
    
    public ArrayList<List<Cabinet>> designCabinetConnect(Kitchen kitchenInfo,List<Wall> wallInfoList, ArrayList<List<Cabinet>> multipleCabinetList, String cabinetFlag) {
        logger.info("designCabinetConnect kitchenInfo:", kitchenInfo.getId());
        ArrayList<List<Cabinet>> wallCabinetNewList = new ArrayList<>(multipleCabinetList);
        // 取得衔接的所在墙
        List<WallConnection> connectWall = null;
        if ("lower".equals(cabinetFlag)) {
        		connectWall = wallConnectionRepository.findByKitchenIdAndIsLowerCabinetConnected(kitchenInfo.getId(), true);
            
        } else {
        		connectWall = wallConnectionRepository.findByKitchenIdAndIsUpperCabinetConnected(kitchenInfo.getId(), true);
            
        }
        		
        // 判断墙两边的宽度
        // Assuming connectWall is a list of WallConnection objects
        for (WallConnection conWall : connectWall) {
            // Get the current wallid and the adjacent wall id
            int wallid = conWall.getWall().getId();
            int adjacentWallid = conWall.getAdjacentWall().getId();
            // Initialize variables to store the desired cabinets
            Cabinet maxStartPositionCabinet = getMaxPositionCab(wallCabinetNewList, wallid, conWall.getWall().getWidth());
            Cabinet minStartPositionCabinet = getMinPositionCab(wallCabinetNewList, adjacentWallid);
            // 相邻的cabinet设置为true
            if (maxStartPositionCabinet != null ) {
            	maxStartPositionCabinet.setAdjustotherwall(true); // 未到达墙终点
            }
            if (minStartPositionCabinet != null ) {
            	minStartPositionCabinet.setAdjustotherwall(true);// 未到达墙起点
            }
            if (maxStartPositionCabinet == null && minStartPositionCabinet == null) {
            	//
            } else {
	            String cornerCab = getCornerCab(wallCabinetNewList, maxStartPositionCabinet, minStartPositionCabinet, cabinetFlag);
	        	wallCabinetNewList = regenerateCornerCab(wallCabinetNewList, maxStartPositionCabinet, minStartPositionCabinet, cornerCab, cabinetFlag);
            } 
        }
        return wallCabinetNewList;
    }
    public ArrayList<List<Cabinet>> regenerateCornerCab( ArrayList<List<Cabinet>> multipleCabinetList, Cabinet maxStartPositionCabinet , Cabinet minStartPositionCabinet, String cornerCab, String cabinetFlag) {
        // 拆分宽度，选择合适的柜子
        logger.info("regenerateCornerCab ");
        if (maxStartPositionCabinet != null && minStartPositionCabinet ==null) {
        	ArrayList<List<Cabinet>> newMultipleCabinetList = multipleCabinetList.stream()
        			.map(list -> list.stream()
                    		.filter(Objects::nonNull)  // 添加这行来过滤掉 null 值
                            .flatMap(cabinet -> {
                            	
                            	if (cabinet.getWallid() == maxStartPositionCabinet.getWallid() && 
                            		Objects.equals(cabinet.getWallid(), maxStartPositionCabinet.getWallid()) && 
                            		Objects.equals(cabinet.getStartposition(), maxStartPositionCabinet.getStartposition()) ) {
                            		float originalWidth = cabinet.getWidth();
                                    float cabinetWidthPad = originalWidth; // 默认不修改

                                    // 根据类型计算要减去的值
                                    float subtractValue = 0f;
                                    if ("lower".equals(cabinet.getType())) {
                                        subtractValue = 27f;
                                    } else if ("upper".equals(cabinet.getType())) {
                                    	// 即使是upper，相邻的墙也可能是wp/ref
                                        subtractValue = 27f;
                                    } else if ("islandiner".equals(cabinet.getType()) ) {
                                        subtractValue = 27f;
                                    }

                                    // 只有在减完后仍大于 0 才修改宽度
                                    if (originalWidth - subtractValue > 0) {
                                        cabinetWidthPad = originalWidth - subtractValue;
                                        cabinet.setWidth(cabinetWidthPad);
                                        cabinet.setRightobject("adjcorner");
                                        return Stream.of(cabinet);
                                    } else {
                                        // 非法：宽度 ≤ 0，**丢弃该 cabinet**
                                        return Stream.empty(); // 👈 关键：返回空流，相当于过滤掉
                                    }
                            	} else {
                            		return Stream.of(cabinet);
                            	}
                            })
                            .collect(Collectors.toList()))
                    .collect(Collectors.toCollection(ArrayList::new));

        	 return newMultipleCabinetList;
        } else if (maxStartPositionCabinet == null && minStartPositionCabinet !=null ) {
        	ArrayList<List<Cabinet>> newMultipleCabinetList = multipleCabinetList.stream()
        			.map(list -> list.stream()
                    		.filter(Objects::nonNull)  // 添加这行来过滤掉 null 值
                            .flatMap(cabinet -> {
                            	if (Objects.equals(cabinet.getWallid(), minStartPositionCabinet.getWallid()) && 
                            			Objects.equals(cabinet.getStartposition(), minStartPositionCabinet.getStartposition())) {
	                            	float cabinetWidthPad = 27f;
	                            	float cabinetStartPositionPad = 27f;
	                        		if ("lower".equals(cabinet.getType())) {
	                        			cabinetStartPositionPad = cabinet.getStartposition() + 27f;
	                        			cabinetWidthPad = cabinet.getWidth() - 27f;
	                            	} else if ("upper".equals(cabinet.getType())) {
	                            		// 即使是upper，相邻的墙也可能是wp/ref
	                            		cabinetStartPositionPad = cabinet.getStartposition() + 27f;
	                                	cabinetWidthPad = cabinet.getWidth() - 27f;
	                            	} else if ("islandiner".equals(cabinet.getType()) || "peninsulainer".equals(cabinet.getType())) {
	                            		cabinetStartPositionPad = cabinet.getStartposition() + 27f;
	                                	cabinetWidthPad = cabinet.getWidth() - 27f;
	                            	}
	                        		cabinet.setStartposition(cabinetStartPositionPad);
	                        		cabinet.setWidth(cabinetWidthPad);
	                        		cabinet.setLeftobject("adjcorner"); // 另一侧墙是门/窗，所以不能顶到墙
									return Stream.of(cabinet);
                            	} else {
                            		return Stream.of(cabinet);
                            	}
                            })
                            .collect(Collectors.toList()))
                    .collect(Collectors.toCollection(ArrayList::new));

        	 return newMultipleCabinetList;
        } 
        boolean[] otherFlag = {false, false};
        float[] otherWidth = {0, 0};
        // 
        boolean rightObjectHightMin = false;
        boolean leftObjectHightMax = false;
        float widthMin = 0f;
        float widthMax = 0f;
        String[][] otherObject = {{null,null},{null,null}};
        if (maxStartPositionCabinet.getWidth() < 27+9 &&
        		("lower".equals(maxStartPositionCabinet.getType())|| "islandiner".equals(maxStartPositionCabinet.getType()) || "peninsulainer".equals(maxStartPositionCabinet.getType())) || 
        		maxStartPositionCabinet.getWidth() < 15+9 && "upper".equals(maxStartPositionCabinet.getType()) ) {
        	if ("door".equals(maxStartPositionCabinet.getLeftobject()) || "window".equals(maxStartPositionCabinet.getLeftobject())) {
        		otherFlag[0] = true; // 对于corner的短边放不下任何柜子 0： max
            	otherWidth[0] = maxStartPositionCabinet.getWidth();
            	otherObject[0][0] = maxStartPositionCabinet.getLeftobject();
            	otherObject[0][1] = maxStartPositionCabinet.getRightobject();
        	} else if (maxStartPositionCabinet.getWidth() < 15+9 && "upper".equals(maxStartPositionCabinet.getType())) {
        		if ("highcabinet".equals(maxStartPositionCabinet.getLeftobject()) || 
        				Constants.commons.OBJECT_TYPE_APPLIANCE.equals(maxStartPositionCabinet.getLeftobject()) ||
        				Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(maxStartPositionCabinet.getLeftobject()) ||
        				Constants.commons.APPLIANCES_NAME_RANGE.equals(maxStartPositionCabinet.getLeftobject()) ||
        				Constants.commons.APPLIANCES_NAME_HOOD.equals(maxStartPositionCabinet.getLeftobject()) ||
        				Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(maxStartPositionCabinet.getLeftobject())) {  
        			leftObjectHightMax = true;
        			widthMax = maxStartPositionCabinet.getWidth();
        		}
        	} else if (maxStartPositionCabinet.getWidth() < 27+9 && ("islandiner".equals(maxStartPositionCabinet.getType())  || "peninsulainer".equals(maxStartPositionCabinet.getType())|| "lower".equals(maxStartPositionCabinet.getType()))) {
        		if ("highcabinet".equals(maxStartPositionCabinet.getLeftobject()) || 
        				Constants.commons.OBJECT_TYPE_APPLIANCE.equals(maxStartPositionCabinet.getLeftobject()) ||
        				Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(maxStartPositionCabinet.getLeftobject()) ||
        				Constants.commons.APPLIANCES_NAME_RANGE.equals(maxStartPositionCabinet.getLeftobject()) ||
        				Constants.commons.APPLIANCES_NAME_HOOD.equals(maxStartPositionCabinet.getLeftobject()) ||
        				Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(maxStartPositionCabinet.getLeftobject())) {  
        			leftObjectHightMax = true;
        			widthMax = maxStartPositionCabinet.getWidth();
        		}
        	}
        	
        }   
        
        if (minStartPositionCabinet.getWidth() < 27+9 && ("lower".equals(minStartPositionCabinet.getType())|| "islandiner".equals(minStartPositionCabinet.getType()))  || "peninsulainer".equals(minStartPositionCabinet.getType())|| 
        		minStartPositionCabinet.getWidth() < 15+9 && "upper".equals(minStartPositionCabinet.getType()) ) {
        	if ("door".equals(minStartPositionCabinet.getRightobject()) || "window".equals(minStartPositionCabinet.getRightobject())) {
	        	otherFlag[1] = true; // 对于corner的短边放不下任何柜子 1： min
	        	otherWidth[1] = minStartPositionCabinet.getWidth();
	        	otherObject[1][0] = minStartPositionCabinet.getLeftobject();
	        	otherObject[1][1] = minStartPositionCabinet.getRightobject();
        	} else if (minStartPositionCabinet.getWidth() < 15+9 && "upper".equals(minStartPositionCabinet.getType()) ) {
        		if ("highcabinet".equals(minStartPositionCabinet.getRightobject())|| 
        				Constants.commons.OBJECT_TYPE_APPLIANCE.equals(minStartPositionCabinet.getRightobject()) ||
        				Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(minStartPositionCabinet.getRightobject()) ||
        				Constants.commons.APPLIANCES_NAME_RANGE.equals(minStartPositionCabinet.getRightobject()) ||
        				Constants.commons.APPLIANCES_NAME_HOOD.equals(minStartPositionCabinet.getRightobject()) ||
        				Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(minStartPositionCabinet.getRightobject())) {  
        			rightObjectHightMin = true;
        			widthMin = minStartPositionCabinet.getWidth();
        		}
        	} else if (minStartPositionCabinet.getWidth() < 27+9 && ("islandiner".equals(minStartPositionCabinet.getType())  || "peninsulainer".equals(minStartPositionCabinet.getType())|| "lower".equals(minStartPositionCabinet.getType()) )) {
        		if ("highcabinet".equals(minStartPositionCabinet.getRightobject())|| 
        				Constants.commons.OBJECT_TYPE_APPLIANCE.equals(minStartPositionCabinet.getRightobject()) ||
        				Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(minStartPositionCabinet.getRightobject()) ||
        				Constants.commons.APPLIANCES_NAME_RANGE.equals(minStartPositionCabinet.getRightobject()) ||
        				Constants.commons.APPLIANCES_NAME_HOOD.equals(minStartPositionCabinet.getRightobject()) ||
        				Constants.commons.APPLIANCES_NAME_DISHWASHER.equals(minStartPositionCabinet.getRightobject())) {  
        			rightObjectHightMin = true;
        			widthMin = minStartPositionCabinet.getWidth();
        		}
        	}
        }
        boolean rightObjectHightMinF = rightObjectHightMin;
        boolean leftObjectHightMaxF = leftObjectHightMax;
        float widthMinF = widthMin;
        float widthMaxF = widthMax;
        // 生成一个乱数
    	Random random = new Random();
        int numberC = 10000 + random.nextInt(90000);	
        	
        ArrayList<List<Cabinet>> newMultipleCabinetList = multipleCabinetList.stream()
                .map(list -> list.stream()
                		.filter(Objects::nonNull)  // 添加这行来过滤掉 null 值
                        .flatMap(cabinet -> {
                        	
                            if (Objects.equals(cabinet.getWallid(), maxStartPositionCabinet.getWallid()) && 
                            		Objects.equals(cabinet.getStartposition(), maxStartPositionCabinet.getStartposition()) && 
                            		Objects.equals(cabinet.getType(), maxStartPositionCabinet.getType())||
                            		Objects.equals(cabinet.getWallid(), minStartPositionCabinet.getWallid()) && 
                            		Objects.equals(cabinet.getStartposition(), minStartPositionCabinet.getStartposition())&& 
                            		Objects.equals(cabinet.getType(), minStartPositionCabinet.getType())) {
                            if (cornerCab == null) {                            	
                                if (Objects.equals(cabinet.getWallid(), maxStartPositionCabinet.getWallid()) && 
                                		Objects.equals(cabinet.getStartposition(), maxStartPositionCabinet.getStartposition())){
                                    String cabinettype = cabinet.getCabinettype();
                                    String cabinetName = cabinet.getName();
                                    if ("tbdwpe".equals(cabinet.getCabinettype()) || "tbdwps".equals(cabinet.getCabinettype()) || "tbdwpr".equals(cabinet.getCabinettype())) {
//                                        cabinettype = "tbd";
//                                        cabinetName = "tbd";
                                    } else if ("sbfront".equals(cabinet.getCabinettype())) {

                                    }else if ("sbfront".equals(cabinet.getCabinettype())) {

                                    }
                                    if (cabinet.getWidth() <= 24 && ("lower".equals(cabinet.getType())  || "islandiner".equals(cabinet.getType()))  || "peninsulainer".equals(cabinet.getType())) {
                                    	return null;
                                    } else if (cabinet.getWidth() <= 24 && "upper".equals(cabinet.getType()) && rightObjectHightMinF == true ) {
                                    	return null;
                                    }  else if (cabinet.getWidth() <= 15 && "upper".equals(cabinet.getType())  ) {
                                    	return null;
                                    }else {
										if (otherFlag[1]) { // 1：min 不足放下最小的柜子
											if ((otherWidth[1] > 24 && "door".equals(otherObject[1][1])) || (otherWidth[1] > 12 && "window".equals(otherObject[1][1]))) {
				                        		if (otherFlag[0] ) { // 0： max
				                        			return null;
													// 优先minStartPosition保留cabinet
				                        		} else {
													cabinet.setRightobject("corner");  // max侧柜子表示可以放置柜子corner
													return Stream.of(cabinet);	
				                        		}	
											} else {
												float cabinetWidthPad = 27f;
	                                    		if ("lower".equals(cabinet.getType())) {
	                                        		cabinetWidthPad = cabinet.getWidth() - 27f;
	                                        	} else if ("upper".equals(cabinet.getType())) {
	                                            	cabinetWidthPad = cabinet.getWidth() - 15f;
	                                        	} else if ("islandiner".equals(cabinet.getType()) || "peninsulainer".equals(cabinet.getType())) {
	                                            	cabinetWidthPad = cabinet.getWidth() - 27f;
	                                        	}
	                                    		cabinet.setWidth(cabinetWidthPad);
	                                    		cabinet.setRightobject("");
												return Stream.of(cabinet);
											}											
                                    	}
										if (rightObjectHightMinF && widthMaxF <= 24 && ("lower".equals(cabinet.getType()) || "high".equals(cabinet.getType())) ||
												rightObjectHightMinF && widthMaxF <= 15 && "upper".equals(cabinet.getType()) ) {
											float cabinetWidthPad = 27f;
                                    		if ("lower".equals(cabinet.getType()) || "high".equals(cabinet.getType())) {
                                        		cabinetWidthPad = cabinet.getWidth() - 27f;
                                        	} else if ("upper".equals(cabinet.getType())) {
                                            	cabinetWidthPad = cabinet.getWidth() - 15f;
                                        	} else if ("islandiner".equals(cabinet.getType()) || "peninsulainer".equals(cabinet.getType())) {
                                            	cabinetWidthPad = cabinet.getWidth() - 27f;
                                        	}
                                    		cabinet.setWidth(cabinetWidthPad);
                                    		cabinet.setRightobject("");
											return Stream.of(cabinet);
										}
										if (cabinet.getWidth() > 24 && cabinet.getWidth() <=27 && ("lower".equals(cabinet.getType()) || "islandiner".equals(cabinet.getType())) || "peninsulainer".equals(cabinet.getType())) {
											// 直接返回一个BF6
												Cabinet cabinet1 = new Cabinet(cabinet); 	
												cabinet1.setName("BF3");
												cabinet1.setWidth(cabinet1.getWidth() - 24f);
												cabinet1.setCabinettype("BF");
//												cabinet1.setStartposition(cabinet.getStartposition() );
												cabinet1.setCornerKey("BF3"+ maxStartPositionCabinet.getStartposition().toString());
												return Stream.of(cabinet1);	
										} else if (cabinet.getWidth() > 15 && cabinet.getWidth() <=18 && ("upper".equals(cabinet.getType()) )) {
											// 直接返回一个BF6
											Cabinet cabinet1 = new Cabinet(cabinet); 	
											cabinet1.setName("WF03");
											cabinet1.setWidth(cabinet1.getWidth() - 12f);
											cabinet1.setCabinettype("WF");
//											cabinet1.setStartposition(cabinet.getStartposition() );
											cabinet1.setCornerKey("WF03"+ maxStartPositionCabinet.getStartposition().toString());
											return Stream.of(cabinet1);	
										} else if (cabinet.getWidth() > 27 && cabinet.getWidth() <=30 && ("lower".equals(cabinet.getType()) || "islandiner".equals(cabinet.getType())) || "peninsulainer".equals(cabinet.getType())) {
											// 直接返回一个BF6
												Cabinet cabinet1 = new Cabinet(cabinet); 	
												cabinet1.setName("BF6");
												cabinet1.setWidth(cabinet1.getWidth() - 24f);
												cabinet1.setCabinettype("BF");
//												cabinet1.setStartposition(cabinet.getStartposition() );
												cabinet1.setCornerKey("BF3"+ maxStartPositionCabinet.getStartposition().toString());
												return Stream.of(cabinet1);	
										} else if (cabinet.getWidth() > 18 && cabinet.getWidth() <=21 && "upper".equals(cabinet.getType()) ) {
													// 直接返回一个BF6
	                                        	Cabinet cabinet1 = new Cabinet(cabinet); 	
												cabinet1.setName("WF06");
												cabinet1.setWidth(cabinet1.getWidth() - 12f);
												cabinet1.setCabinettype("WF");
//												cabinet1.setStartposition(cabinet.getStartposition() + cabinet.getWidth() - 15f);
												cabinet1.setCornerKey("WF03"+ maxStartPositionCabinet.getStartposition().toString());
												return Stream.of(cabinet1);	
                                        }  else {
											if ("lower".equals(cabinet.getType()) || "islandiner".equals(cabinet.getType())  || "peninsulainer".equals(cabinet.getType())) {
	                                            return creatCornerCab("max", cabinet,"BF3", cabinetName, 3f,
	                                                    cabinet.getStartposition() + cabinet.getWidth() - 27f, cabinet.getWidth() - 27f, cabinet.getStartposition(), "BF", cabinettype,maxStartPositionCabinet.getStartposition().toString());
	                                        } else {
	                                            return creatCornerCab("max", cabinet,"WF03", cabinetName, 3f,
	                                                    cabinet.getStartposition() + cabinet.getWidth() - 15f, cabinet.getWidth() - 15f, cabinet.getStartposition(), "WF", cabinettype,maxStartPositionCabinet.getStartposition().toString());
	                                        }
										}
                                   }

                                } else {
                                    String cabinettype = cabinet.getCabinettype();
                                    String cabinetName = cabinet.getName();
                                    if ("tbdwpe".equals(cabinet.getCabinettype()) || "tbdwps".equals(cabinet.getCabinettype()) || "tbdwpr".equals(cabinet.getCabinettype())) {
//                                        cabinettype = "tbd";
//                                        cabinetName = "tbd";
                                    } else if ("sbfront".equals(cabinet.getCabinettype())) {

                                    } else if ("sbfront".equals(cabinet.getCabinettype())) {

                                    }
                                    if (cabinet.getWidth() <= 24 && ("lower".equals(cabinet.getType())  || "islandiner".equals(cabinet.getType()))  || "peninsulainer".equals(cabinet.getType())) {
                                    	return null;
                                    } else if (cabinet.getWidth() <= 24 && "upper".equals(cabinet.getType()) && leftObjectHightMaxF == true  ) {
                                    	return null;
                                    } else if (cabinet.getWidth() <= 15 && "upper".equals(cabinet.getType()) ) {
                                    	return null;
                                    } else {
                                    	if (otherFlag[0]) { // 0： max 不足放下最小柜子
                                    		if ((otherWidth[0] > 24 && "door".equals(otherObject[0][0])) || (otherWidth[0] > 12 && "window".equals(otherObject[0][0]))) {
            	                        		cabinet.setLeftobject("corner"); // max柜子没有顶到墙
												return Stream.of(cabinet);
											} else {
												float cabinetWidthPad = 27f;
												float cabinetStartAd = cabinet.getStartposition() + 27f;
	                                    		if ("lower".equals(cabinet.getType())) {
	                                        		cabinetWidthPad = cabinet.getWidth() - 27f;
	                                        		cabinetStartAd = cabinet.getStartposition() + 27f;
	                                        	} else if ("upper".equals(cabinet.getType())) {
	                                            	cabinetWidthPad = cabinet.getWidth() - 15f;
	                                            	cabinetStartAd = cabinet.getStartposition() + 15f;
	                                        	} else if ("islandiner".equals(cabinet.getType()) || "peninsulainer".equals(cabinet.getType())) {
	                                            	cabinetWidthPad = cabinet.getWidth() - 27f;
	                                            	cabinetStartAd = cabinet.getStartposition() + 27f;
	                                        	}
	                                    		cabinet.setWidth(cabinetWidthPad);
	                                    		cabinet.setLeftobject("");
	                                    		cabinet.setStartposition(cabinetStartAd);
												return Stream.of(cabinet);
											}
                                    	} else {
                                    		if (leftObjectHightMaxF && widthMinF <= 24 && ("lower".equals(cabinet.getType()) || "high".equals(cabinet.getType())) ||
    												rightObjectHightMinF && widthMinF <= 15 && "upper".equals(cabinet.getType()) ) {
                                    			float cabinetWidthPad = 27f;
												float cabinetStartAd = cabinet.getStartposition() + 27f;
	                                    		if ("lower".equals(cabinet.getType()) || "high".equals(cabinet.getType())) {
	                                        		cabinetWidthPad = cabinet.getWidth() - 27f;
	                                        		cabinetStartAd = cabinet.getStartposition() + 27f;
	                                        	} else if ("upper".equals(cabinet.getType())) {
	                                            	cabinetWidthPad = cabinet.getWidth() - 15f;
	                                            	cabinetStartAd = cabinet.getStartposition() + 15f;
	                                        	} else if ("islandiner".equals(cabinet.getType()) || "peninsulainer".equals(cabinet.getType())) {
	                                            	cabinetWidthPad = cabinet.getWidth() - 27f;
	                                            	cabinetStartAd = cabinet.getStartposition() + 27f;
	                                        	}
	                                    		cabinet.setWidth(cabinetWidthPad);
	                                    		cabinet.setLeftobject("");
	                                    		cabinet.setStartposition(cabinetStartAd);
												return Stream.of(cabinet);
                                    		}
                                    		if (otherFlag[1]) {
                                    			return null;
                                    		} else {
                                    			if (cabinet.getWidth() > 24 && cabinet.getWidth() <=27 && ("lower".equals(cabinet.getType()) || "islandiner".equals(cabinet.getType())) || "peninsulainer".equals(cabinet.getType())) {
        											// 直接返回一个BF6
        												Cabinet cabinet1 = new Cabinet(cabinet); 	
        												cabinet1.setName("BF3");
        												cabinet1.setWidth(cabinet1.getWidth() - 24f);
        												cabinet1.setCabinettype("BF");
        												cabinet1.setStartposition(cabinet.getStartposition() + 24f);
        												cabinet1.setCornerKey("BF3"+ maxStartPositionCabinet.getStartposition().toString());
        												return Stream.of(cabinet1);	
        										} else if (cabinet.getWidth() > 15 && cabinet.getWidth() <=18 && ("upper".equals(cabinet.getType()) )) {
        											// 直接返回一个BF6
        											Cabinet cabinet1 = new Cabinet(cabinet); 	
        											cabinet1.setName("WF03");
        											cabinet1.setWidth(cabinet1.getWidth() - 12f);
        											cabinet1.setCabinettype("WF");
        											cabinet1.setStartposition(cabinet.getStartposition() +12f);
        											cabinet1.setCornerKey("WF03"+ maxStartPositionCabinet.getStartposition().toString());
        											return Stream.of(cabinet1);	
        										} else if (cabinet.getWidth() > 27 && cabinet.getWidth() <=30 && ("lower".equals(cabinet.getType()) || "islandiner".equals(cabinet.getType())) || "peninsulainer".equals(cabinet.getType())) {
        											// 直接返回一个BF6
        												Cabinet cabinet1 = new Cabinet(cabinet); 	
        												cabinet1.setName("BF6");
        												cabinet1.setWidth(cabinet1.getWidth() - 24f);
        												cabinet1.setCabinettype("BF");
        												cabinet1.setStartposition(cabinet.getStartposition() + 24f);
        												cabinet1.setCornerKey("BF3"+ maxStartPositionCabinet.getStartposition().toString());
        												return Stream.of(cabinet1);	
                                    			} else if (cabinet.getWidth() > 18 && cabinet.getWidth() <=21 && "upper".equals(cabinet.getType()) ) {
        													// 直接返回一个BF6

        	                                        	Cabinet cabinet1 = new Cabinet(cabinet); 	
        												cabinet1.setName("WF06");
        												cabinet1.setWidth(cabinet1.getWidth() - 12f);
        												cabinet1.setCabinettype("WF");
        												cabinet1.setStartposition(cabinet.getStartposition() +12f);
        												cabinet1.setCornerKey("WF03"+ maxStartPositionCabinet.getStartposition().toString());
        												return Stream.of(cabinet1);	
                                                }  else {
                                                	if ("lower".equals(cabinet.getType()) || "islandiner".equals(cabinet.getType())  || "peninsulainer".equals(cabinet.getType())) {
                                                        return creatCornerCab("min",cabinet,"BF3", cabinetName, 3f,
                                                                24f, cabinet.getWidth() - 27f, 27f,  "BF",cabinettype,maxStartPositionCabinet.getStartposition().toString());
                                                    } else {
                                                        return creatCornerCab("min",cabinet,"WF03", cabinetName, 3f,
                                                                12f, cabinet.getWidth() - 15f, 15f,  "WF",cabinettype,maxStartPositionCabinet.getStartposition().toString());
                                                    }
        										}                                    			
                                    		}
                                        }
                                    }
                                    
                                }
                            } else {
                                if ("BLS36".equals(cornerCab)) {
                                    if (Objects.equals(cabinet.getWallid(), maxStartPositionCabinet.getWallid()) && 
                                    		Objects.equals(cabinet.getStartposition(), maxStartPositionCabinet.getStartposition()) &&
                                    		Objects.equals(cabinet.getType(), maxStartPositionCabinet.getType()) ){
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        if ("tbdwpe".equals(cabinet.getCabinettype()) || "tbdwps".equals(cabinet.getCabinettype()) || "tbdwpr".equals(cabinet.getCabinettype())) {
//                                            cabinettype = "tbd";
//                                            cabinetName = "tbd";
                                        } else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }
                                        return creatCornerCab("max",cabinet,"BLS36", cabinetName, 36f,
                                                cabinet.getStartposition() + cabinet.getWidth() - 36f, cabinet.getWidth() - 36f, cabinet.getStartposition(), "BLS", cabinettype, String.valueOf(numberC));
                                    } else {
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        if ("tbdwpe".equals(cabinet.getCabinettype()) || "tbdwps".equals(cabinet.getCabinettype()) || "tbdwpr".equals(cabinet.getCabinettype())) {
//                                            cabinettype = "tbd";
//                                            cabinetName = "tbd";
                                        } else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }
                                        return creatCornerCab("min",cabinet,"BLS36", cabinetName, 36f,
                                                0f, cabinet.getWidth() - 36f, 36f,   "BLSD", cabinettype, String.valueOf(numberC));
                                    }
                                } else if ("BBC39L".equals(cornerCab)) {
                                    if (Objects.equals(cabinet.getWallid(), maxStartPositionCabinet.getWallid()) && 
                                    	Objects.equals(cabinet.getStartposition(), maxStartPositionCabinet.getStartposition())){
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        if ("tbdwpe".equals(cabinet.getCabinettype()) || "tbdwps".equals(cabinet.getCabinettype()) || "tbdwpr".equals(cabinet.getCabinettype())) {
//                                            cabinettype = "tbd";
//                                            cabinetName = "tbd";
                                        } else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }
                                        return creatCornerCab("max",cabinet,"BBC39L", cabinetName, 27f,
                                                cabinet.getStartposition() + cabinet.getWidth() - 27f, cabinet.getWidth() - 27f, cabinet.getStartposition(),  "BBCLD",cabinettype, String.valueOf(numberC));
                                    } else {
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        if ("tbdwpe".equals(cabinet.getCabinettype()) || "tbdwps".equals(cabinet.getCabinettype()) || "tbdwpr".equals(cabinet.getCabinettype())) {
//                                            cabinettype = "tbd";
//                                            cabinetName = "tbd";
                                        } else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }
                                        return creatCornerCab("min",cabinet,"BBC39L", cabinetName, 42f,
                                                0f, cabinet.getWidth() - 42f, 42f, "BBCL", cabinettype, String.valueOf(numberC));
                                    }
                                } else if ("BBC39R".equals(cornerCab)) {

                                    if (Objects.equals(cabinet.getWallid(), maxStartPositionCabinet.getWallid())  && 
                                    		Objects.equals(cabinet.getStartposition(), maxStartPositionCabinet.getStartposition())){
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        if ("tbdwpe".equals(cabinet.getCabinettype()) || "tbdwps".equals(cabinet.getCabinettype()) || "tbdwpr".equals(cabinet.getCabinettype())) {
//                                            cabinettype = "tbd";
//                                            cabinetName = "tbd";
                                        } else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }
                                        return creatCornerCab("max",cabinet,"BBC39R", cabinetName, 42f,
                                                cabinet.getStartposition() + cabinet.getWidth() - 42f, cabinet.getWidth() - 42f, cabinet.getStartposition(), "BBCR", cabinettype, String.valueOf(numberC));
                                    } else {
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        if ("tbdwp".equals(cabinet.getCabinettype())) {
                                            cabinettype = "tbd";
                                            cabinetName = "tbd";
                                        } else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }
                                        return creatCornerCab("min",cabinet,"BBC39R", cabinetName, 27f,
                                                0f, cabinet.getWidth() - 27f, 27f,  "BBCRD",cabinettype, String.valueOf(numberC));
                                    }
                                } else if (cornerCab.startsWith("WDC24")) {
                                    if (Objects.equals(cabinet.getWallid(), maxStartPositionCabinet.getWallid()) && 
                                    		Objects.equals(cabinet.getStartposition(), maxStartPositionCabinet.getStartposition())){
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        return creatCornerCab("max",cabinet,cornerCab, cabinetName, 24f,
                                                cabinet.getStartposition() + cabinet.getWidth() - 24f, cabinet.getWidth() - 24f, cabinet.getStartposition(), "WDC", cabinettype, String.valueOf(numberC));
                                    } else {
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        return creatCornerCab("min",cabinet,cornerCab, cabinetName, 24f,
                                                0f, cabinet.getWidth() - 24f, 24f,   "WDCD", cabinettype, String.valueOf(numberC));
                                    }
                                } else if (cornerCab.toUpperCase().startsWith("WBC30") && cornerCab.toUpperCase().endsWith("L")) {
                                    
                                	if (Objects.equals(cabinet.getWallid(), maxStartPositionCabinet.getWallid()) && 
                                			Objects.equals(cabinet.getStartposition(), maxStartPositionCabinet.getStartposition())){
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        String nameT = "WBC30" + Math.round(cabinet.getHeight()) + "L";
                                        return creatCornerCab("max",cabinet,nameT, cabinetName, 15f,
                                                cabinet.getStartposition() + cabinet.getWidth() - 15f, cabinet.getWidth() - 15f, cabinet.getStartposition(),  "WBCLD",cabinettype, String.valueOf(numberC));
                                    } else {
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        String nameT = "WBC30" + Math.round(cabinet.getHeight()) + "L";
                                        return creatCornerCab("min",cabinet,nameT, cabinetName, 33f,
                                                0f, cabinet.getWidth() - 33f, 33f, "WBCL", cabinettype, String.valueOf(numberC));
                                    }
                                } else if (cornerCab.toUpperCase().startsWith("WBC30") && cornerCab.toUpperCase().endsWith("R")) {

                                    if (Objects.equals(cabinet.getWallid(), maxStartPositionCabinet.getWallid()) && 
                                    	Objects.equals(cabinet.getStartposition(), maxStartPositionCabinet.getStartposition())){
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        String nameT = "WBC30" + Math.round(cabinet.getHeight()) + "R";
                                        return creatCornerCab("max",cabinet,nameT, cabinetName, 33f,
                                                cabinet.getStartposition() + cabinet.getWidth() - 33f, cabinet.getWidth() - 33f, cabinet.getStartposition(), "WBCR", cabinettype, String.valueOf(numberC));
                                    } else {
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        String nameT = "WBC30" + Math.round(cabinet.getHeight()) + "R";
                                        return creatCornerCab("min",cabinet,nameT, cabinetName, 15f,
                                                0f, cabinet.getWidth() - 15f, 15f,  "WBCRD",cabinettype, String.valueOf(numberC));
                                    }
                                } else if (cornerCab.toUpperCase().startsWith("WBC27") && 
                                		cornerCab.toUpperCase().endsWith("L")) {
                                    if (Objects.equals(cabinet.getWallid(), maxStartPositionCabinet.getWallid()) && 
                                    	Objects.equals(cabinet.getStartposition(), maxStartPositionCabinet.getStartposition())){
                                    	
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        String nameT = "WBC27" + Math.round(cabinet.getHeight()) + "L";
                                        return creatCornerCab("max",cabinet,nameT, cabinetName, 15f,
                                                cabinet.getStartposition() + cabinet.getWidth() - 15f, cabinet.getWidth() - 15f, cabinet.getStartposition(),  "WBCLD",cabinettype, String.valueOf(numberC));
                                    } else {
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        String nameT = "WBC27" + Math.round(cabinet.getHeight()) + "L";
                                        return creatCornerCab("min",cabinet,nameT, cabinetName, 30f,
                                                0f, cabinet.getWidth() - 30f, 30f, "WBCL", cabinettype, String.valueOf(numberC));
                                    }
                                } else if (cornerCab.toUpperCase().startsWith("WBC27") && 
                                		cornerCab.toUpperCase().endsWith("R")) {

                                	if (Objects.equals(cabinet.getWallid(), maxStartPositionCabinet.getWallid()) && 
                                        	Objects.equals(cabinet.getStartposition(), maxStartPositionCabinet.getStartposition())){
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        String nameT = "WBC27" + Math.round(cabinet.getHeight()) + "R";
                                        return creatCornerCab("max",cabinet, nameT, cabinetName, 30f,
                                                cabinet.getStartposition() + cabinet.getWidth() - 30f, cabinet.getWidth() - 30f, cabinet.getStartposition(), "WBCR", cabinettype, String.valueOf(numberC));
                                    } else {
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        String nameT = "WBC27" + Math.round(cabinet.getHeight()) + "R";
                                        return creatCornerCab("min",cabinet, nameT, cabinetName, 15f,
                                                0f, cabinet.getWidth() - 15f, 15f,  "WBCRD",cabinettype, String.valueOf(numberC));
                                    }
                                } else {
                                	// 查看宽度是否合适拼接BF/WF
                                	if (Objects.equals(cabinet.getWallid(), maxStartPositionCabinet.getWallid()) && 
                                        	Objects.equals(cabinet.getStartposition(), maxStartPositionCabinet.getStartposition())){
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        if ("tbdwpe".equals(cabinet.getCabinettype()) || "tbdwps".equals(cabinet.getCabinettype()) || "tbdwpr".equals(cabinet.getCabinettype())) {
//                                            cabinettype = "tbd";
//                                            cabinetName = "tbd";
                                        } else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }
                                        // 如果宽度小于27，则没办法拼接
                                        if (cabinet.getWidth() < 27 && ("lower".equals(cabinet.getType())  || "islandiner".equals(cabinet.getType()))  || "peninsulainer".equals(cabinet.getType())) {
                                        	return null;
                                        } else if (cabinet.getWidth() < 27 && "upper".equals(cabinet.getType()) ) {
                                        	return null;
                                        } else {
                                        	if (otherFlag[1]) { // 1: min 不足放下最小柜子
                                        		if ((otherWidth[1] > 24 && "door".equals(otherObject[1][1])) || (otherWidth[1] > 12 && "window".equals(otherObject[1][1]))) {
                                        			cabinet.setRightobject("corner"); // corner： max 柜子右侧为corner， min侧没有顶到墙
    												return Stream.of(cabinet);
    											} else {
    												float cabinetWidthPad = 27f;
    	                                    		if ("lower".equals(cabinet.getType())) {
    	                                        		cabinetWidthPad = cabinet.getWidth() - 27f;
    	                                        	} else if ("upper".equals(cabinet.getType())) {
    	                                            	cabinetWidthPad = cabinet.getWidth() - 15f;
    	                                        	} else if ("islandiner".equals(cabinet.getType()) || "peninsulainer".equals(cabinet.getType())) {
    	                                            	cabinetWidthPad = cabinet.getWidth() - 27f;
    	                                        	}
    	                                    		cabinet.setWidth(cabinetWidthPad);
    	                                    		cabinet.setRightobject("");
    												return Stream.of(cabinet);
    											}
                                        	} else {
                                        		if (cabinet.getWidth() > 27 && cabinet.getWidth() <=30 && ("lower".equals(cabinet.getType()) || "islandiner".equals(cabinet.getType())) || "peninsulainer".equals(cabinet.getType())) {
        											// 直接返回一个BF6
        												Cabinet cabinet1 = new Cabinet(cabinet); 	
        												cabinet1.setName("BF6");
        												cabinet1.setCabinettype("BF");
        												cabinet1.setStartposition(cabinet.getStartposition() + cabinet.getWidth() - 27f);
        												cabinet1.setCornerKey("BF3"+ maxStartPositionCabinet.getStartposition().toString());
        												return Stream.of(cabinet1);	
                                    			} else if (cabinet.getWidth() > 18 && cabinet.getWidth() <=21 && "upper".equals(cabinet.getType()) ) {
        													// 直接返回一个BF6

        	                                        	Cabinet cabinet1 = new Cabinet(cabinet); 	
        												cabinet1.setName("WF06");
        												cabinet1.setCabinettype("WF");
        												cabinet1.setStartposition(cabinet.getStartposition() + cabinet.getWidth() - 15f);
        												cabinet1.setCornerKey("WF03"+ maxStartPositionCabinet.getStartposition().toString());
        												return Stream.of(cabinet1);	
                                                }  else {
	                                        		if ("lower".equals(cabinet.getType()) || "islandiner".equals(cabinet.getType())  || "peninsulainer".equals(cabinet.getType())) {
	                                                    return creatCornerCab("max",cabinet,"BF3", cabinetName, 3f,
	                                                            cabinet.getStartposition() + cabinet.getWidth() - 27f, cabinet.getWidth() - 27f, cabinet.getStartposition(), "BF", cabinettype,maxStartPositionCabinet.getStartposition().toString());
	                                                } else {
	                                                    return creatCornerCab("max",cabinet,"WF03", cabinetName, 3f,
	                                                            cabinet.getStartposition() + cabinet.getWidth() - 15f, cabinet.getWidth() - 15f, cabinet.getStartposition(), "WF", cabinettype,maxStartPositionCabinet.getStartposition().toString());
	                                                }
                                                }
                                        	}
                                        	
                                        }
                                        

                                    } else {
                                        String cabinettype = cabinet.getCabinettype();
                                        String cabinetName = cabinet.getName();
                                        if ("tbdwpe".equals(cabinet.getCabinettype()) || "tbdwps".equals(cabinet.getCabinettype()) || "tbdwpr".equals(cabinet.getCabinettype())) {
//                                            cabinettype = "tbd";
//                                            cabinetName = "tbd";
                                        } else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }else if ("sbfront".equals(cabinet.getCabinettype())) {

                                        }
                                        if (cabinet.getWidth() < 27 && ("lower".equals(cabinet.getType())  || "islandiner".equals(cabinet.getType()))  || "peninsulainer".equals(cabinet.getType())) {
                                        	otherFlag[0] = true;
                                        	return null;
                                        } else if (cabinet.getWidth() < 27 && "upper".equals(cabinet.getType()) ) {
                                        	otherFlag[0] = true;
                                        	return null;
                                        } else {
                                        	if (otherFlag[0]) { // 0: max 不足放下最小柜子
                                        		if ((otherWidth[0] > 24 && "door".equals(otherObject[0][0])) || (otherWidth[0] > 12 && "window".equals(otherObject[0][0]))) {
                                        			cabinet.setLeftobject("corner"); // max柜子没有顶到墙 min的柜子右侧为corner
    												return Stream.of(cabinet);
    											} else {
    												float cabinetWidthPad = 27f;
    												float cabinetStartAd = cabinet.getStartposition() + 27f;
    	                                    		if ("lower".equals(cabinet.getType())) {
    	                                        		cabinetWidthPad = cabinet.getWidth() - 27f;
    	                                        		cabinetStartAd = cabinet.getStartposition() + 27f;
    	                                        	} else if ("upper".equals(cabinet.getType())) {
    	                                            	cabinetWidthPad = cabinet.getWidth() - 15f;
    	                                            	cabinetStartAd = cabinet.getStartposition() + 15f;
    	                                        	} else if ("islandiner".equals(cabinet.getType()) || "peninsulainer".equals(cabinet.getType())) {
    	                                            	cabinetWidthPad = cabinet.getWidth() - 27f;
    	                                            	cabinetStartAd = cabinet.getStartposition() + 27f;
    	                                        	}
    	                                    		cabinet.setWidth(cabinetWidthPad);
    	                                    		cabinet.setStartposition(cabinetStartAd);
    	                                    		cabinet.setLeftobject("");
    												return Stream.of(cabinet);
    											}
                                        	} else {
                                        		if (cabinet.getWidth() > 27 && cabinet.getWidth() <=30 && ("lower".equals(cabinet.getType()) || "islandiner".equals(cabinet.getType())) || "peninsulainer".equals(cabinet.getType())) {
        											// 直接返回一个BF6
        												Cabinet cabinet1 = new Cabinet(cabinet); 	
        												cabinet1.setName("BF6");
        												cabinet1.setCabinettype("BF");
        												cabinet1.setStartposition(cabinet.getStartposition() + cabinet.getWidth() - 27f);
        												cabinet1.setCornerKey("BF3"+ maxStartPositionCabinet.getStartposition().toString());
        												return Stream.of(cabinet1);	
                                    			} else if (cabinet.getWidth() > 18 && cabinet.getWidth() <=21 && "upper".equals(cabinet.getType()) ) {
        													// 直接返回一个BF6

        	                                        	Cabinet cabinet1 = new Cabinet(cabinet); 	
        												cabinet1.setName("WF06");
        												cabinet1.setCabinettype("WF");
        												cabinet1.setStartposition(cabinet.getStartposition() + cabinet.getWidth() - 15f);
        												cabinet1.setCornerKey("WF03"+ maxStartPositionCabinet.getStartposition().toString());
        												return Stream.of(cabinet1);	
                                                }  else {
	                                        		if ("lower".equals(cabinet.getType()) || "islandiner".equals(cabinet.getType())  || "peninsulainer".equals(cabinet.getType())) {
	                                                    return creatCornerCab("min",cabinet,"BF3", cabinetName, 3f,
	                                                            24f, cabinet.getWidth() - 27f, 27f,  "BF",cabinettype,maxStartPositionCabinet.getStartposition().toString());
	                                                } else {
	                                                    return creatCornerCab("min",cabinet,"WF03", cabinetName, 3f,
	                                                            12f, cabinet.getWidth() - 15f, 15f,  "WF",cabinettype,maxStartPositionCabinet.getStartposition().toString());
	                                                }
                                                }
                                        	}
                                        	
                                        }
                                  
                                        
                                    }
                                }
                            }


                            } else {
                                return Stream.of(cabinet);
                            }


                        })
                        .collect(Collectors.toList()))
                .collect(Collectors.toCollection(ArrayList::new));


        return newMultipleCabinetList;
    }
    public Stream<Cabinet> creatCornerCab(String flg, Cabinet cabinet, String cabinetName1,String cabinetName2, float cabinetWidth1, float position1, float cabinetWidth2, float position2, String cabinetType1, String cabinetType2, String cornerKey) {
    	float cabHeight = 0f;
    	String type = cabinet.getType();
    	
    	if (cabinetName1.startsWith("tbdwp")) {
    		type = "high";
    	} else {
    		if ("upper".equals(cabinet.getType()) || "islandiner".equals(cabinet.getType()) || "peninsulainer".equals(cabinet.getType())) {
    			type = cabinet.getType();
    		} else {
    			type = "lower";
    		}
    	}
    	
    	if ("lower".equals(type)) {
    		cabHeight = Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
    	} else if ("upper".equals(type)) {
    		cabHeight = cabinet.getHeight();
    	} else if ("islandiner".equals(type) || "peninsulainer".equals(cabinet.getType())) {
    		cabHeight = Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
    	} else {
    		cabHeight = cabinet.getHeight();
    	}
    	Cabinet cabinet1 = null;
    	Cabinet cabinet2 = null;
    	String leftObject1 ;
    	String leftObject2 ;
    	String rightObject1 ;
    	String rightObject2 ;
    	// corner cabinet = 1
    	
    	if ("max".equals(flg)) { 
    		if ("door".equals(cabinet.getLeftobject()) || "window".equals(cabinet.getLeftobject())) {
    			if (cabinetWidth2 < 9) {
        			leftObject1 = cabinet.getLeftobject();;
            		rightObject1 = cabinet.getRightobject();
            		leftObject2 = "";
            		rightObject2 ="";
            		cabinetWidth2 = 0;
            		// 小于9放不下任何柜子
        		} else {
        			leftObject1 = "";
            		rightObject1 = cabinet.getRightobject();
            		leftObject2 = cabinet.getLeftobject();
            		rightObject2 = "";
        		}
    		} else {
    			leftObject1 = "";
        		rightObject1 = cabinet.getRightobject();
        		leftObject2 = cabinet.getLeftobject();
        		rightObject2 = "";
    		}
    		
    	} else {
    		if ("door".equals(cabinet.getRightobject()) || "window".equals(cabinet.getRightobject())) {
        		if (cabinetWidth2 < 9) {
        			leftObject1 = cabinet.getLeftobject();;
            		rightObject1 = cabinet.getRightobject();
            		leftObject2 = "";
            		rightObject2 ="";
            		cabinetWidth2 = 0;
            		// 小于9放不下任何柜子
        		} else {
        			leftObject1 = cabinet.getLeftobject();;
        			rightObject1 = "";
            		leftObject2 = "";
            		rightObject2 =cabinet.getRightobject();
        		}
        	} else {
        		leftObject1 = cabinet.getLeftobject();;
        		rightObject1 = "";
        		leftObject2 = "";
        		rightObject2 =cabinet.getRightobject();
        	}    		
    	}

    	if (cabinetWidth1 > 0 ) {
    		 cabinet1 = new Cabinet(cabHeight, cabinet.getLength(), cabinetName1,
                    cabinetWidth1, cabinet.getCeilingHeight(), cabinet.getKitchenId(), cabinet.getWallid(), cabinetType1,
                    type, position1, cabinet.getDepth(), cabinetName1+cornerKey, cabinet.getRotation(), leftObject1, rightObject1, true); 	
    		 if ( "islandiner".equals(type)) {
    			 if ("min".equals(flg)) {
    				 cabinet1.setPeninsulainercorner(2);
    			 } else {
    				 cabinet1.setPeninsulainercorner(1);
    			 }
    			 
    		 }
    		 
    	}
    	if (cabinetWidth2 > 0 ) {
    		cabinet2 = new Cabinet(cabinet.getHeight(), cabinet.getLength(), cabinetName2,
                    cabinetWidth2, cabinet.getCeilingHeight(), cabinet.getKitchenId(), cabinet.getWallid(), cabinetType2,
                    cabinet.getType(), position2, cabinet.getDepth(), cabinet.getRotation(), leftObject2, rightObject2);
    	}
        
        return Stream.of(cabinet1, cabinet2).filter(Objects::nonNull);  // 添加这行来过滤掉 null 值;
    }

    public Cabinet getMaxPositionCab(ArrayList<List<Cabinet>> multipleCabinetList, int wallid, float wallWidth) {
        return multipleCabinetList.stream() // Stream the outer list
                .flatMap(List::stream) // Flatten the nested lists into a single stream of cabinets
                .filter(Objects::nonNull) // Filter out null cabinets
                .filter(cabinet -> cabinet.getWallid() == wallid) // Filter by wallid
                .filter(cabinet -> cabinet.getStartposition() + cabinet.getWidth() == wallWidth) // Filter by startPosition + width == wallWidth
                .filter(cabinet -> "tbd".equals(cabinet.getName()) || "tbdsbback".equals(cabinet.getName()) || "tbdsbfront".equals(cabinet.getName()) ||"tbdwps".equals(cabinet.getName()) ||"tbdwpr".equals(cabinet.getName()) ||"tbdwpe".equals(cabinet.getName())) 
                .max(Comparator.comparing(Cabinet::getStartposition)) // Find the cabinet with the max startPosition
                .orElse(null);
    }
    
    public Cabinet getMaxPositionCabpeninsula( ArrayList<List<Cabinet>> multipleCabinetList, int adjacentIslandId) {
        return multipleCabinetList.stream() // Stream the outer list
                .flatMap(List::stream) // Flatten the nested lists into a single stream of cabinets
                .filter(Objects::nonNull) // Filter out null cabinets
                .filter(cabinet -> cabinet.getWallid() == adjacentIslandId) // Filter by IslandId
                .filter(cabinet -> "islandiner".equals(cabinet.getType()) || "peninsulainer".equals(cabinet.getType())) // Filter by type
                .filter(cabinet -> "tbd".equals(cabinet.getName())|| "tbdsbback".equals(cabinet.getName()) || "tbdsbfront".equals(cabinet.getName())||"tbdwps".equals(cabinet.getName()) ||"tbdwpr".equals(cabinet.getName()) ||"tbdwpe".equals(cabinet.getName())) 
                .max(Comparator.comparing(Cabinet::getStartposition)) // Find the cabinet with the max startPosition
                .orElse(null); // Return null if no match is found
    }
    public Cabinet getMinPositionCab( ArrayList<List<Cabinet>> multipleCabinetList, int adjacentWallid) {
        return multipleCabinetList.stream() // Stream the outer list
                .flatMap(List::stream) // Flatten the nested lists into a single stream of cabinets
                .filter(Objects::nonNull) // Filter out null cabinets
                .filter(cabinet -> cabinet.getWallid() == adjacentWallid) // Filter by wallid
                .filter(cabinet -> cabinet.getStartposition() == 0) // Filter by startPosition == 0
                .filter(cabinet -> "tbd".equals(cabinet.getName())|| "tbdsbback".equals(cabinet.getName()) || "tbdsbfront".equals(cabinet.getName()) ||"tbdwps".equals(cabinet.getName()) ||"tbdwpr".equals(cabinet.getName()) ||"tbdwpe".equals(cabinet.getName())) 
                .findFirst() // Get the first match
                .orElse(null); // Return null if no match is found
    }
    public Cabinet getMinPositionCabpeninsula( ArrayList<List<Cabinet>> multipleCabinetList, int adjacentIslandId) {
        return multipleCabinetList.stream() // Stream the outer list
                .flatMap(List::stream) // Flatten the nested lists into a single stream of cabinets
                .filter(Objects::nonNull) // Filter out null cabinets
                .filter(cabinet -> cabinet.getWallid() == adjacentIslandId) // Filter by IslandId
                .filter(cabinet -> "islandiner".equals(cabinet.getType()) || "peninsulainer".equals(cabinet.getType()))  // Filter by type
                .filter(cabinet -> "tbd".equals(cabinet.getName())|| "tbdsbback".equals(cabinet.getName()) || "tbdsbfront".equals(cabinet.getName()) ||"tbdwps".equals(cabinet.getName()) ||"tbdwpr".equals(cabinet.getName()) ||"tbdwpe".equals(cabinet.getName())) 
                .filter(cabinet -> cabinet.getStartposition() == 0) // Filter by startPosition == 0
                .findFirst() // Get the first match
                .orElse(null); // Return null if no match is found
    }

    public String getCornerCab( ArrayList<List<Cabinet>> multipleCabinetList, Cabinet maxStartPositionCabinet, Cabinet minStartPositionCabinet, String cabinetFlag) {
        String cornerCab = null;
        
        // maxStartPositionCabinets
        if ("lower".equals(cabinetFlag)) {
        	if (minStartPositionCabinet != null &&
                    maxStartPositionCabinet != null)
            {
                 if(minStartPositionCabinet.getWidth() >= 42 &&
                        maxStartPositionCabinet.getWidth() >=  27) {
                    // 放置一个BBC39R在wallCabinetList里面
                    cornerCab="BBC39L";

                } else if(maxStartPositionCabinet.getWidth() >= 42 &&
                        minStartPositionCabinet.getWidth() >= 27) {
                    // 放置一个BBC39L在wallCabinetList里面
                    cornerCab="BBC39R";
                } else if (minStartPositionCabinet.getWidth() >= 36 &&
                        maxStartPositionCabinet.getWidth() >= 36) {
                    // 放置一个BLS36在wallCabinetList里面 BLS 优先
                    cornerCab="BLS36";

                }
            } 
        } else {
        	if (minStartPositionCabinet != null &&
                    maxStartPositionCabinet != null)
            {
        		float cabinetHeight = maxStartPositionCabinet.getHeight();
                if(minStartPositionCabinet.getWidth() >= 33 &&
                        maxStartPositionCabinet.getWidth() >=  15) {
                    // 放置一个BBC39R在wallCabinetList里面
                    cornerCab="WBC30"+(int)cabinetHeight+"L";

                } else if(maxStartPositionCabinet.getWidth() >= 33 &&
                        minStartPositionCabinet.getWidth() >= 15) {
                    // 放置一个BBC39L在wallCabinetList里面
                    cornerCab="WBC30"+(int)cabinetHeight+"R";
                }else if(minStartPositionCabinet.getWidth() >= 30 &&
                        maxStartPositionCabinet.getWidth() >=  15) {
                    // 放置一个BBC39R在wallCabinetList里面
                    cornerCab="WBC27"+(int)cabinetHeight+"L";

                } else if(maxStartPositionCabinet.getWidth() >= 30 &&
                        minStartPositionCabinet.getWidth() >= 15) {
                    // 放置一个BBC39L在wallCabinetList里面
                    cornerCab="WBC27"+(int)cabinetHeight+"R";
                } else if (minStartPositionCabinet.getWidth() >= 24 &&
                        maxStartPositionCabinet.getWidth() >= 24) {
                    // 放置一个BLS36在wallCabinetList里面 BLS 优先
                    cornerCab="WDC24"+(int)cabinetHeight;

                }  
            }
        }
        
        return cornerCab;
    }
//    public ArrayList<List<Cabinet>> designCabinetConnect(Kitchen kitchenInfo,List<Wall> wallInfoList, ArrayList<List<Cabinet>> multipleCabinetList) {
//        ArrayList<List<Cabinet>> multipleCabinetList = new ArrayList<>();
//        return multipleCabinetList;
//    }

    public ArrayList<List<Cabinet>> designCabinetUpper(Kitchen kitchenInfo,List<Wall> wallInfoList, List<Window> windowList, List<Door> doorList,  List<Appliance> applianceList,
                                                       List<Cabinetsrule> cabinetsruleList,List<CabinetProduct>  cabinetproductsList) {
            logger.info("designCabinetUpper kitchenInfo:" + kitchenInfo.getId());
        ArrayList<List<Cabinet>> multipleCabinetList = new ArrayList<>();
        if (kitchenInfo == null || wallInfoList == null) {return null;}
//        List<Cabinet> highCabinet = cabinetRepository.findAllByType("high");
            
        float highCabinetHeight = 0;
        float highCabinetHeight2 = 0;
        float cabnetMinWidth = Constants.commons.CABINET_MIN_WIDTH;
        ArrayList<List<Cabinet>> lowerCabinetList = new ArrayList();
        String constr = kitchenInfo.getConstruction1().substring(0, 3); // upper 使用getConstruction1
        if (kitchenInfo.getCeilingHeight() >= 105) {
        	highCabinetHeight = 15;
        	if ("BC1".equals(constr)) {
        		highCabinetHeight2 = 36;  // 36 height      
        		cabnetMinWidth = Constants.commons.CABINET_MIN_WIDTH;
            } else {
            	cabnetMinWidth = Constants.commons.CABINET_MIN_WIDTHBC2;
            	highCabinetHeight2 = 33;
            }
        } else if (kitchenInfo.getCeilingHeight() >= 93) {
            highCabinetHeight = 39;
        } else  {
            if ("BC1".equals(constr)) {
                if (kitchenInfo.getCeilingHeight() >= 84 ) {
                    highCabinetHeight = 30;  // 36 height
                } else {
                	highCabinetHeight = 30;
                }

            } else {
                //
                highCabinetHeight = 33;
            }
        }
     
        // 根据电器位置，窗户，门位置，得到可拜访柜子的宽度位置
        for (int i = 0; i < wallInfoList.size(); i++) {
            Wall wall = wallInfoList.get(i);
            if (wall.getWidth() == 0) continue;
            List<Cabinet> cabinetobjectList = new ArrayList<>();
            List<Appliance> applianceTmpList = new ArrayList<>();
            List<Window> windowTmpList = new ArrayList<>();
            List<Door> doorTmpList = new ArrayList<>();
           
            String cabinetTbdName = "tbd";
            List<Cabinet> lowerCabinet = cabinetRepository.findAllByTypeAndKitchenIdAndWallid("lower", kitchenInfo.getId(),  wall.getId());
            List<Cabinet> highCabinet = cabinetRepository.findAllByTypeAndKitchenIdAndWallid("high", kitchenInfo.getId(),  wall.getId());
            
            List<Cabinet> cabinetAll = new ArrayList<>(lowerCabinet);
            highCabinet = highCabinet.stream()
            	    .filter(cabinet -> !Constants.commons.CANBINET_TYPE_SP.equals(cabinet.getCabinettype()))
            	    .collect(Collectors.toList());
            cabinetAll.addAll(highCabinet);
            
            // 按 startposition 升序排序
            cabinetAll.sort(Comparator.comparingDouble(Cabinet::getStartposition));
            lowerCabinetList.add(cabinetAll);
            
            if (wall.getIsUpperCabinetPlaced()) {
                // 确定电器位置
                applianceTmpList = applianceList.stream()
                        .filter(appliance -> wall.equals(appliance.getWall()))
                        .sorted(Comparator.comparing(Appliance::getPosition))
                        .collect(Collectors.toList());
                windowTmpList = windowList.stream()
                		.filter(window -> wall.equals(window.getWall()) && window.getWidth() > 0)
                        .collect(Collectors.toList());
                doorTmpList = doorList.stream()
                        .filter(door -> wall.equals(door.getWall()) && door.getWidth() > 0)
                        .collect(Collectors.toList());
                List<ObjectsComponent> combinedList = Stream.concat(windowTmpList.stream(), doorTmpList.stream())
                        .collect(Collectors.toList());
                combinedList = Stream.concat(combinedList.stream(), highCabinet.stream())
                		.sorted(Comparator.comparing(ObjectsComponent::getStartposition))
                        .collect(Collectors.toList());
                
                float initPosition = 0;
                float applianceWidth = 0;
                float appliancePosition = 0;
                float appliancePositionPNB = 0;
                
                String leftObject = null;
                // 如果是L/U 同时rotation等于0，270的时候
                   if ("L".equals(kitchenInfo.getShapeType()) || "U".equals(kitchenInfo.getShapeType())) {
                   	if (wall.getAngle() == 0 || wall.getAngle() == 270) {
                   		leftObject = "wall";
                   	} else {
                   		leftObject = "endwall";
                   	}

                   } else {
                   	// 不是交叉的墙角
                   	// 
                	   leftObject = "endwall";
                   }
                   String rightObjectWall = null;
                   // 如果是L同时rotation等于90 或者 U 同时rotation等于0的时候
                   if ("L".equals(kitchenInfo.getShapeType()) &&wall.getAngle() == 90 || 
                   		"U".equals(kitchenInfo.getShapeType()) &&wall.getAngle() == 90 ||
                   		"U".equals(kitchenInfo.getShapeType()) &&wall.getAngle() == 0) {
                   	
                   		rightObjectWall = "wall";
                   	
                   } else {
                   	rightObjectWall = "endwall";
                   } 
                boolean hasIntersection = false;
                for (Appliance appliance : applianceTmpList) {
                    if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(appliance.getAppliancekind())) {
                        String leftRef="";
                        if ("BC1".equals(constr)) { // 1000series
//                        	appliancePositionPNB = appliance.getPosition() -  Constants.commons.CANBINET_WIDTH_RRP;
                        	appliancePosition = appliance.getPosition();
                        	if (appliancePosition < Constants.commons.CANBINET_WIDTH_RRP) {
                            	appliancePositionPNB = 0;
                            	appliancePosition = Constants.commons.CANBINET_WIDTH_RRP;
                            	leftRef = leftObject;
                            } else {
                            	appliancePositionPNB = appliance.getPosition() - Constants.commons.CANBINET_WIDTH_RRP;
                            }
                            
                            applianceWidth = appliance.getWidth() + Constants.commons.CANBINET_WIDTH_RRP  ;
                        } else { // 2000，3000series
//                        	appliancePositionPNB = appliance.getPosition() - Constants.commons.CANBINET_WIDTH_PNB;
                        	appliancePosition = appliance.getPosition();
                        	 if (appliancePosition < Constants.commons.CANBINET_WIDTH_PNB) {
                             	appliancePositionPNB = 0;
                             	appliancePosition = Constants.commons.CANBINET_WIDTH_PNB;
                             	leftRef = leftObject;
                             } else {
                             	appliancePositionPNB = appliance.getPosition() - Constants.commons.CANBINET_WIDTH_PNB;
                             }
                            applianceWidth = appliance.getWidth() + Constants.commons.CANBINET_WIDTH_PNB  ;
                        }
                        //
                        // cabinetRefrigerator 临时写高度21，之后修改逻辑
                        final float finalRefriCabinetHeight = kitchenInfo.getCeilingHeight() - appliance.getHeight();
                        CabinetProduct cabinetproducts = cabinetproductsList.stream()
                                .filter(product -> "refrigerator".equals(product.getCabinettype()) // 匹配类型
                                        && Math.round(product.getHeight()) <  Math.round(finalRefriCabinetHeight)  // 匹配高度
                                        && Math.round(product.getWidth()) == Math.round(appliance.getWidth())) // 匹配宽度
                                .max(Comparator.comparingDouble(CabinetProduct::getHeight))
                        	    .orElse(null);

                        if (cabinetproducts != null) {
                            Cabinet cabinetRefrigerator = new Cabinet(cabinetproducts.getHeight(),0f, cabinetproducts.getName(),
                                    cabinetproducts.getWidth(),kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),"WBR",
                                Constants.commons.CANBINET_TYPE_UPPER, appliancePosition, Constants.commons.UPPER_BRIDGE_DEFAULT_DEPTH, wall.getAngle(),leftRef,"");
                            cabinetobjectList.add(cabinetRefrigerator);
//                            leftObject = "";
                        }
                    } else if (Constants.commons.APPLIANCES_NAME_HOOD.equals(appliance.getAppliancekind())) {
                    	String leftRef="";
                    	appliancePositionPNB = appliance.getPosition();
                    	for (int w = 0; w < windowList.size(); w++) {
                        	if (windowList.get(w).getWall().getId() == appliance.getWall().getId()) {
                        		float windowPos = windowList.get(w).getStartposition();
                        		float windowWidth = windowList.get(w).getWidth();
                        		float appliancePos = appliance.getPosition();
                        		float applianceWidthT  = appliance.getWidth();
                        		// 检查两个区间是否有交集
                        		hasIntersection = !(windowPos + windowWidth <= appliancePos || appliancePos + applianceWidthT <= windowPos);

                        		if (hasIntersection) {
                        		    // 存在交集的处理逻辑
                        			break;
                        		} else {
                        		    // 不存在交集的处理逻辑
                        		}
                        	}
                        }
                    	if (!hasIntersection) {
                    		appliancePositionPNB = appliance.getPosition();
                            appliancePosition = appliance.getPosition();
                            if (appliancePositionPNB ==0) {
                            	leftRef = leftObject;
                            }
                            applianceWidth = appliance.getWidth()  ;
                            if (kitchenInfo.getId() != null) { // 预定修改为hood上面是否放置bridge柜子的flag
                            	float hoodCabinetHeight = 0f;
                            	String hoodCabinettype = "HOODWBR";
                            	if (kitchenInfo.getCeilingHeight() >=105) {
                            		if ("BC1".equals(constr)) {
                            			hoodCabinetHeight = kitchenInfo.getCeilingHeight() - Constants.commons.BASE_CABINET_DEFAULT_HEIGHT
                                    			- Constants.commons.BASE_UPPER_DEFAULT_DISTANCE - appliance.getHeight() - 15;
                            		} else {
                            			hoodCabinettype = "HOODWBR1";
                            			hoodCabinetHeight = kitchenInfo.getCeilingHeight() - Constants.commons.BASE_CABINET_DEFAULT_HEIGHT
                                    			- Constants.commons.BASE_UPPER_DEFAULT_DISTANCE - appliance.getHeight() ;
                            		}
                            		
                            		
                            	} else {
                            		hoodCabinetHeight = kitchenInfo.getCeilingHeight() - Constants.commons.BASE_CABINET_DEFAULT_HEIGHT
                                			- Constants.commons.BASE_UPPER_DEFAULT_DISTANCE - appliance.getHeight();
                            	}
//                            	float hoodCabinetHeight = 21f;
//                            	if (kitchenInfo.getCeilingHeight() == 108f) {
//                            		hoodCabinetHeight= 33;
//                            	}
                                final float finalHoodCabinetHeight = hoodCabinetHeight;
//                                List<CabinetProduct> cabinetproducts = cabinetproductsList.stream()
//                                        .filter(product -> "hood".equals(product.getCabinettype()) // 匹配类型
//                                                && Math.round(product.getHeight()) == Math.round(finalHoodCabinetHeight) // 匹配高度
//                                                && Math.round(product.getWidth()) == Math.round(appliance.getWidth())) // 匹配宽度
//                                        .collect(Collectors.toList());
                                final float finalApplianceWidth = applianceWidth;
                                CabinetProduct highestCabinet = cabinetproductsList.stream()
                                	    .filter(product -> 
                                	        "hood".equals(product.getCabinettype()) &&
                                	        Math.round(product.getHeight()) < Math.round(finalHoodCabinetHeight) &&
                                	        Math.round(product.getWidth()) == Math.round(finalApplianceWidth)
                                	    )
                                	    .max(Comparator.comparingDouble(CabinetProduct::getHeight))
                                	    .orElse(null);
                                
                                if (highestCabinet != null) {
                                	hoodCabinetHeight = highestCabinet.getHeight();
                                    Cabinet cabinetHood = new Cabinet(hoodCabinetHeight,0f,highestCabinet.getName(),
                                    		highestCabinet.getWidth(), kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),hoodCabinettype,
                                            Constants.commons.CANBINET_TYPE_UPPER, appliancePosition, Math.round(highestCabinet.getDepth()), wall.getAngle(),leftRef,"");
                                    cabinetobjectList.add(cabinetHood);
                                    Cabinet applianceHood = new Cabinet(appliance.getHeight(),0f,"HOOD",
                                            applianceWidth, kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),"appliance",
                                            Constants.commons.CANBINET_TYPE_UPPER, appliancePosition, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, wall.getAngle(),leftRef,"");
                                    cabinetobjectList.add(applianceHood);
//                                    leftObject = "";
                                } else {
                                	Cabinet applianceHood = new Cabinet(appliance.getHeight() ,0f,"HOOD",
                                            applianceWidth, kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),"appliance",
                                            Constants.commons.CANBINET_TYPE_UPPER, appliancePosition, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, wall.getAngle(),leftRef,"");
                                    cabinetobjectList.add(applianceHood);
//                                    leftObject = "";
                                    
                                }
//                                Cabinet cabinetHoodA = new Cabinet(21f,0f,cabinetproducts.get(0).getName(),
//                                        cabinetproducts.get(0).getWidth(), 0,kitchenInfo.getId(), wall.getId(),Constants.commons.OBJECT_TYPE_APPLIANCE,
//                                        Constants.commons.CANBINET_TYPE_UPPER, appliancePosition, 0);
//                                cabinetobjectList.add(cabinetHood);
                            }
                    	}
                        
                    } else {
                        // diswashing
                        continue;
                    }
                    // 0~appliancePos直接space
                    float endPosition = appliancePositionPNB - initPosition;
                    if (endPosition > 0) {
                        float finalInitPosition = initPosition;
                        float finalEndPosition = appliancePosition;
                        String rightObject = null;
                        List<ObjectsComponent> windowsInRange = combinedList.stream()
                                .filter(window -> window.getStartposition() != null &&window.getStartposition() >= finalInitPosition && (window.getStartposition() <= finalEndPosition))
                                .sorted(Comparator.comparing(ObjectsComponent::getStartposition)) // 按Startposition升序排序
                                .collect(Collectors.toList());
                        if (!windowsInRange.isEmpty()) {
                            for (ObjectsComponent window : windowsInRange) {
                                // 判断是window还是door
                                if (window instanceof Window  && window.getWidth() >0){
                                    rightObject = "window";
                                } else if  (window instanceof Door && window.getWidth() >0){
                                    rightObject = "door";
                                } else {
                                    // 高柜
                                    rightObject = "highcabinet";
                                }
                                float startP = initPosition;
                                float spaceWidth = window.getStartposition()-initPosition;
                                if ("window".equals(leftObject) || "door".equals(leftObject)) {
                                    startP = initPosition+Constants.commons.POSITION_WINDOWS_GAP;
                                    spaceWidth = spaceWidth-Constants.commons.POSITION_WINDOWS_GAP;
                                }
                                if ("window".equals(rightObject) || "door".equals(rightObject)) {
                                    spaceWidth = spaceWidth-Constants.commons.POSITION_WINDOWS_GAP;
                                }
                                cabinetTbdName = Constants.commons.CANBINET_TBD;
                                if (spaceWidth  >= cabnetMinWidth) {
                                    // 
                                    Cabinet cabinetWindowTbd = new Cabinet(highCabinetHeight,0f,cabinetTbdName,
                                            spaceWidth,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                                            Constants.commons.CANBINET_TYPE_UPPER, startP, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, leftObject, rightObject, wall.getAngle());
                                    cabinetobjectList.add(cabinetWindowTbd);
                                }
                                leftObject = rightObject;
                                initPosition =  window.getStartposition() + window.getWidth() ;
                            }
                            float startP = initPosition;
                            float spaceWidth =  appliancePosition-initPosition;
                            if ("window".equals(leftObject) || "door".equals(leftObject)) {
                                startP = initPosition+Constants.commons.POSITION_WINDOWS_GAP;
                                spaceWidth = spaceWidth-Constants.commons.POSITION_WINDOWS_GAP;
                            }
                            if (spaceWidth >= cabnetMinWidth) {
                                cabinetTbdName = Constants.commons.CANBINET_TBD;
                                Cabinet cabinetWindowTbd = new Cabinet(highCabinetHeight, 0f, cabinetTbdName,
                                        spaceWidth, kitchenInfo.getCeilingHeight(), kitchenInfo.getId(), wall.getId(), cabinetTbdName,
                                        Constants.commons.CANBINET_TYPE_UPPER, startP, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH,leftObject,"appliance", wall.getAngle());
                                cabinetobjectList.add(cabinetWindowTbd);
                            } else if ("highcabinet".equals(leftObject) && spaceWidth > 0) {
                            	cabinetTbdName = Constants.commons.CANBINET_TBD;
                                Cabinet cabinetWindowTbd = new Cabinet(highCabinetHeight, 0f, cabinetTbdName,
                                        spaceWidth, kitchenInfo.getCeilingHeight(), kitchenInfo.getId(), wall.getId(), cabinetTbdName,
                                        Constants.commons.CANBINET_TYPE_UPPER, startP, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH,leftObject,"appliance", wall.getAngle());
                                cabinetobjectList.add(cabinetWindowTbd);
                            }
                        } else {
                            if (endPosition > 3) {
                                cabinetTbdName = Constants.commons.CANBINET_TBD;
                                Cabinet cabinetTBD = new Cabinet(highCabinetHeight, 0f, cabinetTbdName,
                                        endPosition, kitchenInfo.getCeilingHeight(), kitchenInfo.getId(), wall.getId(), cabinetTbdName,
                                        Constants.commons.CANBINET_TYPE_UPPER, initPosition, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH,leftObject,"appliance", wall.getAngle());
                                cabinetobjectList.add(cabinetTBD);
                            } else {
                            	Cabinet cabinetWF3 = new Cabinet(highCabinetHeight, 0f, "WF03",
                                        endPosition, kitchenInfo.getCeilingHeight(), kitchenInfo.getId(), wall.getId(), "WF",
                                        Constants.commons.CANBINET_TYPE_UPPER, initPosition, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH,leftObject,"appliance", wall.getAngle());
                                cabinetobjectList.add(cabinetWF3);
                            }
                        }
                    }
                    if (!hasIntersection) {
                    	initPosition = appliancePositionPNB + applianceWidth;
                        leftObject = "appliance";
                    }                    
                }
                // appliancePos + applianceWidth 之后到wall的space
                float endPosition = wall.getWidth() - initPosition;
                if (endPosition > 0) {
                	String rightObjectT="";
                    float finalInitPosition = initPosition;
                    float finalEndPosition = wall.getWidth();
                    List<ObjectsComponent> windowsInRange = combinedList.stream()
                            .filter(door -> door.getStartposition() != null &&door.getStartposition() >= finalInitPosition && door.getStartposition() <= finalEndPosition)
                            .sorted(Comparator.comparing(ObjectsComponent::getStartposition)) // 按Startposition升序排序
                            .collect(Collectors.toList());
                    if (!windowsInRange.isEmpty()){
                        for (ObjectsComponent window : windowsInRange) {
                            // 判断是window还是door
                            if (window instanceof Window && window.getWidth() >0){
                            	rightObjectT = "window";
                            } else if  (window instanceof Door && window.getWidth() >0){
                            	rightObjectT = "door";
                            } else {
                                // 高柜
                            	rightObjectT = "highcabinet";
                            }
                            cabinetTbdName = Constants.commons.CANBINET_TBD;
                            float startP = initPosition;
                            float spaceWidth = window.getStartposition()-initPosition;
                            if ("window".equals(leftObject) || "door".equals(leftObject)) {
                                startP = initPosition+Constants.commons.POSITION_WINDOWS_GAP;
                                spaceWidth = spaceWidth-Constants.commons.POSITION_WINDOWS_GAP;
                            }

                            if ("window".equals(rightObjectT) || "door".equals(rightObjectT)) {
                                spaceWidth = spaceWidth-Constants.commons.POSITION_WINDOWS_GAP;
                            }
                            if (spaceWidth >= Constants.commons.CABINET_MIN_WIDTH) {
                                Cabinet cabinetWindowTbd = new Cabinet(highCabinetHeight,0f,cabinetTbdName,
                                        spaceWidth,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                                        Constants.commons.CANBINET_TYPE_UPPER, startP, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH,leftObject,rightObjectT, wall.getAngle());
                                cabinetobjectList.add(cabinetWindowTbd);

                            } else if ("highcabinet".equals(rightObjectT) && spaceWidth > 0) {
                            	Cabinet cabinetWindowTbd = new Cabinet(highCabinetHeight,0f,cabinetTbdName,
                                        spaceWidth,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                                        Constants.commons.CANBINET_TYPE_UPPER, startP, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH,leftObject,rightObjectT, wall.getAngle());
                                cabinetobjectList.add(cabinetWindowTbd);
                            }
                            leftObject =rightObjectT;
                            rightObjectT = "";
                            initPosition =  window.getStartposition() + window.getWidth() ;
                        }
                        float startP = initPosition;
                        float spaceWidth =  wall.getWidth()-initPosition;         
                        rightObjectT = rightObjectWall;
                        if ("window".equals(leftObject) || "door".equals(leftObject)) {
                            startP = initPosition+Constants.commons.POSITION_WINDOWS_GAP;
                            spaceWidth = spaceWidth-Constants.commons.POSITION_WINDOWS_GAP;
                        }
                        // 1230 
                        if (spaceWidth >= cabnetMinWidth ) {
                            cabinetTbdName = Constants.commons.CANBINET_TBD;
                            Cabinet cabinetDoorTbd = new Cabinet(highCabinetHeight,0f,cabinetTbdName,
                                    spaceWidth,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                                    Constants.commons.CANBINET_TYPE_UPPER, startP, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH,leftObject,rightObjectWall, wall.getAngle());
                            cabinetobjectList.add(cabinetDoorTbd);
                        } else if ("highcabinet".equals(leftObject) && spaceWidth >0) {
                        	Cabinet cabinetWindowTbd = new Cabinet(highCabinetHeight,0f,cabinetTbdName,
                                    spaceWidth,kitchenInfo.getCeilingHeight(),kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                                    Constants.commons.CANBINET_TYPE_UPPER, startP, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH,leftObject,rightObjectT, wall.getAngle());
                            cabinetobjectList.add(cabinetWindowTbd);
                        }
                    } else {
                        if (endPosition >= cabnetMinWidth) {
                            cabinetTbdName = Constants.commons.CANBINET_TBD;
                            Cabinet cabinetTBD = new Cabinet(highCabinetHeight,0f,cabinetTbdName,
                                    endPosition,kitchenInfo.getCeilingHeight(), kitchenInfo.getId(), wall.getId(),cabinetTbdName,
                                    Constants.commons.CANBINET_TYPE_UPPER, initPosition, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, leftObject, rightObjectWall, wall.getAngle());
                            cabinetobjectList.add(cabinetTBD);
                        }
                    }
                }

            }
            multipleCabinetList.add(cabinetobjectList);
        }

        // UPPER rule List
        // 过滤 type = "upper" 的对象
        List<Cabinetsrule> upperCabinetsRule = cabinetsruleList.stream()
                .filter(cabinetRule -> "upper".equalsIgnoreCase(cabinetRule.getType()))
                .collect(Collectors.toList());
         // 过滤 construction = cabinet的construction 的对象
         String construction = "";
         if (kitchenInfo.getConstruction1() != null && kitchenInfo.getConstruction1().length() >= 3) {
             construction = kitchenInfo.getConstruction1().substring(0, 3);
         } else if (kitchenInfo.getConstruction1() != null) {
             construction = kitchenInfo.getConstruction1();
         }
        
         String constructionT = construction;
         // Distinguish between two categories: framed and frameless.
         if (!"BC1".equals(construction)) {
         	constructionT = "BC2";
         }
         // Make construction final for use in lambda
         final String finalConstruction = constructionT;
         
         // 过滤 construction = cabinet的construction 的对象
         List<Cabinetsrule> filteredCabinetsRule = upperCabinetsRule.stream()
                 .filter(cabinetRule -> {
                     if (cabinetRule.getConstruction() == null) {
                         return false;
                     }
                     String ruleConstruction = cabinetRule.getConstruction().length() >= 3 ? 
                             cabinetRule.getConstruction().substring(0, 3) : cabinetRule.getConstruction();
                     return ruleConstruction.equalsIgnoreCase(finalConstruction);
                 })
                 .sorted(Comparator.comparing(Cabinetsrule::getSpaceWidth, Comparator.reverseOrder()))
                 .collect(Collectors.toList());
        //检查是否有需要衔接的柜子
        //wallid，adjacentwallid
        ArrayList<List<Cabinet>> multipleCabinetConList = designCabinetConnect( kitchenInfo,wallInfoList,  multipleCabinetList, "upper");

        // 拆分宽度，选择合适的柜子
        final float cabnetMinWidthfinal = cabnetMinWidth;
        ArrayList<List<Cabinet>> newMultipleCabinetList = multipleCabinetConList.stream()
                .map(list -> list.stream()
                        .flatMap(cabinet -> {
                            if (Constants.commons.CANBINET_TBD.equals(cabinet.getCabinettype()) && cabinet.getWidth() > 0) {
//                                return getCabinetFromRuleUpper(cabinet, filteredCabinetsRule).stream();
                            	
                                List<Cabinet> generated = getCabinetFromRuleUpper(cabinet, filteredCabinetsRule, lowerCabinetList, kitchenInfo.getConstruction1(), cabnetMinWidthfinal);
                                return generated == null ? Stream.empty() : generated.stream();
                            } else {
                                return Stream.of(cabinet);
                            }
                        })
                        .collect(Collectors.toList()))
                .collect(Collectors.toCollection(ArrayList::new));

     // 如果发现两个WF03连续则合并为一个WF06；
        ArrayList<List<Cabinet>> newMultipleCabinetListBF3 = adjustCabinetBF3(newMultipleCabinetList, "upper");
        
        // 检查开放的墙最开始/结尾的柜子是否为bf/wf，如果是的话就删除
        ArrayList<List<Cabinet>> newMultipleCabinetListBF = adjustCabinetBFWF(newMultipleCabinetListBF3, "upper", kitchenInfo, wallInfoList, null, null, null);        
        
        multipleCabinetList.clear();
        multipleCabinetList.addAll(newMultipleCabinetListBF);
        
        //
        ArrayList<List<Cabinet>> addMultipleCabinetListHigh = new ArrayList();
        if (highCabinetHeight2 > 0) {
        	// Step 1: 构建原始 cornerKey -> 新唯一 cornerKey 的映射
        	Map<String, String> cornerKeyMapping = new HashMap<>();
        	Random random = new Random();

        	for (List<Cabinet> cabinetList : multipleCabinetList) {
        	    for (Cabinet cab : cabinetList) {
        	        String type = cab.getCabinettype();
        	        if ("WBCL".equals(type) || "WBCLD".equals(type) || 
        	            "WBCR".equals(type) || "WBCRD".equals(type)
        	        	||  "WDCD".equals(type) ||  "WDC".equals(type)
						 ||  "WLSD".equals(type) ||  "WLS".equals(type)) {
        	            
        	            String origKey = cab.getCornerKey();
        	            if (origKey != null && !origKey.trim().isEmpty()) {
        	                // 只为尚未映射的原始 key 生成新 key
        	                cornerKeyMapping.computeIfAbsent(origKey, k -> {
        	                    // 保留前8位 + 5位随机数（或用时间戳+计数器更安全）
        	                    String prefix = k.length() >= 8 ? k.substring(0, 8) : k;
        	                    int randNum = 10000 + random.nextInt(90000);
        	                    return prefix + randNum;
        	                });
        	            }
        	        }
        	    }
        	}
        	for (List<Cabinet> cabinetList : multipleCabinetList) {
        		ArrayList<Cabinet> addCabinetListHigh = new ArrayList();
        		
        		 for (Cabinet cabinet : cabinetList) {        			 
        			  
        			 if (!"appliance".equals(cabinet.getCabinettype()) && !"WBR".equals(cabinet.getCabinettype()) &&
        					 !"window".equals(cabinet.getCabinettype()) && !"HOODWBR1".equals(cabinet.getCabinettype())
        					 && !"HOODWBR".equals(cabinet.getCabinettype())) {
        				 Cabinet generateCab = new Cabinet(cabinet);
        				 String cabName = generateCab.getName();
        				 String cabNameN = "";
        				 String cabCornerKey = "";
        				 if ("W".equals(cabinet.getCabinettype())) {
        					 cabNameN = cabName.length() >= 3 ? cabName.substring(0, 3) : cabName;     
        					 cabName = new StringBuilder(cabNameN).append(String.format("%.0f", highCabinetHeight2)).toString();
        				 } else if ("WBCLD".equals(cabinet.getCabinettype()) ||  "WBCL".equals(cabinet.getCabinettype())
        						 ||  "WBCR".equals(cabinet.getCabinettype()) ||  "WBCRD".equals(cabinet.getCabinettype())
        						 ||  "WDCD".equals(cabinet.getCabinettype()) ||  "WDC".equals(cabinet.getCabinettype())
        						 ||  "WLSD".equals(cabinet.getCabinettype()) ||  "WLS".equals(cabinet.getCabinettype())
        						 ) {
        					 String base;
        					 String suffix = "";
        					 String cabNameOri = cabinet.getName();
        					 cabName = generateHighCabinetName(cabNameOri, highCabinetHeight2);
        					 // ✅ 关键：设置新的 cornerKey（如果存在映射）
    			            String origCornerKey = cabinet.getCornerKey();
    			            if (origCornerKey != null) {
    			                String newCornerKey = cornerKeyMapping.get(origCornerKey);
    			                if (newCornerKey != null) {
    			                    generateCab.setCornerKey(newCornerKey);
    			                }
    			                // 如果没有映射（理论上不该发生），可保留原值或设为 null
    			            }
        					 
        				 } else if ("PNW".equals(cabinet.getCabinettype()) ||  "FILLER".equals(cabinet.getCabinettype())
        						 ||  "SP".equals(cabinet.getCabinettype()) ) {
//        					 cabNameN = cabName;
        				 } else {
        					 // ??
        				 }  
        				 generateCab.setName(cabName);
        				 generateCab.setHeight(highCabinetHeight2);
        				 addCabinetListHigh.add(generateCab);  
        			 } else if ("HOODWBR".equals(cabinet.getCabinettype())) {
        				 if ("BC1".equals(construction)) {
        					 Cabinet generateCab = new Cabinet(cabinet);
            				 String cabName = generateCab.getName();
        					 String cabNameN = cabName.length() >= 3 ? cabName.substring(0, 3) : cabName; 
        					 cabName = new StringBuilder(cabNameN).append(String.format("%.0f", 15f)).toString();
        					 generateCab.setName(cabName);
        					 generateCab.setCabinettype("HOODWBR1");
            				 generateCab.setHeight(15f); // 
            				 addCabinetListHigh.add(generateCab); 
  
        				 } else {
        					
        				 }        				 
        			 } else {
        				 
        			 }
        			 addCabinetListHigh.add(cabinet);   
                 }
        		 addMultipleCabinetListHigh.add(addCabinetListHigh);             
        	}
        } else {
        	addMultipleCabinetListHigh = multipleCabinetList;
        }

        for (List<Cabinet> cabinetList : addMultipleCabinetListHigh) {
            // 遍历内层列表（每个Cabinet）
            for (Cabinet cabinet : cabinetList) {
                // 如果Cabinet已经存在（有id），可以进行更新
                // 如果是新Cabinet，可以直接保存
                // 设置construction
            	if (Constants.commons.CANBINET_TYPE_SP.equals(cabinet.getCabinettype()) && cabinet.getWidth() == 0) {
                	cabinet.setWidth(Constants.commons.CANBINET_WIDTH_SPPAD);
                }
            	if (cabinet.getWidth() < 24f && "W".equals(cabinet.getCabinettype())) {
                	float wallWidth = 0;
                	if ("lower".equals(cabinet.getType()) || "upper".equals(cabinet.getType()) || "high".equals(cabinet.getType())) {
                		Wall wall = wallInfoList.stream()
                			    .filter(item -> item.getId() != null && 
                			    		item.getId().equals(cabinet.getWallid()))
                			    .findFirst()
                			    .orElse(null);
                		wallWidth =  wall.getWidth();
                	} 
            		
            		if (wallWidth > 0 ) {
            			if (cabinet.getStartposition() < wallWidth/2) {
	            			cabinet.setName(cabinet.getName() + "R");
	            		} else {
	            			cabinet.setName(cabinet.getName() + "L");
	            		}
            		}	            		
            	}
            	
                cabinet.setConstruction(kitchenInfo.getConstruction1());
                cabinetRepository.save(cabinet);
            }
        }

        // 确定Cabinet，保存DB
        return addMultipleCabinetListHigh;
    }
    
    public static String generateHighCabinetName(String originalName, float highCabinetHeight2) {
        if (originalName == null || originalName.length() < 6) {
            // 至少 WBC + 4数字 = 7字符，但保守处理
            return originalName + String.format("%.0f", highCabinetHeight2);
        }

        // 统一正则：匹配 [WBC/WDC/WLS] + 2位宽 + 2位深 + [L/R]?
        Pattern pattern = Pattern.compile(
            "^(WBC|WDC|WLS)(\\d{2})(\\d{2})([LR])?$"
        );

        Matcher m = pattern.matcher(originalName);
        if (m.matches()) {
            String type = m.group(1);      // "WBC", "WDC", or "WLS"
            String width = m.group(2);     // "30"
            // String depth = m.group(3);  // "15" — 将被替换
            String direction = m.group(4); // "L", "R", or null

            String newHeight = String.format("%.0f", highCabinetHeight2); // e.g., "33"
            return type + width + newHeight + (direction != null ? direction : "");
        }

        // 如果不匹配（异常情况），回退到原始逻辑
        // 例如取前5位 + 高度
        String base = originalName.length() >= 5 ? originalName.substring(0, 5) : originalName;
        return base + String.format("%.0f", highCabinetHeight2);
    }
    
    //放置WP柜子
    public List<Cabinet> getCabinetWP(String sbflag, Cabinet cabinet, List<Cabinetsrule> cabinetsruleList, List<Window> windowList, List<Door> doorList, List<Appliance> applianceList) {
        List<Cabinet> cabinetList = new ArrayList<>();
        float widthSpace = cabinet.getWidth();
        float width = 0;
        float cabHeight = cabinet.getHeight();
        Integer kitchenId = cabinet.getKitchenId();
        Integer wallId = cabinet.getWallid();
        float startPosition = cabinet.getStartposition();
        float startPositionWP = cabinet.getStartposition();
        float rotation = cabinet.getRotation();
        String type = cabinet.getType();
        if (widthSpace ==0) { return null;}
        String cabName = "";
        String panelName = "";
        String panelType = "";
//        int panelFlgLeft = 0;  // 初期0，需要1
        int panelFlg = 0; // 初期0，左侧需要1，右侧需要2
        float panelWidth = 0f;
        String construction = cabinetsruleList.get(0).getConstruction();
        // pnb/sp
        if (construction.startsWith("BC1")) {
        	panelName = Constants.commons.CANBINET_NAME_SP2796;
        	panelType = Constants.commons.CANBINET_TYPE_SP;
        	panelWidth = Constants.commons.CANBINET_WIDTH_SP;
        } else {
        	panelName = Constants.commons.CANBINET_NAME_PNB;
        	panelWidth = Constants.commons.CANBINET_WIDTH_PNB;
        	panelType = Constants.commons.CANBINET_TYPE_PNB;
        }
        float refEnd = 0;
        float refRangeEnd = 0;        
        float refRangeStart = 0;
        float refRangeEndS = 0;        
        Integer refWallid =0;
        
        // 找到ref
        Appliance refA = applianceList.stream()
        	    .filter(appliance -> Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(appliance.getAppliancekind()))
        	    .findFirst()
        	    .orElse(null);
        if (refA != null) {
        	refEnd = refA.getPosition() + refA.getWidth();
            refRangeEnd = refEnd + 36;            
            refRangeStart = Math.max(0, refA.getPosition() - 36);
            refRangeEndS = refA.getPosition();
            refWallid = refA.getWall().getId();        	
        }
        
        List<ObjectsWindowDoor> combinedList = Stream.concat(windowList.stream(), doorList.stream())
                .collect(Collectors.toList());
        final Integer refWallidF = refWallid;
        final float refEndF = refEnd;
        final float refRangeEndF = refRangeEnd;        
        final float refRangeStartF = refRangeStart;
        final float refRangeEndSF = refRangeEndS;
        boolean windowsCheckR = Optional.ofNullable(combinedList)
        	    .orElse(Collections.emptyList())
        	    .stream()
        	    .filter(obj -> Objects.equals(obj.getWall().getId(), refWallidF)) // 只看当前墙的对象
        	    .anyMatch(obj -> {
        	        float startPos = Optional.ofNullable(obj.getStartposition()).orElse(0.0f);
        	        float widthCom = Optional.ofNullable(obj.getWidth()).orElse(0.0f);
        	        float endPosition = startPos + widthCom;
        	        // 判断 [startPos, endPosition] 与 [refEnd, refRangeEnd] 是否重叠
        	        return startPos <= refRangeEndF && endPosition >= refEndF;
        	    });
        
        boolean windowsCheckRS = Optional.ofNullable(combinedList)
        	    .orElse(Collections.emptyList())
        	    .stream()
        	    .filter(obj -> Objects.equals(obj.getWall().getId(), refWallidF)) // 只看当前墙的对象
        	    .anyMatch(obj -> {
        	        float startPos = Optional.ofNullable(obj.getStartposition()).orElse(0.0f);
        	        float widthCom = Optional.ofNullable(obj.getWidth()).orElse(0.0f);
        	        float endPosition = startPos + widthCom;
        	        // 判断 [startPos, endPosition] 与 [refEnd, refRangeEnd] 是否重叠
        	        return startPos <= refRangeEndSF && endPosition >= refRangeStartF;
        	    });
    
        String sbflagAdjust = sbflag;
        if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(cabinet.getLeftobject()) && Constants.commons.CANBINET_TBDWPE.equals(sbflag) && !windowsCheckR) {
        	sbflagAdjust = Constants.commons.CANBINET_TBDWPER;
        } else if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(cabinet.getRightobject()) && Constants.commons.CANBINET_TBDWPS.equals(sbflag) && !windowsCheckRS) {
        	sbflagAdjust = Constants.commons.CANBINET_TBDWPSR;
        } 
        
        float widthCheckW = 0f;
        Integer wpPattern = 0; // 1:放不下WP， 2:两边wf+wp 3：wf+wp +panel+ other 4： 左侧wf+wp 41 : 左侧wf+wp+ panel 5：右侧wp+wf 6：>other+ pad+ wp + wf 7：wp + pad 8：pad + wp 9: pad + wp + pad
        Integer leftRightFlag = 0; // 1 左右都靠墙 2 左侧靠墙，右侧靠ref 3 左侧靠墙，右侧ng 4 右侧靠墙，左侧ref 5 右侧靠墙，左侧ng， 6 两侧ng
        if (( "wall".equals(cabinet.getLeftobject()) || "corner".equals(cabinet.getLeftobject())) && ("wall".equals(cabinet.getRightobject())|| "corner".equals(cabinet.getRightobject()))) {
        	widthCheckW = Constants.commons.WP_WIDTH_PAD_MIN * 2;
        	leftRightFlag = 1;
        	if (widthSpace < 15 + 6) {
        		// 放不下wp
        		wpPattern = 1;
        	} else if (widthSpace >= 15 + 6 && widthSpace < 36 + 6 + 9 + panelWidth ) {
        		// 两边wf+wp
        		wpPattern = 2;
        	} else {
        		// widthSpace >= 36 + 6 + 9 + panelWidth => wf+wp +pad+ other
        		wpPattern = 3;
        	}
        } else if (( "wall".equals(cabinet.getLeftobject()) || "corner".equals(cabinet.getLeftobject())) ) {
        	widthCheckW = Constants.commons.WP_WIDTH_PAD_MIN ;
        	if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(cabinet.getRightobject())) {
        		widthCheckW = widthCheckW + panelWidth;
        		leftRightFlag = 2;
        		if (widthSpace < 15 + 3) {
            		// 放不下wp
        			wpPattern = 1;
            	} else if (widthSpace >= 15 + 3 && widthSpace < 36 + 3 + 9 +panelWidth ) {
            		// 左侧wf+wp
            		wpPattern = 4;
            	} else {
            		// widthSpace >= 36 + 3 + 9 + panelWidth => wf+wp +pad+ other
            		wpPattern = 3;
            		
            	}
        	} else {
        		leftRightFlag = 3;
        		if (widthSpace < 15 + 3 + panelWidth) {
            		// 放不下wp
        			wpPattern = 1;
            	} else if (widthSpace >= 15 + 3 + panelWidth && widthSpace < 36 + 3 + 9 + panelWidth ) {
            		// 左侧wf+wp + panel
            		wpPattern = 41;
            	} else {
            		// widthSpace >= 36 + 3 + 9 + panelWidth => wf+wp +pad+ other
            		wpPattern = 3;
            	}
        	}
        } else if  ("wall".equals(cabinet.getRightobject())|| "corner".equals(cabinet.getRightobject())) {
        	widthCheckW = Constants.commons.WP_WIDTH_PAD_MIN ;
        	if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(cabinet.getLeftobject())) {
        		widthCheckW = widthCheckW + panelWidth;
        		leftRightFlag = 4;
        		if (widthSpace < 15 + 3 ) {
            		// 放不下wp
        			wpPattern = 1;
            	} else if (widthSpace >= 15 + 3  && widthSpace < 36 + 3 + 9 +panelWidth ) {
            		// 右侧wp+wf
            		wpPattern = 5;
            	} else {
            		// widthSpace >= 36 + 3 + 9 + panelWidth =>other+ pad+ wp + wf
            		wpPattern = 6;
            	}
        	} else {
        		leftRightFlag = 5;
        		if (widthSpace < 15 + 3 + panelWidth) {
            		// 放不下wp
        			wpPattern = 1;
            	} else if (widthSpace >= 15 + 3 + panelWidth && widthSpace < 36 + 3 + 9 + panelWidth ) {
            		// 右侧panel +wp+wf
            		wpPattern = 51;
            	} else {
            		// widthSpace >= 36 + 3 + 9 + panelWidth => other+ pad+ wp + wf
            		wpPattern = 6;
            	}
        	}
        } else {
        	widthCheckW = panelWidth * 2;
        	leftRightFlag = 6;
        	if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(cabinet.getLeftobject()) ) {
        		if (widthSpace < 15 + panelWidth) {
            		// 放不下wp
        			wpPattern = 1;
            	} else {
            		// wp + panel
            		wpPattern = 7;
            	}
        	} else if (Constants.commons.APPLIANCES_NAME_REFRIGERATOR.equals(cabinet.getRightobject())) {
        		if (widthSpace < 15 + panelWidth) {
            		// 放不下wp
        			wpPattern = 1;
            	} else {
            		//panel + wp
            		wpPattern = 8;
            	}
        	} else {
        		if (widthSpace < 15 + panelWidth *2) {
            		// 放不下wp
        			wpPattern = 1;
            	} else {
            		//panel + wp + panel
            		wpPattern = 9;
            	}
        	}        	
        } 
        
		float wfWidth = 0;
		String wfName ="WF03";
		Integer leftObjectWFP = 0;  // 1: wf 2:Panel
		Integer rightObjectWFP = 0;  // 1: wf 2:Panel
		Integer flagWF = 0;
		Integer alignFlag = 1;  // 1: left 2:right
		float widthRemain = cabinet.getWidth();
       if (wpPattern == 1) {
    	   	cabinet.setType("lower");
	       	cabinet.setHeight(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT);
	       	cabinetList = getCabinetFromRuleLower(cabinet, cabinetsruleList);
	       	return cabinetList;
       } else if (wpPattern == 2) {
    	   if (widthSpace >= 36 + 6 ) {
    		   leftObjectWFP = 1;
    		   rightObjectWFP = 1;
    		   flagWF = 1;
    		   width = 36f ;
    		   cabName = "WP36" + Math.round(cabHeight);
    		   wfWidth = (widthSpace-width) /2;
    		   if (wfWidth > 3) {
    			   wfName ="WF06";
    		   }	
    	   } else if (widthSpace >= 30 + 6 && widthSpace < 36 + 6) {
    		   width = 30f ;
    		  cabName = "WP30" + Math.round(cabHeight); 
    		   wfWidth = (widthSpace-width) /2;
    		   if (wfWidth > 3) {
    			   wfName ="WF06";
    		   }	
    	   } else if (widthSpace >= 24 + 6 && widthSpace < 30 + 6) {
    		   width = 24f ;
    		   cabName = "WP24" + Math.round(cabHeight); 
    		   wfWidth = (widthSpace-width) /2;
    		   if (wfWidth > 3) {
    			   wfName ="WF06";
    		   }	
    	   } else if (widthSpace >= 18 + 6 && widthSpace < 24 + 6) {
    		   width = 18f ;
    		   cabName = "WP18" + Math.round(cabHeight); 
    		   wfWidth = (widthSpace-width) /2;
    		   if (wfWidth > 3) {
    			   wfName ="WF06";
    		   }	
    	   } else if (widthSpace >= 15 + 6 && widthSpace < 18 + 6) {
    		   width = 15f ;
    		   cabName = "WP15" + Math.round(cabHeight); 
    		   wfWidth = (widthSpace-width) /2;
    		  	
    	   }
    	   startPositionWP = startPosition + wfWidth;
    	   alignFlag = 1;
    	   leftObjectWFP = 1;
    	   rightObjectWFP = 1;
    	   flagWF = 1;
       } else {
    	   if (wpPattern == 3) {      
	    	   widthCheckW = 3 + panelWidth;
	    	   leftObjectWFP = 1;
	    	   rightObjectWFP = 2;    	   
	    	   flagWF = 1;
	    	   alignFlag = 1;
	    	   wfWidth = 3f;
	       } else if (wpPattern == 4) {
	    	   widthCheckW = 3 ;
	    	   leftObjectWFP = 1; 
	    	   flagWF = 1;
	    	   alignFlag = 1;
	       } else if (wpPattern == 41) {
	    	   widthCheckW = 3  + panelWidth;
	    	   leftObjectWFP = 1;
	    	   rightObjectWFP = 2;    	
	    	   flagWF = 1;
	    	   alignFlag = 1;
	       } else if (wpPattern == 5) {
	    	   widthCheckW = 3 ;
	    	   rightObjectWFP = 1;   	
	    	   flagWF = 1;
	    	   alignFlag = 2;
	       } else if (wpPattern == 51) {
	    	   widthCheckW = 3 + panelWidth;
	    	   leftObjectWFP = 2;
	    	   rightObjectWFP = 1;   	
	    	   flagWF = 1;
	    	   alignFlag = 2;
	       } else if (wpPattern == 6) {
	    	   widthCheckW = 3 + panelWidth;
	    	   leftObjectWFP = 2;
	    	   rightObjectWFP = 1;
	    	   flagWF = 1;
	    	   wfWidth = 3f;
	    	   alignFlag = 2;
	       } else if (wpPattern == 7) {
	    	   widthCheckW = panelWidth;
	    	   rightObjectWFP = 2;
	    	   alignFlag = 1;
	       } else if (wpPattern == 8) {
	    	   widthCheckW = panelWidth;
	    	   leftObjectWFP = 2;
	    	   alignFlag = 2;
	       } else if (wpPattern == 9) {
	    	   widthCheckW = panelWidth * 2;
	    	   leftObjectWFP = 2;
	    	   rightObjectWFP = 2;
	    	   if ( Constants.commons.CANBINET_TBDWPS.equals(sbflag)) {
	    		   alignFlag = 1;
	    	   } else  if ( Constants.commons.CANBINET_TBDWPE.equals(sbflag)) {
	    		   alignFlag = 2;
	    	   } else {
	    		   alignFlag = 1;
	    	   }
	    	   
	       } 
    	   if (widthSpace >= 36 + widthCheckW) {
               cabName = "WP36" + Math.round(cabHeight);
               width = 36f ;
           } else if (widthSpace >= 30 + widthCheckW) {
               cabName = "WP30" + Math.round(cabHeight);
               width = 30f ;
           } else if (widthSpace >= 24+widthCheckW) {
               cabName = "WP24" + Math.round(cabHeight);
               width = 24f ;
           } else if (widthSpace >= 18+ widthCheckW) {
               cabName = "WP18" + Math.round(cabHeight);
               width = 18f ;
           } else if (widthSpace >= 15 + widthCheckW) {
               cabName = "WP15" + Math.round(cabHeight);
               width = 15f ;
           } else {
           	// 放不下wp
           	cabinet.setType("lower");
           	cabinet.setHeight(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT);
           	cabinetList = getCabinetFromRuleLower(cabinet, cabinetsruleList);
           	return cabinetList;
           }
    	   if (flagWF == 1) {
    		   if (wpPattern == 41 || wpPattern == 51) {
    			   wfWidth = widthSpace - width - panelWidth; 
    		   } else if (wpPattern == 4 || wpPattern == 5) {
    			   wfWidth = widthSpace - width - widthCheckW + 3f; 
    		   }
	           	
	            if (wfWidth > 3) {
	       			wfName ="WF06";
	       		}
	            if (wpPattern == 5 || wpPattern == 51 || wpPattern == 6) {
	            	startPositionWP = startPosition + cabinet.getWidth() - wfWidth - width ;
	            } else {
	            	 startPositionWP = startPosition + wfWidth;
	            }
	           
           } else {
        	   if (wpPattern == 7 ) {
	            	startPositionWP = startPosition ;
	            }  else if (wpPattern == 8 ) {
	            	startPositionWP = startPosition + cabinet.getWidth() - width ;
	            }  else {
	            	if ( Constants.commons.CANBINET_TBDWPS.equals(sbflag)) {
	            		startPositionWP = startPosition  + panelWidth;
	  	    	   } else  if ( Constants.commons.CANBINET_TBDWPE.equals(sbflag)) {
	  	    		 startPositionWP = startPosition + cabinet.getWidth() - panelWidth - width ;
	  	    	   } else {
	  	    		 startPositionWP = startPosition  + panelWidth;
	  	    	   }
	            }
           }
       }        
          
        String leftObject = cabinet.getLeftobject();
        String rightObject = cabinet.getRightobject() ;
        String leftOther = cabinet.getLeftobject();;
        String rightOther = cabinet.getRightobject() ;
        float startPositionOther = 0;
        if (alignFlag == 1) {
        	if (leftObjectWFP ==1) {
        		if (wfWidth <= 6f) {
        			Cabinet cabinetWF = new Cabinet(cabHeight,0f,wfName,
                            wfWidth,0,kitchenId, wallId,"WF",
                            Constants.commons.CANBINET_TYPE_HIGH, startPosition , 24, rotation,cabinet.getLeftobject(),"");
                    cabinetList.add(cabinetWF);
        		} else {
        			if (wfWidth > 6f && wfWidth <= 9f)  {
        				Cabinet cabinetWF1 = new Cabinet(cabHeight,0f,"WF06",
                                6f,0,kitchenId, wallId,"WF",
                                Constants.commons.CANBINET_TYPE_HIGH, startPosition , 24, rotation,cabinet.getLeftobject(),"");
                        cabinetList.add(cabinetWF1);
                        Cabinet cabinetWF2 = new Cabinet(cabHeight,0f,"WF03",
                                wfWidth - 6f ,0,kitchenId, wallId,"WF",
                                Constants.commons.CANBINET_TYPE_HIGH, startPosition + 6f , 24, rotation,"","");
                        cabinetList.add(cabinetWF2);
        			} else {
        				Cabinet cabinetWF1 = new Cabinet(cabHeight,0f,"WF06",
                                6f,0,kitchenId, wallId,"WF",
                                Constants.commons.CANBINET_TYPE_HIGH, startPosition , 24, rotation,cabinet.getLeftobject(),"");
                        cabinetList.add(cabinetWF1);
                        Cabinet cabinetWF2 = new Cabinet(cabHeight,0f,"WF06",
                                wfWidth - 6f ,0,kitchenId, wallId,"WF",
                                Constants.commons.CANBINET_TYPE_HIGH, startPosition + 6f , 24, rotation,"","");
                        cabinetList.add(cabinetWF2);
        			}
        			
        		}
   			 	
                leftObject = "";
                widthRemain = widthRemain - wfWidth;
	   		} else if (leftObjectWFP ==2) {
	   			Cabinet cabinetPanelS = new Cabinet(cabHeight,0f,panelName,
	   	 				panelWidth,0,kitchenId, wallId,panelType,
	   	                 Constants.commons.CANBINET_TYPE_HIGH, startPosition   , 24, rotation,cabinet.getLeftobject(),"");
	   	         cabinetList.add(cabinetPanelS); 
	   	         leftObject = "";
	   	         widthRemain = widthRemain - panelWidth;
	   		} 
     		if (rightObjectWFP ==1) {
     			widthRemain = widthRemain - wfWidth;
     			String rightT = null;
     			if (widthRemain - width > 0) {
     				rightT = "";     				
     			} else {
     				rightT = cabinet.getRightobject();
     			}
     			if (wfWidth <= 6f) {
        			Cabinet cabinetWF = new Cabinet(cabHeight,0f,wfName,
                            wfWidth,0,kitchenId, wallId,"WF",
                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP + width , 24, rotation,"",rightT);
                    cabinetList.add(cabinetWF);
        		} else {
	     			if (wfWidth > 6f && wfWidth <= 9f)  {
	    				Cabinet cabinetWF1 = new Cabinet(cabHeight,0f,"WF03",
	                            3f,0,kitchenId, wallId,"WF",
	                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP + width , 24, rotation,"","");
	                    cabinetList.add(cabinetWF1);
	                    Cabinet cabinetWF2 = new Cabinet(cabHeight,0f,"WF06",
	                            wfWidth - 3f ,0,kitchenId, wallId,"WF",
	                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP + width + 3f , 24, rotation,"",rightT);
	                    cabinetList.add(cabinetWF2);
	    			} else {
	    				Cabinet cabinetWF1 = new Cabinet(cabHeight,0f,"WF06",
	                            6f,0,kitchenId, wallId,"WF",
	                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP + width , 24, rotation,"","");
	                    cabinetList.add(cabinetWF1);
	                    Cabinet cabinetWF2 = new Cabinet(cabHeight,0f,"WF06",
	                            wfWidth - 6f ,0,kitchenId, wallId,"WF",
	                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP + width + 6f , 24, rotation,"",rightT);
	                    cabinetList.add(cabinetWF2);
	    			}
        		}
     			
                rightObject = "";
	   		} else if (rightObjectWFP ==2) {
	   			widthRemain = widthRemain - panelWidth;
     			String rightT = null;
     			if (widthRemain > 0) {
     				rightT = "";
     			} else {
     				rightT = cabinet.getRightobject();
     			}
	   			Cabinet cabinetPanel = new Cabinet(cabHeight,0f,panelName,
	   	  				panelWidth,0,kitchenId, wallId,panelType,
	   	                  Constants.commons.CANBINET_TYPE_HIGH, startPositionWP + width , 24, rotation,"",rightT);
	   	        cabinetList.add(cabinetPanel); 
	   	     rightObject = "";

	   		} 
     		Cabinet cabinetWP = new Cabinet(cabHeight,0f,cabName,
                    width,0,kitchenId, wallId,"WP",
                    Constants.commons.CANBINET_TYPE_HIGH, startPositionWP, 24, rotation,leftObject,rightObject);
    		cabinetList.add(cabinetWP); 
    		widthRemain = widthRemain - width;
    		startPositionOther = startPosition + cabinet.getWidth() - widthRemain;
    		leftOther = "";
        } else {
        	if (rightObjectWFP ==1) {
        		if (wfWidth <= 6f) {
        			Cabinet cabinetWF = new Cabinet(cabHeight,0f,wfName,
                            wfWidth,0,kitchenId, wallId,"WF",
                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP + width , 24, rotation,"",cabinet.getRightobject());
                    cabinetList.add(cabinetWF);
        		} else {
	        		if (wfWidth > 6f && wfWidth <= 9f)  {
	    				Cabinet cabinetWF1 = new Cabinet(cabHeight,0f,"WF03",
	                            3f,0,kitchenId, wallId,"WF",
	                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP + width , 24, rotation,"","");
	                    cabinetList.add(cabinetWF1);
	                    Cabinet cabinetWF2 = new Cabinet(cabHeight,0f,"WF06",
	                            wfWidth - 3f ,0,kitchenId, wallId,"WF",
	                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP + width + 3f , 24, rotation,"",cabinet.getRightobject());
	                    cabinetList.add(cabinetWF2);
	    			} else {
	    				Cabinet cabinetWF1 = new Cabinet(cabHeight,0f,"WF06",
	                            6f,0,kitchenId, wallId,"WF",
	                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP + width , 24, rotation,"","");
	                    cabinetList.add(cabinetWF1);
	                    Cabinet cabinetWF2 = new Cabinet(cabHeight,0f,"WF06",
	                            wfWidth - 6f ,0,kitchenId, wallId,"WF",
	                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP + width + 6f , 24, rotation,"",cabinet.getRightobject());
	                    cabinetList.add(cabinetWF2);
	    			}
        		}
	                rightObject = "";
	                widthRemain = widthRemain - wfWidth;
	   		} else if (rightObjectWFP ==2) {
	   			Cabinet cabinetPanel = new Cabinet(cabHeight,0f,panelName,
	   	  				panelWidth,0,kitchenId, wallId,panelType,
	   	                  Constants.commons.CANBINET_TYPE_HIGH, startPositionWP + width  , 24, rotation,"",cabinet.getRightobject());
	   	        cabinetList.add(cabinetPanel); 
	   	        rightObject = "";
	   	        widthRemain = widthRemain - panelWidth;
	   		} 
        	if (leftObjectWFP ==1) {
        		widthRemain = widthRemain - wfWidth;
     			String leftT = null;
     			if (widthRemain - width > 0) {
     				leftT = "";
     			} else {
     				leftT = cabinet.getLeftobject();
     			}
     			if (wfWidth <= 6f) {
        			Cabinet cabinetWF = new Cabinet(cabHeight,0f,wfName,
                            wfWidth,0,kitchenId, wallId,"WF",
                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP - wfWidth , 24, rotation,leftT,"");
                    cabinetList.add(cabinetWF);
        		} else {
	     			if (wfWidth > 6f && wfWidth <= 9f)  {
	    				Cabinet cabinetWF1 = new Cabinet(cabHeight,0f,"WF06",
	                            6f,0,kitchenId, wallId,"WF",
	                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP  - wfWidth , 24, rotation,leftT,"");
	                    cabinetList.add(cabinetWF1);
	                    Cabinet cabinetWF2 = new Cabinet(cabHeight,0f,"WF03",
	                            wfWidth - 6f ,0,kitchenId, wallId,"WF",
	                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP  - wfWidth + 6f , 24, rotation,"","");
	                    cabinetList.add(cabinetWF2);
	    			} else {
	    				Cabinet cabinetWF1 = new Cabinet(cabHeight,0f,"WF06",
	                            6f,0,kitchenId, wallId,"WF",
	                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP  - wfWidth , 24, rotation,leftT,"");
	                    cabinetList.add(cabinetWF1);
	                    Cabinet cabinetWF2 = new Cabinet(cabHeight,0f,"WF06",
	                            wfWidth - 6f ,0,kitchenId, wallId,"WF",
	                            Constants.commons.CANBINET_TYPE_HIGH, startPositionWP  - wfWidth + 6f , 24, rotation,"","");
	                    cabinetList.add(cabinetWF2);
	    			}
        		}
     			
	   			 
	                leftObject = "";
	   		} else if (leftObjectWFP ==2) {
	   			widthRemain = widthRemain - panelWidth;
     			String leftT = null;
     			if (widthRemain > 0) {
     				leftT = "";     				
     			}  else {
     				leftT = cabinet.getLeftobject();
     			}
	   			Cabinet cabinetPanelS = new Cabinet(cabHeight,0f,panelName,
	   	 				panelWidth,0,kitchenId, wallId,panelType,
	   	                 Constants.commons.CANBINET_TYPE_HIGH, startPositionWP  - panelWidth   , 24, rotation,leftT,"");
	   	         cabinetList.add(cabinetPanelS); 
	   	      leftObject = "";
	   		} 
	        Cabinet cabinetWP = new Cabinet(cabHeight,0f,cabName,
	                   width,0,kitchenId, wallId,"WP",
	                   Constants.commons.CANBINET_TYPE_HIGH, startPositionWP, 24, rotation,leftObject,rightObject);
	   		cabinetList.add(cabinetWP); 
	   		widthRemain = widthRemain - width;
	   		startPositionOther = startPosition ;
	   		rightOther = "";
        }
        

       
        List<Cabinet> cabinetListR = new ArrayList<>();
        List<Cabinetsrule> lowerCabinets = cabinetsruleList.stream()
                .filter(cabinetR -> "lower".equalsIgnoreCase(cabinetR.getType()))
                .collect(Collectors.toList());
        if (widthRemain < 9+panelWidth && (leftOther.equals("endwall") || rightOther.equals("endwall"))) {
        	// 边界同时小于9不需要cabinet
        } else {
        	Cabinet generateCab = new Cabinet(cabinet);
            generateCab.setWidth(widthRemain);
            generateCab.setStartposition(startPositionOther);
            generateCab.setLeftobject(leftOther);
            generateCab.setRightobject(rightOther);
            generateCab.setHeight(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT);
            generateCab.setType(Constants.commons.CANBINET_TYPE_LOWER);
            cabinetListR  = getCabinetFromRuleLower(generateCab, lowerCabinets);  
            if (cabinetListR != null) {
            	cabinetList.addAll(cabinetListR);
            }
        }
        
        return cabinetList;
		
    }
    public List<Cabinet> getCabinetSB(String sbflag, Cabinet cabinet, List<Cabinetsrule> cabinetsruleList ) {
        List<Cabinet> cabinetList = new ArrayList<>();
        float widthSpace = cabinet.getWidth();
        Integer kitchenId =  cabinet.getKitchenId();
        Integer wallId = cabinet.getWallid();
        float startPosition = cabinet.getStartposition();
        float rotation = cabinet.getRotation();
        String type = cabinet.getType();
        String leftObject = cabinet.getLeftobject();
        String rightObject = cabinet.getRightobject();
        float baseCabHeight = Constants.commons.BASE_CABINET_DEFAULT_HEIGHT;
        float ceilingHeight = cabinet.getCeilingHeight();
        if (widthSpace ==0) { return null;}
        if ( Constants.commons.CANBINET_TBD_SBBACK.equals(sbflag)) {
        	leftObject = "";
            if (widthSpace >= 51) {
                Cabinet cabinetSB = new Cabinet(baseCabHeight,0f,Constants.commons.CANBINET_NAME_SB36,
                        Constants.commons.CANBINET_WIDTH_SB36,ceilingHeight,kitchenId, wallId,Constants.commons.CANBINET_TYPE_SB,
                        type, startPosition, 24, rotation, cabinet.getLeftobject(),"");
                cabinetList.add(cabinetSB);
                Cabinet cabinetTB = new Cabinet(baseCabHeight,0f,Constants.commons.CANBINET_NAME_TB15,
                        Constants.commons.CANBINET_WIDTH_TB15,ceilingHeight,kitchenId, wallId,Constants.commons.CANBINET_TYPE_TB,
                        type, startPosition + Constants.commons.CANBINET_WIDTH_SB36, 24, rotation,"","");
                cabinetList.add(cabinetTB);
                widthSpace = widthSpace - Constants.commons.CANBINET_WIDTH_SB36 - Constants.commons.CANBINET_WIDTH_TB15;
                startPosition = startPosition + Constants.commons.CANBINET_WIDTH_SB36 + Constants.commons.CANBINET_WIDTH_TB15;
            } else if (widthSpace >= 45){
                Cabinet cabinetSB = new Cabinet(baseCabHeight,0f,Constants.commons.CANBINET_NAME_SB30,
                        Constants.commons.CANBINET_WIDTH_SB30,ceilingHeight,kitchenId, wallId,Constants.commons.CANBINET_TYPE_SB,
                        type, startPosition, 24, rotation,cabinet.getLeftobject(),"");
                cabinetList.add(cabinetSB);
                if (widthSpace -Constants.commons.CANBINET_WIDTH_SB30 >= Constants.commons.CANBINET_WIDTH_TB15) {
                	Cabinet cabinetTB = new Cabinet(baseCabHeight,0f,Constants.commons.CANBINET_NAME_TB15,
                            Constants.commons.CANBINET_WIDTH_TB15,ceilingHeight,kitchenId, wallId,Constants.commons.CANBINET_TYPE_TB,
                            type, startPosition + Constants.commons.CANBINET_WIDTH_SB30, 24, rotation,"","");
                    cabinetList.add(cabinetTB);
                    widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB30 - Constants.commons.CANBINET_WIDTH_TB15;
                    startPosition = startPosition + Constants.commons.CANBINET_WIDTH_SB30 + Constants.commons.CANBINET_WIDTH_TB15;
                } else {
                	widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB30 ;
                	startPosition = startPosition + Constants.commons.CANBINET_WIDTH_SB30 ;
                }
            } else if (widthSpace >= 42){
            	Cabinet cabinetSB = new Cabinet(baseCabHeight,0f,Constants.commons.CANBINET_NAME_SB42,
                        Constants.commons.CANBINET_WIDTH_SB42,ceilingHeight,kitchenId, wallId,Constants.commons.CANBINET_TYPE_SB,
                        type, startPosition, 24, rotation,cabinet.getLeftobject(),"");
                cabinetList.add(cabinetSB);
                widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB42 ;
            	startPosition = startPosition + Constants.commons.CANBINET_WIDTH_SB42 ;
            	
            } else if (widthSpace >= 36){
            	Cabinet cabinetSB = new Cabinet(baseCabHeight,0f,Constants.commons.CANBINET_NAME_SB36,
                        Constants.commons.CANBINET_WIDTH_SB36,ceilingHeight,kitchenId, wallId,Constants.commons.CANBINET_TYPE_SB,
                        type, startPosition, 24, rotation,cabinet.getLeftobject(),"");
                cabinetList.add(cabinetSB);
                widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB36 ;
            	startPosition = startPosition + Constants.commons.CANBINET_WIDTH_SB36 ;
            } else if (widthSpace >= 33){
            	Cabinet cabinetSB = new Cabinet(baseCabHeight,0f,Constants.commons.CANBINET_NAME_SB33,
                        Constants.commons.CANBINET_WIDTH_SB33,ceilingHeight,kitchenId, wallId,Constants.commons.CANBINET_TYPE_SB,
                        type, startPosition, 24, rotation,cabinet.getLeftobject(),"");
                cabinetList.add(cabinetSB);
                widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB33 ;
            	startPosition = startPosition + Constants.commons.CANBINET_WIDTH_SB33 ;
            }else if (widthSpace >= 30){
            	Cabinet cabinetSB = new Cabinet(baseCabHeight,0f,Constants.commons.CANBINET_NAME_SB30,
                        Constants.commons.CANBINET_WIDTH_SB30,ceilingHeight,kitchenId, wallId,Constants.commons.CANBINET_TYPE_SB,
                        type, startPosition, 24, rotation,cabinet.getLeftobject(),"");
                cabinetList.add(cabinetSB);
                widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB30 ;
            	startPosition = startPosition + Constants.commons.CANBINET_WIDTH_SB30 ;
            }
        } else if (Constants.commons.CANBINET_TBD_SBFRONT.equals(sbflag)) {
        	rightObject = "";
            if (widthSpace >= 51) {
                float cabinetP = startPosition+widthSpace-Constants.commons.CANBINET_WIDTH_SB36;
                //startPosition = startPosition + Constants.commons.CANBINET_WIDTH_SB36;
                Cabinet cabinetSB = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f, Constants.commons.CANBINET_NAME_SB36,
                        Constants.commons.CANBINET_WIDTH_SB36,ceilingHeight,kitchenId, wallId, Constants.commons.CANBINET_TYPE_SB,
                        type, cabinetP, 24, rotation,"",cabinet.getRightobject());
                cabinetList.add(cabinetSB);
                cabinetP = cabinetP - Constants.commons.CANBINET_WIDTH_TB15;
                Cabinet cabinetTB = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f,Constants.commons.CANBINET_NAME_TB15,
                        Constants.commons.CANBINET_WIDTH_TB15,ceilingHeight,kitchenId, wallId,Constants.commons.CANBINET_TYPE_TB,
                        type, cabinetP, 24, rotation,"","");
                cabinetList.add(cabinetTB);
                widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB36 - Constants.commons.CANBINET_WIDTH_TB15;
            } else if (widthSpace >= 45){
                float cabinetP = startPosition+widthSpace-Constants.commons.CANBINET_WIDTH_SB30;
                //startPosition = startPosition + Constants.commons.CANBINET_WIDTH_SB30;
                Cabinet cabinetSB = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f, Constants.commons.CANBINET_NAME_SB30,
                        Constants.commons.CANBINET_WIDTH_SB30,ceilingHeight,kitchenId, wallId, Constants.commons.CANBINET_TYPE_SB,
                        type, cabinetP, 24, rotation,"",cabinet.getRightobject());
                cabinetList.add(cabinetSB);
                cabinetP = cabinetP - Constants.commons.CANBINET_WIDTH_TB15;
                if (widthSpace -Constants.commons.CANBINET_WIDTH_SB30 >= Constants.commons.CANBINET_WIDTH_TB15) {
                	 Cabinet cabinetTB = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f,Constants.commons.CANBINET_NAME_TB15,
                             Constants.commons.CANBINET_WIDTH_TB15,ceilingHeight,kitchenId, wallId,Constants.commons.CANBINET_TYPE_TB,
                             type, cabinetP, 24, rotation,"","");
                     cabinetList.add(cabinetTB);
                     widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB30 - Constants.commons.CANBINET_WIDTH_TB15;
                } else {
                	widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB30 ;
                }
                
            } else if (widthSpace >= 42){
            	float cabinetP = startPosition+widthSpace-Constants.commons.CANBINET_WIDTH_SB42;
            	Cabinet cabinetSB = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f, Constants.commons.CANBINET_NAME_SB42,
                        Constants.commons.CANBINET_WIDTH_SB42,ceilingHeight,kitchenId, wallId, Constants.commons.CANBINET_TYPE_SB,
                        type, cabinetP, 24, rotation,"",cabinet.getRightobject());
                cabinetList.add(cabinetSB);
                widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB42 ;
            	
            } else if (widthSpace >= 36){
            	float cabinetP = startPosition+widthSpace-Constants.commons.CANBINET_WIDTH_SB36;
            	Cabinet cabinetSB = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f, Constants.commons.CANBINET_NAME_SB36,
                        Constants.commons.CANBINET_WIDTH_SB36,ceilingHeight,kitchenId, wallId, Constants.commons.CANBINET_TYPE_SB,
                        type, cabinetP, 24, rotation,"",cabinet.getRightobject());
                cabinetList.add(cabinetSB);
                widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB36 ;
            } else if (widthSpace >= 33){
            	float cabinetP = startPosition+widthSpace-Constants.commons.CANBINET_WIDTH_SB33;
            	Cabinet cabinetSB = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f, Constants.commons.CANBINET_NAME_SB33,
                        Constants.commons.CANBINET_WIDTH_SB33,ceilingHeight,kitchenId, wallId, Constants.commons.CANBINET_TYPE_SB,
                        type, cabinetP, 24, rotation,"",cabinet.getRightobject());
                cabinetList.add(cabinetSB);
                widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB33 ;
            }else if (widthSpace >= 30){
            	float cabinetP = startPosition+widthSpace-Constants.commons.CANBINET_WIDTH_SB30;
            	Cabinet cabinetSB = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f, Constants.commons.CANBINET_NAME_SB30,
                        Constants.commons.CANBINET_WIDTH_SB30,ceilingHeight,kitchenId, wallId, Constants.commons.CANBINET_TYPE_SB,
                        type, cabinetP, 24, rotation,"",cabinet.getRightobject());
                cabinetList.add(cabinetSB);
                widthSpace = widthSpace -Constants.commons.CANBINET_WIDTH_SB30 ;
            }
        }

        // 过滤 type = "Lower" 的对象
        List<Cabinetsrule> lowerCabinets = cabinetsruleList.stream()
                .filter(cabinetR -> "lower".equalsIgnoreCase(cabinetR.getType()))
                .collect(Collectors.toList());
        // Cabinet
        Cabinet generateCab = new Cabinet(cabinet);
        generateCab.setLeftobject(leftObject);
        generateCab.setRightobject(rightObject);
        generateCab.setWidth(widthSpace);
        generateCab.setStartposition(startPosition);
        generateCab.setHeight(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT);
        generateCab.setType(type);
        List<Cabinet> cabinetListR = new ArrayList<>();
        cabinetListR = getCabinetFromRuleLower(generateCab, lowerCabinets);  
        
//        cabinetListR = getCabinetFromRule("lower", widthSpace, Constants.commons.BASE_CABINET_DEFAULT_HEIGHT, lowerCabinets, kitchenId,  wallId,  startPosition, type, cabinet.getLeftobject(), cabinet.getRightobject(),  rotation, cabinet.getDepth());
        if (cabinetListR !=null) {
            cabinetList.addAll(cabinetListR);
        }
        return cabinetList;
    }
    // 为了尽量对齐上下柜子
    public static class CabinetRange {
        float start;
        float width;

        public CabinetRange(float start, float width) {
            this.start = start;
            this.width = width;
        }

        @Override
        public String toString() {
            return "Range(" + start + ", " + width + ")";
        }
    }

    public static class CandidateCabinet {
        private String name;
        private float width;

        public CandidateCabinet(String name, float width) {
            this.name = name;
            this.width = width;
        }

        public String getName() { return name; }
        public float getWidth() { return width; }

        @Override
        public String toString() {
            return name + "(" + width + ")";
        }
    }

    public static class CabinetCaculate {
        private String name;
        private float startPosition;
        private float width;

        public CabinetCaculate(String name, float startPosition, float width) {
            this.name = name;
            this.startPosition = startPosition;
            this.width = width;
        }

        public String getName() { return name; }
        public float getStartPosition() { return startPosition; }
        public float getWidth() { return width; }
        public void setName(String name) {
        	this.name = name;
        }

        @Override
        public String toString() {
            return name + " start=" + startPosition + " width=" + width;
        }
    }

    public static class UpperCabinetResult {
        List<CabinetCaculate> upperCabinets;
        List<CabinetRange> remainingRanges;

        public UpperCabinetResult(List<CabinetCaculate> upperCabinets, List<CabinetRange> remainingRanges) {
            this.upperCabinets = upperCabinets;
            this.remainingRanges = remainingRanges;
        }
    }

    // ============ 主方法 ============
    public static List<CabinetCaculate> arrangeUpperCabinets(
            List<CabinetCaculate> lowerCabinets,
            List<CabinetRange> upperRanges,
            List<CandidateCabinet> candidateUpper) {

        List<CabinetCaculate> upperCabinets = new ArrayList<>();

        // helper: 填充一个区段
        BiConsumer<Float, Float> tryFillSegment = (segStart, segWidth) -> {
            float pos = segStart;
            float remain = segWidth;

            // 候选柜按宽度从大到小
            List<CandidateCabinet> sorted = new ArrayList<>(candidateUpper);
            sorted.sort((a, b) -> Float.compare(b.getWidth(), a.getWidth()));

            while (remain > 1e-6f) {
                boolean placed = false;
                for (CandidateCabinet cand : sorted) {
                    float w = cand.getWidth();
                    if (w <= remain + 1e-6f) {
                        upperCabinets.add(new CabinetCaculate(cand.getName(), pos, w));
                        System.out.println("放置上柜: " + cand + " at " + pos);
                        pos += w;
                        remain -= w;
                        placed = true;
                        break;
                    }
                }
                if (!placed) break; // 放不下任何柜子
            }

            if (remain > 1e-6f) {
//                remainingRanges.add(new CabinetRange(pos, remain));
            	upperCabinets.add(new CabinetCaculate("tbd", pos, remain));
                System.out.println("剩余区段: start=" + pos + " width=" + remain);
            }
        };

        for (CabinetRange upperRange : upperRanges) {
            float rangeStart = upperRange.start;
            float rangeEnd = rangeStart + upperRange.width;

            // 找和这个 upperRange 有交集的下柜
            List<CabinetCaculate> intersectLower = new ArrayList<>();
            for (CabinetCaculate lower : lowerCabinets) {
                float lowerStart = lower.getStartPosition();
                float lowerEnd = lowerStart + lower.getWidth();
//                if (Math.min(rangeEnd, lowerEnd) - Math.max(rangeStart, lowerStart) > 0) {
                if (rangeEnd >= lowerEnd && rangeStart <= lowerStart) {
                    intersectLower.add(lower);
                }
            }
            intersectLower.sort(Comparator.comparingDouble(CabinetCaculate::getStartPosition));

            float currentPos = rangeStart;

            if (!intersectLower.isEmpty()) {
                for (CabinetCaculate lower : intersectLower) {
                    float lowerStart = lower.getStartPosition();
                    float lowerEnd = lowerStart + lower.getWidth();

                    // 如果有 gap (rangeStart 到 lowerStart 之间)
                    if (currentPos < lowerStart) {
                        float gap = Math.min(rangeEnd, lowerStart) - currentPos;
                        if (gap > 1e-6f) {
                            tryFillSegment.accept(currentPos, gap);
                            currentPos += gap;
                        }
                    }

                    float overlapStart = Math.max(currentPos, lowerStart);
                    float overlapEnd = Math.min(rangeEnd, lowerEnd);
                    if (overlapEnd > overlapStart) {
                        float width = overlapEnd - overlapStart;
                        tryFillSegment.accept(overlapStart, width);
                        currentPos = overlapEnd;
                    }
                }
            }

            // 如果尾部还有剩余
            if (currentPos < rangeEnd) {
                tryFillSegment.accept(currentPos, rangeEnd - currentPos);
            }
        }

        upperCabinets.sort(Comparator.comparingDouble(CabinetCaculate::getStartPosition));
        return upperCabinets;
    }
	 // ---------- 工具函数 ----------
	
	 // rule 匹配
    private Optional<Cabinetsrule> findClosestSmallerRule(double width, List<Cabinetsrule> rules) {
        return rules.stream()
                .filter(r -> r.getCabinetWidth() <= width)                      // rule.width < targetWidth
                .max(Comparator.comparingDouble(Cabinetsrule::getCabinetWidth)); // 找最大（最接近 width）
    }

	
	 // 创建合并对象
	 private CabinetCaculate createMerged(String name, float startPosition, float totalWidth) {
		    return new CabinetCaculate(name, startPosition, totalWidth);
	}
    // ============ 主方法 ============
    public List<CabinetCaculate> adjustArrange(
            List<CabinetCaculate> resultArrange,
            List<Cabinetsrule> cabinetsruleList, float cabnetMinWidth) {

        List<CabinetCaculate> adjusted = new ArrayList<>();
        int i = 0;

        while (i < resultArrange.size()) {
            CabinetCaculate current = resultArrange.get(i);

            // 满足 tbd + width < 6 的判断
            if ("tbd".equals(current.getName()) && current.getWidth() <= cabnetMinWidth && current.getWidth() >= 3f) {
//            if ("tbd".equals(current.getName()) ) {
                CabinetCaculate left = (i > 0) ? resultArrange.get(i - 1) : null;
                CabinetCaculate right = (i < resultArrange.size() - 1)
                        ? resultArrange.get(i + 1)
                        : null;
                boolean merged = false;                
                
                if (!merged && left != null) { 
                    double totalL = left.getWidth() + current.getWidth(); 
                    Optional<Cabinetsrule> match = findClosestSmallerRule(totalL, cabinetsruleList); 
                    if (match.isPresent()) { 
                        float ruleWidth = match.get().getCabinetWidth(); // ------ 新增：匹配结果不允许等于 左 或 右 ------ 
                        if ( Math.round(ruleWidth) == Math.round(left.getWidth()) ) { 
                            adjusted.add(current); 
                            i++; 
                            continue; 
                        } else { 
                            adjusted.remove(adjusted.size() - 1); // 移除左 
                            float start = left.getStartPosition(); 
                            float totalWidth = left.getWidth() + current.getWidth(); 
                            CabinetCaculate mergedObj = createMerged("tbd", start, totalWidth); 
                            adjusted.add(mergedObj); 
                            i++; // 跳过   current 
                            merged = true; 
                        } 
                    } 
                 }

              if (merged) {
                  continue; // 下一轮
              }
                
//
//                // ③ 尝试 当前 + 右
//                if (!merged && right != null) {
//                    double totalR = current.getWidth() + right.getWidth();
//                    Optional<Cabinetsrule> match = findClosestSmallerRule(totalR, cabinetsruleList);
//                    if (match.isPresent()) {
//                    	float ruleWidth = match.get().getCabinetWidth();
//                    	 // ------ 新增：匹配结果不允许等于 左 或 右 ------
//                        if (Math.round(ruleWidth) == Math.round(right.getWidth())) {
//                        	 adjusted.add(current);
//                             i++;
//                            continue;
//                        } else {
//	                    	float start = current.getStartPosition();
//	                    	float totalWidth = current.getWidth() + right.getWidth();
//	                    	CabinetCaculate mergedObj = createMerged("tbd", start, totalWidth);
//	                        adjusted.add(mergedObj);
//	                        i += 2; // 跳过 current 和 right
//	                        merged = true;
//                        }
//                    }
//                }
//
//                if (merged) {
//                    continue; // 下一轮
//                }


//                float start = current.getStartPosition();
                float totalWidth = current.getWidth();
                int j = i + 1;
                int k = 0;  // 用来判断是否第一次

                while (j < resultArrange.size()) {
                    CabinetCaculate next = resultArrange.get(j);                   
                    // 第二次以后必须检查 tbd
                    if (k > 0 && !"tbd".equals(next.getName())) {
                        break;
                    }
                    totalWidth += next.getWidth();
                    j++;
                    if (!"tbd".equals(right.getName())) {
                    	k++;
                    } else if (!"tbd".equals(next.getName())) {
                    	k++;
                    }
                }

                // ---------- 如果 tbd block 长度 > 1，就合并 ----------
                Optional<Cabinetsrule> match = findClosestSmallerRule(totalWidth, cabinetsruleList);
	              if (match.isPresent()) {
	              	float ruleWidth = match.get().getCabinetWidth();
	              	 // ------ 新增：匹配结果不允许等于 左 或 右 ------
	                  if (Math.round(ruleWidth) == Math.round(right.getWidth())) {
	                  	 adjusted.add(current);
	                       i++;
	                      continue;
	                  } else {
	                  	float start = current.getStartPosition();
//	                  	float totalWidth = current.getWidth() + right.getWidth();
	                  	CabinetCaculate mergedObj = createMerged("tbd", start, totalWidth);
	                      adjusted.add(mergedObj);
	                      i += 2; // 跳过 current 和 right
	                      merged = true;
	                  }
	              }
//                adjusted.add(createMerged("tbd", start, totalWidth));

                i = j;  // 跳过整段 tbd block
                continue;
            }

            // 不符合条件 → 原样加入
            adjusted.add(current);
            i++;
        }

        return adjusted;
    }

    public class CabinetRangeCheck {
        private float start;
        private float width;
        private String leftObject;
        private String rightObject;

        public CabinetRangeCheck(float start, float width, String leftObject, String rightObject) {
            this.start = start;
            this.width = width;
            this.leftObject = leftObject;
            this.rightObject = rightObject;
        }        
        // getter / setter
        public float getStart() {
            return start;
        }

        public float getWidth() {
            return width;
        }
        
        public String getLeftObject() {
            return leftObject;
        }

        public String getRightObject() {
            return rightObject;
        }
    }
    
    public List<Cabinet> getCabinetFromRuleUpper(Cabinet cabinet, List<Cabinetsrule> cabinetsruleList, 
    		ArrayList<List<Cabinet>> lowerCabinetList, String construction, float cabnetMinWidth) {
        List<Cabinet> cabinetList = new ArrayList<>();
        String FillName = null;
        float width = cabinet.getWidth();
        Integer kitchenId =  cabinet.getKitchenId();
        Integer wallId = cabinet.getWallid();
        float startPosition = cabinet.getStartposition();
        float rotation = cabinet.getRotation();
        String type = cabinet.getType();
        String leftObject = cabinet.getLeftobject();
        String rightObject = cabinet.getRightobject();
        if (width <=0) { return null;}
        
        float padAdjustWidth = 0;
        String padName = null;
        float startPositionAdjust = cabinet.getStartposition();;
        float padPNBWidth = 0;
        String WFName ="";
        float startAdjust = startPosition;
        
        List<Cabinet> sortedCabinetsOriginal = lowerCabinetList.stream()
        	    .flatMap(List::stream)
        	    .filter(c -> c != null && Objects.equals(c.getWallid(), wallId))
        	    .sorted(Comparator.comparing(Cabinet::getStartposition))
        	    .collect(Collectors.toList());
        
        
        List<Cabinet> sortedCabinets = lowerCabinetList.stream()
        	    .flatMap(List::stream)
        	    .filter(c -> c != null && Objects.equals(c.getWallid(), wallId))
        	    .filter(c -> c != null && !(Objects.equals(c.getCabinettype(), "SP")|| Objects.equals(c.getCabinettype(), "PNB")))
        	    .sorted(Comparator.comparing(Cabinet::getStartposition))
        	    .collect(Collectors.toList());
        
        float startLowerCabinet = (float) lowerCabinetList.stream()
        	    .flatMap(List::stream)
        	    .filter(c -> c != null && Objects.equals(c.getWallid(), wallId))
        	    .mapToDouble(c -> c.getStartposition())
        	    .min()
        	    .orElse(0.0);
        
        float maWidthLowerCabinet = (float) lowerCabinetList.stream()
        	    .flatMap(List::stream)
        	    .filter(c -> c != null && Objects.equals(c.getWallid(), wallId))
        	    .mapToDouble(c -> c.getStartposition() + c.getWidth())
        	    .max()
        	    .orElse(0.0);
        
        List<CabinetRangeCheck> rangesCheck = new ArrayList<>();
        if (!sortedCabinets.isEmpty()) {
        	float rangeStart = sortedCabinets.get(0).getStartposition();
            float rangeEnd = rangeStart + sortedCabinets.get(0).getWidth();
            String rangeleftObject = sortedCabinetsOriginal.get(0).getLeftobject();
            String rangerightObject = sortedCabinets.get(0).getRightobject();
            
            for (int i = 1; i < sortedCabinets.size(); i++) {

                Cabinet c = sortedCabinets.get(i);

                float start = c.getStartposition();
                float end = start + c.getWidth();
                String leftObjectC = c.getLeftobject();
                String rightObjectC = c.getRightobject();

                String left = c.getLeftobject(); // door/endwall/wall

                boolean isBoundary =
                        "door".equalsIgnoreCase(left)
                     || "endwall".equalsIgnoreCase(left)
                     || "wall".equalsIgnoreCase(left);

                boolean isContinuous =
                        Math.abs(start - rangeEnd) < 1e-6;

                // ——❗规则优先级：只要命中“边界”，立即切断前一区间
                if (isBoundary || !isContinuous) {

                    // 结束前一个区间
                	rangesCheck.add(new CabinetRangeCheck(rangeStart, rangeEnd - rangeStart, rangeleftObject, rangerightObject));

                    // 开始新区间
                    rangeStart = start;
                    rangeEnd = end;
                    rangeleftObject = leftObjectC;
                    rangerightObject = rightObjectC;

                } else {
                    // 否则继续扩大当前区间
                    rangeEnd = end;
                    rangerightObject = rightObjectC;
                    
                }
            }
            String rangerightObjectOriginal = sortedCabinetsOriginal.get(sortedCabinetsOriginal.size() - 1).getRightobject();
            // 收尾
            rangesCheck.add(new CabinetRangeCheck(rangeStart, rangeEnd - rangeStart,  rangeleftObject, rangerightObjectOriginal));
        }      
        

        
        boolean startFlag = false; // cabinet.getStartposition()至少在一个区域内
        float cabinetEnd = cabinet.getStartposition()  + cabinet.getWidth() ;
		for (CabinetRangeCheck r : rangesCheck) {
			float rangeStartT = r.getStart();
	        float rangeEndT = r.getStart() + r.getWidth();
	        boolean startCheck =
	    	        		cabinet.getStartposition() + 1e-6 >= rangeStartT && cabinet.getStartposition() <= rangeEndT + 1e-6;
	        boolean endCheck =
	        		cabinetEnd >= rangeStartT + 1e-6 && cabinetEnd <= rangeEndT + 1e-6;
	        if (startCheck || endCheck || cabinet.getStartposition() <= rangeStartT && rangeEndT>= rangeEndT) {
	        	startFlag = true;
	        	break;
	        }
	    }
        
		if (!startFlag)  { return null;}
		 String constr = construction.substring(0, 3);
	    	float padCabinetWidth = 0f;
	    	String cabinetAdjustW = "";
	    	String cabinetAdjustNameW = "";
	        if ("BC1".equals(constr)) { // 1000series
	        	padCabinetWidth=  Constants.commons.CANBINET_WIDTH_SP;
	        	cabinetAdjustW  = Constants.commons.CANBINET_TYPE_SP;   
	        	cabinetAdjustNameW  = Constants.commons.CANBINET_NAME_SP1239;
	        } else {
	        	padCabinetWidth =  Constants.commons.CANBINET_WIDTH_PNB;
	        	cabinetAdjustW  = Constants.commons.CANBINET_TYPE_PNW;
	        	cabinetAdjustNameW  = Constants.commons.CANBINET_NAME_PNW48;
	        }
        if (!"wall".equals(cabinet.getLeftobject()) ) { 
        	if (sortedCabinets != null && !sortedCabinets.isEmpty()) {
	        	if ("endwall".equals(cabinet.getLeftobject()) &&  "endwall".equals(sortedCabinets.get(0).getLeftobject()) ) {	    		
	        		if (startPosition < startLowerCabinet) {
	        			width = width - startLowerCabinet + startPosition;
	    	    		startPosition = startLowerCabinet;
	    	    		startAdjust = startLowerCabinet;		    		
	    	    	}
	        	} else {
	        		for (CabinetRangeCheck r : rangesCheck) {
		    			float rangeStartT = r.getStart();
		    	        float rangeEndT = r.getStart() + r.getWidth();
		    	        if ("endwall".equals(r.getLeftObject())) {
		    	        	rangeStartT = rangeStartT - padCabinetWidth;
		    	        }
		    	        boolean startInside =
		    	        		cabinet.getStartposition()  < rangeStartT + 1e-6;
		    	        boolean endBeyond =
		    	        		cabinet.getStartposition() + cabinet.getWidth() >= rangeStartT && cabinet.getStartposition() + cabinet.getWidth() <= rangeEndT + 1e-6;
		    	        if (startInside && endBeyond) {
		    	        	startPosition = rangeStartT;
		    	    		startAdjust = rangeStartT;		
	    	        		width = width - rangeStartT + cabinet.getStartposition();
		    	            break;    	    	        	
		    	        } 
		    	    }
	        	}
        	}
        }
        if (!"wall".equals(cabinet.getRightobject()) ) { 
        	if (sortedCabinets != null && !sortedCabinets.isEmpty()) {
        		Cabinet lasted  =  sortedCabinets.get(sortedCabinets.size() -1);
        		if ("endwall".equals(cabinet.getRightobject()) && ("endwall".equals(lasted.getRightobject()) ||
        				"high".equals(lasted.getType()) && "appliance".equals(lasted.getLeftobject()))
        				) {	
    	    		if (cabinet.getStartposition() + cabinet.getWidth() > maWidthLowerCabinet) {
    		    		width = maWidthLowerCabinet - cabinet.getStartposition();
    		    	}
    	    	} else {
    	    		
    	    		for (CabinetRangeCheck r : rangesCheck) {
    	    			float rangeStartT = r.getStart();
    	    	        float rangeEndT = r.getStart() + r.getWidth();
    	    	        if ("endwall".equals(r.getRightObject())) {
    	    	        	rangeEndT = rangeEndT+ padCabinetWidth;
    	    	        }
    	    	        boolean startInside =
    	    	        		cabinet.getStartposition() + 1e-6 >= rangeStartT && cabinet.getStartposition() <= rangeEndT + 1e-6;
    	    	        boolean endBeyond =
    	    	        		cabinet.getStartposition() + cabinet.getWidth() > rangeEndT + 1e-6;
    	    	        if (startInside && endBeyond) {
	    	        		width = rangeEndT - cabinet.getStartposition();
    	    	            break;    	    	        	
    	    	        } 
    	    	    }
    	    	}
        	}
        }  
        if (width <=0) { return null;}
        
        if (width <= 6 ) {
            if (rightObject !=null && ("door".equals(rightObject) || "window".equals(rightObject)))  {
                return cabinetList;
            } else if ((leftObject !=null && ("door".equals(leftObject) || "window".equals(leftObject)))) {
                return cabinetList;
            }  else if (leftObject !=null && "highcabinet".equals(leftObject) && rightObject !=null && "endwall".equals(rightObject)) {
                return cabinetList;
            }
            else {
                if (width > 3) {
                    FillName =Constants.commons.CANBINET_NAME_FILLER_WF06;
                } else {
                    FillName =Constants.commons.CANBINET_NAME_FILLER_WF03;
                }
                Cabinet cabinet1 = new Cabinet(cabinet.getHeight(),0f,FillName,
                        width,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                        type, startPosition, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, rotation,cabinet.getLeftobject(), cabinet.getRightobject());
                cabinetList.add(cabinet1);
                return cabinetList;
            }
        } else if  (width <cabnetMinWidth && width > 6 ){
        	if (rightObject !=null && ("door".equals(rightObject) || "window".equals(rightObject)))  {
              return cabinetList;
          } else if ((leftObject !=null && ("door".equals(leftObject) || "window".equals(leftObject)))) {
              return cabinetList;
          }  else if (leftObject !=null && "highcabinet".equals(leftObject) && rightObject !=null && "endwall".equals(rightObject)) {
              return cabinetList;
          } else if (width <= 9 && width > 6 ) {
        	  String FillName1 =Constants.commons.CANBINET_NAME_FILLER_WF06;
              String FillName2 =Constants.commons.CANBINET_NAME_FILLER_WF03;

              Cabinet cabinet1 = new Cabinet(cabinet.getHeight(),0f,FillName1,
                      6f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                      type, startPosition, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, rotation,cabinet.getLeftobject(), "");
              cabinetList.add(cabinet1);
              Cabinet cabinet2 = new Cabinet(cabinet.getHeight(),0f,FillName2,
                      width-6f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                      type, startPosition+6f, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, rotation,"", cabinet.getRightobject());
              cabinetList.add(cabinet2);
              return cabinetList;
          } else if (width > 9 && width <=12 ) {
        	  String FillName1 =Constants.commons.CANBINET_NAME_FILLER_WF06;
              String FillName2 =Constants.commons.CANBINET_NAME_FILLER_WF06;

              Cabinet cabinet1 = new Cabinet(cabinet.getHeight(),0f,FillName1,
                      6f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                      type, startPosition, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, rotation,cabinet.getLeftobject(), "");
              cabinetList.add(cabinet1);
              Cabinet cabinet2 = new Cabinet(cabinet.getHeight(),0f,FillName2,
                      width-6f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                      type, startPosition+6f, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, rotation,"", cabinet.getRightobject());
              cabinetList.add(cabinet2);
              return cabinetList;
          }
          else {

              String FillName1 =Constants.commons.CANBINET_NAME_FILLER_WF06;
              String FillName2 =Constants.commons.CANBINET_NAME_FILLER_WF06;
              String FillName3 =Constants.commons.CANBINET_NAME_FILLER_WF03;
              Cabinet cabinet1 = new Cabinet(cabinet.getHeight(),0f,FillName1,
                      6f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                      type, startPosition, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, rotation,cabinet.getLeftobject(), "");
              cabinetList.add(cabinet1);
              Cabinet cabinet2 = new Cabinet(cabinet.getHeight(),0f,FillName2,
                      6f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                      type, startPosition+6f, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, rotation,"", cabinet.getRightobject());
              cabinetList.add(cabinet2);
              Cabinet cabinet3 = new Cabinet(cabinet.getHeight(),0f,FillName3,
                      width-12f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                      type, startPosition+12f, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, rotation,"", cabinet.getRightobject());
              cabinetList.add(cabinet3);
              return cabinetList;
          }
        }
        List<Cabinet> cabinetListR = new ArrayList<>();
        // prepare
        List<Cabinet> result = lowerCabinetList.stream()
        	    .flatMap(List::stream)
        	    .filter(cabinetR -> Objects.equals(cabinetR.getWallid(), wallId) && 
        	    		!"SP".equals(cabinetR.getCabinettype()) && !"PNB".equals(cabinetR.getCabinettype()) && 
        	    		!"door".equals(cabinetR.getCabinettype())  )
        	    .collect(Collectors.toList());
        
        List<CabinetCaculate> caculateList = new ArrayList<>();
        for (int i = 0; i < result.size(); i++) {
            Cabinet c = result.get(i);

            // 如果是 BF/FILLER -> 跳过，不直接保存
            if ("BF".equals(c.getCabinettype()) || "FILLER".equals(c.getCabinettype())) {
                continue;
            }

            float widthTemp = c.getWidth();

            // CornerKey 不为空时，检查前后邻居
            if (c.getCornerKey() != null && !c.getCornerKey().isEmpty()) {

                // 前一个邻居：必须紧挨着
                if (i > 0) {
                    Cabinet prev = result.get(i - 1);
                    if (("BF".equals(prev.getCabinettype()) || "FILLER".equals(prev.getCabinettype()))
                            && Math.abs(prev.getStartposition() + prev.getWidth() - c.getStartposition()) < 1e-6) {
                    	widthTemp += prev.getWidth();
                    }
                }

                // 后一个邻居：必须紧挨着
                if (i < result.size() - 1) {
                    Cabinet next = result.get(i + 1);
                    if (("BF".equals(next.getCabinettype()) || "FILLER".equals(next.getCabinettype()))
                            && Math.abs(c.getStartposition() + c.getWidth() - next.getStartposition()) < 1e-6) {
                    	widthTemp += next.getWidth();
                        i++; // 跳过这个邻居，避免重复处理
                    }
                }
            }

            caculateList.add(new CabinetCaculate(
                    c.getName(),
                    c.getStartposition(),
                    widthTemp
            ));
        }
   	
    	
        if ("wall".equals(cabinet.getLeftobject()) ) {        	
        	startAdjust = startPosition+Constants.commons.WP_WIDTH_PAD_MIN;
            width = width-Constants.commons.WP_WIDTH_PAD_MIN;
//            reGetCabFlag =1;
            Cabinet cabinet1 = new Cabinet(cabinet.getHeight(),0f, Constants.commons.CANBINET_NAME_FILLER_WF03,
                    Constants.commons.WP_WIDTH_PAD_MIN,0,kitchenId, wallId, Constants.commons.CANBINET_TYPE_FILLER,
                    type, startPosition, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, rotation,"wall","");
            cabinetList.add(cabinet1);
            leftObject = "";
    	               
	    }
        
	    if ("wall".equals(cabinet.getRightobject())  ) {
	        //
	    	startAdjust = startAdjust;
	        width = width-Constants.commons.WP_WIDTH_PAD_MIN;
//	        reGetCabFlag =1;
	        Cabinet cabinet1 = new Cabinet(cabinet.getHeight(),0f, Constants.commons.CANBINET_NAME_FILLER_WF03,
	                Constants.commons.WP_WIDTH_PAD_MIN,0,kitchenId, wallId, Constants.commons.CANBINET_TYPE_FILLER,
	                type, startAdjust + width, Constants.commons.UPPER_CABINET_DEFAULT_DEPTH, rotation,"","wall");
	        cabinetList.add(cabinet1);
	        rightObject = "";
	    } 
 		
        CabinetRange upperRanges = new CabinetRange(startAdjust, width);
        List<CabinetRange> upperRangesList = new ArrayList() ;
        upperRangesList.add(upperRanges);
        List<Cabinetsrule> rulesFilter = cabinetsruleList.stream()
        .filter(rule -> rule.getConstruction() != null 
                     && construction != null
                     && rule.getConstruction().length() >= 3
                     && construction.length() >= 3
                     && Math.round(cabinet.getHeight()) == Math.round(rule.getHeightCab1())

                     && construction.substring(0, 3)
                            .equals(rule.getConstruction().substring(0, 3)))
        .collect(Collectors.toList());
        List<CandidateCabinet> candidateUpper = rulesFilter.stream()
        	    .flatMap(r -> Stream.of(
        	            new CandidateCabinet(r.getReturnCab1(), r.getWidthCab1()),
        	            r.getWidthCab2() > 0 ? new CandidateCabinet(r.getReturnCab2(), r.getWidthCab2()) : null
        	    ))
        	    .filter(Objects::nonNull) // 过滤掉 null
        	    .collect(Collectors.toList());
        // arrange
        List<CabinetCaculate> resultArrangeF = arrangeUpperCabinets(caculateList, upperRangesList, candidateUpper);
        
        List<CabinetCaculate> resultArrange = adjustArrange(resultArrangeF, cabinetsruleList, cabnetMinWidth);
        // result  
       
        
        int skipLeftObjT = 0; // 
        int skipRightObjT = 0;
        int resSize = resultArrange.size();
    	if (("door".equals(cabinet.getLeftobject()) || "window".equals(cabinet.getLeftobject())) && 
    			"tbd".equals(resultArrange.get(0).getName()) && resultArrange.get(0).getWidth() <9) {
    		skipLeftObjT = 1;
		}
    	if (("door".equals(cabinet.getRightobject()) || "window".equals(cabinet.getRightobject())) && 
    			"tbd".equals(resultArrange.get(resSize -1).getName()) && resultArrange.get(resSize -1).getWidth() <9) {
    		skipRightObjT = 1; 
		}
        
        for (int i = 0; i < resultArrange.size(); i++) {
        	// 
        	CabinetCaculate res = resultArrange.get(i);        		
        	String leftObjectArrange  ;
        	String rightObjectArrange ;
        	
        	if (resultArrange.size() !=1 ) {
        		if (skipLeftObjT == 1 && i == 0 ) {
    				continue;
    			}
            	
            	if (skipRightObjT == 1 && i == resultArrange.size() - 1 ) {
    				continue;
    			}
        	} else {
        		if (skipLeftObjT == 1 && skipRightObjT == 1) {
        			continue;
        		}
        	}        	
        	
        	if (resultArrange.size() == 1) {
        		leftObjectArrange = leftObject;
        		rightObjectArrange =  rightObject;
        	} else if (resultArrange.size() == 2) {
        		if (i == 0) {
        			
        			if (skipRightObjT == 1 ) {
        				leftObjectArrange = leftObject;
        				rightObjectArrange =  rightObject;
        			} else {
        				leftObjectArrange = leftObject;
            			rightObjectArrange = "";
        			}
        		} else {
        			if (skipLeftObjT == 1 && i == 1) {
        				leftObjectArrange = leftObject;
        				rightObjectArrange =  rightObject;
        			} else {
        				leftObjectArrange = "";
        				rightObjectArrange =  rightObject;
        			}
        		}
        	} else {
        		if (i == 0) {
        			leftObjectArrange = leftObject;;
        		} else {
        			if (skipLeftObjT == 1 && i == 1) {
        				leftObjectArrange = leftObject;
        			} else {
        				leftObjectArrange = "";
        			}
        		}
            	if (i == resultArrange.size() -1) {
            		rightObjectArrange =  rightObject;
        		} else {
        			if (skipRightObjT == 1 && i == resultArrange.size() -2) {
        				rightObjectArrange =  rightObject;
        			} else {
        				rightObjectArrange = "";
        			}
         			
        		}
        	}  
        	if ("endwall".equals(leftObjectArrange) && i == 0 && 
        			(Constants.commons.CANBINET_WIDTH_SP != 0f && "BC1".equals(constr) || !"BC1".equals(constr))) {
         	
        		if (res.getWidth() < padCabinetWidth) {
	   				 // 放置pnb/SP
	           		Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, cabinetAdjustNameW,
	           				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjustW,
	                           type, res.getStartPosition() + res.getWidth() - padCabinetWidth , cabinet.getDepth(), rotation, "endwall","");
	           		cabinetListR.add(cabinet1); 
	   			} else if (res.getWidth() == padCabinetWidth) {
    				 // 放置pnb/SP
            		Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, cabinetAdjustNameW,
            				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjustW,
                            type, res.getStartPosition()  , cabinet.getDepth(), rotation, "endwall","");
            		cabinetListR.add(cabinet1); 
    			} else if (res.getWidth() <= cabnetMinWidth && res.getWidth() > padCabinetWidth  ) {
    				
    				/// todom1116
    				Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, cabinetAdjustNameW,
            				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjustW,
                            type, res.getStartPosition() +res.getWidth() - padCabinetWidth , cabinet.getDepth(), rotation, "endwall","");
    				cabinetListR.add(cabinet1); 
    			} else {
    				// 
    				float adjWidth = res.getWidth() - Constants.commons.ADJUST_WIDTH_PAD_MIN;
        			float adjStart = res.getStartPosition() + Constants.commons.ADJUST_WIDTH_PAD_MIN;
    				Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, cabinetAdjustNameW,
            				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjustW,
                            type, res.getStartPosition() + Constants.commons.ADJUST_WIDTH_PAD_MIN - padCabinetWidth, cabinet.getDepth(), rotation, "endwall","");
    				cabinetListR.add(cabinet1); 
    				List<Cabinet> listC = getCabinetFromRule("upper", adjWidth, cabinet.getHeight(), cabinetsruleList, kitchenId,  
    						wallId,  adjStart, type, "", rightObjectArrange, rotation, cabinet.getDepth(), cabnetMinWidth);
            		if (listC!=null ) {
            			cabinetListR.addAll(listC);   
            		}
    			}    			
    		} else if ("endwall".equals(rightObjectArrange) && resultArrange.size()-1 == i && 
        			(Constants.commons.CANBINET_WIDTH_SP != 0f && "BC1".equals(constr) || !"BC1".equals(constr))) {
        		
    			if (res.getWidth() <= cabnetMinWidth   ) {
    				/// todom1116
    				Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, cabinetAdjustNameW,
            				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjustW,
                            type, res.getStartPosition() , cabinet.getDepth(), rotation, "","endwall");
    				cabinetListR.add(cabinet1); 
    			} else {
    				
    				//
    				float remainingF = res.getWidth();

    				// 提取并排序宽度（降序）
    				List<Float> sortedWidths = cabinetsruleList.stream()
    				    .map(Cabinetsrule::getSpaceWidth)
    				    .filter(w -> w > 0)
    				    .distinct()
    				    .sorted(Collections.reverseOrder())
    				    .collect(Collectors.toList());

    				// 使用普通 for 循环，允许修改 remainingF
    				for (Float w : sortedWidths) {
    				    if (remainingF >= w) {
    				        remainingF %= w;
    				    }
    				}
    				if (remainingF > 0) {
    					float adjWidth = 0f;
        				float adjStart = res.getStartPosition() ;
        				if (remainingF < padCabinetWidth) {
        					adjWidth = res.getWidth() - Constants.commons.ADJUST_WIDTH_PAD_MIN - remainingF;
        				} else {
        					adjWidth = res.getWidth() - remainingF;
        				}
        				 // 放置pnb/SP
                		Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, cabinetAdjustNameW,
                				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjustW,
                                type, res.getStartPosition() + adjWidth, cabinet.getDepth(), rotation, "","endwall");
                		cabinetListR.add(cabinet1); 
                		List<Cabinet> listC = getCabinetFromRule("upper", adjWidth, cabinet.getHeight(), cabinetsruleList, kitchenId,  
                				wallId,  adjStart, type, leftObjectArrange, "", rotation, cabinet.getDepth(), cabnetMinWidth);
            			if (listC!=null ) {
                			cabinetListR.addAll(listC);   
                		}   
    				} else {
    					if ("tbd".equals(res.getName())) {
    	            		List<Cabinet> listC = getCabinetFromRule("upper", res.getWidth(), cabinet.getHeight(), cabinetsruleList, kitchenId,  wallId,  
    	            				res.getStartPosition(), type, leftObjectArrange, rightObjectArrange, rotation, cabinet.getDepth(), cabnetMinWidth);
    	            		if (listC==null || listC.size()==0) {
    	            			
    	            		}
    	            		cabinetListR.addAll(listC);
    	            	} else {
    	        			String cType = res.getName().split("\\d", 2)[0];
    	            		Cabinet cabT = new Cabinet(cabinet.getHeight(), 0f, res.getName(), res.getWidth(), cabinet.getCeilingHeight(), kitchenId, wallId,
    	            				cType, "upper", res.getStartPosition(), cabinet.getDepth() ,rotation, leftObjectArrange, rightObjectArrange);
    	            		cabinetListR.add(cabT);        		
    	            	} 
    				}
    				
    			}
            } else {
            	/// 检查cabinet左右是否有bf，加上bf长度是否可以是一个cabinet， 如果是就合并
            	///
            	///
    			if ("tbd".equals(res.getName())) {
            		List<Cabinet> listC = getCabinetFromRule("upper", res.getWidth(), cabinet.getHeight(), cabinetsruleList, kitchenId,  wallId,  
            				res.getStartPosition(), type, leftObjectArrange, rightObjectArrange, rotation, cabinet.getDepth(), cabnetMinWidth);
            		if (listC==null || listC.size()==0) {
            			
            		}
            		cabinetListR.addAll(listC);
            	} else {
        			String cType = res.getName().split("\\d", 2)[0];
            		Cabinet cabT = new Cabinet(cabinet.getHeight(), 0f, res.getName(), res.getWidth(), cabinet.getCeilingHeight(), kitchenId, wallId,
            				cType, "upper", res.getStartPosition(), cabinet.getDepth() ,rotation, leftObjectArrange, rightObjectArrange);
            		cabinetListR.add(cabT);        		
            	} 
    		}
        }
        
        if (cabinetListR==null) {
        	return null;
        }
        int reGetCabFlag = 0;
    	// 检查cabinet左右是否有bf，加上bf长度是否可以是一个cabinet， 如果是就合并
//	    	cabinetList	    	
    	// 如果柜子window/door， 可以把wf移动到最边上。
    	if ("window".equals(cabinet.getLeftobject()) ||  "door".equals(cabinet.getLeftobject()) ||  "endwall".equals(cabinet.getLeftobject())   ) {
    		// 1. 过滤出所有非 Filler 柜子（保持原顺序）
    		List<Cabinet> sortedCabinetWithFillers = cabinetListR.stream()
    				.sorted(Comparator.comparing(Cabinet::getStartposition))
        		    .collect(Collectors.toList());
    		List<Cabinet> nonFillers = sortedCabinetWithFillers.stream()
    		    .filter(c -> !Constants.commons.CANBINET_NAME_FILLER.equals(c.getCabinettype()))
    		    .collect(Collectors.toList());
    		
    		String leftSortedObject = sortedCabinetWithFillers.get(0).getLeftobject();
    		String rightSortedObject = sortedCabinetWithFillers.get(sortedCabinetWithFillers.size() -1).getRightobject();
    		if (!nonFillers.isEmpty()) {
    			// 2. 计算右边界：取原列表中最后一个非-Filler 的 end 位置
//    		    注意：必须从 ORIGINAL list 中找，因为 nonFillers 顺序对但 startposition 还是旧的
	    		// 2. 找到右边缘最大的柜子（即空间上最靠右的）
	    		Cabinet lastNonFillerInOriginal = cabinetListR.stream()    				
	    		    .max(Comparator.comparingDouble(c -> c.getStartposition() + c.getWidth()))
	    		    .orElseThrow(null);	
	    		if (lastNonFillerInOriginal != null) {
	    			float rightEdge = lastNonFillerInOriginal.getStartposition() + lastNonFillerInOriginal.getWidth();
	    			
		    		// 3. 从右往左设置每个柜子的 startposition
		    		float currentRight = rightEdge;
		    		// 逆序遍历 nonFillers（从最后一个到第一个）
		    		for (int i = nonFillers.size() - 1; i >= 0; i--) {
		    		    Cabinet c = nonFillers.get(i);
		    		    float newStart = currentRight - c.getWidth();
		    		    c.setStartposition(newStart);
		    		    currentRight = newStart;
		    		    if (i ==0) {
		    		    	c.setLeftobject(leftSortedObject);
		    		    }
		    		    if (i == nonFillers.size() -1) {
		    		    	c.setRightobject(rightSortedObject);
		    		    }
		    		}
				    // 4. 替换原列表
		    		
		    		cabinetListR.clear();
		    		cabinetListR.addAll(nonFillers);
	    		}	
	    		
    		} 	

    		
    	} else if  ("window".equals(cabinet.getRightobject()) ||  "door".equals(cabinet.getRightobject()) ||  "endwall".equals(cabinet.getRightobject())  ) {
    		
    		// 1. 过滤出所有非 Filler 柜子（保持原顺序）
    		if (!cabinetListR.isEmpty()) {
    			List<Cabinet> sortedCabinetWithFillers = cabinetListR.stream()
        				.sorted(Comparator.comparing(Cabinet::getStartposition))
            		    .collect(Collectors.toList());
        		
        		List<Cabinet> nonFillers = sortedCabinetWithFillers.stream()
        		    .filter(c -> !Constants.commons.CANBINET_NAME_FILLER.equals(c.getCabinettype()))
        		    .collect(Collectors.toList());
        		Double fillersTotalWidth = cabinetListR.stream()
        			    .filter(c -> Constants.commons.CANBINET_NAME_FILLER.equals(c.getCabinettype()))
        			    .mapToDouble(Cabinet::getWidth)
        			    .sum();
        		String leftSortedObject = sortedCabinetWithFillers.get(0).getLeftobject();
        		String rightSortedObject = sortedCabinetWithFillers.get(sortedCabinetWithFillers.size() -1).getRightobject();
        		if (!nonFillers.isEmpty()) {
        			if (fillersTotalWidth >= 3 + padCabinetWidth ) {
        				reGetCabFlag = 1;
        			} else {
        				// 2. 计算右边界：取原列表中最后一个非-Filler 的 end 位置
//            		    注意：必须从 ORIGINAL list 中找，因为 nonFillers 顺序对但 startposition 还是旧的
        	    		// 2. 找到右边缘最大的柜子（即空间上最靠右的）
        	    		Cabinet firstNonFillerInOriginal = cabinetListR.stream()    				
        	    		    .min(Comparator.comparingDouble(c -> c.getStartposition()))
        	    		    .orElseThrow(null);	
        	    		if (firstNonFillerInOriginal != null) {
        	    			float rightEdge = firstNonFillerInOriginal.getStartposition() ;
        	    			
        		    		// 3. 从右往左设置每个柜子的 startposition
        		    		float currentLeft = rightEdge;
//        		    		for (Cabinet c : nonFillers ) {
        		    		for (int i = 0; i < nonFillers.size() ; i++) {
        		    		    Cabinet c = nonFillers.get(i);
        		    		    if (i ==0) {
        		    		    	c.setLeftobject(leftSortedObject);
        		    		    }
        		    		    if (i == nonFillers.size() -1) {
        		    		    	c.setRightobject(rightSortedObject);
        		    		    }
        		    		    c.setStartposition(currentLeft);
        		    		    currentLeft += c.getWidth();
        		    		}
        				    // 4. 替换原列表
        		    		cabinetListR.clear();
        		    		cabinetListR.addAll(nonFillers);
        	    		}	
        			}
        			
    	    		
        		} 	
    		}
    		
    		
    		
    	}        
        if (reGetCabFlag ==0) {
            cabinetList.addAll(cabinetListR);
            return cabinetList;
        } else {
            // 调整后的位置重新生成
            List<Cabinet> cabinetListN  = getCabinetFromRule("upper", width, cabinet.getHeight(), cabinetsruleList, kitchenId, wallId, 
            		startAdjust, type, leftObject, rightObject, rotation, cabinet.getDepth(), cabnetMinWidth); 
            if (cabinetListN !=null) {
            	cabinetList.addAll(cabinetListN);
            }
            return cabinetList;
        }
    }

    public List<Cabinet> getCabinetFromRuleLower(Cabinet cabinet, List<Cabinetsrule> cabinetsruleList) {
        List<Cabinet> cabinetList = new ArrayList<>();

        String FillName = null;
        float width = cabinet.getWidth();
        Integer kitchenId =  cabinet.getKitchenId();
        Integer wallId = cabinet.getWallid();
        float startPosition = cabinet.getStartposition();
        String type = cabinet.getType();
        String leftObject = cabinet.getLeftobject();
        String rightObject = cabinet.getRightobject();
        float rotation = cabinet.getRotation();
        Integer peninsulainercorner = cabinet.getPeninsulainercorner();
        if (peninsulainercorner == null) peninsulainercorner =0;
        if (width <=0) { return null;}
        float padAdjustWidth = 0;
        String padName = null;
        float startPositionAdjust = 0;
        float padPNBWidth = 0;
        String WFName ="";
        String construction = cabinetsruleList.get(0).getConstruction();
        String constr = construction.substring(0, 3);
        
    	String cabinetAdjust = "";
    	float padCabinetWidth = 0f;
    	String cabinetAdjustW = "";
    	String cabinetAdjustName = "";
    	String cabinetAdjustNameW = "";
        if ("BC1".equals(constr)) { // 1000series
        	cabinetAdjust = Constants.commons.CANBINET_TYPE_SP;
        	padCabinetWidth=  Constants.commons.CANBINET_WIDTH_SP;
        	cabinetAdjustW  = Constants.commons.CANBINET_TYPE_SP;
        	cabinetAdjustName = Constants.commons.CANBINET_NAME_SP2436;
        	cabinetAdjustNameW  = Constants.commons.CANBINET_NAME_SP1239;
        	
        } else {
        	cabinetAdjust =  Constants.commons.CANBINET_TYPE_PNB;
        	padCabinetWidth =  Constants.commons.CANBINET_WIDTH_PNB;
        	cabinetAdjustW  = Constants.commons.CANBINET_TYPE_PNW;
        	cabinetAdjustName = Constants.commons.CANBINET_NAME_PNB36;
        	cabinetAdjustNameW  = Constants.commons.CANBINET_NAME_PNW48;
        }
        Integer cabinetDepth =  Constants.commons.LOWER_CABINET_DEFAULT_DEPTH;
        if ("islandouter".equals(type) ) {
        	cabinetDepth = cabinet.getDepth();
        }
        
        if (width < 6 ) {
            float startAdjust = 0;
            if ((leftObject != null && "door".equals(leftObject)) ||
                    (rightObject != null && "door".equals(rightObject) )) {
                return cabinetList;
            } else {
            
                if (width > 3) {
                    FillName = Constants.commons.CANBINET_NAME_FILLER_BF6;
                } else {
                    FillName = Constants.commons.CANBINET_NAME_FILLER_BF3;
                }
                if ("corner".equals(cabinet.getLeftobject()) || "corner".equals(cabinet.getRightobject())) {      
                	 Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, FillName,
                             width, 0, kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                             type, startPosition, cabinetDepth, "", rotation,"","", true);
                	 cabinet1.setPeninsulainercorner(peninsulainercorner);
                     cabinetList.add(cabinet1);
                     
                     
                } else {
                	 Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, FillName,
                             width, 0, kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                             type, startPosition, cabinetDepth, rotation,leftObject ,rightObject);
                	 cabinet1.setPeninsulainercorner(peninsulainercorner);
                     cabinetList.add(cabinet1);
                }
                	
               
                return cabinetList;
            }
        }
        // 过滤 type = "Lower" 的对象
        List<Cabinetsrule> lowerCabinets = cabinetsruleList.stream()
                .filter(cabinetL -> "lower".equalsIgnoreCase(cabinetL.getType()))
                .collect(Collectors.toList());
        List<Cabinet> cabinetListR = new ArrayList<>();
        cabinetListR = getCabinetFromRule("lower", width, cabinet.getHeight(), lowerCabinets, kitchenId,  wallId,  
        		startPosition, type, cabinet.getLeftobject(), cabinet.getRightobject(), rotation, cabinet.getDepth() , Constants.commons.CABINET_MIN_WIDTH);
        if (cabinetListR == null) {
        	return null;
        }
        Optional<Cabinet> fillerCabinet = cabinetListR.stream()
                .filter(cabinetCheck -> Constants.commons.CANBINET_NAME_FILLER.equals(cabinetCheck.getCabinettype()))  // 过滤出 cabType 为 Filler 的项目
                .findFirst();  // 找到第一个符合条件的项目
        float padWidth = fillerCabinet
                .map(Cabinet::getWidth)  // 提取宽度
                .orElse(0.0f);  // 如果没有找到符合条件的项，返回默认值 0.0f
        if (Constants.commons.CANBINET_TYPE_ISLAND_INER.equals(cabinet.getType())) {
        	List<Cabinet> sortedCabinetWithFillers = cabinetListR.stream()
    				.sorted(Comparator.comparing(Cabinet::getStartposition))
        		    .collect(Collectors.toList()); 
        	if (peninsulainercorner == 0) {
        		return cabinetListR;
        	} else {
        		if (peninsulainercorner == 1) {
            		if (!sortedCabinetWithFillers.isEmpty()) {
            			if (sortedCabinetWithFillers.size() ==1) {
            				sortedCabinetWithFillers.get(0).setPeninsulainercorner(1);
            			}  else {
            				sortedCabinetWithFillers.get(sortedCabinetWithFillers.size() -1).setPeninsulainercorner(1);
            			}
            		}
            		return sortedCabinetWithFillers;
            	} else if (peninsulainercorner == 2) {
            		if (!sortedCabinetWithFillers.isEmpty()) {
            			sortedCabinetWithFillers.get(0).setPeninsulainercorner(2);
            		}
            	} else {
            		return cabinetListR;
            	}
        	}
        	
            
        }
        int reGetCabFlag = 0;
        if (padWidth != 0.0f && padWidth <= 6f && padWidth != width) {
        	// 右侧有pad的时候
            if (padWidth <= 3f) {
                padName = "BF3";
            } else {
                padName = "BF6";
            }
            if (cabinet.getRightobject() !=null && !"door".equals(cabinet.getRightobject())&& !"wall".equals(cabinet.getRightobject()) && 
            		!"corner".equals(cabinet.getRightobject()) && !"endwall".equals(cabinet.getRightobject())) {
            	
            	
            	// 如果左边是Range            	
            	if ("Range".equals(cabinet.getLeftobject()) && "Range".equals(cabinet.getRightobject())) {// 如果右边是Range
            		// 调整cabinet
            		int cabSize = cabinetListR.size() ;
            		if (cabinetListR.size() < 3 ) {
            			// 不需要重新生成，直接插入
            		} else {
            			// 右侧的1~2交换位置
            			Cabinet cabinetListL1 = cabinetListR.get(cabSize -1);
            			Cabinet cabinetListL2 = cabinetListR.get(cabSize -2);
            			if ("lower".equals(cabinetListL1.getType())) {
	            			float L1StartPosition = cabinetListL1.getStartposition();
	            			float L2StartPosition = cabinetListL2.getStartposition();
	            			float L1Width = cabinetListL1.getWidth();
	            			float L2Width = cabinetListL2.getWidth();
	            			
	            			Collections.swap(cabinetListR, cabSize - 1, cabSize - 2);
	            			// 修改右侧第二个宽度为右侧第一的宽度
	            			cabinetListR.get(cabSize -2).setWidth(L1Width);
	            			// 修改右侧第一开始位置为右侧第一个的宽度+右侧第二个开始位置
	            			cabinetListR.get(cabSize -1).setStartposition(L2StartPosition + L1Width);
	            			// 修改右侧第一宽度为右侧第二个的宽度
	            			cabinetListR.get(cabSize -1).setWidth(L2Width);
            			}
            		}
            	} else if ("Range".equals(cabinet.getLeftobject())) {
            		// 不需要重新生成，直接插入
            	} else {
            		// 左侧添加pad
            		startPositionAdjust = startPosition+padWidth;
                    width = width-padWidth;
                    reGetCabFlag =1;
                    if (cabinet.getLeftobject() !=null && "door".equals(cabinet.getLeftobject())) {
//                        // 增加PNB/SP
//                        Cabinet cabinet1 = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f,WFName,
//                                padPNBWidth,0,kitchenId, wallId, Constants.commons.CANBINET_TYPE_PANEL,
//                                type, startPositionAdjust - padAdjustWidth, Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, rotation);
//                        cabinetList.add(cabinet1);
                    } else if (cabinet.getLeftobject() !=null && "wall".equals(cabinet.getLeftobject())) {
                        // 增加BF
                        Cabinet cabinet1 = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f, padName,
                                padWidth,0,kitchenId, wallId, Constants.commons.CANBINET_TYPE_FILLER,
                                type, startPosition, cabinetDepth, rotation,leftObject,"");
                        cabinetList.add(cabinet1);
                        leftObject = "";
                    } else {
                    	if ("corner".equals(cabinet.getLeftobject())) {      
    	                   	 Cabinet cabinet1 = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT, 0f, padName,
    	                   			padWidth, 0, kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
    	                                type, startPosition, cabinetDepth, "", rotation,"","", true);
                            cabinetList.add(cabinet1);
                            leftObject = "";
                    	} else if ("endwall".equals(cabinet.getLeftobject())) {
                    		
                    		
                            // 放置pnb/SP
                    		Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, cabinetAdjustName,
                    				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjust,
                                    type, startPositionAdjust, cabinetDepth, rotation, "endwall","");
                    		cabinetList.add(cabinet1); 
                    		width = width-padCabinetWidth;
                    		startPositionAdjust = startPositionAdjust + padCabinetWidth;
                    		leftObject = "";
                    	} else {
                    	

                    	//  位置安排有错误，有空隙， 增加BF
                    		Cabinet cabinet1 = new Cabinet(Constants.commons.BASE_CABINET_DEFAULT_HEIGHT,0f, padName,
                                    padWidth,0,kitchenId, wallId, Constants.commons.CANBINET_TYPE_FILLER,
                                    type, startPosition, cabinetDepth, rotation,"","");
                            cabinetList.add(cabinet1);
                            leftObject = "";
                    	}                       
                    	
                    }
            	}
            } else if ("endwall".equals(cabinet.getRightobject())) {
            	
            	if (padWidth < padCabinetWidth) {
            		reGetCabFlag =1;
                    // 放置pnb/SP
            		Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, cabinetAdjustName,
            				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjust,
                            type, startPosition + width -padWidth - Constants.commons.ADJUST_WIDTH_PAD_MIN, cabinetDepth, rotation, "","endwall");
            		cabinetList.add(cabinet1); 
            		startPositionAdjust = startPosition;
            		width = width-padWidth - Constants.commons.ADJUST_WIDTH_PAD_MIN;
            		rightObject = "";
            		
            	} else {
            		reGetCabFlag =1;
                    // 放置pnb/SP
            		Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, cabinetAdjustName,
            				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjust,
                            type, startPosition + width -padWidth   , cabinetDepth, rotation, "","endwall");
            		cabinetList.add(cabinet1); 
            		startPositionAdjust = startPosition;
            		width = width-padWidth ;
            		rightObject = "";
            	}
            	
            } else {
            	if ("wall".equals(cabinet.getRightobject()) && cabinet.getLeftobject() !=null &&( "door".equals(cabinet.getLeftobject()) || "window".equals(cabinet.getLeftobject()))) {
            		double totalFillerWidth = cabinetListR.stream()
            		        .filter(cabinetCheck -> Constants.commons.CANBINET_NAME_FILLER.equals(cabinetCheck.getCabinettype()))
            		        .mapToDouble(Cabinet::getWidth) // 将对象流转换为 double 类型的基本数据流
            		        .sum(); // 对所有 double 值求和                		
            		
            		if (totalFillerWidth >3) {
            			reGetCabFlag =1;
            			startPositionAdjust = startPosition+  (float)totalFillerWidth -3 ;
                		width = width-  (float)totalFillerWidth +3;
                		leftObject = cabinet.getLeftobject();
                		rightObject = "wall";
            		}
            	}
                // 右侧是door/wall/corner/endwall
            	// 不需要重新生成，直接插入
            }

        } else {
        	// padWidth == 0
            // TODO 最靠墙是柜子的话，需要柜子宽度-3，增加一个BF或者WF
            if ("wall".equals(cabinet.getLeftobject())) {
                //
                startPositionAdjust = startPosition+Constants.commons.WP_WIDTH_PAD_MIN;
                width = width-Constants.commons.WP_WIDTH_PAD_MIN;
                reGetCabFlag =1;
                Cabinet cabinet1 = new Cabinet(cabinet.getHeight(),0f, Constants.commons.CANBINET_NAME_FILLER_BF3,
                        Constants.commons.WP_WIDTH_PAD_MIN,0,kitchenId, wallId, Constants.commons.CANBINET_TYPE_FILLER,
                        type, startPosition, cabinetDepth, rotation,"wall","");
                cabinetList.add(cabinet1);
                leftObject = "";
            } else if ("wall".equals(cabinet.getRightobject())  ) {
                //
                startPositionAdjust = startPosition;
                width = width-Constants.commons.WP_WIDTH_PAD_MIN;
                reGetCabFlag =1;
                Cabinet cabinet1 = new Cabinet(cabinet.getHeight(),0f, Constants.commons.CANBINET_NAME_FILLER_BF3,
                        Constants.commons.WP_WIDTH_PAD_MIN,0,kitchenId, wallId, Constants.commons.CANBINET_TYPE_FILLER,
                        type, startPosition + width , cabinetDepth, rotation,"","wall");
                cabinetList.add(cabinet1);
                rightObject = "";
            } else if ("corner".equals(cabinet.getLeftobject())) {
            	 startPositionAdjust = startPosition+Constants.commons.WP_WIDTH_PAD_MIN;
                 width = width-Constants.commons.WP_WIDTH_PAD_MIN;
                 reGetCabFlag =1;
                 Cabinet cabinet1 = new Cabinet(cabinet.getHeight(),0f, Constants.commons.CANBINET_NAME_FILLER_BF3,
                         Constants.commons.WP_WIDTH_PAD_MIN,0,kitchenId, wallId, Constants.commons.CANBINET_TYPE_FILLER,
                         type, startPosition, cabinetDepth, "", rotation,"corner","" , true);
                 cabinetList.add(cabinet1);
                 leftObject = "";
            } else if ("corner".equals(cabinet.getRightobject())) {
            	startPositionAdjust = startPosition;
                width = width-Constants.commons.WP_WIDTH_PAD_MIN;
                reGetCabFlag =1;
                Cabinet cabinet1 = new Cabinet(cabinet.getHeight(),0f, Constants.commons.CANBINET_NAME_FILLER_BF3,
                        Constants.commons.WP_WIDTH_PAD_MIN,0,kitchenId, wallId, Constants.commons.CANBINET_TYPE_FILLER,
                        type, startPosition + width , cabinetDepth,"", rotation,"","corner", true);
                cabinetList.add(cabinet1);
                rightObject = "";
            }  else if  ("endwall".equals(cabinet.getLeftobject())) {
            	// 
            	Cabinet minCabinet = cabinetListR.stream()
            		    .min(Comparator.comparing(Cabinet::getStartposition))
            		    .orElse(null);

        		
            	if (minCabinet !=null && (cabinetAdjust.equals(minCabinet.getCabinettype()) ||  
            			Constants.commons.CANBINET_WIDTH_SP == 0f  && "BC1".equals(constr))) {
            		// 不需要调整
            	} else {
            		reGetCabFlag =1;
                	float panelS = 0f;
                	
                    if (width == Constants.commons.CABINET_MIN_WIDTH) {
                    	panelS = startPosition + Constants.commons.CABINET_MIN_WIDTH - padCabinetWidth ;
                		startPositionAdjust = startPosition + Constants.commons.CABINET_MIN_WIDTH;
                		width =0;
                    } else {
                		panelS = startPosition + Constants.commons.ADJUST_WIDTH_PAD_MIN - padCabinetWidth ;
                		startPositionAdjust = startPosition  + Constants.commons.ADJUST_WIDTH_PAD_MIN;
                		width = width-Constants.commons.ADJUST_WIDTH_PAD_MIN;
                    }
                    // 放置pnb/SP
            		Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, cabinetAdjust,
            				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjust,
                            type, panelS, cabinetDepth, rotation, "endwall","");
            		cabinetList.add(cabinet1); 
            		leftObject = "";
            	}
            	
            }	 else if  ("endwall".equals(cabinet.getRightobject())) {
            	// 
            	Cabinet maxCabinet = cabinetListR.stream()
            		    .max(Comparator.comparing(Cabinet::getStartposition))
            		    .orElse(null);
            	if (maxCabinet!=null && (cabinetAdjust.equals(maxCabinet.getCabinettype())||  
            			Constants.commons.CANBINET_WIDTH_SP == 0f && "BC1".equals(constr))) {
            		// 不需要调整
            	} else {
	            	reGetCabFlag =1;
	            	float panelS = 0f;
	            	
	                if (width == Constants.commons.CABINET_MIN_WIDTH) {
	                    width = 0;                    
	                } else {
	            		width = width -Constants.commons.ADJUST_WIDTH_PAD_MIN;          		
	                }
	        		startPositionAdjust = startPosition ;
	                panelS = startPosition + width;
	                // 放置pnb/SP
	        		Cabinet cabinet1 = new Cabinet(cabinet.getHeight(), 0f, cabinetAdjustName,
	        				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjust,
	                        type, panelS, cabinetDepth, rotation, leftObject,"endwall");
	        		cabinetList.add(cabinet1); 
	        		rightObject = "";
            	}
            }	else {
            	// 不需要重新生成，直接插入
            }

        } 
        if (reGetCabFlag ==0) {
            return cabinetListR;
        } else {
            // 调整后的位置重新生成
        	
        	
            List<Cabinet> cabinetListN   = getCabinetFromRule("lower", width, cabinet.getHeight(), lowerCabinets, kitchenId, wallId, startPositionAdjust, 
            		type, leftObject, rightObject, rotation, cabinet.getDepth(), Constants.commons.CABINET_MIN_WIDTH);
            if (cabinetListN != null) {
            	cabinetList.addAll(cabinetListN);
            }
            return cabinetList;
        }

    }

    public List<Cabinet> getCabinetFromRule(String flag, float width, float height, List<Cabinetsrule> cabinetsruleList, 
    		Integer kitchenId, Integer wallId, float startPosition, String type, String leftObject, String rightObject, 
    		float rotation, float depth, float cabnetMinWidth) {
        List<Cabinet> cabinetList = new ArrayList<>();
        if (width <=0) { return null;}
        String FillName = null;
        float padAdjustWidth = 0;
        String padName = null;
        float startPositionAdjust = 0;
        float padPNBWidth = 0;
        String WFName ="";
        String leftNew = leftObject;
        String rightNew = rightObject;
        Integer cabinetDepth =  Constants.commons.LOWER_CABINET_DEFAULT_DEPTH;
        String construction = cabinetsruleList.get(0).getConstruction();
        String constr = construction.substring(0, 3);
    	String cabinetAdjust = "";
    	float padCabinetWidth = 0f;
    	String cabinetAdjustW = "";
    	String cabinetAdjustName = "";
    	String cabinetAdjustNameW = "";
        if ("BC1".equals(constr)) { // 1000series
        	cabinetAdjust = Constants.commons.CANBINET_TYPE_SP;
        	padCabinetWidth=  Constants.commons.CANBINET_WIDTH_SP;
        	cabinetAdjustW  = Constants.commons.CANBINET_TYPE_SP;
        	cabinetAdjustName = Constants.commons.CANBINET_NAME_SP2436;
        	cabinetAdjustNameW  = Constants.commons.CANBINET_NAME_SP1239;
        	
        } else {
        	cabinetAdjust =  Constants.commons.CANBINET_TYPE_PNB;
        	padCabinetWidth =  Constants.commons.CANBINET_WIDTH_PNB;
        	cabinetAdjustW  = Constants.commons.CANBINET_TYPE_PNW;
        	cabinetAdjustName = Constants.commons.CANBINET_NAME_PNB36;
        	cabinetAdjustNameW  = Constants.commons.CANBINET_NAME_PNW48;
        }
        if ("lower".equals(flag)) {
        	if ("islandouter".equals(type) ) {
            	cabinetDepth = Math.round(depth);
            }
        } else {
        	cabinetDepth = Constants.commons.UPPER_CABINET_DEFAULT_DEPTH;
        }
        if (width <= 6 ) {
            float startAdjust = 0;
            // 如果左边有窗户，则不需要BF
            if ((leftObject !=null && (("lower".equals(flag) && "door".equals(leftObject) ) ||
                    ("upper".equals(flag) && ("door".equals(leftObject) || "window".equals(leftObject)))))) {
//                // 左侧是door，window
//                startAdjust = startPosition + width - padPNBWidth;
//                Cabinet cabinet1 = new Cabinet(height, 0f, WFName,
//                        padPNBWidth, 0, kitchenId, wallId, Constants.commons.CANBINET_TYPE_PANEL,
//                        type, startAdjust, Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, rotation);
//                cabinetList.add(cabinet1);
                return cabinetList;
            } else if ((rightObject !=null && (("lower".equals(flag) && "door".equals(rightObject) ) ||
                    ("upper".equals(flag) && ("door".equals(rightObject) || "window".equals(rightObject)))))) {
//                // 右侧是door，window
//                startAdjust = startPosition ;
//                Cabinet cabinet1 = new Cabinet(height, 0f, WFName,
//                        padPNBWidth, 0, kitchenId, wallId, Constants.commons.CANBINET_TYPE_PANEL,
//                        type, startAdjust, Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, rotation);
//                cabinetList.add(cabinet1);
                return cabinetList;
            } else {
                if (width > 3) {
                    if (Constants.commons.CANBINET_TYPE_UPPER.equals(type)) {
                        FillName =Constants.commons.CANBINET_NAME_FILLER_WF06;
                    } else {
                        FillName =Constants.commons.CANBINET_NAME_FILLER_BF6;
                    }

                } else {
                    if (Constants.commons.CANBINET_TYPE_UPPER.equals(type)) {
                        FillName =Constants.commons.CANBINET_NAME_FILLER_WF03;
                    } else {
                        FillName =Constants.commons.CANBINET_NAME_FILLER_BF3;
                    }
                }
                if ("corner".equals(rightObject)) {
                	startAdjust = startPosition ;
                  Cabinet cabinet1 = new Cabinet(height, 0f, FillName,
                		  width, 0, kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                          type, startAdjust,cabinetDepth,"", rotation,leftObject,rightObject, true);
                  cabinetList.add(cabinet1);
                } else if ("corner".equals(leftObject)) {
                	startAdjust = startPosition + width - padPNBWidth;
                  Cabinet cabinet1 = new Cabinet(height, 0f, FillName,
                		  width, 0, kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                          type, startAdjust, cabinetDepth,"", rotation,leftObject,rightObject, true);
                  cabinetList.add(cabinet1);
                	
                }  else {
                	Cabinet cabinet1 = new Cabinet(height,0f,FillName,
                            width,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                            type, startPosition, cabinetDepth, rotation,leftObject,rightObject);
                    cabinetList.add(cabinet1);
                }
                
                return cabinetList;
            }

        } else if (width < cabnetMinWidth) {
            // if width >6 and width < 9
        	float startAdjust = 0;
            // 如果左边有窗户，则不需要BF
            if ((leftObject !=null && (("lower".equals(flag) && "door".equals(leftObject) ) ||
                    ("upper".equals(flag) && ("door".equals(leftObject) || "window".equals(leftObject)))))) {
//                // 左侧是door，window
//                startAdjust = startPosition + width - padPNBWidth;
//                Cabinet cabinet1 = new Cabinet(height, 0f, WFName,
//                        padPNBWidth, 0, kitchenId, wallId, Constants.commons.CANBINET_TYPE_PANEL,
//                        type, startAdjust, Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, rotation);
//                cabinetList.add(cabinet1);
                return cabinetList;
            } else if ((rightObject !=null && (("lower".equals(flag) && "door".equals(rightObject) ) ||
                    ("upper".equals(flag) && ("door".equals(rightObject) || "window".equals(rightObject)))))) {
//                // 右侧是door，window
//                startAdjust = startPosition ;
//                Cabinet cabinet1 = new Cabinet(height, 0f, WFName,
//                        padPNBWidth, 0, kitchenId, wallId, Constants.commons.CANBINET_TYPE_PANEL,
//                        type, startAdjust, Constants.commons.LOWER_CABINET_DEFAULT_DEPTH, rotation);
//                cabinetList.add(cabinet1);
                return cabinetList;
            } 
        	String FillName1 = null;
        	String FillName2 = null;
        	String FillName3 = null;
            if (width < 9) {
            	if (Constants.commons.CANBINET_TYPE_UPPER.equals(type)) {
                    FillName1 =Constants.commons.CANBINET_NAME_FILLER_WF06;
                    FillName2 =Constants.commons.CANBINET_NAME_FILLER_WF03;
                } else {
                    FillName1 = Constants.commons.CANBINET_NAME_FILLER_BF6;
                    FillName2 = Constants.commons.CANBINET_NAME_FILLER_BF3;
                }
            } else if (width < 12) {
            	if (Constants.commons.CANBINET_TYPE_UPPER.equals(type)) {
                    FillName1 =Constants.commons.CANBINET_NAME_FILLER_WF06;
                    FillName2 =Constants.commons.CANBINET_NAME_FILLER_WF06;
                } else {
                    FillName1 = Constants.commons.CANBINET_NAME_FILLER_BF6;
                    FillName2 = Constants.commons.CANBINET_NAME_FILLER_BF6;
                }
            } else {
            	if (Constants.commons.CANBINET_TYPE_UPPER.equals(type)) {
                    FillName1 =Constants.commons.CANBINET_NAME_FILLER_WF06;
                    FillName2 =Constants.commons.CANBINET_NAME_FILLER_WF06;
                    FillName3 =Constants.commons.CANBINET_NAME_FILLER_WF03;
                } else {
                    FillName1 = Constants.commons.CANBINET_NAME_FILLER_BF6;
                    FillName2 = Constants.commons.CANBINET_NAME_FILLER_BF6;
                    FillName3 = Constants.commons.CANBINET_NAME_FILLER_BF3;
                }
            }

        
        	 if ("corner".equals(rightObject)) {
        		// width = 6''
            	 Cabinet cabinet1 = new Cabinet(height,0f,FillName1,
                         6f ,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                         type, startPosition, cabinetDepth, rotation,leftObject,"");
                 cabinetList.add(cabinet1);
                 
                 
                 if (FillName3 == null) {
                	 Cabinet cabinet2 = new Cabinet(height,0f,FillName2,
                             width-6f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                             type, startPosition+6, cabinetDepth, "", rotation,"",rightObject, true);
                     cabinetList.add(cabinet2);
                 } else {
                	 Cabinet cabinet2 = new Cabinet(height,0f,FillName2,
                              6f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                             type, startPosition+6, cabinetDepth, "", rotation,"","", true);
                     cabinetList.add(cabinet2);
                	 Cabinet cabinet3 = new Cabinet(height,0f,FillName3,
                             width-12f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                             type, startPosition+12, cabinetDepth, "", rotation,"",rightObject, true);
                     cabinetList.add(cabinet3);
                 }
        	 } else if ("corner".equals(leftObject))  {
        		// width = 6''
            	 Cabinet cabinet1 = new Cabinet(height,0f,FillName1,
                         6f ,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                         type, startPosition, cabinetDepth,"", rotation,leftObject,"", true);
                 cabinetList.add(cabinet1);
                 if (FillName3 == null) {
	                 Cabinet cabinet2 = new Cabinet(height,0f,FillName2,
	                         width-6f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
	                         type, startPosition+6, cabinetDepth, rotation,"",rightObject);
	                 cabinetList.add(cabinet2);
                 } else {
                	 Cabinet cabinet2 = new Cabinet(height,0f,FillName2,
	                         6f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
	                         type, startPosition+6, cabinetDepth, rotation,"","");
                	 Cabinet cabinet3 = new Cabinet(height,0f,FillName3,
	                         width-12f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
	                         type, startPosition+12, cabinetDepth, rotation,"","");
                     cabinetList.add(cabinet3);
                 }
        	 } else {
        		// width = 6''
            	 Cabinet cabinet1 = new Cabinet(height,0f,FillName1,
                         6f ,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                         type, startPosition, cabinetDepth, rotation,leftObject,"");
                 cabinetList.add(cabinet1);
                 if (FillName3 == null) {
	                 Cabinet cabinet2 = new Cabinet(height,0f,FillName2,
	                         width-6f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
	                         type, startPosition+6, cabinetDepth, rotation,"",rightObject);
	                 cabinetList.add(cabinet2);
                 } else {
                	 Cabinet cabinet2 = new Cabinet(height,0f,FillName2,
	                         6f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
	                         type, startPosition+6, cabinetDepth, rotation,"","");
	                 cabinetList.add(cabinet2);
	                 Cabinet cabinet3 = new Cabinet(height,0f,FillName3,
	                         width-12f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
	                         type, startPosition+12, cabinetDepth, rotation,"",rightObject);
	                 cabinetList.add(cabinet3);
                 }
        	 } 
        	
             
             return cabinetList;
        } else {
        	// width >= 9 根据rules选择
        	String fileNameT = "";
        	if (Constants.commons.CANBINET_TYPE_UPPER.equals(type)) {
        		fileNameT =Constants.commons.CANBINET_NAME_FILLER_WF03;
            } else {
            	fileNameT = Constants.commons.CANBINET_NAME_FILLER_BF3;
            }
        	
        	if (width >= cabnetMinWidth + 6) {  // 3+3
        		if ("wall".equals(leftObject) && "wall".equals(rightObject) ) {
        			Cabinet cabinet2 = new Cabinet(height,0f,fileNameT,
	                        3f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
	                        type, startPosition, cabinetDepth, "", rotation,"wall","", true);
	                cabinetList.add(cabinet2);
	                
	                Cabinet cabinetT = new Cabinet(height,0f,fileNameT,
	                        3f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
	                         type, startPosition+width-3f , cabinetDepth, "", rotation,"","wall", true);
	                 cabinetList.add(cabinetT);    
	                 width = width -6f;
		             startPosition = startPosition +3f;
		             rightObject = "";
		             leftObject = "";
		             leftNew="";
		             rightNew = "";
        		} else if ("wall".equals(leftObject) ) {
	    			Cabinet cabinet2 = new Cabinet(height,0f,fileNameT,
	                        3f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
	                        type, startPosition, cabinetDepth, "", rotation,"wall","", true);
	                cabinetList.add(cabinet2);
	                width = width -3f;
	                startPosition = startPosition +3f;
	                leftObject = "";
	                leftNew="";
	    		} else if ("wall".equals(rightObject)) {
	    			Cabinet cabinet2 = new Cabinet(height,0f,fileNameT,
	                        3f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
	                         type, startPosition+width-3f , cabinetDepth, "", rotation,"","wall", true);
	                 cabinetList.add(cabinet2);
	                 width = width -3f;
	                 rightObject = "";
	                 rightNew = "";
	    		}  else if (leftObject != null && "endwall".equals(leftObject)) {
	    			
                		// 放置pnb/SP
                		if ("lower".equals(type)) {
                			Cabinet cabinet1 = new Cabinet(height, 0f, cabinetAdjustName,
                    				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjust,
                                    type, startPosition , cabinetDepth, rotation, leftObject,"");
                    		cabinetList.add(cabinet1);
                		} else {
                			Cabinet cabinet1 = new Cabinet(height, 0f, cabinetAdjustNameW,
                    				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjustW,
                                    type, startPosition, cabinetDepth, rotation, leftObject, "");
                    		cabinetList.add(cabinet1);
                		}
                		width = width - padCabinetWidth;
    	                startPosition = startPosition +padCabinetWidth;
    	                leftObject = "";
    	                leftNew="";
         	
                	
                }	
        	} else if (width < cabnetMinWidth + 3) {
        		if ("wall".equals(leftObject) || ("wall".equals(rightObject))) {
        			return null;
        		} 
        		if (width >= padCabinetWidth  + cabnetMinWidth) { // 
	    				if (leftObject != null && "endwall".equals(leftObject)) {
	             		// 放置pnb/SP
	             		if ("lower".equals(type)) {
	             			Cabinet cabinet1 = new Cabinet(height, 0f, cabinetAdjustName,
	                 				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjust,
	                                 type, startPosition , cabinetDepth, rotation, leftObject,"");
	                 		cabinetList.add(cabinet1);
	             		} else {
	             			Cabinet cabinet1 = new Cabinet(height, 0f, cabinetAdjustNameW,
	                 				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjustW,
	                                 type, startPosition, cabinetDepth, rotation, leftObject, "");
	                 		cabinetList.add(cabinet1);
	             		}
	             		width = width -padCabinetWidth;
	 	                startPosition = startPosition +padCabinetWidth;
	 	                leftObject = "";
	 	                leftNew="";
	             	}  
        		} else {
        			// 问题
        			
        		}
        	} else if (width < cabnetMinWidth + 6 && width >= cabnetMinWidth + 3) {
        		// 
        		if ("wall".equals(leftObject) && "wall".equals(rightObject) ) {
        			return null;
        		} else if ("wall".equals(leftObject) ) {
        			Cabinet cabinet2 = new Cabinet(height,0f,fileNameT,
                            3f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                            type, startPosition, cabinetDepth, "", rotation,"wall","", true);
                    cabinetList.add(cabinet2);
                    width = width -3f;
                    startPosition = startPosition +3f;
                    leftObject = "";
                    leftNew="";
        		} else if ("wall".equals(rightObject)) {
        			Cabinet cabinet2 = new Cabinet(height,0f,fileNameT,
                            3f,0,kitchenId, wallId, Constants.commons.CANBINET_NAME_FILLER,
                             type, startPosition+width-3f , cabinetDepth, "", rotation,"","wall", true);
                     cabinetList.add(cabinet2);
                     width = width -3f;
                     rightObject = "";
                     rightNew = "";

    			 }
        		else if (leftObject != null && "endwall".equals(leftObject)) {
            		// 放置pnb/SP
            		if ("lower".equals(type)) {
            			Cabinet cabinet1 = new Cabinet(height, 0f, cabinetAdjustName,
                				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjust,
                                type, startPosition , cabinetDepth, rotation, leftObject,"");
                		cabinetList.add(cabinet1);
            		} else {
            			Cabinet cabinet1 = new Cabinet(height, 0f, cabinetAdjustNameW,
                				padCabinetWidth, 0, kitchenId, wallId, cabinetAdjustW,
                                type, startPosition, cabinetDepth, rotation, leftObject, "");
                		cabinetList.add(cabinet1);
            		}
            		width = width -padCabinetWidth;
	                startPosition = startPosition +padCabinetWidth;
	                leftObject = "";
	                leftNew="";
            	}  
        	
        	} else {
        		// 
        	}
        }

        Collections.sort(cabinetsruleList, new Comparator<Cabinetsrule>() {
            @Override
            public int compare(Cabinetsrule r1, Cabinetsrule r2) {
                int spaceWidthComparison = Float.compare(r2.getSpaceWidth(), r1.getSpaceWidth());
                if (spaceWidthComparison!= 0) {
                    return spaceWidthComparison;
                }
                return Integer.compare(r1.getPriority(), r2.getPriority());
            }
        });
        final float spaceWdith = width;
        final float depthCab = cabinetDepth;
//        Optional<Cabinetsrule> firstMatchingRule = cabinetsruleList.stream()
//                .filter(rule -> spaceWdith >= rule.getSpaceWidth())
//                .filter(rule -> depthCab >= rule.getDepthCab())
//                .findFirst();
        Optional<Cabinetsrule> firstMatchingRule = null;
        if (Constants.commons.CANBINET_TYPE_UPPER.equals(type)) {
	        firstMatchingRule = cabinetsruleList.stream()
	        	    .filter(rule -> rule.getDepthCab() == depthCab)                    // 1. depth 必须相等
	        	    .filter(rule -> spaceWdith >= rule.getSpaceWidth())                 // 2. 目标宽度 > 规则宽度
	        	    .filter(rule -> height == rule.getHeightCab1())  
	        	    .min(Comparator.comparing(rule -> 
	        	            spaceWdith - rule.getSpaceWidth()                         // 3. 差值越小越接近
	        	    ));
        } else {
        	 firstMatchingRule = cabinetsruleList.stream()
 	        	    .filter(rule -> rule.getDepthCab() == depthCab)                    // 1. depth 必须相等
 	        	    .filter(rule -> spaceWdith >= rule.getSpaceWidth())                 // 2. 目标宽度 > 规则宽度
 	        	    .min(Comparator.comparing(rule -> 
 	        	            spaceWdith - rule.getSpaceWidth()                         // 3. 差值越小越接近
 	        	    ));
        }
        if (firstMatchingRule.isPresent()) {
            Cabinetsrule rule = firstMatchingRule.get();
            System.out.println("rule:" + rule);
            float startConfirm2 = 0;
            String rightT = rightObject;
            if (rule.getReturnCab1() != null) {
                float startConfirm = 0;
                float remainWidth = width - rule.getWidthCab1();
                if (rule.getWidthCab2() > 0 ) {
                	rightT = null;
                } else if (remainWidth > 0f) {
                	if (("window".equals(rightObject) || "door".equals(rightObject)) && remainWidth< 9) {
                		rightT = rightObject;
                	} else {
                		rightT = null;     
                	}
                	           	
                } else {
                	rightT = rightObject;
                }
                        startConfirm = startPosition;
                        leftNew = null;
                        startConfirm2 = startPosition + rule.getWidthCab1();
                        String cabinetType = rule.getReturnCab1().split("\\d", 2)[0];
                        String cabReturn1 = rule.getReturnCab1();
                        String cabinetName = "";
                        if (cabReturn1 == null) { // 检查 null
                            cabinetName = ""; // 或者根据需求设置默认值
                        } else if ("lower".equals(flag)) { // 假设 flag 是 String 类型且已定义
                            cabinetName = cabReturn1;
                           
                        } else {
                            cabinetName = cabReturn1.length() >= 3 ? cabReturn1.substring(0, 3) : cabReturn1;
                            cabinetName = new StringBuilder(cabinetName).append(String.format("%.0f", height)).toString(); // 使用 StringBuilder
                        }
                        
                        Cabinet cabinet1 = new Cabinet(height,0f, cabinetName,
                                rule.getWidthCab1(),0,kitchenId, wallId,cabinetType,
                                type, startConfirm , cabinetDepth, rotation, leftObject,rightT);
                        cabinetList.add(cabinet1);
//                    }

//                }

            }
            if (rule.getWidthCab2() > 0 ) {
                float startConfirm = 0;
                startConfirm = startPosition+rule.getWidthCab1();
                startConfirm2 =  startPosition+rule.getWidthCab1() +rule.getWidthCab2();
                String rightT2= rightObject;
                float remainWidth = width - rule.getWidthCab1()-rule.getWidthCab2();
                if (remainWidth ==0 ) {
                	rightT2 = rightObject;
                } 
//                if ("wall".equals(rightObject)&& ("window".equals(leftObject) || "door".equals(leftObject))) {
//                    //从右边开始放置柜子
//                    startConfirm = startPosition+ width - rule.getWidthCab1() - rule.getWidthCab2()-3f;
//                    startConfirm2 = startPosition;
//                } else {
//                    if ("wall".equals(leftObject) && ("window".equals(rightObject) || "door".equals(rightObject))) {
//                        //从左边开始放置柜子
//                        startConfirm = startPosition+rule.getWidthCab1()+3f;
//                        startConfirm2 = startPosition+rule.getWidthCab1() +rule.getWidthCab2()+3f;
//                    } else {
                        startConfirm = startPosition+rule.getWidthCab1();
                        startConfirm2 =  startPosition+rule.getWidthCab1() +rule.getWidthCab2();
//                    }
//                }
                String cabinetType = rule.getReturnCab2().split("\\d", 2)[0];
                String cabReturn2 = rule.getReturnCab2();
                String cabinetName2 = "";
                if (cabReturn2 == null) { // 检查 null
                	cabinetName2 = ""; // 或者根据需求设置默认值
                } else if ("lower".equals(flag)) { // 假设 flag 是 String 类型且已定义
                	cabinetName2 = cabReturn2;
                	
                } else {
                	cabinetName2 = cabReturn2.length() >= 3 ? cabReturn2.substring(0, 3) : cabReturn2;
                	cabinetName2 = new StringBuilder(cabinetName2).append(String.format("%.0f", height)).toString(); // 使用 StringBuilder
                }
                float remainWidthT = width - rule.getWidthCab1()-rule.getWidthCab2();
                if (remainWidthT > 0 && !"window".equals(rightObject) && !("door".equals(rightObject))) {
                	Cabinet cabinet2 = new Cabinet(height,0f, cabinetName2,
                            rule.getWidthCab2(),0,kitchenId, wallId,cabinetType,
                            type, startConfirm, cabinetDepth , rotation,"","");
                    cabinetList.add(cabinet2);
                } else {
                	Cabinet cabinet2 = new Cabinet(height,0f, cabinetName2,
                            rule.getWidthCab2(),0,kitchenId, wallId,cabinetType,
                            type, startConfirm, cabinetDepth , rotation,"",rightT2);
                    cabinetList.add(cabinet2);
                }
                
            }
            float remainWidth = width - rule.getWidthCab1()-rule.getWidthCab2();
            if (remainWidth >0) {
            	
                List<Cabinet> cabinetListRemain = getCabinetFromRule(flag, remainWidth, height, cabinetsruleList, kitchenId, wallId,
                        startConfirm2, type, leftNew, rightNew, rotation, cabinetDepth, cabnetMinWidth);
                cabinetList.addAll(cabinetListRemain);
            }
        } else {
            System.out.println("No rule found with space width greater than or equal to " + width);
        }
        return cabinetList;
    }

    public List<Cabinet> getCabinetFromRuleIsland(String islandType, Cabinet cabinet, List<Cabinetsrule> cabinetsruleList, 
    		List<Cabinet> innerCabinetList, String construction, float cabnetMinWidth, Integer peninisulaFlag) {
        String FillName = null;
        if (cabinet == null) return null;
        float width = cabinet.getWidth();
        if (width == 0) return null;
        Integer kitchenId =  cabinet.getKitchenId();
        Integer wallId = cabinet.getWallid();
        float startPosition = cabinet.getStartposition();
        float rotation = cabinet.getRotation();
        String type = cabinet.getType();
        String leftObject = cabinet.getLeftobject();
        String rightObject = cabinet.getRightobject();
        if (width <=0) { return null;}
        float padAdjustWidth = 0;
        String padName = null;
        float startPositionAdjust = 0;
        float padPNBWidth = 0;
        String WFName ="";
        float startAdjust = startPosition;      
        
        if (width <cabnetMinWidth ){
        	return null;        	
        }
        List<Cabinet> cabinetListR = new ArrayList<>();
        // prepare
        List<Cabinet> result = innerCabinetList.stream()
        	    .filter(cabinetR -> Objects.equals(cabinetR.getWallid(), wallId) && 
        	    		!"SP".equals(cabinetR.getCabinettype()) && !"PNB".equals(cabinetR.getCabinettype()) )
        	    .collect(Collectors.toList());     

        float startInnerCabinet = (float) innerCabinetList.stream()
        	    .filter(c -> c != null && Objects.equals(c.getWallid(), wallId))
        	    .mapToDouble(c -> c.getStartposition())
        	    .min()
        	    .orElse(0.0);
        
        float maWidthInnerCabinet = (float) innerCabinetList.stream()
        	    .filter(c -> c != null && Objects.equals(c.getWallid(), wallId))
        	    .mapToDouble(c -> c.getStartposition() + c.getWidth())
        	    .max()
        	    .orElse(0.0);
        if (Constants.commons.ISLAND_TYPE_ISLAND.equals(islandType )) {
        	if (startAdjust != startInnerCabinet) {
            	startAdjust = startInnerCabinet ;
            	width = maWidthInnerCabinet - startInnerCabinet;
            }
            if (startPosition + cabinet.getWidth() != maWidthInnerCabinet) {
            	startAdjust = startInnerCabinet;
            	width = maWidthInnerCabinet- startInnerCabinet;
            }
        } else {
        	if (peninisulaFlag == 1) {
        		if (startAdjust != startInnerCabinet) {
                	startAdjust = startInnerCabinet;
                	width = maWidthInnerCabinet - startInnerCabinet;
                }
        	} else if (peninisulaFlag == 2) {
        		if (startPosition + cabinet.getWidth() != maWidthInnerCabinet) {
                	width = maWidthInnerCabinet;
                }
        	}
        }
        List<CabinetCaculate> caculateList = new ArrayList<>();
        for (int i = 0; i < result.size(); i++) {
            Cabinet c = result.get(i);
            // 如果是 BF/FILLER -> 跳过，不直接保存
            if ("BF".equals(c.getCabinettype()) || "FILLER".equals(c.getCabinettype())) {
                continue;
            }
            float widthTemp = c.getWidth();
            // CornerKey 不为空时，检查前后邻居
            if (c.getCornerKey() != null && !c.getCornerKey().isEmpty()) {
                // 前一个邻居：必须紧挨着
                if (i > 0) {
                    Cabinet prev = result.get(i - 1);
                    if (("BF".equals(prev.getCabinettype()) || "FILLER".equals(prev.getCabinettype()))
                            && Math.abs(prev.getStartposition() + prev.getWidth() - c.getStartposition()) < 1e-6) {
                    	widthTemp += prev.getWidth();
                    }
                }
                // 后一个邻居：必须紧挨着
                if (i < result.size() - 1) {
                    Cabinet next = result.get(i + 1);
                    if (("BF".equals(next.getCabinettype()) || "FILLER".equals(next.getCabinettype()))
                            && Math.abs(c.getStartposition() + c.getWidth() - next.getStartposition()) < 1e-6) {
                    	widthTemp += next.getWidth();
                        i++; // 跳过这个邻居，避免重复处理
                    }
                }
            }
            caculateList.add(new CabinetCaculate(
                    c.getName(),
                    c.getStartposition(),
                    widthTemp
            ));
        }
        		
        CabinetRange islandRanges = new CabinetRange(startAdjust, width);
        List<CabinetRange> rangesList = new ArrayList() ;
        rangesList.add(islandRanges);
        List<Cabinetsrule> rulesFilter = cabinetsruleList.stream()
        	    .filter(rule -> 
        	        rule.getConstruction() != null 
        	        && construction != null
        	        && rule.getConstruction().length() >= 3
        	        && construction.length() >= 3
        	        && (rule.getHeightCab1() == null || 
        	            Math.round(cabinet.getHeight()) == Math.round(rule.getHeightCab1()))
        	        && construction.substring(0, 3).equals(rule.getConstruction().substring(0, 3))
        	        && Math.round(cabinet.getDepth()) == Math.round(rule.getDepthCab())
        	    )
        	    .collect(Collectors.toList());
        List<CandidateCabinet> candidate = rulesFilter.stream()
        	    .flatMap(r -> Stream.of(
        	            new CandidateCabinet(r.getReturnCab1(), r.getWidthCab1()),
        	            r.getWidthCab2() > 0 ? new CandidateCabinet(r.getReturnCab2(), r.getWidthCab2()) : null
        	    ))
        	    .filter(Objects::nonNull) // 过滤掉 null
        	    .collect(Collectors.toList());
        // arrange
        List<CabinetCaculate> resultArrangePre = arrangeUpperCabinets(caculateList, rangesList, candidate);        
        List<CabinetCaculate> resultArrange = adjustArrange(resultArrangePre, cabinetsruleList, cabnetMinWidth);        // result  
        int resSize = resultArrange.size();
        
        for (int i = 0; i < resultArrange.size(); i++) {
        	CabinetCaculate res = resultArrange.get(i);
        	if ("tbd".equals(res.getName())) {
        		List<Cabinet> listC = getCabinetFromRule("lower", res.getWidth(), cabinet.getHeight(), cabinetsruleList, kitchenId,  wallId,  
        				res.getStartPosition(), type, "","", rotation, cabinet.getDepth(), cabnetMinWidth);
        		if (listC==null || listC.size()==0) {
        			
        		}
        		cabinetListR.addAll(listC);
        	} else {
    			String cType = res.getName().split("\\d", 2)[0];
        		Cabinet cabT = new Cabinet(cabinet.getHeight(), 0f, res.getName(), res.getWidth(), cabinet.getCeilingHeight(), kitchenId, wallId,
        				cType, "islandouter", res.getStartPosition(), cabinet.getDepth() ,rotation, "","");
        		cabinetListR.add(cabT);        		
        	}         	
        }        
        if (cabinetListR==null) {
        	return null;
        } else {
        	return cabinetListR;
        }
    }

}
