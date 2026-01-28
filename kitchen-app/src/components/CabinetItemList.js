// src/components/CabinetItemList.js
import * as React from 'react';
import  { useCallback  } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Box, Button, Dialog, DialogTitle, DialogActions, DialogContent, Checkbox , TextField } from '@mui/material';
import { selectKitchenId, } from './../store'; // 导入 selector
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import fetchItemList  from '../api/fetchItemList';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { DoDisturb } from '@mui/icons-material';
const CabinetItemList = ({open,  onClose, onReturnValue }) => {
   // 使用 useRef 来管理 TextField 的焦点
   const inputRefs = React.useRef({});
  // 当前正在编辑的行和列信息
  const [focusedCell, setFocusedCellState] = React.useState({ rowId: null, fieldName: null });
  const kitchenId = useSelector(selectKitchenId);

   // 使用 useCallback 缓存 setFocusedCell
   const setFocusedCell = useCallback((cell) => {
    setFocusedCellState(cell);
  }, []); // 空依赖数组意味着 setFocusedCell 只会在组件初次渲染时创建一次

  // const iniRows = [
  //   createRow(1, 'B27', 1,'BC1001', 747.50, 747.50),
  //   createRow(2, 'SB36', 1, 'BC1001',621.05, 621.05),
  //   createRow(3, 'TB15', 1,'BC1001', 935.75, 393.75),
  // ];
 
  const [rows, setRows] = React.useState();  // 初始数据
  // 被选中的行的ID
  const [selectedRows, setSelectedRows] = React.useState([]);

  const [editModeFlag, setEditModeFlag] = React.useState(false);

  // 编辑模式状态
  const [editMode, setEditMode] = React.useState(false);
  // 编辑后的数据
  const [editedRows, setEditedRows] = React.useState([]);
  // 是否添加了新的行
  const [addNewRow, setAddNewRow] = React.useState(false);
  // 切换编辑模式
  const handleEditClick = (event) => {
    if (event.target.checked) {
      setEditMode(true);
      setEditedRows([...rows]);  // 初始化编辑行数据
    } else {
      // To 需要一个提示，修改内容需要保存
      setEditMode(false);
      setAddNewRow(false);  // 清空新行状态
    }
  };

  // 处理Checkbox的改变
  const handleCheckboxChange = (e, id) => {
    if (e.target.checked) {
      setSelectedRows((prev) => [...prev, id]);  // 添加选中行
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));  // 移除未选中行
    }
  };

  // 处理输入框数据更改
  const handleInputChange = (e, id, fname) => {
    console.log("handleInputChange");
    const { name, value } = e.target;
    setEditedRows((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          // 使用更新后的值计算 sum
          const updatedRow = { ...row, [name]: value };
          const updatedPrice = name === 'price' ? value : updatedRow.price;
          const updatedQty = name === 'qty' ? value : updatedRow.qty;
  
          // 更新 row 数据和 sum 值
          return {
            ...updatedRow,
            sum: (parseFloat(updatedPrice) || 0) * (parseFloat(updatedQty) || 0),
          };
        }
        return row;
      })
    );
  // const { name, value } = e.target;

  // setEditedRows((prev) =>
  //   prev.map((row) => {
  //     if (row.id === id) {
  //       const updatedRow = { ...row, [name]: value };
  //       const updatedPrice = name === 'price' ? parseFloat(value) : parseFloat(updatedRow.price);
  //       const updatedQty = name === 'qty' ? parseFloat(value) : parseFloat(updatedRow.qty);

  //       return {
  //         ...updatedRow,
  //         sum: (updatedPrice || 0) * (updatedQty || 0),
  //       };
  //     }
  //     return row;
  //   })
  // );
     // 更新 focusedCell
    //setFocusedCell({ rowId: id, fieldName: fname });
    // 使用 ref 重新聚焦到当前输入框
    if (inputRefs.current[`${id}-${fname}`]) {
      inputRefs.current[`${id}-${fname}`].focus();
    }
  };

  // 保存编辑后的数据
  const handleSaveRow = () => {
    const updatedRows = rows.map((row) => {
      const editedRow = editedRows.find((edited) => edited.id === row.id);
      return editedRow ? editedRow : row;
    });

    // 如果存在新的行，追加到表格数据中
    const newRows = addNewRow
      ? [...updatedRows, editedRows.find((row) => !rows.some((r) => r.id === row.id))]
      : updatedRows;

    setRows(newRows);  // 保存修改的数据到表格行数据
    setEditMode(false);    // 退出编辑模式
    setSelectedRows([]);   // 清空选中行
    setAddNewRow(false);   // 清空新行状态

   
  };


  const handleExport = async () => {
    try {
      // 根据当前环境创建基础 URL
      const baseURL = window.location.hostname === 'localhost' 
      ? 'http://localhost' 
      : `http://${window.location.hostname}`;
      // 发送 GET 请求下载 Excel 文件
      const response = await axios.post(`${baseURL}/api/exportItemsFile`,rows, {
        responseType: 'blob',  // 以 blob 形式接收文件
      });

      // 创建一个 URL 对象来表示 Blob 文件
      const url = window.URL.createObjectURL(new Blob([response.data]));

      const fileName = "ItemList_" + kitchenId + ".xlsx"; //   设置下载文件的名称
      // 创建一个隐藏的链接元素
      // 创建一个链接元素
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // 设置下载文件的名称
      document.body.appendChild(link);
      link.click();  // 模拟点击以触发下载

      // 释放 URL 对象
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  const handleRegenerateClick = () => {
    loadData(kitchenId);
  };
    
 // 添加新行
 const handleAddClick = () => {
  // 生成新行的唯一ID
  const newId = Math.max(...rows.map(row => row.id)) + 1;
  const newEmptyRow = { id: newId, name: '', Manufcode: '', qty: 0, catalog: '', price: 0, sum: 0 };
  setEditedRows((prev) => [...prev, newEmptyRow]);  // 添加新行到编辑行数据
  setAddNewRow(true);   // 标记新行已添加
  setSelectedRows((prev) => [...prev, newId]);  // 自动选择新行
};
  
const prevFocusedCell = React.useRef(focusedCell);
// 映射函数，将后端的 ItemListDto 映射到前端的 rows 格式
const mapToRows = (itemListDtoList) => {
  return itemListDtoList.map((item, index) => {
      return {
          id: index + 1,  // 假设 id 是从 1 开始递增的
          name: item.name,
          manufcode: item.manufcode,
          qty: item.qty,
          catalog: item.catalog,
          price: item.price,
          sum: item.sum
      };
  });
};
const loadData = async (kitchenId) => {
  let result = await fetchItemList(kitchenId);

console.log(result);
  // 获取映射后的 rows 数据
  if (result&& !result.error) {

    const rowResult = mapToRows(result);
    setRows(rowResult);
    // setEditModeFlag(true);
    
  }

}
React.useEffect(() => {
  if (open) {
    loadData(kitchenId);
  }

if (focusedCell.rowId != null) {
  const { rowId, fieldName } = focusedCell;

  if (prevFocusedCell.current.rowId === rowId && prevFocusedCell.current.fieldName === fieldName) {
    return;
  }
  prevFocusedCell.current = focusedCell;

  // 确保 rowId 和 fieldName 存在，并且 inputRefs.current 有正确的引用
  if (rowId && fieldName && inputRefs.current?.[`${rowId}-${fieldName}`]) {
    console.log(`Focusing on ${rowId}-${fieldName}`);
    inputRefs.current[`${rowId}-${fieldName}`].focus();
  }
  
}
  
}, [kitchenId, open]);
   
  const handleFocus = (rowId, fieldName) => {
    console.log("handleFocus");
    // 只在 focusedCell 不同时才更新状态，防止重复更新导致循环
    // if (focusedCell.rowId !== id || focusedCell.fieldName !== fname) {
    //   setFocusedCell({ rowId: id, fieldName: fname });
    // }
    // 获取对应的 input 引用
  inputRefs.current[`${rowId}-${fieldName}`]?.focus();
  };
  const handleDeleteRow = () => {
    setRows((prev) => prev.filter(row => !selectedRows.includes(row.id)));
    setSelectedRows([]);   // 清空选中行
  };
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

function ccyFormat(num) {
  return `${num.toFixed(2)}`;
}

function priceRow(qty, price) {
  return qty * price;
}

function createRow(id, name, manufcode, qty, catalog, price) {
  const sum = priceRow(qty, price);
  return {id, name, manufcode, qty, catalog, price,sum };
}
function subtotal(items) {
  return items.map(({ sum }) => sum).reduce((sumT, i) => sumT + i, 0);
}
function sumTotal(qyt, price , sum) {
  sum = (Number(qyt) * Number(price)).toFixed(2);
  if (isNaN(sum)) return 0;
  // console.log("qyt:"+qyt);
  // console.log("price:"+price);
  // console.log("sumTotal:"+sum);
  return sum;
}
const dialogHandleClose = () => {
  onClose();
  onReturnValue("TBD"); 
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

  return (
    <Dialog open={open} onClose={dialogHandleClose} maxWidth="lg"  // 最大宽度为 "small"
      >
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between" // 使用 space-between 让两者分开，一左一右
      px={3} // 水平填充，适当调整
      pt={2} // 顶部填充，适当调整
    >
    <DialogTitle sx={{ p: 0 }}>Cabinet Item List</DialogTitle>

    {editModeFlag && (
    <FormControlLabel
          control={
            <Switch checked={editMode} onChange={(event) => handleEditClick(event)}// 使用 onChange
            name="gilad" size="medium" // 设置为 "medium"，后面用 sx 来调整大小
            sx={{
              transform: 'scale(1.5)', // 使用 transform 属性放大 Switch
              marginLeft: 15, // 左侧增加间距
              marginRight: 2, // 右侧增加间距
            }}/>
          }
          label="Edit Mode"
        />
      )}
        </Box>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="spanning table">
            <TableHead>
              <TableRow>
              <StyledTableCell padding="checkbox">
              <Box
                display="flex"
                justifyContent="center" // 水平居中
                alignItems="center" // 垂直居中
                sx={{ height: '100%' }} // 确保容器高度
              >
              <Checkbox
                color="primary"
                indeterminate={rows && rows.length > 0 && selectedRows.length > 0 && selectedRows.length < rows.length}
                checked={rows && rows.length > 0 && selectedRows.length === rows.length}
                onChange={(e) => {
                  if (!rows || rows.length === 0) return; // 如果 rows 为空或未定义，不执行后续操作
              
                  const allSelected = e.target.checked;
                  setSelectedRows(allSelected ? rows.map((row) => row.id) : []);
                }}
                disabled={!editMode} // 根据 isActive 控制是否禁用
                sx={{
                  bgcolor: 'white', // 设置背景色为白色
                  // borderRadius: '0%', // 将边角设置为方形
                  '&.Mui-checked': {
                    bgcolor: 'white', // 设置选中时背景色为白色
                  },
                  '&.MuiCheckbox-root:hover': {
                    bgcolor: 'white', // 鼠标悬停时不改变背景色
                  },
                }}
              />
              </Box>
                </StyledTableCell>
                <StyledTableCell># </StyledTableCell>
                <StyledTableCell align="center">Manufcode </StyledTableCell>
                <StyledTableCell align="center">Name </StyledTableCell>
                <StyledTableCell align="center">Qty.</StyledTableCell>
                <StyledTableCell align="center">Catalog</StyledTableCell>
                <StyledTableCell align="center">Price</StyledTableCell>
                <StyledTableCell align="center">Sum</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows && rows.map((row) => (
                <StyledTableRow key={row.id}>
                  <StyledTableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={selectedRows.includes(row.id)}
                        onChange={(e) => handleCheckboxChange(e, row.id)}
                        disabled={!editMode} // 根据 isActive 控制是否禁用
                        inputProps={{
                          'aria-labelledby': 1,
                        }}
                      />
                  </StyledTableCell>
                  <StyledTableCell>{row.id}</StyledTableCell>
                  {/* 判断是否为编辑模式，并且该行是否被选中 */}
                  {editMode ? (
                    <>
                  
                  <StyledTableCell>
                  <TextField
                      name="manufcode"
                      value={editedRows.find((r) => r.id === row.id)?.manufcode}
                      onChange={(e) => handleInputChange(e, row.id, 'manufcode')}
                      // onFocus={() => handleFocus(row.id, 'manufcode')} // 当获得焦点时更新 focusedCell
                      inputRef={(el) => (inputRefs.current[`${row.id}-manufcode`] = el)} // 存储具体输入框引用
                      variant="outlined"
                      size="small"
                      inputProps={{
                        // 设置文本内容居中
                        style: { textAlign: 'center' },
                      }}
                      style={{ width: '150px' }} // 设置宽度为 300 像素
                    />
                  </StyledTableCell>
                  <StyledTableCell>
                  <TextField
                      name="name"
                      value={editedRows.find((r) => r.id === row.id)?.name}
                      onChange={(e) => handleInputChange(e, row.id, 'name')}
                      // onFocus={() => handleFocus(row.id, 'manufcode')} // 当获得焦点时更新 focusedCell
                      inputRef={(el) => (inputRefs.current[`${row.id}-name`] = el)} // 存储具体输入框引用
                      variant="outlined"
                      size="small"
                      inputProps={{
                        // 设置文本内容居中
                        style: { textAlign: 'center' },
                      }}
                      style={{ width: '150px' }} // 设置宽度为 300 像素
                    />
                  </StyledTableCell>
                  <StyledTableCell align="right">
                  <TextField
                      name="qty"
                      type="number"
                      value={editedRows.find((r) => r.id === row.id)?.qty}
                      onChange={(e) => handleInputChange(e, row.id, 'qty')}
                      // onFocus={() => handleFocus(row.id, 'qty')} // 当获得焦点时更新 focusedCell
                      inputRef={(el) => (inputRefs.current[`${row.id}-qty`] = el)} // 存储具体输入框引用
                      variant="outlined"
                      size="small"
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                        style: { textAlign: 'center' },
                      }}
                      style={{ width: '150px' }} // 设置宽度为 300 像素
                      />
                    </StyledTableCell>
                  <StyledTableCell align="right">
                  <TextField
                      name="catalog"
                      value={editedRows.find((r) => r.id === row.id)?.catalog}
                      onChange={(e) => handleInputChange(e, row.id, 'catalog')}
                      // onFocus={() => handleFocus(row.id, 'catalog')} // 当获得焦点时更新 focusedCell
                      inputRef={(el) => (inputRefs.current[`${row.id}-catalog`] = el)} // 存储具体输入框引用
                      variant="outlined"
                      size="small"
                      inputProps={{
                        // 设置文本内容居中
                        style: { textAlign: 'center' },
                      }}
                      style={{ width: '150px' }} // 设置宽度为 300 像素
                    />
                   </StyledTableCell>
                  <StyledTableCell align="right">
                  <TextField
                      name="price"
                      value={editedRows.find((r) => r.id === row.id)?.price}
                      onChange={(e) => handleInputChange(e, row.id, 'price')}
                      // onFocus={() => handleFocus(row.id, 'price')} // 当获得焦点时更新 focusedCell
                      inputRef={(el) => (inputRefs.current[`${row.id}-price`] = el)} // 存储具体输入框引用
                      variant="outlined"
                      size="small"
                      inputProps={{
                        // 设置文本内容居中
                        style: { textAlign: 'center' },
                      }}
                      style={{ width: '150px' }} // 设置宽度为 300 像素
                    />
                    </StyledTableCell>
                  <StyledTableCell align="right">{/* 显示动态计算的 sum 值 */}
                    {sumTotal(editedRows.find((r) => r.id === row.id)?.qty, 
                      editedRows.find((r) => r.id === row.id)?.price,
                      editedRows.find((r) => r.id === row.id)?.sum)
                    }
                  </StyledTableCell>
                     </>
                     ) : (
                      <>

                        <StyledTableCell align="center">{row.manufcode}</StyledTableCell>
                        <StyledTableCell align="center">{row.name}</StyledTableCell>
                        <StyledTableCell align="center">{row.qty}</StyledTableCell>
                        <StyledTableCell align="center">{row.catalog}</StyledTableCell>
                        <StyledTableCell align="center">{row.price}</StyledTableCell>
                        <StyledTableCell align="center">{(row.sum)}</StyledTableCell>
                      </>
                      )}
                </StyledTableRow>
              ))}
              {/* 如果showInputRow为true，显示输入行 */}
           {/* 渲染新行输入框 */}
           {editMode && addNewRow && (
            <StyledTableRow>
              <StyledTableCell padding="checkbox"></StyledTableCell>
              <StyledTableCell>{editedRows[editedRows.length - 1].id}</StyledTableCell>
              
              <StyledTableCell>
                <TextField
                  name="manufcode"
                  value={editedRows[editedRows.length - 1].manufcode}
                  onChange={(e) => handleInputChange(e, editedRows[editedRows.length - 1].id, 'manufcode')}
                  // onFocus={() => handleFocus(editedRows[editedRows.length - 1].id, 'manufcode')} // 当获得焦点时更新 focusedCell
                  inputRef={(el) => (inputRefs.current[`${editedRows[editedRows.length - 1].id}-manufcode`] = el)} // 存储具体输入框引用
                  variant="outlined"
                  size="small"
                  inputProps={{
                    // 设置文本内容居中
                    style: { textAlign: 'center' },
                  }}
                  style={{ width: '150px' }} // 设置宽度为 300 像素
                />
              </StyledTableCell>
              <StyledTableCell>
                <TextField
                  name="name"
                  value={editedRows[editedRows.length - 1].name}
                  onChange={(e) => handleInputChange(e, editedRows[editedRows.length - 1].id, 'name')}
                  // onFocus={() => handleFocus(editedRows[editedRows.length - 1].id, 'manufcode')} // 当获得焦点时更新 focusedCell
                  inputRef={(el) => (inputRefs.current[`${editedRows[editedRows.length - 1].id}-name`] = el)} // 存储具体输入框引用
                  variant="outlined"
                  size="small"
                  inputProps={{
                    // 设置文本内容居中
                    style: { textAlign: 'center' },
                  }}
                  style={{ width: '150px' }} // 设置宽度为 300 像素
                />
              </StyledTableCell>
              <StyledTableCell>
                <TextField
                  name="qty"
                  type="number"
                  value={editedRows[editedRows.length - 1].qty}
                  onChange={(e) => handleInputChange(e, editedRows[editedRows.length - 1].id, 'qty')}
                  // onFocus={() => handleFocus(editedRows[editedRows.length - 1].id, 'qty')} // 当获得焦点时更新 focusedCell
                  inputRef={(el) => (inputRefs.current[`${editedRows[editedRows.length - 1].id}-qty`] = el)} // 存储具体输入框引用
                  
                  variant="outlined"
                  size="small"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    style: { textAlign: 'center' },
                  }}
                  style={{ width: '150px' }} // 设置宽度为 300 像素
                />
              </StyledTableCell>
              <StyledTableCell>
                <TextField
                  name="catalog"
                  value={editedRows[editedRows.length - 1].catalog}
                  onChange={(e) => handleInputChange(e, editedRows[editedRows.length - 1].id, 'catalog')}
                  // onFocus={() => handleFocus(editedRows[editedRows.length - 1].id, 'catalog')} // 当获得焦点时更新 focusedCell
                  inputRef={(el) => (inputRefs.current[`${editedRows[editedRows.length - 1].id}-catalog`] = el)} // 存储具体输入框引用
                  
                  variant="outlined"
                  size="small"
                  inputProps={{
                    // 设置文本内容居中
                    style: { textAlign: 'center' },
                  }}
                  style={{ width: '150px' }} // 设置宽度为 300 像素
                />
              </StyledTableCell>
              <StyledTableCell align="right">
                <TextField
                  name="price"
                  type="number"
                  value={editedRows[editedRows.length - 1].price}
                  onChange={(e) => handleInputChange(e, editedRows[editedRows.length - 1].id, 'price')}
                  // onFocus={() => handleFocus(editedRows[editedRows.length - 1].id, 'price')} // 当获得焦点时更新 focusedCell
                  inputRef={(el) => (inputRefs.current[`${editedRows[editedRows.length - 1].id}-price`] = el)} // 存储具体输入框引用
                  
                  variant="outlined"
                  size="small"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    style: { textAlign: 'center' },
                  }}
                  style={{ width: '150px' }}
                />
              </StyledTableCell>
              <StyledTableCell align="right">
              {/* 显示动态计算的 sum 值 */}
              {sumTotal([editedRows.length - 1].qty, [editedRows.length - 1].price, 
              editedRows[editedRows.length - 1].sum)
                    }
              </StyledTableCell>
            </StyledTableRow>
          )}
              <StyledTableRow>
                <StyledTableCell rowSpan={10} />
                <StyledTableCell colSpan={5}>Total Price</StyledTableCell>
                <StyledTableCell align="right">{ccyFormat(subtotal(editedRows))}</StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    <DialogActions>
    {editMode ? (
          <>
          
          <Button onClick={handleRegenerateClick} variant="contained" color="primary" style={{ marginRight: '8px' }}>
          Regenerate
            </Button>
            <Button onClick={handleAddClick} variant="contained" color="primary" style={{ marginRight: '8px' }}>
              Add
            </Button>
            <Button onClick={handleSaveRow} variant="contained" color="primary" style={{ marginRight: '8px' }}>
              Save
            </Button>
            <Button onClick={handleDeleteRow} variant="contained" color="primary"style={{ marginRight: '8px' }}>
            Delete
            </Button>
            <Button onClick={handleExport} variant="contained" color="primary" style={{ marginRight: '8px' }}>
            Export As a File
          </Button>
            <Button onClick={dialogHandleClose} variant="contained" color="primary" style={{ marginRight: '8px' }}>
            Close
          </Button>
          </>
        ) : (
          <>
          <Button onClick={handleExport} variant="contained" color="primary" style={{ marginRight: '8px' }}>
            Export As a File
          </Button>

          <Button onClick={dialogHandleClose} variant="contained" color="primary" style={{ marginRight: '8px' }}>
            Close
          </Button>
          </>
        )}
      
    </DialogActions>
    </Dialog>
  );
};

export default CabinetItemList;
