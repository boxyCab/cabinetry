/**
 * 
 */
package com.boxy.cabinet_design.entity;

/**
 * 
 */
public interface ObjectsWindowDoor {

	Wall getWall();
    void setWall(Wall wall);

    Float getWidth();
    void setWidth(Float width);

    Float getHeight();

    void setHeight(Float height);

    Float getStartposition() ;
    void setStartposition(Float position);

    boolean getAdjustotherwall();
	void setAdjustotherwall(boolean adjustotherwall);


}